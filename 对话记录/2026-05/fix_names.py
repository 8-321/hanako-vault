#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
对话记录整理脚本：
1. 修复乱码文件名（UTF-8 双重编码）
2. 检测并删除重复文件（基于内容相似度）
3. 统一命名格式：YYYY-MM-DD 简短中文描述.md
4. 移除英文文件名
"""

import os
import hashlib
import re
import json

DIR = r"D:\小柯 Ke\HanakoVault\对话记录\2026-05"
OUTPUT_LOG = r"D:\小柯 Ke\HanakoVault\对话记录\2026-05\整理日志.md"

def decode_garbled(s):
    """尝试修复 UTF-8 双重编码的乱码"""
    try:
        return s.encode('latin-1').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    try:
        return s.encode('cp1252').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    return None

def shorten_name(filename):
    """缩短过长的文件名，提取核心含义"""
    # 移除日期前缀和 Codex 前缀
    name = re.sub(r'^Codex \d{4}-\d{2}-\d{2} ', '', filename)
    # 移除后缀 (2) (3) 等
    name = re.sub(r'\s*\(\d+\)$', '', name)
    # 限制长度
    if len(name) > 40:
        # 尝试在标点处截断
        cut = name[:40]
        # 找最后一个完整的中文字符
        for i in range(len(cut)-1, 20, -1):
            if '\u4e00' <= cut[i] <= '\u9fff':
                return cut[:i+1] + '…'
        return cut + '…'
    return name

def translate_english(filename):
    """翻译英文标题为中文"""
    translations = {
        'Automation- Hanako nightly Automation': '自动化-每晚巡检',
        'Automation- Hanako patrol Automation': '自动化-巡逻巡检',
        'Context- Service concept is 记忆减负型 AI': '场景-记忆减负型AI服务',
        'Context- User wants a sellable first': '场景-用户想要可出售的首个产品',
        'You are not alone in the codebase': '代码库你不是一个人',
        'You are running inside Hanako Codex': '在Hanako Codex中运行',
        'A，可以继续': '继续推进',
        '一步一步来': '逐步推进',
        '对话': '日常对话',
        '对话 (QnA)': '问答对话',
        'Codex 对话': 'Codex对话',
    }
    return translations.get(filename, filename)

def get_file_hash(filepath):
    """获取文件内容的 MD5 哈希"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        # 取每行的前 200 字符做哈希（跳过元数据差异）
        lines = [line[:200] for line in content.split('\n') if line.strip()]
        sample = '\n'.join(lines[:20])  # 只取前 20 行
        return hashlib.md5(sample.encode('utf-8')).hexdigest()
    except:
        return None

def main():
    os.chdir(DIR)
    files = [f for f in os.listdir('.') if f.endswith('.md') and f != '整理日志.md']
    
    log = []
    renamed = []
    deleted = []
    
    # === 第1步：修复乱码文件名 ===
    print("=== 第1步：修复乱码 ===")
    for f in files[:]:
        base = f.replace('.md', '')
        decoded = decode_garbled(base)
        if decoded and decoded != base:
            new_name = decoded.strip()
            if new_name:
                try:
                    os.rename(f, new_name + '.md')
                    log.append(f'修复乱码：{f} → {new_name}.md')
                    files.remove(f)
                    files.append(new_name + '.md')
                    renamed.append(new_name + '.md')
                except Exception as e:
                    log.append(f'修复失败：{f} ({e})')
    
    # === 第2步：检测重复 ===
    print("=== 第2步：检测重复 ===")
    hashes = {}
    for f in files:
        filepath = os.path.join(DIR, f)
        h = get_file_hash(filepath)
        if h:
            if h in hashes:
                # 重复文件
                os.remove(filepath)
                deleted.append(f)
                log.append(f'删除重复：{f}（内容与 {hashes[h]} 相同）')
            else:
                hashes[h] = f
    
    # === 第3步：统一命名 ===
    print("=== 第3步：统一命名 ===")
    files = [f for f in os.listdir('.') if f.endswith('.md') and f != '整理日志.md']
    
    for f in files:
        base = f.replace('.md', '')
        
        # 提取日期
        date_match = re.match(r'(?:Codex\s+)?(\d{4}-\d{2}-\d{2})\s+(.+)', base)
        if date_match:
            date = date_match.group(1)
            rest = date_match.group(2)
        else:
            # 尝试从文件中提取日期
            date = '2026-05'
            rest = base
        
        # 翻译英文
        rest = translate_english(rest)
        
        # 缩短过长名称
        rest = shorten_name(rest)
        
        new_base = f'{date} {rest}'
        new_name = new_base + '.md'
        
        if new_name != f:
            try:
                os.rename(f, new_name)
                log.append(f'重命名：{f} → {new_name}')
                renamed.append(new_name)
            except Exception as e:
                log.append(f'重命名失败：{f} ({e})')
    
    # === 第4步：去重命名（处理可能的重名） ===
    print("=== 第4步：处理重名 ===")
    seen = {}
    files = [f for f in os.listdir('.') if f.endswith('.md') and f != '整理日志.md']
    for f in files:
        if f in seen:
            # 重名！对比内容
            fp1 = os.path.join(DIR, seen[f])
            fp2 = os.path.join(DIR, f)
            h1 = get_file_hash(fp1)
            h2 = get_file_hash(fp2)
            if h1 == h2:
                os.remove(fp2)
                log.append(f'重名删除重复：{f}')
                deleted.append(f)
            else:
                # 内容不同，加后缀
                base = f.replace('.md', '')
                counter = 2
                while f in seen or os.path.exists(f):
                    f = f'{base}-{counter:02d}.md'
                    counter += 1
                os.rename(fp2, os.path.join(DIR, f))
                log.append(f'重名区分：{f}')
                renamed.append(f)
        else:
            seen[f] = f
    
    # === 写日志 ===
    with open(OUTPUT_LOG, 'w', encoding='utf-8') as f:
        f.write('# 对话记录整理日志\n\n')
        f.write(f'整理时间：2026-05-18\n\n')
        f.write(f'## 统计\n\n')
        f.write(f'- 修复乱码：{len([l for l in log if "修复乱码" in l])} 个\n')
        f.write(f'- 删除重复：{len([l for l in log if "删除重复" in l])} 个\n')
        f.write(f'- 重命名：{len([l for l in log if "重命名" in l])} 个\n')
        f.write(f'- 剩余文件：{len(files)} 个\n\n')
        f.write('## 详细操作\n\n')
        for l in log:
            f.write(f'- {l}\n')
    
    print(f"\n完成！修复 {len([l for l in log if '修复乱码' in l])} 个乱码，删除 {len([l for l in log if '删除重复' in l] )} 个重复，重命名 {len([l for l in log if '重命名' in l])} 个文件。剩余 {len(files)} 个文件。")

if __name__ == '__main__':
    main()
