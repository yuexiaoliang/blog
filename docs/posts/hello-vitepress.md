---
title: 用 VitePress 从零搭建个人博客
date: 2026-07-08
tags: [VitePress, 博客]
description: 不依赖任何第三方主题，从目录结构、自定义主题到部署上线，完整记录这个博客的诞生过程。
---

写博客的工具换了一轮又一轮，从 WordPress 到 Hexo 再到 Notion，始终没有安定下来。这次决定用 VitePress 认真搭一个——它足够轻，Markdown 即内容，Vue 即主题，构建产物是纯静态页面，扔到任何静态托管上就能跑。

## 为什么选 VitePress

市面上的静态博客生成器很多，VitePress 打动我的点有三个：

- **开发体验极快**。基于 Vite 的热更新，改一篇文章几乎是零等待刷新。
- **Vue 生态**。主题就是 Vue 组件，能用上整个 Vue 生态的能力，写交互逻辑远比模板语言自由。
- **默认够好，也足够开放**。它自带默认主题，但官方对自定义主题的支持是一等公民：`Content` 组件、`useData`、内容加载器一应俱全。

## 项目结构

最终落地的目录结构如下：

```
blog/
├─ docs/
│  ├─ .vitepress/
│  │  ├─ config.mts          # 站点配置
│  │  └─ theme/              # 自定义主题（本系列重点）
│  │     ├─ index.ts
│  │     ├─ Layout.vue
│  │     ├─ components/
│  │     ├─ data/
│  │     └─ styles/
│  ├─ posts/                 # 文章都放这里
│  ├─ index.md
│  └─ about.md
└─ package.json
```

约定很简单：所有文章放在 `posts/` 目录下，每篇文章就是一个带 frontmatter 的 Markdown 文件：

```md
---
title: 用 VitePress 从零搭建个人博客
date: 2026-07-08
tags: [VitePress, 博客]
description: 完整记录这个博客的诞生过程。
---
```

## 自定义主题的最小骨架

在 `docs/.vitepress/theme/index.ts` 里导出一个主题对象即可：

```ts
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import './styles/index.css'

export default {
  Layout,
} satisfies Theme
```

`Layout.vue` 是整站的根组件。VitePress 会把每篇文章渲染成 `Content`，我们的布局组件决定它出现在页面的哪个位置：

```vue
<script setup lang="ts">
import { Content } from 'vitepress'
</script>

<template>
  <div class="layout">
    <NavBar />
    <main><Content /></main>
    <FooterBar />
  </div>
</template>
```

::: tip
主题目录下只要存在 `index.ts`，VitePress 就会优先使用它，完全绕开默认主题——不需要任何「覆盖」式的 hack。
:::

## 让布局认识「页面类型」

博客里通常有几种版式：首页、文章列表、标签页、正文页。VitePress 把 frontmatter 暴露在 `useData()` 里，用 `layout` 字段分发即可：

```ts
const { frontmatter } = useData()
const layout = computed(() => frontmatter.value.layout || 'doc')
```

```vue
<template>
  <Home v-if="layout === 'home'" />
  <PostsPage v-else-if="layout === 'posts'" />
  <DocPage v-else />
</template>
```

于是 `index.md` 只需写一行 `layout: home`，首页的版式就完全交给 Vue 组件接管了。

## 下一步

骨架搭好之后，真正有意思的部分才刚开始：

1. 用内容加载器收集文章元信息，驱动列表与归档
2. 实现明暗双主题
3. 给文章加上目录导航（TOC）
4. 接入本地搜索

这些会在后续文章里逐一展开。这个博客本身就是最好的演示——你现在看到的每个交互，都是这个系列的一部分。
