# 拾光 · 个人技术博客

基于 [VitePress](https://vitepress.dev) 从零开发的自定义主题，不使用任何第三方主题。

## 特性

- 🧩 **完全自定义主题** —— 自研 Layout、导航、首页、列表、标签、归档、正文版式
- 🔍 **本地全文搜索** —— MiniSearch 驱动，构建期生成索引，`⌘K` / `Ctrl+K` 唤起
- 🌗 **明暗双主题** —— 跟随系统 / 手动切换，无首屏闪烁
- 📑 **文章目录 TOC** —— 滚动跟随高亮，移动端可折叠
- 🏷️ **标签与归档** —— 标签云筛选、按年归档时间轴
- 📱 **移动端适配** —— 全屏菜单、弹性卡片、响应式排版
- 🫧 **iOS 式动效** —— 柔和减速曲线 + 轻回弹，克制不浮夸

## 开发

```bash
npm install
npm run dev      # 本地开发
npm run build    # 构建静态站点（产物在 docs/.vitepress/dist）
npm run preview  # 预览构建产物
```

## 写文章

在 `docs/posts/` 下新建 Markdown 文件，带上 frontmatter：

```md
---
title: 文章标题
date: 2026-07-22
tags: [标签一, 标签二]
description: 一句话简介
---
```

文章列表、标签页、归档页与搜索索引均会自动更新。

## 目录结构

```
docs/
├─ .vitepress/
│  ├─ config.mts        # 站点配置（导航、搜索、自定义 themeConfig）
│  └─ theme/            # 自定义主题
│     ├─ index.ts       # 主题入口
│     ├─ Layout.vue     # 根布局，按 frontmatter.layout 分发页面
│     ├─ components/    # 导航、搜索、卡片、TOC 等组件
│     ├─ data/          # 内容加载器（文章元信息）
│     └─ styles/        # 设计令牌、基础样式、正文排版
├─ posts/               # 全部文章
└─ *.md                 # 首页 / 列表 / 标签 / 归档 / 关于
```
