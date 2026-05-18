$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$autoScript = Join-Path $scriptRoot "自动备份并推送.ps1"
$taskName = "ObsidianVault-AutoBackup"
$encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes("& '$autoScript'"))
$taskCommand = "powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand $encodedCommand"

if (-not (Test-Path -LiteralPath $autoScript)) {
  throw "Auto backup script not found: $autoScript"
}

& schtasks /Create /TN $taskName /SC MINUTE /MO 15 /TR $taskCommand /F | Out-Host
if ($LASTEXITCODE -ne 0) {
  throw "Failed to create scheduled task: $taskName"
}

& schtasks /Query /TN $taskName /FO LIST | Out-Host
if ($LASTEXITCODE -ne 0) {
  throw "Failed to query scheduled task: $taskName"
}
