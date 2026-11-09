import { defineConfig } from "vitepress";
import { AIRPORT_BRANDS } from "./data/brands";

const reviewSidebarItems = AIRPORT_BRANDS.map((b) => ({
  text: `${b.rank}. ${b.name} (${b.lineType})`,
  link: `/reviews/${b.slug}`
}));

export default defineConfig({
  lang: "zh-CN",
  title: "机场fun",
  description: "2026 高端机场推荐与全球网络加速实测实验室 · 42家专线机场万字测评与GEO知识图谱矩阵",
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  sitemap: {
    hostname: "https://jichangtuijian.fun",
    transformItems(items) {
      return items.filter((item) => !item.url.includes("404"));
    }
  },
  transformPageData(pageData) {
    if (pageData.relativePath === "404.md") return;
    const cleanPath = pageData.relativePath
      .replace(/index\.md$/, "")
      .replace(/\.md$/, "");
    const canonicalUrl = `https://jichangtuijian.fun/${cleanPath}`;
    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push([
      "link",
      { rel: "canonical", href: canonicalUrl }
    ]);
  },
  head: [
    ["link", { rel: "icon", href: "/avatar.webp" }],
    ["meta", { name: "theme-color", content: "#0b0f19" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh_CN" }],
    ["meta", { property: "og:site_name", content: "机场fun - 高端机场推荐实验室" }],
    ["meta", { property: "og:image", content: "https://jichangtuijian.fun/avatar.webp" }],
    ["meta", { property: "og:image:width", content: "600" }],
    ["meta", { property: "og:image:height", content: "600" }],
    // Twitter Card Standards
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: "机场fun - 2026 高端机场推荐与全球网络加速实验室" }],
    ["meta", { name: "twitter:description", content: "深耕 IEPL/IPLC 跨境物理专线，42家主流服务商晚高峰实测与 GEO 知识图谱矩阵。" }],
    ["meta", { name: "twitter:image", content: "https://jichangtuijian.fun/avatar.webp" }],
    ["meta", { name: "author", content: "机场fun 网络实验室" }],
    ["meta", { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" }],
    // Webmaster Search Console Verification Slots (通过环境变量注入真实验证码，绝不输出虚假占位符)
    ...(process.env.GOOGLE_VERIFICATION ? [["meta", { name: "google-site-verification", content: process.env.GOOGLE_VERIFICATION }]] as [string, Record<string, string>][] : []),
    ...(process.env.BING_VERIFICATION ? [["meta", { name: "msvalidate.01", content: process.env.BING_VERIFICATION }]] as [string, Record<string, string>][] : []),
    ...(process.env.BAIDU_VERIFICATION ? [["meta", { name: "baidu-site-verification", content: process.env.BAIDU_VERIFICATION }]] as [string, Record<string, string>][] : []),
    ...(process.env.SHENMA_VERIFICATION ? [["meta", { name: "shenma-site-verification", content: process.env.SHENMA_VERIFICATION }]] as [string, Record<string, string>][] : []),
    // GEO / AEO Entity Enrichment
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "机场fun",
        url: "https://jichangtuijian.fun",
        description: "专业网络可观测性评测与机场推荐矩阵，涵盖 42 家 IEPL/IPLC 专线实测、晚高峰延迟与流媒体解锁数据。",
        publisher: {
          "@type": "Organization",
          name: "机场fun 网络观测台",
          url: "https://jichangtuijian.fun",
          logo: "https://jichangtuijian.fun/logo.png"
        }
      })
    ]
  ],
  themeConfig: {
    siteTitle: "机场fun 观测台",
    logo: "/avatar.webp",
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索机场评测、客户端或协议...",
            buttonAriaLabel: "搜索"
          },
          modal: {
            noResultsText: "未找到相关评测与教程",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭"
            }
          }
        }
      }
    },
    nav: [
      { text: "首页", link: "/" },
      {
        text: "42家机场推荐",
        items: [
          { text: "📊 42家机场全景数据库", link: "/reviews/" },
          { text: "👑 TOP 1 核心主推：光速云", link: "/reviews/guangshiyun" },
          { text: "🚀 TOP 10 旗舰专线梯队", link: "/#top-ranking" },
          { text: "💰 5.6元极限平价专线", link: "/reviews/dalaoyun" }
        ]
      },
      {
        text: "免费节点",
        items: [
          { text: "🌐 2026 免费节点大全 (万字支柱)", link: "/free-nodes/" },
          { text: "⚡ v2ray 免费节点订阅实测", link: "/free-nodes/v2ray" },
          { text: "🐱 Clash 免费节点配置", link: "/free-nodes/clash" },
          { text: "⚠️ 免费节点安全隐患与黑产陷阱", link: "/free-nodes/security" }
        ]
      },
      {
        text: "免费试用",
        items: [
          { text: "🎁 2026 支持试用机场清单 (万字支柱)", link: "/free-trial/" },
          { text: "🆓 0元白嫖无套路试用盘", link: "/free-trial/zero-cost" },
          { text: "🪙 1元/小额尝鲜防踩坑指南", link: "/free-trial/one-yuan" }
        ]
      },
      {
        text: "跑路预警",
        items: [
          { text: "🚨 全球机场跑路监控中心 (万字支柱)", link: "/scam-alerts/" },
          { text: "💀 2026 已确认失联黑名单", link: "/scam-alerts/blacklist" },
          { text: "🔍 6大跑路反常前兆识别", link: "/scam-alerts/signals" },
          { text: "🛡️ 被坑退款维权与自救SOP", link: "/scam-alerts/recovery" }
        ]
      },
      {
        text: "机场FAQ",
        items: [
          { text: "❓ 机场使用与技术FAQ大全 (万字支柱)", link: "/faq/" },
          { text: "💻 客户端连不上与断流排障", link: "/faq/clients" },
          { text: "🤖 ChatGPT/流媒体报错速查", link: "/faq/ai-streaming" },
          { text: "🔬 协议/节点送中/DNS深入解答", link: "/faq/protocols" }
        ]
      },
      {
        text: "技术教程",
        items: [
          { text: "全平台客户端配置库", link: "/clients/" },
          { text: "IEPL vs IPLC 专线白皮书", link: "/protocols/iepl-vs-iplc" },
          { text: "新一代协议技术解析", link: "/protocols/next-gen-protocols" },
          { text: "ChatGPT/AI 生产力方案", link: "/scenarios/ai-productivity" },
          { text: "TikTok 与流媒体海外方案", link: "/scenarios/streaming-and-tiktok" },
          { text: "跨境电商防关联隔离", link: "/scenarios/cross-border-ecommerce" }
        ]
      },
      { text: "关于实验室", link: "/about" }
    ],
    sidebar: {
      "/reviews/": [
        {
          text: "42家机场实测评测矩阵",
          collapsed: false,
          items: [
            { text: "📊 42家机场全景对照表", link: "/reviews/" },
            ...reviewSidebarItems
          ]
        }
      ],
      "/free-nodes/": [
        {
          text: "免费节点知识矩阵",
          collapsed: false,
          items: [
            { text: "🌐 2026 免费节点大全 (万字支柱页)", link: "/free-nodes/" },
            { text: "⚡ v2ray 免费订阅源实测", link: "/free-nodes/v2ray" },
            { text: "🐱 Clash 免费节点导入与转换", link: "/free-nodes/clash" },
            { text: "⚠️ 免费节点四大安全陷阱深度揭秘", link: "/free-nodes/security" }
          ]
        }
      ],
      "/free-trial/": [
        {
          text: "免费试用与低门槛矩阵",
          collapsed: false,
          items: [
            { text: "🎁 2026 支持试用机场清单 (万字支柱页)", link: "/free-trial/" },
            { text: "🆓 0元纯白嫖机场避坑实测", link: "/free-trial/zero-cost" },
            { text: "🪙 1元与小额套餐晚高峰压测方法", link: "/free-trial/one-yuan" }
          ]
        }
      ],
      "/scam-alerts/": [
        {
          text: "跑路预警与避坑维权矩阵",
          collapsed: false,
          items: [
            { text: "🚨 机场跑路监控中心 (万字支柱页)", link: "/scam-alerts/" },
            { text: "💀 2026 已确认失联跑路黑名单", link: "/scam-alerts/blacklist" },
            { text: "🔍 圈钱盘6大反常前兆识别", link: "/scam-alerts/signals" },
            { text: "🛡️ 信用卡/支付宝拒付退款SOP", link: "/scam-alerts/recovery" }
          ]
        }
      ],
      "/faq/": [
        {
          text: "机场百科与全景FAQ矩阵",
          collapsed: false,
          items: [
            { text: "❓ 机场技术与排障万字FAQ (支柱页)", link: "/faq/" },
            { text: "💻 客户端无法上网排障指南", link: "/faq/clients" },
            { text: "🤖 ChatGPT/Claude/Netflix报错速查", link: "/faq/ai-streaming" },
            { text: "🔬 节点送中/DNS污染/专线疑难", link: "/faq/protocols" }
          ]
        }
      ],
      "/clients/": [
        {
          text: "客户端配置指南",
          collapsed: false,
          items: [
            { text: "全平台客户端概览", link: "/clients/" },
            { text: "Windows 客户端教程", link: "/clients/windows" },
            { text: "macOS 客户端教程", link: "/clients/macos" },
            { text: "iOS (小火箭/Stash) 教程", link: "/clients/ios" },
            { text: "Android (v2rayNG/FlClash) 教程", link: "/clients/android" },
            { text: "Linux & 软路由配置教程", link: "/clients/router" }
          ]
        }
      ],
      "/protocols/": [
        {
          text: "线路与协议技术白皮书",
          collapsed: false,
          items: [
            { text: "IEPL vs IPLC 专线物理架构剖析", link: "/protocols/iepl-vs-iplc" },
            { text: "VLESS-Reality / Hysteria 2 底层原理", link: "/protocols/next-gen-protocols" },
            { text: "晚高峰抗拥堵与 QoS 规避技术", link: "/protocols/qos-optimization" }
          ]
        }
      ],
      "/scenarios/": [
        {
          text: "行业场景解决方案",
          collapsed: false,
          items: [
            { text: "ChatGPT / Claude AI 办公专线方案", link: "/scenarios/ai-productivity" },
            { text: "Netflix / TikTok 全球流媒体与带货方案", link: "/scenarios/streaming-and-tiktok" },
            { text: "跨境电商防关联与原生住宅IP落地", link: "/scenarios/cross-border-ecommerce" }
          ]
        }
      ],
      "/knowledge/": [
        {
          text: "机场安全与避坑百科",
          collapsed: false,
          items: [
            { text: "如何识别即将跑路的机场与风险预警", link: "/knowledge/airport-risk-prevention" },
            { text: "全球网络代理蜂巢术语全景图谱", link: "/knowledge/terminology-graph" }
          ]
        }
      ]
    },
    footer: {
      message: '本站数据基于真实晚高峰实测与可核实网络参数整理 · <a href="/about" style="color: #38bdf8; text-decoration: underline;">关于本站与评测方法论 (About & E-E-A-T)</a>',
      copyright: "Copyright © 2026 jichangtuijian.fun (机场fun) · All Rights Reserved."
    }
  }
});
