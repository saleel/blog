---
title: Bringing real-world identity on-chain
date: "2023-12-24"
description: "Exploring how we can bring real-world identity on-chain privately using ZK, and what are some new things we can build by doing so."
---

In this post, we will explore how we can bring the real-world identity of people on-chain, and what are some new things we can build by doing so.

## What is identity?

Identity of a person is **some information that "uniquely" identifies them**. For example, your name, date of birth, address, etc. are all your identity. 

Even other attributes that you gain over time like your education, job, etc. can be considered as part of your identity.

Practically speaking, identity can be thought of as a **set of attributes someone attests about you** - the government can attest to your name, date of birth, address, etc. and your university can attest to your education.

When you want to prove your identity to someone, you can show these attestations, and they can identify you if they **trust the attestor**.

## Why do we need real-world identity on-chain?

*We are calling this "real-world identity" to distinguish it from on-chain identity like the Ethereum address.*

Bringing real-world identity on-chain can unlock many interesting applications which we will discuss below. But fundamentally, we can achieve the following properties:

### Sybil resistance
Bringing real-world identity on-chain will allow us to build applications where **one person can do one action only once** (or as many times as allowed by the application).

For example:
- One person can vote only once.
- One person can claim an airdrop only once.

### Scoped applications
If we can bring demographic identities like nationality, city, age, etc. on-chain we can build applications that are scoped to a particular identity group. For example:

- applications where only people from a country or city can participate
- applications that are only allowed for people above 18

## How can we do this?

There are different approaches to bringing identity on-chain, each with its own trust assumptions and trade-offs.

### 1. Existing Digital IDs

The most practical way to bring identity on-chain would be by using National IDs that are issued by the government. This is only possible if the government issues **digital identities that are signed**.

That is, the issuing authority digitally signs all information on the identity using their private key and publishes the public key so anyone can verify the authenticity of the ID using the public key, even offline.

Some governments already do this - for example:
- [Aadhaar](https://en.wikipedia.org/wiki/Aadhaar) in India.
- [My Number Card](https://en.wikipedia.org/wiki/Individual_Number_Card) in Japan.
- [European Digital Identity](https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/europe-fit-digital-age/european-digital-identity_en)
- [Biometric Passports](https://en.wikipedia.org/wiki/Biometric_passport) being rolled out in many countries.

Since these IDs are digitally signed, we can **verify them on-chain essentially bringing the identity on-chain** (we will use ZK for privacy, explained below)

### 2. Explicit Attestations

We can use a system like [EAS](https://attest.sh/) where various entities can attest to the identity of a person. 

For example, the government can attest to your name, age, location, etc. and your university can attest to your education.

However, this is practically difficult as:
  - We need to convince governments, universities, etc. to issue attestations using some protocol.
  - Attestation will need to happen against an existing identity like an Ethereum address or a DID.
  - The user will need to manage private keys for their identity, and we need to handle cases where the user loses their private key.

### 3. Use existing attestations

There are already attestations on a person's identity available on the internet - like emails, websites, APIs, etc. There are techniques to bring these **Web 2.0 data on-chain**.

- [**ZK Email**](https://github.com/zkemail/) - protocol for generating proof of emails. You can create attestations based on the email you receive.
   - can be an email from the government that contains your name and DOB.
   - an email from your bank that contains your name and address.
   - an email from your university that contains your degree.
   - highly trustable as the email is signed by the issuing entity directly (using DKIM protocol) and doesn't involve any third-party attestors.
- [**TLS Notary**](https://tlsnotary.org/) - protocol for generating proof of any data on websites. Can be used to extract information from the APIs of governments, universities, etc.
- [**Reclaim Protocol**](https://www.reclaimprotocol.org/) - similar to TLS Notary, can be used to get user data from websites.

These protocols can be used to extract existing data made available on the internet by the issuers. Each of them has their trust assumptions.

### 4. Social Graphs

We can use the social graph to attest to a person's identity - i.e. the people you are connected to in real life can attest to various attributes of your identity.

Again, this is practically difficult as:
  - bootstrapping the first set of "genuine" users is difficult.
  - designing this in a fool-proof way even for proving someone is a human [is difficult](https://vitalik.eth.limo/general/2023/07/24/biometric.html), let alone other attributes like nationality, DOB, city, etc.

### 4. Hybrid approach

We can also use a hybrid approach where we use 
 - an **existing National ID for the base identity** like nationality, age and location.
 - and then use **attestations from other sources to add more attributes** like education, experience, etc.

Trustability of an attested attribute depends on the protocol used - if the attestation is **signed by the issuer directly, it is generally more trustable** than if it is verified and signed by a third party (MPC for example).

Ultimately, it is **up to the verifier (consuming app) to decide how much they trust an attestation**.

Nonetheless, this is more practical as we don't need to convince every entity to issue attestation explicitly based on some protocol - they can simply sign their data using standard protocols - or expose data somehow so it can be extracted using the protocols mentioned above.

We can **match the attributes from these attestations** like name and DOB against the ones in the user's base ID to ensure they are the same person before importing additional attributes for the person.

For cases where matching is not possible, we can import the attributes if it can be **assumed that the possessor of attestation is the owner** - for example: we can assume the government or bank will send email to the right person (when using ZK Email).


### Privacy

The biggest concern about bringing identity on-chain is privacy. We don't want to put the personal information of everyone on a public blockchain.

However, verifying the signature of the ID requires access to the data that is signed. So verifying the signature on-chain would require revealing all the personal information on-chain.

To solve this, we can use [Zero Knowledge Proofs](https://hacken.io/discover/zero-knowledge-proof/). 

### Zero Knowledge Proofs
We are not going into the details of how ZK works, but in short, it allows you to prove that you have run some computation correctly without revealing the input to the computation.

For our case, we can create a **ZK circuit that verifies the signature of digital identity** without revealing information that is signed. 

Users can then create a ZK proof of their digital ID, and the verifier (smart contract) verifying the proof is convinced that the user has an ID issued (signed) by the government without knowing any personal information in the ID.

### Selective disclosure

When creating a ZK proof, users can **selectively reveal some information** from their ID - as configured by the ZK circuit. 

This is how we can extract attributes like location and age from the ID and verify them on-chain without revealing other information.

### Solution - ZK-based identity system

Combining the hybrid approach mentioned above and ZK, we can build an app where:
  - A user can create an "account" by providing their digitally signed National ID. The app will verify the signature and save all the attributes locally.
  - Users can **add additional attestations** by providing digitally signed data from other entities - like a degree certificate signed by a university to prove they are a Computer Engineer.
  - The app will match your name (and DOB if possible) on the imported attestation with the one in your base ID to ensure you are the same person.
  - The app can **generate proof of any attributes** from the identity as required by a "consuming app".
  - Along with the proof, the app will also generate **a nullifier** - which will be the same for the user even if they generate the proof again.

The consuming app can verify the proof to **validate the "eligibility"** of the user without learning who they are and store the nullifier to **prevent the same person from doing the same "action"** more times than allowed.

### Current Projects

There are already some projects that create a ZK-based identity system using existing National IDs and Passports.

- [AnonAadhaar](https://github.com/privacy-scaling-explorations/anon-aadhaar) from [PSE](https://pse.dev) - Currently lets Aadhaar holders prove that they have a valid Aadhaar. Extraction of address, age, etc. is in progress.
- [Proof of Passport](https://github.com/zk-passport/proof-of-passport) for NFC-enabled passports.
- [MynaWallet](https://github.com/MynaWallet) for Japan.
- [Taiwan DID](https://github.com/tw-did/tw-did)

As more countries move on to digital identities or NFC-enabled IDs and passports, we can have similar solutions to onboard them. See [proof-of-citizenship](https://discord.com/channels/943612659163602974/1141757600568971304/1141759379578822707) channel in PSE discord.


## What apps can we build?

With real-world identity on-chain, **we can build novel blockchain apps that can solve real-world problems**.

Applications we can build depend on the issuer and the amount of data we can extract privately.
- Depending on the identity system, we can generate **proof of citizenship** or **proof of residency** for a country.
- If we can extract the DOB, we can generate **proof of age**.
- If we can extract the address, we can generate **proof of city**, **proof of state**, etc.
- If we have additional attestations, we can generate **proof of education**, **proof of experience**, etc.

Applications need to consider the source of the identity attributes and the trustability of the attestations.

Below are some applications we can build - they get generally more powerful as we have more attributes from the identity.

### 1. Decentralized Petition Portal

Petition portal is **a platform where citizens can create petitions addressing issues concerning them**, and other citizens can sign these petitions to show their support. The petitions with the most signatures can be taken up by the government (or opposition parties) for further action.

There are already many petition portals on the internet, that are run directly by the government (like [UK Government](https://petition.parliament.uk/) and the now discontinued one in [USA](https://en.wikipedia.org/wiki/We_the_People_(petitioning_system))) or run by private companies (like [Change.org](https://www.change.org/)).

But these platforms have problems like:
- They are centralized and the entity behind the platform can **censor users, or manipulate the results** displayed.
- Signing a petition usually only requires an email address - which can be easily spammed.
- In short, the number of signatures on a petition is not a reliable indicator of support for the petition, and thus no one values them.

#### Why do we need blockchain and identity?

A blockchain-based solution can already solve the problem of censorship and result tampering. But if we bring real-world identity on-chain as well, we can ensure:

 - a person signing the petition can **do it only once**.
 - and they **are eligible for doing so** - i.e. they are a citizen or resident, and above 18.
 - we can also have **localized petitions** where only people from a specific city can sign the petition.

#### What problem does this solve?

Signatures on a petition are a reliable indicator of what people want. 

- Governments can promise to take action on petitions that have more than X signatures.
- Opposition parties can use it as an indicator to pressure the government to look into some issues.
- Media can use it to report on issues that people care about.

#### How can we build this?

The system should allow anyone to create a petition. Petitions created can be put onto [IPFS](https://ipfs.tech/) and a smart contract can track the signatures against the IPFS hash of each petition.

When a user wants to sign a petition, they would create a ZK proof of their identity - proving they are above 18, and optionally from a particular sate - and calls the smart contract. The contract verifies the proof and increments the signature count against the petition.

To prevent one user from signing on the same petition more than once, the contract will store the nullifier generated from the proof.

### 2. Anonymous Survey Portal

This is similar to the petition portal, but instead of petitions, we have **polls where users can vote on available options**.

This can be used for:
- Government can run polls to determine the outcome of policies.
- A city mayor can create a poll to get opinions on which public projects to build or prioritize.
- Media outlets can create polls to get people's opinions on various issues.
- Exit polls.

We can also introduce things like [quadratic voting](https://vitalik.eth.limo/general/2019/12/07/quadratic.html), [vote delegation](https://participedia.net/method/177) depending on the requirements.

#### Why do we need blockchain and identity?

We often see reports from governments or media outlets with titles like "66% of people believe in X" - but there is no real way to verify such claims. The result could be based on:
- a survey from a small group with a bias towards a particular opinion.
- or just make up the numbers to match their political agenda.

Blockchain based solution allows anyone (eligible) to participate without revealing their identity and allows everyone to see the rules and verify the results.

One problem is that the vote itself is not private (identity is) - there are [some solutions](https://odyslam.com/blog/state-of-private-voting/) for this.

### 3. Funding Platform

An on-chain platform where people can pool funds towards a real-world project. The funds are released to the project when users vote on its progress.

This can be thought of as a real-world, localized, sybil-resistant version of [Gitcoin](https://www.gitcoin.co/). There are many uses for such a platform.

- **Grants / Funding a cause**
  - People can crowd-fund teams or individuals working on a cause - like climate change, anti-corruption, etc.
  - Funds are released only when people verify the progress made and attest to it.
- **Public infrastructure funding** 
  - Builders propose projects, and people within the city contribute towards projects that are most useful to them in a quadratic funding style.
  - The government releases funds from their pool based on the contributions.
  - People vote on stages of completion of the project and the funds are released accordingly to the builder.
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
- Identity also ensures only people eligible (like belong to the same city or is an expert in some field) can vote on what to fund, verify progress, etc.

### 4. Anonymous Social Media

A social media platform where users can post anonymously, but all participants are real people (no bots) from the same country (or a state or a city).

Imagine a forum or a chat app where:
- There is a section for the whole country where anyone can prove their identity and post.
- There is a section just for your city where only people from your city can post.
- The identity of the poster is not revealed, but you know that they are a real person with the required attributes.
- A user can prove they are a doctor and post a comment on a medical issue.

Such a platform can also be used for:
- Discussing local issues or whistle-blowing without revealing identity, but proving credentials.
- Calling out on violations made by powerful entities without revealing your identity. 
- Discussions on petitions from the petition portal example above.
- People from one locality can complain on their local government, water supply, electricity supply, etc privately.

#### Why do we need Blockchain and identity?

- ZK Identity allows you to post on sections you are eligible for, without revealing your identity.
- The platform is free from bots. We can restrict one person to only have one account.
- We can also restrict users from spamming - using tools like [RLN](https://github.com/Rate-Limiting-Nullifier).
- Blockchain is only needed for censorship resistance here - the smart contract only needs to verify the proof and broadcast the IPFS hash of a post (for example).
- If censorship is not a concern, the entire system can be on a server that verifies the identity proof.

### 6. Others
- **Sybil resistance**
  - Sybil resistance for existing on-chain applications like airdrops, Gitcoin etc.

- **Happiness meter** 
  - A fun app where people simply vote on how happy they are on a scale of 1-3 every day.
  - We can estimate the happiness index of the country, a city, an age group, etc. over a period of time.

- **Account Recovery**
  - Off-chain identity can be used to recover an Ethereum smart account.
  - For example, a 4337 or Safe account can have proof of real-world ID as a guardian or recovery method.


## Challenges

There are some challenges in building blockchain apps operated using ZK proof of identity.

### Frontrunning

For apps where the user takes an action (like voting) on-chain by proving attributes from their identity, frontrunning is a problem. i.e. someone else can watch the mempool, take proof generated by you, and call the smart contract with a different "action".

To prevent this, ZK circuit needs to have additional input to capture the user's "action". i.e. **every attribute that the user is committing to should be part of the proof**.

### Privacy with issuer

We discussed the need for a "nullifier" to prevent users from taking the same action multiple times.

The problem here is that the issuer of the identity (government) can de-anonymize the user from the nullifier, as the **nullifier can only be derived from some information in the identity or signature**.

To solve this, we can
- Use [**Semaphore**](https://semaphore.pse.dev/) 
  - Semaphore is a ZK-based group signaling system that allows users to prove that they are part of a group without revealing their identity.
  - In our case, users can join a Semaphore group by using their ZK proof of identity.
  - Users can then vote or take action by proving their membership in the group. In this case, the nullifier is derived from their Semaphore ID.
  - The issuer only knows you are part of the group, but not what action you took.
  - One challenge here is that the user needs to manage the private key for Semaphore ID.
- Use some new cryptography like ZK-FHE.

### Impersonation

There are cases when your ID is handed over to a third party - like your landlord, bank staff, etc. If they have access to the signature from your ID, they can impersonate you on-chain.

This can be solved if the digital ID has a **timestamp indicating when it was generated** - like in the case of Aadhaar.
- Applications can demand that the timestamp on the identity should be less than a certain value.
- Applications can overwrite the "vote" of the user with the new value if the user generates a proof with a newer timestamp.

The assumption here is that only the right user can generate a new "copy" of their digital ID.

### Revocation

What is an issuer revokes an identity that was previously issued to someone? Like when you change your citizenship or lose your residency status.

One solution would be to use the timestamp like in the previous case.

### Issuer issuing fake identities

What is the issuer of an identity issues fake identities? There is no direct way to prevent this from happening.

The only solution would be to use identity attributes from multiple sources. Ultimately it's up to the consuming app what attributes from which issuer(s) they trust.

### Changes in identity

What if a user changes their name, or corrects their DOB? Or if the user renews their passport and gets a new passport number?

The problem happens if we use the hash of "changed" values to derive the nullifier. In this case, the nullifier will be different for the same user.

However, the timestamp-based solution mentioned above can be used to ensure the user can only use the new values (and thus a new nullifier). Users can still "double spend" for a short period depending on the application.

### Privacy of ETH account
One challenge with the on-chain app is the user needs to use their ETH account to interact with the app - which might expose their identity.

However, for the above apps, we would ideally be using a Relayer that takes the proof from the user and calls the smart contract to abstract gas cost and on-chain UX from the user. The relayer can censor users, so it is important to have multiple relayers.

### ZK Proving time

The proving time of ZK circuits is usually in the order of seconds or tens of seconds. This is very slow compared to traditional Web 2.0 apps.

There are research and development happening to improve browser and mobile proving, and innovation is happening in this space very fast.


## Conclusion

Bringing real-world identity on-chain can unlock many interesting applications that can solve real-world problems, and also complement existing on-chain apps.

The ZK-based identity system can **also be used for off-chain use cases** to build privacy-preserving apps where blockchain properties are not needed.

**What we need** from governments and other institutions is to digitally sign data that contains user identity. 
