# RELAY · 接力

> AI生活操作系统开放工具箱。  
> 先走一步的人留下的路标。

## 本地预览

双击 `index.html` 在浏览器中打开即可。

## 部署到 GitHub Pages

```bash
# 1. 在 GitHub 创建 repo（如 relay-site）
# 2. 推送 relay-site 目录
git init
git add .
git commit -m "RELAY v1.0"
git remote add origin https://github.com/YOUR_USERNAME/relay-site.git
git push -u origin main

# 3. GitHub → Settings → Pages → Source: Deploy from a branch → main → / (root) → Save
# 4. 等待 30 秒，访问 https://YOUR_USERNAME.github.io/relay-site/
```

## 文件结构

```
relay-site/
├── index.html          # 首页：Hero + 精选 + 理念
├── templates.html      # 模板库：筛选 + 卡片网格 + 解密弹窗
├── resources.html      # 工具箱 + 踩坑记录
├── about.html          # 关于 + RELAY叙事
└── assets/
    ├── css/style.css   # 完整设计令牌 + 组件库 + 动效
    └── js/
        ├── data.js     # 模板数据 + 资源数据 + 导航
        └── ui.js       # 交互引擎：氛围层/卡片渲染/解密弹窗/动效
```

## 加新模板

只改 `assets/js/data.js`，在 `TEMPLATES` 数组里加一条记录：

```js
{
  id:'t07',
  title:'你的新模板',
  direction:'效率',      // 入门/效率/学习/创作
  type:'工作流',         // 工作流/提示词/配置/系统
  tags:['标签1','标签2'],
  glyph:'新',            // 封面图里的单个中文字
  stars:4.5,
  views:0,
  summary:'一句话描述',
  content:'<h3>详细内容</h3><p>HTML格式</p>',
  steps:['步骤1','步骤2'],
  promptTemplate:'复制给AI的提示词',
  downloadContent:'下载的txt文件内容',
  quote:'一句话金句',
  pitfalls:['踩坑1','踩坑2'],
  cohort:'新手',
  links:[]
}
```

## 风格说明

OBSERVER-07 ARCHIVE：深空黑 #0A0A0A + 古铜金 #C9A96E。访客是档案员，模板是待解密档案。  
详情弹窗用乱码解密动画。封面图由算法实时生成（零图片文件）。
