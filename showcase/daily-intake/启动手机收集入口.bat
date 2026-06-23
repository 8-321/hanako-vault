@echo off
chcp 65001 >nul
cd /d D:\Hanako\DailyIntakeLite
python scripts\capture_server.py
pause
