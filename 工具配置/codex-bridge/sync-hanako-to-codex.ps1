param(
  [string]$Source = "C:\Users\huang\.hanako",
  [string]$Dest   = "D:\Hanako\codex-bridge\hanako-mirror"
)

$ErrorActionPreference = "Stop"
Write-Host "[sync] Start: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "[sync] Source: $Source"
Write-Host "[sync] Dest:   $Dest"

if (!(Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }

# agents/hanako key files
$agentSrc = Join-Path $Source "agents\hanako"
$agentDst = Join-Path $Dest  "agents\hanako"

$includeFiles = @(
  "identity.md",
  "description.md",
  "pinned.md",
  "experience.md",
  "ishiki.md",
  "public-ishiki.md",
  "config.yaml",
  "channels.md"
)

New-Item -ItemType Directory -Path $agentDst -Force | Out-Null
foreach ($f in $includeFiles) {
  $sp = Join-Path $agentSrc $f
  if (Test-Path $sp) { Copy-Item $sp $agentDst -Force }
}

# mirror: memory / experience / learned-skills
$mirrors = @(
  @{ From = Join-Path $agentSrc "memory";          To = Join-Path $agentDst "memory" },
  @{ From = Join-Path $agentSrc "experience";      To = Join-Path $agentDst "experience" },
  @{ From = Join-Path $agentSrc "learned-skills";  To = Join-Path $agentDst "learned-skills" }
)
foreach ($m in $mirrors) {
  if (!(Test-Path $m.From)) { continue }
  robocopy $m.From $m.To /MIR /R:1 /W:1 /NFL /NDL /NP /XF *.db-shm *.db-wal | Out-Null
}

# global skills
$skillSrc = Join-Path $Source "skills"
$skillDst = Join-Path $Dest  "skills"
if (Test-Path $skillSrc) {
  robocopy $skillSrc $skillDst /MIR /R:1 /W:1 /NFL /NDL /NP | Out-Null
}

# sync stamp
$stamp = @{ time = (Get-Date).ToString("o"); source = $Source; dest = $Dest } | ConvertTo-Json
Set-Content -Path (Join-Path $Dest ".last-sync.json") -Value $stamp -Encoding UTF8

Write-Host "[sync] Done: $(Get-Date -Format 'HH:mm:ss')"
