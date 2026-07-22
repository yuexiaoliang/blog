<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { Content, onContentUpdated, useData, useRoute } from 'vitepress'
import Toc from './Toc.vue'
import PostMeta from './PostMeta.vue'
import ReadingProgress from './ReadingProgress.vue'
import { data as posts } from '../data/posts.data'

const { frontmatter, page } = useData()
const route = useRoute()

const isPost = computed(() => route.path.startsWith('/posts/'))

const post = computed(() => posts.find((p) => p.url === route.path.replace(/\/$/, '')))

const meta = computed(() => ({
  date: post.value?.date.display || (frontmatter.value.date as string | undefined),
  tags: (post.value?.tags || frontmatter.value.tags) as string[] | undefined,
  words: post.value?.words || words.value,
}))

const tocOpen = ref(false)
const hasHeadings = ref(false)
const words = ref(0)

function collectWords() {
  const el = document.querySelector('.vp-doc')
  if (el) words.value = (el.textContent || '').replace(/\s+/g, '').length
  hasHeadings.value = !!document.querySelector('.vp-doc h2[id], .vp-doc h3[id]')
}

/**
 * 为代码块接入复制能力（只处理一次）。
 * VitePress 1.6 已在每个代码块注入空的 <button class="copy">，这里直接复用它，
 * 补上图标与点击逻辑；极端情况下缺失时再自行创建。
 */
function setupCopyButtons() {
  document.querySelectorAll<HTMLElement>('.vp-doc div[class*="language-"]').forEach((block) => {
    if (block.querySelector('.copy-btn')) return
    let btn = block.querySelector<HTMLButtonElement>('button.copy')
    if (!btn) {
      btn = document.createElement('button')
      block.appendChild(btn)
    }
    btn.classList.add('copy-btn')
    btn.setAttribute('aria-label', '复制代码')
    btn.setAttribute('title', '复制代码')
    btn.innerHTML = `
      <svg class="icon-copy" viewBox="0 0 16 16" fill="none" width="15" height="15" aria-hidden="true">
        <rect x="5.5" y="5.5" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.4"/>
        <path d="M10.5 3.5v-.2A1.8 1.8 0 0 0 8.7 1.5h-5A1.8 1.8 0 0 0 1.9 3.3v5a1.8 1.8 0 0 0 1.8 1.8h.3" stroke="currentColor" stroke-width="1.4"/>
      </svg>
      <svg class="icon-check" viewBox="0 0 16 16" fill="none" width="15" height="15" aria-hidden="true">
        <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    btn.addEventListener('click', async () => {
      const code = block.querySelector('code')?.textContent || ''
      try {
        await navigator.clipboard.writeText(code)
        btn!.classList.add('copied')
        setTimeout(() => btn!.classList.remove('copied'), 1600)
      } catch {
        /* 剪贴板不可用时静默失败 */
      }
    })
  })
}

function afterContentRender() {
  nextTick(() => {
    collectWords()
    setupCopyButtons()
  })
}

onMounted(afterContentRender)
onContentUpdated(afterContentRender)
</script>

<template>
  <!--
    必须是单根节点：此组件处在 Layout 的 <Transition mode="out-in"> 下，
    多根（fragment）子树不会触发 leave 钩子，导致离场回调永不执行、
    切换/返回时新页面不挂载（白屏）。ReadingProgress 是 fixed 定位，包一层无副作用。
  -->
  <div class="doc-page">
    <ReadingProgress />

    <div class="doc container">
    <article class="doc-main">
      <a v-if="isPost" class="doc-back" href="/posts">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M13 8H3M7 4 3 8l4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        全部文章
      </a>

      <header class="doc-header">
        <h1 class="doc-title">{{ frontmatter.title || page.title }}</h1>
        <PostMeta v-if="isPost" :date="meta.date" :tags="meta.tags" :words="meta.words" />
      </header>

      <!-- 移动端目录（可折叠） -->
      <div v-if="hasHeadings" class="toc-mobile">
        <button class="toc-mobile-btn" :class="{ open: tocOpen }" @click="tocOpen = !tocOpen">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2.5 4h11M2.5 8h11M2.5 12h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          目录
          <svg class="chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div class="toc-collapse" :class="{ open: tocOpen }">
          <div class="toc-collapse-inner">
            <Toc mobile />
          </div>
        </div>
      </div>

      <div class="vp-doc">
        <Content />
      </div>

      <footer class="doc-footer">
        <div class="doc-footer-tags" v-if="meta.tags?.length">
          <a
            v-for="tag in meta.tags"
            :key="tag"
            class="footer-tag"
            :href="`/tags?tag=${encodeURIComponent(tag)}`"
          >
            # {{ tag }}
          </a>
        </div>
        <div class="doc-end">
          <span class="end-line" aria-hidden="true" />
          <span class="end-text">全文完</span>
          <span class="end-line" aria-hidden="true" />
        </div>
        <a v-if="isPost" class="doc-back-bottom" href="/posts">← 返回文章列表，继续阅读</a>
      </footer>
    </article>

    <!-- 桌面端右侧目录 -->
    <aside class="doc-aside">
      <div class="aside-sticky">
        <Toc />
      </div>
    </aside>
    </div>
  </div>
</template>

<style scoped>
.doc {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--toc-width);
  gap: 56px;
  align-items: start;
  padding-top: 36px;
}

.doc-main {
  min-width: 0;
  max-width: var(--content-width);
}

/* 返回链接 */
.doc-back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 26px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--c-text-3);
  transition:
    color var(--dur-fast) var(--ease-ios),
    transform var(--dur) var(--ease-spring-soft);
}

.doc-back svg {
  width: 14px;
  height: 14px;
  transition: transform var(--dur) var(--ease-spring-soft);
}

.doc-back:hover {
  color: var(--c-brand);
}

.doc-back:hover svg {
  transform: translateX(-3px);
}

/* 标题区 */
.doc-header {
  padding-bottom: 28px;
  border-bottom: 1px solid var(--c-divider);
  margin-bottom: 8px;
}

.doc-title {
  margin: 0;
  font-size: clamp(1.7rem, 4.4vw, 2.2rem);
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.018em;
  color: var(--c-text-1);
}

/* 移动端目录 */
.toc-mobile {
  display: none;
  margin: 22px 0 6px;
}

.toc-mobile-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 11px 14px;
  font-size: 14px;
  font-weight: 550;
  color: var(--c-text-2);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-m);
  transition:
    color var(--dur-fast) var(--ease-ios),
    border-color var(--dur-fast) var(--ease-ios);
}

.toc-mobile-btn svg {
  width: 15px;
  height: 15px;
}

.toc-mobile-btn .chevron {
  margin-left: auto;
  transition: transform var(--dur) var(--ease-spring-soft);
}

.toc-mobile-btn.open .chevron {
  transform: rotate(180deg);
}

.toc-collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s var(--ease-spring-soft);
}

.toc-collapse.open {
  grid-template-rows: 1fr;
}

.toc-collapse-inner {
  overflow: hidden;
}

.toc-collapse-inner :deep(.toc) {
  padding: 14px 14px 8px;
}

/* 文末 */
.doc-footer {
  margin-top: 56px;
}

.doc-footer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}

.footer-tag {
  padding: 4px 13px;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-2);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  transition:
    color var(--dur-fast) var(--ease-ios),
    border-color var(--dur-fast) var(--ease-ios),
    transform var(--dur) var(--ease-spring-soft);
}

.footer-tag:hover {
  color: var(--c-brand-deep);
  border-color: var(--c-brand);
  transform: translateY(-2px);
}

.footer-tag:active {
  transform: scale(0.94);
}

.doc-end {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--c-text-3);
}

.end-line {
  flex: 1;
  height: 1px;
  background: var(--c-divider);
}

.end-text {
  font-size: 12.5px;
  letter-spacing: 0.3em;
  padding-left: 0.3em;
}

.doc-back-bottom {
  display: inline-block;
  margin-top: 24px;
  font-size: 14px;
  font-weight: 550;
  color: var(--c-brand);
  transition: transform var(--dur) var(--ease-spring-soft);
}

.doc-back-bottom:hover {
  transform: translateX(-3px);
}

/* 右侧目录 */
.doc-aside {
  display: none;
}

.aside-sticky {
  position: sticky;
  top: calc(var(--nav-height) + 36px);
  padding: 4px 0 24px 14px;
  border-left: 1px solid var(--c-divider);
  max-height: calc(100vh - var(--nav-height) - 72px);
  overflow-y: auto;
}

@media (min-width: 1120px) {
  .doc-aside {
    display: block;
  }
}

@media (max-width: 1119px) {
  .doc {
    grid-template-columns: minmax(0, 1fr);
  }
  .toc-mobile {
    display: block;
  }
}
</style>
