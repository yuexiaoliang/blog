---
title: 优雅地实现明暗双主题
date: 2026-04-03
tags: [CSS, 前端]
description: 暗色模式不是把颜色反转那么简单。从设计原则到工程实现，分享一套可落地的双主题方案。
---

给站点加暗色模式听起来是个周末就能搞定的事，真正动手才发现坑不少：闪白、颜色发灰、图片刺眼、阴影失效……这篇把我踩过的坑和最终的方案整理出来。

## 设计原则：不是反色，是重新设计

最常见的误区是把浅色模式的颜色直接取反。深色背景上的纯白文字对比度过高，长时间阅读会累；浅色模式里的浅阴影，放到深色里直接消失。

几条经过验证的原则：

- **背景用深灰，不要用纯黑**。`#161618` 比 `#000` 柔和得多，还给阴影留了表现空间。
- **建立灰阶层级**。浅色模式靠阴影区分层级，深色模式要靠**更亮的背景色**：底层最暗，悬浮层逐级提亮。
- **品牌色要微调**。iOS 蓝在浅色下是 `#007aff`，深色下换成更亮的 `#0a84ff` 才能保持同样的「视觉响度」。
- **阴影减弱，边框增强**。深色下阴影几乎不可见，用 1px 的浅色描边承担轮廓的职能。

## 工程实现：CSS 变量 + 类切换

整个主题系统的核心是两组变量：

```css
:root {
  --c-bg: #fbfbfd;
  --c-text-1: #1d1d1f;
  --c-border: rgba(60, 60, 67, 0.12);
  /* ... */
}

html.dark {
  --c-bg: #161618;
  --c-text-1: #f5f5f7;
  --c-border: rgba(255, 255, 255, 0.12);
}
```

切换主题只需要切换 `<html>` 上的类：

```ts
const { isDark } = useData() // VitePress 提供的响应式开关

function toggle() {
  isDark.value = !isDark.value
}
```

VitePress 底层用了 vueuse 的 `useDark`，它会自动完成三件事：同步 `html.dark` 类、写入 localStorage、跟随系统偏好。你只管写 CSS。

## 解决首屏闪烁

用户是暗色偏好时，如果等 JS 执行完才切换主题，会先闪一下亮色（FOUC）。解法是在 `<head>` 里塞一段立即执行的内联脚本，在首帧渲染前读 localStorage 并加类：

```html
<script>
  const stored = localStorage.getItem('vitepress-theme-appearance')
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches
  if (stored === 'dark' || (!stored && prefersDark)) {
    document.documentElement.classList.add('dark')
  }
</script>
```

VitePress 内核已经自动注入这段脚本，自定义主题无需操心——这也是选框架的意义。

## 平滑过渡

切换瞬间颜色突变会有点「生硬」，给 background 和 color 加一条短过渡：

```css
body {
  transition:
    background-color 0.3s cubic-bezier(0.32, 0.72, 0, 1),
    color 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
```

注意**只在这几个属性上加过渡**，千万不要写 `* { transition: all }`，它会污染所有动画、拖慢交互反馈。

::: warning
代码高亮也要双主题。VitePress 的 shiki 支持 `theme: { light: 'github-light', dark: 'github-dark' }`，配合 `--shiki-light` / `--shiki-dark` 两组 CSS 变量分别着色，切换时连代码配色都会跟着变。
:::

## 图标切换的小心思

太阳/月亮图标的切换可以加一点回弹：

```css
.swap-enter-active {
  transition: transform 0.34s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.swap-enter-from {
  transform: rotate(-70deg) scale(0.4);
  opacity: 0;
}
```

一个 300 毫秒的旋转过渡，整个切换动作就有了「机械感」，像物理开关一样令人愉悦。导航栏右侧那个按钮可以体验一下。

## 小结

双主题的本质是**用变量隔离颜色决策**：组件永远不写死颜色，只消费语义化的变量。这套结构建好之后，加第三套主题（比如 sepia 阅读模式）也只是再写一组变量的事。
