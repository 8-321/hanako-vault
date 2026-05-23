---
type: codex-skill-candidate
id: skill-candidate-2026-05-23-171052-codex-process-crash-recovery
created: 2026-05-23 17:10:52
status: candidate
skill_name: codex-process-crash-recovery
skill_type: workflow
install_target: draft-only
source_conversation: "D:\小柯 Ke\HanakoVault\系统\收件箱\Codex对话备份\2026-05\2026-05-23 171052 - Codex 崩溃与残留进程急救工具.md"
tags: [skill, codex, 自动生成, 候选]
---

# Codex 进程残留与崩溃急救流程

## 来源

- 对话：[[收件箱/Codex对话备份/2026-05/2026-05-23 171052 - Codex 崩溃与残留进程急救工具|2026-05-23 171052 - Codex 崩溃与残留进程急救工具]]
- 生成时间：2026-05-23 17:10:52

## 触发场景

Codex 变成 55MB、Codex 启动失败、Codex 疑似卡死、需要清理残留 Codex 进程、需要确认 Codex 是否真的崩溃

## 技能目标

把本次对话中可重复使用的判断、步骤、脚本、边界和验证方式沉淀成候选技能。

## 可复用流程

1. 先识别当前会话所在的 Codex 进程树，并把它标记为保护对象。
2. 只在预览模式下列出 Codex 进程分组、内存、年龄、父进程状态和清理候选，不做清理。
3. 如果当前会话被正确标记为 current-keep，才允许进入安全清理模式。
4. 安全清理只处理 orphan-candidate，不处理当前会话，也不默认处理其他仍有父进程的 Codex 窗口。
5. 如果需要 aggressive 清理，先关闭其他 Codex 窗口，再执行，并把它作为高风险入口单独标明。
6. 清理后检查 Crashpad reports 和 Windows Application 事件日志，区分“残留进程问题”和“真实崩溃问题”。
7. 交付时给 Kel 留下可点击/可双击的预览、安全清理、aggressive 清理入口，以及一份诊断报告。

## 输入

- Kel 的具体请求
- 当前本地路径和已有规则
- 本次对话产生的脚本、文档、验证输出

## 输出

- 可复用流程
- 关键路径
- 验证方式
- 是否值得转正的判断

## 转正检查清单

- [ ] 触发场景明确
- [ ] 流程可重复执行
- [ ] 不含密钥或隐私原文
- [ ] 本地路径已经验证
- [ ] 至少有一次成功运行证据
- [ ] 安装目标明确

## 正式 SKILL.md 草案

```markdown
---
name: codex-process-crash-recovery
description: "Codex 变成 55MB、Codex 启动失败、Codex 疑似卡死、需要清理残留 Codex 进程、需要确认 Codex 是否真的崩溃"
---

# Codex 进程残留与崩溃急救流程

## 触发场景

Codex 变成 55MB、Codex 启动失败、Codex 疑似卡死、需要清理残留 Codex 进程、需要确认 Codex 是否真的崩溃

## 工作流程

1. 先识别当前会话所在的 Codex 进程树，并把它标记为保护对象。
2. 只在预览模式下列出 Codex 进程分组、内存、年龄、父进程状态和清理候选，不做清理。
3. 如果当前会话被正确标记为 current-keep，才允许进入安全清理模式。
4. 安全清理只处理 orphan-candidate，不处理当前会话，也不默认处理其他仍有父进程的 Codex 窗口。
5. 如果需要 aggressive 清理，先关闭其他 Codex 窗口，再执行，并把它作为高风险入口单独标明。
6. 清理后检查 Crashpad reports 和 Windows Application 事件日志，区分“残留进程问题”和“真实崩溃问题”。
7. 交付时给 Kel 留下可点击/可双击的预览、安全清理、aggressive 清理入口，以及一份诊断报告。

## 注意事项

- 先检查真实本地路径和现有规则，再写入或修改。
- 不把原始聊天全文当成技能，只沉淀稳定流程。
- 转正前确认不含密钥、隐私原文或一次性上下文。
```
