# Codex 对话沉淀系统

## 目标

每次 Codex 对话结束前，把本次真正有复用价值的东西沉淀进黑曜石：不是重复保存原始聊天全文，而是保存可回看、可检索、可转成 Skill 的结构化记录。

## 五层结构

1. Capture：生成对话备份卡，记录本次做了什么、改了什么、验证了什么。
2. Distill：生成 Skill 候选卡，把本次经验提炼成触发场景、流程、输入、输出和边界。
3. Index：维护两个索引，分别追踪对话沉淀和 Skill 候选。
4. Review：Skill 候选必须先停留在黑曜石里等待检查，不能自动变成正式技能。
5. Promote：Kel 明确要求转正时，再把候选整理成正式 `SKILL.md` 并安装到目标技能目录。

## 固定入口

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\小柯 Ke\黑曜石Vault\scripts\complete-codex-conversation.ps1" `
  -Title "本次对话标题" `
  -Summary "本次对话摘要" `
  -WorkDone "做过的动作" `
  -Decisions "长期决策" `
  -Artifacts "产物和路径" `
  -Verification "验证证据" `
  -Risks "风险和边界" `
  -NextActions "下一步" `
  -SkillName "skill-name" `
  -SkillTitle "Skill 标题" `
  -SkillTriggers "触发场景" `
  -SkillBody "可复用流程"
```

配置文件：

```text
D:\小柯 Ke\黑曜石Vault\config\codex-closeout.json
```

转正入口：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\小柯 Ke\黑曜石Vault\scripts\promote-skill-candidate.ps1" `
  -CandidatePath "D:\小柯 Ke\黑曜石Vault\技能\自动生成\候选\YYYY-MM\candidate.md" `
  -Target codex `
  -DryRun
```

先用 `-DryRun` 看目标路径。Kel 明确说转正后，再去掉 `-DryRun`。

## 写入位置

对话备份卡：

```text
D:\小柯 Ke\黑曜石Vault\收件箱\Codex对话备份\<YYYY-MM>
```

Skill 候选卡：

```text
D:\小柯 Ke\黑曜石Vault\技能\自动生成\候选\<YYYY-MM>
```

对话沉淀索引：

```text
D:\小柯 Ke\黑曜石Vault\备份索引\Codex对话沉淀索引.md
```

Skill 候选索引：

```text
D:\小柯 Ke\黑曜石Vault\技能\Skill候选索引.md
```

## 转正标准

Skill 候选必须满足这些条件，才能转成正式 `SKILL.md`：

- 触发场景明确。
- 流程可重复执行。
- 不含密钥或隐私原文。
- 本地路径已经验证。
- 至少有一次成功运行证据。
- 安装目标明确。

安装目标来自配置：

- `codex`：`D:\CodexHome\skills`
- `hanako`：`C:\Users\huang\.hanako\skills`
- `user`：`C:\Users\huang\.agents\skills`

## 边界

- 不把原始聊天全文当作默认备份内容。
- 不把一次性上下文直接做成正式技能。
- 不自动安装正式 `SKILL.md`。
- 不把黑曜石总备份当实时同步工具。
- 对用户数据做清理前，先列范围、数量和路径。

## 每次收尾检查

Codex 回复最终结果前，检查：

- 是否已经生成对话备份卡。
- 是否已经生成 Skill 候选卡。
- 是否更新两个索引。
- 是否运行黑曜石总备份。
- 是否在最终回复里告诉 Kel 生成了哪些文件。
