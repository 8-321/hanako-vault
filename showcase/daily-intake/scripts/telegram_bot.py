#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DailyIntakeLite Telegram Bot
手机端极简自动流：把文字/链接/语音发给 Telegram Bot，自动进入 inbox。
"""
from __future__ import annotations

import json
import os
import time
import re
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "telegram.json"
LINKS_DIR = ROOT / "inbox" / "links"
NOTES_DIR = ROOT / "inbox" / "notes"
VOICE_DIR = ROOT / "inbox" / "voice"
LOG_PATH = ROOT / "inbox" / "telegram-log.jsonl"
URL_RE = re.compile(r"https?://[^\s<>()\[\]{}\"'，。；、]+", re.I)


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
        CONFIG_PATH.write_text(json.dumps({
            "botToken": "把 Telegram Bot Token 填这里",
            "allowedUserIds": [],
            "lastUpdateId": 0,
            "autoReply": True
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        raise SystemExit(f"请先填写配置：{CONFIG_PATH}")
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def save_config(config: dict) -> None:
    CONFIG_PATH.write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding="utf-8")


def api(token: str, method: str, params: dict | None = None) -> dict:
    params = params or {}
    url = f"https://api.telegram.org/bot{token}/{method}"
    data = urllib.parse.urlencode(params).encode("utf-8") if params else None
    req = urllib.request.Request(url, data=data)
    with urllib.request.urlopen(req, timeout=35) as resp:
        return json.loads(resp.read().decode("utf-8"))


def day_str() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def now_stamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def append_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(text.rstrip() + "\n")


def log_event(data: dict) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False) + "\n")


def allowed(config: dict, user_id: int) -> bool:
    ids = config.get("allowedUserIds") or []
    return not ids or user_id in ids


def save_capture(text: str, source: str) -> tuple[str, Path]:
    text = text.strip()
    if URL_RE.search(text):
        target = LINKS_DIR / f"telegram-{day_str()}.md"
        append_text(target, text)
        return "link", target
    target = NOTES_DIR / f"telegram-{day_str()}.md"
    append_text(target, f"## {now_stamp()}\n\n{text}\n")
    return "note", target


def download_file(token: str, file_id: str, filename_hint: str) -> Path:
    info = api(token, "getFile", {"file_id": file_id})
    file_path = info["result"]["file_path"]
    ext = Path(file_path).suffix or ".oga"
    target = VOICE_DIR / f"{day_str()}-{filename_hint}{ext}"
    target.parent.mkdir(parents=True, exist_ok=True)
    url = f"https://api.telegram.org/file/bot{token}/{file_path}"
    with urllib.request.urlopen(url, timeout=60) as resp:
        target.write_bytes(resp.read())
    return target


def handle_message(token: str, config: dict, message: dict) -> None:
    chat_id = message["chat"]["id"]
    user = message.get("from", {})
    user_id = int(user.get("id", 0))
    if not allowed(config, user_id):
        api(token, "sendMessage", {"chat_id": chat_id, "text": f"未授权用户：{user_id}"})
        return

    text = message.get("text") or message.get("caption") or ""
    if text.strip():
        kind, target = save_capture(text, "telegram")
        log_event({"time": now_stamp(), "user_id": user_id, "kind": kind, "target": str(target), "text": text})
        if config.get("autoReply", True):
            api(token, "sendMessage", {"chat_id": chat_id, "text": f"已收进今日信息流：{kind}"})
        return

    voice = message.get("voice") or message.get("audio") or message.get("document")
    if voice and voice.get("file_id"):
        target = download_file(token, voice["file_id"], str(message.get("message_id", int(time.time()))))
        log_event({"time": now_stamp(), "user_id": user_id, "kind": "voice_file", "target": str(target)})
        if config.get("autoReply", True):
            api(token, "sendMessage", {"chat_id": chat_id, "text": "语音文件已保存。下一步可接 Whisper 自动转写。"})
        return

    if config.get("autoReply", True):
        api(token, "sendMessage", {"chat_id": chat_id, "text": "这条暂时没有可收集的文字、链接或语音。"})


def main() -> None:
    config = load_config()
    token = os.environ.get("DAILY_INTAKE_TELEGRAM_TOKEN") or config.get("botToken")
    if not token or "填这里" in token:
        raise SystemExit(f"请先在 {CONFIG_PATH} 填写 botToken")
    print("DailyIntakeLite Telegram Bot started")
    print("手机上把文字/链接/语音发给 Bot 即可。按 Ctrl+C 停止。")
    while True:
        try:
            offset = int(config.get("lastUpdateId", 0)) + 1
            data = api(token, "getUpdates", {"offset": offset, "timeout": 25})
            for update in data.get("result", []):
                config["lastUpdateId"] = update["update_id"]
                message = update.get("message") or update.get("edited_message")
                if message:
                    handle_message(token, config, message)
                save_config(config)
        except KeyboardInterrupt:
            print("Stopped")
            break
        except Exception as exc:
            print(f"Error: {exc}")
            time.sleep(5)

if __name__ == "__main__":
    main()
