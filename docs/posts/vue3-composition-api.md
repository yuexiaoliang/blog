---
title: Vue 3 组合式 API 实践：从选项到组合
date: 2026-06-21
tags: [Vue, 前端]
description: 组合式 API 不是语法糖的更替，而是代码组织方式的进化。聊聊我在真实项目里沉淀下来的几个模式。
---

用 Vue 3 写了两年多，组合式 API 带给我最大的改变不是写法，而是**组织代码的粒度**。选项式 API 按「选项类型」组织（data、methods、computed），组合式 API 按「关注点」组织——这个差异在组件超过 300 行之后会变得非常明显。

## 一个典型的重构

先看选项式 API 下的一个搜索组件，逻辑散落在各个选项中：

```vue
<script>
export default {
  data() {
    return { query: '', results: [], loading: false }
  },
  computed: {
    hasQuery() {
      return this.query.trim().length > 0
    },
  },
  methods: {
    async search() {
      if (!this.hasQuery) return
      this.loading = true
      try {
        this.results = await api.search(this.query)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
```

「搜索」这一个关注点，被切成了 data、computed、methods 三块。组件一旦同时有搜索、分页、表单校验，读代码就要在选项之间反复横跳。

## 抽成 composable

把同一个关注点收拢到一个函数里：

```ts
import { computed, ref } from 'vue'

export function useSearch(searchFn: (q: string) => Promise<unknown[]>) {
  const query = ref('')
  const results = ref<unknown[]>([])
  const loading = ref(false)

  const hasQuery = computed(() => query.value.trim().length > 0)

  async function search() {
    if (!hasQuery.value) return
    loading.value = true
    try {
      results.value = await searchFn(query.value.trim())
    } finally {
      loading.value = false
    }
  }

  return { query, results, loading, hasQuery, search }
}
```

组件里只剩意图：

```vue
<script setup lang="ts">
const { query, results, loading, search } = useSearch(api.search)
</script>
```

## 几条实践经验

### 命名与返回值

composable 以 `use` 开头，返回一个**普通对象**而不是数组。对象解构可以按需取用、顺序无关，重命名也方便。

### 副作用的清理

composable 内部注册的事件监听、定时器，尽量在 `onBeforeUnmount` 里清理。因为 composable 在 setup 阶段执行，生命周期钩子能正常捕获到所属组件：

```ts
export function useWindowScroll() {
  const y = ref(0)
  const onScroll = () => (y.value = window.scrollY)

  onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

  return { y }
}
```

### 传 ref 还是传值

如果希望 composable 内部能响应外部变化，参数就收 `Ref` 或 getter；如果只关心初始值，就收普通值。这个约定要在团队里统一，否则迟早有人会踩「为什么改了不生效」的坑。

### 别急着抽

不是每段逻辑都值得抽成 composable。**只抽复用两次以上的逻辑**，一次性的留在组件内部反而更清晰。过度抽象和过度选项化一样，都是负担。

## 与工具库的配合

[VueUse](https://vueuse.org) 是这个生态里最好的 composable 集合，`useDark`、`useMediaQuery`、`useFocusTrap` 等都可以直接拿来用。本博客的暗色模式，底层正是 VitePress 内置的 vueuse `useDark`。

组合式 API 的本质是把「逻辑复用」从 mixin 的黑盒变成了函数的明盒——来源清晰、类型友好、可测试。如果你的项目还在犹豫要不要迁移，我的建议是：新组件全部用 `<script setup>`，旧组件按文件渐进重构，两者可以长期共存。
