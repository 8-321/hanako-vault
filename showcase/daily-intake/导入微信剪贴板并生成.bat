@echo off
chcp 65001 >nul
cd /d D:\Hanako\DailyIntakeLite
python scripts\import_clipboard.py
python scripts\daily_intake.py
pause
