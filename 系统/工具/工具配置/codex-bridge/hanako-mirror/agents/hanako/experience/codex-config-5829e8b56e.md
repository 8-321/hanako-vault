<!-- experience-title: Y29kZXgtY29uZmln -->
1. Codex CLI v0.130.0 支持自定义 provider，不要只依赖 OPENAI_BASE_URL；在 `D:/CodexHome/config.toml` 顶部设置 `model_provider = "an520"`，并添加 `[model_providers.an520] name="an520" base_url="https://an520.xin/v1" env_key="OPENAI_API_KEY" wire_api="responses"`，再用 `D:/Codex/codex.exe exec ... --skip-git-repo-check` 验证，输出中应出现 `provider: an520`。
