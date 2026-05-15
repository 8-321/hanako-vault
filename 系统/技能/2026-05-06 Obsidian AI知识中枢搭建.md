---
date: 2026-05-06
tags: [Obsidian, AI调教, 跨设备同步]
---

# Obsidian AI知识中枢搭建

## 是什么
把 Obsidian Vault 作为 AI Agent 的长期知识中枢，实现提示词、工作流、中转站配置和人格协议的跨设备复用。

## 核心内容
- Vault 结构按功能分层：AI调教/系统提示词、场景提示词、知识沉淀、工作流、中转站配置、技术资料库、工具生态。
- 同步层优先用 Git + GitHub Private 仓库，不依赖 iCloud/OneDrive 直接合并，保留版本历史和冲突可追溯性。
- AI Agent 不靠“记忆”硬背规则，而是在启动时读取 Vault 里的主控协议、索引和执行标准。
- 敏感信息单独隔离：API密钥库、.env、运行时缓存加入 .gitignore；插件配置可以同步，workspace/cache 不同步。

## 注意
“所有东西”要包括 docx、zip、xlsx、txt 等原始资料的提取和索引，不能只整理 Markdown。GitHub 推送受认证限制，密码不能替代 Token；仓库必须建成 private。
