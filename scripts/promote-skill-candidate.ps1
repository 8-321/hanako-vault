param(
  [Parameter(Mandatory = $true)]
  [string]$CandidatePath,

  [ValidateSet("codex", "hanako", "user")]
  [string]$Target = "codex",

  [string]$ConfigPath = "",
  [switch]$DryRun,
  [switch]$Force
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptRoot = $PSScriptRoot
$vaultRoot = Split-Path -Parent $scriptRoot
if (-not $ConfigPath) {
  $ConfigPath = Join-Path $vaultRoot "config\codex-closeout.json"
}
if (-not (Test-Path -LiteralPath $ConfigPath)) {
  throw "Closeout config not found: $ConfigPath"
}

$cfg = Get-Content -LiteralPath $ConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json
$candidateFullPath = [System.IO.Path]::GetFullPath($CandidatePath)
$candidateRoot = [System.IO.Path]::GetFullPath((Join-Path $vaultRoot ([string]$cfg.skillCandidateRoot))).TrimEnd("\")
if (-not $candidateFullPath.StartsWith($candidateRoot + "\", [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Candidate must be under: $candidateRoot"
}
if (-not (Test-Path -LiteralPath $candidateFullPath)) {
  throw "Candidate not found: $candidateFullPath"
}

$raw = Get-Content -LiteralPath $candidateFullPath -Raw -Encoding UTF8
$match = [regex]::Match($raw, '(?s)```markdown\s*(?<body>.*?)\s*```')
if (-not $match.Success) {
  throw "No formal SKILL.md markdown block found in candidate."
}

$skillText = $match.Groups["body"].Value.Trim() + [Environment]::NewLine
$nameMatch = [regex]::Match($skillText, "(?m)^name:\s*(?<name>[A-Za-z0-9_\-\u4e00-\u9fff]+)\s*$")
if (-not $nameMatch.Success) {
  throw "No skill name found in formal SKILL.md block."
}

$skillName = $nameMatch.Groups["name"].Value.Trim()
$targetRoot = [string]$cfg.installTargets.$Target
if (-not $targetRoot) {
  throw "Install target not configured: $Target"
}

$destDir = Join-Path $targetRoot $skillName
$destPath = Join-Path $destDir "SKILL.md"

if ((Test-Path -LiteralPath $destPath) -and -not $Force) {
  throw "Skill already exists. Use -Force to overwrite: $destPath"
}

if ($DryRun) {
  [pscustomobject]@{
    DryRun = $true
    Candidate = $candidateFullPath
    Target = $Target
    Destination = $destPath
  } | Format-List | Out-String
  exit 0
}

if (-not (Test-Path -LiteralPath $destDir)) {
  New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}
Set-Content -LiteralPath $destPath -Value $skillText -Encoding UTF8

$promotedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$updated = $raw -replace "(?m)^status:\s*\S+\s*$", "status: promoted"
if ($updated -notlike "*## 转正记录*") {
  $updated += [Environment]::NewLine + "## 转正记录" + [Environment]::NewLine + [Environment]::NewLine
}
$updated += ('- {0} -> `{1}` -> `{2}`' -f $promotedAt, $Target, $destPath) + [Environment]::NewLine
Set-Content -LiteralPath $candidateFullPath -Value $updated -Encoding UTF8

[pscustomobject]@{
  Promoted = $true
  Candidate = $candidateFullPath
  Target = $Target
  Destination = $destPath
} | Format-List | Out-String


