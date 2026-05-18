---
title: "是开源工具/架构研究 agent。请只做只读研究，不改文件"
date: 2026-05-13
time: 07:32
source: Codex
session_id: "019e2040-d3df-74a0-9046-d28584bf4e60"
originator: "Codex Desktop"
cwd: "E:\1\New project 3"
tags: [对话记录, codex]
---

# 是开源工具/架构研究 agent。请只做只读研究，不改文件

> 日期：2026-05-13 07:32
> 来源：Codex Desktop
> 工作目录：`E:\1\New project 3`

---

> [!question]+ 你
> 你是开源工具/架构研究 agent。请只做只读研究，不改文件。任务：调研适合“用户输入灵感 -> 自动生成小红书/抖音/知乎/掘金/B站内容包 -> 审核 -> 排期/发布 -> 复盘”的 GitHub 开源项目和架构组件。重点比较 Dify、n8n、Activepieces、Postiz/Mixpost/TryPost、内容管理/知识库/素材库相关项目，以及中文平台是否有稳定官方 API 或只能人工发布。输出：推荐组件、取舍、第一版最小可跑通架构、后续升级路线，附链接。

**Codex**

我会按“只读研究”来做，不碰本地文件。先快速读取这类研究任务相关的工作规则，然后用公开资料核对各项目和平台 API 的现状。

---

**Codex**

使用 `using-superpowers` 和 `kel-reasoning`：这是一份带取舍的架构调研，我会先把问题拆成“编排/生成/审核/发布/复盘/平台 API”几块，再基于当前公开资料给出一版能落地的组合。

---

**Codex**

结论先说：第一版别追求“全自动发布到所有中文平台”。更稳的路线是“自动生成内容包 + 人工审核 + 自动生成草稿/待发布任务 + 少数官方 API 自动发布 + 人工确认发布 + 复盘入库”。中文内容平台里，只有抖音的开放平台发布能力相对明确，但也要申请权限和用户授权；小红书、知乎、掘金、B站对普通创作者都不适合做无头全自动发布。

**推荐组合**

| 模块 | 推荐 | 取舍 |
|---|---|---|
| 灵感到内容包生成 | [Dify](https://github.com/langgenius/dify) | 最适合做 LLM 工作流、RAG、品牌语气、平台化改写。Dify 自述包含 AI workflow、RAG、agent、模型管理、观测和 API，适合作为“内容生成大脑”。不是排期/发布系统。 |
| 自动化编排 | [Activepieces](https://github.com/activepieces/activepieces) 或 [n8n](https://github.com/n8n-io/n8n) | Activepieces 是 MIT 社区版，内置 human-in-the-loop、表单/审批触发、TypeScript pieces，适合长期自控。n8n 集成更多、模板多、上手快，但 license 是 fair-code/source-available，不是传统开源。 |
| 内容库/素材库 | NocoDB + 对象存储，或 Strapi | 第一版用 NocoDB/表格型内容库最快，字段管理清楚。需要更正式 CMS、权限、媒体库、草稿发布时再上 [Strapi](https://github.com/strapi/strapi)。素材多、版权/版本复杂时再引入 ResourceSpace 这类 DAM。 |
| 海外社媒排期发布 | [Postiz](https://github.com/gitroomhq/postiz-app) | Postiz 当前最贴近“AI agent + 社媒排期 + API/MCP + analytics”，GitHub 显示支持 API、Temporal、Next/Nest/Postgres，且有 30k+ stars。适合 X/LinkedIn/YouTube/TikTok/Instagram 等，不解决中文平台核心痛点。 |
| 中文平台草稿同步 | [Wechatsync](https://github.com/wechatsync/Wechatsync) | 很适合第一版做“草稿同步”。它是 Chrome 扩展，使用浏览器登录态，调用各平台 Web 编辑器接口，默认草稿优先，支持知乎、掘金、小红书、抖音图文、B站专栏等。缺点是依赖网页登录态和平台前端接口，不能当稳定后端 API。 |
| 社媒排期备选 | [Mixpost](https://github.com/inovector/mixpost), [TryPost](https://github.com/trypostit/trypost) | Mixpost 更成熟、Laravel 生态、MIT，但偏传统社媒管理。TryPost 有 API/MCP/资产库/团队协作愿景，但 GitHub 显示 stars 很少、无 release，更像早期项目。 |

**中文平台 API 判断**

| 平台 | 自动发布可行性 | 判断 |
|---|---|---|
| 抖音 | 有条件可自动发布 | 官方文档有“上传视频”和“创建视频”接口，需要申请“代替用户发布内容到抖音”能力、用户授权，创建后还有审核过程；文档还写到单用户单应用每日发布上限等限制。见 [上传视频](https://developer.open-douyin.com/docs/resource/zh-CN/dop/develop/openapi/video-management/douyin/create-video/upload-video) 和 [创建视频](https://developer.open-douyin.com/docs/resource/zh-CN/dop/develop/openapi/video-management/douyin/create-video/video-create)。 |
| 小红书 | 不建议无头自动发布 | 公开能看到小程序开放平台和“笔记发布能力及入口”的描述，但没有面向普通创作者稳定公开的笔记发布 OpenAPI。实操更适合人工发布或本地浏览器草稿辅助。 |
| 知乎 | 不建议后端自动发布 | 没找到可信、稳定、公开官方发布 API。可用 Wechatsync 这类浏览器扩展走网页登录态创建草稿，发布前人工确认。 |
| 掘金 | 可做草稿辅助，不当稳定 API | 常见方案是 Cookie 鉴权调用 `api.juejin.cn` 的 Web 接口，但这不是正式开放平台契约。建议只做草稿/半自动。 |
| B站 | 谨慎，只走官方/人工 | B站有开放平台入口，但公开视频投稿 API 不适合直接依赖。一个大型非官方 API 收集项目已在 2026-01-30 归档，并说明因整理非公开 API 收到法律警告，见 [bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect)。这说明逆向发布链路风险高。 |

**第一版最小可跑通架构**

```text
用户输入灵感
  -> Activepieces/n8n 触发流程
  -> Dify 生成内容包
      小红书笔记 / 抖音脚本 / 知乎长文 / 掘金技术文 / B站标题简介脚本
  -> NocoDB/Postgres 保存内容包状态
  -> MinIO/S3 保存封面、图片、视频、字幕
  -> 人工审核：通过 / 退回 / 改写
  -> 发布层：
      抖音视频：有权限则走官方 API，否则人工
      知乎/掘金/小红书/抖音图文/B站专栏：Wechatsync 生成草稿，人工最终发布
      海外平台：Postiz 排期发布
  -> 复盘：
      录入链接、发布时间、平台、阅读/点赞/收藏/评论
      有官方接口就拉取，没有就人工导入 CSV/截图录入
  -> 反馈给 Dify 知识库和选题评分表
```

**我的建议**

第一版用：`Dify + Activepieces + NocoDB + MinIO + Wechatsync`。如果你已经很熟 n8n，或者需要大量现成集成，就把 Activepieces 换成 n8n。Postiz 先作为海外平台发布器接入，不要指望它解决小红书/知乎/掘金/B站。

第二阶段再加：正式审核台、内容日历、素材版权字段、品牌语气库、爆款结构库、平台规则检查、标题 A/B 候选、复盘仪表盘。

第三阶段才考虑：抖音官方 API 自动发布、平台级 OAuth 接入、Postiz/Mixpost 二开、专门的中文平台发布适配器。中文平台这块要始终留人工确认口，别把账号安全押在 Cookie 自动化上。

---
