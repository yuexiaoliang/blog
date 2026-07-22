<script setup lang="ts">
import MiniSearch from 'minisearch'
import { computed, nextTick, ref, watch } from 'vue'
import { inBrowser, useData, useRouter } from 'vitepress'
import searchIndex from '@localSearchIndex'
import { closeSearch, searchOpen } from '../composables/useSearch'

const { localeIndex } = useData()
const router = useRouter()

const query = ref('')
const cursor = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)
const listEl = ref<HTMLElement | null>(null)

interface Result {
  id: string
  title: string
  titles: string[]
}

const results = ref<Result[]>([])

/**
 * 中文友好分词器：西文按词切分，中文切成二元组。
 * 必须与 config.mts 中建索引使用的 tokenize 完全一致。
 */
function tokenize(text: string): string[] {
  const tokens: string[] = []
  const CJK = '㐀-鿿豈-﫿'
  const segments = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []
  for (const seg of segments) {
    const parts = seg.match(new RegExp(`[${CJK}]+|[^${CJK}]+`, 'g')) || []
    for (const part of parts) {
      if (new RegExp(`^[${CJK}]+$`).test(part)) {
        if (part.length === 1) tokens.push(part)
        else for (let i = 0; i < part.length - 1; i++) tokens.push(part.slice(i, i + 2))
      } else {
        tokens.push(part)
      }
    }
  }
  return tokens
}

/**
 * VitePress 1.6 的 @localSearchIndex 导出「locale → 惰性 import 函数」的映射，
 * 每个模块的 default 是序列化好的 MiniSearch 索引，需用 loadJSON 反序列化。
 */
let miniPromise: Promise<MiniSearch<Result> | null> | null = null

function getMini() {
  if (!miniPromise) {
    miniPromise = (async () => {
      try {
        const map = searchIndex as Record<string, () => Promise<{ default: string }>>
        const load = map[localeIndex.value] || Object.values(map)[0]
        const mod = await load?.()
        if (!mod?.default) return null
        return MiniSearch.loadJSON<Result>(mod.default, {
          fields: ['title', 'titles', 'text'],
          storeFields: ['title', 'titles'],
          tokenize,
          searchOptions: {
            prefix: true,
            fuzzy: 0.2,
            boost: { title: 4, titles: 2 },
          },
        })
      } catch {
        /* 索引尚未生成时静默忽略 */
        return null
      }
    })()
  }
  return miniPromise
}

const hasQuery = computed(() => query.value.trim().length > 0)

watch(query, async (q) => {
  const term = q.trim()
  if (!term) {
    results.value = []
    cursor.value = 0
    return
  }
  const mini = await getMini()
  if (!mini || query.value.trim() !== term) return
  results.value = mini.search(term).slice(0, 30) as unknown as Result[]
  cursor.value = 0
})

watch(searchOpen, async (open) => {
  if (!inBrowser) return
  if (open) {
    query.value = ''
    results.value = []
    cursor.value = 0
    document.body.classList.add('no-scroll')
    await nextTick()
    inputEl.value?.focus()
  } else {
    document.body.classList.remove('no-scroll')
  }
})

// 光标移动时保证当前项可见
watch(cursor, async () => {
  await nextTick()
  const active = listEl.value?.querySelector('.search-result.active') as HTMLElement | null
  active?.scrollIntoView({ block: 'nearest' })
})

function go(id: string) {
  closeSearch()
  router.go(id)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    cursor.value = Math.min(cursor.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    cursor.value = Math.max(cursor.value - 1, 0)
  } else if (e.key === 'Enter') {
    const hit = results.value[cursor.value]
    if (hit) go(hit.id)
  }
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 给命中的关键词加 <mark> 高亮 */
function highlight(text: string | undefined) {
  if (!text) return ''
  const terms = query.value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeReg)
  if (!terms.length) return text
  try {
    return text.replace(new RegExp(`(${terms.join('|')})`, 'ig'), '<mark>$1</mark>')
  } catch {
    return text
  }
}
</script>

<template>
  <Transition name="dialog">
    <div
      v-if="searchOpen"
      class="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="搜索"
      @click.self="closeSearch"
      @keydown.esc="closeSearch"
    >
      <div class="search-dialog">
        <div class="search-head">
          <svg class="head-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.7" />
            <path d="M13.6 13.6 17 17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          </svg>
          <input
            ref="inputEl"
            v-model="query"
            class="search-input"
            type="search"
            placeholder="搜索文章、标签、关键词…"
            autocomplete="off"
            spellcheck="false"
            @keydown="onKeydown"
          />
          <kbd>ESC</kbd>
        </div>

        <div ref="listEl" class="search-body">
          <div v-if="!hasQuery" class="search-empty">
            <span class="empty-icon" aria-hidden="true">⌕</span>
            输入关键词，在全站文章中搜索
          </div>
          <div v-else-if="!results.length" class="search-empty">
            <span class="empty-icon" aria-hidden="true">∅</span>
            没有找到与「{{ query.trim() }}」相关的内容
          </div>

          <a
            v-for="(r, i) in results"
            v-else
            :key="r.id"
            :href="r.id"
            class="search-result"
            :class="{ active: i === cursor }"
            @click.prevent="go(r.id)"
            @mouseenter="cursor = i"
          >
            <span class="result-mark" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M4 3h8v10l-4-2.6L4 13V3Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="result-text">
              <span v-if="r.titles && r.titles.length" class="result-titles">
                {{ r.titles.join(' › ') }}
              </span>
              <span class="result-title" v-html="highlight(r.title)"></span>
            </span>
            <span class="result-enter" aria-hidden="true">↵</span>
          </a>
        </div>

        <div class="search-foot">
          <span class="hint"><kbd>↑</kbd><kbd>↓</kbd> 切换</span>
          <span class="hint"><kbd>↵</kbd> 打开</span>
          <span class="hint"><kbd>esc</kbd> 关闭</span>
          <span class="foot-brand">本地搜索</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: min(16vh, 140px) 20px 20px;
  background: rgba(0, 0, 0, 0.32);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}

html.dark .search-overlay {
  background: rgba(0, 0, 0, 0.55);
}

.search-dialog {
  width: min(600px, 100%);
  max-height: min(64vh, 560px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--c-bg-elevated);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-l);
  box-shadow: var(--pop-shadow);
}

/* 输入区 */
.search-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--c-divider);
}

.head-icon {
  width: 19px;
  height: 19px;
  flex-shrink: 0;
  color: var(--c-text-3);
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 16px;
  color: var(--c-text-1);
}

.search-input::placeholder {
  color: var(--c-text-3);
}

.search-input::-webkit-search-cancel-button {
  display: none;
}

/* 结果区 */
.search-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 10px;
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 46px 20px;
  font-size: 14px;
  color: var(--c-text-3);
}

.empty-icon {
  font-size: 30px;
  line-height: 1;
  color: var(--c-text-3);
  opacity: 0.6;
}

.search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: var(--radius-m);
  cursor: pointer;
  transition:
    background-color var(--dur-fast) var(--ease-ios),
    transform var(--dur-fast) var(--ease-ios);
}

.search-result.active {
  background: var(--c-brand-soft);
}

.result-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: var(--c-text-3);
  background: var(--c-bg-soft);
  border-radius: 9px;
  transition:
    color var(--dur-fast) var(--ease-ios),
    background-color var(--dur-fast) var(--ease-ios);
}

.result-mark svg {
  width: 15px;
  height: 15px;
}

.search-result.active .result-mark {
  color: var(--c-brand);
  background: var(--c-bg-elevated);
}

html.dark .search-result.active .result-mark {
  background: var(--c-bg-soft);
}

.result-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.result-titles {
  font-size: 11.5px;
  color: var(--c-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-title {
  font-size: 14.5px;
  font-weight: 550;
  color: var(--c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result.active .result-title {
  color: var(--c-brand-deep);
}

.result-title :deep(mark) {
  background: var(--c-mark);
  color: inherit;
  border-radius: 3px;
  padding: 0 1px;
}

.result-enter {
  margin-left: auto;
  font-size: 15px;
  color: var(--c-text-3);
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-ios);
}

.search-result.active .result-enter {
  opacity: 1;
}

/* 底部提示 */
.search-foot {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 11px 18px;
  font-size: 12px;
  color: var(--c-text-3);
  border-top: 1px solid var(--c-divider);
}

.hint {
  display: flex;
  align-items: center;
  gap: 4px;
}

.foot-brand {
  margin-left: auto;
  letter-spacing: 0.04em;
}

/* 弹层动效：背景淡入，弹窗带轻回弹地下落 */
.dialog-enter-active {
  transition: opacity 0.25s var(--ease-ios);
}
.dialog-leave-active {
  transition: opacity 0.18s var(--ease-ios);
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.search-dialog {
  transition: transform 0.34s var(--ease-spring-soft);
}
.dialog-enter-from .search-dialog {
  transform: translateY(18px) scale(0.97);
}
.dialog-leave-to .search-dialog {
  transform: translateY(10px) scale(0.985);
}

@media (max-width: 560px) {
  .search-overlay {
    padding: 12vh 14px 14px;
  }
  .search-foot {
    display: none;
  }
}
</style>
