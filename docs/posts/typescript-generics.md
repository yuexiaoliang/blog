---
title: 写给前端的 TypeScript 泛型指南
date: 2026-04-25
tags: [TypeScript, 前端]
description: 泛型不是用来炫技的语法，而是「类型的参数」。从最常见的场景出发，把它讲到能随手用。
---

很多前端同学对泛型的第一印象是「看不懂的天书」：`<T extends keyof U>`、条件类型、infer……其实泛型的本质非常朴素——**它就是类型的参数**。函数接收值的参数，泛型接收类型的参数，仅此而已。

## 从一个真实痛点开始

不用泛型的工具函数，类型要么丢、要么 any：

```ts
function first(list: any[]): any {
  return list[0]
}

const n = first([1, 2, 3]) // n: any 😞
```

加上泛型，类型立刻贯通：

```ts
function first<T>(list: T[]): T | undefined {
  return list[0]
}

const n = first([1, 2, 3]) // n: number | undefined ✅
```

`T` 在调用处被自动推断出来，你几乎不需要手动写 `first<number>(...)`。

## 约束：给参数划边界

裸的 `T` 什么都能传，有时我们只想接受「有 id 字段的对象」：

```ts
interface HasId {
  id: number
}

function indexById<T extends HasId>(list: T[]): Map<number, T> {
  return new Map(list.map((item) => [item.id, item]))
}

const users = indexById([{ id: 1, name: 'lin' }])
// Map<number, { id: number; name: string }>
```

注意返回的不是 `Map<number, HasId>` 而是 `Map<number, T>`——**传进来什么具体类型，就原样还回去**，这正是泛型比接口更强大的地方。

## keyof 与索引类型

取对象的某个字段，要求 key 必须是对象真实存在的键：

```ts
function pluck<T, K extends keyof T>(list: T[], key: K): T[K][] {
  return list.map((item) => item[key])
}

const names = pluck([{ id: 1, name: 'a' }], 'name') // string[]
pluck([{ id: 1, name: 'a' }], 'age') // ❌ 编译报错
```

`T[K]` 是「索引访问类型」，它让返回值的类型随 key 联动。拼错字段名在编译期就会被拦下，这是动态语言给不了的体验。

## 泛型组件：Vue 的例子

在 Vue 里，泛型组件能解决一个老大难问题——props 与事件类型联动：

```vue
<script setup lang="ts" generic="T">
defineProps<{
  options: T[]
  modelValue: T
}>()

defineEmits<{
  (e: 'update:modelValue', value: T): void
}>()
</script>
```

一个下拉选择组件，传 `User[]` 时选中值就是 `User`，传 `string[]` 时就是 `string`，零 any、零断言。

## 什么时候不该用

泛型有成本：**阅读成本**。几条原则帮你判断：

1. 类型只用一次，直接写死更清晰
2. 团队里有新人时，避免多层嵌套的泛型体操
3. 工具库随便用，业务代码克制用

::: tip
判断标准很简单：如果删掉泛型参数，类型信息会丢失，就用；不会丢，就不用。
:::

## 小结

- 泛型 = 类型的参数，调用处自动推断
- `extends` 给泛型参数划约束边界
- `keyof` + `T[K]` 实现键与值的类型联动
- 泛型组件让 props 类型随使用者流动

把泛型当参数来想，它就再也不是天书。下一篇我们聊聊条件类型与 infer——那是泛型的「进阶副本」，但核心思路是一脉相承的。
