# 黑曜石Vault管家

这个 skill 已经安装到：

```text
C:\Users\huang\.agents\skills\obsidian-vault-backup
```

以后你可以这样说：

- 备份黑曜石记录
- 整理黑曜石Vault
- 从黑曜石Vault里找某段旧记录
- 检查三个 Obsidian 库有没有同步到总库
- 把黑曜石Vault推到 GitHub
- 每次 Codex 对话结束时运行对话沉淀系统

系统会优先按这套规则处理：

1. 三个工作库继续分开。
2. `黑曜石Vault` 做总备份和调用入口。
3. `VaultSyncHub` 只同步 `.obsidian` 配置。
4. GitHub 只做历史备份，不做实时同步。
5. 每次 Codex 对话收尾时，运行 `D:\小柯 Ke\黑曜石Vault\scripts\complete-codex-conversation.ps1`，按 Capture、Distill、Index、Review、Promote 五层流程沉淀。

## Codex 对话沉淀规则

系统说明在：

```text
D:\小柯 Ke\黑曜石Vault\99 - Agent指南与规范\Codex对话沉淀系统.md
```

收尾脚本会写入：

- `D:\小柯 Ke\黑曜石Vault\收件箱\Codex对话备份\<YYYY-MM>`
- `D:\小柯 Ke\黑曜石Vault\技能\自动生成\候选\<YYYY-MM>`
- `D:\小柯 Ke\黑曜石Vault\备份索引\Codex对话沉淀索引.md`
- `D:\小柯 Ke\黑曜石Vault\技能\Skill候选索引.md`

生成的 Skill 先作为 Obsidian 候选保存，等 Kel 确认稳定后，再转成正式 `SKILL.md` 放进 Codex 或 Hanako 的技能目录。
