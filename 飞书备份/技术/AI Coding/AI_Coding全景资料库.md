# AI Coding 全景技术资料库

> **来源**：AI_Coding_全景资料库.xlsx
> **整理日期**：2026-05-06
> **覆盖范围**：从 CodeT5 到 DeepSeek-Coder-V2，覆盖 20+ 核心模型与 7 大评估体系
> **学术支撑**：NeurIPS、ICML、ICLR、ACL、FSE、PLDI 等顶会论文

---

## 一、技术架构总览

### 四层技术栈

```
数据表征层 → 模型架构层 → 对齐策略层 → 应用范式层
```

### 数据表征层

| 技术模块 | 学术黑话 | 技术定义与作用 | 典型实现 |
|:---|:---|:---|:---|
| 代码分词 | BPE / SentencePiece | 将代码文本切分为子词单元，平衡词汇表大小与序列长度；代码相比自然语言具有更高压缩率 | Codex tokenizer, CodeLlama SentencePiece |
| 结构化表征 | AST / CFG / DFG | 将代码解析为树/图结构，显式编码语法关系与控制依赖；AST 保留语法层级，CFG 表示执行路径，DFG 追踪变量使用 | Tree-sitter, GraphCodeBERT, CodeT5 |
| 中间表示 | SSA / LLVM IR | 编译器级中间表示，每个变量仅赋值一次；SSA 形式简化数据流分析 | AlphaCode, LLVM 优化 |

### 模型架构层

| 技术模块 | 学术黑话 | 技术定义与作用 | 典型实现 |
|:---|:---|:---|:---|
| 编码器模型 | MLM（掩码语言建模） | 双向编码器，通过掩码预测训练；适合代码理解任务（代码搜索、缺陷检测、类型推断） | CodeBERT, GraphCodeBERT, CodeT5 (encoder) |
| 解码器模型 | CLM / Next Token Prediction | 自回归解码器，逐 token 生成代码；主流代码生成范式，支持长上下文与流式生成 | Codex, CodeLlama, StarCoder, DeepSeek-Coder |
| 专家混合 | MoE / Sparse Activation | 将前馈网络拆分为多个专家子网络，通过门控网络选择性激活；在固定推理成本下扩展参数量 | DeepSeek-Coder-V2 (16B 激活/236B 总参), Qwen2.5-Coder |
| 位置编码 | RoPE / ALiBi | 替代绝对位置编码，通过旋转矩阵注入相对位置信息；支持更长上下文外推（>100K） | CodeLlama (RoPE), StableCode (ALiBi) |

### 对齐策略层

| 技术模块 | 学术黑话 | 技术定义与作用 | 典型实现 |
|:---|:---|:---|:---|
| 监督微调 | SFT / Instruct Tuning | 在高质量指令-代码对上进行微调，使模型遵循自然语言指令生成代码；关键是构造 diverse 微调数据集 | CodeAlpaca, WizardCoder, DeepSeek-Coder-Instruct |
| 人类反馈强化学习 | RLHF / PPO / DPO / Rejection Sampling | 通过人类偏好或编译器/执行器反馈优化生成策略；代码领域 reward 信号更客观（编译成功/测试通过） | CodeRL, RLEF (Execution Feedback), o1 |
| 过程奖励 | PRM / ORM | 不仅评估最终代码正确性，还评估中间推理步骤质量；PRM 对每步生成打分引导树搜索 | Math-Shepherd, OpenAI o1 系列 |

### 应用范式层

| 技术模块 | 学术黑话 | 技术定义与作用 | 典型实现 |
|:---|:---|:---|:---|
| 代码补全 | FIM（Fill-in-the-Middle） | 在 prefix 和 suffix 已知条件下生成中间代码；采用 PSM（Prefix-Suffix-Middle）格式训练 | Codex FIM, StarCoder, CodeLlama-Infill |
| 检索增强生成 | RAG / BM25 + Dense Retrieval | 从代码库检索相似代码片段作为上下文，增强生成准确性；代码 embedding 需捕获结构与语义 | ReACC, RepoCoder, CodeRAG 框架 |
| Agent式编程 | ReAct / Plan-Execute-Reflect / Tool Use | 将复杂开发任务分解为规划、执行、测试、修复的循环；Agent 可调用编译器、解释器、搜索工具 | SWE-agent, Devin, OpenHands |
| 仓库级编码 | Repo-level Coding / Cross-file Context | 超越单文件生成，理解整个代码库的依赖关系、模块接口、类型定义；需处理长上下文（>128K） | RepoCoder, DeepSeek-Coder-V2 |

---

## 二、关键模型演进

### 演进时间线

| 年份 | 模型 | 机构 | 参数 | 上下文 | 核心创新 | HumanEval |
|:---:|:---|:---|---:|---:|:---|---:|
| 2021 | Codex | OpenAI | 12B | 4K | 首个大规模代码生成模型，基于 GPT-3 在 GitHub 代码上微调 | 28.8% |
| 2021 | CodeBERT | Microsoft | 125M | 512 | 首个专门预训练的代码理解模型，NL-PL 双模态 MLM | — |
| 2021 | GraphCodeBERT | Microsoft | 125M | 512 | 引入数据流图（DFG）作为代码结构先验 | — |
| 2022 | CodeT5 | Salesforce | 220M | 512 | 编码器-解码器架构，标识符 aware 去噪预训练 | — |
| 2022 | AlphaCode | DeepMind | 1B (Ensemble) | 1K | 基于聚类的样本过滤策略；在 Codeforces 竞赛中达到人类中位数 | ~17% |
| 2022 | CodeGen | Salesforce | 16B | 2K | 多阶段训练：NL 预训练→代码预训练→多语言代码 | 29.3% |
| 2022 | InCoder | Meta | 6.7B | 2K | 首个支持 FIM 的因果语言模型 | 24.5% |
| 2023 | StarCoder | BigCode | 15.5B | 8K | 基于 The Stack v1.2（permissive license）训练 | 34.1% |
| 2023 | CodeLlama | Meta | 34B | 16K/100K | Llama 2 基础架构，RoPE + FIM 支持，指令微调 | 53.7% |
| 2023 | WizardCoder | Microsoft | 15B | 2K | Evol-Instruct：用 ChatGPT 将简单代码指令演化至复杂 | 57.3% |
| 2023 | GPT-4 | OpenAI | ~1T (est.) | 32K/128K | 通用大模型中代码能力涌现，支持复杂推理与调试 | 67.0% |
| 2024 | DeepSeek-Coder | DeepSeek | 33B | 16K | 首个完全开源可商用的顶尖代码模型，Repo-level 预训练 | 56.1% |
| 2024 | DeepSeek-Coder-V2 | DeepSeek | 16B 激活/236B 总 | 128K | MoE 架构（64 专家/16 激活），代码+数学双优 | 74.9% |
| 2024 | Qwen2.5-Coder | Alibaba | 32B | 128K | 密集模型，80+ 编程语言均衡训练，开源社区主流选择 | 72.6% |
| 2024 | o1-preview | OpenAI | Unknown | 200K | 基于 Test-time Scaling，通过内部思维链实现复杂推理 | 92.0% |
| 2024 | Claude 3.5 Sonnet | Anthropic | Unknown | 200K | Artifacts 功能支持实时代码渲染与迭代 | 92.0% |
| 2024 | o3-mini (high) | OpenAI | Unknown | 200K | 强化学习+Test-time Search，竞赛编程达到金牌水平 | ~93% |

---

## 三、评估基准体系

### 7 大主流 Benchmarks

| 基准名称 | 年份 | 任务类型 | 规模/特点 | 关键局限 |
|:---|:---:|:---|:---|:---|
| **HumanEval** | 2021 | 函数级生成 | 164 道手写 Python 编程题，含 docstring、函数签名、单元测试 | 规模极小，语言单一（Python），存在数据污染争议 |
| **MBPP** | 2021 | 函数级生成 | 974/426 道 Python 基础题，分 sanitized 与标准版 | 均为入门级问题，不含复杂算法 |
| **DS-1000** | 2023 | 数据科学代码 | 1000 道 Python 数据科学任务（NumPy/Pandas/Matplotlib） | 专注于数据科学领域 |
| **SWE-bench** | 2023 | 真实软件工程 | 2,294 个真实 GitHub Issue→PR 修复任务，需修改多文件、通过单元测试 | 最接近真实开发，但成本极高 |
| **APPS** | 2021 | 竞赛编程 | 10,000 道竞赛编程题（入门/面试/竞赛），含测试用例 | 难度跨度大 |
| **LiveCodeBench** | 2024 | 防污染代码 | 实时更新的编程题，按时间切分训练/测试，杜绝数据污染 | 金标准，但评估成本高 |
| **CrossCodeEval** | 2023 | 跨文件补全 | 19,888 个跨文件代码补全任务，需利用其他文件定义 | 评估 Repo-level 上下文理解 |

### 4 类核心评估指标

| 指标名称 | 类型 | 数学定义/计算方式 | 适用场景 | 优缺点 |
|:---|:---|:---|:---|:---|
| **pass@k** | 执行正确性 | 生成 k 个候选代码，至少 1 个通过所有单元测试的概率 | 所有基于执行的基准 | ✅ 客观可验证 ❌ 忽略代码质量 |
| **pass@1** | 执行正确性 | 单样本生成通过率，反映模型贪心解码能力 | 生产场景实际使用 | ✅ 最贴近实际 ❌ 对随机性敏感 |
| **CodeBLEU** | N-gram 相似性 | 加权 BLEU + AST 匹配权重 + 数据流匹配权重 | 代码翻译/摘要/生成 | ✅ 考虑代码结构 ❌ 依赖参考代码 |
| **Execution-based Accuracy** | 执行正确性 | 在隐藏测试集上的执行通过率 | 竞赛编程 | ✅ 防止硬编码作弊 ❌ 测试设计成本高 |
| **Edit Similarity** | 差异度量 | 1 - LevenshteinDistance / max(len1, len2) | 代码修复/重构任务 | ✅ 评估修改幅度 ❌ 不衡量正确性 |
| **Static Analysis Score** | 代码质量 | 通过 linter 的违规数量、复杂度 | 代码质量评估 | ✅ 评估工程规范 ❌ 与功能正确性无直接关联 |

---

## 四、学术黑话词典

### 基础表征类

| 术语（黑话） | 英文全称 | 人话翻译 | 典型应用场景 |
|:---|:---|:---|:---|
| AST | Abstract Syntax Tree | 把代码解析成一棵树，每个节点是语法结构（如 if 语句、函数定义）。编译器的第一步 | 代码克隆检测、漏洞定位、GraphCodeBERT 的结构编码 |
| CFG | Control Flow Graph | 用有向图表示代码的执行路径，每个节点是一个基本块，边表示跳转关系 | 程序分析、死代码检测、编译器优化 |
| DFG | Data Flow Graph | 追踪变量从定义到使用的全链路。比如 x = 5; y = x + 1; print(y)，数据流就是 x→y→print | GraphCodeBERT 的图结构编码、污点分析 |
| SSA | Static Single Assignment | 每个变量只能被赋值一次。如果原始代码中 x 被多次赋值，SSA 会生成 x1, x2 | LLVM IR、JIT 编译优化、程序合成中的约束求解 |
| Tokenization | Subword Tokenization | 把代码字符串切分成模型能处理的整数 ID 序列。代码 tokenization 比自然语言更具标识符导向 | BPE 分词器训练、代码词汇表构建 |
| AST Traversal | Tree Traversal | 按某种顺序访问 AST 的所有节点。前序遍历（根-左-右）常用于序列化树为模型输入 | Tree-LSTM、Tree-Transformer |

### 模型架构类

| 术语（黑话） | 英文全称 | 人话翻译 | 典型应用场景 |
|:---|:---|:---|:---|
| MLM | Masked Language Modeling | 随机遮住一些 token 让模型预测。BERT 用的，适合理解任务 | CodeBERT 预训练、代码填空、类型推断 |
| CLM | Causal Language Modeling | 只能看左边 token 预测右边下一个，像写代码时只能往前不能往后改 | Codex、CodeLlama、StarCoder |
| FIM | Fill-in-the-Middle | 已知代码前缀和后缀，让模型填中间 | IDE 智能补全（光标在中间时）、代码重构 |
| RoPE | Rotary Position Embedding | 用旋转矩阵给 token 注入位置信息，天然支持相对位置感知，训练时用短文本但推理时可用长文本 | CodeLlama 100K 上下文、DeepSeek-Coder 128K |
| MoE | Mixture-of-Experts | 模型里藏了很多"专家"小网络，门控网络决定每个 token 激活哪几个专家。总参数大但激活参数少 | DeepSeek-Coder-V2 (236B 总参/16B 激活) |

### 训练对齐类

| 术语（黑话） | 英文全称 | 人话翻译 | 典型应用场景 |
|:---|:---|:---|:---|
| SFT | Supervised Fine-Tuning | 在人工写好的（指令，代码）配对数据上继续训练，让预训练模型学会"人话"到"代码"的映射 | 所有 Chat/Instruction 版本的代码模型 |
| RLHF | Reinforcement Learning from Human Feedback | 先训练 Reward Model 学人类偏好，再用 PPO 算法优化策略模型 | ChatGPT 代码能力 |
| DPO | Direct Preference Optimization | 不用训练单独的 Reward Model，直接用偏好数据优化策略 | 近期开源代码模型（如 Zephyr-style 训练） |
| Rejection Sampling | Best-of-N Sampling | 生成 N 个候选，挑出最好的（比如能通过测试的）作为新的训练数据 | Self-Instruct 演化、o1 的后训练 |
| Evol-Instruct | Evolutionary Instruction Generation | 用 ChatGPT 把简单指令逐步改写得更复杂（加约束、改描述、增步骤） | WizardCoder 的数据构造核心方法 |

### 生成范式类

| 术语（黑话） | 英文全称 | 人话翻译 | 典型应用场景 |
|:---|:---|:---|:---|
| Test-time Scaling | Inference-time Compute Scaling | 不训练更大的模型，而是在推理时花更多计算（生成更多样本、做搜索、验证） | OpenAI o1/o3、竞赛编程金牌水平 |
| Chain-of-Thought | Chain-of-Thought Prompting | 让模型先写思考过程再写答案。对代码来说，就是先写算法思路、复杂度分析 | 复杂算法题、LeetCode Hard |
| Tool Use / Function Calling | Tool-Augmented Generation | 模型不直接输出最终代码，而是先调用工具（搜索 API、执行测试、读文件），再根据结果继续 | SWE-agent、Devin |
| Execution-guided Generation | Execute-then-Generate | 生成一段代码→执行→看报错→根据报错修改→再执行。编译器/解释器作为 oracle 引导 | CodeRL、自动调试与修复循环 |

### 系统工程类

| 术语（黑话） | 英文全称 | 人话翻译 | 典型应用场景 |
|:---|:---|:---|:---|
| RAG | Retrieval-Augmented Generation | 生成前先查资料：从代码库找相似函数、从文档找 API 用法、从 StackOverflow 找答案 | RepoCoder、企业代码库补全 |
| Agent | LLM Agent for Software Engineering | 让模型在一个循环里：规划（Plan）→执行（Act）→观察（Observe）→反思（Reflect） | SWE-agent、Devin、OpenHands |
| KV Cache | Key-Value Cache | Transformer 推理时，前面 token 的 K/V 矩阵算完就存起来，后面 token 直接复用 | vLLM 的 PagedAttention 优化、MQA/GQA 显存压缩 |
| Quantization | Post-training Quantization | 把模型权重从 FP16 变成 INT8/INT4 甚至 INT1，减少显存和延迟 | AWQ、GPTQ、GGUF 本地部署 |
| Speculative Decoding | Speculative Execution for Decoding | 让一个小模型快速"草稿"一堆 token，大模型一次检查并修正 | 本地 IDE 实时补全、低延迟代码生成 |

---

## 五、工业实践指南

### Prompt 工程模板（直接复制可用）

**场景：代码生成（通用）**
```
你是一位资深{语言}工程师。请根据以下需求编写代码：
需求：{描述}
要求：
- 包含类型注解
- 包含单元测试
- 符合 PEP8 规范
- 考虑边界情况
```

**场景：Bug 修复**
```
以下代码在执行时抛出{错误类型}：
{错误信息}
堆栈跟踪：{traceback}
请：
1. 分析根因
2. 提供修复后的完整代码
3. 解释修复原理
```

**场景：代码 Review**
```
请对以下代码进行专业 Review，按以下维度打分（1-5）：
- 可读性：命名是否清晰、结构是否合理
- 性能：时间/空间复杂度是否最优
- 安全：是否有注入/越权/敏感信息泄露风险
- 可维护性：是否遵循 SOLID 原则

对每个维度给出具体问题和重构建议。
```

**场景：架构设计**
```
需求：{业务需求}
约束：QPS>{qps}，P99<{latency}ms，数据规模{规模}
请：
1. 给出系统架构图（Mermaid 格式）
2. 存储选型对比表
3. 核心接口设计
4. 风险点和应对策略
```

### RAG 检索增强与 Agent 架构设计

| 模块 | 设计要点 | 工业级实现方案 |
|:---|:---|:---|
| **索引构建** | 代码 Embedding 需结构感知：AST 路径+docstring+调用关系拼接 | 1. 用 tree-sitter 提取函数级 AST 子树 2. 将函数签名+docs+imports 拼接成检索单元 |
| **检索策略** | 混合检索：Sparse（BM25 抓精确标识符）+ Dense（语义抓相似功能） | 1. Elasticsearch 做 BM25（keyword 字段 boost 标识符 3x）2. BGE 做 Dense（语义字段）3. Reranker 精排 |
| **上下文组装** | 检索结果不能直接拼进 Prompt，需做相关性过滤+压缩+排序 | 1. 用 Cross-Encoder（如 bge-reranker）精排，阈值过滤 2. 优先保留 import 和函数签名上下文 |
| **Agent Planner** | 规划器负责将用户意图拆分为可验证的子任务 | ReAct 范式：Thought→Action→Observation 循环，Planner 调用 Task Decomposition |
| **Agent Executor** | 执行器负责调用工具并捕获反馈 | 工具注册表：FileTool（read/write/grep/find）、Terminal（bash/execute）、Search（web/docs） |
| **Agent Critic** | 评判器验证执行结果并决定是否终止或重试 | 多层验证：1. 语法层：AST 解析成功？2. 静态层：类型检查通过？linter 无高危警告？3. 执行层：单元测试通过？ |

### 模型选型决策矩阵（2024-2025）

| 场景 | 推荐模型 | 选型理由 | 避坑提示 |
|:---|:---|:---|:---|
| **IDE 实时补全（低延迟）** | Qwen2.5-Coder-7B / DeepSeek-Coder-6.7B | 小模型+量化(INT4)可在消费级 GPU/CPU 上 <100ms 生成；7B 级别在代码补全任务上性价比最高 | 避免用 >14B 模型做字符级补全，延迟不可接受；优先用 FIM 专用端点 |
| **复杂算法/竞赛编程** | o3-mini (high) / Claude 3.5 Sonnet / DeepSeek-Coder-V2 | Test-time Scaling 模型在算法题上碾压传统自回归；需要链式思考（chain-of-thought）处理多步推理 | 开源模型在竞赛级 Hard 题目上仍显著落后闭源；可考虑多模型投票（Ensemble） |
| **企业私有代码库** | DeepSeek-Coder-V2-32B / Qwen2.5-Coder-32B-Instruct | 128K 上下文可吞完整模块；MoE 架构在私有部署时可用 vLLM+TP 加速；开源可本地部署保证数据安全 | 闭源 API 不能处理私有代码（数据安全）；必须本地部署+代码脱敏 |
| **Bug 修复/SWE-bench 类** | Claude 3.5 Sonnet / SWE-agent + GPT-4 | 需要 Agent 架构（Planner+Executor+Critic）而非单次生成 | 单次直接生成修复成功率 <5%，必须用工具调用+测试反馈循环 |
| **代码翻译（跨语言迁移）** | DeepSeek-Coder-V2 / CodeLlama-34B | 代码翻译需要理解两种语言的语义等价性，大上下文帮助携带类型系统信息；33B+ 是翻译质量门槛 | 小模型翻译容易丢失异常处理逻辑和并发原语语义，必须人工 Review |
| **教育/初学者辅导** | Qwen2.5-Coder-7B-Instruct | Instruct 版本生成更 verbose 的解释（适合教学）；7B 本地可跑，成本低 | 避免用最强模型直接给答案，应配置 System Prompt 强制"引导思考而非直接给答案" |
| **边缘设备/离线环境** | CodeLlama-7B-Q4_K_M (GGUF) / StableCode-3B | GGUF 量化后单文件 <5GB，CPU 推理可达 10-20 token/s；3B 级别适合移动端 | 量化到 INT4 以下时代码准确率下降明显，推荐 AWQ/GPTQ 而非 RTN 粗暴量化 |

---

## 六、前沿研究方向

| 研究方向 | 核心思想 | 代表性工作/论文 | 产业落地前景 |
|:---|:---|:---|:---|
| **Test-time Scaling** | 不扩大训练算力，而是在推理时生成更多候选、做搜索与验证。将计算从"训练时"搬到"推理时" | OpenAI o1/o3 (2024) | 高价值场景（竞赛编程、核心算法设计）的云端 API 服务；低价值场景成本过高需做自适应 |
| **Repo-level Coding** | 超越单文件生成，理解整个仓库的模块依赖、类型系统、配置约定。需要超长上下文或智能检索 | RepoCoder (2023), CrossCodeEval (2023) | 企业代码助手标配功能；GitHub Copilot Workspace、Cursor 的核心能力 |
| **Code Reward Model** | 专门训练一个模型来评判代码质量（正确性、效率、风格），替代人工或简单执行反馈 | CodeRL (2023), RLEF (2023) | 强化学习数据飞轮的核心组件；开源社区急需高质量 Code Reward Model |
| **Speculative Decoding** | 小模型 Draft + 大模型 Verify 的无损加速架构。代码生成中 token 分布集中（很多结构token）特别有效 | Speculative Decoding (Leviathan et al., 2023) | 本地 IDE 插件延迟从 500ms 降到 100ms 的关键技术；vLLM、TensorRT-LLM 已集成 |
| **Neural Program Repair** | 用深度学习自动生成程序补丁修复 bug。从早期的 sequence-to-sequence 到现在的 LLM-based | SequenceR (2019), CURE (2021), ChatRepair (2024) | 软件维护成本占 TCO 的 70%+，自动修复有巨大经济价值；当前在真实 bug 上成功率约 30-40% |
| **Test-driven Generation** | 先写测试用例，再生成通过测试的代码。利用测试作为形式化规约（formal spec）引导生成 | TDD-Style Generation (2023), TestPilot (2024) | 提高代码可信度的关键路径；与 Property-based Testing 结合可覆盖更多边界情况 |
| **Formal Verification × LLM** | 将大模型生成的代码送入形式化验证工具（SMT Solver, Coq, Lean）证明正确性 | ProofDB (2023), LeanDojo (2023) | 金融、航天、医疗等高可信软件；当前瓶颈是 formal spec 的编写成本高于代码编写本身 |
| **Multi-modal Code** | 结合 UI 截图、手绘草图、Figma 设计稿生成前端代码。从文本编程扩展到视觉-代码映射 | Design2Code (2024), screenshot-to-code (2024) | 前端开发自动化、低代码平台升级、设计稿直接转生产代码；对 CSS/Tailwind 生成效果最好 |

### 趋势判断（2024-2025）

> 核心叙事从"训练更大的代码模型"转向"用更聪明的方法使用中等规模的模型"。

1. **Test-time Scaling > 更大的预训练**：推理时计算扩展比继续 scaling 训练更经济
2. **Agent 架构 > 单次生成**：复杂任务必须用 Planner+Executor+Critic 多轮循环
3. **Repo-level > 文件级**：企业场景需要理解整个代码库，而非单文件
4. **专用 Embedding > 通用 Embedding**：代码语义检索需要 Code-specific embedding 模型