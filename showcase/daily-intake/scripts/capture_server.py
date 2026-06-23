#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DailyIntakeLite Capture Server
手机自动流入口：同一 Wi-Fi 下，手机打开电脑 IP:8765，粘贴/语音输入/快捷指令 POST，自动写入 inbox。
"""
from __future__ import annotations

import json
import re
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs

ROOT = Path(__file__).resolve().parents[1]
LINKS_DIR = ROOT / "inbox" / "links"
NOTES_DIR = ROOT / "inbox" / "notes"
VOICE_DIR = ROOT / "inbox" / "voice"
CAPTURE_LOG = ROOT / "inbox" / "capture-log.jsonl"
URL_RE = re.compile(r"https?://[^\s<>()\[\]{}\"'，。；、]+", re.I)

HTML = """<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Daily Intake Capture</title>
<style>
:root { color-scheme: light dark; }
body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:#f7f3ea; color:#2b2722; }
.wrap { max-width:720px; margin:0 auto; padding:28px 18px 42px; }
.card { background:rgba(255,255,255,.78); border:1px solid rgba(80,60,30,.13); border-radius:22px; padding:20px; box-shadow:0 12px 38px rgba(40,30,10,.08); }
h1 { font-size:25px; margin:4px 0 8px; letter-spacing:.2px; }
p { line-height:1.7; color:#696154; }
textarea { width:100%; min-height:210px; border-radius:18px; border:1px solid #ded4c2; padding:14px; box-sizing:border-box; font-size:17px; line-height:1.6; background:#fffaf1; color:#2b2722; outline:none; }
textarea:focus { border-color:#b89b62; box-shadow:0 0 0 4px rgba(184,155,98,.16); }
button { width:100%; margin-top:14px; border:0; border-radius:999px; padding:15px 18px; font-size:17px; font-weight:700; background:#2f2a23; color:#fffaf1; }
.hint { font-size:14px; color:#83796b; margin-top:12px; }
.row { display:flex; gap:10px; margin-top:12px; flex-wrap:wrap; }
.pill { font-size:13px; background:#eee3d1; color:#5d5142; padding:7px 10px; border-radius:999px; }
@media (prefers-color-scheme: dark) {
  body { background:#181612; color:#f4ead9; }
  .card { background:rgba(38,34,28,.9); border-color:rgba(255,255,255,.12); }
  p,.hint { color:#c8bba8; }
  textarea { background:#211e19; color:#f4ead9; border-color:#574c3d; }
  button { background:#e8d5b5; color:#211e19; }
  .pill { background:#3a3329; color:#dbc7a5; }
}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <h1>Daily Intake Capture</h1>
    <p>把手机上看到的链接、文字、灵感丢进这里。键盘上的麦克风可以直接语音转文字。</p>
    <form method="post" action="/capture">
      <textarea name="text" placeholder="粘贴链接，或直接用手机语音输入。\n\n例：\nhttps://example.com 这篇值得回看\n\n例：\n我突然想到一个选题：……"></textarea>
      <button type="submit">收进今日信息流</button>
    </form>
    <div class="row">
      <span class="pill">链接自动进 links</span>
      <span class="pill">纯文字自动进 notes</span>
      <span class="pill">支持快捷指令 POST</span>
    </div>
    <div class="hint">提交后，在电脑上双击“生成今日信息流.bat”即可汇总到 Obsidian。</div>
  </div>
</div>
</body>
</html>"""


def now_stamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def day_str() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def append_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(text.rstrip() + "\n")


def capture_text(text: str, source: str = "mobile-web") -> dict:
    text = text.strip()
    if not text:
        return {"ok": False, "error": "empty text"}
    has_url = bool(URL_RE.search(text))
    stamp = now_stamp()
    if has_url:
        target = LINKS_DIR / f"mobile-auto-{day_str()}.md"
        append_text(target, text)
        kind = "link"
    else:
        target = NOTES_DIR / f"mobile-auto-{day_str()}.md"
        append_text(target, f"## {stamp}\n\n{text}\n")
        kind = "note"
    CAPTURE_LOG.parent.mkdir(parents=True, exist_ok=True)
    with CAPTURE_LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps({"time": stamp, "source": source, "kind": kind, "target": str(target), "text": text}, ensure_ascii=False) + "\n")
    return {"ok": True, "kind": kind, "target": str(target)}


class Handler(BaseHTTPRequestHandler):
    def _send(self, status: int, body: str | bytes, content_type: str = "text/html; charset=utf-8") -> None:
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path in ("/", "/capture"):
            self._send(200, HTML)
        elif self.path == "/health":
            self._send(200, json.dumps({"ok": True}, ensure_ascii=False), "application/json; charset=utf-8")
        else:
            self._send(404, "Not Found")

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", "0") or "0")
        raw = self.rfile.read(length)
        content_type = self.headers.get("Content-Type", "")
        text = ""
        if "application/json" in content_type:
            try:
                data = json.loads(raw.decode("utf-8", errors="ignore"))
                text = str(data.get("text") or data.get("url") or data.get("content") or "")
            except json.JSONDecodeError:
                text = ""
        else:
            data = parse_qs(raw.decode("utf-8", errors="ignore"))
            text = (data.get("text") or data.get("url") or data.get("content") or [""])[0]
        result = capture_text(text, source="mobile-post")
        wants_json = "application/json" in self.headers.get("Accept", "") or self.path.startswith("/api")
        if wants_json:
            self._send(200 if result.get("ok") else 400, json.dumps(result, ensure_ascii=False), "application/json; charset=utf-8")
        elif result.get("ok"):
            self._send(200, "<meta charset='utf-8'><body style='font-family:sans-serif;padding:32px'>已收进今日信息流。<br><br><a href='/'>继续收集</a></body>")
        else:
            self._send(400, "<meta charset='utf-8'>内容为空")

    def log_message(self, format: str, *args) -> None:
        print(f"[{now_stamp()}] {self.address_string()} {format % args}")


def main() -> None:
    host = "0.0.0.0"
    port = 8765
    server = ThreadingHTTPServer((host, port), Handler)
    print("DailyIntakeLite Capture Server started")
    print(f"Open on computer: http://127.0.0.1:{port}")
    print("Open on phone: http://电脑局域网IP:8765")
    print("Press Ctrl+C to stop")
    server.serve_forever()

if __name__ == "__main__":
    main()
