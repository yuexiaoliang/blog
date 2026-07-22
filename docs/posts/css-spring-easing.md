---
title: 用 CSS 逼近 iOS 的弹性动画
date: 2026-06-02
tags: [CSS, 动画]
description: iOS 的动效为什么看起来「跟手又舒服」？核心是减速曲线与轻微回弹。本文用纯 CSS 把它还原到网页上。
---

iOS 的界面动效有一种独特的质感：弹窗落下时轻轻回弹一下，按钮按下时微微收缩，松手又弹回来。这种「灵动」并不是靠复杂的物理引擎，几行 CSS 就能逼近。

## 两条核心曲线

iOS 动效的灵魂是两条贝塞尔曲线：

```css
:root {
  /* 标准减速曲线：快起慢收，绝大多数过渡用它 */
  --ease-ios: cubic-bezier(0.32, 0.72, 0, 1);
  /* 轻回弹：越过终点一点点再回来，用于弹出、出现 */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

- `cubic-bezier(0.32, 0.72, 0, 1)` 接近 Apple 文档里推荐的「标准缓动」，前段加速极快，后段缓缓停下，像物体滑行到静止。
- `cubic-bezier(0.34, 1.56, 0.64, 1)` 的第二个控制点 y 值大于 1，动画会**越过目标值再折返**，形成回弹。1.56 是「轻弹」，换成 1.8 就会夸张得像果冻——克制是关键。

## 回弹用在哪里

回弹曲线很美，但**不能滥用**。我给自己定的规矩：

| 场景 | 曲线 | 原因 |
| --- | --- | --- |
| 颜色、透明度变化 | 减速曲线 | 颜色「弹」起来会很怪 |
| 弹窗、浮层出现 | 轻回弹 | 模拟物体落定 |
| 卡片悬浮抬起 | 轻回弹 | 轻微的过冲让抬升有重量感 |
| 按钮按下 | 减速曲线（短时长） | 按下要干脆，回弹留给松手 |
| 页面切换 | 减速曲线 | 结构性动画不能花哨 |

## 按钮的按压缩放

iOS 控件最标志性的交互就是按压缩放。实现要点是：**按下快、弹起慢**。

```css
.btn {
  transition: transform 0.3s var(--ease-spring);
}

.btn:active {
  transform: scale(0.96);
  transition-duration: 0.1s; /* 按下要立刻响应 */
}
```

松手时 `:active` 失效，元素回到 `scale(1)`，此时生效的是外层的 0.3s 回弹曲线——一个微小的过冲，手感立刻就有了。

## 卡片的悬浮

```css
.card {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition:
    transform 0.3s var(--ease-spring-soft),
    box-shadow 0.3s var(--ease-ios);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.09);
}
```

位移用回弹，阴影用减速——阴影是「光」，光不会弹。这种**分离式过渡**是让动效显贵的细节。

## 弹窗落定

```css
.dialog-enter-active {
  transition: transform 0.34s var(--ease-spring-soft);
}
.dialog-enter-from {
  transform: translateY(18px) scale(0.97);
}
```

注意进入用回弹、离开用普通减速：出现时值得被注意，消失时应该利落。本站的搜索弹窗就是这个套路，按 `⌘K` 可以感受一下。

## 尊重用户的偏好

最后别忘记，部分用户对动效敏感。用媒体查询一键降级：

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

> 好的动效是注意力的引路人，不是注意力的竞争者。

弹性动画的秘诀从来不是「弹得多」，而是「弹得准」：选对曲线、用对位置、控制幅度。做到这三点，纯 CSS 也能做出 iOS 级的质感。
