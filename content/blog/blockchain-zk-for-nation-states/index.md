---
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


## Identity

For blockchain applications concerning nation states, bringing the real world identity of the user on-chain is essential. 

- One person should only have one identity on-chain. This is crucial for applications like voting, to ensure one person can only vote once.
- User should be able to prove aspects of their identity without revealing everything. For example, a user should be able to prove they are above 18 years of age, or a is a resident of a city, for applications that require this, without revealing anything else.
- 

We need attestations



    Other forms of identity 

    Voting

### Petition Portal

Petition portal is a platform where citizens can create petitions addressing issues concerning them, and other citizens can sign these petitions to show their support. The petitions with most signatures can be taken up by the government (or opposition parties) for further action.

There are already many petition portals on the internet, that are run directly by the government (like [UK Government](https://petition.parliament.uk/) and the now discontinued one from [US](https://en.wikipedia.org/wiki/We_the_People_(petitioning_system))) or run by private companies (like [Change.org](https://www.change.org/)).

There are some problems with the existing petition portal which can be solved by a blockchain based solution. 

#### Why do we need Blockchain?

Lets say we build a system where petitions created are put on IPFS and the signatures against each petition (IPFS CID of the petition) are stored on-chain.

To sign a petition user will generate a proof that they are citizen/resident of the country and are above 18 years of age, and call the smart contract with their "vote" and the ZK proof. The Petition Portal smart contract verify this proof and increment signature count against the petition.

With this system, we can solve the following problems found in traditional petition portals:

- The existing portals are centralized and the entity behind the portal can censor users, or manipulate the results displayed. A blockchain based solution can prevent this, as anyone can participate (censorship resistance) and the results are verifiable by anyone (transparency) and tamper-proof (immutable).

- Signing a petition in traditional systems usually only require an email address - which can be easily spammed. With a blockchain based solution, we can ensure that a person signing the petition is eligible for it, and each person can only sign a petition once. Thus the number of signatures can be used as a clear indicator of the support for the petition.

- With the ZK based real world identity system we discussed above, we can have petitions that are local to a state, or even a city. So only people within that jurisdiction can sign the petition. Users will generate a ZK proof that they are a resident of the city based on the address field in their ID.

### Survey Portal

This is very similar to the petition portal, but instead of petitions, users or governments can create polls and users can vote on various options. The outcome of the poll can be used to take decisions.

For example, a government can create a poll to decide on the next budget allocation, or a city mayor can create a poll to decide on the next public works project. This can also be used to collect feedback from people on various issues like the ones run by media outlets.

#### Why do we need Blockchain?

Just like the Petition Portal application we can build a system where metadata of polls are put on IPFS and the votes are stored on-chain.

- The platform is open for all eligible people, transparent and tamper-proof. Results of a poll from a blockchain based solution is reliable compared to any centralized solution.

- Polls can be also be restricted to "experts" within the respective field. A users "expertise" can be brought on-chain using attestations made on the ZK based identity system by various agencies. For example, a user can prove they are a doctor by proving an attestation from a medical university.

- The votes made by user are anonymous. Because of ZK based approach, the user can prove they are eligible to vote (or sign a petition) without revealing who they are.


### Funding Platform

An on-chain platform where people can pool funds towards a project or a cause. Funds are stored in a smart contract and can be released  based on milestones, or in a similar fashion as Gitcoin.

Users can vote on how the funds should be spent, and also verify the completion of milestones. There are many use for a such a platform:

- **Infrastructure funding** 
  - People can contribute directly to public infrastructure projects. 
  - For example, a city can build a new park if enough people contribute funds towards it. 
  - People vote on the completion of stages of a project and the funds are released to the builder accordingly.
  - Even government can allot a portion of their budget to be spent on projects that are voted by people.
- **Education funding**
  - Pools can be created for funding education for underprivileged.
  - The funds can directly be released to education institutes when an eligible student is enrolled or graduated. 
  - Eligibility of the student can be based on attestation on their ZK identity.
- **Disaster relief** 
  - Funds can be pooled for disaster relief, and released to the affected people based on their ZK based identity. 
  - For example, a person can prove they are a resident of a city (from their ID), or has a house or land in the area (from attestations made by respective government agencies), and a portion of funds can be released to them.
  - When attestations are not available, people in that or nearby locality can verify the claim of affected person, revealing claimer's identity to only the verifier(s).
- **Fundraising for personal needs**
  - Users can raise funds for their emergency medical needs (for example) like in existing online fundraising platforms.
  - The hospitals can attest to the medical bills of the patient, and the funds can be released to the hospital directly.
- Something like [Neighbourhood Investment Fund](https://www.manchester.gov.uk/info/100003/people_and_communities/202/neighbourhood_investment_funds) run by some councils in UK.

#### Why do we need Blockchain?

- The main advantage blockchain brings to this application is transparency. The funds are stored in a smart contract and the usage of funds can be tracked by anyone.
- Voting on distribution of funds can happen in a transparent way.
- In most cases the identity of the recipient doesn't need to be revealed. We only need a ZK proof that the recipient is eligible for the funds.

- A decentralized solution can be also replace popular fundraiser platform that already exists. People can coll

What is required for this to work?
Random allocation of verifiers


## Social Score

## Localized Social Media

## Police complaints, FIRs, Judicial Reports
  - Registry of complaints against a person

## Attestations

  - Education / Degree
  - Work Experience
  - Land Registry
  - Birth Certificate
  - Credit Score
  - Ticketing
  - Licensing
  - Health Records
  - 

## Review Platform

## Whisleblowing and Anonymous complaints

## Subgroups

## Happiness Meter

## Other apps - Uniform UX

## Precautions, Spam Preventions, Collutions


## Utopia : A Super App


Collussion and corruption

Dislosing identity for a disputed event

Selling votes or identity

New identity could be overwritten

ID in posession of user


Validium


ZK based voting but not on-chain