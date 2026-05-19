---
title: "只读检查当前工作区 D:\BELLA KE\项目AI\最小Mvp"
date: 2026-05-19
time: 09:46
source: Codex
session_id: "019e3fa1-2ec1-7881-b225-2200e1194663"
originator: "Codex Desktop"
cwd: "D:\BELLA KE\项目AI\最小Mvp"
tags: [对话记录, codex]
---

# 只读检查当前工作区 D:\BELLA KE\项目AI\最小Mvp

> 日期：2026-05-19 09:46
> 来源：Codex Desktop
> 工作目录：`D:\BELLA KE\项目AI\最小Mvp`

---

> [!question]+ 你
> 请只读检查当前工作区 D:\BELLA KE\项目AI\最小Mvp 的微信小程序实现，重点看 wechat-miniprogram/pages/index/index.js/wxml/wxss 和 project.config.json。目标：提出如何在微信小程序里实现本地记录备份、自定义/编辑词条、重开不丢数据，并指出可能导致上传失败或中文乱码/文字溢出的风险。不要改文件。输出简短可执行建议。

**Codex**

我会先按本地规则做只读检查，只看你点名的几个文件，不改动任何内容。然后把风险和可执行改法压缩成一版短清单给你。

---

**Codex**

Using `using-superpowers` 和 `huang-user-profile`：前者保证我先按本地工作流检查，后者提醒我用中文、少废话、直接给 kel 可执行建议。现在开始读小程序入口页和配置文件。

---

**Codex**

入口页已经读到：目前数据全在页面内存和硬编码数组里，重开会重新洗牌，确实没有持久化层。`project.config.json` 不在 `wechat-miniprogram` 子目录下，我再只读定位它的实际位置。

---

**Codex**

kel，我做了只读检查，没改文件。

**当前结论**
现在实现是纯内存小游戏：词条写死在 `wechat-miniprogram/pages/index/index.js` 的 `fragmentBank`，页面初始化和重开都用 `Date.now()` 重新生成状态，所以关闭小程序、杀进程、点重开都会丢当前记录。

**建议改法**
1. 本地不丢数据：加 `wx.setStorageSync / wx.getStorageSync`，用固定 key，比如 `moonlight:v1`，保存 `fragments / placements / light / streak / updatedAt / customTerms`。
2. 自动恢复：在 `onLoad` 里先读本地存档；有存档就恢复，没有才 `createViewState()`。
3. 每次操作后保存：`placeSelected()` 成功投放后立刻保存；`selectFragment()` 可不保存，避免频繁写。
4. 重开不清数据：现在 `resetRound()` 会直接新建状态。建议改成“新一轮”只重置当前局面，但保留 `customTerms` 和历史记录；另做一个“清空数据”按钮，并加二次确认。
5. 自定义/编辑词条：把现在硬编码的 `fragmentBank` 拆成“默认词条 + 用户词条”。用户词条存在本地，字段至少包含 `id,label,mood,weight,bestBox,createdAt,updatedAt`，支持新增、编辑、删除、启用/停用。
6. 本地备份：简单版先做“导出 JSON 文本 / 导入 JSON 文本”；进阶版用 `wx.getFileSystemManager().writeFile` 写到 `wx.env.USER_DATA_PATH`，再提供分享/复制备份内容。导入时校验 JSON 版本和字段，别直接覆盖。

**风险点**
- 上传失败：`project.config.json` 在项目根目录，不在 `wechat-miniprogram` 里面；微信开发者工具要打开 `D:\BELLA KE\项目AI\最小Mvp`，不是子目录。否则可能找不到配置。
- 上传权限：`appid` 已写死为 `wx669bf4366c75627d`，如果当前微信号不是该小程序成员，会上传失败。
- 版本风险：`libVersion: "latest"` 不够稳定，建议发布前固定一个测试通过的基础库版本。
- 中文乱码：当前文件按 UTF-8 读取正常；后续导入/导出 JSON 时也要统一 UTF-8，不要用系统默认编码。
- 文字溢出：现在很多地方用了单行省略，比如 `.brand-subtitle`、`.fragment-label`、`.box-title`。一旦允许用户自定义长词条，文字不会撑爆，但会被截断。建议自定义词条页允许两行显示，主界面保留省略，并限制 `label` 8-12 个中文字、`mood` 2-4 个字。
- 视觉遮挡：底部 dock 是 fixed，页面底部 padding 现在是 `300rpx`，如果未来词条更多或字体变大，要继续保留足够底部留白，避免最后一块内容被底栏挡住。

---
