# Codex 对接 Hanako 数据（小白版）

> 最后更新：2026-05-13
> 目的：让 Codex 能读到 Hanako（含）的记忆、经验、人格档，实现两个 AI 助手之间的知识共享

---

## 一、为什么要对接

你有两个 AI 助手：
- **Hanako（含）**：日常对话、知识管理、生活助手
- **Codex**：写代码、跑 agent、开发项目

问题是：Codex 不知道含记住了什么，含也不知道 Codex 在做什么项目。
这份文档解决的是：**让 Codex 能读到含的大脑**（单向只读，不会反过来污染含的数据）。

---

## 二、架构一句话

```
Hanako 数据（C:\Users\huang\.hanako）
        ↓ 同步脚本（只读复制）
Codex 可读镜像（D:\Hanako\codex-bridge\hanako-mirror）
        ↓ Codex Skill 自动触发
Codex 在对话中引用含的记忆
```

---

## 三、已部署的文件清单

| 文件 | 位置 | 作用 |
|:---|:---|:---|
| 同步脚本 | `D:\Hanako\codex-bridge\sync-hanako-to-codex.ps1` | PowerShell，把 Hanako 关键数据镜像到 codex-bridge |
| 一键同步 | `D:\Hanako\codex-bridge\sync-now.bat` | 双击即跑同步 |
| Codex 指南 | `D:\Hanako\codex-bridge\AGENTS.md` | 告诉 Codex 怎么读这个镜像 |
| Codex Skill | `D:\CodexHome\skills\hanako-bridge\SKILL.md` | 让 Codex 在你提到含/Hanako/kel 时自动去读镜像 |
| 镜像目录 | `D:\Hanako\codex-bridge\hanako-mirror\` | 同步后的只读副本 |

---

## 四、同步了哪些数据

| 数据 | 路径（镜像内） | 说明 |
|:---|:---|:---|
| 置顶记忆 | `agents/hanako/pinned.md` | 你明确让含记住的事 |
| 经验索引 | `agents/hanako/experience.md` | 含踩过的坑、学到的教训 |
| 分类经验 | `agents/hanako/experience/*.md` | 按类别的具体经验条目 |
| 长期记忆 | `agents/hanako/memory/longterm.md` | 长期事实 |
| 事实库 | `agents/hanako/memory/facts.md` | 结构化事实 |
| 会话摘要 | `agents/hanako/memory/summaries/*.json` | 历史对话的压缩摘要 |
| 人格档 | `agents/hanako/identity.md` / `description.md` | 含是谁 |
| 意识笔记 | `agents/hanako/ishiki.md` | 含的自主意识记录 |
| 已学技能 | `agents/hanako/learned-skills/` | 含自己学会的 skill |
| 全局技能 | `skills/` | Hanako 平台安装的 skill 库 |

**不同步的（安全考虑）：**
- 密钥、token、auth.json
- 原始会话 jsonl（太大、噪音多）
- 日记、私人文件

---

## 五、怎么用

### 首次使用

1. 双击 `D:\Hanako\codex-bridge\sync-now.bat`
2. 看到"Done"就完成了
3. 打开 Codex，随便问一句"你了解我吗"或"我之前踩过什么坑"
4. Codex 会自动通过 `hanako-bridge` skill 去读镜像

### 日常使用

- 正常用 Codex 写代码就行
- 当你提到"含""Hanako""我的助手""我之前说过"等关键词时，Codex 会自动查镜像
- 如果 Codex 说"镜像超过 7 天未同步"，再跑一次 `sync-now.bat`

### 手动同步（命令行）

```powershell
powershell -ExecutionPolicy Bypass -File "D:\Hanako\codex-bridge\sync-hanako-to-codex.ps1"
```

---

## 六、Codex 怎么知道去读

靠 `D:\CodexHome\skills\hanako-bridge\SKILL.md` 这个 skill。它的触发词包括：

> hanako, 含, 含舟, 含章, 含野, kel, 我的助手, 我的 AI, 个人记忆, 个人经验, 我之前说过, 你记得吗, 翻一下我的笔记, codex 对接, 同步记忆

触发后 Codex 会按优先级读：pinned.md → experience → longterm.md → facts.md → identity.md

---

## 七、安全边界

- 同步是**单向只读**：Hanako → Codex，Codex 不会写回 Hanako
- 镜像里**没有密钥**，即使 Codex 被第三方插件读取也不会泄露
- 原始会话不同步，隐私对话不会出现在镜像里
- 如果你不想让 Codex 看到某条记忆，在 Hanako 里删掉后重新 sync 即可

---

## 八、后续可选升级

| 升级 | 难度 | 效果 |
|:---|:---|:---|
| 定时自动同步（Windows 计划任务） | 低 | 每天自动跑一次，不用手动 |
| 双向同步（Codex 经验回写含） | 中 | Codex 踩的坑也能让含知道 |
| MCP Server 实时桥接 | 高 | 不用文件同步，Codex 实时查 Hanako API |

目前先用最简单的文件同步，稳定可靠，出问题好排查。

---

## 九、关键路径速查

| 用途 | 路径 |
|:---|:---|
| Hanako 数据根 | `C:\Users\huang\.hanako` |
| Codex 配置根 | `D:\CodexHome` |
| 镜像目录 | `D:\Hanako\codex-bridge\hanako-mirror` |
| 同步脚本 | `D:\Hanako\codex-bridge\sync-hanako-to-codex.ps1` |
| 一键同步 | `D:\Hanako\codex-bridge\sync-now.bat` |
| Codex Skill | `D:\CodexHome\skills\hanako-bridge\SKILL.md` |
| Codex 指南 | `D:\Hanako\codex-bridge\AGENTS.md` |
| Codex 启动 | `D:\Hanako\Codex-打开.bat` |

---

*文档由 Hanako（含）生成 | 2026-05-13*
