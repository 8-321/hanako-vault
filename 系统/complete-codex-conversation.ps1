param(
  [Parameter(Mandatory = $true)]
  [string]$Title,

  [Parameter(Mandatory = $true)]
  [string]$Summary,

  [string]$ConversationType = "implementation",
  [string]$Importance = "normal",
  [string]$WorkDone = "",
  [string]$Decisions = "",
  [string]$Artifacts = "",
  [string]$Verification = "",
  [string]$Risks = "",
  [string]$NextActions = "",
  [string]$SkillName = "",
  [string]$SkillTitle = "",
  [string]$SkillTriggers = "",
  [string]$SkillBody = "",
  [string]$SkillType = "",
  [string]$InstallTarget = "draft-only",
  [string]$ConfigPath = "",
  [switch]$SkipBackup
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptRoot = $PSScriptRoot
$vaultRoot = Split-Path -Parent $scriptRoot
if (-not $ConfigPath) {
  $ConfigPath = Join-Path $vaultRoot "config\codex-closeout.json"
}

function Ensure-Dir {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function Convert-ToSafeName {
  param([string]$Text)
  $safe = $Text -replace '[\\/:*?"<>|]+', '-'
  $safe = $safe -replace '\s+', ' '
  $safe = $safe.Trim()
  if ($safe.Length -gt 70) {
    $safe = $safe.Substring(0, 70).Trim()
  }
  if (-not $safe) { $safe = "codex-conversation" }
  return $safe
}

function Convert-ToSlug {
  param([string]$Text)
  $slug = $Text.ToLowerInvariant() -replace '[^a-z0-9\u4e00-\u9fff]+', '-'
  $slug = $slug.Trim("-")
  if (-not $slug) { $slug = "codex-skill" }
  if ($slug.Length -gt 48) {
    $slug = $slug.Substring(0, 48).Trim("-")
  }
  return $slug
}

function Convert-ToObsidianLink {
  param(
    [string]$Path,
    [string]$Label
  )
  $relative = [System.IO.Path]::GetFullPath($Path).Substring($vaultRoot.Length + 1)
  $relative = $relative -replace '\\', '/'
  if ($relative.EndsWith(".md")) {
    $relative = $relative.Substring(0, $relative.Length - 3)
  }
  return "[[$relative|$Label]]"
}

function Normalize-Block {
  param(
    [string]$Text,
    [string]$Fallback
  )
  $value = $Text.Trim()
  if ($value) { return $value }
  return $Fallback
}

function Add-IndexEntry {
  param(
    [string]$IndexPath,
    [string]$TitleLine,
    [string]$EntryId,
    [string]$EntryLine,
    [string]$Intro
  )

  Ensure-Dir -Path (Split-Path -Parent $IndexPath)
  if (-not (Test-Path -LiteralPath $IndexPath)) {
    $initial = @(
      "# $TitleLine",
      "",
      $Intro,
      "",
      "## 最新记录",
      ""
    )
    Set-Content -LiteralPath $IndexPath -Value $initial -Encoding UTF8
  }

  $existing = Get-Content -LiteralPath $IndexPath -Raw -Encoding UTF8
  $marker = "<!-- $EntryId -->"
  if ($existing -like "*$marker*") {
    return
  }

  $append = @(
    $marker,
    $EntryLine,
    ""
  )
  Add-Content -LiteralPath $IndexPath -Value $append -Encoding UTF8
}

if (-not (Test-Path -LiteralPath $ConfigPath)) {
  throw "Closeout config not found: $ConfigPath"
}

$cfg = Get-Content -LiteralPath $ConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json
$createdAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$date = Get-Date -Format "yyyy-MM-dd"
$month = Get-Date -Format "yyyy-MM"
$time = Get-Date -Format "HHmmss"
$safeTitle = Convert-ToSafeName -Text $Title
if (-not $SkillTitle) { $SkillTitle = $Title }
if (-not $SkillName) { $SkillName = Convert-ToSlug -Text $SkillTitle }
if (-not $SkillTriggers) { $SkillTriggers = "同类问题再次出现、Kel 要求复用本次做法、需要把经验沉淀成技能" }
if (-not $SkillBody) { $SkillBody = $Summary }
if (-not $SkillType) { $SkillType = [string]$cfg.defaultSkillType }

$conversationRoot = Join-Path $vaultRoot ([string]$cfg.conversationRoot)
$skillRoot = Join-Path $vaultRoot ([string]$cfg.skillCandidateRoot)
$conversationDir = Join-Path $conversationRoot $month
$skillDir = Join-Path $skillRoot $month
$conversationIndex = Join-Path $vaultRoot ([string]$cfg.conversationIndex)
$skillIndex = Join-Path $vaultRoot ([string]$cfg.skillIndex)
$backupScript = Join-Path $vaultRoot ([string]$cfg.backupScript)

Ensure-Dir -Path $conversationDir
Ensure-Dir -Path $skillDir

$idSeed = "$date-$time-$SkillName"
$conversationId = "codex-closeout-$idSeed"
$skillId = "skill-candidate-$idSeed"
$conversationPath = Join-Path $conversationDir ("$date $time - $safeTitle.md")
$skillPath = Join-Path $skillDir ("$date $time - $SkillName.md")

$summaryBlock = Normalize-Block -Text $Summary -Fallback "本次对话没有填写摘要。"
$workBlock = Normalize-Block -Text $WorkDone -Fallback "未单独填写，本次工作见对话摘要。"
$decisionBlock = Normalize-Block -Text $Decisions -Fallback "无新增长期决策。"
$artifactBlock = Normalize-Block -Text $Artifacts -Fallback "无单独列出的产物。"
$verificationBlock = Normalize-Block -Text $Verification -Fallback "未单独填写验证项。"
$riskBlock = Normalize-Block -Text $Risks -Fallback "暂无额外风险记录。"
$nextBlock = Normalize-Block -Text $NextActions -Fallback "暂无下一步。"
$skillBodyBlock = Normalize-Block -Text $SkillBody -Fallback $summaryBlock

$conversationLabel = "$date $time - $Title"
$skillLabel = "$SkillName"
$conversationLinkPlaceholder = Convert-ToObsidianLink -Path $conversationPath -Label $conversationLabel
$skillLink = Convert-ToObsidianLink -Path $skillPath -Label $skillLabel

$checklistLines = @()
foreach ($item in $cfg.promotionChecklist) {
  $checklistLines += "- [ ] $item"
}

$conversationLines = @(
  "---",
  "type: codex-conversation-closeout",
  "id: $conversationId",
  "created: $createdAt",
  "date: $date",
  "month: $month",
  "title: `"$Title`"",
  "conversation_type: $ConversationType",
  "importance: $Importance",
  "skill_candidate: `"$skillPath`"",
  "tags: [codex, 对话备份, 对话沉淀]",
  "---",
  "",
  "# $Title",
  "",
  "## 1. 本次对话摘要",
  "",
  $summaryBlock,
  "",
  "## 2. 已完成动作",
  "",
  $workBlock,
  "",
  "## 3. 长期决策",
  "",
  $decisionBlock,
  "",
  "## 4. 产物与路径",
  "",
  $artifactBlock,
  "",
  "## 5. 验证证据",
  "",
  $verificationBlock,
  "",
  "## 6. 风险与边界",
  "",
  $riskBlock,
  "",
  "## 7. 下一步",
  "",
  $nextBlock,
  "",
  "## 8. Skill 候选",
  "",
  "- $skillLink",
  "",
  "## 9. 收尾状态",
  "",
  "- 对话备份卡：已生成",
  "- Skill 候选卡：已生成",
  "- 总备份：由脚本按参数执行"
)

$skillLines = @(
  "---",
  "type: codex-skill-candidate",
  "id: $skillId",
  "created: $createdAt",
  "status: $($cfg.defaultStatus)",
  "skill_name: $SkillName",
  "skill_type: $SkillType",
  "install_target: $InstallTarget",
  "source_conversation: `"$conversationPath`"",
  "tags: [skill, codex, 自动生成, 候选]",
  "---",
  "",
  "# $SkillTitle",
  "",
  "## 来源",
  "",
  "- 对话：$conversationLinkPlaceholder",
  "- 生成时间：$createdAt",
  "",
  "## 触发场景",
  "",
  $SkillTriggers.Trim(),
  "",
  "## 技能目标",
  "",
  "把本次对话中可重复使用的判断、步骤、脚本、边界和验证方式沉淀成候选技能。",
  "",
  "## 可复用流程",
  "",
  $skillBodyBlock,
  "",
  "## 输入",
  "",
  "- Kel 的具体请求",
  "- 当前本地路径和已有规则",
  "- 本次对话产生的脚本、文档、验证输出",
  "",
  "## 输出",
  "",
  "- 可复用流程",
  "- 关键路径",
  "- 验证方式",
  "- 是否值得转正的判断",
  "",
  "## 转正检查清单",
  ""
) + $checklistLines + @(
  "",
  "## 正式 SKILL.md 草案",
  "",
  '```markdown',
  "---",
  "name: $SkillName",
  "description: `"$SkillTriggers`"",
  "---",
  "",
  "# $SkillTitle",
  "",
  "## 触发场景",
  "",
  $SkillTriggers.Trim(),
  "",
  "## 工作流程",
  "",
  $skillBodyBlock,
  "",
  "## 注意事项",
  "",
  "- 先检查真实本地路径和现有规则，再写入或修改。",
  "- 不把原始聊天全文当成技能，只沉淀稳定流程。",
  "- 转正前确认不含密钥、隐私原文或一次性上下文。",
  '```'
)

Set-Content -LiteralPath $conversationPath -Value $conversationLines -Encoding UTF8
Set-Content -LiteralPath $skillPath -Value $skillLines -Encoding UTF8

$conversationEntry = "- $createdAt | $ConversationType | $Importance | $conversationLinkPlaceholder | Skill: $skillLink"
Add-IndexEntry -IndexPath $conversationIndex -TitleLine "Codex 对话沉淀索引" -EntryId $conversationId -EntryLine $conversationEntry -Intro "这里按时间记录 Codex 每次对话收尾时沉淀下来的备份卡和 Skill 候选。"

$skillEntry = "- $createdAt | $SkillType | $($cfg.defaultStatus) | $skillLink | Source: $conversationLinkPlaceholder"
Add-IndexEntry -IndexPath $skillIndex -TitleLine "Skill 候选索引" -EntryId $skillId -EntryLine $skillEntry -Intro "这里集中管理从 Codex 对话中自动生成的 Skill 候选。候选不是正式技能，转正前需要人工确认。"

if (-not $SkipBackup) {
  & powershell -NoProfile -ExecutionPolicy Bypass -File $backupScript -SkipGeneratedAt
  if ($LASTEXITCODE -ne 0) {
    throw "Backup failed with exit code $LASTEXITCODE"
  }
}

[pscustomobject]@{
  ConversationBackup = $conversationPath
  SkillCandidate = $skillPath
  ConversationIndex = $conversationIndex
  SkillIndex = $skillIndex
  BackupRan = (-not $SkipBackup)
} | Format-List | Out-String




