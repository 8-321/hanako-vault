# AI Agent 配置安装脚本

> 运行此脚本将 AI Agent 启动引导语配置到各个工具

## Claude Code

在 Claude Code 的项目目录下创建 `.claude/descriptions/command.md`：

或者在全局配置中添加项目级别的 system prompt。

推荐方式：在项目根目录创建 `.claudeirc.local`：

```bash
# Claude Code 全局配置（如果支持）
# 参考：https://docs.anthropic.com/en/docs/claude-code
```

## Cursor

在 Cursor Settings → Workspace → Rules 中添加以下内容：

```markdown
# BELLA KE AI 调教体系规则

你每次对话开始前，先读取 Obsidian Vault 中的规范文档。

Vault 路径：D:\BELLA KE\项目AI\调教AI\ObsidianVault

禁止事项：
- 不使用破折号（——、-）
- 不使用"不是...是..."句式
- 不使用"总的来说"、"希望对你有帮助"、"如你所见"收尾
```

## Windsurf

在 Windsurf Settings → Workspace Rules 中添加相同内容。

## Cline / Roo Code

在 `.claude/` 或 `.windsurf/` 目录下创建规则文件。

## 手动配置步骤

### Claude Code
1. 打开 Claude Code
2. 在项目目录运行或设置项目级别规则
3. 参考：`https://docs.anthropic.com/en/docs/claude-code`

### Cursor
1. 打开 Cursor Settings
2. 找到 Workspace Rules 或 Project Rules
3. 添加以下内容：

```
你每次对话开始前，先读取以下文件：
- D:\BELLA KE\项目AI\调教AI\ObsidianVault\AI调教\系统提示词\001-主控核心协议.md

Vault 路径：D:\BELLA KE\项目AI\调教AI\ObsidianVault
中转站：http://149.28.143.114:3000/v1
```

### Windows 终端配置（让 git bash 支持中文）

在 `~/.bashrc` 中添加：
```bash
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8
```

## 验证配置

运行以下命令验证 vault 是否可访问：

```bash
ls "D:/BELLA KE/项目AI/调教AI/ObsidianVault/AI调教/系统提示词/"

# 应该显示：
# 001-主控核心协议.md
# 002-子代理调度协议.md
# 003-执行验收标准.md
```

## 常见问题

**Q：Claude Code 无法读取中文路径的文件？**
A：在 Claude Code 命令行中尝试使用短路径或相对路径。

**Q：提示词没有生效？**
A：检查工具的规则文件格式是否正确，YAML/JSON 格式要严格对齐。