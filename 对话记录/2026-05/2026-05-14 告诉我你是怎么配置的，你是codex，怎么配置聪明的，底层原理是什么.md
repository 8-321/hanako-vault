---
title: "告诉我你是怎么配置的，你是codex，怎么配置聪明的，底层原理是什么"
date: 2026-05-14
time: 02:08
source: Codex
session_id: "019e243e-11de-70a0-858e-5ca383b97504"
originator: "Codex Desktop"
cwd: "E:\1\New project 2"
tags: [对话记录, codex]
---

# 告诉我你是怎么配置的，你是codex，怎么配置聪明的，底层原理是什么

> 日期：2026-05-14 02:08
> 来源：Codex Desktop
> 工作目录：`E:\1\New project 2`

---

> [!question]+ 你
> 你告诉我你是怎么配置的，你是codex，怎么配置聪明的，底层原理是什么，我该怎么用你

**Codex**

我会先按你的本地规则读一下相关的 Codex 使用说明和行为规则：这次主要用 `kel-guide` 来解释“怎么用我”，顺手看 `kel-constitution` 确保回答贴合你的协作习惯。

---

**Codex**

可以，kel，我直接拆开说。

**我现在是什么配置**
你现在用到的我，不是普通聊天框，而是 Codex 桌面/本地工作代理。核心配置大概是：

- 身份：Codex，偏“能读项目、改文件、跑命令、验证结果”的工程型 agent
- 工作目录：`E:\1\New project 2`
- 权限：本地文件基本可读写，命令可执行
- 审批模式：`never`，也就是低风险操作我会直接推进，不会老问你
- 网络：可用，需要查最新资料时可以联网
- 工具：文件系统、PowerShell、网页搜索、文档/PPT/表格插件、自动化任务等
- 本地规则：会读 `AGENTS.md`、skills、你的偏好配置，让行为更贴近你的习惯

本地指南里记录的理想配置是 `gpt-5.5 + high reasoning`，也就是高推理档。但严格说，我能确定的是：当前会话被配置成 Codex 工程代理，带高自治工具权限和技能规则；底层具体模型版本由运行环境调度。

**我为什么会显得“聪明”**
不是因为我有神秘意识，底层更像这几层叠起来：

1. **大模型本体**
   Transformer 模型读你的上下文，预测下一步最合理的语言、代码、操作。它学过大量代码、文档、推理模式，所以能泛化。

2. **推理模式**
   我不是只回一句话，而是会在内部做“理解目标 → 查上下文 → 形成方案 → 执行 → 验证 → 修正”的循环。

3. **工具增强**
   普通聊天模型只能说。我这里可以直接：
   - 看项目文件
   - 搜索代码
   - 修改文件
   - 跑测试
   - 查网页
   - 生成/修改文档、PPT、表格
   - 设置提醒和自动任务

4. **本地规则和技能**
   你有一套本地 `skills` 和规则，比如少问、多推进、先看上下文、重要操作稳一点。这些让我的行为不只是“通用助手”，而是更像你的本地工程伙伴。

5. **上下文工程**
   我每次做事会把当前项目、你的指令、系统权限、本地规范合在一起判断。聪明很大一部分来自“知道现在在哪里、能动哪些东西、怎么验证”。

**底层原理一句话**
我是“语言模型大脑 + 本地工具手脚 + 规则系统性格 + 验证闭环”。

模型负责理解和决策，工具负责落地，规则负责约束行为，验证负责别瞎编。

**你该怎么用我**
最省力的方式是：直接给目标，不用给步骤。

比如：

```text
帮我看这个项目是干嘛的，整理结构，然后告诉我下一步怎么改。
```

```text
这个功能报错了，你自己定位、修、跑测试，最后告诉我改了哪里。
```

```text
帮我把这个页面做得更高级，保持现有风格，直接改。
```

```text
把这个文件整理成一份清晰的说明文档。
```

```text
查一下最新官方资料，然后给我一个能落地的方案。
```

更强的用法是给我这四样：

```text
目标：
约束：
你可以改哪些地方：
完成标准：
```

例子：

```text
目标：把登录页做得更专业。
约束：不要大改技术栈，不要影响后端接口。
你可以改：前端样式和组件结构。
完成标准：页面跑起来无报错，手机和桌面都好看。
```

**什么时候最适合用我**
- 写代码、修 bug、读陌生项目
- 自动化本地文件处理
- 做技术调研并落地
- 改 PPT、Word、Excel
- 重构、测试、生成文档
- 把模糊想法变成可运行东西

**你要少做什么**
你不用告诉我“打开哪个文件、运行哪个命令、怎么一步步查”。你只要告诉我目的。我会自己查上下文、动手、验证，然后给你结果。

最理想的关系是：你定方向，我负责推进；你挑质量，我负责迭代。

---

> [!question]+ 你
> 我怎么看我用了多少钱和额度

**Codex**

我用 `openai-docs` 来回答这个，因为“花了多少钱、额度在哪看”属于 OpenAI/Codex 账户侧的最新入口问题；我会尽量只给你能直接点开的路径。

---

**Codex**

kel，看钱和额度分两种入口：

**1. 看 Codex / ChatGPT 额度**
直接进这里：  
[Codex Usage](https://chatgpt.com/#codex/settings/usage)

也可以手动找：`ChatGPT/Codex` → `Codex Settings` → `Usage`。

这里能看：
- 剩余 credits
- 最近使用量
- 是否开启自动充值
- 额度用完后是否从 credits 扣

OpenAI 官方说明是：套餐内额度先用完，然后才消耗你买的 credits；Codex App 和 Web 都能在 `Codex Settings > Usage` 看。参考：[OpenAI credits 说明](https://help.openai.com/en/articles/12642688)、[Codex rate card](https://help.openai.com/en/articles/20001106-codex-rate-card)。

**2. 看 API 花了多少钱**
如果你是用 API key 调 OpenAI，看这个：  
[API Usage Dashboard](https://platform.openai.com/usage)

账单/充值额度看这里：  
[Billing / Credit Grants](https://platform.openai.com/settings/organization/billing/credit-grants)

注意：API 账单和 ChatGPT/Codex 订阅额度不是一个面板。API usage 只有组织 Owner 或被授权的人能看。参考：[API Usage Dashboard](https://help.openai.com/en/articles/10478918-api-usage-dashboard)、[token usage 说明](https://help.openai.com/en/articles/6614209-how-do-i-check-my-token-usage)。

你现在这个 Codex 桌面大概率优先看第一个：`Codex Settings > Usage`。

---
