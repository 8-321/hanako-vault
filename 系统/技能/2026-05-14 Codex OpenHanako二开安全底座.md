---
date: 2026-05-14
tags: [OpenHanako, 二开, 备份]
source: Codex
---

# OpenHanako二开安全底座

## 是什么
在二开 OpenHanako 前，先建立隔离开发区、数据备份和恢复验证的工程安全底座。

## 核心内容
- 顶级方案是 OpenHanako 当主系统二开，Codex 当工程驾驶舱，Hanako 生产数据只读接入，不直接在生产目录里堆脚本。
- Phase 0 先建 `D:\OpenHanakoDev`，建立 dev 数据目录，不碰生产 `.hanako`、`D:\Hanako` 和 HanakoVault 原件。
- 备份必须有快照、清单、校验和恢复演练；复制成功不等于可恢复，必须展开到临时目录对账。
- 插件层可从 `kel-life-os` 入手，把日记、巡检、备份、五个小助理入口接到 OpenHanako 插件机制。

## 注意
二开前先做保险，不要先写功能。Windows 上依赖如 `better-sqlite3` 可能卡本地编译，要先跑最小测试通道。
