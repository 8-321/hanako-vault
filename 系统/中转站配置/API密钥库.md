# API 密钥库

> **警告**：此文件包含敏感信息，严禁提交到 Git 仓库
> **加密方式**：使用 git-crypt 或 [Obsidian 加密插件](https://obsidian.md/plugins?q=encrypt)
> **原则**：所有 Key 不出现在任何提示词文档里

---

## 一、安全原则

1. **永不明文存储**：所有密钥必须加密或使用环境变量
2. **永不提交 Git**：.gitignore 必须包含此文件或加密版本
3. **永不日志输出**：日志脱敏，敏感字段替换为 `***`
4. **最小权限**：每个密钥只授权必要的 API 范围

---

## 二、密钥存储位置

| 环境 | 存储方式 |
|:---|:---|
| 本地开发 | `.env` 文件（不提交 Git） |
| VPS 生产 | 环境变量（docker run -e） |
| 团队共享 | 密钥管理服务（1Password/KeePass） |

---

## 三、环境变量模板

在项目根目录创建 `.env.example`（不含真实值）：

```bash
# AI 中转站
ONE_API_ADMIN_TOKEN=your-admin-token-here

# 供应商 API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...

# 数据库
MYSQL_ROOT_PASSWORD=your-password
REDIS_PASSWORD=your-password

# 域名
DOMAIN=your-domain.com
```

---

## 四、当前密钥配置

> ⚠️ 以下仅为配置说明，真实密钥存储于环境变量

### New-API 中转站

```
Base URL: http://149.28.143.114:3000/v1
Admin Token: [存储于环境变量 ONE_API_ADMIN_TOKEN]
用户 Token: [存储于环境变量 ONE_API_USER_TOKEN]
```

### 供应商渠道

| 供应商 | Key 前缀 | 配置方式 |
|:---|:---|:---|
| OpenAI | sk- | 环境变量 |
| Anthropic | sk-ant- | 环境变量 |
| DeepSeek | sk- | 环境变量 |
| 77Code | [渠道内配置] | Web UI |
| MiniMax | [渠道内配置] | Web UI |

---

## 五、密钥轮换流程

当密钥需要轮换时：

1. **备份旧密钥**：保留 24 小时以确保无遗漏请求
2. **生成新密钥**：在供应商平台生成
3. **更新配置**：在 One-API Web UI 更新渠道
4. **验证连通**：发送测试请求确认正常工作
5. **销毁旧密钥**：确认新密钥稳定后删除旧密钥

---

## 六、泄露应急处理

若密钥意外泄露：

1. **立即轮换**：在供应商平台撤销旧密钥
2. **检查用量**：确认无异常调用
3. **更新配置**：在所有使用处更新为新密钥
4. **审查日志**：检查是否有人滥用

---

## 七、密钥管理工具推荐

| 工具 | 适用场景 |
|:---|:---|
| **1Password** | 团队共享、个人密码管理 |
| **KeePass** | 完全离线、本地存储 |
| **Bitwarden** | 开源、自托管 |
| **GitHub Secrets** | CI/CD 环境变量 |
| **Obsidian 加密插件** | Obsidian 内加密存储 |