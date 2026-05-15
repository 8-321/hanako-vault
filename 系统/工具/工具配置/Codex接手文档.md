# Codex 接手文档：HanakoVault Obsidian 配置

> 写给 Codex 的交接文档，接手继续配置 Obsidian。

---

## 当前状态

### ✅ 已完成

1. **HanakoVault 创建完毕**
   - 路径：`D:\BELLA KE\项目AI\调教AI\HanakoVault`
   - Git 已初始化，remote: `https://github.com/8-321/hanako-vault.git`
   - 已 push 到 GitHub（private repo）

2. **文件结构**（合并自 D:\Hanako + 旧 ObsidianVault）
   ```
   HanakoVault/
   ├── 主页.md              ← Dataview 仪表盘
   ├── README.md
   ├── HANAKO.md / CLAUDE.md / CURSOR.md / CODEX.md
   ├── Hanako个人助手协议.md
   ├── AI_AGENT启动引导语.txt
   ├── 总索引-点我.md
   ├── AI调教体系索引.md
   ├── 资源索引总表.md
   │
   ├── 日记/               (5篇，2026-05-09 ~ 2026-05-13)
   ├── 对话记录/           (6条历史对话，自动同步)
   ├── 巡检/               (HeartBeat: 含/含章/含舟/含野)
   ├── 技能/               (conversation-archiver, diary, diary-scribe)
   ├── AI调教/             (系统提示词/场景提示词/知识沉淀)
   ├── 技术资料库/         (AGENTS规范、中转站手册等)
   ├── 工作流/             (大项目执行流程、小任务TDD)
   ├── 工具配置/           (Agent配置指南、codex-bridge等)
   ├── 中转站配置/         (模型映射表、API密钥库)
   ├── 模板/               (工单、知识沉淀、踩坑记录)
   └── 附件库/             (avatars、截图)
   ```

3. **.obsidian 配置已写入**
   - `core-plugins.json` — 核心插件开关
   - `app.json` — 基础设置（附件目录=附件库、显示行号等）
   - `appearance.json` — 暗色主题、紫色强调色
   - `community-plugins.json` — 需安装的插件列表
   - `daily-notes.json` — 日记目录指向 日记/
   - `workspace-default.json` — 启动时打开 主页.md
   - `plugins/dataview/data.json` — Dataview 配置
   - `plugins/templater-obsidian/data.json` — 模板目录指向 模板/
   - `plugins/obsidian-git/data.json` — Git 路径 E:/GIT/Git/cmd/git.exe
   - `snippets/hanako-chat.css` — 对话记录美化样式

4. **用户已在 Obsidian 中完成**
   - 社区插件安全模式已关闭
   - 已安装：Dataview、Templater、Calendar、Obsidian Git
   - 已 Enable 以上插件

5. **对话自动同步**
   - 脚本：`D:\BELLA KE\项目AI\Hanako对话导出\scripts\hanako_to_obsidian.py`
   - 入口：`D:\BELLA KE\项目AI\Hanako对话导出\sync.bat`
   - 定时任务：Windows Task Scheduler，每日 09:00
   - 输出目录已更新指向 HanakoVault

---

### ❌ 未完成（需要你接手）

1. **Obsidian 左侧文件列表为空**
   - 原因：之前 Obsidian 打开了错误路径 `HanakoVault\hanako`
   - 已修复 `C:\Users\huang\AppData\Roaming\obsidian\obsidian.json`，指向正确路径
   - 已重启 Obsidian，但未确认是否生效
   - **你需要确认**：Obsidian 左侧是否显示文件列表

2. **CSS 代码片段未生效**
   - 文件在 `.obsidian/snippets/hanako-chat.css`
   - 用户在 设置→外观→CSS代码片段 里看不到
   - 可能原因：Obsidian 启动时重建了 .obsidian 目录
   - **你需要**：确认 snippets 目录是否被 Obsidian 识别，必要时重新创建

3. **Obsidian Git 插件报错**
   - 报错：`Can't find a valid git repository`
   - gitPath 已配置为 `E:/GIT/Git/cmd/git.exe`
   - basePath 为空（Vault 根目录就是 git 仓库）
   - **你需要**：在 Obsidian Git 插件设置里确认 git 路径正确，或让用户手动填写

4. **主页.md Dataview 渲染**
   - 未确认 Dataview 是否正常渲染
   - **你需要**：打开主页.md，确认表格正常显示

---

## 关键路径

| 项目 | 路径 |
|:---|:---|
| Vault | `D:\BELLA KE\项目AI\调教AI\HanakoVault` |
| Obsidian | `E:\obsidian\Obsidian.exe` |
| Git | `E:\GIT\Git\cmd\git.exe` |
| GitHub | `https://github.com/8-321/hanako-vault` |
| 对话同步脚本 | `D:\BELLA KE\项目AI\Hanako对话导出\scripts\hanako_to_obsidian.py` |
| Obsidian 配置 | `C:\Users\huang\AppData\Roaming\obsidian\obsidian.json` |
| Hanako sessions | `C:\Users\huang\.hanako\agents\hanako\sessions\` |

---

## 用户信息

| 项目 | 值 |
|:---|:---|
| 姓名 | BELLA KE |
| GitHub | 8-321 |
| 系统 | Windows 10 |
| 语言 | 中文 |
| 自称 | 小白 |
| 偏好 | 不想自己摸索，要现成方案 |

---

## 你的任务

1. 确认 Obsidian 正确打开 HanakoVault（左侧有文件列表）
2. 确认 Dataview 插件正常工作（主页.md 渲染表格）
3. 修复 CSS 代码片段（如果还是不显示）
4. 修复 Obsidian Git（让它识别到 git 仓库）
5. 如果以上都搞定了，告诉用户"配置完成，可以正常使用了"

---

## 注意事项

- 不要动 `中转站配置/API密钥库.md`（含敏感信息，已 gitignore）
- 不要删除 `D:\Hanako` 和 `D:\BELLA KE\项目AI\调教AI\ObsidianVault`（旧目录，用户确认后再删）
- Git push 可能因网络问题失败，让用户手动在 PowerShell 里跑：
  ```powershell
  cd "D:\BELLA KE\项目AI\调教AI\HanakoVault"
  git push origin main
  ```
