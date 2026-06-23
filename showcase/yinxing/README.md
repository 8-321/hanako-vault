# 引星 · 手势 3D 粒子场 Demo

手势控制 Three.js 3D 粒子交互系统。三种粒子形态：心形、树、花。
高级绿色系配色。

## 打开方式

直接双击 `index.html`，或在本地启动服务：

```bash
cd D:\Hanako\yin-xing-demo
python -m http.server 8789
```

打开 http://127.0.0.1:8789/index.html

需要联网（MediaPipe 模型文件从 CDN 加载）。

## 互动方式

### 有摄像头
打开手掌 → 花形
半握 → 树形
握拳 → 心形
捏合拇指食指 → 粒子收缩迸火花

### 鼠标降级
滚轮 → 切换形态
拖拽 → 旋转粒子场
点击 → 脉冲
键盘 1 / 2 / 3 → 心 / 树 / 花
空格 → 引爆

## 技术

Three.js r160 · MediaPipe Hands · Canvas 离线采样
