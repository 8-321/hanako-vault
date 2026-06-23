const STORAGE_KEY = 'seedbrain.v0.1';
const now = () => new Date().toISOString();
const uid = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;

const navItems = [
  ['home', '首页', '把碎片记录变成可调用的大脑。'],
  ['notes', '全部记录', '所有语音、文字、图片、链接、会议都在这里。'],
  ['kb', '知识库', '按主题沉淀你的知识森林。'],
  ['assistant', 'AI 助手', '基于你的记录检索、问答、引用来源。'],
  ['studio', '创作工坊', '把一个念头变成朋友圈、小红书、公众号或周报。'],
  ['review', '回顾内化', '让过去的记录在合适的时间回来找你。'],
  ['ecosystem', '开放生态', 'CLI、API、Skill、Agent 工作流。'],
  ['settings', '设置', '导入、导出、本地数据与模型接入计划。'],
];
const captureTypes = [['text', '文字'], ['voice', '语音'], ['link', '链接'], ['image', '图片'], ['document', '文档'], ['meeting', '会议'], ['live', '直播/博主']];

function makeNote(partial) {
  const content = partial.content || partial.raw || '';
  return {
    id: uid('note'), type: partial.type || 'text', title: partial.title || titleFrom(content),
    content, raw: partial.raw || content, summary: summarize(content),
    tags: normalizeTags(partial.tags || autoTags(content)), knowledgeBaseId: partial.knowledgeBaseId || 'kb_default',
    createdAt: now(), updatedAt: now(), source: partial.source || '', attachments: partial.attachments || [], archived: false, starred: false, insights: []
  };
}
function seed() {
  return {
    route: 'home', activeCapture: 'text',
    kbs: [
      { id: 'kb_default', name: '默认知识库', description: '所有未分类记录都会先进入这里', color: '#d6ff73', createdAt: now() },
      { id: 'kb_writing', name: '写作素材', description: '灵感、选题、草稿、观点', color: '#8ae6c8', createdAt: now() },
      { id: 'kb_meeting', name: '会议纪要', description: '工作会议、访谈、沟通记录', color: '#bca6ff', createdAt: now() }
    ],
    notes: [
      makeNote({ type: 'text', title: '产品的核心不是存笔记，是让种子发芽', content: '今天想到，笔记产品如果只负责存储，很容易变成信息坟墓。真正有价值的是帮我发现旧想法之间的隐秘关联，并在合适的时候推回来。', tags: ['产品', '第二大脑', '洞察'], knowledgeBaseId: 'kb_writing' }),
      makeNote({ type: 'meeting', title: 'AI 知识库产品讨论', content: '会议结论：先做低摩擦记录、语义搜索、AI 问答、内容生成四件事。风险是转写成本和用户隐私。下一步要做本地原型和数据模型。', tags: ['会议', 'MVP', 'AI'], knowledgeBaseId: 'kb_meeting' }),
      makeNote({ type: 'link', title: '链接速记示例', content: '这是一篇关于 AI 笔记的文章。核心观点是，多格式采集已经成为基础能力，真正的差异会发生在主动智能体和可信引用层。', source: 'https://example.com/ai-notes', tags: ['链接', '调研'], knowledgeBaseId: 'kb_default' })
    ],
    insights: [], works: [], subscriptions: [], apiTokens: []
  };
}

let state = load();
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seed(); } catch { return seed(); } }
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function setRoute(route) { state.route = route; save(); render(); }
function $(sel) { return document.querySelector(sel); }
function escapeHtml(s = '') { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function normalizeTags(tags) { return [...new Set(tags.map(t => String(t).trim()).filter(Boolean))].slice(0, 8); }
function titleFrom(text) { return (text || '未命名记录').replace(/\s+/g, ' ').slice(0, 28); }
function summarize(text = '') { const clean = text.replace(/\s+/g, ' ').trim(); return clean.length > 92 ? clean.slice(0, 92) + '…' : clean || '等待 AI 整理内容。'; }
function autoTags(text = '') { const dict = ['产品','AI','会议','写作','学习','知识库','复盘','灵感','商业化','隐私','技术','公众号','小红书','课程']; const hit = dict.filter(k => text.includes(k)); return hit.length ? hit : ['未分类']; }
function kbName(id) { return state.kbs.find(k => k.id === id)?.name || '默认知识库'; }
function fmt(date) { return new Date(date).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 2200); }
function mostCommon(arr) { const map = {}; arr.forEach(x => map[x] = (map[x] || 0) + 1); return Object.entries(map).sort((a,b) => b[1]-a[1])[0]?.[0]; }
function typeLabel(t) { return ({ text:'文字', voice:'语音', link:'链接', image:'图片', document:'文档', meeting:'会议', live:'直播/博主' })[t] || t; }

function render() {
  renderNav();
  const item = navItems.find(i => i[0] === state.route) || navItems[0];
  $('#pageTitle').textContent = item[1]; $('#pageSubtitle').textContent = item[2];
  $('#view').innerHTML = routes[state.route]?.() || routes.home();
  bindViewEvents(); $('#agentPulse').textContent = agentPulse();
}
function renderNav() { $('#nav').innerHTML = navItems.map(([id, label]) => `<button class="${state.route === id ? 'active' : ''}" data-route="${id}">${label}</button>`).join(''); }
function agentPulse() { const top = mostCommon(state.notes.slice(0, 5).flatMap(n => n.tags)); return top ? `最近你反复在想「${top}」` : '正在等待第一颗种子'; }
function stat(label, num) { return `<div class="card stat"><div class="label">${label}</div><div class="num">${num}</div></div>`; }
function empty(text) { return `<div class="empty">${escapeHtml(text)}</div>`; }
function noteCard(n) {
  return `<article class="note" data-note-id="${n.id}">
    <div class="note-head"><div><h3>${escapeHtml(n.title)}</h3><div class="mini">${typeLabel(n.type)} · ${kbName(n.knowledgeBaseId)} · ${fmt(n.createdAt)}</div></div><div class="row"><button class="soft" data-ai="comment" data-id="${n.id}">点评</button><button class="soft" data-ai="sprout" data-id="${n.id}">发芽</button><button class="soft" data-ai="interrogate" data-id="${n.id}">拷问</button><button class="soft" data-ai="polish" data-id="${n.id}">润色</button></div></div>
    <p>${escapeHtml(n.summary)}</p><div class="tags">${n.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
    ${n.insights?.length ? `<div class="code" style="margin-top:10px">${escapeHtml(n.insights[n.insights.length-1].content)}</div>` : ''}
  </article>`;
}
function workCard(w) { return `<div class="note"><h3>${escapeHtml(w.title)}</h3><div class="mini">${w.format} · ${fmt(w.createdAt)}</div><p>${escapeHtml(w.content.slice(0, 180))}</p></div>`; }
function allTags() { return [...new Set(state.notes.flatMap(n => n.tags))]; }
function countTag(tag) { return state.notes.filter(n => n.tags.includes(tag)).length; }

const routes = {
  home() { const activeNotes = state.notes.filter(n => !n.archived); const review = pickReviewNotes(); return `
    <div class="grid cols-4">${stat('记录', activeNotes.length)}${stat('知识库', state.kbs.length)}${stat('AI 洞察', state.insights.length)}${stat('作品', state.works.length)}</div>
    <div class="split"><div class="card"><h2>快速记录</h2><p class="mini">像发消息一样，把脑子里的东西先倒出来。</p><div class="row" style="margin-top:14px">${captureTypes.map(([t,l]) => `<button class="soft" data-quick-capture="${t}">${l}</button>`).join('')}</div></div><div class="card"><h2>主动推给你</h2><p>${buildProactiveInsight()}</p><button class="primary" data-route="review">去回顾</button></div></div>
    <div class="card"><h2>最近记录</h2><div class="note-list">${activeNotes.slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,5).map(noteCard).join('') || empty('还没有记录')}</div></div>
    <div class="card"><h2>今日应该重看的种子</h2><div class="note-list">${review.map(noteCard).join('') || empty('记录多一点后，我会主动把旧想法推回来。')}</div></div>`; },
  notes() { return `<div class="searchbar"><input class="input" id="noteFilter" placeholder="搜索标题、正文、标签" /><button class="primary" data-open-capture>新建记录</button></div><div class="card"><div class="note-list" id="noteList">${state.notes.filter(n=>!n.archived).map(noteCard).join('') || empty('暂无记录')}</div></div>`; },
  kb() { return `<div class="split"><div class="card"><h2>知识库</h2><div class="note-list">${state.kbs.map(k => `<div class="kb-pill"><div><strong>${escapeHtml(k.name)}</strong><div class="mini">${escapeHtml(k.description)}</div></div><span class="tag">${state.notes.filter(n=>n.knowledgeBaseId===k.id).length} 条</span></div>`).join('')}</div></div><div class="card"><h2>新建知识库</h2><form id="kbForm" class="capture-form"><input class="input" name="name" placeholder="知识库名称" required /><textarea name="description" placeholder="这个知识库收什么内容？"></textarea><button class="primary">创建</button></form></div></div><div class="card"><h2>主题热度</h2><div class="tags">${allTags().map(t => `<span class="tag">${escapeHtml(t)} · ${countTag(t)}</span>`).join('') || '<span class="mini">暂无标签</span>'}</div></div>`; },
  assistant() { return `<div class="card"><h2>问你的大脑</h2><p class="mini">默认只基于本地记录回答，并给出引用来源。</p><div class="searchbar"><input class="input" id="askInput" placeholder="例如：我上次说的定价逻辑是什么？" /><button class="primary" id="askBtn">提问</button></div></div><div class="card" id="answerBox">${empty('问题会在这里生成回答、引用和相关笔记。')}</div>`; },
  studio() { return `<div class="split"><div class="card"><h2>选择素材</h2><div class="note-list">${state.notes.filter(n=>!n.archived).map(n => `<label class="note"><input type="checkbox" class="work-note" value="${n.id}" /> <strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.summary)}</p></label>`).join('') || empty('先创建一些记录')}</div></div><div class="card"><h2>生成作品</h2><select id="workFormat"><option value="moments">朋友圈</option><option value="xiaohongshu">小红书</option><option value="wechat">公众号</option><option value="weekly">周报</option><option value="meeting">会议纪要</option></select><button class="primary" id="makeWork" style="margin-top:12px">一键生成</button><div id="workOutput" class="work" style="margin-top:16px"></div></div></div><div class="card"><h2>作品归档</h2><div class="note-list">${state.works.map(workCard).join('') || empty('生成过的作品会保存在这里')}</div></div>`; },
  review() { const blind = findBlindSpots(); return `<div class="grid cols-3"><div class="card"><h2>每日回顾</h2><p>${pickReviewNotes()[0]?.summary || '暂无足够记录。'}</p></div><div class="card"><h2>重复困惑</h2><p>${blind.repeat || '还没有明显重复困惑。'}</p></div><div class="card"><h2>知识盲区</h2><p>${blind.gap || '记录越多，盲区识别越准。'}</p></div></div><div class="card"><h2>间隔共振</h2><div class="note-list">${pickReviewNotes().map(noteCard).join('') || empty('之后会按时间和主题推回旧笔记。')}</div></div>`; },
  ecosystem() { return `<div class="grid cols-2"><div class="card"><h2>CLI 草案</h2><div class="code">seedbrain add --type voice --file meeting.m4a --kb 会议纪要\nseedbrain search "定价逻辑" --json\nseedbrain sprout note_123 --mode deep\nseedbrain export --format markdown</div></div><div class="card"><h2>OpenAPI 草案</h2><div class="code">POST /api/notes\nGET /api/search?q=...\nPOST /api/insights/sprout\nPOST /api/works\nGET /api/kbs</div></div></div><div class="card"><h2>Skill 商店</h2><div class="note-list">${['会议纪要自动归档','公众号草稿生成','小红书选题挖掘','GitHub Star 自动摘要','微信读书划线导入','每晚知识盲区巡检'].map(x => `<div class="kb-pill"><strong>${x}</strong><button class="soft">安装</button></div>`).join('')}</div></div>`; },
  settings() { return `<div class="grid cols-2"><div class="card"><h2>本地数据</h2><p>当前数据保存在浏览器 localStorage。</p><button class="danger" id="resetBtn">重置演示数据</button></div><div class="card"><h2>真实模型接入计划</h2><ul><li>ASR：Whisper / 火山 / 讯飞</li><li>OCR：PaddleOCR / 火山 OCR</li><li>向量库：Qdrant / Chroma / pgvector</li><li>LLM：OpenAI / DeepSeek / Qwen / Claude</li></ul></div></div>`; }
};

function bindViewEvents() {
  document.querySelectorAll('[data-route]').forEach(b => b.onclick = () => setRoute(b.dataset.route));
  document.querySelectorAll('[data-open-capture]').forEach(b => b.onclick = () => openCapture(state.activeCapture || 'text'));
  document.querySelectorAll('[data-quick-capture]').forEach(b => b.onclick = () => openCapture(b.dataset.quickCapture));
  document.querySelectorAll('[data-ai]').forEach(b => b.onclick = () => runInsight(b.dataset.id, b.dataset.ai));
  $('#noteFilter')?.addEventListener('input', e => filterNotes(e.target.value));
  $('#kbForm')?.addEventListener('submit', createKb);
  $('#askBtn')?.addEventListener('click', askBrain);
  $('#makeWork')?.addEventListener('click', makeWork);
  $('#resetBtn')?.addEventListener('click', () => { if(confirm('确认重置演示数据？')) { state = seed(); save(); render(); }});
}

document.addEventListener('click', e => { if (e.target.matches('[data-close]')) closeCapture(); });
$('#exportBtn').onclick = exportJson;
$('#importFile').onchange = importJson;

function openCapture(type = 'text') { state.activeCapture = type; $('#captureModal').classList.remove('hidden'); renderCaptureTabs(); renderCaptureForm(); }
function closeCapture() { $('#captureModal').classList.add('hidden'); }
function renderCaptureTabs() { $('#captureTabs').innerHTML = captureTypes.map(([t,l]) => `<button class="${state.activeCapture===t?'active':''}" data-cap="${t}">${l}</button>`).join(''); document.querySelectorAll('[data-cap]').forEach(b => b.onclick = () => { state.activeCapture = b.dataset.cap; renderCaptureTabs(); renderCaptureForm(); }); }
function renderCaptureForm() {
  const type = state.activeCapture;
  const kbOptions = state.kbs.map(k => `<option value="${k.id}">${escapeHtml(k.name)}</option>`).join('');
  const base = `<input class="input" name="title" placeholder="标题，可不填" /><select name="knowledgeBaseId">${kbOptions}</select><input class="input" name="tags" placeholder="标签，用逗号分隔，可不填" />`;
  const fields = {
    text: `<textarea name="content" placeholder="直接写下想法、碎片、日记、草稿……" required></textarea>`,
    voice: `<div class="row"><button type="button" class="soft" id="speechBtn">尝试浏览器语音识别</button><span class="mini">不支持时可以手动粘贴转写文本</span></div><textarea name="content" placeholder="语音转写文本会出现在这里，也可以手动输入" required></textarea>`,
    link: `<input class="input" name="source" placeholder="粘贴链接 URL" required /><textarea name="content" placeholder="可补充你为什么保存这个链接"></textarea>`,
    image: `<input class="input" name="file" type="file" accept="image/*" /><textarea name="content" placeholder="图片里的文字、截图重点或你的补充说明"></textarea>`,
    document: `<input class="input" name="file" type="file" /><textarea name="content" placeholder="文档摘要、重点或待解析说明"></textarea>`,
    meeting: `<textarea name="content" placeholder="粘贴会议录音转写、发言要点、行动项" required></textarea>`,
    live: `<input class="input" name="source" placeholder="直播间/博主主页/视频链接" required /><textarea name="content" placeholder="订阅理由、想追踪的重点"></textarea>`
  }[type];
  $('#captureForm').innerHTML = base + fields + `<button class="primary">保存并 AI 整理</button>`;
  $('#captureForm').onsubmit = saveCapture;
  $('#speechBtn')?.addEventListener('click', startSpeech);
}
function saveCapture(e) {
  e.preventDefault(); const fd = new FormData(e.currentTarget); const type = state.activeCapture;
  let content = fd.get('content') || ''; const source = fd.get('source') || ''; const file = fd.get('file');
  if (type === 'link') content = linkDigest(source, content);
  if (type === 'image') content = imageDigest(file, content);
  if (type === 'document') content = docDigest(file, content);
  if (type === 'meeting') content = meetingDigest(content);
  if (type === 'live') content = liveDigest(source, content);
  const tags = fd.get('tags') ? String(fd.get('tags')).split(/[,，]/) : autoTags(content);
  const note = makeNote({ type, title: fd.get('title') || titleFrom(content), content, source, tags, knowledgeBaseId: fd.get('knowledgeBaseId') });
  state.notes.unshift(note); if (type === 'live') state.subscriptions.push({ id: uid('sub'), source, noteId: note.id, createdAt: now() });
  save(); closeCapture(); render(); toast('已保存，AI 已完成初步整理');
}
function linkDigest(url, memo) { return `链接：${url}\nAI 速记：这条链接已进入待读队列。系统会提取标题、作者、核心论点、可引用段落和与你历史记录相关的主题。\n你的补充：${memo || '无'}`; }
function imageDigest(file, memo) { return `图片记录：${file?.name || '未命名图片'}\nOCR 占位：这里会识别图片中的文字、表格和场景，并生成结构化笔记。\n你的补充：${memo || '无'}`; }
function docDigest(file, memo) { return `文档记录：${file?.name || '未命名文档'}\n文档解析占位：这里会抽取章节、摘要、术语、行动项和可引用来源。\n你的补充：${memo || '无'}`; }
function meetingDigest(text) { return `会议纪要\n一、核心结论：${summarize(text)}\n二、行动项：1. 明确负责人 2. 确认截止时间 3. 下次复盘\n三、原始转写：${text}`; }
function liveDigest(url, memo) { return `订阅源：${url}\n追踪目标：${memo || '自动追踪该来源的更新、提炼重点并入库。'}\nAI 将每天生成摘要、观点变化和可引用片段。`; }
function startSpeech() { const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SpeechRecognition) return toast('当前浏览器不支持 Web Speech API，可以手动粘贴转写文本'); const rec = new SpeechRecognition(); rec.lang = 'zh-CN'; rec.continuous = true; rec.interimResults = true; const textarea = $('#captureForm textarea[name="content"]'); rec.onresult = e => { textarea.value = Array.from(e.results).map(r => r[0].transcript).join(''); }; rec.onerror = () => toast('语音识别失败，请检查浏览器权限'); rec.start(); toast('开始听写，再次保存即可入库'); }

function runInsight(id, mode) { const note = state.notes.find(n => n.id === id); if (!note) return; const content = aiInsight(note, mode); const insight = { id: uid('ins'), noteId: id, mode, content, createdAt: now() }; note.insights = note.insights || []; note.insights.push(insight); note.updatedAt = now(); state.insights.push(insight); save(); render(); toast(`${modeName(mode)}完成`); }
function modeName(mode) { return ({ comment:'点评', sprout:'发芽', interrogate:'拷问', polish:'润色' })[mode]; }
function aiInsight(note, mode) { const related = relatedNotes(note).slice(0, 3).map(n => `《${n.title}》`).join('、') || '暂无明显相关记录'; if (mode === 'comment') return `点评：这条记录的价值在于「${note.tags[0] || '未分类'}」主题下的真实观察。最亮的部分是你没有停在结论，而是在描述一个可复用的问题结构。相关记录：${related}`; if (mode === 'sprout') return `发芽：可以沿三个方向长出去。1. 做成一篇观点短文。2. 和旧记录 ${related} 连接，形成一个主题簇。3. 变成一个可执行实验，定义输入、过程、输出和复盘指标。`; if (mode === 'interrogate') return `拷问：这里还有三个问题没想透。第一，判断依据是什么？第二，有没有反例？第三，如果要落地，最小可验证动作是什么？请补一条记录回答这三个问题。`; return `润色版：${note.content.replace(/嗯|啊|就是|然后/g, '').replace(/\s+/g, ' ').trim()}\n\n标题建议：${note.title}\n表达策略：保留你的原始判断，把口语重复删掉，让观点更像能发布的段落。`; }
function relatedNotes(note) { return state.notes.filter(n => n.id !== note.id).map(n => ({ n, score: similarity(note, n) })).filter(x => x.score > 0).sort((a,b)=>b.score-a.score).map(x => x.n); }
function similarity(a,b) { const tagScore = a.tags.filter(t => b.tags.includes(t)).length * 3; const words = [...new Set(a.content.slice(0,160).split(/[\s，。、“”：「」,.!?]+/).filter(w => w.length > 1))]; const wordScore = words.filter(w => b.content.includes(w)).length; return tagScore + wordScore; }
function filterNotes(q) { const list = state.notes.filter(n => !n.archived).filter(n => !q || `${n.title} ${n.content} ${n.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())); $('#noteList').innerHTML = list.map(noteCard).join('') || empty('没有匹配记录'); document.querySelectorAll('[data-ai]').forEach(b => b.onclick = () => runInsight(b.dataset.id, b.dataset.ai)); }
function createKb(e) { e.preventDefault(); const fd = new FormData(e.currentTarget); state.kbs.push({ id: uid('kb'), name: fd.get('name'), description: fd.get('description') || '', color: '#d6ff73', createdAt: now() }); save(); render(); toast('知识库已创建'); }
function askBrain() { const q = $('#askInput').value.trim(); if (!q) return; const scored = state.notes.map(n => ({ n, score: scoreQuery(q,n) })).filter(x => x.score > 0).sort((a,b)=>b.score-a.score).slice(0,5); const answer = scored.length ? `基于你的记录，我找到 ${scored.length} 条相关来源。我的判断是：${summarize(scored.map(x=>x.n.summary).join(' '))}` : '你的笔记里暂时没有足够依据回答这个问题。这个“不知道”会被记录为知识盲区。'; $('#answerBox').innerHTML = `<h2>回答</h2><p>${escapeHtml(answer)}</p><h3>引用来源</h3><div class="note-list">${scored.map(x => noteCard(x.n)).join('') || empty('没有引用来源')}</div>`; document.querySelectorAll('[data-ai]').forEach(b => b.onclick = () => runInsight(b.dataset.id, b.dataset.ai)); }
function scoreQuery(q,n) { return q.split(/[\s，。？！]+/).filter(Boolean).reduce((s,w)=>s + (`${n.title} ${n.content} ${n.tags.join(' ')}`.includes(w) ? 2 : 0), 0) + n.tags.filter(t => q.includes(t)).length * 3; }
function makeWork() { const ids = [...document.querySelectorAll('.work-note:checked')].map(x => x.value); if (!ids.length) return toast('先选择至少一条素材'); const notes = ids.map(id => state.notes.find(n=>n.id===id)).filter(Boolean); const format = $('#workFormat').value; const content = buildWork(format, notes); const work = { id: uid('work'), noteIds: ids, format, title: workTitle(format, notes), content, versions: [content], createdAt: now() }; state.works.unshift(work); save(); render(); setRoute('studio'); setTimeout(() => { const out = $('#workOutput'); if (out) out.innerHTML = `<div class="code">${escapeHtml(content)}</div>`; }, 0); toast('作品已生成并归档'); }
function workTitle(format, notes) { return `${({moments:'朋友圈', xiaohongshu:'小红书', wechat:'公众号', weekly:'周报', meeting:'会议纪要'})[format]}｜${notes[0].title}`; }
function buildWork(format, notes) { const core = notes.map((n,i)=>`${i+1}. ${n.summary}`).join('\n'); if (format === 'moments') return `今天有个小发现：\n\n${core}\n\n有些念头当下看只是碎片，过几天回看，才知道它其实在指一个更大的方向。`; if (format === 'xiaohongshu') return `标题：我开始用 AI 把碎片想法养成作品\n\n开头：以前记录越多越焦虑，现在我更关心一条记录能不能被重新唤醒。\n\n重点：\n${core}\n\n结尾：记录不是为了囤积，是为了让未来的自己少走一点弯路。`; if (format === 'wechat') return `# ${notes[0].title}\n\n## 一、问题从哪里来\n${notes[0].summary}\n\n## 二、我看到的结构\n${core}\n\n## 三、下一步实验\n把记录、回顾、追问、成稿连成一个闭环，每天只推进一小步。`; if (format === 'weekly') return `本周周报\n\n一、本周关键输入\n${core}\n\n二、沉淀出的判断\n重复出现的主题值得升级成项目。\n\n三、下周动作\n继续收集素材，并用 AI 做一次盲区拷问。`; return `会议纪要\n\n一、核心结论\n${core}\n\n二、行动项\n1. 补齐信息来源\n2. 明确负责人\n3. 设定复盘时间`; }
function buildProactiveInsight() { const top = mostCommon(state.notes.flatMap(n=>n.tags)); if (!top) return '先记录三条内容，我会开始找你的重复主题。'; return `你最近多次记录「${top}」。建议把相关笔记合并成一个知识库主题，并生成一篇短文或一次复盘。`; }
function pickReviewNotes() { return state.notes.slice().sort((a,b) => a.createdAt.localeCompare(b.createdAt)).slice(0, 3); }
function findBlindSpots() { const top = mostCommon(state.notes.flatMap(n=>n.tags)); return { repeat: top ? `「${top}」出现频率最高，可能是当前主线。` : '', gap: top ? `你记录了很多「${top}」，但缺少反例、数据或落地验证。` : '' }; }
function exportJson() { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `seedbrain-export-${Date.now()}.json`; a.click(); URL.revokeObjectURL(a.href); }
function importJson(e) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { state = JSON.parse(reader.result); save(); render(); toast('导入完成'); } catch { toast('JSON 格式错误'); } }; reader.readAsText(file); }

render();
