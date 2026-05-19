---
date: 2026-05-15
tags: [Codex, Obsidian, 联动, 自动化]
---

# Codex 对话同步到 Obsidian

## 是什么
将 Codex CLI 的所有对话 JSONL 自动转换为 Obsidian Markdown，统一归档到 HanakoVault，支持全文检索。

## 核心内容
- **同步脚本**：`D:\BELLA KE\项目AI\Hanako对话导出\scripts\codex_to_obsidian.py`，扫描 `D:\CodexHome\sessions\` 下的 JSONL，转换为带 YAML frontmatter 的 Markdown
- **智能标题**：自动跳过 "Hi""OK""回复" 等无意义开头，提取第一条有实质内容的用户消息作为文件名标题
- **定时运行**：Hanako cron job_8，每 2 小时自动增量同步
- **输出位置**：`D:\小柯 Ke\HanakoVault\对话记录\Codex YYYY-MM-DD 标题.md`

## 注意
- Codex session JSONL 格式和 Hanako 不同，需单独处理 `session_meta` / `response_item` 等事件类型
- 同日同主题会话通过 session_id 判重，避免覆盖
- 系统注入的 AGENTS.md 上下文已被过滤，不影响标题提取
- Codex 的 an520.xin API key 目前 401，但不影响同步功能
