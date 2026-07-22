---
title: Vite 构建优化实录：把产物瘦身 60%
date: 2026-05-14
tags: [Vite, 工程化]
description: 从一个 2.1MB 的中后台项目出发，逐层分析 bundle 构成，记录每一步瘦身的依据与收益。
---

上个月接手一个中后台项目，`vite build` 出来的主包有 2.1MB，首屏在弱网下要转好几秒圈。花了一周时间把主包降到 800KB 左右，这里把过程和思路完整记录下来。

## 第一步：看清楚包里有啥

优化之前先测量。用 `rollup-plugin-visualizer` 生成依赖图：

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({ open: true, gzipSize: true }),
  ],
})
```

图上三个大块立刻暴露了问题：

1. `lodash` 整包引入，480KB
2. `echarts` 全量引入，900KB
3. `moment` + locale，300KB

## 干掉整包依赖

### lodash 按需引入

项目里到处是 `import _ from 'lodash'`。换成按需：

```ts
// 之前
import _ from 'lodash'
_.debounce(fn, 300)

// 之后
import debounce from 'lodash-es/debounce'
debounce(fn, 300)
```

`lodash-es` 是 ESM 版本，能被 tree-shaking 正确摇掉未使用的函数。全项目替换了 60 多处，**立减 420KB**。

### echarts 按需注册

echarts 5 提供了干净的按需 API：

```ts
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer])
```

只注册实际用到的图表与组件，**再减 600KB**。代价是每个用到的图表类型都要手动注册一次——值得。

### moment 换成 dayjs

moment 早已进入维护模式，dayjs 的 API 几乎兼容，体积只有 2KB：

```bash
npm i dayjs && npm uninstall moment
```

配合 vite 的 `resolve.alias` 可以平滑过渡，**减 300KB**。

## 分包策略

瘦完依赖，开始调整 Rollup 的分包：

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus'],
        },
      },
    },
  },
})
```

原则是**按变更频率分包**：框架代码很少变，单独成包可以被浏览器长期缓存；UI 库次之；业务代码变得最频繁，体积也最小。

::: warning
不要为每个 npm 包都建一个 chunk。包太碎会增加 HTTP 请求数与模块解析开销，得不偿失。
:::

## 路由懒加载

中后台的几十个页面根本不该进主包。确认所有路由都是动态导入：

```ts
const routes = [
  {
    path: '/report',
    component: () => import('./views/Report.vue'),
  },
]
```

Vite 会自动为每个动态导入生成独立 chunk，访问时才下载。

## 收益汇总

| 优化项 | 主包体积变化 |
| --- | --- |
| lodash 按需 | -420KB |
| echarts 按需 | -600KB |
| moment → dayjs | -300KB |
| 分包 + 懒加载 | 主包再 -180KB |
| **合计** | **2.1MB → 0.8MB** |

弱网首屏从 6s+ 降到 2s 以内。

## 最后

性能优化没有魔法，流程永远是：**测量 → 找到大头 → 针对性处理 → 再测量**。visualizer 这类工具让「大头」一目了然，剩下的都是体力活。把这套流程固化进团队，比记住任何一条具体技巧都重要。
