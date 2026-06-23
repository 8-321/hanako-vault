---
name: wechat-archive-pipeline
description: "Use this skill whenever the user asks to process WeChat chat records, 微信聊天记录, 微信文件, 微信数据库, 微信聊天网站, 微信记录导出, 年度聊天报告, 本地聊天档案, or to turn WeChat data into an offline website, report, searchable archive, or reusable workflow. This skill is a workflow skill, not a personality-distillation skill: it must not infer or store the user's private identity profile unless explicitly requested."
---

# WeChat Archive Pipeline

微信聊天记录档案化流水线。目标是把微信数据处理成：

- 本地离线网站
- 可读总结文档
- 可搜索索引
- 后续可升级的数据管线

这个 skill 只沉淀处理流程，不沉淀用户本人，不保存聊天隐私内容。

## Safety First

1. 默认本地离线处理，不上传聊天记录、联系人、数据库、图片、视频。
2. 默认只读扫描，不修改微信原始目录。
3. 解密前复制工作副本，不在原库上操作。
4. 默认生成静态本地网站或 `127.0.0.1` 本地服务，不公网部署。
5. 明确区分两种结果：
   - 文件档案：只基于路径、文件类型、时间、大小。
   - 聊天总结：必须基于可读文本消息。
6. 数据库无法读取时，不要伪造聊天内容总结。
7. 不运行未知来源 exe，不建议使用已被移除或存在合规风险的旧项目副本。

## Phase 1: Locate WeChat Data

优先查找：

- `WeChat Files`
- `xwechat_files`
- `Tencent Files`
- `db_storage`
- `db_storage/message`
- `db_storage/contact`
- `db_storage/session`
- `msg/file`
- `msg/video`
- `FileStorage`

在 Windows 上常见位置包括：

- 用户自定义盘符下的 `xwechat_files`
- `Documents/WeChat Files`
- 电脑管家搬家目录
- 老版微信的 `FileStorage` 目录

只读统计：

- 总大小
- 文件总数
- 类型分布
- 月份分布
- 最大目录
- 最大文件
- 数据库文件清单

## Phase 2: Test Database Readability

尝试用 sqlite 只读打开这些库：

- `db_storage/message/message_0.db`
- `db_storage/message/message_resource.db`
- `db_storage/message/media_0.db`
- `db_storage/contact/contact.db`
- `db_storage/session/session.db`
- `db_storage/general/general.db`

判断：

- 能打开：进入文本导出和总结。
- `file is not a database`：通常为加密或特殊格式，进入解密路线。
- 文件不存在：可能是老版微信或手机备份路线，换目录结构检查。

## Phase 3: GitHub Research Matrix

调研得到的核心项目：

### 1. LC044/WeChatMsg

用途：提取微信聊天记录，导出 HTML、Word、CSV，生成年度聊天报告。

适合：聊天文本导出、年度报告、可视化分析。

注意：确认当前微信版本、数据库结构和依赖环境。不要直接把隐私数据给外部服务。

### 2. hicccc77/WeFlow

用途：本地实时查看、分析、导出微信聊天记录，支持年度报告、本地 HTTP API。

适合：本地可视化、聊天记录网站、后续自动化接口。

注意：API 只允许本机 `127.0.0.1` 使用，不要暴露公网。

### 3. Shulelk/WeChatMsgDump

用途：动态获取微信数据库密钥并解密数据库文件。

适合：数据库解密后再做自定义分析。

注意：只用于本人授权数据；先复制数据库工作副本。

### 4. BlueMatthew/WechatExporter

用途：从 iTunes/iOS 备份导出微信聊天记录为 HTML、Text、PDF。

适合：PC 微信库不可解时的 iOS 备份替代路线。

注意：主要面向 iPhone/iPad 备份，不等同于 Windows PC 微信库。

### 5. zhimian/decrypt-PC-WeChat-db / qwe305/wechat-db-decrypt

用途：PC 微信数据库解密参考。

适合：理解旧版 PC 微信数据库解密思路。

注意：活跃度、兼容性、当前微信版本支持都要验证。

### Avoid

`xaoyaoo/PyWxDump` 曾经流行，但 README 显示项目因合规风险已移除代码和历史。不要建议下载旧副本或未知来源二进制。

## Phase 4: Build Offline File Archive

当数据库尚未解密时，先生成文件档案馆。

最低交付物：

- `00-先看这里.txt`
- `index.html`
- `微信档案说明.md`
- `wechat_archive_stats.json`

网页结构：

1. 总览：数据来源、文件数、总大小。
2. 类型分布：图片、视频、语音、文档、数据库、网页、压缩包、其他。
3. 时间分布：按年月统计。
4. 最大目录：找出空间占用来源。
5. 最大文件：Top N。
6. 数据库状态：可读/加密/缺失。
7. 下一步：解密和文本总结路线。

## Phase 5: Build Text Archive After Decryption

当聊天文本可读后，生成：

- 联系人/群聊索引
- 对话时间线
- 年度报告
- 关键词统计
- 高频关系和会话强度
- 重要对话摘录
- 可搜索本地聊天页面

推荐导出格式：

- HTML：适合本地网站。
- Markdown：适合 Obsidian/Vault。
- CSV/JSON：适合后续分析。
- Word/PDF：适合阅读归档。

## Report Template

如果只有文件索引：

```markdown
# 微信文件档案说明

## 当前做到哪一步
## 数据来源
## 空间占用概览
## 类型分布
## 时间分布
## 最大目录和最大文件
## 数据库状态
## 不能总结聊天文本的原因
## 下一步解密路线
```

如果已有聊天文本：

```markdown
# 微信聊天记录总结

## 数据范围与可信度
## 总体概览
## 人物/群聊索引
## 时间线
## 高频主题
## 重要对话
## 年度/月度变化
## 可继续沉淀的线索
## 不确定和缺失部分
```

## Communication Style

给用户解释时要通俗：

- “这是什么”
- “怎么打开”
- “现在做到哪一步”
- “为什么暂时不能做文本总结”
- “下一步要什么条件”

不要只扔路径。生成文件后用 stage_files 交付。

## Quick Start Response

触发后可以这样开头：

“我按微信记录档案化流水线来做。先本地只读盘点，不上传、不改原始目录；能读出文本就做聊天总结，读不出就先做文件档案馆，再给解密升级路线。”
