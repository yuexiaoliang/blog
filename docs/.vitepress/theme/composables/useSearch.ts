import { inBrowser } from 'vitepress'
import { ref } from 'vue'

/** 搜索弹窗的全局开关（模块级单例） */
export const searchOpen = ref(false)

export function openSearch() {
  searchOpen.value = true
}

export function closeSearch() {
  searchOpen.value = false
}

let shortcutBound = false

/** 绑定 ⌘K / Ctrl+K 唤起搜索（在 Layout setup 中调用一次） */
export function useSearchShortcut() {
  if (!inBrowser || shortcutBound) return
  shortcutBound = true
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      searchOpen.value = !searchOpen.value
    }
  })
}
