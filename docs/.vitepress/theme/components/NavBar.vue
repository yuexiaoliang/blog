<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, useRoute } from 'vitepress'
import ThemeToggle from './ThemeToggle.vue'
import { screenOpen } from '../composables/useNav'
import { openSearch } from '../composables/useSearch'

const { site, theme } = useData()
const route = useRoute()

const scrolled = ref(false)
let onScroll: () => void

onMounted(() => {
  onScroll = () => {
    scrolled.value = window.scrollY > 8
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

function isActive(link: string) {
  if (link === '/') return route.path === '/'
  return route.path.startsWith(link)
}

const nav = theme.value.nav as { text: string; link: string }[]
const siteName = (theme.value.site?.name as string) || site.value.title
</script>

<template>
  <header class="nav" :class="{ scrolled }">
    <div class="nav-inner container">
      <a class="brand" href="/" aria-label="回到首页">
        <span class="brand-mark" aria-hidden="true"></span>
        <span class="brand-name">{{ siteName }}</span>
      </a>

      <nav class="nav-links" aria-label="主导航">
        <a
          v-for="item in nav"
          :key="item.link"
          :href="item.link"
          class="nav-link"
          :class="{ active: isActive(item.link) }"
        >
          {{ item.text }}
        </a>
      </nav>

      <div class="nav-actions">
        <button class="search-trigger" aria-label="搜索（⌘K）" @click="openSearch">
          <svg class="icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.7" />
            <path d="M13.6 13.6 17 17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          </svg>
          <span class="search-trigger-text">搜索</span>
          <kbd class="search-trigger-kbd">⌘K</kbd>
        </button>

        <ThemeToggle />

        <button
          class="menu-btn"
          :class="{ open: screenOpen }"
          aria-label="打开菜单"
          @click="screenOpen = !screenOpen"
        >
          <span class="menu-bar" />
          <span class="menu-bar" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  height: var(--nav-height);
  background: var(--nav-bg);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
  transition:
    box-shadow var(--dur) var(--ease-ios),
    background-color var(--dur) var(--ease-ios);
}

.nav.scrolled {
  box-shadow: 0 1px 0 var(--c-divider), 0 4px 16px rgba(0, 0, 0, 0.04);
}

.nav-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;
}

/* 品牌 */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 8px;
}

.brand-mark {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%);
  box-shadow: 0 2px 8px rgba(10, 132, 255, 0.35);
  transition: transform var(--dur) var(--ease-spring-soft);
}

.brand:hover .brand-mark {
  transform: rotate(-8deg) scale(1.08);
}

.brand:active .brand-mark {
  transform: scale(0.92);
}

.brand-name {
  font-size: 17px;
  font-weight: 650;
  letter-spacing: 0.01em;
  color: var(--c-text-1);
}

/* 导航链接 */
.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.nav-link {
  position: relative;
  padding: 6px 13px;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--c-text-2);
  border-radius: 999px;
  transition:
    color var(--dur-fast) var(--ease-ios),
    background-color var(--dur) var(--ease-ios);
}

.nav-link:hover {
  color: var(--c-text-1);
  background: var(--c-bg-soft);
}

.nav-link:active {
  transform: scale(0.96);
}

.nav-link.active {
  color: var(--c-brand);
  background: var(--c-brand-softer);
}

/* 右侧操作区 */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 8px 0 11px;
  font-size: 13.5px;
  color: var(--c-text-2);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  transition:
    color var(--dur-fast) var(--ease-ios),
    border-color var(--dur-fast) var(--ease-ios),
    background-color var(--dur-fast) var(--ease-ios),
    transform var(--dur) var(--ease-spring-soft);
}

.search-trigger:hover {
  color: var(--c-text-1);
  border-color: var(--c-border-strong);
}

.search-trigger:active {
  transform: scale(0.95);
}

.search-trigger .icon {
  width: 15px;
  height: 15px;
}

@media (max-width: 900px) {
  .search-trigger-text {
    display: none;
  }
}

@media (max-width: 560px) {
  .search-trigger-kbd {
    display: none;
  }
  .search-trigger {
    width: 34px;
    justify-content: center;
    padding: 0;
  }
}

/* 汉堡按钮（移动端） */
.menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  padding: 9px 8px;
  border-radius: 10px;
  transition: background-color var(--dur-fast) var(--ease-ios);
}

.menu-btn:hover {
  background: var(--c-bg-soft);
}

.menu-bar {
  display: block;
  width: 100%;
  height: 1.8px;
  border-radius: 2px;
  background: var(--c-text-1);
  transition: transform var(--dur) var(--ease-spring-soft);
}

.menu-btn.open .menu-bar:first-child {
  transform: translateY(3.4px) rotate(45deg);
}

.menu-btn.open .menu-bar:last-child {
  transform: translateY(-3.4px) rotate(-45deg);
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .menu-btn {
    display: flex;
  }
}
</style>
