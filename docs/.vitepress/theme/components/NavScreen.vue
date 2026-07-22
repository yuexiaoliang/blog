<script setup lang="ts">
import { watch } from 'vue'
import { inBrowser, useData, useRoute } from 'vitepress'
import ThemeToggle from './ThemeToggle.vue'
import { screenOpen } from '../composables/useNav'
import { closeSearch, openSearch } from '../composables/useSearch'

const { theme } = useData()
const route = useRoute()

const nav = theme.value.nav as { text: string; link: string }[]

function isActive(link: string) {
  if (link === '/') return route.path === '/'
  return route.path.startsWith(link)
}

// 路由变化时收起菜单
watch(
  () => route.path,
  () => {
    screenOpen.value = false
  }
)

// 锁定背景滚动
watch(screenOpen, (open) => {
  if (!inBrowser) return
  document.body.classList.toggle('no-scroll', open)
})

function triggerSearch() {
  screenOpen.value = false
  closeSearch()
  // 等菜单收起动画启动后再弹出搜索，避免两层动画叠加
  setTimeout(openSearch, 120)
}
</script>

<template>
  <Transition name="screen">
    <div v-if="screenOpen" class="screen" role="dialog" aria-modal="true" aria-label="菜单">
      <nav class="screen-links">
        <a
          v-for="(item, i) in nav"
          :key="item.link"
          :href="item.link"
          class="screen-link"
          :class="{ active: isActive(item.link) }"
          :style="{ '--i': i }"
          @click="screenOpen = false"
        >
          {{ item.text }}
        </a>
      </nav>

      <div class="screen-footer">
        <button class="screen-search" @click="triggerSearch">
          <svg class="icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.7" />
            <path d="M13.6 13.6 17 17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          </svg>
          搜索文章
        </button>
        <ThemeToggle large />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.screen {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  padding: calc(var(--nav-height) + 28px) 32px 40px;
  background: color-mix(in srgb, var(--c-bg) 92%, transparent);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  backdrop-filter: saturate(180%) blur(24px);
}

.screen-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.screen-link {
  padding: 13px 8px;
  font-size: 27px;
  font-weight: 650;
  letter-spacing: 0.01em;
  color: var(--c-text-1);
  border-bottom: 1px solid var(--c-divider);
  animation: link-in 0.45s var(--ease-ios) both;
  animation-delay: calc(80ms + var(--i) * 45ms);
  transition: color var(--dur-fast) var(--ease-ios);
}

.screen-link:active {
  color: var(--c-brand);
}

.screen-link.active {
  color: var(--c-brand);
}

@keyframes link-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.screen-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  animation: link-in 0.45s var(--ease-ios) both;
  animation-delay: 320ms;
}

.screen-search {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 46px;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 500;
  color: var(--c-text-2);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  transition:
    color var(--dur-fast) var(--ease-ios),
    transform var(--dur) var(--ease-spring-soft);
}

.screen-search:active {
  transform: scale(0.96);
}

.screen-search .icon {
  width: 17px;
  height: 17px;
}

/* 弹层进出：整块轻柔下滑 */
.screen-enter-active {
  transition:
    opacity 0.3s var(--ease-ios),
    transform 0.38s var(--ease-spring-soft);
}
.screen-leave-active {
  transition:
    opacity 0.2s var(--ease-ios),
    transform 0.2s var(--ease-ios);
}
.screen-enter-from {
  opacity: 0;
  transform: translateY(-14px);
}
.screen-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
