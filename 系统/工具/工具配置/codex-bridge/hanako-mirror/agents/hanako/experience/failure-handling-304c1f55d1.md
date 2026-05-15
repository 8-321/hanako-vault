<!-- experience-title: ZmFpbHVyZS1oYW5kbGluZw -->
1. 【铁律】同一个工具调用用同样的方式失败第 2 次必须停下来诊断根因，不允许第 3 次再试。
【反面案例】2026-05-12 切模型，update_settings apply 的值被后端静默重映射，我连续试了 5 次（openai/gpt-5.5 → openai/gpt-4 → openai/gpt-4 → an/gpt-5.4 → an/gpt-5.3-codex → an/deepseek-v4-pro），每次都被映射到 an/claude-opus-4-7，kel 反问"为什么一直重复"才停。
【正确路径】第 2 次失败时：停 → 读错误信息 → 验证工具是否真的写入了（查底层文件/状态）→ 换完全不同的方案（直接改文件、走后端 API、或告诉用户手动操作）。
【检查方式】心里默念"这是第几次同一招"，到 2 就强制中断。
