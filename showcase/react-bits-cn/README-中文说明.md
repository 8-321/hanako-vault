# React Bits 中文复刻工作包

这个文件夹是基于 React Bits 官方开源仓库整理出的本地复刻版。

已做：

1. 保留原站所有动画、组件、背景、文字动画的源码与 demo。
2. 保留原站的组件名称、效果预览逻辑、代码展示逻辑。
3. 已把 `src/docs/Introduction.jsx` 的 Introduction 页面正文改成中文。
4. 之前单文件静态版在 `D:/Hanako/react-bits-introduction-cn/index.html`。

## 路径说明

核心页面：

`src/docs/Introduction.jsx`

所有真实效果源码：

`src/content/TextAnimations`
`src/content/Animations`
`src/content/Components`
`src/content/Backgrounds`

Demo 示例：

`src/demo/TextAnimations`
`src/demo/Animations`
`src/demo/Components`
`src/demo/Backgrounds`

不同技术栈版本：

`src/tailwind`
`src/ts-default`
`src/ts-tailwind`

官方分类和完整名称：

`src/constants/Categories.js`

## 本地运行

在这个目录打开终端：

```bash
npm install
npm run dev
```

然后访问 Vite 输出的本地地址。

## 注意

我没有在仓库根目录看到 LICENSE 文件。学习、内部研究、个人本地使用问题不大；如果要公开发布或商用，需要你再确认原项目许可边界。
