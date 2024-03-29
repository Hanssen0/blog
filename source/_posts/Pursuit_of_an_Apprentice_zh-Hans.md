---
title: 一个程序学徒的追求
date: 2020-09-23 22:29:00
excerpt:
  <p>在过去的时间，我遇到了不同阶段的程序学徒，从对计算机毫无概念，到已经参与工业开发。初级学徒遇到的问题总遵守着同样的模式，这让我觉得也许程序学徒们更需要框架上的指导，而不是各式的培训班。</p>
  <p>希望本文能让读者有所收获。</p>
sticky: 100
---

人在瓷器国，政治不正确，拒绝被喷。一切推断均基于国内环境，如有偏见还请包涵。

## 写在吹水之前

> 有火从耶和华面前出来，在坛上烧尽燔祭和脂油，众民一见，就都欢呼，俯伏在地。
> <p align="right">利未记 9:24</p>

这年头，计算机已经热门到了就算是楼下大爷，听见哪家孩子是学电脑的，也会冒出花痴的眼神竖起大拇指说好。造成的后果非常惨烈：黑压压的学徒们，带着刚学会怎么启动的笔记本电脑、琢磨着怎么吹嘘高考分数，涌进了各大院校的计算机系，去听大部分刚上完培训班，同样迷茫的成年人们念幻灯片。

个人经验有限，本文仅面向已经了解计算机能做什么，但不了解自己能做什么的探索者们。受篇幅限制，我不想重复已有的的「怎么做」，而会更多谈谈「为什么」，帮助读者建立框架后，自行补充细节。因此，本文所涉内容跨度较大，学徒们也许需要实践中逐渐体会，得到自己的想法。

## 被忽视的

> 主叫他们瞎了眼，硬了心，免得他们眼睛看见，心里明白，回转过来，我就医治他们。
> <p align="right">约翰福音 12:40</p>

新世界的大门前人挤人，都希望能踩在坚实的土地上。作业、竞赛、外包，学徒们放弃了思考，请求别人为自己安排道路，忽视了自己所需要的。

### 可维护性

解剖当前的大部分产品，它们并没有用到非常超越的技术，这让很多学徒们觉得「就这？我也能做一个！」。一开始，我们一天几千行代码，东西有了大模样，自我感觉良好。当产品发展到一个体量的时候，我们会突然发现，为这个大模样添加细节已经非常痛苦了。因此，新学徒们吹嘘自己的程序时，被折磨过的学徒们会哭出声。

程序员至少要考虑三个人：将来、现在和过去的自己。不经意间的高耦合，会让未来的自己整个重做来实现简单的功能；过去的自己随便起的名字，会让现在的自己挠掉头发而造就未来秃头的自己。

程序员还需要考虑客户。在为客户做程序时，我们永远是「乙方」。网路上充斥着对「甲方」们瞬息万变的需求的吐槽，这给了很多程序员底气去拒绝需求变更。

这很可笑。

难以跟上需求改变的产品是糟糕的。不管是因为商业需求，还是因为看到原型后的再设计，客户大部分时间都有合理的原因。改需求会毁了下午茶，不改需求会毁了产品存在的意义，浪费所有花费的时间。

设计原则让功能修改得以变快速；系统架构让设计原则得以被实现；设计模式让系统架构得以被建立；代码规范让程序错误得以被发现。这些是程序员们的必修课，而重复书写糟糕代码来成为学徒中的「大佬」，是浪费时间。

### 优先级

> 过早的优化是万恶之源。
> <p align="right">高德纳</p>

我们仅对可维护性进行早期设计，而不对其它方面进行过早设计。

在无知的激流中，人们喜欢抓住已知的部分大谈特谈。项目开发早期，产品的一切都是未知的，于是学徒们就开始讨论熟悉的东西，像数据库、性能优化、配色方案或界面动画。学徒们会说：「嘿伙计，优秀的产品是细节造就的！」。

但「细节」是指「最后打磨的部分」。

需求变更时，越充满细节的系统越要求学徒们小心谨慎，这表明细节需要代价，所以不需要的细节需要被尽力推迟实现。

面对截止日期时，通过推后决定细节，「抛弃细节」得以成为备用方案。对将来的预估是不准确的，而不准确的事情需要备用方案来防止过于自信毁掉一切。

### 团队合作[^1]

[^1]: 服从集体、团队荣耀是心理扭曲的产物，与团队合作无关。

在优秀的骨架上，我们还需要人力来精雕细琢。

计算机行业已经庞大到了难以想象的程度。独行开发者的作品，尤其是在生产力领域，想要惊艳世人异常困难，这意味着我们不得不与别人合作。

曾经参与的一个团队里，每个人都是游离的。代码上，每个人挥洒被填鸭教育压抑的艺术，为一切命名融入上百个梗，在一切钉子上敲打锤子；周会上，每个人分享昨夜挤出的进度，以在接下来的一周中摸鱼；版本管理上，大家几个月一次把下载目录中的代码拷贝到一起，然后为之建立新的版本仓库。

这是何等的噩梦！这样一个工作效率比个人开发还低的团队有什么存在的必要呢？很可惜，这是目前「工作室」、「社团」或「团队」的常态。

只有在工作能被并行完成时，团队才有存在的意义。团队需要学习开发方法、项目管理，才能脱离小孩子过家家。

## 唯一真正的智慧，就是知道自己一无所知

> 人不要夸口说骄傲的话，也不要出狂妄的言语。因耶和华是大有智识的神，人的行为被他衡量。
> <p align="right">撒母耳记上 2:3</p>

失去了目标，学徒们寄希望于铺天盖地的「某某学习路线」之类的文章，但它们无法造就好的程序员。熟练掌握各种技术可能让学徒成功，也可能让学徒迷茫。

### 各种「框架」、各种「语言」

> 计算机科学中的每个问题都可以用一间接层解决。
> <p align="right">戴维·約翰·惠勒</p>

那是最有用的技术，那是最没用的技术。

学徒们以了解的「框架」数量为荣，迷失了自己学习的目的。

在「框架」下，我们遵守制定好的规则工作，以底层的控制权换得高效的开发。由此可见，「语言」即是狭义的「框架」。

在数十年构建的高抽象层级上工作，当代的程序员的效率远超过去。学习这些抽象层级是必须的，但学习每一个「框架」不是。大部分「框架」只是对同样抽象层级的不同实现，将时间耗费在数量上没有意义。

同时我们会发现，翻阅源码来理解「框架」[^2]的行为不仅拿不回对底层的控制权，还放弃了在高抽象层级与人交流的效率，是不合理的。通过文档去理解抽象模型，享受我们交易得到的果实才是更好的做法。

[^2]: 不包括开发「框架」的情况。

### 算法

少数天才从竞赛中脱颖而出，吸引无数学徒盲目投入其中，最终一无所获，成为整体荣誉的炮灰。

算法竞赛吞噬了我大约 700 天的时间。不断刷题、研究、压缩时间，最终我得到了一份还过的去的荣誉，以及大量的算法知识。

但算法领域在不断进化。

在原型阶段，比起效率问题，我们更关心怎么让产品工作起来，这意味着我们在大部分情况下只需要暴力搜索。在优化阶段，那些为三小时的竞赛时间准备的算法无法满足需求，驱使我们去研究更复杂、庞大的算法。

算法重要吗？是的。但除非想成为算法的创造者，学徒过早学习大量算法并没有实质意义。为了更好利用时间，也许我们应当在需要的时候再学习最优方案。

### 而思想是不怕子弹的

> 跳转语句是有害的。
> <p align="right">艾兹赫尔·韦伯·戴克斯特拉</p>

「面向对象编程」、「结构化编程」与「函数式编程」的思想，都源于上世纪六、七十年代，把一个上世纪的程序员抓到现代，她（那个时代程序员大多是女性）在震惊中恢复过来后，大概花半天时间熟悉语法就可以开始工作。

蕴含在不断迭代的技术背后的思想很少改变。在花了 20 年时间穿越 20 年后，我们的知识大部分已经过时。为了在那个时代混饭吃，学习最新技术是必须的，而掌握贯穿时代的思想会帮我们做到这一点。

## 「最佳实践」

> 他们说，来吧，我们要建造一座城和一座塔，塔顶通天，为要传扬我们的名，免得我们分散在全地上。
> <p align="right">创世记 11:4</p>

在一大坨概念之后，我们需要更为具体的能提升产品质量的方法，程序员们将这些经验之谈称为「最佳实践」。
 
### 测试程序

第一次体会到在庞大的系统中快速发现什么被搞崩了的重要性，是在很早之前在为一个项目贡献代码的时候。虽然接触到了测试程序，但一直没能应用到开发中去，很惭愧。到近期开始管理多人项目，学习测试驱动开发，才得以发现测试背后的优雅。

程序员们是人，人是不完美的。新的代码，更新的代码，一层层叠加不断腐化程序，直到一切臭不可闻。「重构」是拯救一切的唯一办法，而测试是「重构」坚实的盟友。在我们剖析解构每一段代码时，测试保证了一切没有脱轨，于是我们知道自己确实在「重构」而非「重创」程序。

学徒们常认为，只有大项目需要测试来保证功能，而小项目编写测试只会拖慢效率。这样想的人大概没有写过测试，因为这是错误的：开发效率取决于程序员的思维，而编写测试让程序员从思考「怎么让程序运行起来」变为思考「怎么拆分程序的逻辑」，这有助于理清思维，从而提高效率。


### 版本管理

天，我们已经到了要推广版本管理的时代。

蛮荒时期的程序员们，会在开发前拷贝代码，并编上版本号以便在文件中添加版本记录注释。劣势显而易见：首先，整合工作时，大量的时间消耗在手动对比差异上；其次，创建新版本的成本变得异常高，这限制了我们大量创建版本。

为什么要大量创建版本？

现代版本管理工具将版本的尺度缩小到了「提交」。我们大量创建「提交」，并追求每次「提交」只涉及一个特性，这要求程序的特性被拆分到互不耦合的模块。

听起来很熟悉？没错，通过大量创建版本/「提交」，版本管理也能帮助程序员理清思维。除此之外，更小的版本变动也提升了合并的效率。

### 「依赖反转」

「依赖反转」是如此广为人知，以至于不少项目就算不理解其思想，也要强行套用。常会看到`某个接口`下面只有一个叫`某个接口的实现`的实现类这种用法，让人怀疑这些规则存在的意义。甚至于在某中文装逼社区上，排名前列的答案大都认为接口无用，或说不清楚为什么接口是好的。

愚昧。

「依赖反转」提倡从依赖具体类变为依赖接口，这是「控制反转」的基石。「控制反转」通过「依赖注入」[^3]或「依赖找查」，让对象得以对其依赖一无所知。由此，我们将依赖由链式或环状拆分到了树状，大幅度降低了各节点间的耦合。

[^3]: 不不，不是弹簧，不是咖啡，它们是邪恶的。

低耦合带来最明显的优势，是修改某个节点时，只有其本身与其依赖的接口需要被关注，这为程序带来了可维护性。其次，实现节点的任务得以被并行完成，并能以很低的成本被整合，这为团队合作打下了基础。

从另一个方面，「控制反转」让我们得以在测试时传递假实现给对象。使用真实现，我们需要在一整条依赖链上运行测试，这强迫我们在测试时进行访问数据库之类的昂贵操作。这样的测试不仅是低效的，还潜藏了破坏生产环境的风险，我们不会希望全部测试都如此[^4]。假实现用简单的方式模拟了真实现的行为，将测试控制在被测对象范围内[^5]。

[^4]: 我们确实需要这样的测试，例如端到端测试。
[^5]: 这些被称为单元测试。

## 终章

> 到第七日，神造物的工已经完毕，就在第七日歇了他一切的工，安息了。
> <p align="right">创世记 2:2</p>

很不幸又很幸运，大概在十个秋天之前，我接触到了写代码的世界。我作为小孩子懵懵懂懂地走了不少弯路，浪费了很多时间。感谢上帝我真的够有时间来浪费。

在过去的时间，我遇到了不同阶段的程序学徒，从对计算机毫无概念，到已经参与工业开发。初级学徒遇到的问题总遵守着同样的模式，这让我觉得也许程序学徒们更需要框架上的指导，而不是各式的培训班。

希望本文能让读者有所收获。

## 最终章

> 传达不了的恋情，已经不需要了。因为已经不再有人，值得去爱了。
> <p align="right">白色相簿 2</p>

胡言乱语中。

第一次写这样的文章，对一切很迷茫。

我尽力让本文去专业化。所以我减少术语、删除技术细节甚至不使用英文名词。专业文章已经有很多了，我没有信心写得更好，因此专注于整体的思想框架，而放弃了雕琢细节。

我尽力让本文风格化。所以我添加引用、混用各式各样的东西。我认为独特的东西能影响读者，而这是传达思想所必须的。

在程序员领域，人与人之间的联系异常重要。学徒们很难在没有指导的情况下朝正确的方向发展，对此我深有体会。我想这类似「师傅」与「学徒」的关系，因此我称呼程序初学者们为学徒。

虽然在程序领域混迹多年，但我还处于碌碌无为的状态，因此读者们根据自身的经历，对本文的观点也许会有不同的看法，欢迎交流。