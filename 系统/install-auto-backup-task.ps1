$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$autoScript = Join-Path $scriptRoot "auto-backup-and-push.ps1"
$taskName = "ObsidianVault-AutoBackup"

# 静默启动器：VBS 包装，无窗口运行
$vbsPath = Join-Path $env:USERPROFILE "hanako-silent-backup.vbs"
$vbsContent = @"
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""$autoScript""", 0, False
"@
Set-Content -LiteralPath $vbsPath -Value $vbsContent -Encoding Default
Write-Host "Silent launcher created: $vbsPath"

$taskCommand = "wscript.exe `"$vbsPath`""

if (-not (Test-Path -LiteralPath $autoScript)) {
  throw "Auto backup script not found: $autoScript"
}

# 先删旧任务再建（静默模式）
& schtasks /Delete /TN $taskName /F 2>$null
& schtasks /Create /TN $taskName /SC MINUTE /MO 15 /TR $taskCommand /F | Out-Host
if ($LASTEXITCODE -ne 0) {
  throw "Failed to create scheduled task: $taskName"
}

& schtasks /Query /TN $taskName /FO LIST | Out-Host
if ($LASTEXITCODE -ne 0) {
  throw "Failed to query scheduled task: $taskName"
}
