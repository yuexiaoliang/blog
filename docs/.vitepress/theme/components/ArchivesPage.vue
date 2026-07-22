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
  <div class="container archives">
    <PageHeader title="归档" description="时光留痕，一路写来" :count="posts.length" />

    <div class="timeline">
      <section v-for="group in groups" :key="group.year" class="timeline-year">
        <h2 class="timeline-heading">
          <span class="year-num">{{ group.year }}</span>
          <span class="year-count">{{ group.items.length }} 篇</span>
        </h2>

        <ul class="timeline-list">
          <li v-for="post in group.items" :key="post.url" class="timeline-item">
            <span class="dot" aria-hidden="true" />
            <a class="timeline-row" :href="post.url">
              <time class="t-date" :datetime="post.date.display">{{ post.date.short }}</time>
              <span class="t-title">{{ post.title }}</span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  padding-bottom: 24px;
}

.timeline-year + .timeline-year {
  margin-top: 44px;
}

.timeline-heading {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 0 0 18px;
  animation: fade-up 0.5s var(--ease-ios) both;
}

.year-num {
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--c-text-1);
  font-variant-numeric: tabular-nums;
}

.year-count {
  font-size: 13px;
  color: var(--c-text-3);
}

/* 时间轴 */
.timeline-list {
  list-style: none;
  margin-left: 10px;
  padding-left: 26px;
  border-left: 1.5px solid var(--c-divider);
}

.timeline-item {
  position: relative;
}

.dot {
  position: absolute;
  left: -32.5px;
  top: 21px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c-bg);
  border: 2px solid var(--c-text-3);
  transition:
    border-color var(--dur) var(--ease-spring-soft),
    background-color var(--dur) var(--ease-spring-soft),
    transform var(--dur) var(--ease-spring);
}

.timeline-item:hover .dot {
  border-color: var(--c-brand);
  background: var(--c-brand);
  transform: scale(1.25);
  box-shadow: 0 0 0 4px var(--c-brand-soft);
}

.timeline-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 12px 14px;
  margin-left: -14px;
  border-radius: var(--radius-m);
  transition: background-color var(--dur-fast) var(--ease-ios);
}

.timeline-row:hover {
  background: var(--c-bg-soft);
}

.t-date {
  flex-shrink: 0;
  width: 46px;
  font-size: 13px;
  color: var(--c-text-3);
  font-variant-numeric: tabular-nums;
}

.t-title {
  font-size: 15.5px;
  font-weight: 550;
  color: var(--c-text-1);
  transition:
    color var(--dur-fast) var(--ease-ios),
    transform var(--dur) var(--ease-spring-soft);
}

.timeline-row:hover .t-title {
  color: var(--c-brand);
  transform: translateX(4px);
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 560px) {
  .year-num {
    font-size: 1.5rem;
  }
}
</style>
