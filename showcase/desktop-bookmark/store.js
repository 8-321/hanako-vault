const fs = require('fs');
const path = require('path');

class Store {
  constructor() {
    this.dir = 'E:\\DesktopBookmark';
    this.filePath = path.join(this.dir, 'data.json');
    this.backupDir = path.join(this.dir, 'backups');
    this.data = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
    return this._defaults();
  }

  _defaults() {
    return {
      todos: [],
      ideas: [],
      knowledge: [],
      settings: { opacity: 92, theme: 'ink' },
      bookmarkPos: null
    };
  }

  _save() {
    try {
      if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
      this._backupDaily();
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }

  _backupDaily() {
    try {
      if (!fs.existsSync(this.backupDir)) fs.mkdirSync(this.backupDir, { recursive: true });
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      fs.writeFileSync(path.join(this.backupDir, `${day}.json`), JSON.stringify({ backedUpAt: now.toISOString(), data: this.data }, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed backup:', e);
    }
  }

  get(key) { return key ? this.data[key] : this.data; }
  set(key, value) { if (typeof key === 'object') Object.assign(this.data, key); else this.data[key] = value; this._save(); }
  getAll() { return this.data; }
}

module.exports = Store;
