---
title: Bringing real-world identity on-chain
date: "2023-12-24"
description: ""
---

In this post, we will explore how we can bring the real-world identity of people on-chain, and what are some new things we can build by doing so.

## What is identity?

Identity of a person is **some information that "uniquely" identifies them**. For example, your name, date of birth, address, etc. are all part of your identity. 

Even other attributes that you gain over time like your education, job, etc. are part of your identity.

Practically speaking, identity can be thought of as a **set of attributes someone attests about you**. For example, the government can attest to your name, date of birth, address, etc. and your university can attest to your education.

When you want to prove your identity to someone, you can show these attestations, and they can identify you if they trust the attestor.

## Why do we need real-world identity on-chain?

*We are calling this "real-world identity" to distinguish it from on-chain identity like the Ethereum address.*

Bringing real-world identity on-chain can unlock many interesting applications which we will discuss below. But fundamentally, we can achieve the following properties:

### Sybil resistance
Bringing real-world identity on-chain will allow us to build applications where **one person can do one action only once.**

For example:
- One person can vote only once.
- One person can claim an airdrop only once.

### Scoped applications
If we can bring demographic identities like nationality, city, age, etc. on-chain we can build applications that are scoped to a particular identity group. For example:

- applications that are scoped to a city
- applications that are only allowed for people above 18

## How can we do this?

Below are some approaches to bring real-world identity on-chain:

### 1. Existing Digital IDs

The most practical way to bring identity on-chain would be by using Digital IDs that are issued by the government. This is only possible if the government issues **digital identities that are signed**.

That is, the issuing authority digitally signs all information on the identity using their private key and publishes the public key so anyone can verify the authenticity of the ID using the public key, even offline.

Some governments already do this - for example:
- [Aadhaar](https://en.wikipedia.org/wiki/Aadhaar) in India.
- [My Number Card](https://en.wikipedia.org/wiki/Individual_Number_Card) in Japan.
- [European Digital Identity](https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/europe-fit-digital-age/european-digital-identity_en)
- [Biometric Passports](https://en.wikipedia.org/wiki/Biometric_passport) being rolled out in many countries.

Since these IDs are digitally signed, we can **verify them on-chain essentially bringing the identity on-chain**.

### 2. Attestation Protocols

We can use a system like [EAS](https://attest.sh/) to have various entities attest to the identity of a person.

This is practically difficult as:
  - we need to convince governments, universities, etc. to issue attestations using some protocol.
  - attestation will need to happen against an existing identity like an Ethereum address or a DID.
  - user will need to manage private keys for their identity, and we need handle cases where the user loses their private key.

### 3. Social Graphs

We can use the social graph of a person as their identity. That is, the people they are connected to in real life attest to their identity.

Again, this is practically difficult as:
  - bootstrapping the first set of "genuine" users is difficult.
  - designing this in a fool-proof way even for identifying someone is a human [is difficult](https://vitalik.eth.limo/general/2023/07/24/biometric.html), let alone other attributes like DOB, city, etc.

### Hybrid approach

We can also use a hybrid approach where we use 
 - some existing Digital ID for the base identity like nationality, age, location
 - and then use attestations to add more attributes to the identity like education, experience, etc.

This is more practical because we don't need to convinv
singed api
zke amil


### Privacy

The biggest concern about bringing identity on-chain is privacy. We don't want to put the personal information of everyone on a public blockchain.

However, verifying the signature of the ID requires access to the data that is signed. So verifying the signature on-chain would require revealing all the personal information on-chain.

To solve this, we can use [Zero Knowledge Proofs](https://hacken.io/discover/zero-knowledge-proof/). 

### Zero Knowledge Proofs
We are not going into the details of ZK, but in short, it allows you to prove that you have run some computation correctly without revealing the input to the computation.

For our case, we can create a **ZK circuit that verifies the signature of digital identity** without revealing information that is signed. 

Users can then create a ZK proof of their digital ID, and the verifier (smart contract) verifying the proof is convinced that the user has an ID issued (signed) by the government without knowing any personal information in the ID.

### Selective disclosure

We can also have users **selectively reveal some information** from their ID when generating the proof - as required by the application. 

For example, we can have the ZK circuit extract and reveal the age or location of the user, but all other information remains hidden.

### Solution

### Current Projects

This is not just a theoretical idea. There are already some projects working on this.

- [AnonAadhaar](https://github.com/privacy-scaling-explorations/anon-aadhaar) from [PSE](https://pse.dev) - Currently lets Aadhaar holders prove that they have a valid Aadhaar. Extraction of address, age, etc. is in progress.
- [Proof of Passport](https://github.com/zk-passport/proof-of-passport) for NFC-enabled passports.
- [MynaWallet](https://github.com/MynaWallet) for Japan.
- [Taiwan DID](https://github.com/tw-did/tw-did)

As more countries move on to digital identities or NFT-enabled IDs and passports, we can have similar solution to onboard them. See [proof-of-citizenship](https://discord.com/channels/943612659163602974/1141757600568971304/1141759379578822707) channel in PSE discord.


## What apps can we build?

Once we have a system where users can prove their identity on-chain by selectively revealing some information, we can build applications that can solve many real-world issues.

### 1. Decentralized Petition Portal

Petition portal is a platform where citizens can create petitions addressing issues concerning them, and other citizens can sign these petitions to show their support. The petitions with the most signatures can be taken up by the government (or opposition parties) for further action.

There are already many petition portals on the internet, that are run directly by the government (like [UK Government](https://petition.parliament.uk/) and the now discontinued one from [US](https://en.wikipedia.org/wiki/We_the_People_(petitioning_system))) or run by private companies (like [Change.org](https://www.change.org/)).

But these platforms have problems like:
- They are centralized and the entity behind the platform can **censor users, or manipulate the results** displayed.
- Signing a petition usually only requires an email address - which can be easily spammed.
- In short, the number of signatures on a petition is not a reliable indicator of support for the petition, and thus no one values them.

#### Why do we need blockchain and identity?

A blockchain-based solution can already solve the problem of censorship and manipulation, but with identity on-chain we can ensure:

 - a person signing the petition can **do it only once**.
 - and they **are eligible for doing so** - i.e. they are a citizen or resident, and above 18 (optionally).
 - we can also have **localized petitions** where only people from a specific city can sign the petition.

#### What problem does this solve?

Signatures on a petition are a reliable indicator of what people want. 

Governments can take action on petitions with many signatures - or opposition parties or media can use it as an indicator to pressure the government to look into some issue.

#### How can we build this?

The system should allow anyone to create a petition. Petitions created can be put onto [IPFS](https://ipfs.tech/) and a smart contract can track the signatures against the IPFS hash of each petition.

When a user wants to sign a petition, they would create a ZK proof of their identity (revealing age and location if needed) and call the smart contract. The contract verifies the proof and increments the signature count against the petition.

To prevent one user from signing on the same petition more than once, we need some nullifier.

That is, when a user generates the proof, there should be a nullifier output on the circuit that should remain the same even if the user generates the proof again for the same petition. This nullifier can be stored on the smart contract to prevent the user from taking the action again.

### 2. Anonymous Survey Portal

This is similar to the petition portal, but instead of petitions, we have **polls where users can vote on available options**.

For example:
- a city mayor can create a poll to get opinions on which public projects to build or prioritize.
- media outlets can create polls to get people's opinions on various issues.

The portal can also have polls with [quadratic voting](https://vitalik.eth.limo/general/2019/12/07/quadratic.html).

#### Why do we need blockchain and identity?

We often see reports from media outlets with titles like "66% of people believe X". There is no real way to verify such claims - the media outlet can:
- run the survey to a small group with a bias towards a particular opinion.
- or just make up the numbers to match their political agenda.

A blockchain-based solution powered by real-world identity can solve these problems and is credibly neutral.


### 3. Funding Platform

An on-chain platform where people can pool funds towards a real-world project. The funds are released to the project when users vote on it.

This can be thought of as a real-world, localized, sybil-resistant version of [Gitcoin](https://www.gitcoin.co/). There are many uses for such a platform.

- **Public infrastructure funding** 
  - The government sets up a pool of funds for public infrastructure projects.
  - Builders propose projects, and people within the city contribute towards projects that are most useful to them in a quadratic funding style.
  - The government releases funds from their pool based on the contributions.
  - People vote on stages of completion of the project and the funds are released accordingly.
  - The government can offer tax waivers to people contributing to such projects.
- **Crowdfunded old age pensions**
  - A smart contract runs a campaign for a month (for example) during which people contribute.
  - During the same period, people above 60 can register themselves for the pension.
  - At the end of the campaign, the funds are distributed equally among the registered people.
- **Disaster relief** 
  - Funds can be pooled for disaster relief, and released to the affected people. 
  - Works similarly to the old age pension campaign, but instead of age, people prove they live in the affected area.
  - Users can claim an amount for damage to them, and the distribution can be proportionately based on the damage.
- **Fundraising for personal needs**
  - Users can raise funds for education, medical needs, etc. like in existing online fundraising platforms.
  - The platform randomly allocates people within the same locality as reviewers for a claim. The identity of the claimer only needs to be revealed to the reviewers.
  - The reviewers can be selected from a pool of people who have contributed through the platform.
  - The funds can be released directly to the hospital or education institute.

#### Why do we need Blockchain and identity?

- The main advantage blockchain brings to this application is transparency. The distribution of funds is visible to everyone and is based on rules that are set beforehand.
- Identity adds sybil resistance to the platform, preventing one person or group from gaming the system.

### 4. Anonymous Social Media

A social media platform where users can post anonymously, but all participants are verified to be real people and to be from the same country or locality.

Imagine a forum or a chat app where:
- there is a section for the whole country where anyone can prove their identity and post.
- there is a section just for your city where only people from your city can post.
- identity of the poster is not revealed, but you know that they are a real person from your country or city.

Such a platform can be used for:
- Discussing local issues or whistle-blowing without revealing identity, but proving credentials.
- Discussions on petitions from the petition portal example above.

#### Why do we need Blockchain and identity?

- ZK Identity allows you to post on sections you are eligible for, without revealing your identity.
- The platform is free from bots. We can restrict one person to only have one account.
- We can also restrict eligible users from spamming - using tools like [RLN](https://github.com/Rate-Limiting-Nullifier).
- Blockchain is only needed for censorship resistance here.


### 5. Review

Appointments

### 5. Others

- **Happiness meter** 
  - A fun app where people simply vote on how happy they are on a scale of 1-3 every day.
  - We can estimate the happiness index of the country, a city, an age group, etc. over a period of time.

- **Account Recovery**
  - Off-chain identity can be used to recover an Ethereum smart account.
  - For example, a 4337 or Safe account can have proof of real-world ID as a guardian or recovery method.


## Attestations


## Challenges

Even if we have digitally signed identities from the government, bringing them on-chain and building apps like the above has some challenges.

### Frontrunning

For apps where the user takes an action (like voting) on-chain by proving attributes from their identity, frontrunning is a problem. i.e. someone else can watch the mempool, take proof generated by you, and call the smart contract with a different "action".

To prevent this, ZK circuit needs to have additional input to capture the user's "action". i.e. **every attribute that the user is committing to should be part of the proof**.

### Privacy with issuer

We discussed the need for a "nullifier" to prevent users from taking the same action again in the Petition Portal example above.

The problem here is that the issuer of the identity (government) can de-anonymize the user from the nullifier, as the **nullifier can only be derived from some information in the identity or signature**.

To solve this, we can
- Use [**Semaphore**](https://semaphore.pse.dev/) 
  - Semaphore is a Z- based group signaling system that allows users to prove that they are part of a group without revealing their identity.
  - In our case, users can join a Semaphore group by proving their off-chain ID.
  - Users can then vote or take action by proving their membership in the group. In this case, the nullifier is derived from their Semaphore ID.
  - One challenge here is that the user needs to manage the private key for Semaphore ID.
- Use some new cryptography like ZK-FHE.

### Impersonation

There are cases when your ID is handed over to a third party. If this entity can view your signature from the ID, they can impersonate you on-chain.

This can be solved if the digital ID has a **timestamp indicating when it was generated** - like in the case of Aadhaar.
- Applications can demand that the timestamp on the identity should be less than a certain value.
- Applications can overwrite the vote of the user with the new value if the user generates a proof with a newer timestamp.

The assumption here is that only the right user can generate a new "copy" of their digital ID.

### Issuer issuing fake identities

## Conclusion

Atetstation as a one form of rbring id on-chain
Social graphs as oen form

Why blockchain? Why no a centralized server
Voting

What we need from governments
Other forms of identity
Off-chain usecase

ZK Identity?

Revokation
For each use-case - what do we need from the identity

why do we need this?

ID change - What to act as a nullifier

Subgroups
