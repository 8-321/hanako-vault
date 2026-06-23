---
name: kel-self-distillation
description: "Use this skill whenever kel explicitly asks to 蒸馏我, 蒸馏本人, 根据聊天记录理解我, 从我的想法和记录里提炼我, 生成我的个人模型, 建立我的长期画像, 把我的微信聊天记录/Vault/日记/项目记录沉淀成自我模型, or asks Hanako to understand kel from her own records. This skill is for evidence-based self-distillation of kel herself, using chat logs and local records, with strict privacy, local-only processing, confidence labels, and no unsupported psychological diagnosis."
---

# Kel Self Distillation

从 kel 的微信聊天记录、本地想法记录、Vault、项目文档、日记/复盘中，基于证据蒸馏 kel 本人。

目标不是写空泛人格介绍，而是建立一个可被 Hanako 长期使用、持续更新、可追溯的“kel 本人模型”。

## Core Goal

蒸馏出：

- kel 是谁：身份、自我叙事、长期角色
- kel 关心什么：长期主题、反复项目、内容方向
- kel 怎么判断：价值标准、审美标准、技术选择标准
- kel 怎么行动：任务节奏、工作流、学习方式、工具偏好
- kel 怎么表达：语言风格、沟通偏好、厌恶点
- kel 怎么被支持：什么回应有效、什么回应会失效
- kel 的长期系统：Hanako、Vault、AI Agent、公众号、项目生态
- 可沉淀内容：memory、skill、Vault 文档、个人操作系统规则

## Non-Negotiable Safety Rules

1. **本地优先**：默认不上传聊天记录、日记、Vault、图片、联系人、数据库。
2. **只读优先**：先索引和抽样，不修改原始文件。
3. **证据优先**：每个结论尽量标注来源类型，如“聊天记录/日记/Vault/项目文件/多源一致”。
4. **置信度分层**：用高/中/低置信度，不把单条记录过度概括成本质。
5. **不做诊断**：不要给心理疾病、人格障碍、医学判断。
6. **保护第三方**：不要暴露聊天对象隐私，必要时匿名化为“朋友A/同学B/项目伙伴”。
7. **区分事实与解释**：事实是记录里明确出现的内容；解释是从多条记录中归纳出的模式。
8. **允许不确定**：材料不足时说“不足以判断”。
9. **不写进 skill 的隐私**：skill 只保存方法，私人内容应写入受控 Vault 或由用户确认后写 memory。

## Material Sources

优先盘点：

- `E:/1/xwechat_files`
- `E:/腾讯电脑管家软件搬家/C盘清理文件搬家/微信聊天文件搬家`
- `E:/KelWorkspace`
- `E:/KelWorkspace/Chats`
- `E:/KelWorkspace/Projects`
- `D:/BELLA KE/项目AI/调教AI/HanakoVault`
- `D:/BELLA KE/项目AI/调教AI/HanakoVault/00-Inbox`
- `D:/BELLA KE/项目AI/调教AI/HanakoVault/10-Projects`
- 已有 memory 与 pinned memories

可扩展来源：

- 日记
- 公众号草稿
- 运营复盘
- 项目 README
- 提示词库
- 桌面工具项目文档
- 对话导出

## Workflow

### Phase 1: Build Source Map

先生成材料源地图，不急着画像。

输出：

```markdown
# Kel 材料源地图

## 微信聊天记录
## Hanako 对话/导出
## Vault/Obsidian
## KelWorkspace 项目
## 日记/复盘
## 公众号/内容草稿
## 技术与产品项目
## 可读性状态
## 隐私风险
```

每个来源记录：路径、文件类型、数量、大致主题、时间跨度、可读性、是否需要解密。

### Phase 2: Extract Evidence Units

从材料中抽取“证据单元”，不要一上来写结论。

证据单元格式：

```markdown
- 来源：Vault / 微信 / 项目 / 日记 / 对话
- 时间：YYYY-MM-DD 或未知
- 类型：事实 / 偏好 / 纠偏 / 项目 / 情绪 / 关系 / 审美 / 工作流
- 摘要：一句话
- 原文敏感度：低/中/高
```

高敏感原文只摘要，不复述。

### Phase 3: Cluster into Self Model Axes

按轴聚类：

1. **身份轴**：学生、创作者、AI Agent 构建者、公众号运营者、项目实践者等。
2. **主题轴**：AI Agent、Hanako、多模型、Vault、自动化、内容创作、审美、产品、学业项目。
3. **价值轴**：独立判断、反套路、长期主义、可验证、具体落地、反模板。
4. **审美轴**：极简、留白、低饱和、东方沉静、反网红、品牌感、深色悬浮等。
5. **行动轴**：先做可用版本、持续迭代、强执行、疲惫时授权助手自主处理。
6. **沟通轴**：讨厌敷衍、流水账、空话；喜欢直接、具体、有判断、有温度。
7. **风险轴**：数据丢失敏感、误删恐惧、隐私边界、不可逆操作需确认。
8. **关系轴**：陪伴需求、信任建立方式、对 AI 助手的期待。
9. **系统轴**：Hanako、含系列、多 agent、Vault、公众号、项目生态之间的连接。

### Phase 4: Write Distillation Report

默认输出结构：

```markdown
# Kel 本人蒸馏报告

## 0. 可信度说明
## 1. 一句话画像
## 2. 身份与自我叙事
## 3. 长期主题
## 4. 做事方式
## 5. 判断标准
## 6. 审美系统
## 7. 沟通偏好
## 8. 有效支持方式
## 9. 关系与情绪模式
## 10. 风险与边界
## 11. 项目生态地图
## 12. 可沉淀到 memory 的事实
## 13. 可沉淀成 skill 的流程
## 14. 可写入 Vault 的长期文档
## 15. 不确定与待验证
```

每个重要结论加证据标记：

- `[高置信：多源一致]`
- `[中置信：多次出现]`
- `[低置信：单一材料]`

### Phase 5: Turn into Operational Assets

蒸馏报告不是终点。继续拆成可用资产：

1. **Memory 候选**：稳定事实和长期偏好。
2. **Skill 候选**：反复任务和固定工作流。
3. **Vault 文档**：长期系统、项目地图、自我说明书。
4. **Hanako 行为规则**：以后如何回应 kel。
5. **风险清单**：哪些操作必须确认。

不要自动写入 pinned memory，除非 kel 明确说“记住”。

## Output: Memory Candidate Format

```markdown
# Memory 候选

| 内容 | 来源 | 置信度 | 是否建议记忆 | 理由 |
|---|---|---|---|---|
```

## Output: Skill Candidate Format

```markdown
# Skill 候选

| Skill 名称 | 触发场景 | 材料来源 | 可复用流程 | 优先级 |
|---|---|---|---|---|
```

## Output: Vault Document Suggestions

```markdown
# Vault 文档建议

## 建议新建
- `个人操作系统/Kel 本人模型.md`
- `个人操作系统/Hanako 如何支持 Kel.md`
- `项目地图/AI Agent 生态.md`
- `审美系统/视觉偏好与反感清单.md`

## 建议更新
- 入口页
- 项目总策划
- 想法同步规则
```

## Communication Style to Kel

说清楚：

- “我会基于记录，不凭空写你。”
- “我会分清事实和解释。”
- “高敏感内容只抽象，不复述。”
- “结果会标置信度。”
- “不自动写入记忆，除非你确认。”

## Common Pitfalls

- 不要再误解成蒸馏 Hanako。
- 不要再误解成只蒸馏流程。
- 不要只写人格美文，要写可操作模型。
- 不要把单次情绪当长期人格。
- 不要泄露第三方聊天对象。
- 不要跳过材料源地图直接下结论。

## First Response Pattern

当 kel 说“蒸馏我本人”时：

“我按本人蒸馏来做。材料是你的微信聊天记录、本地想法记录、Vault、项目文档。先只读盘点材料源，再抽证据单元，最后生成带置信度的本人模型、memory 候选、skill 候选和 Vault 文档建议。”
