# HanakoVault

> BELLA KE 的 AI 调教总部 · Hanako 自动观察写入

## 目录

```
HanakoVault/
├── 主页.md          ← 仪表盘
├── 日志/            ← 每日日记
├── 对话记录/         ← AI 对话归档
├── 笔记/            ← 知识沉淀（AI调教、技术、工作流）
├── 项目/            ← 有交付物的项目
├── 回顾/            ← 周/月复盘
├── 巡检/            ← 五助手巡检
├── 系统/            ← Agent规则、工具、模板
├── 收件箱/          ← 碎片
└── 附件库/          ← 附件
```

## Agent 配置

| 工具 | 路径 |
|:---|:---|
| Hanako | `系统/Agent规则/HANAKO.md` |
| Claude Code | `系统/Agent规则/CLAUDE.md` |
| Cursor | `系统/Agent规则/CURSOR.md` |
| OpenAI Codex | `系统/Agent规则/CODEX.md` |

## 自动写入

Hanako 在对话后自动判断是否写入笔记到 `笔记/` 或 `项目/`。日志由定时任务每日写入 `日志/`。
