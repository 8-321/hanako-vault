const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('bookmarkAPI', {
  // 窗口控制
  toggleExpand: () => ipcRenderer.invoke('toggle-expand'),
  collapse: () => ipcRenderer.invoke('collapse'),
  moveBookmark: (dx, dy) => ipcRenderer.invoke('move-bookmark', dx, dy),

  // 数据持久化
  getStore: (key) => ipcRenderer.invoke('store-get', key),
  setStore: (key, value) => ipcRenderer.invoke('store-set', key, value),
  getAllStore: () => ipcRenderer.invoke('store-get-all'),
  exportReportHtml: (payload) => ipcRenderer.invoke('export-report-html', payload),

  // 监听托盘触发
  onTriggerToggle: (callback) => ipcRenderer.on('trigger-toggle', callback)
});
