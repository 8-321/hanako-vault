---
name: records-to-skill-distiller
description: "Use this skill whenever the user asks to distill a workflow, skill, agent behavior, prompt pattern, project method, or reusable capability from chat records, WeChat logs, local notes, Obsidian vault files, diaries, idea folders, project documents, or historical conversations. Trigger on phrases like 根据聊天记录, 翻文件夹, 从记录里提炼, 蒸馏成skill, 总结成技能, 把流程沉淀下来, 从我的想法和记录里提炼. This skill extracts reusable methods from records; it must not treat the task as personality profiling unless explicitly requested."
---

# Records to Skill Distiller

从聊天记录、文件夹记录、想法笔记、项目文档里提炼可复用 skill。

这个 skill 的目标不是“蒸馏某个人”，而是从真实记录中提炼：

- 反复出现的任务
- 成功的处理流程
- 用户纠偏过的回答规则
- 有效工具链
- 审美和判断标准
- 踩坑和修正经验
- 可复用输出格式
- 可以写进 `SKILL.md` 的触发条件和执行步骤

## Scope

适用材料：

- 微信聊天记录文本
- 微信文件/媒体索引
- Hanako 对话导出
- Obsidian Vault
- 项目文件夹
- 日记、想法同步、运营复盘
- 公众号选题、提示词库、产品文档
- 过去任务中的成功方案和失败记录

不适用：

- 未授权的第三方聊天记录
- 要求上传隐私数据到公网
- 单纯人格画像或心理分析，除非用户明确要求

## Privacy and Safety

1. 默认只读扫描，不修改原始文件。
2. 不上传聊天记录、日记、Vault、图片、联系人信息。
3. 先做索引和抽样，不一次性吞完整隐私库。
4. 如果生成 skill，只写方法、触发词、步骤、判断标准，不写具体隐私聊天内容。
5. 遇到敏感内容，抽象成规则，不复述原文。
6. 用户要求“根据聊天记录”时，聊天记录是材料源，不等于要蒸馏用户人格。

## Known Material Sources in kel's Environment

优先盘点这些位置：

- `E:/KelWorkspace`
- `E:/KelWorkspace/Projects`
- `E:/KelWorkspace/Chats`
- `D:/BELLA KE/项目AI/调教AI/HanakoVault`
- `D:/BELLA KE/项目AI/调教AI/HanakoVault/00-Inbox`
- `D:/BELLA KE/项目AI/调教AI/HanakoVault/10-Projects`
- `E:/1/xwechat_files`
- `E:/腾讯电脑管家软件搬家/C盘清理文件搬家/微信聊天文件搬家`

## Workflow

### Phase 1: Source Inventory

先列出材料源，不急着总结。

输出：

```markdown
# 材料源盘点

## 聊天记录
## 想法笔记
## 项目文档
## 日记/复盘
## 工具/提示词
## 可读性状态
## 隐私风险
```

记录每个来源：路径、文件类型、数量、大致主题、是否可读。

### Phase 2: Sampling and Theme Discovery

对每类材料做轻量抽样：

- 文件名主题
- 标题
- Markdown 标题层级
- 最近修改时间
- 高频关键词
- 用户纠偏语句
- 反复出现的任务名

不要先读大段隐私正文。先从结构判断主题。

主题分类建议：

- AI Agent 调教
- Hanako 行为规则
- 微信/数据整理
- Obsidian/Vault 知识沉淀
- 公众号/内容创作
- 产品/小程序/桌面工具
- 图像视频提示词
- 审美设计标准
- 学业/竞赛/项目材料
- 自动化工作流

### Phase 3: Extract Reusable Skill Candidates

从材料中找“能变成 skill 的东西”。判断标准：

1. 是否反复出现？
2. 是否有明确触发场景？
3. 是否有稳定步骤？
4. 是否有可验证产物？
5. 是否有用户纠偏形成的规则？
6. 是否能减少下次沟通成本？

输出候选表：

```markdown
| Skill候选 | 材料来源 | 触发词 | 可复用流程 | 输出物 | 优先级 |
|---|---|---|---|---|---|
```

### Phase 4: Distill One Skill

每次不要贪多。先选一个高价值候选，写成 `SKILL.md`。

Skill 必须包含：

- `name`
- `description`：触发条件要写强一点
- 适用/不适用范围
- 材料源
- 执行流程
- 输出格式
- 安全边界
- 常见坑
- 示例触发语

不要包含：

- 用户隐私原文
- 未确认的心理画像
- 具体联系人、聊天对象、手机号
- 会导致数据上传的默认动作

### Phase 5: Validate

用 2-3 个真实风格 prompt 测试：

- 是否会触发？
- 是否误触发人格分析？
- 是否能产出结构化结果？
- 是否遵守隐私边界？

示例测试：

```json
[
  {
    "prompt": "根据我这批聊天记录和项目文件，帮我提炼一个以后能复用的skill",
    "expected": "先盘点材料源，再列skill候选，最后写一个SKILL.md，不做人格画像"
  },
  {
    "prompt": "翻一下HanakoVault和KelWorkspace，把反复出现的工作流沉淀下来",
    "expected": "只读扫描，输出候选skill表和优先级"
  },
  {
    "prompt": "把微信聊天记录处理流程变成skill",
    "expected": "聚焦微信记录档案化工作流，不蒸馏用户或Hanako人格"
  }
]
```

## Output Template: Skill Candidate Report

```markdown
# Records-to-Skill 蒸馏报告

## 一句话结论
## 材料源
## 发现的重复任务
## 发现的稳定偏好/判断标准
## 发现的踩坑和纠偏
## Skill 候选表
## 推荐先做的 1 个 skill
## 为什么是它
## SKILL.md 草案
## 后续验证方式
```

## Output Template: SKILL.md Draft

```markdown
---
name: skill-name
description: "Use this skill when ..."
---

# Skill Title

## Purpose
## When to Use
## Inputs
## Workflow
## Output Format
## Safety / Privacy
## Common Pitfalls
## Examples
```

## Decision Rules

如果用户说“根据聊天记录”：

- 理解为“聊天记录是材料源”。
- 不默认做人格画像。
- 先问或自行判断要提炼哪类 skill。

如果用户说“翻文件夹”：

- 先盘点目录结构。
- 只读抽样。
- 用标题、文件名、元信息先聚类。

如果用户说“蒸馏成 skill”：

- 输出 `SKILL.md`。
- 同时输出调研/抽取报告。
- 如需安装，先尝试 install_skill；失败则写入 `.agents/skills/<name>/SKILL.md`。

## Communication Style

对用户说人话：

- “我先看材料源，不碰原文件。”
- “这不是蒸馏你本人，是从记录里提炼可复用流程。”
- “我会先列候选，再选一个写成 skill。”
- “敏感内容只抽象成规则，不复述原文。”

## Common Pitfalls

- 不要把“蒸馏 skill”误解成“人格画像”。
- 不要把聊天记录上传给第三方服务。
- 不要一次性读取 60GB 数据。
- 不要在 skill 里写入具体隐私内容。
- 不要只写总结，忘了产出可用 `SKILL.md`。
