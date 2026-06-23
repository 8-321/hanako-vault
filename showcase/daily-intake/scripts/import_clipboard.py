#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从剪贴板导入微信文件传输助手内容。
安全原则：只读剪贴板，不读微信数据库，不改微信文件。
"""
from __future__ import annotations

import re
import subprocess
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LINKS_DIR = ROOT / "inbox" / "links"
NOTES_DIR = ROOT / "inbox" / "notes"
URL_RE = re.compile(r"https?://[^\s<>()\[\]{}\"'，。；、]+", re.I)


def day_str() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def now_stamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def get_clipboard_text() -> str:
    ps = "Get-Clipboard -Raw"
    result = subprocess.run(["powershell.exe", "-NoProfile", "-Command", ps], capture_output=True, text=True, encoding="utf-8", errors="ignore")
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "读取剪贴板失败")
    return result.stdout.strip()


def append_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(text.rstrip() + "\n")


def main() -> None:
    text = get_clipboard_text()
    if not text:
        raise SystemExit("剪贴板是空的。请先在微信文件传输助手复制内容。")
    if URL_RE.search(text):
        target = LINKS_DIR / f"wechat-clipboard-{day_str()}.md"
        append_text(target, text)
        kind = "link"
    else:
        target = NOTES_DIR / f"wechat-clipboard-{day_str()}.md"
        append_text(target, f"## {now_stamp()}\n\n{text}\n")
        kind = "note"
    print(f"已从剪贴板导入：{kind}")
    print(f"写入：{target}")

if __name__ == "__main__":
    main()
