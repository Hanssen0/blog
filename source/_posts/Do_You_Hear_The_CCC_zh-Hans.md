---
title: 你可听见 CCC 呼唤？：来吧，我们要建造一座塔
date: 2026-01-21 04:00:00
excerpt: 2.0.0，CCC 看起来像是正经项目了。这篇日志会介绍 1.0.0 到 2.0.0 之间我觉得有趣的东西，可能已经上线一年了，也可能还在开发中。我们为常见的用法都提供了支持，也根据社区的反馈进行了迭代。CCC 不再只是个新奇的试验品，还逐渐成为了可靠的地基，或许我们已经到了要建造一座通天塔的时候。
---

![CKB DevRel](CKB_DevRel.png)

月亮好，太阳好，我是 [CCC](https://github.com/ckb-devrel/ccc) 的开发者 Hanssen。

2024 年，Nervos 的工具链像腐朽的毛坯房，危害每个开发者的身心健康，鞭笞出了 CCC。CCC，我称之为 **C**CC is **C**KBer's **C**odebase <sub>（告诉我自指梗还没过时不然我会哭）</sub>，根植于最常用的浏览器生态。它旨在提供一站式的解决方案，让开发者可以在搭建好的脚手架上修建自己的应用，从一遍又一遍从底层概念开始构建应用的阿鼻地狱中解脱出来。

简单来讲，CCC 让开发者脑中的想法更快更可能变成现实；详细来讲，从前端点下连接钱包开始，经过用户选择钱包、处理各种协议、组装 CKB 交易<sub>（这超麻烦）</sub>、请求用户签名，最终将交易发到链上的整个流程，CCC 都提供了完整又不失灵活，自由又不失简洁的协助。

---

我希望你读到这里能对 CCC 开始感兴趣，因为我接下来要突然开始贴更新日志，你得靠着兴趣撑过这些没人乐意读的东西。

## CCC 2.0.0：来吧，我们要建造一座塔

![CCC Logo](CCC_Logo.png)

[1.0.0](https://github.com/ckb-devrel/ccc/commit/283d1b2b2fe7eedb1f74fb3fc99330446e39c9cf) 版本的发布是个无聊的时刻，那时我们甚至没想过给它起个名字，像监狱或中国学校称呼囚犯一样用序号代指它。一年过去，我们终于迎来了 2.0.0 -- 还没有发布。三个月前我就发布了 [`v1-final`](https://github.com/ckb-devrel/ccc/pull/309) 分支，但总是有差一点点就能做完的东西，等着赶上这时候，逼得我不得不诉诸「弄假直到成真」。先把更新日志写出来，我总不能拖到明年再发布吧，对吧？

更新主要版本号是一种耻辱，标记着写代码的家伙一开始没把东西想好，不得不昭告天下「我改主意啦！你们都更新一下」。虽然如此，我还是希望隐含的「某些东西变得比以前好」的意象能把我们带到一个新的开始。

2.0.0，CCC 看起来像是正经项目了。这篇日志会介绍 1.0.0 到 2.0.0 之间我觉得有趣的东西，可能已经上线一年了，也可能还在开发中。我们为常见的用法都提供了支持，也根据社区的反馈进行了迭代。CCC 不再只是个新奇的试验品，还逐渐成为了可靠的地基，或许我们已经到了要建造一座通天塔的时候。

### Nostr

![Nostr](Nostr.png)

Nostr 不是 CCC 支持的第一个签名方式，也不会是 CCC 支持的最后一个签名方式。但我想特别表达对它的喜爱，因为我们可以感恩戴德地~~白嫖~~使用 Nostr 社区的公共中继服务器存储并分享数据。

基于这个特性（**特性**），我在 [CCC Playground](https://live.ckbccc.com/)，一个浏览器里的代码运行环境中，添加了「分享」按钮。在你点下它之后，网页自动生成了一个私钥，为你的代码签名并发送到了 Nostr 上，允许你通过链接将它分享给我们的好朋友们。

- [对 Nostr 签名的核心支持](https://github.com/ckb-devrel/ccc/tree/master/packages/core/src/signer/nostr)
- [对 NIP 07 的支持，允许连接 Nostr 签名器/钱包](https://github.com/ckb-devrel/ccc/tree/master/packages/core/src/signer/nostr)

### CCC Playground 超进化

![CCC Playground](Playground.png)

在今年 Playground 的更新里，我最喜欢的是为 CKB 「细胞」的概念重新做的图形化设计。我用八卦的形式展示出了「细胞」，用卦象的组合（它是二进制！）代表细胞上不同的「锁」和「类型」脚本。我还为它加了点动画，虽然不务正业，但也许能让人们觉得自己在做很酷的事情。如果你感兴趣，可以试试看[这个例子](https://live.ckbccc.com/?src=https://raw.githubusercontent.com/ckb-devrel/ccc/refs/heads/master/packages/examples/src/transfer.ts)。

之所以我们能做到在终端里展示图像，是因为 Playground 的另外一个新功能：直接使用 React 的 TSX 语法写代码。这意味着开发者可以展示任意的前端元素，甚至编写一个带用户界面的简单工具分享给其它人使用，而不需要担心框架、依赖或部署等麻烦的问题。

- [Playground 添加了 TSX 支持](https://github.com/ckb-devrel/ccc/pull/181)
- [八卦 UI 更新](https://github.com/ckb-devrel/ccc/pull/323)

### 更好的 Nervos DAO 适配

![Nervos DAO](Nervos_DAO.png)

终于，开发者们有了个工具来操作 Nervos DAO，通过锁定 CKB 原生代币的数据存储能力，从而抵抗通货膨胀，这个 Nervos 生态设计最根本的一部分（尽管 Nervos 官网上现在也还没有它的介绍，谁愿意为它写篇文章？）。

感谢 [@phroi](https://github.com/phroi) 为这一系列改进提供了许多宝贵的反馈，他开发的 iCKB，允许 Nervos DAO 代币化并流通的协议，提供了不少真实的使用场景。

- [操作 Nervos DAO 的代码例子](https://github.com/ckb-devrel/ccc/blob/master/packages/demo/src/app/connected/(tools)/NervosDao/page.tsx)
- [自动计算交易中的 Nervos DAO 收益](https://github.com/ckb-devrel/ccc/pull/171)
- [操作 `Epoch` 的工具类](https://github.com/ckb-devrel/ccc/pull/314)

### UDT

![+15 UDT](UDT.png)

用户定义代币（UDT）系列协议，从最早出现并沿用至今的 sUDT 核心，到基本没人用过的 xUDT 扩展，支撑着所有在 CKB 上发行的二级货币。它的核心思路是用细胞中的数据来代表面额，并不复杂，但想将这套逻辑融入到应用里却颇具挑战。

CCC 为操作 UDT 提供了类似操作原生 CKB 代币的接口，避免额外的学习成本。这一系列的改进建议同样来自 [@phroi](https://github.com/phroi)，源自他在为 iCKB 编写 UDT 相关代码总结的方案。另外也感谢来自 [@rink1969](https://github.com/rink1969) 的建议，优化了 UDT 找零时的 CKB 占用。

* [将 iCKB 的 UDT 特性合并进 CCC](https://github.com/ckb-devrel/ccc/issues/227)
* [向自己付款以避免额外的 CKB 占用](https://github.com/ckb-devrel/ccc/issues/214)

### 类 Type ID 协议

![CCC logos with different color](Type_ID.png)

Type ID 借助了 CKB 细胞只能被消费一次的特性，被用于赋予细胞链上独一无二的编号，以追踪细胞单例的更新和销毁。它从一开始被设计用于追踪可升级合约的最新状态，逐渐地被更广泛应用到了其它的协议中。

CCC 新的 Type ID 包除了提供对最简单的任意数据 Type ID 支持外，还提供了高级方法方便扩展对类 Type ID 的协议支持，随着 Type ID 包添加的 [DID CKB](https://github.com/web5fans/did-ckb) 支持就是个很好的例子。

* [添加了 `did-ckb` 包](https://github.com/ckb-devrel/ccc/pull/337)

### 多签锁

![Seele from EVA](Multisig.png)

又是一个对 CKB 早期功能的支持。虽然多签锁只支持 Secp256k1 算法，但它依然被频繁用于合约或资金管理等场景。在之前，开发者大部分时间都是使用 [`ckb-cli`](https://github.com/nervosnetwork/ckb-cli) 命令行工具来处理多签交易，我希望在 CCC 添加了支持之后事情能变好些。

CCC 的支持囊括了按顺序签名和合并多笔签名后的交易两种模式。

* [多签 `Signer`](https://github.com/ckb-devrel/ccc/pull/349)

### `FeePayer` 抽象层

感谢 UTXO 模型的特性，一笔交易中的所有参与方都可以支付手续费，这使得计算手续费异常地困难。过去的 SDK 对此会假设有一个特定的原生地址会添加更多的代币负责支付手续费，但这并不能满足类似 Spore 协议的零手续费或 [UDT 闪兑](https://talk.nervos.org/t/udt-payment-solutions/8956)（有多少人知道这个有趣的东西？）想要引入的功能。

`FeePayer` 希望能将手续费支付抽象成一个单独的步骤，为更多的手续费支付方式提供统一的接口。在开发者们用上这些有趣的特性后，用户可以不再需要持有额外 CKB 才能发起交易，而是通过资产中预存的费用，或就地小额兑换来支付手续费。

* [引入 `FeePayer` 概念以让手续费处理变得灵活](https://github.com/ckb-devrel/ccc/issues/274)

## 还有更多？

老实讲，我不知道 CCC 未来会变成什么样子。我们有一些正在推进的事情，比如[对 RGB++ 的支持](https://github.com/ckb-devrel/ccc/pull/332)，对 Fiber Network 的支持或将[来源于 Script 的富信息（SSRI）](https://talk.nervos.org/t/en-cn-script-sourced-rich-information-script/8256) 落地，但它们不会是 CCC 的全部。我希望 CCC 在不同的场景下都能帮助开发者解决不同的问题，而这需要弄明白开发者需要什么，需要来自社区的更多反馈。

欢迎有兴趣的人到 [CCC Issues](https://github.com/ckb-devrel/ccc/issues) 留下你的想法，也可以看看有哪些问题是你愿意解决的。如果你喜欢 [CCC](https://github.com/ckb-devrel/ccc)，可以点 Star 来鼓励我们。
