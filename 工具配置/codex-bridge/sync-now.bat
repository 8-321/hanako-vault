@echo off
REM Hanako -> Codex 一键同步（把 Hanako 的记忆/经验/人格档复制到 D:\Hanako\codex-bridge）
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync-hanako-to-codex.ps1"
if errorlevel 1 (
  echo 同步失败，请把上面的错误贴给含（Hanako）。
  pause
  exit /b 1
)
echo.
echo ------------------------------------------------------
echo 已把 Hanako 的记忆与经验镜像到：
echo   D:\Hanako\codex-bridge\hanako-mirror
echo 下一步：在 Codex 里对它这个目录做问答或让它读 AGENTS.md
echo ------------------------------------------------------
pause
