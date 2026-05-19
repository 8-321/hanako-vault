# AI 智能体控制手机与工作流完整教程

> **来源**：AI智能体控制手机与工作流资料包（共7章节）
> **整理日期**：2026-05-06
> **核心目标**：搭建完整的 AI 微信助理 + 手机自动化系统

---

## 一、系统总览与方案选型

### 核心目标

```
能力 A：让 AI 能看懂和操作微信/手机界面
能力 B：把 AI 的能力编排成自动化工作流
         ↓
完整形态：收到消息 → AI 思考 → 自动回复 + 触发一系列后续动作
```

### 方案对比

| 方案 | 技术原理 | 控制微信 | AI接入 | 稳定性 | 难度 | 封号风险 |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| **A. PC微信 + wxauto（推荐新手）** | Python 模拟点击PC微信 | ✅ | ✅ | 中 | ⭐⭐ | 低 |
| **B. 手机 + ADB + DroidRun** | AI 看截图控制安卓 | ✅ | ✅ | 中 | ⭐⭐⭐ | 低 |
| **C. 微信协议注入（Hook）** | 注入微信内存拦截数据 | ✅ | ✅ | 高 | ⭐⭐⭐⭐ | **高！** |
| **D. 企业微信官方API** | 调用官方接口 | ✅（企业微信） | ✅ | 极高 | ⭐⭐ | 无 |
| **E. n8n / Coze 云端工作流** | 可视化工作流平台 | 需配合上述方案 | ✅ | 极高 | ⭐ | 无 |

### 推荐组合方案（全套架构）

```
微信消息输入                手机操作触发
PC微信 + wxauto            安卓手机 + ADB
       │                         │
       └──────────┬──────────────┘
                  ▼
         n8n 工作流平台（调度中心）
                  │
       ┌──────────┼──────────────┐
       ▼          ▼              ▼
    AI 模型     数据库/表格    其他 API
  (中转站)      (记录对话)    (邮件/推送等)
       │
       ▼
   回复消息 / 执行动作
```

---

## 二、第二章：PC微信AI机器人（wxauto）

### 核心工具

- **wxauto**：https://github.com/cluic/wxauto
- **增强版HTTP API**：https://gitee.com/timiyangjun/WXAUTO-HTTP-API（推荐，可以让任何语言调用）
- **适配微信版本**：微信 3.9.x（推荐，微信 4.0 目前兼容性不稳定）

### 安装步骤

```bash
# 安装 Python 3.10+（确保勾选 Add Python to PATH）
python --version

# 安装 wxauto（国内镜像加速）
pip install wxauto -i https://pypi.tuna.tsinghua.edu.cn/simple

# 或安装 HTTP API 版（推荐）
pip install wxauto-http-api
wxauto-http-api start  # 默认 http://localhost:8000
```

### 基础测试

```python
from wxauto import WeChat

wx = WeChat()
wx.SendMsg('你好，这是一条自动发送的测试消息', '文件传输助手')
print("消息发送成功！")
```

### AI自动回复机器人（完整代码）

```python
import time
from wxauto import WeChat
from openai import OpenAI

# ===== 配置区域 =====
API_BASE_URL = "http://149.28.143.114:3000/v1"  # 中转站地址
API_KEY = "你的API密钥"  # 从中转站获取
MODEL_NAME = "deepseek-ai/DeepSeek-V3"
BOT_NAME = "AI助理"

LISTEN_LIST = ['文件传输助手', '好友A的备注名']

# ===== 初始化 =====
client = OpenAI(api_key=API_KEY, base_url=API_BASE_URL)
wx = WeChat()
chat_history = {}

def get_ai_reply(user_id: str, user_message: str) -> str:
    if user_id not in chat_history:
        chat_history[user_id] = [
            {"role": "system", "content": f"你是{BOT_NAME}，一个友好、专业的AI助手。请用简洁、自然的语言回复。"}
        ]
    chat_history[user_id].append({"role": "user", "content": user_message})
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=chat_history[user_id],
            max_tokens=500,
            temperature=0.7
        )
        reply = response.choices[0].message.content
        chat_history[user_id].append({"role": "assistant", "content": reply})
        if len(chat_history[user_id]) > 21:
            chat_history[user_id] = [chat_history[user_id][0]] + chat_history[user_id][-20:]
        return reply
    except Exception as e:
        print(f"AI调用出错: {e}")
        return "抱歉，我暂时无法回复，请稍后再试。"

def main():
    print(f"🤖 {BOT_NAME} 已启动，正在监听消息...")
    for name in LISTEN_LIST:
        wx.AddListenChat(who=name, savepic=False)
    while True:
        try:
            msgs = wx.GetListenMessage()
            for chat in msgs:
                who = chat.who
                for msg in chat.content:
                    sender, content = msg[0], msg[1]
                    if sender == 'Self' or not content or content.startswith('['):
                        continue
                    print(f"📩 收到来自 [{who}] 的消息：{content}")
                    reply = get_ai_reply(user_id=who, user_message=content)
                    print(f"🤖 AI 回复：{reply}")
                    wx.SendMsg(reply, who)
                    time.sleep(1)
        except Exception as e:
            print(f"出错了: {e}")
            time.sleep(5)
        time.sleep(2)

if __name__ == "__main__":
    main()
```

### 进阶功能

**群聊AI机器人（被@才回复）**：
```python
if f'@{BOT_NAME}' in content or '小助手' in content:
    real_question = content.replace(f'@{BOT_NAME}', '').strip()
    reply = get_ai_reply(user_id=who, user_message=real_question)
    wx.SendMsg(f'@{sender} {reply}', who)
```

**关键词快捷指令**：
```python
if content == '/帮助':
    reply = "支持的指令：\n/天气 [城市] - 查询天气\n/时间 - 获取当前时间"
elif content.startswith('/天气'):
    city = content.replace('/天气', '').strip()
    reply = f"正在查询{city}的天气..."
else:
    reply = get_ai_reply(user_id=who, user_message=content)
```

**定时主动发送消息**：
```python
import schedule
import threading

def send_morning_report():
    msg = get_ai_reply("daily", "请给我一段简短的早间问候")
    for name in LISTEN_LIST:
        wx.SendMsg(msg, name)

schedule.every().day.at("08:00").do(send_morning_report)

def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(60)

threading.Thread(target=run_scheduler, daemon=True).start()
```

### 安全注意事项

| 注意点 | 说明 |
|:---|:---|
| 不要大量群发 | 单个账号每天主动发消息建议不超过 50 条 |
| 不要发营销内容 | 容易被举报导致封号 |
| 机器人标识 | 建议在回复开头加"[AI]"字样 |
| 备用账号 | 用小号跑机器人，主号不做自动化 |
| 微信不要最小化 | wxauto 需要微信窗口可见 |
| 定期检查 | 每天确认机器人还在正常运行 |

---

## 三、第三章：AI控制手机（DroidRun + ADB）

### 工作原理

```
你的指令（自然语言）
      ↓
AI 分析当前手机截图
      ↓
AI 决定下一步动作（点击/滑动/输入）
      ↓
通过 ADB 执行操作
      ↓
继续截图 → 判断是否完成 → 循环直到任务完成
```

**DroidRun GitHub**：https://github.com/droidrun/droidrun  
**官网**：https://droidrun.ai

### 准备工作

**Step 1：在手机上开启开发者模式和USB调试**
```
设置 → 关于手机 → 连续点击「MIUI版本/系统版本」7次 → 进入开发者模式
设置 → 更多设置 → 开发者选项 → 打开「USB调试」
连上电脑后手机会弹出「允许USB调试」提示，点「始终允许」
```

**Step 2：在电脑上安装 ADB**
```bash
# Windows：下载 Platform Tools
# https://developer.android.com/studio/releases/platform-tools
# 解压到 C:\adb\，添加到 PATH

# 验证
adb version
adb devices  # 应显示设备ID
```

**Step 3：安装 DroidRun**
```bash
pip install droidrun
pip install openai pillow
```

### 推荐视觉模型

| 模型 | 提供商 | 价格 | 视觉能力 |
|:---|:---|---:|:---:|
| `gemini-2.0-flash` | Google AI Studio | 免费 | ⭐⭐⭐⭐⭐ |
| `gpt-4o` | OpenAI / 中转站 | 付费 | ⭐⭐⭐⭐⭐ |
| `qwen-vl-max` | 阿里云百炼 | 低价 | ⭐⭐⭐⭐ |

**免费首选**：Google Gemini 2.0 Flash，每天 1500 次免费额度。

### 使用方式

**命令行方式**：
```bash
droidrun "打开微信，找到文件传输助手，发送消息：你好，这是一条测试消息"
droidrun "打开相机，拍一张照片，返回主屏幕"
droidrun "下拉通知栏，读取所有通知内容，然后关闭"
```

**Python脚本方式**：
```python
import asyncio
from droidrun import DroidAgent
from droidrun.tools import load_tools

async def main():
    llm_config = {
        "provider": "openai",
        "model": "gemini-2.0-flash",
        "api_key": "你的API Key",
        "base_url": "http://149.28.143.114:3000/v1",  # 中转站
    }
    tools = load_tools()
    agent = DroidAgent(
        task="打开微信，在搜索框搜索'文件传输助手'，点击进入，输入'你好世界'，发送",
        llm_config=llm_config,
        tools=tools,
        max_steps=20
    )
    result = await agent.run()
    print(f"任务结果：{result}")

asyncio.run(main())
```

### WiFi无线连接（不需要USB）

```bash
# Step 1：先用USB连接
adb tcpip 5555

# Step 2：拔掉USB，查看手机WiFi IP（设置→WLAN→已连接网络→详情）
# 假设手机IP是 192.168.1.100

# Step 3：用WiFi连接
adb connect 192.168.1.100:5555

# 之后每次开机，只需执行
adb connect 192.168.1.100:5555
```

### 常见问题

| 问题 | 解决 |
|:---|:---|
| AI执行很慢 | 使用响应快的模型（Gemini Flash） |
| 执行到一半失败 | 增加 `max_steps`，或把任务拆成多个简单任务 |
| 能控制iPhone吗 | DroidRun主要支持Android，iOS需要Appium或Maestro |

---

## 四、第四章：n8n工作流平台

### n8n 是什么

可视化的自动化工作流平台，类似 Coze 的工作流功能，完全自建、数据不出门、可连接任意 API。

**GitHub**：https://github.com/n8n-io/n8n（136K+ stars）

### Docker部署

```bash
mkdir -p /opt/n8n && cd /opt/n8n
nano docker-compose.yml
```

```yaml
version: '3'
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PORT=5678
      - WEBHOOK_URL=https://n8n.yourdomain.com
      - GENERIC_TIMEZONE=Asia/Shanghai
      - TZ=Asia/Shanghai
    volumes:
      - n8n_data:/home/node/.n8n
      - /opt/n8n/files:/files

volumes:
  n8n_data:
```

```bash
docker compose up -d
# 访问：http://服务器IP:5678
```

### 实战案例1：每日定时AI早报

```
[Schedule 触发器] → [OpenAI 节点] → [HTTP Request 节点（发到接收端）]
```

节点配置：
1. **Schedule Trigger**：Cron 表达式 `0 8 * * *`（每天8点）
2. **OpenAI**：Prompt `今天是{{$now.format('YYYY年MM月DD日')}}，请用温暖轻松的语气写一段早安问候，50字以内`
3. **HTTP Request**：POST 到微信 API，Body `{"who": "文件传输助手", "msg": "{{$json.message.content}}"}`

### 实战案例2：Webhook接收微信消息→AI回复

```
微信消息 → wxauto → n8n Webhook → AI节点 → 回复微信
```

节点配置：
1. **Webhook**：POST Path `/wechat-reply`
2. **OpenAI / HTTP Request**：使用中转站接口
3. **HTTP Request**：发回给 wxauto API

### n8n 工作流与 wxauto 集成

```python
# wxauto 脚本中调用 n8n
import requests

def send_to_n8n(who: str, message: str):
    n8n_webhook_url = "https://n8n.yourdomain.com/webhook/wechat-reply"
    payload = {"who": who, "message": message}
    response = requests.post(n8n_webhook_url, json=payload)
    return response.json()

# 在主循环里
reply_data = send_to_n8n(who=who, content=content)
```

### n8n 调用 Python 脚本

```python
# simple_api.py
from fastapi import FastAPI
from wxauto import WeChat
import uvicorn

app = FastAPI()
wx = WeChat()

@app.post("/send_wechat")
async def send_wechat(who: str, msg: str):
    wx.SendMsg(msg, who)
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

### 常用节点速查

| 节点名 | 用途 |
|:---|:---|
| `Schedule Trigger` | 定时触发（支持Cron表达式） |
| `Webhook` | 接收外部HTTP请求 |
| `HTTP Request` | 发起HTTP请求（调用任意API） |
| `OpenAI` | 调用OpenAI兼容接口 |
| `Code` | 执行自定义JavaScript代码 |
| `IF` | 条件判断分支 |
| `Set` | 设置/转换变量 |
| `MySQL / PostgreSQL` | 操作数据库 |
| `Gmail` | 收发邮件 |

---

## 五、第五章：完整整合实战

### 系统总览

```
┌──────────────────────────────────────────────────────────────────┐
│                        Windows 电脑                              │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              wechat_agent.py（主程序）                   │     │
│  │  PC微信（需登录）                                         │     │
│  │       ↓ wxauto 监听                                     │     │
│  │  收到消息                                                 │     │
│  │       ↓                                                  │     │
│  │  关键词路由                                               │     │
│  │  ├─ 普通问答 → 直接调AI回复                               │     │
│  │  ├─ /记录   → 发给 n8n 存入表格                          │     │
│  │  ├─ /查询   → 发给 n8n 查数据库                          │     │
│  │  └─ /手机   → 调用 DroidRun 操控手机                      │     │
│  │       ↓                                                  │     │
│  │  回复结果发回给微信                                       │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌──────────────┐    ┌───────────────┐    ┌────────────────┐    │
│  │   n8n 工作流  │    │  中转站        │    │  安卓手机+ADB  │    │
│  │  (定时/逻辑)  │    │  (AI模型接口)  │    │  (DroidRun)   │    │
│  └──────────────┘    └───────────────┘    └────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### 完整整合代码

```python
"""
AI 微信助理主程序
集成：wxauto + OpenAI API + n8n + DroidRun
"""
import time, asyncio, requests, threading, schedule
from wxauto import WeChat
from openai import OpenAI

# ==================== 配置区 ====================
API_BASE_URL = "http://149.28.143.114:3000/v1"
API_KEY = "sk-你的API密钥"
MODEL_NAME = "deepseek-ai/DeepSeek-V3"
BOT_NAME = "AI助理"

LISTEN_LIST = ['文件传输助手', '你的群聊名']
N8N_WEBHOOK_URL = "https://n8n.yourdomain.com/webhook/wechat"
MORNING_REPORT_TARGET = '文件传输助手'

# ==================== 初始化 ====================
client = OpenAI(api_key=API_KEY, base_url=API_BASE_URL)
wx = WeChat()
chat_history = {}

def ai_chat(user_id: str, message: str, system_prompt: str = None) -> str:
    if user_id not in chat_history:
        default_system = f"你是{BOT_NAME}，一个聪明、友好的AI助手。"
        chat_history[user_id] = [{"role": "system", "content": system_prompt or default_system}]
    chat_history[user_id].append({"role": "user", "content": message})
    try:
        resp = client.chat.completions.create(
            model=MODEL_NAME,
            messages=chat_history[user_id],
            max_tokens=400,
            temperature=0.7
        )
        reply = resp.choices[0].message.content
        chat_history[user_id].append({"role": "assistant", "content": reply})
        if len(chat_history[user_id]) > 21:
            chat_history[user_id] = [chat_history[user_id][0]] + chat_history[user_id][-20:]
        return reply
    except Exception as e:
        return f"AI出错了：{str(e)[:50]}"

def send_to_n8n(action: str, who: str, content: str) -> dict:
    try:
        resp = requests.post(N8N_WEBHOOK_URL, json={
            "action": action, "who": who, "content": content
        }, timeout=10)
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def control_phone_via_droidrun(task: str) -> str:
    try:
        resp = requests.post("http://localhost:8080/execute", json={"task": task}, timeout=60)
        return resp.json().get("result", "手机任务执行完成")
    except Exception as e:
        return f"手机控制失败：{str(e)}"

def route_message(who: str, content: str) -> str:
    if content.startswith('/记录 ') or content.startswith('/记录\n'):
        note = content.replace('/记录', '').strip()
        send_to_n8n("record", who, note)
        return f"✅ 已记录：{note}"
    elif content.startswith('/查询'):
        query = content.replace('/查询', '').strip()
        result = send_to_n8n("query", who, query)
        return result.get("reply", "查询结果已处理")
    elif content.startswith('/手机 ') or content.startswith('/执行 '):
        phone_task = content.replace('/手机', '').replace('/执行', '').strip()
        return f"🤖 正在执行：{phone_task}\n{control_phone_via_droidrun(phone_task)}"
    elif content == '/帮助' or content == '/help':
        return (f"👋 我是{BOT_NAME}，以下是支持的指令：\n\n"
            "/记录 [内容] - 记录一条笔记\n"
            "/查询 [关键词] - 查询已记录的内容\n"
            "/手机 [任务] - 让AI操控手机完成任务\n"
            "/清空 - 清除对话历史\n"
            "直接发消息 - AI智能回复")
    elif content == '/清空':
        if who in chat_history:
            del chat_history[who]
        return "✅ 对话历史已清空"
    else:
        return ai_chat(user_id=who, message=content)

def send_morning_report():
    report = ai_chat(user_id="system_morning", message="请写一段温暖的早安问候，100字以内")
    try:
        wx.SendMsg(f"🌅 早安！\n{report}", MORNING_REPORT_TARGET)
    except Exception as e:
        print(f"❌ 早报发送失败: {e}")

def run_scheduler():
    schedule.every().day.at("08:00").do(send_morning_report)
    while True:
        schedule.run_pending()
        time.sleep(60)

def main():
    print(f"🤖 {BOT_NAME} 启动中...")
    for name in LISTEN_LIST:
        wx.AddListenChat(who=name, savepic=False)
        print(f"📡 监听：{name}")
    threading.Thread(target=run_scheduler, daemon=True).start()
    print(f"✅ {BOT_NAME} 已就绪，等待消息...")
    while True:
        try:
            msgs = wx.GetListenMessage()
            for chat in msgs:
                who = chat.who
                for msg in chat.content:
                    sender, content = msg[0], msg[1]
                    if sender == 'Self' or not content or content.startswith('['):
                        continue
                    print(f"📩 [{who}] {sender}: {content}")
                    reply = route_message(who=who, content=content.strip())
                    if reply:
                        print(f"🤖 回复: {reply[:50]}...")
                        wx.SendMsg(reply, who)
                        time.sleep(1)
        except Exception as e:
            print(f"⚠️ 运行错误: {e}")
            time.sleep(5)
        time.sleep(2)

if __name__ == "__main__":
    main()
```

### 运行整个系统

```bash
# 1. 确保微信已登录（PC版，不要最小化到托盘）
# 2. 运行主程序
python wechat_agent.py

# 可选：如果也要用 DroidRun 控制手机，另开一个终端运行：
droidrun portal --port 8080
```

---

## 六、第六章：云手机（ReDroid）

### 什么是云手机

物理手机要一直插着线、屏幕要亮着。云手机运行在服务器上，7×24 小时在线，可以同时跑多个"手机"，AI Agent 随时远程控制。

**ReDroid GitHub**：https://github.com/remote-android/redroid-doc

### 服务器选型

| 服务商 | 说明 |
|:---|:---|
| **Oracle Cloud 甲骨文**（免费） | 免费4核24G，性价比最高 |
| **腾讯云轻量** | 中文支持好，香港节点，¥80/月 |
| **阿里云 ECS** | 同上 |

**最低配置**：2核CPU、4GB内存、20GB硬盘、Ubuntu 20.04 LTS

### 部署步骤

**Step 1：安装内核模块**
```bash
ls /dev/binder 2>/dev/null && echo "binder 存在" || echo "需要安装"
# 如果不存在
apt update && apt install -y linux-headers-$(uname -r) git make gcc
git clone https://github.com/remote-android/redroid-modules.git
cd redroid-modules && make && make install
modprobe binder_linux devices="binder,hwbinder,vndbinder"
modprobe ashmem_linux
```

**Step 2：安装 Docker**
```bash
curl -fsSL https://get.docker.com | bash -s docker
apt install docker-compose-plugin -y
```

**Step 3：部署 ReDroid**
```bash
mkdir -p /opt/redroid && cd /opt/redroid
nano docker-compose.yml
```

```yaml
version: '3'
services:
  redroid:
    image: redroid/redroid:13.0.0-latest
    container_name: redroid
    privileged: true
    restart: always
    ports:
      - "5555:5555"
    volumes:
      - redroid_data:/data
    command:
      - androidboot.hardware=redroid
      - androidboot.redroid_width=1080
      - androidboot.redroid_height=1920
      - androidboot.redroid_fps=30

volumes:
  redroid_data:
```

```bash
docker compose up -d
docker logs -f redroid  # 看到 "Boot completed" 就成功了
adb connect localhost:5555
adb devices  # 显示 localhost:5555  device
```

### 多实例部署

```yaml
services:
  redroid-1:
    image: redroid/redroid:13.0.0-latest
    container_name: redroid-1
    ports:
      - "5555:5555"
    # ... 其他配置 ...

  redroid-2:
    image: redroid/redroid:13.0.0-latest
    container_name: redroid-2
    ports:
      - "5556:5555"  # 注意端口区分
    # ... 其他配置 ...
```

连接多个实例：
```bash
adb connect localhost:5555   # 实例1
adb connect localhost:5556   # 实例2
adb devices  # 显示2个设备
```

### 在浏览器里看到云手机

**ws-scrcpy**：https://github.com/NetrisTV/ws-scrcpy

```bash
mkdir -p /opt/ws-scrcpy && cd /opt/ws-scrcpy
nano docker-compose.yml
```

```yaml
version: '3'
services:
  ws-scrcpy:
    image: ghcr.io/netristv/ws-scrcpy:latest
    container_name: ws-scrcpy
    restart: always
    network_mode: host
    privileged: true
    ports:
      - "8000:8000"
```

```bash
docker compose up -d
# 浏览器访问：http://服务器IP:8000
# 点击「+」添加设备，填入 localhost:5555
```

---

## 七、第七章：mobile-use（进阶方案）

### 什么是 mobile-use

NeurIPS 2025 论文级手机 AI Agent，AndroidWorld 基准 **75% 成功率**（纯截图方案第一），有反思机制、记忆机制、多 Agent 协作，比 DroidRun 更聪明。

**GitHub**：https://github.com/MadeAgents/mobile-use  
**论文**：MobileUse: A Hierarchical Reflection-Driven GUI Agent（NeurIPS 2025）

### 与其他方案对比

| 对比项 | DroidRun | Mobile-Agent（阿里） | **mobile-use（推荐）** |
|:---|---:|---:|---:|
| 来源 | 开源社区 | 阿里通义实验室 | 上海交大 × MadeAgents |
| 论文支撑 | 无 | 有（ICLR） | **NeurIPS 2025** |
| AndroidWorld 成功率 | ~50% | ~60% | **75%** |
| 反思机制 | 无 | 有 | **有** |
| 记忆机制 | 无 | 无 | **有** |
| 多Agent协作 | 无 | 有 | **有（规划+执行+反思分离）** |
| WebUI | 无 | 无 | **有（Gradio）** |

### 安装

```bash
pip install mobile-use
python -m mobile_use.webui
# 打开浏览器：http://127.0.0.1:7860
```

### 配置 VLM（视觉语言模型）

官方推荐 **Qwen2.5-VL 系列**（对中文 APP 界面理解最好）：

| 平台 | 模型名 | 链接 | 价格 |
|:---|:---|:---|---:|
| 阿里云百炼（推荐） | `qwen-vl-max` | https://bailian.console.aliyun.com/ | 低价，新用户免费 |
| 硅基流动 | `Qwen/Qwen2.5-VL-72B-Instruct` | https://cloud.siliconflow.cn/ | 中等 |
| Google Gemini | `gemini-2.0-flash` | AI Studio | 免费！ |

### WebUI 配置

1. 打开 `http://127.0.0.1:7860`
2. 点击「VLM Configuration」
3. 填写：
   - **Base URL**：`https://dashscope.aliyuncs.com/compatible-mode/v1`（阿里百炼）或中转站地址
   - **API Key**：你的 API Key
   - **Model Name**：`qwen-vl-max`
   - **Temperature**：`0.1`（推荐低温）

### 配置文件（config/my_config.yaml）

```yaml
llm:
  model: qwen-vl-max
  api_key: "sk-你的APIKey"
  base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1"
  temperature: 0.1
  max_tokens: 2048

device:
  serial: null    # null = 自动选择唯一连接的设备

agent:
  max_steps: 30          # 最大操作步数
  max_screenshot: 5      # Agent 能看的最近几张截图
  max_action_retry: 3    # 每步操作失败最多重试次数
  reset_to_home: true    # 执行任务前是否回到主屏幕
```

### 中文输入（必须安装 ADBKeyboard）

```bash
# 下载 APK：https://github.com/senzhk/ADBKeyBoard/releases
adb install ADBKeyboard.apk

# 设为默认输入法
adb shell ime set com.android.adbkeyboard/.AdbIME
```

### 实战任务示例

```
打开微信，找到"文件传输助手"，发送消息：明天下午3点会议，记得参加
打开设置，查看手机的存储空间使用情况，告诉我还剩多少
用美团点一杯咖啡：冰的生椰拿铁，标准糖，送到[你的地址]
打开小红书，搜索"DeepSeek"，找到最新的一篇笔记，复制其内容，然后打开微信发给我
```

### Python API 调用

```python
import mobile_use

config_path = "config/my_config.yaml"
agent = mobile_use.Agent.from_params(dict(
    type="MultiAgent",
    config_path=config_path,
))

goal = "打开微信，给文件传输助手发消息：你好"
agent.set_max_steps(20)
result = agent.run(input_content=goal)
print(f"任务结果：{result}")
```

### mobile-use 作为 HTTP API（供 n8n 调用）

```python
# mobile_use_api.py
from fastapi import FastAPI
from pydantic import BaseModel
import mobile_use

app = FastAPI()
config_path = "config/my_config.yaml"

class TaskRequest(BaseModel):
    task: str
    max_steps: int = 20

@app.post("/execute")
async def execute_task(req: TaskRequest):
    agent = mobile_use.Agent.from_params(dict(
        type="MultiAgent",
        config_path=config_path,
    ))
    agent.set_max_steps(req.max_steps)
    result = agent.run(input_content=req.task)
    return {"status": "ok", "result": str(result)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8090)
```

```bash
pip install fastapi uvicorn
python mobile_use_api.py
# n8n 可以 HTTP POST 到 http://localhost:8090/execute
```

### 与 n8n + wxauto 完整集成

```
[微信消息含"/手机 xxx"]
        ↓
[wxauto 发 Webhook 给 n8n]
        ↓
[n8n: IF 节点判断是否是手机指令]
        ↓ 是
[n8n: HTTP Request 发给 mobile-use API]
  POST http://localhost:8090/execute
  {"task": "xxx", "max_steps": 25}
        ↓
[mobile-use 控制云手机执行任务]
        ↓
[n8n: 收到结果]
        ↓
[n8n: HTTP Request 调用 wxauto API 回复微信]
```

---

## 八、资源汇总表

### 微信控制类

| 项目 | 链接 | 说明 |
|:---|:---|:---|
| wxauto | https://github.com/cluic/wxauto | PC微信UI自动化，最主流 |
| WXAUTO-HTTP-API | https://gitee.com/timiyangjun/WXAUTO-HTTP-API | wxauto的HTTP接口版 |
| WeChat-Bot | https://github.com/Hunter-Wrynn/WeChat-Bot | 基于wxauto的完整机器人 |

### AI控制手机类

| 项目 | 链接 | 说明 |
|:---|:---|:---|
| DroidRun | https://github.com/droidrun/droidrun | 用LLM控制安卓，最活跃 |
| Mobile-Agent | https://github.com/X-PLUG/MobileAgent | 上交大出品，支持中文 |
| mobile-use（推荐） | https://github.com/MadeAgents/mobile-use | NeurIPS 2025，最强开源方案 |
| AutoGLM | https://github.com/THUDM/AutoGLM | 智谱开源，手机+网页控制 |

### 工作流平台类

| 项目 | 链接 | 说明 |
|:---|:---|:---|
| n8n（推荐） | https://github.com/n8n-io/n8n | 最强开源工作流，136K stars |
| Dify | https://github.com/langgenius/dify | 开源LLM应用开发平台 |
| Flowise | https://github.com/FlowiseAI/FlowiseAI | 低代码AI工作流 |

### 云手机类

| 项目 | 链接 | 说明 |
|:---|:---|:---|
| ReDroid | https://github.com/remote-android/redroid-doc | Android容器化，最稳定 |
| ws-scrcpy | https://github.com/NetrisTV/ws-scrcpy | 网页控制云手机 |

---

## 九、学习路径建议

| 阶段 | 时间 | 目标 |
|:---|:---:|:---|
| **第一阶段** | 1周 | 跑通最小闭环：安装 wxauto → 机器人能收发消息 → 接入 AI 自动回复 |
| **第二阶段** | 2周 | 接入工作流：部署 n8n → 定时早报 → 与 wxauto 联动 |
| **第三阶段** | 1个月 | 手机自动化：配置 ADB 连接手机 → 运行 DroidRun/mobile-use → 接入工作流 |
| **第四阶段** | 持续 | 规模化和产品化：接入更多渠道、添加数据库、搭建用户管理系统 |