# Agent 工具生态配置

> **来源**：新建 文本文档.txt
> **用途**：记录 BELLA KE 使用的所有 AI Agent / 工具及其配置状态，用于跨设备复现

---

## 一、活跃的 Agent / 工具清单

### 已确认活跃

| 标识 | 工具名称 | 状态 | 说明 |
|:---|:---|:---:|:---|
| `.hanako` | **Hanako（当前）** | ✅ 活跃 | BELLA KE 的个人 AI 助手，基于 OpenHanako 平台 |
| `.claude` | Claude Code | ✅ 活跃 | Anthropic 的 CLI 编码 Agent，适合复杂代码任务 |
| `.codex` | Codex | ✅ 活跃 | OpenAI 的编程 Agent，深度集成 VS Code |
| `.cursor` | Cursor 编辑器 | ✅ 活跃 | AI 增强的代码编辑器，内置 Agent |
| `.windsurf` | Windsurf | ✅ 活跃 | Codeium 的 AI 编程工具，Flow 功能强大 |
| `.trae` / `.trae-cn` | Trae | ✅ 活跃 | 字节跳动的 AI 编程工具 |
| `.augment` | Augment Code | ✅ 活跃 | 针对企业的 AI 代码助手 |
| `.continue` | Continue.dev | ✅ 活跃 | 开源 AI 代码助手，支持多模型 |
| `.roo` | Roo Code | ✅ 活跃 | AI Agent for VS Code |
| `.cline` | Cline | ✅ 活跃 | 开源 CLI Agent，支持多 Provider |
| `.cherrystudio` | Cherry Studio | ✅ 活跃 | 桌面端 AI 应用，支持多模型和 Agent |
| `.ollama` | Ollama | ✅ 活跃 | 本地大模型运行工具 |
| `.lobehub` | LobeHub | ✅ 活跃 | 本地 AI 应用套件 |
| `.gemini` | Google Gemini | ✅ 活跃 | Google 的 AI 模型和 CLI |
| `.qwen` | 通义千问 | ✅ 活跃 | 阿里云的 AI 模型 |
| `.coze` | Coze | ✅ 活跃 | 字节跳动的 AI Agent 平台 |

### 其他工具（系统级）

| 标识 | 工具名称 | 状态 | 说明 |
|:---|:---|:---:|:---|
| `.ssh` | SSH 配置 | ✅ 活跃 | 远程服务器访问配置 |
| `.gitconfig` | Git 全局配置 | ✅ 活跃 | 用户名、邮箱等 |
| `.bashrc` / `.zshrc` | Shell 配置 | ✅ 活跃 | 命令行环境配置 |
| `.npm` | Node.js 包管理 | ✅ 活跃 | JS/TS 开发环境 |
| `.pnpm` | pnpm 包管理 | ✅ 活跃 | 更快的 JS 包管理 |
| `.bun` | Bun 运行时 | ✅ 活跃 | JS/TS 运行时 |
| `.cargo` / `.rustup` | Rust 工具链 | ✅ 活跃 | Rust 开发环境 |
| `.dotnet` | .NET SDK | ✅ 活跃 | C# 开发环境 |
| `.vscode` | VS Code 配置 | ✅ 活跃 | 编辑器配置同步 |
| `.docker` | Docker | ✅ 活跃 | 容器化 |
| `.pm2` | PM2 | ✅ 活跃 | Node.js 进程管理 |
| `.config` | 通用配置目录 | ✅ 活跃 | 各种工具的配置 |
| `.android` | Android SDK | ✅ 活跃 | 移动开发 |
| `.aws` / `.azure` | 云平台 CLI | ✅ 活跃 | 云服务接入 |

---

## 二、工具配置原则

### 核心原则

1. **配置即代码**：所有工具配置存入 Git，不依赖手动复现
2. **最小化密钥暴露**：API Key 只在环境变量或加密存储中出现
3. **跨工具一致性**：不同 Agent 使用统一的提示词体系（来自 Obsidian Vault）
4. **幂等性**：任何工具在新设备上 clone 后可直接使用

---

## 三、配置迁移清单

### 系统级配置（必须迁移）

```bash
# Shell 配置
~/.bashrc           # Linux/macOS
~/.zshrc            # macOS (Zsh)
~/.config/nushell/  # Nushell

# Git 配置
~/.gitconfig        # 全局 Git 配置
~/.git-credentials  # 密钥存储（如用 GCM）
```

### Python 环境

```bash
# 虚拟环境管理器选择
poetry              # 推荐（现代 Python 项目）
uv                  # 推荐（极快，新项目首选）
venv + pip          # 标准库备选

# 核心工具
pip install black flake8 mypy pytest pip-audit
```

### Node.js 环境

```bash
# 包管理器优先级
pnpm > npm > yarn   # pnpm 最快，磁盘占用最低

# 核心工具
npm install -g eslint prettier typescript
```

---

## 四、多 Agent 协作策略

### 任务分流原则

| 任务类型 | 推荐工具 | 原因 |
|:---|:---|:---|
| 快速单文件编辑 | Cursor / Windsurf | 实时补全，鼠标+键盘无缝衔接 |
| 复杂多文件重构 | Claude Code | 深度理解代码库，工具调用能力强 |
| 轻量脚本生成 | Cline / Roo Code | 速度快，API 成本低 |
| 长文本/文档生成 | Hanako + Claude | 深度思考 + 知识沉淀 |
| 本地模型推理 | Ollama | 完全离线，数据不出本机 |

### 提示词体系复用

所有 Agent 在启动时读取 Obsidian Vault 中的提示词文档：

```
Vault 路径：C:\Users\huang\AppData\Local\Programs\Hanako\ObsidianVault

读取：
- AI调教/系统提示词/001-主控核心协议.md
- AI调教/场景提示词/[根据任务选择].md
```

---

## 五、工具安装顺序（新设备）

### 第一阶段：基础环境（必须先装）

1. Git + GitHub Desktop
2. Python 3.10+（含 pip、venv）
3. Node.js（pnpm）
4. Docker Desktop
5. VS Code + Cursor

### 第二阶段：AI 工具

1. Ollama（本地模型）
2. Claude Code CLI
3. Cherry Studio（桌面端）
4. 各 IDE 的 AI 插件

### 第三阶段：高级工具

1. n8n（工作流）
2. One-API / New-API（中转站）
3. mobile-use / DroidRun（手机控制）

---

## 六、配置文件模板

### .gitconfig

```ini
[user]
    name = BELLA KE
    email = your-email@example.com
[credential]
    helper = manager
[alias]
    lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
    co = checkout
    br = branch
    st = status
[pull]
    rebase = false
[push]
    default = simple
```

### .bashrc 关键配置

```bash
# Git 自动补全
source ~/.git-completion.bash

# Python 路径
export PATH="$HOME/.local/bin:$PATH"

# AI 工具快捷命令
alias ai-hub="cd ~/AI-Hub"
alias vault="cd ~/ObsidianVault"

# 代理配置（如需要）
export http_proxy="http://127.0.0.1:7890"
export https_proxy="http://127.0.0.1:7890"
```

---

## 七、状态检查脚本

```bash
#!/bin/bash
# check_tools.sh - 检查所有工具是否正常

echo "=== 系统工具 ==="
git --version
python3 --version
node --version
docker --version

echo ""
echo "=== AI Agent ==="
ollama list 2>/dev/null || echo "Ollama: 未运行"
claude --version 2>/dev/null || echo "Claude Code: 未安装"

echo ""
echo "=== Git 状态 ==="
cd ~/ObsidianVault && git status

echo ""
echo "=== Docker 容器 ==="
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 八、备份策略

| 类型 | 内容 | 备份方式 |
|:---|:---|:---|
| **Shell 配置** | .bashrc, .zshrc, .gitconfig | Git 仓库（dotfiles） |
| **AI 工具配置** | .claude, .cursor 等 Agent 配置 | Git 仓库 |
| **Obsidian Vault** | 所有提示词和工作流 | GitHub（已有仓库） |
| **API Keys** | 中转站密钥、供应商 Key | 1Password / KeePass |
| **项目代码** | 工作空间中的项目 | 各自 Git 仓库 |