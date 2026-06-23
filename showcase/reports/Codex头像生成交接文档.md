# Codex 头像生成交接文档

> 写给 Codex 看的。你拿到这份文档，直接按步骤做就行。

---

## 任务：给 5 个 AI 分身各生成一张圆形头像

5 个分身共用同一个人的脸，但表情、气质、配色不同。全部是正脸大头照（脸占画面 70%）。

---

## 一、5 个分身的视觉规格

### 含（核心 · 荒原寻路者）
- **表情**：清冷沉静，眼神深邃，看向镜头但不咄咄逼人
- **配色**：暖赭石 + 沙金，地平线冷蓝
- **背景**：黎明前的天空渐变，边缘有隐约的建筑框架轮廓
- **气质关键词**：沉静、独行、在结构中寻找路径

### 含舟（商业舵手）
- **表情**：锐利果决，直视镜头，嘴角微上扬但不笑开
- **配色**：深海蓝 + 钢灰 + 暖铜金点缀
- **背景**：深蓝底，头后有隐约的铜色罗盘/浑仪几何纹样
- **气质关键词**：直接、高效、目标明确

### 含章（内容编织者）
- **表情**：温润真挚，柔和但不过分甜，眼神里有观察的温度
- **配色**：琥珀暖光 + 亚麻米白 + 墨蓝暗部
- **背景**：暖色台灯光感，边缘有隐约的线绳/手稿纹理
- **气质关键词**：细腻、记录、真实的力量

### 含枢（技术架构师）
- **表情**：冷静精密，眼神平稳直接，不带多余情绪
- **配色**：建筑白 + 混凝土灰 + 深蓝，单点暖红（如吊坠）
- **背景**：左侧蓝图线条，右侧实体建筑形态，微妙分屏
- **气质关键词**：逻辑、结构、蓝图落地

### 含野（社交探索者）
- **表情**：灵动松弛，头微侧，眼神里有好奇的光，自然不假装
- **配色**：苔绿 + 生赭 + 低饱和紫野花
- **背景**：林间斑驳阳光，边缘有野花/蕨类
- **气质关键词**：野生、随性、不功利

---

## 二、脸的要求（非常重要）

1. **5 张共用同一个人的脸**。同一个人的五官、骨相、脸型，不能每张看起来像不同的人
2. **整体气质：「清冷中带活泼」**。不是冰山，也不是阳光甜妹。是那种面上安静但眼睛里有光、嘴角有一点灵动的感觉
3. **全部正脸**，看向镜头，不能侧脸、不能低头
4. **大头照**，脸占画面约 70%，肩以下不出镜
5. **漫画/插画风**，干净线条 + 柔和的数字插画质感，不要真人照片风

---

## 三、技术踩坑记录

### 可以用的工具
- **火山引擎 Seedream 5.0 Lite**（doubao-seedream-5-0-lite-260128）
  - 图片质量不错，漫画风能出
  - 但 img2img（参考图生图）**无法保证面部一致性**，每次生成的脸都不一样

### 踩过的坑
1. **openai provider（an520.xin 中转）**：图像模型只有 gpt-image-2 有通道，但持续 524 超时，dall-e-3/gpt-image-1 均无可用通道
2. **img2img 面部不一致**：即使用了参考图 + 「保持同一张脸」的提示词，模型仍会把脸改掉。这是当前 AI 生图的硬限制
3. **参考图与目标矛盾**：用一张低头侧脸做参考去生正脸，模型会混乱

### 建议方案
- 如果能用更高版本的 Seedream（4.5 或更新的）、或者 Midjourney 的角色一致性功能，面部控制会更好
- 另一个可靠方案：生成 1 张满意的脸后，用 Photoshop/Affinity 等工具手动换脸到 5 张不同背景上
- 或者用专门的 face-swap 工具

---

## 四、产出规格

- 格式：PNG，透明背景
- 尺寸：512×512 圆形（正方形裁切后加圆形蒙版）
- 保存路径（每张都放到对应 agent 目录下，文件名 `avatar.png`）：

```
C:\Users\huang\.hanako\agents\hanako\avatars\avatar.png              ← 含
C:\Users\huang\.hanako\agents\agent-mp18abkl\avatars\avatar.png      ← 含舟
C:\Users\huang\.hanako\agents\agent-mp18bh18\avatars\avatar.png      ← 含章
C:\Users\huang\.hanako\agents\agent-mp18cqs4\avatars\avatar.png      ← 含野
```

含枢暂无独立 agent，头像先保存到 `D:\Hanako\avatars\hanshuni.png`。

### 圆形裁剪 Python 代码（备用）

```python
from PIL import Image, ImageDraw

img = Image.open("source.png").convert("RGBA")
# 正方形中心裁切
w, h = img.size
side = min(w, h)
left = (w - side) // 2
top = (h - side) // 2
img = img.crop((left, top, left + side, top + side))
img = img.resize((512, 512), Image.LANCZOS)

# 圆形蒙版
mask = Image.new("L", (512, 512), 0)
draw = ImageDraw.Draw(mask)
draw.ellipse((0, 0, 512, 512), fill=255)

result = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
result.paste(img, (0, 0), mask)
result.save("avatar.png", "PNG")
```

---

## 五、工作区已有文件

之前生成的原始图片在：
```
C:\Users\huang\.hanako\plugin-data\image-gen\generated\
```

已裁剪的头像副本在：
```
D:\Hanako\avatars\  （hanako.png, hanshu.png, hanzhang.png, hanye.png, hanshuni.png）
```

---

**给 Codex 的一句话：**先生成一张脸给 kel 确认，他点头了再铺 5 张。别一次全出 —— 脸不对后面全白做。
