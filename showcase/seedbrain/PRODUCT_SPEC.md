# SeedBrain 产品规格 v0.1

## 一、产品定位

SeedBrain 是一个 AI 原生的个人记录、知识库、主动洞察与内容创作系统。用户只管把语音、文字、图片、链接、会议、文档、课程笔记丢进来，系统负责理解、关联、追问、复习和生成作品。

## 二、复刻目标

功能复刻对象是「AI 记录与内容创作型第二大脑」产品形态，包含：

1. 随手记录
2. AI 自动整理
3. 个人记忆库
4. 语义检索和问答
5. 主动点评、发芽、拷问、润色
6. 笔记到作品
7. 学习闭环
8. 多端同步设计
9. CLI/API/Skill 开放生态设计

## 三、不可复制边界

不复制任何第三方 App 的商标名称、官方图标、官方 UI 截图、付费课程或电子书内容、未公开接口、专有提示词和模型策略。

## 四、信息架构

### 首页

今日记录数、知识库数、AI 洞察数、待回顾数、快速记录入口、主动推送卡片。

### 记录

文字、语音、图片、链接、文档、会议、直播/博主订阅。

### 知识库

默认知识库、自定义知识库、知识库内搜索、标签筛选、相关笔记。

### AI 助手

问答、全局搜索、仅基于我的笔记回答、引用来源。

### 创作工坊

朋友圈、小红书、公众号、周报、会议纪要、长图/卡片导出设计。

### 回顾

每日回顾、间隔重复、盲区提醒、重复困惑识别。

### 开放生态

API token、CLI 命令、Skill 模板、自动化工作流。

## 五、核心数据模型

```ts
type Note = {
  id: string
  type: 'text' | 'voice' | 'image' | 'link' | 'document' | 'meeting' | 'live'
  title: string
  content: string
  raw?: string
  summary: string
  tags: string[]
  knowledgeBaseId: string
  createdAt: string
  updatedAt: string
  source?: string
  attachments?: Attachment[]
  insights?: Insight[]
  archived?: boolean
  starred?: boolean
}
```

## 六、真实开发路线

### MVP 1，本地可用

本地数据库 IndexedDB、真实语音转文字、链接正文提取、OCR、RAG 问答、笔记导入导出。

### MVP 2，云端同步

账号系统、云数据库、文件存储、向量数据库、后端任务队列、多端同步。

### MVP 3，主动智能体

定时巡检用户笔记、盲区检测、重复困惑检测、作品机会识别、个性化语气模型。

### MVP 4，开放生态

CLI、OpenAPI、MCP Server、Skill 商店、第三方 Agent 读写。
