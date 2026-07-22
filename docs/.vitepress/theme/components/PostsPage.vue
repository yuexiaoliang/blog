<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../data/posts.data'
import PageHeader from './PageHeader.vue'

interface YearGroup {
  year: string
  items: typeof posts
}

const groups = computed<YearGroup[]>(() => {
  const map = new Map<string, typeof posts>()
  for (const post of posts) {
    const list = map.get(post.date.year) || []
    list.push(post)
    map.set(post.date.year, list)
  }
  return [...map.entries()].map(([year, items]) => ({ year, items }))
})
</script>

<template>
  <div class="container">
    <PageHeader title="文章" description="全部文章，按时间倒序" :count="posts.length" />

    <section v-for="group in groups" :key="group.year" class="year-section">
      <h2 class="year-label">{{ group.year }}</h2>
      <ul class="post-list">
        <li v-for="post in group.items" :key="post.url">
          <a class="post-row" :href="post.url">
            <time class="row-date" :datetime="post.date.display">{{ post.date.short }}</time>
            <span class="row-title">{{ post.title }}</span>
            <span v-if="post.tags.length" class="row-tag">{{ post.tags[0] }}</span>
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.year-section + .year-section {
  margin-top: 40px;
}

.year-label {
  margin: 0 0 14px;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.08em;
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
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

.post-row:active {
  transform: scale(0.995);
}

.row-date {
  flex-shrink: 0;
  width: 46px;
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

.row-tag {
  flex-shrink: 0;
  padding: 1px 9px;
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-2);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-divider);
  border-radius: 999px;
  transition:
    color var(--dur-fast) var(--ease-ios),
    border-color var(--dur-fast) var(--ease-ios);
}

.post-row:hover .row-tag {
  color: var(--c-brand-deep);
  border-color: transparent;
  background: var(--c-brand-softer);
}

@media (max-width: 560px) {
  .row-tag {
    display: none;
  }
}
</style>
