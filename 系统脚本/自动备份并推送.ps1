param(
  [switch]$NoPush
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$vaultRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $vaultRoot "备份索引\运行日志"
$backupScript = Join-Path $PSScriptRoot "备份黑曜石记录.ps1"
$lockPath = Join-Path $logDir "auto-backup.lock"

if (-not (Test-Path -LiteralPath $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $logDir ("auto-backup-" + $stamp + ".log")

function Write-Log {
  param([string]$Text)
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Text
  $line | Tee-Object -FilePath $logPath -Append
}

function Invoke-Git {
  param([string[]]$GitArgs)
  $oldPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $output = & git -C $vaultRoot @GitArgs 2>&1
    $code = $LASTEXITCODE
    foreach ($line in $output) {
      Add-Content -LiteralPath $logPath -Value ($line.ToString()) -Encoding UTF8
    }
    return [int]$code
  } finally {
    $ErrorActionPreference = $oldPreference
  }
}

try {
  if (Test-Path -LiteralPath $lockPath) {
    $age = (Get-Date) - (Get-Item -LiteralPath $lockPath).LastWriteTime
    if ($age.TotalMinutes -lt 30) {
      Write-Log "Skip: another auto backup appears to be running."
      exit 0
    }
    Remove-Item -LiteralPath $lockPath -Force
  }

  New-Item -ItemType File -Path $lockPath -Force | Out-Null

  Write-Log "Start automatic Obsidian backup."
  & powershell -NoProfile -ExecutionPolicy Bypass -File $backupScript 2>&1 | Tee-Object -FilePath $logPath -Append
  if ($LASTEXITCODE -ne 0) {
    throw "Backup script failed with exit code $LASTEXITCODE"
  }

  $status = git -C $vaultRoot status --porcelain
  if ($status) {
    Write-Log "Changes detected. Creating local commit."
    $addCode = Invoke-Git -GitArgs @("add", "-A")
    if ($addCode -ne 0) { throw "git add failed with exit code $addCode" }

    $message = "backup: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    $commitCode = Invoke-Git -GitArgs @("commit", "-m", $message)
    if ($commitCode -ne 0) { throw "git commit failed with exit code $commitCode" }
  } else {
    Write-Log "No local changes after backup."
  }

  if (-not $NoPush) {
    Write-Log "Pushing to GitHub."
    $pushCode = Invoke-Git -GitArgs @("push")
    if ($pushCode -ne 0) {
      Write-Log ("WARN: GitHub push failed with exit code {0}. Local backup remains committed." -f $pushCode)
      exit 0
    }
  }

  Write-Log "Automatic backup finished."
} finally {
  if (Test-Path -LiteralPath $lockPath) {
    Remove-Item -LiteralPath $lockPath -Force
  }
}
