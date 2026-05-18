# 小任务 TDD 流程

> **适用场景**：单一功能需求、代码修复、快速迭代
> **核心工具**：superpowers 全流程支持
> **流程**：brainstorm → writing-plans → TDD 实现 → code review → verification-before-completion

---

## 一、四阶段流程

### Stage 1：Brainstorm（头脑风暴）

**目标**：明确设计方向和边界

**动作**：
1. 理解用户需求（站在用户角度）
2. 分析需求的完整性和合理性
3. 提出多个设计方案
4. 与用户确认最终方案

**输出**：
```markdown
## 方案确认

**需求**：...
**方案**：...
**边界**：...
**风险**：...
```

### Stage 2：Writing Plans（编写计划）

**目标**：拆解为可执行的步骤

**动作**：
1. 将方案拆解为具体的子任务
2. 确定依赖关系和执行顺序
3. 预估时间和复杂度
4. 准备验收标准

**输出**：
```markdown
## 执行计划

**Task 1**：[描述] → [验收标准]
**Task 2**：[描述] → [验收标准]
**Task 3**：[描述] → [验收标准]
```

### Stage 3：TDD 实现（测试驱动开发）

**目标**：先写测试，再写实现

**流程**：
```
写测试 → 运行测试（失败） → 写实现 → 运行测试（通过） → 重构 → 测试通过
```

**原则**：
1. **Red**：写一个会失败的测试
2. **Green**：写能让测试通过的最小代码
3. **Refactor**：重构优化，同时保持测试通过

**输出**：
- 完整的测试用例
- 可运行的实现代码
- 测试覆盖率报告

### Stage 4：Code Review（代码审查）

**目标**：确保代码质量

**审查清单**：
- [ ] 代码风格符合规范（black/ESLint）
- [ ] 类型注解完整（mypy/TypeScript）
- [ ] 测试覆盖核心路径
- [ ] 无安全漏洞（bandit/snyk）
- [ ] 文档齐全

### Stage 5：Verification Before Completion（完成前验证）

**目标**：确保交付物可直接使用

**验证动作**：
1. 本地完整运行测试
2. 手动验证核心功能
3. 检查边界情况
4. 确认无破坏性变更

**输出**：
```markdown
## 验收报告

**功能**：[通过/失败]
**测试**：[通过/失败]
**代码质量**：[通过/失败]
**文档**：[通过/失败]

**结论**：可以交付 / 需要修复
```

---

## 二、TDD 模板

### 测试文件模板

```python
import pytest
from your_module import function_to_test

class TestFunctionToTest:
    """功能描述"""

    def test_normal_input(self):
        """正常输入"""
        result = function_to_test("input")
        assert result == expected_output

    def test_empty_input(self):
        """空输入"""
        result = function_to_test("")
        assert result == expected_output

    def test_edge_case(self):
        """边界情况"""
        result = function_to_test("a" * 1000)
        assert result is not None
```

### 实现文件模板

```python
from typing import List

def function_to_test(input_str: str) -> str:
    """
    功能描述

    Args:
        input_str: 输入参数描述

    Returns:
        返回值描述
    """
    if not input_str:
        return ""
    return input_str.strip()
```

---

## 三、验收标准

| 阶段 | 通过条件 |
|:---|:---|
| Brainstorm | 用户确认方案 |
| Writing Plans | 工单分解清晰可执行 |
| TDD | 所有测试通过 |
| Code Review | 无警告无错误 |
| Verification | 手动验证核心功能通过 |

---

## 四、禁止事项

- 不写测试就交付
- 测试永远通过（意味着测试没意义）
- 跳过 Code Review
- 不验证直接说"应该没问题"