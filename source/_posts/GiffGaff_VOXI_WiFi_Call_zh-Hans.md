---
title: GiffGaff 被封，Android & iOS WiFi Call 激活 VOXI 简记
date: 2026-08-01 06:00:00
excerpt: 收到来自 GiffGaff 的封号邮件。PAC 转网到 VOXI。用 iPhone 和 Samsung 拉起 WiFi Call 成功激活。
---

2026-7-28 19:31 UTC+8 收到来自 GiffGaff 的邮件。立刻测试原来的号码已经发不出去短信了，还好还能收，登录进官网申请了 PAC 准备携号转网。有几个平台还绑定在这个号码上，打算抢救一下。

没测试过能不能退款。剩下的余额买了个 6 镑的 1G 套餐以防万一，买完的确恢复正常了，只是不知道能持续多久。

挑下家的时候对比了 CMLink、CTExcel 和 VOXI。CMLink 看着已经不支持购买 eSIM 了，排除；本来想买 CTExcel，奈何官网做得实在太烂，经常刷不出来，担心以后心累所以排除；最后选择买 VOXI。

购买过程倒是简单，Google 英国邮编 + 绑定国内 Mastercard 顺利支付。收到一封带 eSIM 二维码 PDF 的邮件，加密密码是注册的时候填的生日。

先是通过改 APN 的方式半激活了卡，能收到短信，但是发不出去短信也打不了电话。打出去电话连提示音都没有，直接被挂断。总之先收了验证码登录 VOXI 官网，走 PAC 转入选了最近了 31 号。收到短信说 11am 到午夜会完成转入，估计是 UTC+1 时间。实际上是 31 号 18:21 UTC+8 收到了转入成功的短信。

查了一下还是得走 WiFi Call 才能彻底激活，不然不能发短信之后不好保号，只能每个月交 10 镑套餐费。用的 9esim 换着手机试，家里路由器代理改全局走英国节点，开飞行模式试了 Samsung、小米、一加和 iPhone 都没成功。

最接近的是 iPhone，设置里打开 WiFi Calling 开关之后代理日志发现了 ePDG 域名的请求记录，于是沿着这条路继续尝试。iOS 26+ 会检测手机的位置决定能不能启用 WiFi Call，最后走的 ShadowRocket + [WLOC](https://github.com/Yu9191/wloc)  改定位成功开启。过程比较混乱，改完定位后试了好几遍，最终在开了定位（已修改） + 没开飞行模式 + 手机开 ShadowRocket + WLOC 的环境下拉起来了。不确定是中间连路由器代理的时候通过的验证还是真的 iOS ePDG 请求会走 VPN。

拉起 WiFi Call 打了几次电话出去还是秒挂，等几分钟之后开始一切正常。把卡从借的 iPhone 上插回主力机，没开 WiFi Call 测试呼叫也正常，只是因为没余额一直提示我欠费，而且短信也发不出去。

主力机是一台 Samsung S25 Ultra，继续折腾免得后续出问题还得再借手机。Shizuku + Pixel IMS / Pixel Volte Patch 没用，但参考 [GitHub 上的指南](https://gist.github.com/extremecoders-re/9055d74c5513ee7137ee2832f7a9df57?permalink_comment_id=5430429) 连电脑用 adb 在被隐藏的 WiFi Calling 设置里成功让手机开始请求 ePDG 域名。

```sh
adb shell am start -a android.intent.action.MAIN -n com.android.settings/.Settings\$WifiCallingSettingsActivity

# 检查 WiFi Call 状态。9sim 在卡 2 上。
adb shell settings get system wifi_call_enable2 #1
adb shell settings get system wifi_call_preferred2 #1
```

离成功差最后一步，路由器代理日志看到手机请求 `epdg.epc.mnc015.mcc234.pub.3gppnetwork.org` 500 端口之后再没下文，怀疑是 Fake IP 有影响。绕过 Fake IP 之后发现请求了一个新的域名 `epdg.vodafone.co.uk`，看起来是在 DNS 里 CNAME 过去的。让两个域名都绕过 Fake IP 并代理到英国节点，终于 Android 上也出了 WiFi Call，可喜可贺。

试了一下，Android 上面不用关定位，不用开飞行模式也成功开出了 WiFi Call。但是单纯开设备 VPN 不走路由器代理不行，只有 DNS 请求走了设备 VPN，没看见后续的连接。

VOXI 官网的充值看起来不接受中国的信用卡。最后随便找了个看起来靠谱的网站买了张 5 镑的 Vodafone top-up voucher，收了我 1.49 镑的服务费，真贵。走 Vodafone voucher 充值成功进了余额，顺利发短信，搞定。

GiffGaff 关停邮件

> Hi Hanssen,
>
> We need to make you aware that, following a review of your account usage, we have made the decision to disconnect your service (mobile number ending ----). In line with our terms and conditions, our services are intended primarily for use within the UK, with roaming provided for short-term travel only. As your usage pattern suggests extended or permanent use outside the UK, your account no longer meets the eligibility requirements for the service. As a result, your service will be disconnected shortly, and any associated access will cease.  
>
>
> Please note this is our final position on this matter.
>
> We appreciate your understanding and thank you for your previous custom.
>
> The giffgaff team

GiffGaff PAC 邮件

> Hi Hanssen,
>
> We’re gutted you’re thinking of leaving, but here’s everything you need to switch to another network.
>
> Your PAC code is ---------. This will automatically expire on 27/08/2026. So no worries if you no longer need it, we can just pretend this whole thing never happened.
>
> Remember if you switch networks:
>
> ■ You’ll lose any rewards you’ve earned by inviting friends
>
> ■ You have £--.-- credit left. See the attached PDF for how to claim this back
>
> We’ve attached a PDF for the full details about switching. You can find the same switching info on our website here, where there are more accessible formats too.
>
> To see your latest account info, log in to the giffgaff app or website.
