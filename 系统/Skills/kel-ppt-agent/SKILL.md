---
name: kel-ppt-agent
description: Use when Kel/BELLA KE wants to create, rebuild, critique, or operate a PPT/slide agent; generate PPT outlines, image prompts, fact checks, slide visuals, or export plans from real materials; adapt SlideFlow/image2.fun-style workflows into Kel's own brand with strong narrative spine, restrained aesthetics, and no hardcoded secrets.
---

# Kel PPT Agent

把 PPT 生成从“套模板出图”改成 Kel 的表达操作系统：先找主线，再核事实，再逐页生成，最后导出可用的 PPT。

当用户说“做 PPT agent”“生成 PPT”“帮我做一套演示”“把素材变成 PPT”“图片提示词”“SlideFlow”“image2.fun”“复刻这个 PPT 生成器”时使用本 skill。

## Core Principle

每套 PPT 只抓一条主线：

> 真实问题 × 结构洞察 × AI 实验 × 可验证证据 × 下一步行动

Kel 的品牌不是“会用 AI 的人”，而是“把 AI 接进生活、认知、表达和行动系统的人”。PPT agent 要服务这个身份：复杂问题讲清楚，抽象概念落到行动，视觉高级但不模板。

必要时读取：

- `references/brand-dna.md`：Kel/BELLA KE 的品牌主线、哲学/社会学/心理学底层
- `references/prompt-system.md`：SlidePlan、事实核查、8 段式提示词、单页优化模板

## Workflow

### 1. Intake

先判断输入类型，不要为了流程感问太多：

- `raw_material`：文档、网页、Markdown、聊天记录、口述素材
- `topic`：只有一个主题
- `reference_app`：用户给了一个网页或竞品，希望复刻/二创
- `template_or_style`：用户给了模板、截图、风格词
- `agent_build`：用户要做一个 PPT agent/skill/工作流

如果缺关键信息，最多问 3 个问题：

1. 这套 PPT 要给谁看？
2. 你希望它最终说服对方相信哪一句话？
3. 页数和输出形式要图片版、可编辑版，还是先只要 prompt/大纲？

能合理推断时直接推进。

### 2. Build the Spine

先产出一条 `NarrativeSpine`，再写大纲。

```json
{
  "audience": "受众",
  "one_sentence_claim": "这套 PPT 最终要让人相信的一句话",
  "tension": "现实矛盾/问题",
  "method": "解决路径或 AI 实验",
  "evidence_needed": ["必须核查的数据、图片、案例或来源"],
  "next_action": "看完之后要采取的行动"
}
```

Kel 版本的判断标准：

- 有真实问题，不是空泛主题
- 有结构洞察，不是堆信息
- 有个人体感或实践痕迹，不是工具搬运
- 有可验证证据，不编造 Logo、数据、人物、案例
- 有下一步行动，不停在漂亮页面

### 3. Generate SlidePlan

输出 `SlidePlan[]`，每页只使用这些字段：

```json
{
  "t": "页面标题",
  "y": "cover | toc | divider | data | chart | compare | table | product | feature | pricing | mockup | arch | timeline | roadmap | process | scene | team | quote | case | contact | faq | ending",
  "p": ["页面上直接展示的完整文字"],
  "v": "画面上有什么，只写视觉与场景，不写排版细节",
  "n": "设计备注：字体、强调、留白、可读性、审美护栏",
  "bg": "背景/场景短句，12-60字",
  "img": { "photo": false, "ref": false, "ai": true },
  "fact": "none | recommended | critical"
}
```

规则：

- 第一页必须是 `cover`，最后一页必须是 `ending`
- 每页 `p` 都是可直接放进 PPT 的完整句，不要只写关键词
- 默认中等信息密度：每页 3-5 条
- 如果用户要“高级感”，优先减少装饰、增加留白、提高标题权重
- 禁止把所有页做成圆角卡片网格

### 4. Fact Check Before Images

生成图片前先列出需要真实资料的页，避免模型编造。

重点拦截：

- 人物、团队、头像、履历
- Logo、客户、合作伙伴、证书、二维码
- 产品截图、真实界面、实物图
- 市场规模、财务、价格、增长率、排名
- 时间线、案例、引用、法律/医疗/金融信息

输出：

```json
[
  {
    "page": 3,
    "severity": "critical",
    "reason": "需要真实产品截图，否则会生成假界面",
    "needed": ["产品截图", "功能名称"],
    "fallback": "改成概念流程图，不展示具体截图"
  }
]
```

如果用户没有资料，可给两条路：补资料，或改成概念示意页。

### 5. Assemble Image Prompts

每页提示词使用 8 段式，但加入 Kel 的护栏：

1. 一张 PPT 页面，16:9 或用户指定比例
2. 色调：从素材和品牌判断，默认克制、低饱和、留白
3. 画风锚点：必须稳定，不要每页乱跳
4. 背景：来自 `bg`
5. PPT 定位：由 `y` 映射
6. 内容展示方向：由页面类型决定
7. 要求展示内容：原样灌入 `t + p + v + n`
8. 事实与审美护栏：不编造真实资料；文字清晰；不拥挤；不使用无意义霓虹光球、炫光、高噪点、模板化圆角卡片

如果是 Kel 自有品牌内容，默认风格：

- 东方沉静、低饱和自然光、克制留白
- 可混入轻量深色、毛玻璃，但不能变成模板化玻璃卡片
- 真实、野生、有行动感，避免网红滤镜和 AI 味

### 6. Generate or Hand Off

根据环境选择：

- 已有本地 PPT 后端：可使用 `http://127.0.0.1:8787/api/models`、`/api/llm`、`/api/image`
- 没有后端：先交付 `NarrativeSpine + SlidePlan + FactCheck + ImagePrompts`
- 用户要真正导出：优先图片版；需要微调时做可编辑混合版

安全规则：

- 不在 skill、脚本、项目文件里写 API key、token、cookie、密钥
- 使用环境变量、本地后端配置或用户已有模型通道
- 从参考文件迁移时必须删除硬编码密钥

### 7. Review and Iterate

逐页检查：

- 主线是否还在
- 事实是否可靠
- 文字是否可读
- 页面是否拥挤
- 是否出现模板化圆角卡片、无意义装饰、AI 味过重
- 封面标题是否有足够权重

用户批评“丑”“AI 味”“不高级”时，不做小修小补；直接重建视觉规则和该页提示词。

### 8. Export

两种模式：

- 图片版：每页 PNG/SVG 满铺，最快交付
- 可编辑混合版：图片底图 + 可编辑标题/要点/关键数字

导出前给用户一个简短清单：

- 页数
- 输出模式
- 需补真实资料的页
- 已生成/待生成页面
- 交付路径

## Reference App Notes

参考的 An-PPT/SlideFlow 类产品可借鉴：

- 输入、大纲、事实核查、生成、优化、导出的闭环
- 本地后端模型列表与图片生成接口
- 项目历史记录
- 单页参数可编辑
- 用户一句话改图后转成图片模型优化词

Kel 版本必须二创：

- 从“生成器”升级为“表达代理”
- 从“风格库”升级为“品牌 DNA + 审美护栏”
- 从“漂亮页面”升级为“事实可信、主线清楚、可行动”
- 从“复制模板”升级为“真实素材的结构化转译”
