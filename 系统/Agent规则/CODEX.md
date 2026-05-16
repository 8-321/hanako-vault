# Codex 项目配置

> 定义 Codex 在此项目中的行为规范
> Codex 是 OpenAI 的 CLI 编程 Agent，深度集成 VS Code

## 工作空间

```
项目根目录：D:\BELLA KE\项目AI\调教AI
Obsidian Vault：D:\BELLA KE\项目AI\调教AI\ObsidianVault
```

## System Prompt（建议配置到 Codex 设置）

每次新对话开始前，复制以下内容作为 System Prompt 前置：

```
## 行为基准
在执行任何任务之前，先读取以下文件获取本次对话的行为规范：

1. ObsidianVault/AI调教/系统提示词/001-主控核心协议.md
2. ObsidianVault/AI调教/场景提示词/编程助手模式.md

Vault 路径：D:\BELLA KE\项目AI\调教AI\ObsidianVault
如文件不存在或为空，立即向我报告。
```

## Codex Rule

在 VS Code 设置（`settings.json`）中添加：

```json
{
  "codex.apiKey": "你的API Key",
  "codex.experimentalPromptGuidelines": true,
  "codex.conversationalBehavior": {
    "loadContext": true
  }
}
```

## 配置步骤

### 方法1：通过环境变量

在终端或系统环境变量中设置：

```bash
# Windows PowerShell
$env:CODEX_SYSTEM_PROMPT = "D:\BELLA KE\项目AI\调教AI\ObsidianVault\HANAKO.md"

# 或直接启动时指定
codex --system-prompt "D:\BELLA KE\项目AI\调教AI\ObsidianVault\HANAKO.md"
```

### 方法2：创建项目配置

在项目根目录创建 `.codex/config.json`：

```json
{
  "vault_path": "D:\\BELLA KE\\项目AI\\调教AI\\ObsidianVault",
  "system_prompt_file": "HANAKO.md",
  "default_model": "o4-mini",
  "api_base": "http://149.28.143.114:3000/v1"
}
```

### 方法3：通过 VS Code Settings

在 `settings.json` 中添加：

```json
{
  "codex.confirmationMode": "auto",
  "codex.contextWindow": 128000,
  "codex.maxTokens": 8192
}
```

## 与其他工具的协同

```
Codex（快速代码补全/单文件编辑）
    ↓ 配合
Claude Code（复杂重构/多文件协作）
    ↓ 配合
Hanako（整体规划/知识沉淀）
```

当 Codex 完成代码后，建议检查：
1. 是否需要更新 Obsidian Vault 中的规范文档
2. 是否有新经验需要沉淀
3. 是否需要通知 Claude Code 或 Hanako

## 常用命令

```bash
# 检查 vault 状态
cd D:\BELLA KE\项目AI\调教AI\ObsidianVault && git status

# 同步最新规范
git pull origin main

# 查看可用模型
curl http://149.28.143.114:3000/v1/models -H "Authorization: Bearer YOUR_KEY"
```

## 与中转站配合

```
Base URL: http://149.28.143.114:3000/v1
API Key:  从 CODEX_API_KEY 环境变量获取

支持模型（通过中转站）：
- o4-mini / o4
- gpt-4.5 / gpt-4o
- deepseek-chat / deepseek-coder
```

## 禁止事项（与 vault 规范一致）

- 不使用破折号（——、-）
- 不使用"不是...是..."句式
- 不使用"总的来说"、"希望对你有帮助"、"如你所见"收尾
- 不跳过验证步骤
- 代码必须有类型注解和必要的注释

## 知识沉淀触发

当 Codex 完成以下任务时，主动建议沉淀到 Vault：
1. 发现有效的代码模式或架构
2. 踩到一个有价值的坑或 bug
3. 完成复杂的重构或有价值的设计决策
4. 中转站配置、模型映射有变动

## Obsidian 日记与对话记录

- 黑曜石总备份不再循环刷新 `对话记录` 和 `conversations` 目录，避免重复出错的 Codex 对话文件被一次次推进备份。
- Codex 需要写日记时，使用 `D:\小柯 Ke\黑曜石Vault\scripts\write-three-vault-diary.ps1` 追加同一条带标记的日记到 HanakoVault、小柯自媒体Vault、小柯日常Vault。
- 同一条日记必须带稳定 `Marker`；文件里已存在这个标记时跳过，不能重复追加。

## 每次对话收尾

- 每次 Codex 对话结束前，运行 `D:\小柯 Ke\黑曜石Vault\scripts\complete-codex-conversation.ps1`。
- 这是五层流程：Capture 对话备份、Distill Skill 候选、Index 两个索引、Review 黑曜石候选、Promote 正式技能。
- 收尾脚本必须写入对话备份卡到 `D:\小柯 Ke\黑曜石Vault\收件箱\Codex对话备份\<YYYY-MM>`。
- 收尾脚本必须写入 Skill 候选卡到 `D:\小柯 Ke\黑曜石Vault\技能\自动生成\候选\<YYYY-MM>`。
- 收尾脚本必须更新 `D:\小柯 Ke\黑曜石Vault\备份索引\Codex对话沉淀索引.md` 和 `D:\小柯 Ke\黑曜石Vault\技能\Skill候选索引.md`。
- Skill 候选只沉淀可复用做法和触发场景；不要把嘈杂的原始聊天全文重复塞进黑曜石。
- Skill 候选先留在黑曜石中，Kel 明确要求转正时再安装成真正的 `SKILL.md`。
- 系统说明见 `D:\小柯 Ke\黑曜石Vault\99 - Agent指南与规范\Codex对话沉淀系统.md`。
