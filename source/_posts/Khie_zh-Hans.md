---
title: Khie，「契」。
date: 2026-09-20 20:00:00
excerpt:
  <p>Khie /kʰje/，客家語，意为契。</p>
  <p>准备钱包，打开应用，扫码，结契。Khie 基于 libp2p，是构建在端到端通道上的钱包连接协议。</p>
  <p>我很难给 Khie 再下更复杂的定义，它就像 CCC 一样，你打开，连接钱包，然后忘掉它。虽然如此，Khie 想解决的问题却要棘手许多。</p>
---

<center><img src="./khie.svg" width="250px" /></center>

> Khie /kʰje/，客家語，意为契。

准备钱包，打开应用，扫码，结契。Khie 基于 [libp2p](https://github.com/libp2p/libp2p)，是构建在端到端通道上的钱包连接协议。

我很难给 Khie 再下更复杂的定义，它就像 CCC 一样，你打开，连接钱包，然后忘掉它。虽然如此，Khie 想解决的问题却要棘手许多。

很难被人注意到的一点是，CKB 或许比任何区块链都更适合孵化新的钱包形态。[邮箱 DKIM](https://talk.nervos.org/t/unipass/5952) 或[抗量子](https://talk.nervos.org/t/ckb-eco-fund-quantum-purse/8775)，[手机](https://talk.nervos.org/t/dis-mobile-ready-ckb-light-client-pocket-node-for-android/9879)到[桌面](https://talk.nervos.org/t/nervos-ckb-wallet-neuron-faq/3553)，各式钱包在 CKB 上钻出。

并不只是因为自由的签名算法这种显而易见的原因，更因为 Nervos 中不存在一个「钱包就该这样」的规范。你看，人们总喜欢依赖阻力最小的路径。如果我们假设「钱包就得提供浏览器注入」的话，Nervos 上琳琅满目的各式网页钱包和原生钱包可能就会少上一大半。

不过，乐观主义需要收敛一下，我们正处于 Nervos 的钱包蛮荒时代。每个钱包和应用都拥有自由去选择对自己而言最自然的接入方式，但零散的范式只会让债务蔓延到整个生态，拆出一块块破碎的体验。

痛苦源于模糊不清的边界。想要让一个很棒的钱包变得可用，你得做好必须自己整合所有功能的准备，即使那么做的成本可能将你彻底拖垮。

所以你看，在 CCC 已经揭开了应用端边界的一角之后，我想继续用 Khie 来明确钱包进入这个空间的方式。

---

![正在用手机扫描电脑上的 Khie 二维码](./scan_khie.jpg)

简单、快速、可靠、让你觉得好用，这是 Khie 最重要的目标。虽然对于 P2P 协议来说，想达成这些目标需要付出额外的精力，但我没打算过放弃 P2P。

原因蛮直接的，中心化协议设计简单，却往往涉及更高的维护和运行成本。我不愿在 Khie 面前再筑起成本之墙，细细地盘问通行的开发者；更不想让一个未来无以为继的中心化协议成为信任的鸿沟。

不过，Khie 也不会退回到只使用本地连接。除了比起中心化的方式，本地连接并不一定有更好的安全性和隐私保护之外，它也只能在同设备的基础上划一条小小的边界，和我所期待的 Nervos 上跨平台、跨设备连接的未来相差甚远。

想象通过 Khie，你可以把手机钱包连接到电脑上的 AI 工具，让它帮你操作区块链；也可以在手机游戏里连接托管钱包服务器，免去切换内置钱包的麻烦。正因为是远程连接，开发者发挥创意的自由度，和用户想使用熟悉钱包的需求，才得以相安无事。

所以，与其说是我选择了用 P2P 来实现 Khie，更像 Khie 本身就应当是 P2P 的形态。

---

![CCC App 的 Khie 模块](./ccc_app_khie.png)

> *为了让 Khie 看起来更靠谱，我还重做了 CCC App 的视觉效果！*

在应用一侧，更新了 CCC Connector 后的应用，比如 [NervDAO](https://nervdao.com/)，会直接支持使用 Khie 连接钱包；但在钱包一侧，事情会更麻烦一些。当下 CCC 接入的钱包有不少都来自其它链，想让它们支持 Khie 我们还需要走很远的路。

不过在原有的连接方式外，你也并非只能换用新的钱包才能使用 Khie。类似曾经的 Portal Wallet，[CCC App](https://app.ckbccc.com/#khie) 中的 Khie 模块也是网页里的「应用型钱包」，你可以使用它来让现有钱包也能通过 Khie 连接其他应用。有了它，所有 CCC 支持的钱包都是 Khie 钱包。

![Khie 手机钱包](./khie_mobile.png)

当然，如果你想马上试试看支持 Khie 的钱包会是什么体验的话，我也*一不小心*让 AI 生成了支持 Khie 的 [Android 原生应用钱包](https://github.com/Hanssen0/khie-mobile)。

你不应该对 AI 生成代码抱有完美的期望，但它确实展示了在有 Khie 之后，我认为的钱包开发门槛能降到多低。得益于 Khie 和 React Native 共同划定的实现边界，我能复用大量现有的成果。在不需要从头构建基础设施的条件下，两天的开发时间已经足够我把组件串成可用的钱包。

![Cryptape Trust 硬件钱包](./cryptape_trust.png)

另外，这里还有个来自 Cryptape 的彩蛋！这是个机械猿造型的硬件钱包，大概人们很少知道它曾存在，连创造它的人也就给了它 [11 次提交](https://github.com/cryptape/trust-android) 的时间，停在了成为完整的钱包前。

但它留了一个念头给我，于是我也留了一个念头给它。现在，它通过 Khie 回到了整个生态，就和其它钱包一样活在 CKB 上。

---

虽然我已经实现了 Khie，但我还得让它回到实验室，整理出最终会安静躺在某个地方的协议文档。我想，钱包和应用才是那些激动人心的事情，Khie 只是在它们中间运作着。

你只需要使用它，然后忘掉它。也许某天你再看到它的图标的时候，会感到一阵安全感：

「它也支持 Khie！」

---

* [CCC App | Khie 模块](https://app.ckbccc.com/#khie)
* [Khie Android 钱包](https://github.com/Hanssen0/khie-mobile)
* [Cryptape Trust Android](https://github.com/cryptape/trust-android)
* 本文同时发表于 [Nervos Talk 论坛](https://talk.nervos.org/t/khie/10726)。
