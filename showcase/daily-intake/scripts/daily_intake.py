#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DailyIntakeLite
把 inbox/links 与 inbox/notes 汇总成一页干净的 Obsidian Daily Intake。
原则：只追加/生成，不删除原始文件，不破坏 Vault 现有内容。
"""
from __future__ import annotations

import json
import re
import hashlib
import html
from dataclasses import dataclass
from datetime import datetime, date
from pathlib import Path
from typing import Iterable
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "settings.json"
LINKS_DIR = ROOT / "inbox" / "links"
NOTES_DIR = ROOT / "inbox" / "notes"
LOCAL_OUTPUT_DIR = ROOT / "output"
CACHE_DIR = ROOT / "cache" / "link_meta"

URL_RE = re.compile(r"https?://[^\s<>()\[\]{}\"'，。；、]+", re.I)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
DESC_RE = re.compile(r"<meta[^>]+(?:name|property)=[\"'](?:description|og:description)[\"'][^>]+content=[\"'](.*?)[\"']", re.I | re.S)
TRACKING_PARAMS_PREFIX = ("utm_",)
TRACKING_PARAMS = {"spm", "from", "ref", "source", "fbclid", "gclid", "yclid", "igshid"}

@dataclass
class LinkItem:
    url: str
    canonical_url: str
    note: str
    source_file: str
    score: int
    title: str = ""
    description: str = ""
    summary: str = ""

@dataclass
class NoteItem:
    title: str
    text: str
    source_file: str


def load_config() -> dict:
    if CONFIG_PATH.exists():
        return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    return {}


def today_local() -> date:
    return datetime.now().date()


def normalize_url(url: str) -> str:
    parsed = urlparse(url.strip())
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    if netloc.startswith("www."):
        netloc = netloc[4:]
    query_items = []
    for k, v in parse_qsl(parsed.query, keep_blank_values=True):
        kl = k.lower()
        if kl in TRACKING_PARAMS or any(kl.startswith(p) for p in TRACKING_PARAMS_PREFIX):
            continue
        query_items.append((k, v))
    query = urlencode(query_items, doseq=True)
    path = parsed.path.rstrip("/") or "/"
    return urlunparse((scheme, netloc, path, "", query, ""))


def file_modified_today(path: Path, day: date) -> bool:
    if path.name.upper() == "README.MD":
        return False
    mtime = datetime.fromtimestamp(path.stat().st_mtime).date()
    return mtime == day


def iter_text_files(folder: Path, day: date) -> Iterable[Path]:
    if not folder.exists():
        return []
    files = []
    for ext in ("*.md", "*.txt"):
        files.extend(folder.rglob(ext))
    return sorted(p for p in files if p.is_file() and file_modified_today(p, day))


def score_link(text: str, hints: list[str]) -> int:
    score = 1
    lower = text.lower()
    for hint in hints:
        if hint.lower() in lower:
            score += 1
    if "github.com" in lower:
        score += 1
    if any(x in lower for x in ["hanako", "obsidian", "agent", "ai"]):
        score += 1
    return min(score, 5)


def make_id(value: str) -> str:
    return hashlib.sha1(value.encode("utf-8")).hexdigest()[:10]


def cache_path_for(canonical_url: str) -> Path:
    return CACHE_DIR / f"{make_id(canonical_url)}.json"


def clean_html_text(value: str) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    return html.unescape(value)


def load_cached_meta(canonical_url: str) -> dict | None:
    path = cache_path_for(canonical_url)
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return None
    return None


def save_cached_meta(canonical_url: str, meta: dict) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path_for(canonical_url).write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")


def fetch_link_meta(url: str, canonical_url: str, timeout: int = 8) -> dict:
    cached = load_cached_meta(canonical_url)
    if cached:
        return cached
    parsed = urlparse(url)
    fallback = {"title": parsed.netloc or canonical_url, "description": "", "ok": False, "error": "not fetched"}
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0 DailyIntakeLite/1.0"})
        with urlopen(req, timeout=timeout) as resp:
            content_type = resp.headers.get("Content-Type", "")
            raw = resp.read(300000)
        if "text/html" not in content_type and b"<html" not in raw[:2000].lower():
            meta = {**fallback, "ok": False, "error": f"unsupported content type: {content_type}"}
            save_cached_meta(canonical_url, meta)
            return meta
        text = raw.decode("utf-8", errors="ignore")
        title_match = TITLE_RE.search(text)
        desc_match = DESC_RE.search(text)
        title = clean_html_text(title_match.group(1)) if title_match else fallback["title"]
        desc = clean_html_text(desc_match.group(1)) if desc_match else ""
        meta = {"title": title[:180], "description": desc[:320], "ok": True, "error": ""}
        save_cached_meta(canonical_url, meta)
        return meta
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        meta = {**fallback, "error": str(exc)[:160]}
        save_cached_meta(canonical_url, meta)
        return meta


def simple_summary(item: LinkItem) -> str:
    domain = urlparse(item.canonical_url).netloc
    if item.description:
        return item.description
    if item.note and item.title:
        return f"{item.note}。页面标题显示它和「{item.title}」有关。"
    if item.note:
        return item.note
    if item.title:
        return f"来自 {domain}，标题是「{item.title}」。"
    return f"来自 {domain}，暂时没有抓到页面摘要。"


def enrich_links(links: list[LinkItem], config: dict) -> list[LinkItem]:
    if not config.get("fetchLinkMeta", True):
        return links
    for item in links:
        meta = fetch_link_meta(item.url, item.canonical_url, int(config.get("fetchTimeoutSeconds", 8)))
        item.title = meta.get("title", "")
        item.description = meta.get("description", "")
        item.summary = simple_summary(item)
    return links


def collect_links(day: date, hints: list[str]) -> list[LinkItem]:
    items: list[LinkItem] = []
    seen: set[str] = set()
    for path in iter_text_files(LINKS_DIR, day):
        text = path.read_text(encoding="utf-8", errors="ignore")
        in_code_block = False
        for line in text.splitlines():
            if line.strip().startswith("```"):
                in_code_block = not in_code_block
                continue
            if in_code_block or line.lstrip().startswith("#"):
                continue
            urls = URL_RE.findall(line)
            for url in urls:
                canonical = normalize_url(url)
                if canonical in seen:
                    continue
                seen.add(canonical)
                note = line.replace(url, "").strip(" -｜|：:")
                source_file = path.relative_to(ROOT).as_posix()
                items.append(LinkItem(url=url, canonical_url=canonical, note=note, source_file=source_file, score=score_link(line, hints)))
    return items


def collect_notes(day: date) -> list[NoteItem]:
    notes: list[NoteItem] = []
    for path in iter_text_files(NOTES_DIR, day):
        text = path.read_text(encoding="utf-8", errors="ignore").strip()
        if not text:
            continue
        first_line = next((line.strip("# ").strip() for line in text.splitlines() if line.strip()), path.stem)
        source_file = path.relative_to(ROOT).as_posix()
        notes.append(NoteItem(title=first_line[:60], text=text, source_file=source_file))
    return notes


def render_markdown(day: date, links: list[LinkItem], notes: list[NoteItem], config: dict) -> str:
    day_str = day.isoformat()
    title = config.get("title", "Daily Intake")
    link_count = len(links)
    note_count = len(notes)
    high_value = [x for x in links if x.score >= 3]

    lines: list[str] = []
    lines.append("<!-- DAILY_INTAKE_AUTO_BEGIN -->")
    lines.append("---")
    lines.append(f"date: {day_str}")
    lines.append("type: daily-intake")
    lines.append(f"links: {link_count}")
    lines.append(f"notes: {note_count}")
    lines.append("status: raw")
    lines.append("---")
    lines.append("")
    lines.append(f"# {title} · {day_str}")
    lines.append("")
    lines.append("> [!quote] 今日入口")
    lines.append("> 今天的信息先像潮水一样进来，我只留下清晰的河道。")
    lines.append("")
    lines.append("## 今日概览")
    lines.append("")
    lines.append(f"- 链接：**{link_count}**")
    lines.append(f"- 笔记：**{note_count}**")
    lines.append(f"- 值得优先回看的内容：**{len(high_value)}**")
    lines.append("")

    lines.append("## 链接总结")
    lines.append("")
    if links:
        for item in links:
            label = item.title or item.note or item.canonical_url
            lines.append(f"### [{label}]({item.url})")
            lines.append("")
            if item.note:
                lines.append(f"- 我的备注：{item.note}")
            lines.append(f"- 一句话总结：{item.summary or simple_summary(item)}")
            lines.append(f"- 来源：`{item.source_file}`")
            lines.append(f"- 指纹：`{make_id(item.canonical_url)}`")
            lines.append("")
    else:
        lines.append("- 暂无链接。")
        lines.append("")

    lines.append("## 值得优先回看")
    lines.append("")
    if high_value:
        for item in sorted(high_value, key=lambda x: x.score, reverse=True):
            label = item.title or item.note or urlparse(item.canonical_url).netloc
            lines.append(f"- [ ] [{label}]({item.url})")
            lines.append(f"  - 分数：{item.score}/5")
            lines.append(f"  - 摘要：{item.summary or simple_summary(item)}")
            lines.append(f"  - 来源：`{item.source_file}`")
    else:
        lines.append("- 今天还没有被规则识别出的高优先级内容。")
    lines.append("")

    lines.append("## 全部链接")
    lines.append("")
    if links:
        for item in links:
            label = item.title or item.note or item.canonical_url
            lines.append(f"- [{label}]({item.url})")
            lines.append(f"  - canonical：`{item.canonical_url}`")
            lines.append(f"  - 来源：`{item.source_file}`")
    else:
        lines.append("- 暂无链接。")
    lines.append("")

    lines.append("## 今日写下")
    lines.append("")
    if notes:
        for note in notes:
            lines.append(f"### {note.title}")
            lines.append("")
            lines.append(f"> 来源：`{note.source_file}`")
            lines.append("")
            for line in note.text.splitlines():
                lines.append(line)
            lines.append("")
    else:
        lines.append("- 暂无笔记。")
    lines.append("")

    lines.append("## 晚间三问")
    lines.append("")
    lines.append("1. 今天哪一条信息值得进入长期项目？")
    lines.append("2. 今天哪一条信息只是噪声，可以放下？")
    lines.append("3. 今天反复出现的主题是什么？")
    lines.append("")
    lines.append("## 下一步")
    lines.append("")
    lines.append("- [ ] 从“值得优先回看”里选 1 条，写成正式笔记。")
    lines.append("- [ ] 把无价值链接留在原始层，不急着整理。")
    lines.append("")
    lines.append("<!-- DAILY_INTAKE_AUTO_END -->")
    lines.append("")
    lines.append("## 手动补充")
    lines.append("")
    lines.append("> 这里可以随手写，脚本再次运行时会保留这一段。")
    lines.append("")
    return "\n".join(lines)


def merge_with_existing(path: Path, generated: str) -> str:
    begin = "<!-- DAILY_INTAKE_AUTO_BEGIN -->"
    end = "<!-- DAILY_INTAKE_AUTO_END -->"
    if not path.exists():
        return generated
    old = path.read_text(encoding="utf-8", errors="ignore")
    if begin in old and end in old:
        before = old.split(begin, 1)[0]
        after = old.split(end, 1)[1]
        auto = generated.split(begin, 1)[1].split(end, 1)[0]
        return before + begin + auto + end + after
    backup = path.with_suffix(path.suffix + ".bak")
    backup.write_text(old, encoding="utf-8")
    return generated


def output_paths(day: date, config: dict) -> list[Path]:
    filename = f"{day.isoformat()}.md"
    paths = [LOCAL_OUTPUT_DIR / filename]
    vault_root = config.get("vaultRoot")
    output_subdir = config.get("outputSubdir", "00-Inbox/Daily-Intake")
    if vault_root:
        paths.append(Path(vault_root) / output_subdir / filename)
    return paths


def write_outputs(day: date, markdown: str, config: dict) -> list[Path]:
    written = []
    for path in output_paths(day, config):
        path.parent.mkdir(parents=True, exist_ok=True)
        final_text = merge_with_existing(path, markdown)
        path.write_text(final_text, encoding="utf-8")
        written.append(path)
    return written


def main() -> None:
    config = load_config()
    day = today_local()
    hints = config.get("minImportanceKeywordHints", [])
    links = collect_links(day, hints)
    links = enrich_links(links, config)
    notes = collect_notes(day)
    markdown = render_markdown(day, links, notes, config)
    written = write_outputs(day, markdown, config)
    print("DailyIntakeLite generated:")
    print(f"  links: {len(links)}")
    print(f"  notes: {len(notes)}")
    for p in written:
        print(f"  -> {p}")

if __name__ == "__main__":
    main()
