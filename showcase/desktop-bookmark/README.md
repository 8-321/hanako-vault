# 桌面书签 DesktopBookmark

> 常驻桌面右上角的玻璃流动书签。折叠时是 56×56 毛玻璃方块，点击展开为完整待办/想法/知识笔记面板。支持 5 套主题、分类标签、键盘操作、图片粘贴、报告自动生成和开机自启。

---

## 功能一览

### 折叠态书签
- **玻璃流动感**：半透明毛玻璃 + 流动光带 + 呼吸阴影，悬浮于所有窗口之上
- **可拖动**：折叠态按住拖动到任意屏幕边缘，自动磁吸，位置记忆不丢失
- **点击展开 / 点击折叠**：回到 56×56 正方形，不靠边不变形

### 待办 Todo
- 新增、勾选完成、删除（软删除可恢复）
- 拖拽排序
- 清除已完成
- 双击可编辑文字
- 分类标签支持

### 想法 Ideas
- 快速记录，Shift+Enter 换行
- 分类标签
- 双击编辑（文字 + 分类）→ 保存 / 取消

### 知识笔记 Knowledge
- 文字记录 + **Ctrl+V 粘贴截图**
- 图片缩略图显示，点击放大
- 分类标签
- 双击编辑

### 分类系统
- 输入框自带 ↓ 键弹出下拉，↑↓ 导航、Enter 选中、Esc 关闭
- 下拉选项实时同步所有已写过的标签
- 分类过滤按钮（每个 tab 独立）
- 下拉菜单跟随 5 套主题变色

### 时间线 Timeline
- 待办、想法、已完成按日期分组
- 渐变色时间线竖轴 + 日期节点

### 回收站 Trash
- 软删除的待办和想法可在此恢复或永久删除

### 报告 Report
- **日报 / 周报 / 年报**：统计已完成、新增待办、想法、仍在进行
- 自动保存到本地并累积，历史报告可以随时查看
- 一键复制文字

### 主题 Theme
- **墨色** 深蓝暗调
- **纸色** 暖黄纸张
- **朱砂** 红棕暖调
- **青黛** 墨绿色系
- **暗夜** 极简暗黑
- 面板、输入框、按钮、下拉菜单、分类标签全部跟随主题

### 搜索 Search
- 全局搜索，匹配待办 / 想法 / 知识

### 其他
- 透明度滑块调节
- 开机自启（Startup 文件夹 + Electron API 双保险）
- 单实例锁，不会重复打开
- 每日自动备份数据到 `E:\DesktopBookmark\backups\`

---

## 安装与运行

```bash
# 克隆仓库
git clone git@github.com:8-321/desktop-bookmark.git
cd desktop-bookmark

# 安装依赖
npm install

# 启动开发
npm start

# 打包成 portable exe
npm run build
```

输出文件：`dist/DesktopBookmark.exe`

---

## 项目结构

```
desktop-bookmark/
├── main.js          # Electron 主进程：窗口管理、IPC、托盘、开机自启
├── preload.js       # 安全 IPC 桥接
├── store.js         # 本地 JSON 存储 + 每日备份
├── package.json
├── renderer/
│   ├── index.html   # 界面结构
│   ├── style.css    # 全部样式（5 套主题变量）
│   └── app.js       # 业务逻辑：CRUD、拖拽、分类、搜索、报告、图片粘贴
├── assets/
│   ├── icon.png     # 应用图标 256×256
│   ├── icon.ico     # Windows 图标
│   └── tray-icon.png # 托盘图标
├── start.bat        # 快捷启动脚本
└── README.md
```

---

## 数据存储

所有数据存储在 `E:\DesktopBookmark\`：
- `data.json` — 待办、想法、知识、报告、设置
- `backups/YYYY-MM-DD.json` — 每日自动备份

---

## 技术栈

- **Electron 33** — 桌面端框架
- **原生 HTML / CSS / JS** — 零前端框架依赖
- **CSS 变量** — 5 套主题切换
- **electron-builder** — 打包为 portable exe

---

## 截图

<!-- 运行 app 后截图放在 ./screenshots/ 下，取消注释即可 -->

<!--
### 折叠态（玻璃书签）
![折叠态](screenshots/bookmark-folded.png)

### 展开 - 待办
![待办](screenshots/todo.png)

### 展开 - 知识笔记 + 图片
![知识](screenshots/knowledge.png)

### 展开 - 报告
![报告](screenshots/report.png)

### 分类下拉（主题：青黛）
![分类下拉](screenshots/category-dropdown.png)

### 多主题对比
| 墨色 | 纸色 | 朱砂 | 青黛 | 暗夜 |
|------|------|------|------|------|
| ![](...) | ![](...) | ![](...) | ![](...) | ![](...) |
-->
