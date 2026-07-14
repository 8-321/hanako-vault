// ===== 桌面书签 v7 =====
const state = {
  todos: [], ideas: [], knowledge: [], reports: [],
  settings: { opacity: 92, theme: 'ink' },
  currentTab: 'todo',
  catFilter: { todo: '', ideas: '', knowledge: '' }
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const dom = {
  bookmark: $('#bookmark'), panel: $('#panel'), titlebar: $('#titlebar'), btnCollapse: $('#btn-collapse'),
  todoInput: $('#todo-input'), todoCategory: $('#todo-category'), todoList: $('#todo-list'), todoCount: $('#todo-count'),
  btnClearDone: $('#btn-clear-done'), todoCatFilter: $('#todo-cat-filter'),
  ideasInput: $('#ideas-input'), ideasCategory: $('#ideas-category'), ideasList: $('#ideas-list'),
  btnSaveIdea: $('#btn-save-idea'), ideasCatFilter: $('#ideas-cat-filter'),
  knowledgeInput: $('#knowledge-input'), knowledgeCategory: $('#knowledge-category'), knowledgeList: $('#knowledge-list'),
  btnSaveKnowledge: $('#btn-save-knowledge'), knowledgeCatFilter: $('#knowledge-cat-filter'),
  timelineContainer: $('#timeline-container'),
  trashList: $('#trash-list'),
  btnDailyReport: $('#btn-daily-report'), btnWeeklyReport: $('#btn-weekly-report'), btnYearlyReport: $('#btn-yearly-report'),
  reportOutput: $('#report-output'), btnCopyReport: $('#btn-copy-report'),
  savedReports: $('#saved-reports'),
  opacitySlider: $('#opacity-slider'), themeSelect: $('#theme-select'),
  catMenu: $('#cat-menu'),
  btnSearch: $('#btn-search'),
  searchBar: $('#search-bar'),
  searchInput: $('#search-input'),
};

async function init() {
  const data = await window.bookmarkAPI.getAllStore();
  if (data) {
    state.todos = data.todos || []; state.ideas = data.ideas || []; state.knowledge = data.knowledge || []; state.reports = data.reports || [];
    state.settings = { opacity: 92, theme: 'ink', ...(data.settings || {}) };
  }
  applySettings(); bindEvents(); renderAll();
  // 调试：确认数据加载状态
  console.log('[init] loaded todos:', state.todos.length, 'ideas:', state.ideas.length, 'knowledge:', state.knowledge.length);
  console.log('[init] categories:', [...new Set([...state.todos,...state.ideas,...state.knowledge].map(i=>i.category).filter(Boolean))].sort());
}
function applySettings() {
  document.body.style.opacity = state.settings.opacity / 100;
  dom.opacitySlider.value = state.settings.opacity;
  document.body.className = 'theme-' + state.settings.theme;
  dom.themeSelect.value = state.settings.theme;
}
function bindEvents() {
  // 折叠态书签拖动
  let drag = null, dragMoved = false;
  dom.bookmark.addEventListener('mousedown', e => {
    if (!dom.panel.classList.contains('hidden')) return; // 展开时不拖
    drag = { x: e.screenX, y: e.screenY };
    dragMoved = false;
  });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    const dx = e.screenX - drag.x, dy = e.screenY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) < 3) return;
    dragMoved = true;
    window.bookmarkAPI.moveBookmark(dx, dy);
    drag.x = e.screenX; drag.y = e.screenY;
  });
  window.addEventListener('mouseup', () => { drag = null; });
  dom.bookmark.addEventListener('click', e => {
    if (dragMoved) { dragMoved = false; return; }
    toggleExpand();
  });
  dom.btnCollapse.addEventListener('click', collapse);
  dom.btnSearch.addEventListener('click', () => {
    const h = dom.searchBar.classList.toggle('hidden');
    if (!h) { dom.searchInput.value = ''; dom.searchInput.focus(); clearSearch(); }
  });
  dom.searchInput.addEventListener('input', () => {
    const q = dom.searchInput.value.trim().toLowerCase();
    if (!q) { clearSearch(); return; }
    searchAll(q);
  });
  $$('.tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  if (window.bookmarkAPI.onTriggerToggle) window.bookmarkAPI.onTriggerToggle(() => dom.panel.classList.contains('hidden') ? toggleExpand() : collapse());
  dom.todoInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTodo(); } });
  dom.btnClearDone.addEventListener('click', clearDoneTodos);
  dom.ideasInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveIdea(); } });
  dom.btnSaveIdea.addEventListener('click', saveIdea);
  dom.knowledgeInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveKnowledge(); } });
  dom.btnSaveKnowledge.addEventListener('click', saveKnowledge);
  // 知识区粘贴图片
  dom.knowledgeInput.addEventListener('paste', e => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          knowledgeImageData = reader.result;
          dom.knowledgeInput.placeholder = '已粘贴图片，输入文字说明后保存';
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
  });
  // 分类输入框点出自定义下拉
  // 按 ↓ 键也弹出
  [dom.todoCategory, dom.ideasCategory, dom.knowledgeCategory].forEach(inp => {
    // 点击即弹出
    inp.addEventListener('click', e => { showCatMenu(inp); e.stopPropagation(); });
    // 分类输入框键盘：↓ 弹出下拉，回车保存
  [dom.todoCategory, dom.ideasCategory, dom.knowledgeCategory].forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); (inp === dom.todoCategory ? addTodo : inp === dom.ideasCategory ? saveIdea : saveKnowledge)(); return; }
      if (e.key === 'ArrowDown') {
        if (dom.catMenu.classList.contains('hidden')) showCatMenu(inp);
        else catNav(1);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        catNav(-1); e.preventDefault();
      } else if (e.key === 'Escape') {
        hideCatMenu(); inp.focus();
      }
    });
  });
  dom.btnDailyReport.addEventListener('click', () => generateReport('daily'));
  dom.btnWeeklyReport.addEventListener('click', () => generateReport('weekly'));
  dom.btnYearlyReport.addEventListener('click', () => generateReport('yearly'));
  dom.btnCopyReport.addEventListener('click', copyReport);
  dom.opacitySlider.addEventListener('input', () => { const v = parseInt(dom.opacitySlider.value); document.body.style.opacity = v / 100; state.settings.opacity = v; window.bookmarkAPI.setStore('settings', state.settings); });
  dom.themeSelect.addEventListener('change', () => { state.settings.theme = dom.themeSelect.value; document.body.className = 'theme-' + state.settings.theme; window.bookmarkAPI.setStore('settings', state.settings); });
  // 分类输入点出自定义下拉
  // 分类输入点出自定义下拉 — 点击/聚焦都弹出
  document.addEventListener('focusin', e => {
    if (e.target.classList.contains('cat-input')) showCatMenu(e.target);
  });
  document.addEventListener('click', e => {
    if (e.target.classList.contains('cat-input')) { showCatMenu(e.target); return; }
    if (!e.target.closest('.cat-menu') && !e.target.closest('.cat-input')) hideCatMenu();
  });
  dom.catMenu.addEventListener('mousedown', e => {
    const opt = e.target.closest('.cat-menu-opt');
    if (!opt) return;
    const inp = dom.catMenu._input || document.querySelector('.cat-input:focus');
    if (inp) { inp.value = opt.dataset.cat; inp.focus(); }
    e.preventDefault();
    hideCatMenu();
  });
  dom.catMenu.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const active = dom.catMenu.querySelector('.cat-menu-opt.active');
      if (active) {
        const inp = dom.catMenu._input || document.querySelector('.cat-input:focus');
        if (inp) { inp.value = active.dataset.cat; inp.focus(); }
        hideCatMenu();
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') { catNav(1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { catNav(-1); e.preventDefault(); }
    else if (e.key === 'Escape') { const inp = dom.catMenu._input; hideCatMenu(); if (inp) inp.focus(); e.preventDefault(); }
  });
}

async function toggleExpand() { const e = await window.bookmarkAPI.toggleExpand(); if (e) { dom.bookmark.style.display = 'none'; dom.panel.classList.remove('hidden'); setTimeout(focusInput, 80); } }
async function collapse() { await window.bookmarkAPI.collapse(); dom.panel.classList.add('hidden'); dom.bookmark.style.display = 'flex'; }
function focusInput() { const m = { todo: dom.todoInput, ideas: dom.ideasInput, knowledge: dom.knowledgeInput }; if (m[state.currentTab]) m[state.currentTab].focus(); }
function switchTab(tab) {
  state.currentTab = tab; $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  $$('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-' + tab));
  if (tab === 'timeline') renderTimeline();
  if (tab === 'trash') renderTrash();
  if (tab === 'report') { generateReport('daily'); renderSavedReports(); }
  if (tab === 'todo' || tab === 'ideas' || tab === 'knowledge') renderCatFilter(tab);
  focusInput();
}
function renderAll() { renderTodos(); renderIdeas(); renderKnowledge(); renderTimeline(); renderTrash(); renderCatFilter(state.currentTab); updateTodoCount(); }

function getCats(type) {
  const s = this ? null : null; // noop
  const set = new Set();
  const m = { todo: state.todos, ideas: state.ideas, knowledge: state.knowledge };
  m[type].forEach(i => { if (i.category) set.add(i.category); });
  return [...set].sort();
}
function renderCatFilter(type) {
  const cats = getCats(type);
  const el = { todo: dom.todoCatFilter, ideas: dom.ideasCatFilter, knowledge: dom.knowledgeCatFilter };
  const c = el[type]; if (!c) return;
  if (!cats.length) { c.innerHTML = ''; return; }
  const cur = state.catFilter[type] || '';
  c.innerHTML = '<button class="cat-filter-btn' + (!cur ? ' active' : '') + '" data-cat="">全部</button>' +
    cats.map(x => '<button class="cat-filter-btn' + (cur === x ? ' active' : '') + '" data-cat="' + x + '">' + x + '</button>').join('');
  c.querySelectorAll('.cat-filter-btn').forEach(b => b.addEventListener('click', () => {
    state.catFilter[type] = b.dataset.cat;
    if (type === 'todo') renderTodos(); else if (type === 'ideas') renderIdeas(); else renderKnowledge();
    renderCatFilter(type);
  }));
}

function addTodo() {
  const text = dom.todoInput.value.trim(); if (!text) return;
  state.todos.push({ id: genId(), text, done: false, category: dom.todoCategory.value.trim(), createdAt: new Date().toISOString(), order: state.todos.length });
  dom.todoInput.value = ''; dom.todoCategory.value = ''; saveTodos(); renderTodos(); updateTodoCount(); renderCatFilter('todo');
}
function toggleTodo(id) { const t = state.todos.find(x => x.id === id); if (!t) return; t.done = !t.done; if (t.done) t.completedAt = new Date().toISOString(); else delete t.completedAt; saveTodos(); renderTodos(); updateTodoCount(); }
function deleteTodo(id) { const t = state.todos.find(x => x.id === id); if (!t) return; t.deletedAt = new Date().toISOString(); saveTodos(); renderTodos(); updateTodoCount(); }
function clearDoneTodos() { const n = new Date().toISOString(); state.todos.forEach(t => { if (t.done && !t.deletedAt) t.deletedAt = n; }); saveTodos(); renderTodos(); updateTodoCount(); }
function updateTodoCount() { const a = state.todos.filter(t => !t.done && !t.deletedAt).length, b = state.todos.filter(t => !t.deletedAt).length; dom.todoCount.textContent = !b ? '暂无待办' : !a ? '全部完成' : a + '/' + b; }
function renderTodos() {
  let items = state.todos.filter(t => !t.deletedAt).sort((a, b) => a.done !== b.done ? a.done ? 1 : -1 : a.order - b.order);
  if (state.catFilter.todo) items = items.filter(t => t.category === state.catFilter.todo);
  if (!items.length) { dom.todoList.innerHTML = '<div class="empty-state"><div class="empty-state-icon"></div><span class="empty-state-text">还没有待办</span></div>'; return; }
  dom.todoList.innerHTML = items.map(t => `
    <div class="todo-item${t.done?' done':''}" data-id="${t.id}" draggable="true">
      <div class="todo-checkbox" data-id="${t.id}">${t.done?'v':''}</div>
      <span class="todo-text">${esc(t.text)}${t.category ? '<span class="cat-tag">'+esc(t.category)+'</span>' : ''}</span>
      <button class="todo-delete" data-id="${t.id}">x</button>
    </div>`).join('');
  dom.todoList.querySelectorAll('.todo-checkbox').forEach(c => c.addEventListener('click', e => { e.stopPropagation(); toggleTodo(c.dataset.id); }));
  dom.todoList.querySelectorAll('.todo-delete').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); deleteTodo(b.dataset.id); }));
  dom.todoList.querySelectorAll('.todo-item').forEach(el => el.addEventListener('dblclick', e => { if (!e.target.closest('.todo-checkbox,.todo-delete')) enableTodoEdit(el); }));
  let dragged = null;
  dom.todoList.querySelectorAll('.todo-item').forEach(item => {
    item.addEventListener('dragstart', () => { dragged = item; item.classList.add('dragging'); });
    item.addEventListener('dragend', () => { dragged = null; item.classList.remove('dragging'); });
    item.addEventListener('dragover', e => e.preventDefault());
    item.addEventListener('drop', e => {
      e.preventDefault(); if (!dragged || dragged === item) return;
      const fi = state.todos.findIndex(t => t.id === dragged.dataset.id), ti = state.todos.findIndex(t => t.id === item.dataset.id);
      if (fi < 0 || ti < 0) return;
      state.todos.splice(fi, 1), state.todos.splice(ti, 0);
      state.todos.forEach((x, i) => x.order = i); saveTodos(); renderTodos();
    });
  });
}

function saveIdea() {
  const text = dom.ideasInput.value.trim(); if (!text) return;
  state.ideas.unshift({ id: genId(), text, category: dom.ideasCategory.value.trim(), createdAt: new Date().toISOString() });
  dom.ideasInput.value = ''; dom.ideasCategory.value = ''; saveIdeas(); renderIdeas(); renderCatFilter('ideas');
}
function deleteIdea(id) { const i = state.ideas.find(x => x.id === id); if (!i) return; i.deletedAt = new Date().toISOString(); saveIdeas(); renderIdeas(); }
function renderIdeas() {
  let items = state.ideas.filter(i => !i.deletedAt);
  if (state.catFilter.ideas) items = items.filter(i => i.category === state.catFilter.ideas);
  if (!items.length) { dom.ideasList.innerHTML = '<div class="empty-state"><div class="empty-state-icon"></div><span class="empty-state-text">还没有想法</span></div>'; return; }
  dom.ideasList.innerHTML = items.map(i => '<div class="idea-item" data-id="' + i.id + '"><div class="idea-header"><span class="idea-time">' + fmtTime(i.createdAt) + '</span><div class="item-actions"><button class="item-edit" data-id="' + i.id + '">edit</button><button class="idea-delete" data-id="' + i.id + '">x</button></div></div><div class="idea-content" data-mode="view">' + esc(i.text) + (i.category ? '<span class="cat-tag">' + esc(i.category) + '</span>' : '') + '</div></div>').join('');
  dom.ideasList.querySelectorAll('.idea-delete').forEach(b => b.addEventListener('click', () => deleteIdea(b.dataset.id)));
  dom.ideasList.querySelectorAll('.item-edit').forEach(b => b.addEventListener('click', () => editItem('ideas', b.dataset.id)));
}

function saveKnowledge() {
  const text = dom.knowledgeInput.value.trim();
  if (!text && !knowledgeImageData) return;
  state.knowledge.unshift({ id: genId(), text, category: dom.knowledgeCategory.value.trim(), createdAt: new Date().toISOString(), image: knowledgeImageData || null });
  dom.knowledgeInput.value = ''; dom.knowledgeInput.placeholder = '记录知识笔记...';
  dom.knowledgeCategory.value = ''; knowledgeImageData = null;
  saveKnowledgeStore(); renderKnowledge(); renderCatFilter('knowledge');
}
function deleteKnowledge(id) { const k = state.knowledge.find(x => x.id === id); if (!k) return; k.deletedAt = new Date().toISOString(); saveKnowledgeStore(); renderKnowledge(); }
function renderKnowledge() {
  let items = state.knowledge.filter(k => !k.deletedAt);
  if (state.catFilter.knowledge) items = items.filter(i => i.category === state.catFilter.knowledge);
  if (!items.length) { dom.knowledgeList.innerHTML = '<div class="empty-state"><div class="empty-state-icon"></div><span class="empty-state-text">还没有知识笔记</span></div>'; return; }
  dom.knowledgeList.innerHTML = items.map(k => '<div class="knowledge-item" data-id="' + k.id + '"><div class="knowledge-header"><span class="knowledge-time">' + fmtTime(k.createdAt) + '</span><div class="item-actions"><button class="item-edit" data-id="' + k.id + '">edit</button><button class="knowledge-delete" data-id="' + k.id + '">x</button></div></div>' + (k.image ? '<img class="knowledge-img" src="' + k.image + '" onclick="this.classList.toggle(\'expanded\')">' : '') + '<div class="knowledge-content" data-mode="view">' + esc(k.text) + (k.category ? '<span class="cat-tag">' + esc(k.category) + '</span>' : '') + '</div></div>').join('');
  dom.knowledgeList.querySelectorAll('.knowledge-delete').forEach(b => b.addEventListener('click', () => deleteKnowledge(b.dataset.id)));
  dom.knowledgeList.querySelectorAll('.item-edit').forEach(b => b.addEventListener('click', () => editItem('knowledge', b.dataset.id)));
}

function renderTimeline() {
  const entries = [
    ...state.todos.filter(t => !t.deletedAt).map(t => ({ type: t.done ? 'done' : 'todo', text: t.text, time: t.done ? t.completedAt : t.createdAt })),
    ...state.ideas.filter(i => !i.deletedAt).map(i => ({ type: 'idea', text: i.text, time: i.createdAt }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time));
  if (!entries.length) { dom.timelineContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon"></div><span class="empty-state-text">时间线还是空的</span></div>'; return; }
  const groups = {};
  entries.forEach(e => { const d = fmtDate(e.time); if (!groups[d]) groups[d] = []; groups[d].push(e); });
  const labels = { todo: '待办', done: '已完成', idea: '想法' };
  dom.timelineContainer.innerHTML = Object.entries(groups).map(([d, items]) => '<div class="timeline-group"><div class="timeline-date"><div class="timeline-date-dot"></div><span class="timeline-date-label">' + d + '</span></div>' + items.map(e => '<div class="timeline-entry entry-' + e.type + '"><div class="timeline-entry-type">' + labels[e.type] + '</div><div class="timeline-entry-time">' + fmtTime(e.time) + '</div><div class="timeline-entry-text">' + esc(e.text) + '</div></div>').join('') + '</div>').join('');
}

function renderTrash() {
  const items = [
    ...state.todos.filter(t => t.deletedAt).map(t => ({ ...t, kind: 'todo' })),
    ...state.ideas.filter(i => i.deletedAt).map(i => ({ ...i, kind: 'idea' })),
    ...state.knowledge.filter(k => k.deletedAt).map(k => ({ ...k, kind: 'knowledge' }))
  ].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
  if (!items.length) { dom.trashList.innerHTML = '<div class="empty-state"><div class="empty-state-icon"></div><span class="empty-state-text">这里是恢复区</span></div>'; return; }
  dom.trashList.innerHTML = items.map(item => '<div class="trash-item"><div class="trash-meta">' + (item.kind === 'todo' ? '待办' : item.kind === 'idea' ? '想法' : '知识') + ' 删除于 ' + fmtTime(item.deletedAt) + '</div><div class="trash-text">' + esc(item.text) + '</div><div class="trash-actions"><button class="btn-secondary restore-btn" data-kind="' + item.kind + '" data-id="' + item.id + '">恢复</button><button class="delete-perm-btn" data-kind="' + item.kind + '" data-id="' + item.id + '">永久删除</button></div></div>').join('');
  dom.trashList.querySelectorAll('.restore-btn').forEach(b => b.addEventListener('click', () => restoreItem(b.dataset.kind, b.dataset.id)));
  dom.trashList.querySelectorAll('.delete-perm-btn').forEach(b => b.addEventListener('click', () => permanentDelete(b.dataset.kind, b.dataset.id)));
}
function restoreItem(kind, id) { const list = kind === 'todo' ? state.todos : kind === 'idea' ? state.ideas : state.knowledge; const item = list.find(x => x.id === id); if (!item) return; delete item.deletedAt; saveAll(); renderAll(); }
function permanentDelete(kind, id) { if (kind === 'todo') state.todos = state.todos.filter(x => x.id !== id); else if (kind === 'idea') state.ideas = state.ideas.filter(x => x.id !== id); else state.knowledge = state.knowledge.filter(x => x.id !== id); saveAll(); renderAll(); }

// ===== 编辑 =====
function editItem(kind, id) {
  const item = (kind === 'ideas' ? state.ideas : state.knowledge).find(x => x.id === id);
  if (!item) return;
  const el = document.querySelector('#tab-' + kind + ' [data-id="' + id + '"]');
  if (!el) return;
  const content = el.querySelector('[data-mode]');
  if (!content) return;
  const allCats = [...new Set([...state.todos, ...state.ideas, ...state.knowledge].map(i => i.category).filter(Boolean))].sort();
  content.dataset.mode = 'edit';
  content.innerHTML = '<textarea class="edit-textarea" rows="3">' + esc(item.text) + '</textarea>'
    + '<input class="input-cat edit-cat" value="' + esc(item.category || '') + '" placeholder="分类">'
    + '<div class="edit-actions"><button class="btn-primary edit-save" data-kind="' + kind + '" data-id="' + id + '">保存</button><button class="btn-text edit-cancel" data-id="' + id + '">取消</button></div>';
  const ta = content.querySelector('textarea');
  ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
  content.querySelector('.edit-save').addEventListener('click', () => {
    const t = ta.value.trim(); if (!t) return;
    item.text = t;
    item.category = content.querySelector('.edit-cat').value.trim() || '';
    if (kind === 'ideas') saveIdeas(); else saveKnowledgeStore();
    content.dataset.mode = 'view';
    renderAll();
  });
  content.querySelector('.edit-cancel').addEventListener('click', () => { content.dataset.mode = 'view'; renderAll(); });
}

// 待办双击编辑
function enableTodoEdit(el) {
  const textEl = el.querySelector('.todo-text');
  const id = el.dataset.id;
  const item = state.todos.find(x => x.id === id);
  if (!item) return;
  const orig = textEl.innerHTML;
  const input = document.createElement('input');
  input.className = 'input-main todo-edit-input';
  input.value = item.text;
  input.style.width = '100%';
  textEl.innerHTML = '';
  textEl.appendChild(input);
  input.focus(); input.setSelectionRange(input.value.length, input.value.length);
  const save = () => {
    const v = input.value.trim(); if (v) { item.text = v; saveTodos(); renderTodos(); }
    else { textEl.innerHTML = orig; }
  };
  input.addEventListener('blur', save);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } if (e.key === 'Escape') { textEl.innerHTML = orig; } });
}

let _searchActive = false;
let knowledgeImageData = null;
function searchAll(q) {
  _searchActive = true;
  const r1 = state.todos.filter(t => !t.deletedAt && t.text.toLowerCase().includes(q));
  const r2 = state.ideas.filter(i => !i.deletedAt && i.text.toLowerCase().includes(q));
  const r3 = state.knowledge.filter(k => k.text.toLowerCase().includes(q));
  dom.todoList.innerHTML = (r1.length ? r1.map(t => '<div class="todo-item' + (t.done?' done':'') + '"><div class="todo-checkbox">' + (t.done?'v':'') + '</div><span class="todo-text">' + esc(t.text) + (t.category?'<span class="cat-tag">'+esc(t.category)+'</span>':'') + '</span></div>').join('') : '<div class="empty-state"><div class="empty-state-icon"></div><span class="empty-state-text">无匹配</span></div>');
  dom.ideasList.innerHTML = (r2.length ? r2.map(i => '<div class="idea-item"><div class="idea-content">' + esc(i.text) + (i.category?'<span class="cat-tag">'+esc(i.category)+'</span>':'') + '</div></div>').join('') : '<div class="empty-state"><div class="empty-state-icon"></div><span class="empty-state-text">无匹配</span></div>');
  dom.knowledgeList.innerHTML = (r3.length ? r3.map(k => '<div class="knowledge-item"><div class="knowledge-content">' + esc(k.text) + (k.category?'<span class="cat-tag">'+esc(k.category)+'</span>':'') + '</div></div>').join('') : '<div class="empty-state"><div class="empty-state-icon"></div><span class="empty-state-text">无匹配</span></div>');
}
function clearSearch() { if (!_searchActive) return; _searchActive = false; renderAll(); }

function generateReport(type) {
  const now = new Date(), start = new Date(now);
  if (type === 'daily') start.setHours(0, 0, 0, 0);
  else if (type === 'weekly') { const d = start.getDay() || 7; start.setDate(start.getDate() - d + 1); start.setHours(0, 0, 0, 0); }
  else { start.setMonth(0, 1); start.setHours(0, 0, 0, 0); }
  const inR = iso => iso && new Date(iso) >= start && new Date(iso) <= now;
  const doneT = state.todos.filter(t => !t.deletedAt && t.done && inR(t.completedAt));
  const newT = state.todos.filter(t => !t.deletedAt && inR(t.createdAt));
  const ideas = state.ideas.filter(i => !i.deletedAt && inR(i.createdAt));
  const undone = state.todos.filter(t => !t.deletedAt && !t.done);
  const titles = { daily: '日报', weekly: '周报', yearly: '年报' };
  const title = titles[type];
  const label = type === 'daily' ? fmtDate(now.toISOString()) : type === 'weekly' ? fmtDate(start.toISOString()) + ' - ' + fmtDate(now.toISOString()) : fmtDate(start.toISOString()) + ' - ' + fmtDate(now.toISOString());
  const key = type + '-' + new Date().toISOString().slice(0, type === 'yearly' ? 4 : 10);
  const text = [title + ' | ' + label, '', '--- 完成 ---', ...(doneT.length ? doneT.map(t => '- [x] ' + t.text) : ['- 暂无']), '', '--- 新增待办 ---', ...(newT.length ? newT.map(t => '- [ ] ' + t.text) : ['- 暂无']), '', '--- 想法 ---', ...(ideas.length ? ideas.map(i => '- ' + i.text.replace(/\n/g, ' ')) : ['- 暂无']), '', '--- 仍在进行 ---', ...(undone.length ? undone.map(t => '- [ ] ' + t.text) : ['- 暂无'])].join('\n');
  dom.reportOutput.value = text;
  // 保存报告
  const existing = state.reports.findIndex(r => r.key === key);
  if (existing >= 0) state.reports[existing] = { key, type, date: new Date().toISOString(), text };
  else state.reports.unshift({ key, type, date: new Date().toISOString(), text });
  if (state.reports.length > 200) state.reports.length = 200;
  saveReports();
  renderSavedReports();
}
function renderSavedReports() {
  if (!state.reports.length) { dom.savedReports.innerHTML = ''; return; }
  dom.savedReports.innerHTML = '<div class="saved-report-title">已保存的报告</div>' +
    state.reports.slice(0, 20).map(r => '<div class="saved-report-item" data-key="' + r.key + '"><span class="saved-report-key">' + r.key + '</span><button class="btn-text">查看</button></div>').join('');
  dom.savedReports.querySelectorAll('.saved-report-item').forEach(el => {
    el.addEventListener('click', () => {
      const r = state.reports.find(x => x.key === el.dataset.key);
      if (r) dom.reportOutput.value = r.text;
    });
  });
}
function saveReports() { window.bookmarkAPI.setStore('reports', state.reports); }
async function copyReport() { const t = dom.reportOutput.value.trim(); if (!t) return; try { await navigator.clipboard.writeText(t); dom.btnCopyReport.textContent = '已复制'; setTimeout(() => dom.btnCopyReport.textContent = '复制文字', 1200); } catch {} }

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function saveTodos() { window.bookmarkAPI.setStore('todos', state.todos); }
function saveIdeas() { window.bookmarkAPI.setStore('ideas', state.ideas); }
function saveKnowledgeStore() { window.bookmarkAPI.setStore('knowledge', state.knowledge); }
function saveAll() { saveTodos(); saveIdeas(); saveKnowledgeStore(); }
function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

// 自定义分类下拉
function showCatMenu(inp) {
  try {
    console.log('[cat] showCatMenu called, state.todos:', state.todos.length, 'ideas:', state.ideas.length, 'knowledge:', state.knowledge.length);
    const all = [...state.todos, ...state.ideas, ...state.knowledge];
    const existing = [...new Set(all.map(i => i.category).filter(Boolean))].sort();
    console.log('[cat] existing categories:', existing);
    const cur = inp.value.trim();
    let cats = [...existing];
    if (cur && !existing.includes(cur)) cats.unshift(cur);
    const rect = inp.getBoundingClientRect();
    console.log('[cat] rect:', rect.left, rect.top, rect.width, rect.height);
    const menu = dom.catMenu;
    if (!cats.length) {
      menu.innerHTML = '<div class="cat-menu-opt" style="padding:10px 16px;color:var(--text-muted);cursor:default">暂无分类 — 输入新标签后按回车保存</div>';
    } else {
      menu.innerHTML = cats.map((c, i) => '<div class="cat-menu-opt' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '" data-cat="' + c + '">' + c + (c === cur && !existing.includes(cur) ? ' <span style="opacity:.45;font-size:10px">新增</span>' : '') + '</div>').join('');
    }
    menu.style.left = Math.round(rect.left) + 'px';
    menu.style.top = Math.round(rect.bottom + 2) + 'px';
    menu.style.minWidth = Math.max(140, Math.round(rect.width)) + 'px';
    menu.classList.remove('hidden');
    menu._input = inp;
    console.log('[cat] menu shown, items:', cats.length);
  } catch(e) {
    console.error('[cat] showCatMenu error:', e);
  }
}
function catNav(d) {
  const menu = dom.catMenu;
  if (menu.classList.contains('hidden')) return;
  const opts = [...menu.querySelectorAll('.cat-menu-opt')];
  const cur = menu.querySelector('.cat-menu-opt.active');
  let idx = cur ? opts.indexOf(cur) + d : 0;
  if (idx < 0) idx = opts.length - 1;
  if (idx >= opts.length) idx = 0;
  opts.forEach(o => o.classList.remove('active'));
  opts[idx].classList.add('active');
  opts[idx].scrollIntoView({ block: 'nearest' });
}
function hideCatMenu() { dom.catMenu.classList.add('hidden'); }
function fmtTime(iso) { const d = new Date(iso), n = new Date(), p = x => String(x).padStart(2, '0'), t = p(d.getHours()) + ':' + p(d.getMinutes()); if (d.toDateString() === n.toDateString()) return '今天 ' + t; const y = new Date(n); y.setDate(y.getDate() - 1); return d.toDateString() === y.toDateString() ? '昨天 ' + t : (d.getMonth() + 1) + '/' + d.getDate() + ' ' + t; }
function fmtDate(iso) { const d = new Date(iso), n = new Date(); if (d.toDateString() === n.toDateString()) return '今天'; const y = new Date(n); y.setDate(y.getDate() - 1); if (d.toDateString() === y.toDateString()) return '昨天'; if (Math.floor((n - d) / 86400000) < 7) return ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()]; return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'; }

init();
