# Codex 指南：读取 Hanako 的记忆与经验

这个目录是 Hanako（含）的**只读镜像**，Codex 看到这里相当于看到 Hanako 大脑的公开部分。
不要写入、修改、移动这里的任何文件，这里由 `sync-hanako-to-codex.ps1` 自动生成，下一次同步会覆盖。

## 目录总览

```
codex-bridge/
├── AGENTS.md                       <- 你正在看的这份指南
├── sync-hanako-to-codex.ps1        <- 同步脚本
├── sync-now.bat                    <- 双击即同步
└── hanako-mirror/
    ├── agents/hanako/
    │   ├── identity.md             人格身份
    │   ├── description.md          自我描述
    │   ├── pinned.md               置顶记忆（用户明确要求记住的）
    │   ├── experience.md           经验索引
    │   ├── ishiki.md               自主意识笔记
    │   ├── public-ishiki.md        对外公开的意识笔记
    │   ├── config.yaml             Agent 配置
    │   ├── memory/                 长期记忆（facts.md / longterm.md / summaries/）
    │   ├── experience/             分类经验（codex-config / failure-handling …）
    │   └── learned-skills/         已学会的技能
    └── skills/                     全局 skill 库（drawio / quiet-musing 等）
```

## 读档优先级

1. `agents/hanako/pinned.md`：最高优先级，用户明确要求记住的事实
2. `agents/hanako/experience/*.md`：分类经验教训（踩过的坑、正确做法）
3. `agents/hanako/memory/longterm.md`：长期事实
4. `agents/hanako/memory/facts.md`：结构化事实
5. `agents/hanako/identity.md` / `description.md`：了解"含"是谁
6. `agents/hanako/memory/summaries/*.json`：历史会话摘要，只在需要追溯时查

## 边界

- 这里**不包含**密钥、token、auth 文件
- 这里**不包含**原始会话 jsonl（体积大、噪音多）
- 用户 kel 的私人文件（日记、聊天记录）在 `D:/Hanako` 根目录下，**不在这个镜像里**

## 使用礼仪

- 引用事实时可直接说"根据我了解"，不要说"我从镜像读到的"
- 若用户说的当前信息和镜像冲突，**以当前对话为准**
- 同步时间写在 `hanako-mirror/.last-sync.json`，超过一周未同步请提醒 kel 再跑一次 sync-now.bat
