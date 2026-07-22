---
title: 零后端实现全站本地搜索：MiniSearch 实践
date: 2026-03-16
tags: [JavaScript, 工程化]
description: 静态站点也想有秒开的全文搜索？用 MiniSearch 在构建期生成索引，浏览器端毫秒级检索，全程不依赖后端。
---

博客加搜索，最省事的方案是接 Algolia 之类的第三方服务——但它要钱、要等网络、要把数据交出去。其实对一个几十篇文章的站点，**把整个索引塞进浏览器**才是最优解：零成本、离线可用、毫秒响应。

## 选型：为什么是 MiniSearch

浏览器端的全文检索库不少，MiniSearch 脱颖而出的原因：

- 体积小，gzip 后约 10KB
- 零依赖，纯 JS
- 支持**前缀搜索、模糊匹配、字段加权**，开箱即用
- API 干净，五分钟上手

对比 lunr.js，它的模糊搜索基于更科学的 Levenshtein 距离；对比 Fuse.js，它在大数据量下的性能优势明显（基于倒排索引而非逐条扫描）。

## 构建索引

第一步是把每篇文章拆成可检索的记录。对博客来说，「按标题分节」是最合理的粒度——搜到的结果直接定位到文章内的某个章节：

```ts
interface SearchRecord {
  id: string        // 页面 URL + hash，如 /posts/foo#some-section
  title: string     // 当前章节标题
  titles: string[]  // 上级标题链，用作面包屑
  text: string      // 章节正文
}
```

构建期遍历所有 Markdown，渲染成 HTML 后按标题切分，最后序列化成一个 JSON 文件。VitePress 的本地搜索插件正是这个思路，索引作为虚拟模块注入：

```ts
import searchIndex from '@localSearchIndex'
// { "root": "[{\"id\":..., \"title\":..., ...}]" }
```

## 客户端检索

拿到记录后，初始化引擎并加入文档：

```ts
import MiniSearch from 'minisearch'

const mini = new MiniSearch({
  fields: ['title', 'titles', 'text'],   // 参与检索的字段
  storeFields: ['title', 'titles'],      // 结果里携带的字段
  searchOptions: {
    prefix: true,          // 输入 "typ" 能命中 "typescript"
    fuzzy: 0.2,            // 容错：20% 的编辑距离
    boost: { title: 4, titles: 2 }, // 标题命中权重更高
  },
})

mini.addAll(records)
```

三个参数值得展开：

### 前缀搜索

用户输入过程中实时给结果，是「秒开」体验的关键。`prefix: true` 让 `vite` 能命中 `VitePress`，边打字边出结果，没有「按回车才搜」的割裂感。

### 模糊匹配

`fuzzy: 0.2` 表示允许 20% 的字符差异。拼错一个字也能搜到，对中英混排的博客尤其友好。数值别调太高，否则噪音会淹没相关结果。

### 字段加权

`boost` 让标题命中的权重远高于正文——用户搜的通常是概念词，而概念词出现在标题里时相关性最强。

## 交互细节

检索能力之外，搜索框的体验细节更影响观感：

```ts
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') cursor = Math.min(cursor + 1, results.length - 1)
  else if (e.key === 'ArrowUp') cursor = Math.max(cursor - 1, 0)
  else if (e.key === 'Enter' && results[cursor]) go(results[cursor].id)
}
```

- `⌘K` / `Ctrl+K` 全局唤起，已经成为开发者的肌肉记忆
- 方向键导航 + 回车直达，双手不离键盘
- 命中词用 `<mark>` 高亮，一眼确认相关性
- 结果显示上级标题链（`文章 › 章节`），消除「这是哪儿」的疑惑

::: tip
高亮实现要小心 XSS：先用用户输入构造正则前，务必转义特殊字符 `.*+?^${}()|[]\`，否则输入一个 `(` 就能让整个搜索崩溃。
:::

## 代价与边界

本地搜索不是银弹，它的边界很清晰：

| 维度 | 表现 |
| --- | --- |
| 文章数 < 1000 | 完美，索引通常小于 500KB |
| 文章数 > 5000 | 索引体积可观，考虑分页懒载或服务端方案 |
| 中文分词 | MiniSearch 按空格切词，中文短语靠模糊匹配兜底，够用但不精确 |

对这个量级的博客，它的体验甚至超过服务端搜索——毕竟**最快的网络请求，是不发请求**。

## 小结

构建期生成索引 + 运行时无依赖检索，是静态站点搜索的最优解。本博客右上角的搜索框（`⌘K`）就是这套方案的完整实现，欢迎拿它当测试用例。
