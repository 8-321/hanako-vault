#!/usr/bin/env python3
"""HanakoVault 结构清理：统一目录，去除空壳。只移动，不删除。"""
import shutil
from pathlib import Path

VAULT = Path(r"D:\小柯 Ke\HanakoVault")
DRY_RUN = False  # 改为 True 可以先预览

MOVES = [
    # === 日志（合并两处日记） ===
    # 00 - 每日笔记 → 日志/
    ("00 - 每日笔记/2026-05-14.md", "日志/2026-05-14.md"),
    ("00 - 每日笔记/2026-05-15.md", "日志/2026-05-15.md"),
    # 日记 → 日志/
    ("日记/2026-04-14 你如何看待我.md", "日志/2026-04-14 你如何看待我.md"),
    ("日记/2026-04-14 Hanako首次协议定义会话.md", "日志/2026-04-14 Hanako首次协议定义会话.md"),
    ("日记/2026-05-06.md", "日志/2026-05-06.md"),
    ("日记/2026-05-07.md", "日志/2026-05-07.md"),
    ("日记/2026-05-11.md", "日志/2026-05-11.md"),
    ("日记/2026-05-12.md", "日志/2026-05-12.md"),
    ("日记/2026-05-13.md", "日志/2026-05-13.md"),

    # === 笔记（知识沉淀） ===
    ("使用案例.md", "笔记/使用案例.md"),
    ("工作流/大项目执行流程.md", "笔记/工作流/大项目执行流程.md"),
    ("工作流/小任务TDD流程.md", "笔记/工作流/小任务TDD流程.md"),
    ("AI调教体系索引.md", "笔记/AI调教体系索引.md"),

    # 技术资料库 → 笔记/技术/
    ("技术资料库/AI Coding/Codex 代码仓库探索手册.md", "笔记/技术/Codex 代码仓库探索手册.md"),
    ("技术资料库/AI Coding/Sublayer基础原理与工作流梳理.md", "笔记/技术/Sublayer基础原理与工作流梳理.md"),
    ("技术资料库/AI智能体控制手机/手机控制原理与工具.md", "笔记/技术/手机控制原理与工具.md"),
    ("技术资料库/中转站调研-三方对比功能对比.md", "笔记/技术/中转站调研-三方对比.md"),
    ("技术资料库/资源库-项目集合网站.md", "笔记/技术/资源库-项目集合网站.md"),

    # AI调教 → 笔记/AI调教/
    ("AI调教/场景提示词/编程助手模式.md", "笔记/AI调教/场景提示词/编程助手模式.md"),
    ("AI调教/场景提示词/深度思考模式.md", "笔记/AI调教/场景提示词/深度思考模式.md"),
    ("AI调教/场景提示词/QA测试模式.md", "笔记/AI调教/场景提示词/QA测试模式.md"),
    ("AI调教/知识沉淀/Claude思考协议.md", "笔记/AI调教/知识沉淀/Claude思考协议.md"),
    ("AI调教/知识沉淀/OpenClaw规范.md", "笔记/AI调教/知识沉淀/OpenClaw规范.md"),
    ("AI调教/知识沉淀/工程实践标准.md", "笔记/AI调教/知识沉淀/工程实践标准.md"),
    ("AI调教/知识沉淀/中转站架构.md", "笔记/AI调教/知识沉淀/中转站架构.md"),
    ("AI调教/系统提示词/001-主控核心协议.md", "笔记/AI调教/系统提示词/001-主控核心协议.md"),
    ("AI调教/系统提示词/002-子代理调度协议.md", "笔记/AI调教/系统提示词/002-子代理调度协议.md"),
    ("AI调教/系统提示词/003-执行验收标准.md", "笔记/AI调教/系统提示词/003-执行验收标准.md"),

    # === 回顾（合并复盘） ===
    ("复盘/周记/周记索引.md", "回顾/周记/周记索引.md"),
    ("复盘/周记/2026-W20-周记.md", "回顾/周记/2026-W20-周记.md"),
    ("复盘/月记/月记索引.md", "回顾/月记/月记索引.md"),
    ("复盘/月记/2026-04.md", "回顾/月记/2026-04.md"),
    ("复盘/复盘索引.md", "回顾/复盘索引.md"),

    # === 系统（Agent规则 + 工具 + 模板） ===
    ("CLAUDE.md", "系统/Agent规则/CLAUDE.md"),
    ("CODEX.md", "系统/Agent规则/CODEX.md"),
    ("CURSOR.md", "系统/Agent规则/CURSOR.md"),
    ("HANAKO.md", "系统/Agent规则/HANAKO.md"),
    ("Hanako个人助手协议.md", "系统/Agent规则/Hanako个人助手协议.md"),
    ("Hanako 控制台.md", "系统/Hanako 控制台.md"),
    ("资源索引总表.md", "系统/资源索引总表.md"),

    # 模板 → 系统/模板/
    ("模板/日记模板.md", "系统/模板/日记模板.md"),
    ("模板/周记模板.md", "系统/模板/周记模板.md"),
    ("模板/月记模板.md", "系统/模板/月记模板.md"),
    ("模板/工单模板.md", "系统/模板/工单模板.md"),
    ("模板/知识沉淀模板.md", "系统/模板/知识沉淀模板.md"),
    ("模板/踩坑记录模板.md", "系统/模板/踩坑记录模板.md"),

    # 工具配置 → 系统/工具/
    ("工具配置/codex-bridge", "系统/工具/codex-bridge"),

    # 中转站配置 → 系统/中转站/
    ("中转站配置/模型映射表.md", "系统/中转站/模型映射表.md"),
    ("中转站配置/API密钥库.md", "系统/中转站/API密钥库.md"),

    # 技能 → 系统/技能/
    ("技能/conversation-archiver", "系统/技能/conversation-archiver"),
    ("技能/diary", "系统/技能/diary"),
    ("技能/diary-scribe", "系统/技能/diary-scribe"),

    # === 对话记录 重命名 → 对话 ===
    # (不做，对话记录已有很多文件，保持原样避免影响同步脚本)
]


def main():
    moved = 0
    errors = 0

    for src_rel, dst_rel in MOVES:
        src = VAULT / src_rel
        dst = VAULT / dst_rel

        if not src.exists():
            print(f"[SKIP] 源不存在: {src_rel}")
            continue

        dst.parent.mkdir(parents=True, exist_ok=True)

        try:
            if DRY_RUN:
                print(f"[DRY] {src_rel} → {dst_rel}")
            else:
                shutil.move(str(src), str(dst))
                print(f"[OK] {src_rel} → {dst_rel}")
            moved += 1
        except Exception as e:
            print(f"[ERR] {src_rel}: {e}")
            errors += 1

    # 删除空目录
    if not DRY_RUN:
        removed_dirs = 0
        dirs_to_check = [
            "00 - 每日笔记", "日记", "技术资料库/AI Coding",
            "技术资料库/AI智能体控制手机", "技术资料库",
            "AI调教/场景提示词", "AI调教/知识沉淀", "AI调教/系统提示词",
            "AI调教", "复盘/周记", "复盘/月记", "复盘",
            "工作流", "模板", "中转站配置",
            "工具配置", "技能",
        ]
        for d_rel in dirs_to_check:
            d = VAULT / d_rel
            if d.exists():
                try:
                    remaining = list(d.iterdir())
                    if not remaining:
                        d.rmdir()
                        print(f"[RM] 空目录: {d_rel}/")
                        removed_dirs += 1
                    else:
                        print(f"[KEEP] 非空: {d_rel}/ ({len(remaining)} 项)")
                except OSError as e:
                    print(f"[ERR] 无法删除 {d_rel}: {e}")

    print(f"\n{'[DRY RUN] ' if DRY_RUN else ''}移动 {moved}，错误 {errors}")


if __name__ == "__main__":
    main()
