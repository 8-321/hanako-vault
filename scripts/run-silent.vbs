' ObsidianVault 静默备份启动器
' 无窗口运行 auto-backup-and-push.ps1
Set WshShell = CreateObject("WScript.Shell")
scriptPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
ps1Path = scriptPath & "\auto-backup-and-push.ps1"

WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & ps1Path & """", 0, False
