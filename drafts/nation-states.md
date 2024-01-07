<!-- ---
title: How nation states can use Ethereum
date: "2023-12-23"
description: ""
---

In this post, we will explore how Blockchains like Ethereum can be used by nation states to solve some challenges in democracy. This is not a hype post on how blockchains can change every aspect of your life, but a practical look at what kind of applications make sense, and what are their tradeoffs.

We will first take take a look at the properties of Ethereum and ZK from a high level, and then see if these properties can be used to solve any real world problems by exploring some use cases (some new, some commonly discussed).

## Ethereum

Ethereum is a public blockchain that can run arbitrary computations using smart contracts. It has the below properties of Blockchains, but these properties also apply to applications with arbitrary logic deployed on Ethereum.

- **Global consensus**: Everyone agrees on the state of the chain (and thus the state of a smart contract).
- **Immutable**: Once a piece of data is written on-chain, it cannot be changed. i.e, no-one can change the history.
- **Permissionless**: Anyone can interact with Ethereum and deploy applications on it. It is open and accessible to everyone.
- **Censorship resistant**: No entity has control on the network and thus no one can censor you from using Ethereum.
- **Transparent**: Every action made on-chain is visible to the public, making the system transparent and auditable.
- **Neutral**: Smart contracts deployed on Ethereum works on predefined set of rules, and these rules are same for all users.

The above properties are a result of decentralized, peer-to-peer design of Ethereum. The stronger the decentralization of a blockchain, the stronger these properties are. This is why we need Ethereum for applications concerning nation states.

// Permanence? High availability

## Zero Knowledge Proofs

ZK allows you to run a computation on a some data and prove the result of the computation without revealing the data. For example, you (as a Prover) can prove to a Verifier that you know the factors of a (very large) number without revealing the factors.

ZK has properties like succinctness, soundness, completeness, and zero knowledge. We will not go into the details of these properties, but main takeaway is you are able to create proofs on statements by selectively disclosing the information you want, and anyone can verify the proof and be sure you have ran the said computation correctly (and optionally it produced the said output).

Proof generated using some ZK systems are also verifiable on Ethereum. This can add some additional properties to Etheruem apps:

- Privacy: Everything on-chain is public by default. If an application want to hide some data, it can be done using ZK.
- Scalability: Blockchains are expensive and are not suitable for large computations. ZK allows you to run large computations off-chain and only put the result on-chain after verification.

ZK also allows you to bring some real world data on-chain. For example, if you have a data that is signed by a trusted authority, you can prove this signature in a ZK circuit and bring the data on-chain by selectively revealing the data you want. 


### What kind of applications make sense?

If an application does not need most of these properties, it probably doesn't need to be put on a public blockchain. For many applications on internet, the centralized "Web 2.0" architecture is still the way to go.

For example:
  - Censorship resistance is only needed when there is an an incentive for the application to block some users. For example, there is no advantage for an e-commerce app to censor certain users, but a voting app can censor certain voters who vote against the bias of app's owner.
  - Transparency is only needed for apps where global state needs to be audited. For example, there is no need for a taxi booking app to make trip taken by every user public.

Money is the foremost application of blockchain because it needs all of these properties. Everyone should agree on the balance of each user (global consensus), no one should be able to edit someone else's balance (immutable), or prevent you from sending money (censorship resistance), etc.

As we are focusing on real world applications in the context of nation states, many use-cases we explore will need these properties, as these are also the properties that are essential for democracies to function.

Another reason for an application to use a Blockchain would be to interact with existing apps on chain - making data or assets from the application composable with other apps on-chain.

For some applications, a hybrid approach also makes sense. i.e if a specific part of the applications needs the above properties, we can put that part on-chain and rest on a centralized server.
 -->
