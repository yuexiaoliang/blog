<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { inBrowser } from 'vitepress'
import { data as posts } from '../data/posts.data'
import PageHeader from './PageHeader.vue'

interface TagStat {
  name: string
  count: number
}

const active = ref<string | null>(null)

const tagStats = computed<TagStat[]>(() => {
  const map = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) {
      map.set(tag, (map.get(tag) || 0) + 1)
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'))
})

const tagNames = computed(() => tagStats.value.map((t) => t.name))

const filtered = computed(() =>
  active.value ? posts.filter((p) => p.tags.includes(active.value!)) : posts
)

function readQuery() {
  if (!inBrowser) return
  const tag = new URLSearchParams(window.location.search).get('tag')
  active.value = tag && tagNames.value.includes(tag) ? tag : null
}

/** 点击标签：本地切换 + 同步 URL（可分享、可后退） */
function pick(tag: string | null) {
  active.value = tag
  if (!inBrowser) return
  const url = tag ? `/tags?tag=${encodeURIComponent(tag)}` : '/tags'
  history.pushState(history.state, '', url)
}

onMounted(() => {
  readQuery()
  window.addEventListener('popstate', readQuery)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', readQuery)
})
</script>

<template>
  <div class="container">
    <PageHeader title="标签" description="按标签浏览文章" :count="tagStats.length" />

    <!-- 标签云 -->
    <div class="tag-cloud">
      <button
        class="tag-chip"
        :class="{ active: active === null }"
        @click="pick(null)"
      >
        全部
        <span class="chip-count">{{ posts.length }}</span>
      </button>
      <button
        v-for="tag in tagStats"
        :key="tag.name"
        class="tag-chip"
        :class="{ active: active === tag.name }"
        @click="pick(active === tag.name ? null : tag.name)"
      >
        {{ tag.name }}
        <span class="chip-count">{{ tag.count }}</span>
      </button>
    </div>

    <!-- 过滤后的文章 -->
    <Transition name="list" mode="out-in">
      <section :key="active ?? 'all'" class="tag-result">
        <p class="result-hint">
          <template v-if="active">
            标签「{{ active }}」下共 <strong>{{ filtered.length }}</strong> 篇文章
          </template>
          <template v-else>共 {{ filtered.length }} 篇文章</template>
        </p>
        <ul class="post-list">
          <li v-for="post in filtered" :key="post.url">
            <a class="post-row" :href="post.url">
              <time class="row-date" :datetime="post.date.display">{{ post.date.display }}</time>
              <span class="row-title">{{ post.title }}</span>
              <span class="row-tags">{{ post.tags.join(' / ') }}</span>
            </a>
          </li>
        </ul>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 8px;
  animation: fade-in 0.5s var(--ease-ios) 0.08s both;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 15px;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-2);
  background: var(--c-bg-elevated);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  transition:
    color var(--dur-fast) var(--ease-ios),
    background-color var(--dur-fast) var(--ease-ios),
    border-color var(--dur-fast) var(--ease-ios),
    transform var(--dur) var(--ease-spring-soft),
    box-shadow var(--dur) var(--ease-ios);
}

.tag-chip:hover {
  color: var(--c-text-1);
  border-color: var(--c-border-strong);
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-rest);
}

.tag-chip:active {
  transform: translateY(0) scale(0.94);
  transition-duration: var(--dur-fast);
}

.tag-chip.active {
  color: #fff;
  background: var(--c-brand);
  border-color: var(--c-brand);
  box-shadow: 0 3px 12px rgba(0, 122, 255, 0.3);
}

html.dark .tag-chip.active {
  color: #fff;
}

.chip-count {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--c-text-3);
  background: var(--c-bg-soft);
  padding: 0 7px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
  transition:
    color var(--dur-fast) var(--ease-ios),
    background-color var(--dur-fast) var(--ease-ios);
}

.tag-chip.active .chip-count {
  color: #fff;
  background: rgba(255, 255, 255, 0.22);
}

/* 结果列表 */
.tag-result {
  margin-top: 32px;
}

.result-hint {
  margin: 0 0 14px;
  font-size: 13.5px;
  color: var(--c-text-3);
}

.result-hint strong {
  color: var(--c-brand-deep);
  font-weight: 650;
}

.post-list {
  list-style: none;
}

.post-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 13px 14px;
  margin: 0 -14px;
  border-radius: var(--radius-m);
  transition: background-color var(--dur-fast) var(--ease-ios);
}

.post-row:hover {
  background: var(--c-bg-soft);
}

.row-date {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}

.row-title {
  flex: 1;
  min-width: 0;
  font-size: 15.5px;
  font-weight: 550;
  color: var(--c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    color var(--dur-fast) var(--ease-ios),
    transform var(--dur) var(--ease-spring-soft);
}

.post-row:hover .row-title {
  color: var(--c-brand);
  transform: translateX(4px);
}

.row-tags {
  flex-shrink: 0;
  font-size: 12.5px;
  color: var(--c-text-3);
}

/* 切换标签时列表柔和重排 */
.list-enter-active {
  transition:
    opacity 0.28s var(--ease-ios),
    transform 0.28s var(--ease-ios);
}
.list-leave-active {
  transition: opacity 0.12s var(--ease-ios);
}
.list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.list-leave-to {
  opacity: 0;
}

@media (max-width: 560px) {
  .row-date {
    display: none;
  }
  .row-tags {
    display: none;
  }
}
</style>
