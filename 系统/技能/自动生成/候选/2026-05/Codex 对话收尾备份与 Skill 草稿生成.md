---
type: codex-skill-draft
created: 2026-05-16 16:26:08
status: draft
skill_name: codex-conversation-closeout
source: "D:\小柯 Ke\黑曜石Vault\收件箱\Codex对话备份\2026-05-16 162608 - Codex 对话收尾备份与 Skill 草稿生成.md"
tags: [skill, codex, 自动生成]
---

# Codex 对话收尾备份与 Skill 草稿生成

## 触发场景

每次 Codex 对话结束、Kel 要求备份对话、Kel 要求自动生成 skill、需要把本次经验沉淀进黑曜石

## 技能目标

把本次对话里可复用的判断、步骤、脚本或边界沉淀下来，下次遇到同类任务时直接复用。

## 可复用做法

1. 对话结束前先总结本次真正可复用的经验：路径、脚本、边界、验证结果、下一次触发条件。
2. 运行 `D:\小柯 Ke\黑曜石Vault\scripts\complete-codex-conversation.ps1`，传入标题、摘要、skill 名称、触发场景和可复用流程。
3. 脚本会写入 `收件箱\Codex对话备份` 和 `技能\自动生成`，再调用黑曜石总备份。
4. 生成的 Skill 先作为 Obsidian 草稿保存，不直接安装成正式 `SKILL.md`，除非 Kel 明确要求转正。
5. 不把嘈杂原始聊天全文重复塞进黑曜石，只沉淀可复用判断和步骤。

## 转成正式 SKILL.md 时的骨架

```markdown
---
name: codex-conversation-closeout
description: "每次 Codex 对话结束、Kel 要求备份对话、Kel 要求自动生成 skill、需要把本次经验沉淀进黑曜石"
---

# Codex 对话收尾备份与 Skill 草稿生成

## 触发场景

每次 Codex 对话结束、Kel 要求备份对话、Kel 要求自动生成 skill、需要把本次经验沉淀进黑曜石

## 工作流程

1. 对话结束前先总结本次真正可复用的经验：路径、脚本、边界、验证结果、下一次触发条件。
2. 运行 `D:\小柯 Ke\黑曜石Vault\scripts\complete-codex-conversation.ps1`，传入标题、摘要、skill 名称、触发场景和可复用流程。
3. 脚本会写入 `收件箱\Codex对话备份` 和 `技能\自动生成`，再调用黑曜石总备份。
4. 生成的 Skill 先作为 Obsidian 草稿保存，不直接安装成正式 `SKILL.md`，除非 Kel 明确要求转正。
5. 不把嘈杂原始聊天全文重复塞进黑曜石，只沉淀可复用判断和步骤。

## 注意事项

- 先检查真实本地路径和现有规则，再写入或修改。
- 对用户数据执行清理前先列出范围和数量。
```
