# OrcaTerm AI 助手实操案例

> OrcaTerm 桌面版 v1.0.1 | 已登录：kel（微信）

---

## 前提：AI 助手在哪

打开 OrcaTerm 后，**右侧边栏**就是 AI 助手面板。如果你的界面上没看到，检查：

1. 菜单栏或工具栏里有没有「AI」图标按钮
2. 快捷键（通常是 `Ctrl+J` 或 `Ctrl+L`）
3. 右键菜单中选「AI 助手」或「问 AI」

---

## 案例 1：让 AI 解释一段看不懂的命令

**场景**：你在网上找到一段 PowerShell 脚本，但看不懂它在干什么。贴给 AI 助手让它逐行解释。

**操作**：
1. 在 AI 助手输入框里粘贴这段命令：
```powershell
Get-ChildItem -Recurse | Where-Object { $_.Length -gt 100MB } | Sort-Object Length -Descending | Select-Object Name, Length, FullName -First 10
```
2. 输入提示词：「解释这段命令每一行做了什么」
3. 回车

**预期效果**：AI 会告诉你这是一个查找当前目录下最大文件的命令：递归遍历所有文件，筛选大于 100MB 的，按大小降序排列，取前 10 个。

**为什么有用**：互联网上 Copypasta 满天飞，先理解再执行是底线。这个案例可以培养你的"先问再跑"习惯。

---

## 案例 2：让 AI 当场写一个你需要的脚本

**场景**：你有一个装满散乱文件的文件夹，想按文件类型（扩展名）自动分类到不同子文件夹。你不会写，让 AI 写。

**操作**：
1. 在 AI 助手输入：
```
写一个 PowerShell 脚本，把当前目录下所有文件按扩展名自动移动到对应子文件夹。
比如 .jpg 文件移到 jpg/ 目录，.pdf 移到 pdf/ 目录，依此类推。
要求：先列出操作计划（干跑模式/dry run），确认后再执行。
```
2. AI 生成脚本后，先别急着跑。让它加注释，逐段解释。
3. 确认无误后，复制到终端执行。

**预期效果**：得到一个安全、带确认机制的自动分类脚本。

**延伸玩法**：同样的逻辑可以让 AI 批量重命名文件、清理临时文件、压缩日志……凡是重复性文件操作，跟 AI 说需求就行。

---

## 案例 3：粘贴报错信息，让 AI 秒定位问题

**场景**：跑 `npm install` 报了一长串红色错误，完全不知道哪里出了问题。不用 Google 了，直接丢给 AI。

**操作**：
1. 在终端里选中报错文本，右键复制（或 `Ctrl+Shift+C`）
2. 粘贴到 AI 助手，输入：「这是什么问题？怎么修？」
3. 看 AI 的诊断和建议

**示例报错**（你可以复制这个试试）：
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! While resolving: my-project@1.0.0
npm ERR! Found: react@18.2.0
npm ERR! node_modules/react
npm ERR!   react@"^18.2.0" from the root project
npm ERR! Could not resolve dependency:
npm ERR! peer react@"^17.0.0" from some-old-lib@3.0.0
```

**预期效果**：AI 会告诉你这是依赖版本冲突，给出 `npm install --legacy-peer-deps` 或降级某个包的方案。

**为什么有用**：这是终端 AI 助手最实用的功能。不用跳出终端去 Google、读 StackOverflow，上下文不丢失。

---

## 案例 4：用 AI 分析日志找问题

**场景**：服务器日志几百行，肉眼扫不过来。让 AI 帮你筛选关键信息。

**操作**：
1. 把日志文件内容粘贴到 AI 助手（或用 `cat error.log` 输出后复制）
2. 输入：「分析这段日志，提取所有 ERROR 级别的异常，按频次排序，给出优先级」
3. 如果日志太长，先让 AI 总结：「这段日志讲了什么？有哪些值得关注的点？」

**延伸**：OrcaTerm 的文件管理器可以直接打开服务器上的文件，结合 AI 助手，日志分析可以做到不离开终端一步。

---

## 案例 5：让 AI 帮你记住不常用的命令

**场景**：有些命令很少用，每次都要 Google。但 Google 来的结果你还要自己判断靠不靠谱。AI 助手可以直接给出针对你当前系统的准确命令。

**操作**：在 AI 助手输入类似问题：

| 你的问题 | AI 给你的 |
|---|---|
| 「Linux 怎么查看端口占用？」 | `lsof -i :端口号` 或 `ss -tlnp` |
| 「Windows 怎么批量杀掉进程？」 | `Get-Process node* \| Stop-Process -Force` |
| 「tar 压缩排除某个目录怎么写？」 | `tar -czf out.tar.gz --exclude='node_modules' ./` |
| 「Git 撤销最后一次 commit 但保留改动？」 | `git reset --soft HEAD~1` |
| 「怎么导出 MySQL 某个表的数据？」 | `mysqldump -u root -p dbname tablename > dump.sql` |

**关键点**：直接问，不用搜索引擎。AI 会根据你的操作系统给出正确命令。

---

## 进阶玩法：本地终端 + AI 组合拳

OrcaTerm 桌面版的一个特殊优势：它可以同时打开**本地终端**（你 Windows 电脑上的 PowerShell/CMD）和**远程 SSH 终端**，AI 助手对两者都可用。

**组合技举例**：

1. **本地写脚本 → 远程执行**：在 AI 助手生成脚本 → 本地测试 → SSH 上传到服务器执行
2. **跨环境排查**：本地连不上远程？AI 助手同时了解两边的网络配置，帮你定位是防火墙、密钥还是端口的问题
3. **批量运维**：让 AI 生成批量操作命令（比如更新 5 台服务器的证书），在本地终端跑循环脚本

---

## 一个小技巧：提示词模板

AI 助手好用的前提是你会问。几个可复用的句式：

```
「解释这段命令：[粘贴]」
「这段报错是什么意思？怎么修：[粘贴]」
「写一个脚本，需求是：[描述]，要求加上错误处理」
「把这个命令翻译成 [PowerShell/Bash]：[粘贴]」
「这段日志里有什么异常：[粘贴]」
```

不用每次都重新组织语言，套模板就行。

---

## 注意

- AI 生成的命令**先在测试环境跑一遍**再上生产
- 涉及 `rm -rf`、`DROP TABLE` 等危险操作，务必让 AI 加了确认步骤再执行
- OrcaTerm 本地终端本质就是你的 Windows Shell，AI 助手给的命令直接跑在真实系统上，操作前看清楚
