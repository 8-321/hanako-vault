const { app, BrowserWindow, ipcMain, Tray, Menu, screen, dialog } = require('electron');
// 限制 JS 堆内存，降低空闲占用
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=64');
const path = require('path');
const Store = require('./store');

let mainWindow = null;
let tray = null;
const store = new Store();

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

const BOOKMARK_WIDTH = 56;
const BOOKMARK_HEIGHT = 56;
const PANEL_WIDTH = 430;
const PANEL_HEIGHT = 640;

let isExpanded = false;
let bookmarkPos = null; // 折叠态可拖动位置

function getFixedPosition() {
  if (bookmarkPos) return bookmarkPos;
  const d = screen.getPrimaryDisplay();
  return { x: Math.round(d.workAreaSize.width - BOOKMARK_WIDTH - 34), y: 34 };
}

function createWindow() {
  const storedPos = store.get('bookmarkPos');
  if (storedPos && typeof storedPos.x === 'number' && typeof storedPos.y === 'number') {
    bookmarkPos = storedPos;
  }
  const pos = getFixedPosition();
  mainWindow = new BrowserWindow({
    x: pos.x, y: pos.y,
    width: BOOKMARK_WIDTH, height: BOOKMARK_HEIGHT,
    frame: false, transparent: true, alwaysOnTop: true,
    resizable: false, skipTaskbar: true, hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true);
  // 只在窗口状态变化时重断言置顶，不搞定时循环浪费 CPU
  mainWindow.on('show', () => mainWindow.setAlwaysOnTop(true, 'screen-saver'));
  mainWindow.on('focus', () => mainWindow.setAlwaysOnTop(true, 'screen-saver'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

ipcMain.handle('toggle-expand', () => {
  if (!mainWindow) return;
  const [x, y] = mainWindow.getPosition();

  if (!isExpanded) {
    const d = screen.getDisplayNearestPoint({ x, y });
    const { width: sw, height: sh } = d.workAreaSize;
    // 面板右边缘距离屏幕右边缘至少 60px，不要靠边
    let nx = sw - PANEL_WIDTH - 60;
    // 面板垂直中心对齐书签垂直中心
    let ny = y + BOOKMARK_HEIGHT / 2 - PANEL_HEIGHT / 2;
    if (nx < 0) nx = 0;
    if (ny < 0) ny = 0;
    if (ny + PANEL_HEIGHT > sh) ny = sh - PANEL_HEIGHT;
    mainWindow.setResizable(true);
    mainWindow.setSize(PANEL_WIDTH, PANEL_HEIGHT);
    mainWindow.setPosition(nx, ny);
    mainWindow.setHasShadow(true);
    isExpanded = true;
  } else {
    const p = getFixedPosition();
    mainWindow.setResizable(false);
    mainWindow.setSize(BOOKMARK_WIDTH, BOOKMARK_HEIGHT);
    mainWindow.setPosition(p.x, p.y);
    mainWindow.setHasShadow(false);
    isExpanded = false;
  }
  return isExpanded;
});
ipcMain.handle('move-bookmark', (e, dx, dy) => {
  if (isExpanded || !mainWindow) return;
  const [cx, cy] = mainWindow.getPosition();
  let nx = cx + dx, ny = cy + dy;
  const d = screen.getDisplayNearestPoint({ x: nx, y: ny });
  const { width: sw, height: sh } = d.workAreaSize;
  // 吸附边缘
  const snap = 12;
  if (nx + BOOKMARK_WIDTH > sw - snap) nx = sw - BOOKMARK_WIDTH;
  if (nx < snap) nx = 0;
  if (ny + BOOKMARK_HEIGHT > sh - snap) ny = sh - BOOKMARK_HEIGHT;
  if (ny < snap) ny = 0;
  mainWindow.setPosition(nx, ny);
  bookmarkPos = { x: nx, y: ny };
  store.set('bookmarkPos', bookmarkPos);
});
ipcMain.handle('collapse', () => {
  if (isExpanded && mainWindow) {
    const p = getFixedPosition();
    mainWindow.setResizable(false);
    mainWindow.setSize(BOOKMARK_WIDTH, BOOKMARK_HEIGHT);
    mainWindow.setPosition(p.x, p.y);
    mainWindow.setHasShadow(false);
    isExpanded = false;
  }
  return isExpanded;
});

ipcMain.handle('store-get', (e, key) => store.get(key));
ipcMain.handle('store-set', (e, key, value) => store.set(key, value));
ipcMain.handle('store-get-all', () => store.getAll());

ipcMain.handle('export-report-html', async (e, { html, suggestedName }) => {
  if (!html) return { ok: false, reason: 'empty' };
  const r = await dialog.showSaveDialog(mainWindow, {
    title: '导出报告 HTML',
    defaultPath: suggestedName || 'DesktopBookmark-report.html',
    filters: [{ name: 'HTML', extensions: ['html'] }]
  });
  if (r.canceled || !r.filePath) return { ok: false, reason: 'canceled' };
  require('fs').writeFileSync(r.filePath, html, 'utf-8');
  return { ok: true, filePath: r.filePath };
});

function createTray() {
  try {
    tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'));
    tray.setToolTip('桌面书签');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: '展开/折叠', click: () => { if (mainWindow) mainWindow.webContents.send('trigger-toggle'); } },
      { type: 'separator' },
      { label: '退出', click: () => app.quit() }
    ]));
    tray.on('click', () => { if (mainWindow) { if (mainWindow.isVisible()) mainWindow.focus(); else mainWindow.show(); } });
  } catch (e) { console.error('Tray failed:', e); }
}

app.whenReady().then(() => {
  app.setLoginItemSettings({ openAtLogin: true });
  try {
    const fs = require('fs');
    const startupDir = path.join(app.getPath('home'), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
    fs.writeFileSync(path.join(startupDir, 'DesktopBookmark.bat'), '@echo off\r\nstart "" "' + process.execPath + '"\r\n', 'utf-8');
  } catch (_) {}
  createWindow();
  if (!store.get('firstRunShown')) {
    store.set('firstRunShown', true);
    setTimeout(() => { if (mainWindow) mainWindow.webContents.send('trigger-toggle'); }, 400);
  }
  createTray();
});

app.on('window-all-closed', () => {});
app.on('activate', () => { if (!mainWindow) createWindow(); });
