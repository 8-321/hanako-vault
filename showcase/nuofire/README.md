# 傩火 · 互动场域 Demo

一个重新校准后的古风展示动画式互动 demo。它不是 UI 页面，不使用卡片、深色玻璃、圆角面板，而是一屏旧纸、尘雾、傩面、火星、裂纹和鼓波。

## 打开方式

直接双击：

```text
D:\Hanako\nuo-fire-demo\index.html
```

或启动本地服务：

```bash
cd D:\Hanako\nuo-fire-demo
python -m http.server 8788
```

然后打开：

```text
http://127.0.0.1:8788/index.html
```

## 互动方式

- 移动鼠标：拂开尘粒，面具逐渐显形
- 点击面具附近：点出火星
- 拖过面具：留下裂纹
- 长按鼠标：产生鼓波，震开尘雾
- 按空格：从面具中心触发鼓波和旧火

## 设计基准

参考方向：

- 非遗题材 C4D 古风展示动画
- 傩面具、祭祀、火、灰、裂纹
- TouchDesigner 粒子互动装置
- Processing 山水/水墨交互数字艺术
- 敦煌、故宫类沉浸式数字展陈

## 技术

纯 HTML / CSS / Canvas JavaScript，无依赖。
