<script setup lang="ts">
import { useData } from 'vitepress'

defineProps<{ large?: boolean }>()

// VitePress 内核使用 vueuse 的 useDark，isDark 可写：
// 写入即同步 <html> 的 dark 类与 localStorage，无需手动操作 DOM。
const { isDark } = useData()

function toggle() {
  isDark.value = !isDark.value
}
</script>

<template>
  <button
    class="theme-toggle"
    :class="{ large }"
    aria-label="切换深浅色模式"
    title="切换深浅色模式"
    @click="toggle"
  >
    <!--
      两个图标同时渲染、用 CSS 按 html.dark 切换显示：
      条件渲染（v-if）会在 SSR 与客户端偏好不一致时产生 hydration mismatch。
    -->
    <svg class="icon icon-sun" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3.6" stroke="currentColor" stroke-width="1.6" />
      <path
        d="M10 2.2v1.8M10 16v1.8M2.2 10H4M16 10h1.8M4.5 4.5l1.3 1.3M14.2 14.2l1.3 1.3M15.5 4.5l-1.3 1.3M5.8 14.2l-1.3 1.3"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    </svg>
    <svg class="icon icon-moon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M16.5 12.2A7.5 7.5 0 0 1 7.8 3.5a7.5 7.5 0 1 0 8.7 8.7Z"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: var(--c-text-2);
  background: var(--c-bg-soft);
  border: 1px solid transparent;
  border-radius: 50%;
  transition:
    color var(--dur-fast) var(--ease-ios),
    border-color var(--dur-fast) var(--ease-ios),
    background-color var(--dur-fast) var(--ease-ios),
    transform var(--dur) var(--ease-spring-soft);
}

.theme-toggle:hover {
  color: var(--c-text-1);
  border-color: var(--c-border);
}

.theme-toggle:active {
  transform: scale(0.86);
}

.theme-toggle.large {
  width: 46px;
  height: 46px;
}

.theme-toggle .icon {
  position: absolute;
  width: 17px;
  height: 17px;
}

.theme-toggle.large .icon {
  width: 21px;
  height: 21px;
}

/* 显隐切换 + 轻回弹的出现动画 */
.icon-moon {
  display: none;
}

html.dark .icon-sun {
  display: none;
}

html.dark .icon-moon {
  display: block;
  animation: icon-pop 0.36s var(--ease-spring) both;
}

html:not(.dark) .icon-sun {
  animation: icon-pop 0.36s var(--ease-spring) both;
}

@keyframes icon-pop {
  from {
    opacity: 0;
    transform: rotate(-70deg) scale(0.4);
  }
  to {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
}
</style>
