---
date: 2026-05-18
tags: [巡检, 索引, 清理]
---

# 2026-05-18 14:20 巡检

**状态：健康。**

## 搜索索引

`build-index.py` 重建完成。索引覆盖 782 个文件，总计 1.6MB。

## 重复文件

扫描主目录（排除 venv/node_modules/归档/quarantine/ppt-master），清理 9 个旧时间戳版本：
- `SearchReports/` ×1
- `HeartBeat/含/duplicate-reports/` ×2
- `HeartBeat/含/duplicate-scan-*` ×2（保留 latest/report 各一）
- `.hanako-patrol/` ×2
- `HeartBeat/含/build-index-*` ×1
- `scan_err.txt` ×1（空文件）

ppt-project 的 backup 目录、codex-bridge mirror 目录、.obsidian 空 JSON 均为合理重复，保留不动。
