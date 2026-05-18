param(
  [switch]$NoPush
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$vaultRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $vaultRoot "备份索引\运行日志"
$backupScript = Join-Path $PSScriptRoot "backup-obsidian-records.ps1"
$lockPath = Join-Path $logDir "auto-backup.lock"
$statusPath = Join-Path $vaultRoot "备份索引\自动备份状态.md"

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

function Write-StatusPage {
  param(
    [string]$State,
    [string]$Detail,
    [string]$LastCommit = "",
    [string]$RemoteState = ""
  )

  $taskLine = ""
  $taskQuery = & schtasks /Query /TN "ObsidianVault-AutoBackup" /FO LIST 2>$null
  if ($LASTEXITCODE -eq 0) {
    $match = $taskQuery | Select-String -Pattern "Next Run Time|下次运行时间" | Select-Object -First 1
    if ($match) { $taskLine = $match.ToString() }
  }

  $lines = @(
    "# 黑曜石Vault 自动备份状态",
    "",
    ("更新时间：{0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss")),
    "",
    ("状态：{0}" -f $State),
    "",
    ("说明：{0}" -f $Detail),
    "",
    ("最近提交：{0}" -f $LastCommit),
    "",
    ("远端状态：{0}" -f $RemoteState),
    "",
    ("计划任务：{0}" -f $taskLine),
    "",
    "## 怎么判断正常",
    "",
    "- 状态显示 OK 或 WARN，本地备份都已经保存。",
    "- WARN 通常表示 GitHub 网络推送失败，本地提交仍在。",
    "- 如果长时间没有更新，重新运行 `一键安装自动备份.bat`。"
  )

  Set-Content -LiteralPath $statusPath -Value $lines -Encoding UTF8
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
  & powershell -NoProfile -ExecutionPolicy Bypass -File $backupScript -SkipGeneratedAt 2>&1 | Tee-Object -FilePath $logPath -Append
  if ($LASTEXITCODE -ne 0) {
    throw "Backup script failed with exit code $LASTEXITCODE"
  }

  $status = git -C $vaultRoot status --porcelain --untracked-files=all
  $status = $status | Where-Object { $_ -notmatch "备份索引/自动备份状态\.md$" }
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

  $lastCommit = (git -C $vaultRoot log -1 --format="%h %s")
  $remoteState = "not checked"

  if (-not $NoPush) {
    Write-Log "Pushing to GitHub."
    $pushCode = Invoke-Git -GitArgs @("push")
    if ($pushCode -ne 0) {
      Write-Log ("WARN: GitHub push failed with exit code {0}. Local backup remains committed." -f $pushCode)
      Write-StatusPage -State "WARN" -Detail "本地备份已保存，但 GitHub 推送失败；下次会继续尝试。" -LastCommit $lastCommit -RemoteState "push failed"
      exit 0
    }
    $remoteState = "pushed"
  }

  Write-StatusPage -State "OK" -Detail "本地备份已完成，GitHub 推送已尝试。" -LastCommit $lastCommit -RemoteState $remoteState
  Write-Log "Automatic backup finished."
} finally {
  if (Test-Path -LiteralPath $lockPath) {
    Remove-Item -LiteralPath $lockPath -Force
  }
}
