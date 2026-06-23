#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""配置 Telegram Bot Token。"""
from __future__ import annotations

import json
from getpass import getpass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "telegram.json"


def main() -> None:
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    if CONFIG_PATH.exists():
        config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    else:
        config = {}
    print("DailyIntakeLite Telegram Bot 配置")
    print("请从 @BotFather 复制 Bot Token，粘贴到这里。")
    token = getpass("Bot Token: ").strip()
    if not token or ":" not in token:
        raise SystemExit("Token 格式不对，已取消。")
    config["botToken"] = token
    config.setdefault("allowedUserIds", [])
    config.setdefault("lastUpdateId", 0)
    config.setdefault("autoReply", True)
    CONFIG_PATH.write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"已写入：{CONFIG_PATH}")
    print("下一步双击：启动云端收集助手.bat")

if __name__ == "__main__":
    main()
