---
title: ZK + Account Abstraction - Experimenting with EIP 4337 and Semaphore
date: "2023-10-02"
description: "Experiment on building EIP-4337 smart contract wallet controllable by any member in a Semaphore group."
---

<i>Special thanks to Yoav Weiss for suggesting the optimistic validation solution and other tips.</i>

## TLDR;

- Encode **ZK proof and public inputs as the `signature`** of the `UserOperation`.
- Verify the proof in the `validateUserOp` function of the wallet contract - along with passed inputs, and pre-committed on-chain inputs.
- If all on-chain public inputs are specific to a user, they could be **stored in the wallet contract** directly.
- If public inputs should be stored in external contracts (common value for all users), then it is difficult to access them in `validateUserOp` due to **[4337 storage limitations](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-4337.md#storage-associated-with-an-address)**.
- One approach is for the external contract that holds the "global public inputs" to **implement the 4337 Aggregator interface**, and use it to verify the proof of all wallets. This is ideal for inputs that **change frequently**.
- Another approach is to cache the "global public inputs" directly in every wallet contract, **validate them optimistically, and check for cache invalidation during execution**. This is ideal for groups that **seldom change**. 

<hr />

## Introduction

In this post, I am sharing an experiment I did on building [EIP 4337](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-4337.md)-compliant smart contract wallet that could be controlled by zero-knowledge proofs.

Specifically, I was building **a wallet that could be controlled by anyone in a [Semaphore](https://semaphore.pse.dev/) group** - by proving their membership in the group.

But the problems and solutions discussed below might also be helpful for others building on 4337.


#### EIP 4337
  - EIP 4337 is essentially a standard for smart contract wallets. 
  - One of the goals is to **decentralize the relayers** who take "operations" from users and create blockchain transactions that operate on the wallet contract. They are called bundlers in 4337, as they bundle many "operations" in one transaction.
  - **`UserOperation`** is the equivalent of an Ethereum transaction in the 4337 world. It contains the `calldata` to be executed on the wallet contract along with a `signature`.
  - Wallet contract need to implement a function `validateUserOp` that verifies whether a given `UserOperation` is valid or not, **mostly using the `signature` param**.
  - There is a singleton contract called `EntryPoint` which takes the bundle, validates the operations and executes them on the respective wallet contract.
  - There is also a concept of aggregation where **multiple UserOp signatures are aggregated into one signature**, and are verified together using an Aggregator contract.
  - I found [this post by Alchemy](https://www.alchemy.com/blog/account-abstraction) to be a good introduction to the EIP.


#### Semaphore Protocol
  - Semaphore is a protocol for **anonymous signaling for members of a group**.
  - Basically, you can create a group, add members to it (using their public keys) and they can **send signals (messages, votes)** by proving their membership to the group, **without revealing their identity** (public key).
  - Semaphore contract stores the merkle root of all groups. Group members produce a **ZK proof of merkle inclusion** (using their private key) to prove their membership and cast signals.
- The protocol also has a mechanism to prevent double signaling (under the same topic known "externalNullifier"). Read more [here](https://semaphore.pse.dev/docs/introduction)

## Building the Smart Contract Wallet

One obvious thing here would be to **pass the Semaphore proof as the `signature` of the `UserOperation`**. We can then decode the proof from the signature, and verify it against the latest `merkleRoot` of the group stored in the Semaphore contract.

Below is a base version of the smart contract we are going to build. There is a **`validateUserOp()` function that decodes the proof from `signature` and validates against the Semaphore contract**. There is an `execute` function which is called by the `EntryPoint` contract if the `UserOperation` passes validation.

Users can use the `execute()` function to **make calls to any external contract with any calldata**, essentially making the account contract work like an EOA. The user will need to encode call to `execute()` function along with the arguments as the `calldata` of the `UserOperation`.


```solidity

contract SemaphoreAccount {
    IEntryPoint private immutable _entryPoint;
    Semaphore public semaphore;   // Semaphore contract
    uint256 public groupId;       // `id` of the group who can control this wallet

    function initialize(address _semaphoreAddress, uint256 _groupId) public {
        groupId = _groupId;
        semaphore = Semaphore(_semaphoreAddress);
        verifier = ISemaphoreVerifier(_verifierAddress);
    }

    function _requireFromEntryPoint() internal virtual view {
        require(msg.sender == address(entryPoint()), "account: not from EntryPoint");
    }

    // Validate signature for the UserOperation
    // ZK Proof of membership and some inputs are encoded in `signature`
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) external returns (uint256 validationData) {
        _requireFromEntryPoint();

        (uint256[8] memory proof) = abi.decode(userOp.signature, (uint256[8]));
        uint256 signal = uint256(userOpHash);

       // Validate the proof with semaphore verifier

       // Pay the required funds to the entrypoint
    }


    // Execution function to call anything on the contract
    // Only triggered by EntryPoint if validation pass
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external verifyGroup {
        _requireFromEntryPoint();
        
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }
}

```

You might think that `_validateUserOp` can **simply call the Semaphore contract to validate the decoded proof**. However, this is **not very straight-forward** due to storage limitations in the EIP 4337.


### Storage Limitations of EIP 4337

Since the 4337 Bundlers are decentralized and they pay the gas for executing the bundle, the protocol has many mechanisms to prevent DOS-like attacks, one of them being storage access restrictions on `validateUserOp` method.

Specifically, **`validateUserOp` can only access the storage associated with its own contract**. "Associated storage" basically means values stored in own contract, and `mappings` in an external contract where the key is the address of the wallet contract (Read [this](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-4337.md#storage-associated-with-an-address) for the accurate definition).

This is done so that **UserOperations that pass during simulation (run by the bundler off-chain to ensure UserOps pass) will also pass during execution**. Bundlers are rewarded the fee if a `UserOperation` passes validation (even if the execution fails).

For most cases, this should be fine as the wallet only needs its knowledge, and not the world's knowledge to verify the UserOp. However, in our case, **we need to access the Semaphore contract to verify the proof**. Since the Semaphore contract is not associated with the wallet contract, **we cannot access the `merkleRoot` of the group from `validateUserOp`**.


### Solution 1: Use Aggregator to verify Semaphore proof

As mentioned earlier, there is a concept of Aggregator in the EIP 4337. The intention of this is to compress the signature of all UserOps in a bundle to a single signature and verify only once - for example, using BLS signatures.

`validateUserOp` would be returning the address of the aggregator contract here; the bundler will call `aggregateSignatures()` method on the aggregator contract off-chain to compress, and the EntryPoint call `validateSignatures` method to validate the compressed signature of all UserOps.

However, aggregators also have the same storage restrictions. But if we can have the **Semaphore contract implement the 4337 Aggregator interface**, we can use it to verify UserOps as the aggregator only needs to access its own storage (for `merkleRoot`) to verify Semaphore proofs.

In our case, we do not use aggregator contract for actual aggregation. Instead, we would be **concatenating multiple ZK proofs, and verifying them one by one** in the aggregator contract.

But if the proof system supports aggregation, then multiple ZK proofs could actually be compressed into one. But we need proof aggregation to happen in Solidity, unless it is popular enough all bundlers are willing to do it off-chain.

```solidity
// Below code might not work as is - consider it like pseudo-code

contract SemaphoreAccount is BaseAccount, UUPSUpgradeable, Initializable {
  ...

  // Bundler calls this function off-chain to aggregate individual signatures in to one
  // in our case, we simple concatenate them
  function aggregateSignatures(UserOperation[] calldata userOps) external view returns (bytes memory aggregatedSignature) {
    bytes[] memory signatures = new bytes[](userOps.length * 9 * 32); // 8 uint for proof and one for nullifierHash

    for (uint256 i = 0; i < userOps.length; i++) {
      for (uint256 j = 0; j <= 9 * 32; j++) {
        signatures[i * 9 * 32 + j] = signature[j];
      }
    }
  }

  function validateSignatures(UserOperation[] calldata userOps, bytes calldata signature) external view override {
    for (uint256 i = 0; i < userOps.length; i++) {
      UserOperation calldata userOp = userOps[i];

      // Encode proof from the right offset
      (uint256[8] memory proof, uint256 nullifierHash) = abi.decode(
        userOp.signature[i * 9 * 32 : (i + 1) * 9 * 32], 
        (uint256[8], uint256)
      );

      uint256 signal = uint256(userOpHash);

      require(verifier.verifyProof(
                getMerkleTreeRoot(groupId),
                nullifierHash,
                uint256(userOpHash), // signal
                0, // External nullifier
                proof,
                merkleTreeDepth
      ), "Invalid proof");
    }

    // One other interface method omitted for brevity
  }
}
```

The downside here is that we would need to deploy a new Semaphore contract that implements the Aggregator interface.


### Solution 2: Use optimistic validation, and re-validate in execution

In this solution, we are **storing the `merkleRoot` of the group in the wallet contract** itself. Since the value is stored in its own storage, `validateUserOp()` can use it for proof verification.

During the execution, we will **check if the stored value is still valid by calling the Semaphore contract** (note that execution function are free to access external storage). If not, **we will update the stored value and revert the current execution**.

This approach is ideal for groups that seldom change (i.e. new members are added or removed rarely). **The one transaction immediately after the group update will fail**, and there should be an appropriate mechanism to handle this - like the contract emitting a failure event and the client listening to this creating a new UserOp with an updated signature.

Below is a sample code demonstrating this:

```solidity
contract SemaphoreAccount {
  ISemaphoreVerifier verifier;
  uint256 _currentMerkleRoot;

  event MerkleRootUpdated(uint256 _currentMerkleRoot, uint256 _latestMerkleRoot);

  modifier verifyGroup() {
      uint256 latestMerkleRoot = semaphore.getMerkleTreeRoot(groupId);
      if (_currentMerkleRoot != latestMerkleRoot) {
          _currentMerkleRoot = latestMerkleRoot;

          emit MerkleRootUpdated(_currentMerkleRoot, latestMerkleRoot);
          return;
      }
      _;
  }

  function execute(address dest, uint256 value, bytes calldata func) 
  external 
  verifyGroup {
      ...
  }

}
```

### Other challenges

These are some issues that are specific to the Semaphore use case.

- The Pairing library used in Semaphore proof verification uses `gas()` method (when making static calls to precompiles for elliptic curve operations) - [like this](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/contracts/base/Pairing.sol#L108).

**`GAS` opcode is restricted in `validateUserOp`** ([along with some other OPCODES](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-4337.md#forbidden-opcodes)). `GAS` is only allowed if immediately followed by `CALL` (and similar) opcodes. Semaphore does `staticcall(sub(gas(), ...)` so there is a `SUB` in between, and this won't work.

**There is no workaround for this**. In my repo, I have copied Semaphore contracts, removed the `sub()` and used `gas()` directly.

- Semaphore verifier stores `VK_POINTS` (used for verification) [in storage](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/contracts/base/SemaphoreVerifier.sol#LL17C24-L17C33). So when `validateUserOp()` calls `Verifier.verifyProof()`, it will read this storage value, which is not allowed.

In my copy, I have moved them to be inside the `verifyProof()` function. I have also created [an issue](https://github.com/semaphore-protocol/semaphore/issues/330) in the Semaphore repo to explore **making this array a constant**.

- Semaphore smart contract doesn't have a `pure` verification method. The `verifyProof()` method in [Semaphore.sol](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/contracts/Semaphore.sol#L150C14-L150C25) also stores the nullifier. So we need to call the Verifier contract directly to do verification.

Semaphore protocol allows proof verification using previous merkleRoots up to a time limit, which is implemented in `verifyProof()` method. So we would need to reimplement all of these if calling Verifier directly.

I have created [an issue](https://github.com/semaphore-protocol/semaphore/issues/366) in Semaphore protocol to add a pure verification method.

## Conclusion

- 4337 wallets could be operated using ZK proofs by encoding proof and public inputs as the signature of `UserOp`.
- Even if some public inputs are stored in other contracts, there are solutions to use them for verification.
- **Aggregated proof verification** is possible if the ZK systems support aggregation, and the bundlers agree to aggregate the proof off-chain.
- **Idea**: Apart from wallets, ZK proofs could also be used in **4337 paymasters**. For example, there could be a Semaphore paymaster that could **pay the transaction fee for everyone in a Semaphore group**.


## Repo

**Github**: [https://github.com/saleel/semaphore-wallet](https://github.com/saleel/semaphore-wallet)

Note: It is based on the sample code provided above, but is built on top of contracts from [eth-infinitism/account-abstraction](https://github.com/eth-infinitism/account-abstraction)