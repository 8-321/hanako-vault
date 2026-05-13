# HanakoVault

> BELLA KE 的 AI 调教总部 & Hanako 个人工作区

## 这是什么

HanakoVault 是一个 Obsidian 知识库，包含两部分：

1. **AI 调教体系**：系统提示词、场景模式、子代理协议、验收标准、知识沉淀
2. **Hanako 个人工作区**：日记、巡检、技能定义、对话记录

## 快速开始

1. 用 Obsidian 打开此文件夹作为 Vault
2. 设置 → 社区插件 → 关闭安全模式 → 安装 Dataview / Templater / Obsidian Git
3. 设置 → 外观 → CSS 代码片段 → 开启 `hanako-chat`
4. 打开 `主页.md` 作为仪表盘

## 目录结构

```
HanakoVault/
├── 主页.md              ← 仪表盘入口
├── 日记/                ← Hanako 每日日记
├── 对话记录/            ← AI 对话自动归档
├── 巡检/                ← HeartBeat 巡检日志
├── 技能/                ← Hanako 技能定义
├── AI调教/              ← 系统提示词、场景模式
├── 技术资料库/          ← 中转站、AGENTS 规范等
├── 工作流/              ← 项目执行流程
├── 工具配置/            ← Agent 配置安装指南
├── 中转站配置/          ← 模型映射、API 密钥
├── 模板/                ← 工单、知识沉淀模板
└── 附件库/              ← 图片、头像等
```

## Agent 配置

| 工具 | 文件 |
|:---|:---|
| Hanako | `HANAKO.md` |
| Claude Code | `CLAUDE.md` |
| Cursor | `CURSOR.md` |
| OpenAI Codex | `CODEX.md` |
| 通用引导 | `AI_AGENT启动引导语.txt` |

## Git 同步

```bash
cd D:\BELLA KE\项目AI\调教AI\HanakoVault
git pull origin main
git push origin main
```

## 许可证

私有仓库，BELLA KE 个人使用。
