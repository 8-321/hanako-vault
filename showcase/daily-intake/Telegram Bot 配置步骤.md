# Telegram Bot 配置步骤

## 第一次配置

### 1. 手机或电脑打开 Telegram

搜索：

```txt
@BotFather
```

### 2. 创建 Bot

发送：

```txt
/newbot
```

BotFather 会问你两个东西：

1. bot 显示名，比如：`Hanako 收集助手`
2. bot 用户名，必须以 bot 结尾，比如：`hanako_intake_bot`

### 3. 复制 Token

BotFather 会给你一串 token，长这样：

```txt
123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. 填进配置文件

打开：

```txt
D:\Hanako\DailyIntakeLite\config\telegram.json
```

把：

```json
"botToken": "把 Telegram Bot Token 填这里"
```

改成：

```json
"botToken": "你的 token"
```

### 5. 启动助手

双击：

```txt
D:\Hanako\DailyIntakeLite\启动云端收集助手.bat
```

### 6. 手机发消息测试

给你的 Bot 发：

```txt
https://obsidian.md/ 测试自动收集
```

如果 Bot 回复：

```txt
已收进今日信息流：link
```

就成功了。

## 日常使用

之后不用管这些配置。

你只需要：

```txt
把链接、文字、语音转文字发给 Hanako 收集助手
```

晚上双击：

```txt
D:\Hanako\DailyIntakeLite\生成今日信息流.bat
```

## 隐私建议

第一次成功后，建议把 `allowedUserIds` 填上，只允许你自己的 Telegram 账号使用。

如果你不知道自己的 user id，先留空也能用。等第一次日志生成后，我可以帮你从日志里提取。
