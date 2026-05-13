# Hanako 对话自动同步到 Obsidian

> 版本：v1.0 | 日期：2026-05-09
> 状态：已部署，每日 09:00 自动运行

---

## 一、方案概述

```
Hanako 对话 (.jsonl)
  C:\Users\huang\.hanako\agents\hanako\sessions\
        ↓ 每日 09:00 自动触发
  Python 转换脚本
  D:\BELLA KE\项目AI\Hanako对话导出\scripts\hanako_to_obsidian.py
        ↓
  Obsidian Markdown (.md)
  D:\BELLA KE\项目AI\调教AI\ObsidianVault\对话记录\
        ↓
  Git commit + push → GitHub
```

---

## 二、文件结构

```
D:\BELLA KE\项目AI\Hanako对话导出\
├── scripts\
│   └── hanako_to_obsidian.py   ← 转换脚本（核心）
├── logs\
│   └── sync.log                ← 每次同步日志
└── sync.bat                    ← 定时任务入口脚本
```

---

## 三、输出格式

每个对话生成一个 Markdown 文件，格式如下：

```markdown
---
title: "对话标题"
date: 2026-05-06
time: 09:45
source: Hanako
cwd: "工作目录"
tags: [对话记录, hanako]
---

# 对话标题

> 日期：2026-05-06 09:45
> 工作目录：`C:\Users\huang\Desktop`

---

> [!question]+ 你 `09:45:43`
> 用户消息内容

> [!note]- 思考过程
> Hanako 的内部思考（折叠）

**Hanako** `09:46:12`

Hanako 的回复内容

---
```

---

## 四、定时任务配置

| 项目 | 值 |
|:---|:---|
| 任务名称 | Hanako对话同步到Obsidian |
| 触发时间 | 每天 09:00 |
| 执行脚本 | `D:\BELLA KE\项目AI\Hanako对话导出\sync.bat` |
| 状态 | Ready（已激活） |

### 手动触发

```bash
# 立即执行一次同步
"D:\BELLA KE\项目AI\Hanako对话导出\sync.bat"

# 或通过 PowerShell
Start-ScheduledTask -TaskName "Hanako对话同步到Obsidian"
```

### 修改触发时间

```powershell
# 改为每天 22:00
$trigger = New-ScheduledTaskTrigger -Daily -At '22:00'
Set-ScheduledTask -TaskName "Hanako对话同步到Obsidian" -Trigger $trigger
```

---

## 五、脚本配置项

在 `hanako_to_obsidian.py` 顶部修改：

```python
SESSIONS_DIR     = Path(r"C:\Users\huang\.hanako\agents\hanako\sessions")
OUTPUT_DIR       = Path(r"D:\BELLA KE\项目AI\调教AI\ObsidianVault\对话记录")
INCLUDE_THINKING = True   # 是否保留思考过程（折叠 callout）
INCLUDE_TOOLS    = False  # 是否保留工具调用记录
```

---

## 六、Obsidian 查询（Dataview）

安装 Dataview 插件后，可以用以下查询列出所有对话：

```dataview
TABLE date, title
FROM "对话记录"
SORT date DESC
```

按关键词搜索：

```dataview
TABLE date, title
FROM "对话记录"
WHERE contains(title, "Obsidian")
SORT date DESC
```

---

## 七、日志查看

```bash
# 查看最近同步日志
type "D:\BELLA KE\项目AI\Hanako对话导出\logs\sync.log"
```

---

## 八、已同步对话（初始）

| 日期 | 标题 |
|:---|:---|
| 2026-05-06 | 研读工作空间所有文件，进行配置我的黑曜石... |
| 2026-05-06 | 帮我清理下C盘 |
| 2026-05-07 | 调研有关自媒体方面的所有知识... |
| 2026-05-07 | 帮我安装 opencode |
| 2026-05-09 | 每天写日记，你现在和我探讨下你的名字... |
| 2026-05-09 | 自己可以弄无成本的gemini/gpt 的会员吗 |

---

## 九、故障排查

| 问题 | 解决方案 |
|:---|:---|
| 脚本报错 UnicodeEncodeError | 已修复，终端乱码是 GBK 显示问题，文件内容正确 |
| 新对话没有同步 | 检查 session-titles.json 是否有新条目 |
| Git push 失败 | 网络问题，手动在终端跑 `git push origin main` |
| 定时任务没触发 | 检查电脑是否在 09:00 开机 |