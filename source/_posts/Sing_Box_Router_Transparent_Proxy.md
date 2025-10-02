---
title: sing-box 软路由透明代理 IPv6 + 自动更新订阅 + 代理链
date: 2025-10-02 02:00:00
excerpt: 每个生活在瓷器国的合格程序员，人生中大概都有那么几个时刻暴怒于糟糕的网络环境。作为被隔离的一代，防火墙教会了我大约半数以上的网络技能，感谢您全家，虽然我更希望能学得不那么扭曲。
---

> 可恶，我也就只有假期能才有空记录点什么东西 = =

每个生活在瓷器国的合格程序员，人生中大概都有那么几个时刻暴怒于糟糕的网络环境。作为被隔离的一代，防火墙教会了我大约半数以上的网络技能，感谢您全家，虽然我更希望能学得不那么扭曲。

这篇文章分享了几个代理设置过程中麻烦问题的解决方案。

---

代理软件伴随了我在赛博空间的一生，从懵懂时的免费服务，到薅 GAE 羊毛，到自建 [Shadowsocks](https://github.com/shadowsocks/shadowsocks) 和 [V2Ray](https://github.com/v2ray/v2ray-core) 服务器，再到最近几年用 [ShellCrash](https://github.com/juewuy/ShellCrash) 管理我的订阅。我在各种尝试中总结了以下几个需求：

* 写入安全：为了避免恶意软件篡改机器的数据，闭源客户端无法被接受。
* 稳定：时间对所有人类都是平等的宝贵，我没办法说服自己为这外加的束缚浪费时间。我希望能尽可能使用已有的解决方案，而不是自行开发/手动处理。
* 良好的体验：我不希望为不需要的好处付出体验成本。
* 读取安全（隐私）：我希望降低信息泄漏的可能性。虽然大部分网站使用了 [HTTPS](https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%AE%89%E5%85%A8%E5%8D%8F%E8%AE%AE) 加密，但中间人依然可以读取我正在访问的域名。

ShellCrash 在过去几年能一直能稳定满足一些基本需求，但面对需要高度定制化的隐私需求显得有些鸡肋且束手束脚，而且我也不太喜欢它的防火墙规则写法。于是我捣鼓一套自己的 [`nftables`](https://en.wikipedia.org/wiki/Nftables) 规则，跑通之后才发现 [sing-box](https://github.com/SagerNet/sing-box) 内置了 `nftables` 的规则配置，好吧。

这篇文章会忽略简单的让服务可用的部分，记录几个处理起来比较麻烦问题的解决方案。[自用的完整配置模板](https://gist.github.com/Hanssen0/0e3eef2400e832d0ee98b46f01f4e23b) 会在文章最后附带。

## IPv6

我家里的宽带分配了 IPv6，但代理服务提供商不支持通过 IPv6 出口流量，这意味着所有的 IPv6 流量都必须通过直连出口。为此，所有 DNS 请求都被劫持为使用 [FakeIP](https://www.rfc-editor.org/rfc/rfc3089.html) 方案，以保证寻常的请求带有[完整域名（FQDN）](https://zh.wikipedia.org/wiki/%E5%AE%8C%E6%95%B4%E7%B6%B2%E5%9F%9F%E5%90%8D%E7%A8%B1)信息抵达代理客户端，推迟 DNS 解析。

```json
{
  "dns": {
    "servers": [
      {
        "type": "tls",
        "tag": "dns_proxy",
        "server": "8.8.4.4",
        "detour": "🚀 海外网站"
      },
      {
        "type": "fakeip",
        "tag": "dns_fakeip",
        "inet4_range": "198.18.0.0/16",
        "inet6_range": "fc00::/16"
      }
    ],
    "rules": [
      {
        "query_type": [
          "A",
          "AAAA"
        ],
        "server": "dns_fakeip",
        "rewrite_ttl": 1
      }
    ],
    "final": "dns_proxy",
    "strategy": "ipv4_only"
  }
}
```

IPv6 相关的问题是我选择全部劫持并使用 FakeIP，而不是从真实 IP 嗅探域名的主要原因。

域名嗅探发生在 TCP 三次握手之后，此时浏览器会认为连接已经建立。因此考虑访问境外域名时，若 DNS 解析返回了 IPv6 和 IPv4 地址，浏览器会尝试使用 IPv6 访问目标域名，但我们无法将流量转向直连（因为无法直接访问境外网站）；也不能发往代理服务器（前面提到了它不支持 IPv6 出口）；同时也不能拒绝连接（TCP 连接建立之后被关闭，浏览器会报 `ERR_CONNECTION_CLOSED`，而不是尝试回退到 IPv4 地址）。

[一个已经被废弃的 `sniff_override_destination` 选项](https://github.com/SagerNet/sing-box/issues/2407) 允许用嗅探出的域名覆盖 IP 作为请求目标，但作者不打算在后续的版本中保留这个功能，而且考虑有些包可能嗅探不出来域名之类难以 Debug 的烦心事，我自己也不喜欢让嗅探结果影响主要功能这种半吊子的方案。

另外，因为设备可能使用了 [DoH](https://en.wikipedia.org/wiki/DNS_over_HTTPS)，代理软件不总是能劫持 DNS 请求，因此仅过滤 DNS 结果中的 IPv6 也不能完全避免 IPv6 请求。另外一种可能的方式是关闭路由器对 IPv6 流量的劫持，不通过代理软件而是让防火墙拒绝我们的流量。但这可能会导致 IPv6 请求泄露，暴露我们尝试访问的域名，而自行编写拦截 IPv6 的防火墙规则则不在我的考虑范围内。理论上，我们应当可以让代理软件在嗅探域名之前拒绝所有 IPv6 的数据包，但 sing-box 似乎没有很好处理这种情况。于是最终，我选择在 `nftables` 中拦截所有的路由器 IPv6 子网流量。

```conf
table inet firewall {
  chain filter_ipv6_out {
    type filter hook prerouting priority mangle; policy accept;

    # Our proxy nodes don't support IPv6.
    # Immediately reject connection attempts to IPv6 addresses. This is to prevent
    # connection failures caused by clients (using DoH) resolving IPv6 addresses,
    # and to correctly trigger the client's fallback to IPv4.
    meta nfproto != ipv6 accept
    iifname != "br-lan" accept
    fib daddr oifname != "enp2s0" accept

    ct state new counter reject
  }
}
```

使用这种方案时，即使是可以直连的域名也不能在设备上直接通过 IPv6 访问，因此为直连请求返回真实 IP 地址没有意义。

```json
{
  "outbounds": [
    {
      "tag": "Direct",
      "type": "direct",
      "domain_resolver": {
        "server": "dns_direct",
        "strategy": "prefer_ipv4"
      }
    }
  ]
}
```

在代理的直连出口选择 `prefer_ipv4`/`prefer_ipv6` 可以让代理解析 DNS 时尝试使用 IPv6 访问直连地址。

在这一套方案下，外部可以通过 IPv6 访问路由器下的设备，设备也可以使用域名通过 IPv6 直连访问其它服务。

## 自动更新订阅

[Subconverter 的 Fork 版本](https://github.com/asdlokj1qpi233/subconverter) 支持生成 sing-box 配置，但使用的是内置的 sing-box 配置模板，在 sing-box 更新改动了配置格式时（作者经常在只更改 minor 版本号的情况下这么做，上帝保佑）无法及时生产支持新版本的配置文件；[Surgio](https://github.com/surgioproject/surgio) 和 [Sub-Store](https://github.com/sub-store-org/Sub-Store) 看起来不错，但是需要带状态的后端服务，太麻烦了。最后我选择的是 [sing-box-subscribe](https://github.com/Toperlock/sing-box-subscribe)，虽然它的代码写得实在有够乱，但考虑到它能直接部署在 [Vercel](https://vercel.com) 上无状态使用，我也就不苛求太多。

直接用 [`crontab`](https://en.wikipedia.org/wiki/Cron) 解决自动更新问题：

```sh
curl 'https://<VERCEL_SERVICE_URL>/config/<SUBSCRIPTION_URL>&file=https://gist.githubusercontent.com/Hanssen0/0e3eef2400e832d0ee98b46f01f4e23b/raw/sing-box-template.json' > /etc/sing-box/config.json

sing-box check -C /etc/sing-box && systemctl restart sing-box

#0 0 * * * sh /etc/sing-box/sync.sh
```

## 代理链

远端代理服务器我选择了 [`VMess` 协议](https://zh.wikipedia.org/zh-cn/V2Ray) + CDN (+ WebSocket) 的方案，向前置代理隐藏服务器的真实 IP 地址。服务端依然使用 sing-box 搭建，使用 Caddy 反向代理方便配置 TLS 证书。

```json
{
  "dns": {
    "servers": [
      {
        "type": "local",
        "tag": "dns_direct"
      }
    ],
    "final": "dns_direct"
  },
  "inbounds": [
    {
      "listen": "127.0.0.1",
      "listen_port": 9999,
      "tag": "in",
      "type": "vmess",
      "users": [
        {
          "name": "YOUR_USERNAME",
          "uuid": "00000000-0000-0000-0000-000000000000",
          "alterId": 0
        }
      ],
      "transport": {
        "type": "ws",
        "path": "/WEBSOCKET_PATH"
      }
    }
  ],
  "outbounds": [
    {
      "tag": "Direct",
      "type": "direct"
    }
  ],
  "route": {
    "final": "Direct",
    "auto_detect_interface": true,
    "default_domain_resolver": {
      "server": "dns_direct"
    },
    "rules": [
      {
        "ip_is_private": true,
        "action": "reject"
      }
    ]
  }
}
```

```Caddyfile
YOUR_DOMAIN {
	log {
		output stdout
	}

	reverse_proxy /WEBSOCKET_PATH localhost:9999

	root * /etc/caddy/root
	file_server
}
```

需要注意的是，我不希望公开代理服务器的 IP 地址，但依然希望做到自动更新订阅。因此，我使用了服务器更新订阅，而客户端从服务器获取配置的方案。`config_linux.json` 和 `config_android.json` 储存了平台特定的配置，而 `config_common.json` 则保存了代理服务器的信息。因为 HTTPS 请求只会公开域名，而不会公开 URL 路径，将访问密码添加到路径中是相对安全的操作（但不推荐，这是为了让 Android 客户端能直接使用订阅链接）。

```json
// config_linux.json

{
  "experimental": {
    "clash_api": {
      "external_controller": "0.0.0.0:9090",
      "external_ui": "ui",
      "secret": "",
      "external_ui_download_url": "https://gh-proxy.com/https://github.com/Zephyruso/zashboard/archive/refs/heads/gh-pages.zip",
      "external_ui_download_detour": "🚀 节点选择",
      "default_mode": "rule"
    } // Unnecessary on Android
  },
  "inbounds": [
    {
      "tag": "tun-in",
      "type": "tun",
      "address": [
        "172.19.0.0/30",
        "fdfe:dcba:9876::1/126"
      ],
      "auto_route": true,
      "auto_redirect": true, // Remove this on Android
      "strict_route": true
    }
  ]
}
```

```json
// config_common.json

{
  "outbounds": [
    {
      "tag": "🪞 自建节点 - 链式代理",
      "type": "vmess",
      "server": "<YOUR_DOMAIN>",
      "server_port": 443,
      "uuid": "00000000-0000-0000-0000-000000000000",
      "alter_id": 0,
      "tls": {
        "enabled": true
      },
      "transport": {
        "type": "ws",
        "path": "/WEBSOCKET_PATH",
        "headers": {
          "Host": "<YOUR_DOMAIN>"
        }
      },
      "detour": "🔗 链式代理 - 前置"
    }
  ]
}
```

```sh
# Server

curl 'https://<VERCEL_SERVICE_URL>/config/<SUBSCRIPTION_URL>&file=https://gist.githubusercontent.com/Hanssen0/0e3eef2400e832d0ee98b46f01f4e23b/raw/sing-box-template.json' > /etc/sing-box/client/config.json

sing-box merge -c /etc/sing-box/client/config_linux.json -c /etc/sing-box/client/config.json -c /etc/sing-box/client/config_common.json /etc/caddy/root/<SERVER_SECRET>/config_linux.json
sing-box merge -c /etc/sing-box/client/config_android.json -c /etc/sing-box/client/config.json -c /etc/sing-box/client/config_common.json /etc/caddy/root/<SERVER_SECRET>/config_android.json

chown -R caddy:caddy /etc/caddy/root/

#0 23 * * * sh /etc/sing-box/sync.sh
```

```sh
# Client
curl 'https://<YOUR_DOMAIN>/<SERVER_SECRET>/config_linux.json' > /etc/sing-box/config.json

sing-box check -C /etc/sing-box && systemctl restart sing-box

#0 0 * * * sh /etc/sing-box/sync.sh
```

## 自用完整配置模板 - 2025-10-02

Steam 下载和 NTP 服务都是走的直连。

```json
{
  "log": {
    "level": "info",
    "timestamp": true
  },
  "experimental": {
    "cache_file": {
      "enabled": true,
      "store_fakeip": true
    }
  },
  "dns": {
    "servers": [
      {
        "type": "tls",
        "tag": "dns_proxy",
        "server": "8.8.4.4",
        "detour": "🚀 海外网站"
      },
      {
        "type": "udp",
        "tag": "dns_direct",
        "server": "223.5.5.5"
      },
      {
        "type": "fakeip",
        "tag": "dns_fakeip",
        "inet4_range": "198.18.0.0/16",
        "inet6_range": "fc00::/16"
      }
    ],
    "rules": [
      {
        "clash_mode": "Direct",
        "server": "dns_direct",
        "strategy": "prefer_ipv4"
      },
      {
        "query_type": [
          "A",
          "AAAA"
        ],
        "clash_mode": "Global",
        "server": "dns_fakeip",
        "rewrite_ttl": 1
      },
      {
        "clash_mode": "Global",
        "server": "dns_proxy"
      },
      {
        "query_type": [
          "A",
          "AAAA"
        ],
        "server": "dns_fakeip",
        "rewrite_ttl": 1
      }
    ],
    "final": "dns_proxy",
    "strategy": "ipv4_only",
    "independent_cache": true,
    "reverse_mapping": true
  },
  "outbounds": [
    {
      "tag": "✋ 手动切换",
      "type": "selector",
      "outbounds": [
        "{all}",
        "Direct",
        "🪞 自建节点 - 链式代理"
      ]
    },
    {
      "tag": "🚀 节点选择",
      "type": "selector",
      "outbounds": [
        "♻️ 自动选择",
        "Direct",
        "🪞 自建节点 - 链式代理",
        "✋ 手动切换",
        "🛏️ 日常使用",
        "📺 省流节点",
        "👍 高级节点",
        "🇭🇰 香港节点",
        "🇨🇳 台湾节点",
        "🇸🇬 新加坡节点",
        "🇯🇵 日本节点",
        "🇺🇲 美国节点",
        "🇰🇷 韩国节点",
        "❓ 其它节点"
      ]
    },
    {
      "tag": "🔗 链式代理 - 前置",
      "type": "selector",
      "outbounds": [
        "♻️ 自动选择",
        "Direct",
        "🛏️ 日常使用",
        "📺 省流节点",
        "👍 高级节点",
        "🇭🇰 香港节点",
        "🇨🇳 台湾节点",
        "🇸🇬 新加坡节点",
        "🇯🇵 日本节点",
        "🇺🇲 美国节点",
        "🇰🇷 韩国节点",
        "❓ 其它节点",
        "{all}"
      ]
    },
    {
      "tag": "🛑 广告拦截",
      "type": "selector",
      "outbounds": [
        "Block",
        "Direct"
      ]
    },
    {
      "tag": "🎥 YouTube",
      "type": "selector",
      "outbounds": [
        "🚀 节点选择",
        "Direct",
        "🪞 自建节点 - 链式代理",
        "✋ 手动切换",
        "♻️ 自动选择",
        "🛏️ 日常使用",
        "📺 省流节点",
        "👍 高级节点",
        "🇭🇰 香港节点",
        "🇨🇳 台湾节点",
        "🇸🇬 新加坡节点",
        "🇯🇵 日本节点",
        "🇺🇲 美国节点",
        "🇰🇷 韩国节点",
        "❓ 其它节点"
      ]
    },
    {
      "tag": "🎥 F1 TV",
      "type": "selector",
      "outbounds": [
        "🚀 节点选择",
        "Direct",
        "🪞 自建节点 - 链式代理",
        "✋ 手动切换",
        "♻️ 自动选择",
        "🛏️ 日常使用",
        "📺 省流节点",
        "👍 高级节点",
        "🇭🇰 香港节点",
        "🇨🇳 台湾节点",
        "🇸🇬 新加坡节点",
        "🇯🇵 日本节点",
        "🇺🇲 美国节点",
        "🇰🇷 韩国节点",
        "❓ 其它节点"
      ]
    },
    {
      "tag": "🤖 海外 AI",
      "type": "selector",
      "outbounds": [
        "🚀 节点选择",
        "Direct",
        "🪞 自建节点 - 链式代理",
        "✋ 手动切换",
        "♻️ 自动选择",
        "🛏️ 日常使用",
        "📺 省流节点",
        "👍 高级节点",
        "🇭🇰 香港节点",
        "🇨🇳 台湾节点",
        "🇸🇬 新加坡节点",
        "🇯🇵 日本节点",
        "🇺🇲 美国节点",
        "🇰🇷 韩国节点",
        "❓ 其它节点"
      ]
    },
    {
      "tag": "🪙 国内交易所",
      "type": "selector",
      "outbounds": [
        "🚀 节点选择",
        "Direct",
        "🪞 自建节点 - 链式代理",
        "✋ 手动切换",
        "♻️ 自动选择",
        "🛏️ 日常使用",
        "📺 省流节点",
        "👍 高级节点",
        "🇭🇰 香港节点",
        "🇨🇳 台湾节点",
        "🇸🇬 新加坡节点",
        "🇯🇵 日本节点",
        "🇺🇲 美国节点",
        "🇰🇷 韩国节点",
        "❓ 其它节点"
      ]
    },
    {
      "tag": " 全球直连",
      "type": "selector",
      "outbounds": [
        "🚀 节点选择",
        "Direct",
        "🪞 自建节点 - 链式代理",
        "✋ 手动切换",
        "♻️ 自动选择",
        "🛏️ 日常使用",
        "📺 省流节点",
        "👍 高级节点",
        "🇭🇰 香港节点",
        "🇨🇳 台湾节点",
        "🇸🇬 新加坡节点",
        "🇯🇵 日本节点",
        "🇺🇲 美国节点",
        "🇰🇷 韩国节点",
        "❓ 其它节点"
      ]
    },
    {
      "tag": "🚀 海外网站",
      "type": "selector",
      "outbounds": [
        "🚀 节点选择",
        "Direct",
        "🪞 自建节点 - 链式代理",
        "✋ 手动切换",
        "♻️ 自动选择",
        "🛏️ 日常使用",
        "📺 省流节点",
        "👍 高级节点",
        "🇭🇰 香港节点",
        "🇨🇳 台湾节点",
        "🇸🇬 新加坡节点",
        "🇯🇵 日本节点",
        "🇺🇲 美国节点",
        "🇰🇷 韩国节点",
        "❓ 其它节点"
      ]
    },
    {
      "tag": "❤️ 常用端口",
      "type": "selector",
      "outbounds": [
        "🚀 节点选择",
        "Direct",
        "🪞 自建节点 - 链式代理",
        "✋ 手动切换",
        "♻️ 自动选择",
        "🛏️ 日常使用",
        "📺 省流节点",
        "👍 高级节点",
        "🇭🇰 香港节点",
        "🇨🇳 台湾节点",
        "🇸🇬 新加坡节点",
        "🇯🇵 日本节点",
        "🇺🇲 美国节点",
        "🇰🇷 韩国节点",
        "❓ 其它节点"
      ]
    },
    {
      "tag": "🔐 22 端口",
      "type": "selector",
      "outbounds": [
        "🚀 节点选择",
        "Direct",
        "🪞 自建节点 - 链式代理",
        "✋ 手动切换",
        "♻️ 自动选择",
        "🛏️ 日常使用",
        "📺 省流节点",
        "👍 高级节点",
        "🇭🇰 香港节点",
        "🇨🇳 台湾节点",
        "🇸🇬 新加坡节点",
        "🇯🇵 日本节点",
        "🇺🇲 美国节点",
        "🇰🇷 韩国节点",
        "❓ 其它节点"
      ]
    },
    {
      "tag": "🐟 漏网之鱼",
      "type": "selector",
      "outbounds": [
        "🚀 节点选择",
        "Direct",
        "🪞 自建节点 - 链式代理",
        "✋ 手动切换",
        "♻️ 自动选择",
        "🛏️ 日常使用",
        "📺 省流节点",
        "👍 高级节点",
        "🇭🇰 香港节点",
        "🇨🇳 台湾节点",
        "🇸🇬 新加坡节点",
        "🇯🇵 日本节点",
        "🇺🇲 美国节点",
        "🇰🇷 韩国节点",
        "❓ 其它节点"
      ]
    },
    {
      "tag": "🛏️ 日常使用",
      "type": "urltest",
      "outbounds": [
        "{all}"
      ],
      "filter": [
        {
          "action": "include",
          "keywords": [
            "0.[0-5]|低倍率|省流|大流量"
          ]
        },
        {
          "action": "exclude",
          "keywords": [
            "网站|地址|剩余|过期|时间|有效|Traffic|Expire"
          ]
        },
        {
          "action": "exclude",
          "keywords": [
            "🇯🇵|JP|jp|日本|Japan|川日|东京|大阪|泉日|埼玉|沪日|深日"
          ]
        }
      ]
    },
    {
      "tag": "📺 省流节点",
      "type": "urltest",
      "outbounds": [
        "{all}"
      ],
      "filter": [
        {
          "action": "include",
          "keywords": [
            "0.[0-5]|低倍率|省流|大流量"
          ]
        },
        {
          "action": "exclude",
          "keywords": [
            "网站|地址|剩余|过期|时间|有效|Traffic|Expire"
          ]
        }
      ]
    },
    {
      "tag": "👍 高级节点",
      "type": "urltest",
      "outbounds": [
        "{all}"
      ],
      "filter": [
        {
          "action": "include",
          "keywords": [
            "专线|专用|高级|直连|急速|高倍率|IEPL|IPLC|AIA|CTM|CC|iepl|iplc|aia|ctm|cc|AC"
          ]
        },
        {
          "action": "exclude",
          "keywords": [
            "0.[0-5]|低倍率|省流|大流量"
          ]
        }
      ]
    },
    {
      "tag": "♻️ 自动选择",
      "type": "urltest",
      "outbounds": [
        "{all}"
      ],
      "filter": [
        {
          "action": "exclude",
          "keywords": [
            "网站|地址|剩余|过期|时间|有效|Traffic|Expire"
          ]
        }
      ]
    },
    {
      "tag": "🇭🇰 香港节点",
      "type": "urltest",
      "outbounds": [
        "{all}"
      ],
      "filter": [
        {
          "action": "include",
          "keywords": [
            "🇭🇰|HK|hk|港|HongKong"
          ]
        }
      ]
    },
    {
      "tag": "🇨🇳 台湾节点",
      "type": "urltest",
      "outbounds": [
        "{all}"
      ],
      "filter": [
        {
          "action": "include",
          "keywords": [
            "🇹🇼|TW|tw|臺灣|台|Taiwan|新北|彰化"
          ]
        }
      ]
    },
    {
      "tag": "🇸🇬 新加坡节点",
      "type": "urltest",
      "outbounds": [
        "{all}"
      ],
      "filter": [
        {
          "action": "include",
          "keywords": [
            "🇸🇬|SG|sg|坡|狮|Singapore"
          ]
        }
      ]
    },
    {
      "tag": "🇯🇵 日本节点",
      "type": "urltest",
      "outbounds": [
        "{all}"
      ],
      "filter": [
        {
          "action": "include",
          "keywords": [
            "🇯🇵|JP|jp|日本|Japan|川日|东京|大阪|泉日|埼玉|沪日|深日"
          ]
        }
      ]
    },
    {
      "tag": "🇺🇲 美国节点",
      "type": "urltest",
      "outbounds": [
        "{all}"
      ],
      "filter": [
        {
          "action": "include",
          "keywords": [
            "🇺🇸|US|us|美国|美|United States|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥"
          ]
        }
      ]
    },
    {
      "tag": "🇰🇷 韩国节点",
      "type": "urltest",
      "outbounds": [
        "{all}"
      ],
      "filter": [
        {
          "action": "include",
          "keywords": [
            "🇰🇷|KR|Korea|KOR|首尔|韩|韓"
          ]
        }
      ]
    },
    {
      "tag": "❓ 其它节点",
      "type": "selector",
      "outbounds": [
        "{all}"
      ],
      "filter": [
        {
          "action": "exclude",
          "keywords": [
            "🇭🇰|HK|hk|港|HongKong|🇹🇼|TW|tw|臺灣|台|Taiwan|新北|彰化|🇸🇬|SG|sg|坡|狮|Singapore|🇯🇵|JP|jp|日本|Japan|川日|东京|大阪|泉日|埼玉|沪日|深日|🇺🇸|US|us|美国|美|United States|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|🇰🇷|KR|Korea|KOR|首尔|韩|韓"
          ]
        },
        {
          "action": "exclude",
          "keywords": [
            "网站|地址|剩余|过期|时间|有效|Traffic|Expire"
          ]
        }
      ]
    },
    {
      "tag": "Direct",
      "type": "direct",
      "domain_resolver": {
        "server": "dns_direct",
        "strategy": "prefer_ipv4"
      }
    },
    {
      "tag": "Block",
      "type": "block"
    }
  ],
  "route": {
    "final": "🐟 漏网之鱼",
    "auto_detect_interface": true,
    "default_domain_resolver": {
      "server": "dns_direct",
      "strategy": "prefer_ipv4"
    },
    "rules": [
      {
        "action": "sniff"
      },
      {
        "type": "logical",
        "mode": "or",
        "rules": [
          {
            "protocol": "dns"
          },
          {
            "port": 53
          }
        ],
        "action": "hijack-dns"
      },
      {
        "ip_is_private": true,
        "outbound": "Direct"
      },
      {
        "clash_mode": "Direct",
        "outbound": "Direct"
      },
      {
        "clash_mode": "Global",
        "outbound": "🚀 海外网站"
      },
      {
        "rule_set": [
          "geosite-category-ads-all"
        ],
        "outbound": "🛑 广告拦截"
      },
      {
        "rule_set": [
          "geosite-youtube"
        ],
        "outbound": "🎥 YouTube"
      },
      {
        "domain_suffix": [
          "formula1.com"
        ],
        "outbound": "🎥 F1 TV"
      },
      {
        "rule_set": [
          "geosite-category-ai-!cn"
        ],
        "outbound": "🤖 海外 AI"
      },
      {
        "type": "logical",
        "mode": "and",
        "rules": [
          {
            "rule_set": [
              "geosite-binance",
              "geosite-huobi",
              "geosite-okx"
            ]
          },
          {
            "domain": [
              "www.okx.com",
              "web3.okx.com",
              "wallet.okx.com"
            ],
            "invert": true
          }
        ],
        "outbound": "🪙 国内交易所"
      },
      {
        "type": "logical",
        "mode": "and",
        "rules": [
          {
            "rule_set": [
              "geosite-geolocation-cn",
              "geosite-tld-cn",
              "geoip-cn",
              "geosite-steam",
              "geosite-category-ntp"
            ]
          },
          {
            "rule_set": [
              "geosite-google@cn"
            ],
            "domain_suffix": [
              "steampowered.com",
              "steamcommunity.com",
              "steamstatic.com",
              "steamusercontent.com"
            ],
            "invert": true
          }
        ],
        "outbound": "🎯 全球直连"
      },
      {
        "rule_set": [
          "geosite-geolocation-!cn",
          "geosite-tld-!cn"
        ],
        "outbound": "🚀 海外网站"
      },
      {
        "port": [
          80,
          443,
          4950,
          4955,
          6699
        ],
        "outbound": "❤️ 常用端口"
      },
      {
        "port": 22,
        "outbound": "🔐 22 端口"
      }
    ],
    "rule_set": [
      {
        "tag": "geosite-category-ntp",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-category-ntp.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geosite-geolocation-!cn",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-geolocation-!cn.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geosite-tld-!cn",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-tld-!cn.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geosite-category-ads-all",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-category-ads-all.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geosite-youtube",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-youtube.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geosite-category-ai-!cn",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-category-ai-!cn.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geosite-binance",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-binance.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geosite-huobi",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-huobi.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geosite-okx",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-okx.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geosite-google@cn",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-google@cn.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geosite-geolocation-cn",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-geolocation-cn.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geosite-tld-cn",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-tld-cn.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geoip-cn",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geoip/raw/refs/heads/rule-set/geoip-cn.srs",
        "download_detour": "🚀 海外网站"
      },
      {
        "tag": "geosite-steam",
        "type": "remote",
        "format": "binary",
        "url": "https://github.com/SagerNet/sing-geosite/raw/refs/heads/rule-set/geosite-steam.srs",
        "download_detour": "🚀 海外网站"
      }
    ]
  }
}
```