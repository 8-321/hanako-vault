const DEFAULT_RULES = [
  {
    id: "todo",
    label: "待办",
    folder: "收件箱/已整理/待办",
    keywords: ["待办", "任务", "todo", "TODO", "提醒", "记得", "需要", "要做", "明天", "截止"]
  },
  {
    id: "content",
    label: "自媒体选题",
    folder: "收件箱/已整理/自媒体选题",
    keywords: ["公众号", "选题", "标题", "小红书", "抖音", "视频", "文案", "脚本", "账号", "涨粉"]
  },
  {
    id: "ai",
    label: "AI 与工具",
    folder: "收件箱/已整理/AI与工具",
    keywords: ["AI", "ai", "Codex", "Hanako", "Obsidian", "插件", "模型", "prompt", "agent", "Agent"]
  },
  {
    id: "daily",
    label: "日常记录",
    folder: "收件箱/已整理/日常记录",
    keywords: ["今天", "日记", "心情", "睡觉", "吃饭", "身体", "学习", "复盘", "感受"]
  },
  {
    id: "idea",
    label: "灵感碎片",
    folder: "收件箱/已整理/灵感碎片",
    keywords: []
  }
];

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseInboxEntries(text) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*(?:---|%%\s*kel-inbox-entry\s*%%)\s*\n|\n{2,}/g)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && !entry.startsWith("# 手机收件箱"));
}

function classifyEntry(entry, rules = DEFAULT_RULES) {
  const fallback = rules[rules.length - 1];
  const match = rules.find((rule) => rule.keywords.some((keyword) => entry.includes(keyword)));
  return match || fallback;
}

function buildOrganizedBlocks(entries, options = {}) {
  const rules = options.rules || DEFAULT_RULES;
  const date = options.date || getLocalDate();
  const source = options.source || "手机收件箱";
  const groups = new Map();

  for (const rawEntry of entries) {
    const entry = rawEntry.trim();
    if (!entry) continue;
    const rule = classifyEntry(entry, rules);
    if (!groups.has(rule.id)) {
      groups.set(rule.id, {
        rule,
        path: `${rule.folder}/${date}.md`,
        lines: []
      });
    }
    groups.get(rule.id).lines.push(`- ${entry.replace(/\n+/g, "\n  ")}`);
  }

  return Array.from(groups.values()).map((group) => ({
    path: group.path,
    content: `\n\n## ${date} 来自${source}\n${group.lines.join("\n")}\n`
  }));
}

function buildFreshInbox(date = getLocalDate()) {
  return [
    "# 手机收件箱",
    "",
    `> 上次整理：${date}`,
    "> 手机上的零碎记录先放这里，再用「整理手机收件箱」归档。",
    "",
    ""
  ].join("\n");
}

module.exports = { DEFAULT_RULES, getLocalDate, parseInboxEntries, classifyEntry, buildOrganizedBlocks, buildFreshInbox };
