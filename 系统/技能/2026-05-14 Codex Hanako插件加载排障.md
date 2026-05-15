---
date: 2026-05-14
tags: [Hanako插件, iframe, 调试]
source: Codex
---

# Hanako插件加载排障

## 是什么
处理 Hanako 插件“服务端 loaded 但界面加载失败”的排障方法。

## 核心内容
- 不能把后端接口能通当成插件成品，必须验证 Hanako 内部 iframe 是否收到 ready 握手消息。
- 桌面端父页面可能是 `file://` 或空来源，插件若用 `document.referrer` 推 targetOrigin，可能得到 `null` 导致消息被丢弃。
- 修复方向是对空来源使用安全的通配目标发送 ready，并补模拟本地父页面的复现测试。
- 验证要覆盖：单元测试、生产目录同步、服务端 loaded、真实父页面 iframe ready 消息。

## 注意
不要靠“多发几次 ready”掩盖根因。若全量测试因内存崩溃，要用单工作进程重跑拿干净结果，不要把进程崩溃说成通过。
