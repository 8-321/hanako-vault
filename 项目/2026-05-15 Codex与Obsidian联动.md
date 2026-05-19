---
date: 2026-05-15
tags: [Hanako, Codex, Obsidian, 工具]
---

# Codex 对话全部接入 Obsidian，备份弹窗修复

## 做了什么

1. **Codex CLI 对话 → Obsidian 统一归档。** 写了 `codex_to_obsidian.py`，从 Codex 的 sessions 目录提取对话 JSONL，转成 Markdown 写入 Vault 的 `对话/`。首次同步 58 条，之后每 2 小时自动增量。文件名从 `Codex 2026-05-15 20-01 5a899eb3` 这类哈希+时间戳格式，改为智能提取对话第一句有内容的中文标题（如 `做一个视频`、`调研github自媒体相关项目`）。

2. **PowerShell 备份弹窗彻底消除。** 根因是 Windows 计划任务 `ObsidianVault-AutoBackup` 每 15 分钟直接用 `powershell.exe` 启动备份脚本，每次弹可见控制台。改成了 VBS 静默启动器：`wscript.exe` → `C:\Users\huang\hanako-silent-backup.vbs` → 隐藏窗口执行备份。以后重装也用这个方案（已更新 `install-auto-backup-task.ps1`）。

3. **kel-life-os 技能升级。** 定义了新的 Vault 格式规范（大道至简）+ 自动观察写入机制：Hanako 在对话后主动判断是否产出值得记录的内容，自己写入 Vault，不再等 kel 指令。

## 关键决策

- 三类 AI 对话统一进 `对话/` 目录，Hanako 和 Codex 的通过文件名前缀区分。
- 定时任务都在 Hanako cron 和 Windows Task Scheduler 两套体系里——前者管对话同步，后者管 Vault 备份。
- 格式统一为：YAML frontmatter 只保留 `date` + `tags`，正文 3 段以内，不写套话。

## 关联
- [[2026-05-15 Codex对话同步到Obsidian]]
- [[2026-05-14 Codex OpenHanako二开安全底座]]
- [[项目/2026-05-15 Vault结构清理]]
- [[对话记录/Codex 2026-05-15 制作一个codex和openhanako 的综合体]]
