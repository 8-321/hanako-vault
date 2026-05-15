- ## Codex 自定义密钥配置（2026-05-11）

kel 用自己的 an520.xin 中转密钥配置了 Codex：
- 密钥：[REDACTED]
- 中转地址：https://www.an520.xin/v1
- 配置位置：D:\CodexHome\auth.json、D:\CodexHome\config.toml、C:\Users\huang\.hanako\added-models.yaml
- 系统环境变量 OPENAI_API_KEY 和 OPENAI_BASE_URL 已设置

已知限制：Codex CLI v0.130.0 不支持自定义 base_url（忽略 OPENAI_BASE_URL），只能连 OpenAI 官方 API。但 Hanako 内通过 openai provider（api: openai-codex-responses）可以正常使用 gpt-5.5 等 Codex 模型。

文档：D:\Hanako\Codex密钥配置文档-小白版.md
- BELLA KE 核心档案：
- Vault路径：D:\BELLA KE\项目AI\调教AI\ObsidianVault
- GitHub：https://github.com/8-321/bella-ai-vault (private)
- 中转站：http://149.28.143.114:3000/v1
- 系统：Windows
- Obsidian安装：E:\obsidian\Obsidian.exe
- 对话同步脚本：D:\BELLA KE\项目AI\Hanako对话导出\scripts\hanako_to_obsidian.py
- 定时任务：每日09:00自动同步对话到Obsidian
- 核心关注：AI Agent调教、提示词工程、工作流自动化、知识沉淀
- Hanako 行为规范：
- 不用破折号（——、-）
- 不用"不是...是..."句式
- 不用"总的来说""希望对你有帮助""如你所见"收尾
- 分析事物从底层客观原理出发
- 抽象概念用类比或具体例子落地
- 遇到有效方案/踩坑/类比洞见时主动建议沉淀到Vault
- 调度优先级：Subscription(1000) > Relay(500) > Official(100)
