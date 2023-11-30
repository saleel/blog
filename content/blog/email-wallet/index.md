---
title: Building Email Wallet
date: "2023-10-02"
description: "Overview of designs and challenges when building Email Wallet."
---

### Introduction

This is an introduction to the [Email Wallet](https://github.com/zkemail/email-wallet) project - explaining what it does and how it works technically.

Email Wallet is a smart contract wallet that can be operated using emails. Essentially one can **interact with Ethereum blockchain by simply sending emails**.

Email Wallet is build on top of [ZK Email](https://github.com/zkemail/zk-email-verify). ZK Email use ZK Snarks to prove possession of an email and can selectively disclosing information contained in the email.

***Credits**: ZK Email was originally created by Aayush, Sora, and Sampriti. Email Wallet was introduced (and many of the spec below was created) by Sora. Myself, Sora, Aayush, Rasul, Wataru, Elo, Tyler worked on the development of Email Wallet with the support of [PSE](https://pse.dev/). Please check [Zk Email Org](https://github.com/zkemail) for more details.*

### ZK Email

Here is a quick overview of how ZK Email works. For more details, please refer to the [Aayush's blog](https://blog.aayushg.com/zkemail/) on the same:

- Emails are (almost always) signed by the sender's email provider using a protocol called [DKIM Signatures](https://en.wikipedia.org/wiki/DomainKeys_Identified_Mail).
- The `From Address`, `Subject` and `Body` (hashed) of the email are usually always signed. The details of the signed fields, algorithm used and the signature itself is included in the `DKIM-Signature` header of the email.
- `rsa-sha256` is the most common signature algorithm used by email providers.
- The public key used for signing is published as a DNS record of the sender's domain. The `selector` needed to query right DNS record is part of the `DKIM-Signature` header.
- **ZK Email use ZK circuit to verify the email signature using the DKIM public key** and prove necessary properties of the email, without exposing the whole email.
- Information needed to disclose can be added as public input of the circuit.
- [**ZK-Regex**](https://github.com/zkemail/zk-regex/) is used to **extract/prove specific information** from the email content using regular expressions.
- In short, you can prove you have an email "sent from an email address", "contains a particular subject", or "have a specific word in the body".
- **Smart contracts can verify the proof on-chain** by validating the DKIM public key used in circuit is same as the one stored in the on-chain [DKIMRegistry](https://github.com/zkemail/zk-email-verify/blob/43927dfcd954caba58e02e06ec96c78c386e8598/packages/contracts/DKIMRegistry.sol) for the domain.

### Email Wallet

Email Wallet use **proof of email from a user to operate the user's Ethereum account** (contract wallet). Basically, the DKIM email signature act as the signature for user's Ethereum account (instead of a private key held in Metamask for example).

DKIM signatures can be directly verified on-chain, but this would reveal the whole email content and users wont have any privacy. This is why using ZK Email is important - we can create proof of necessary information from email content without revealing user's or recipient's email address.


#### How it works

A new **account contract is deployed for each user** which holds the user's funds. The `owner` of this contract can execute any calldata on any target contract on behalf of the the account. See [Wallet.sol](https://github.com/zkemail/email-wallet/blob/7eb2a7c977133b24b191aff0311dc14027daf03f/packages/contracts/src/Wallet.sol#L51-L63)

The `owner` of the account contract is the EmailWalletCore contract by default. Core contract validates the `EmailOperation` and execute the intended "operation" on Wallet contract. See [EmailWalletCore.sol](https://github.com/zkemail/email-wallet/blob/7eb2a7c977133b24b191aff0311dc14027daf03f/packages/contracts/src/EmailWalletCore.sol)


Basically the flow works like this:
- **Users send email to a "Relayer"** server with their intend in the email subject. For Example - `Send 10 DAI to friend@gmail.com`
- The **relayer create the ZK proof of the mail** and calls the Core contract (`handleEmailOp`) with proof of email and parameters extracted from the subject.
- The **Core contract validate the proof** and ensure extracted parameters match the actual signed subject, and **execute the operation on the account contract**.

#### Features

Below are some things you could do with Email Wallet, and corresponding **examples of email subjects** user should send:

- Send ETH to email address and Ethereum addresses.
  - `Send 1 ETH to friend@domain.com`
  - `Send 2.5 ETH to 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`

- Send ERC20 to email address and Ethereum addresses.
  - `Send 1.5 DAI to friend@skiff.com`
  - `Send 21.14 DAI to 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`

- Execute any calldata on a target contract
  - `Execute 0xba7676a8.....`


Apart from the simple token transfer operations, developers can build **extensions to interact with other contracts**. For example, we have build a NFT extension for ERC721 token transfer and a Uniswap extension for swapping tokens.

- Once extensions are published, users can install them like:
  - `Install extension Uniswap`
  - and use it like `Swap 1 ETH to DAI`
  - Here the `Swap` "command" is defined by the Uniswap extension when its published (along with the name and extension contract address).

- User can also exit Email Wallet by sending email like:
  - `Exit Email Wallet. Set owner to 0xf66f...`
  - The owner (EOA) can do any operation on the account now by calling the `execute` method.

<hr />
<br />

There were many problems and technical challenges we faced when building Email Wallet, mainly to protect users privacy and to prevent Relayer from being malicious. Below are some of them:

#### Email Address Privacy
For privacy reasons, we **do not want to reveal the email address** of the users (nor the hash of email) on-chain.

So the address of account contract is derived from an **`Account Key`** which is a randomly generated value. Specifically, the `CREATE2` salt of the user's account contract is `hash(accountKey, 0)`. <ins>Relayer maintains the mapping between an email address and the account key.</ins>

Users create an email wallet by sending email to Relayer with subject like `Create Account with CODE:0xababab11` where the last part after `CODE:` is the Account Key.

#### Account nullifier

**Relayer creates an account for the user** in Core contract which deploys a account contract for the user. Relayer need to produce a <ins>proof email from the user with AccountKey containing anywhere in email headers</ins>.

To prevent relayer from creating multiple account for same email address, Relayer need to commit to user's email address and the account key.

Relayer maintain a secret value `relayerSecret` and commit  `hash(relayerSecret)` on-chain when registering as a Relayer. Relayer then provide  **EmailPointer** (`hash(email, relayerSecret)`), **AccountKeyCommitment** (`hash(email, accountKey, hash(relayerSecret))`) and a proof they are generated correctly, when registering an account.

Core contract ensure EmailPointer and AccountKeyCommitment are unique.

- **`AccountKeyCommitment` ensure that user has explicitly sent an email to relayer with Account Key** before the relayer can execute EmailOps for the user. This will prevent  emails with matching subjects send to random people for other purposes being used for EmailOps.
- **`EmailPointer` ensure relayer can only create one account for one email address**. This will prevent malicious relayer from using random values from multiple emails as the account key. This will also prevent user from "accidentally" creating multiple accounts with same email address (in case relayer don't check existence of email off-chain).

*We can actually remove `EmailPointer` by having the circuit check for the Account Key using a specific prefix that is less likely to be found in "other" emails. The `CODE` prefix does this already and `EmailPointer` can be removed in future versions of Email Wallet.*

#### Subject validation
Extracting the parameters from email subject is difficult to do on-chain. 

Instead, **Relayer extract the subject parameters off-chain and is passed as [EmailOp](https://github.com/zkemail/email-wallet/blob/7eb2a7c977133b24b191aff0311dc14027daf03f/packages/contracts/src/interfaces/Types.sol#L11-L32), and Core contract construct the subject from the EmailOp, and validate it against the signed subject** (which is also passed in the EmailOp). 

Note that, verifying the proof of email (which happens in `handleEmailOp`) ensure the subject was actually sent by the user.

For privacy reasons, email address (of recipient) is masked and is replaced with 0 bits when its output from the circuit.

#### Email Nullifier
To prevent relayer from using same email to create multiple EmailOps, we need to add a nullifier to each email proof.

Currently nullifier is generated in the circuit using `hash(emailSignature)`. The core **contract maintains used nullifiers**, and thus ensure each email is used only once.

#### Email expiry and transaction ordering
There are cases where an Email from user should be considered as "outdated".

- For example, user send email to Relayer A, but their server is "down" at that moment and user don't get a response. User send the same email to Relayer B which execute the transaction. Relayer A comes back online later and process the email, ending up executing the "same" transaction twice.

- Relayer execute multiple emails from the same user in different order, either by mistake (maybe due to race conditions when processing emails in parallel) or maliciously.

We can use the `timestamp` used in the DKIM signature to prevent both cases.

The core contract can prevent emails older than a limit, and a user should only email another relayer if they don't see the transaction executed by the original relayer within a limit. 
Timestamp can also be used a "nonce" to prevent the second case by allowing operations with only increasing timestamps.

However, **not all providers include the timestamp** in the DKIM signature. While this is implemented now (first case), it need to be removed and replaced with a solution that works for all providers.


#### Sending money to unregistered emails

We want users to be able to send money to an email address that don't already have an email wallet.

For this we introduce something called **Unclaimed Funds**. When a user send tokens to an email address they are transferred to the core contract and an UnclaimedFund is created for this token. `UnclaimedFunds` contains a commitment to recipient's email address (`hash(recipientAddr, rand)`). 

Once recipient creates an account, recipient's relayer can claim the unclaimed funds by providing proof that recipient's `AccountKeyCommitment` and UnclaimedFund's `EmailCommitment` are from the same email address.

`UnclaimedFunds` has an expiry of 30 days. So incase recipient do not create an account within 30 days, the sender can claim the funds back (which is automatically done by relayer).

An EmailOp can have either a ETH recipient address or a commitment to recipient's email address.

`UnclaimedFunds` can also registered externally. This allows non email wallet users to send money to an email by registering an unclaimed funds, and then sharing the `EmailCommitment` with recipient's (or any) Relayer.


#### Extensions

As mentioned above, extensions allow emails to be used for interacting with any smart contract. You can use [`email-wallet-sdk`](https://github.com/zkemail/email-wallet-sdk) to build extensions for Email Wallet.

Various matchers like `{string}`, `{recipient}`, `{uint}` are available for extension developers to define subject templates. Relayer will construct the `EmailOp` (and Core contract validate) by selecting a template (from installed extensions of user) that matches the email subject.

To prevent misuse, extensions can only `execute` on user's account contract when the target contract is non-ERC20. If extensions need to manage user funds, they should call [special method](https://github.com/zkemail/email-wallet/blob/main/packages/contracts/src/EmailWalletCore.sol#L306) on Core contract instead, which validates the requested token and amount is allowed as per email subject.

We also have a concept of `UnclaimedState` similar to `UnclaimedFund` above, where extensions can use it to store custom "state" for email wallet users. This can be used to build NFT extension (for example) where `tokenAddr + tokenId` is stored in the `UnclaimedState`.


#### Relayer Censorship
Since users need to send emails to Relayer to operate their wallet, the Relayer has the power to censor users.

To overcome this, we have a permission-less relayer network where **anyone can run a relayer and users can use any relayer they want**.

When user want to use a new relayer, they forward their original account creation email to new relayer. Since this email contain the user's account key, new relayer can "transport" their account using the proof of email from user containing account key. This way users can use any relayer by maintaining same wallet address.


#### Relayer Communication
As there are multiple relayers and users could be "registered" with different relayers, there is a problem when a user send money to an email address which is registered under a different relayer.

i.e when a user send money to an email address, an UnclaimedFund is created for them. But since the sender's relayer don't have an account for the recipient, they cannot claim the UnclaimedFund to recipient's account.

To solve this, we have a **relayer communication protocol using PSI** (Private Set Intersection). Relayer's commit a PSI point for each account on-chain when creating an account. Relayers communicate using API to check if they have an account for a particular email address without revealing the email address (using PSI).

If sender's relayer finds another relayer who has an account for the recipient (by verifying the returned PSI point on-chain), they send the randomness used in `EmailCommitment` of UnclaimedFund to the recipient's relayer. Recipient's relayer can then use this to generate proof and claim the funds to recipient's account.

If sender's Relayer cannot find any matching PSI points from any other relayer, they invite the recipient to create an account with them.

#### Relayer Incentives
Relayer pay the gas for creating account and executing EmailOps. To incentivize the Relayer to do this, we have a fee reimbursement mechanism.

Relayers can set `feeToken` and `feePerGas` value in the EmailOp (below the max value allowed in the Core contract). After each EmailOp, the Core contract reimburse the relayer with `feePerGas * gasUsed` amount of ETH equivalent in `feeToken`. 

Relayers **profit on the difference between `feePerGas` in the EmailOp and actual market gas fee**. 

Core contract is designed to do fee reimbursement even if a EmailOp execution fails (for example due to some error in an extensions). But if a transaction fails in validation phase, the relayer is not reimbursed. To prevent this, Relayer should dry-run a transaction before executing it on-chain. A transaction passing locally is expected to pass on-chain.

Relayer's pay the fee for creating/initializing new accounts (not recipients of a email transaction) though. To prevent DOS attacks, Relayers can have necessary checks - for example, create accounts only for users who have registered an UnclaimedFund with a minimum amount.


#### EIP-4337
Account Abstraction EIP-4337 was considered for Email Wallet. However it is not implemented in the current version of Email Wallet.

Email Wallet require a Relayer to generate the proof of email. A design where Relayer generate proof and call the 4337 Bundler with UserOp can help the protocol in regards to fee reimbursement (paymasters) and ensuring transactions passing in simulation also pass during execution.

While [some hacks](https://saleel.xyz/blog/zk-account-abstraction/) are required to make this work, a 4337 account can be explored in future.


#### Client side proving
Many of the above restrictions are to force Relayer to be honest and censorship resistant. If we can have the emails proven on the client side (browser), we can skip the Relayer and have the user broadcast transactions directly.

For this, a 4337 wallet could be explored, and user's browser can call a Bundler with proof of email as the `UserOp` signature. Account key can be a PIN code entered by the user and stored in the browser.

However, a client side proving will require user copy the whole email content and paste to a web app. **This is a bad UX** considering sending money is a frequent use-case and demand a simple UX that also works from mobile.

<hr />

### Conclusion

Email Wallet has the potential to onboard many new users to Ethereum. Users can interact with Ethereum without knowing anything about wallets, private keys, gas, etc. 

While there are many improvements that can be done to the protocol and the overall UX, both ZK Email and Email wallet is interesting primitives that can be used to build many other applications.
