---
title: "Do You Hear the CCC?: Come, Let Us Build a Tower"
date: 2026-01-21 04:00:00
excerpt: "With 2.0.0, CCC looks like a serious project. This log will introduce the things I found interesting between 1.0.0 and 2.0.0: some may have been live for a year, others might still be in development. We have provided support for common usage scenarios and iterated based on community feedback. CCC is no longer just a novel experiment; it has gradually become a reliable foundation. Perhaps we have reached the time to build a Tower of Babel."
---

![CKB DevRel](../Do_You_Hear_The_CCC_zh-Hans/CKB_DevRel.png)

Good moon, good sun. I am Hanssen, the developer of [CCC](https://github.com/ckb-devrel/ccc).

In 2024, toolchains in Nervos were like a rotting, unfinished house, hazardous to the physical and mental health of every developer, which eventually whipped CCC into existence. CCC, which I call **C**CC is **C**KBer's **C**odebase <sub>(tell me self-referential jokes aren't outdated yet, or I'll cry)</sub>, is rooted in the most commonly used browser ecosystem. It aims to provide a one-stop solution, allowing developers to build their applications on established scaffolding, freeing them from the Avici of building applications from bottom-level concepts over and over again.

Simply put, CCC makes the ideas in a developer's head become reality faster and with higher probability; in detail, from the moment of clicking the frontend to connect a wallet, through the user selecting a wallet, handling various protocols, assembling CKB transactions <sub>(this is super troublesome)</sub>, requesting user signatures, and finally sending the transaction to the chain. CCC provides complete yet flexible, free yet concise assistance throughout the entire process.

---

I hope reading this sparks your interest in CCC, because I’m about to suddenly start pasting the changelog. You’ll need that interest to survive these things no one likes to read.

## CCC 2.0.0: Come, Let Us Build a Tower

![CCC Logo](../Do_You_Hear_The_CCC_zh-Hans/CCC_Logo.png)

The release of [1.0.0](https://github.com/ckb-devrel/ccc/commit/283d1b2b2fe7eedb1f74fb3fc99330446e39c9cf) was a boring moment. Back then, we didn't even think to name it, referring to it by a serial number like prisons or Chinese schools refer to inmates. A year has passed, and we finally welcome 2.0.0 -- which hasn't been released yet. Three months ago, I published the [`v1-final`](https://github.com/ckb-devrel/ccc/pull/309) branch, but there was always something that was just about to be finished waiting to make the cut for this moment, forcing me to resort to "fake it till you make it." I’ll write the changelog first. I can't drag this out until next year to release it, right?

Updating a major version number is a badge of shame, marking that the guy writing the code didn't think things through at the start and has to proclaim to the world, "I changed my mind! Everyone update". Despite this, I still hope the implied imagery of "something became better than before" can take us to a new beginning.

With 2.0.0, CCC looks like a serious project. This log will introduce the things I found interesting between 1.0.0 and 2.0.0: some may have been live for a year, others might still be in development. We have provided support for common usage scenarios and iterated based on community feedback. CCC is no longer just a novel experiment; it has gradually become a reliable foundation. Perhaps we have reached the time to build a Tower of Babel.

### Nostr

![Nostr](../Do_You_Hear_The_CCC_zh-Hans/Nostr.png)

Nostr is not the first signing method CCC supported, nor will it be the last. But I want to express my special fondness for it because we can gratefully ~~freeload~~ use the Nostr community's public relay servers to store and share data.

Based on this feature (**feature**), I added a "Share" button to the [CCC Playground](https://live.ckbccc.com/), a code execution environment within the browser. After you click it, the webpage automatically generates a private key, signs your code, and sends it to Nostr, allowing you to share it with our good friends via a link.

- [The core support for Nostr signing](https://github.com/ckb-devrel/ccc/tree/master/packages/core/src/signer/nostr)
- [Support for NIP 07, allows us to connect Nostr signers/wallets](https://github.com/ckb-devrel/ccc/tree/master/packages/core/src/signer/nostr)

### CCC Playground Super Evolution

![CCC Playground](../Do_You_Hear_The_CCC_zh-Hans/Playground.png)

In this year's Playground update, my favorite part is the graphical redesign for the concept of the CKB "Cell". I used the form of Bagua to display cells, using combinations of trigrams (it's binary!) to represent the different "Lock" and "Type" scripts on the cell. I also added some animation to it; although it's frivolous, maybe it makes people feel like they are doing something cool. If you are interested, you can try [this example](https://live.ckbccc.com/?src=https://raw.githubusercontent.com/ckb-devrel/ccc/refs/heads/master/packages/examples/src/transfer.ts).

The reason we can display images in the terminal is due to another new feature of the Playground: writing code directly using React's TSX syntax. This means developers can display arbitrary frontend elements, or even write a simple tool with a user interface to share with others, without worrying about troublesome issues like frameworks, dependencies, or deployment.

- [Added TSX support for the Playground](https://github.com/ckb-devrel/ccc/pull/181)
- [Bagua UI update](https://github.com/ckb-devrel/ccc/pull/323)

### Better Nervos DAO Adaptation

![Nervos DAO](../Do_You_Hear_The_CCC_zh-Hans/Nervos_DAO.png)

Finally, developers have a tool to operate the Nervos DAO. By locking the data storage capacity of CKB native tokens, one can resist inflation, a fundamental part of the Nervos ecosystem design (although the Nervos official website still doesn't introduce it. Who wants to write an article for it?).

Thanks to [@phroi](https://github.com/phroi) for providing a lot of valuable feedback for this series of improvements. The iCKB he developed, a protocol that allows Nervos DAO to be tokenized and circulated, provided many real-world usage scenarios.

- [Code examples for operating Nervos DAO](https://github.com/ckb-devrel/ccc/blob/master/packages/demo/src/app/connected/(tools)/NervosDao/page.tsx)
- [Automatically calculate the Nervos DAO profit in transactions](https://github.com/ckb-devrel/ccc/pull/171)
- [Utilities for `Epoch`](https://github.com/ckb-devrel/ccc/pull/314)

### UDT

![+15 UDT](../Do_You_Hear_The_CCC_zh-Hans/UDT.png)

The User Defined Token (UDT) series of protocols, from the sUDT core that appeared earliest and is still in use today, to the xUDT extension that almost no one has used, supports all secondary currencies issued on CKB. Its core idea is to use data in cells to represent denomination. It isn't complex, but integrating this logic into applications is quite challenging.

CCC provides an interface for operating UDTs similar to operating native CKB tokens, avoiding extra learning costs. This series of improvement suggestions also came from [@phroi](https://github.com/phroi), stemming from the solutions he summarized while writing UDT-related code for iCKB. Additionally, thanks to suggestions from [@rink1969](https://github.com/rink1969), we optimized CKB occupancy when calculating UDT change.

* [Merge UDT features from iCKB into CCC](https://github.com/ckb-devrel/ccc/issues/227)
* [Pay myself to avoid extra CKB occupation](https://github.com/ckb-devrel/ccc/issues/214)

### Type ID-like Protocols

![CCC logos with different color](../Do_You_Hear_The_CCC_zh-Hans/Type_ID.png)

Type ID leverages the characteristic that CKB cells can only be consumed once. It is used to assign a unique on-chain ID to a cell to track the updates and destruction of a cell singleton. Designed from the beginning to track the latest state of upgradable contracts, it has gradually been applied more broadly to other protocols.

CCC's new Type ID package, in addition to supporting the simplest arbitrary data Type ID, provides advanced methods to facilitate extending support for Type ID-like protocols. The [DID CKB](https://github.com/web5fans/did-ckb) support added alongside the Type ID package is a great example.

* [Added `did-ckb` package](https://github.com/ckb-devrel/ccc/pull/337)

### Multisig Lock

![Seele from EVA](../Do_You_Hear_The_CCC_zh-Hans/Multisig.png)

Another support for an early CKB feature. Although the multisig lock only supports the Secp256k1 algorithm, it is still frequently used in scenarios like contracts or fund management. Previously, developers mostly used the command-line tool [`ckb-cli`](https://github.com/nervosnetwork/ckb-cli) to handle multisig transactions. I hope things will get better after adding support in CCC.

CCC's support includes two modes: sequential signing and merging transactions after multiple signatures.

* [Multisig `Signer`](https://github.com/ckb-devrel/ccc/pull/349)

### `FeePayer` Abstraction Layer

Thanks to the characteristics of the UTXO model, all parties in a transaction can pay the transaction fee. This makes calculating fees exceptionally difficult. Past SDKs would assume there is a specific native address that adds more tokens to be responsible for paying fees, but this cannot satisfy features like the zero-fee feature in the Spore protocol or [the UDT instant convert](https://talk.nervos.org/t/udt-payment-solutions/8956) (how many people know about this interesting thing?) that we want to introduce.

`FeePayer` hopes to abstract fee payment into a separate step, providing a unified interface for more fee payment methods. Once developers utilize these interesting features, users may no longer need to hold extra CKB to initiate transactions, but instead pay fees through pre-deposited assets or on-the-spot micro-exchanges.

* [Introduce `FeePayer` concept for flexible transaction fee handling](https://github.com/ckb-devrel/ccc/issues/274)

### Anything More?

Honestly, I don't know what CCC will look like in the future. We have some things in progress, like [the support for RGB++](https://github.com/ckb-devrel/ccc/pull/332), support for the Fiber Network, or the implementation of [the Script-Sourced Rich Information (SSRI)](https://talk.nervos.org/t/en-cn-script-sourced-rich-information-script/8256), but they won't be all that CCC is. I hope CCC can help developers solve different problems in different scenarios, and this requires understanding what developers need, which requires more feedback from the community.

Anyone interested is welcome to leave your thoughts on [CCC Issues](https://github.com/ckb-devrel/ccc/issues), or see if there are any problems you'd be willing to solve. If you like [CCC](https://github.com/ckb-devrel/ccc), star the repo to encourage us.
