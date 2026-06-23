# DailyIntakeLite

一个极简、美观、小白可用的每日信息流统一器。

它先不折腾 Docker、不装一堆服务，只做一件事：

> 把你每天丢进 inbox 的链接和笔记，自动生成一页 Obsidian Daily Intake。

## 使用方式

1. 链接放到：`inbox/links/`
2. 笔记放到：`inbox/notes/`
3. 运行：`python scripts/daily_intake.py`
4. 输出会写入你的 HanakoVault：`00-Inbox/Daily-Intake/`

## 设计原则

- 不删原始文件
- 不覆盖用户内容
- 不强依赖 Docker
- 不先上复杂数据库
- 先让每日闭环跑起来

后续可选增强：浏览器书签导入、ActivityWatch、Karakeep、RSSHub。
