<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  date?: string
  tags?: string[]
  words?: number
}>()

const readingTime = computed(() => {
  if (!props.words) return ''
  const minutes = Math.max(1, Math.ceil(props.words / 400))
  return `约 ${minutes} 分钟`
})
</script>

<template>
  <div class="post-meta">
    <span v-if="date" class="meta-item">
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" stroke-width="1.3" />
        <path d="M2 6.5h12M5.2 1.5v3M10.8 1.5v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
      </svg>
      <time :datetime="date">{{ date }}</time>
    </span>

    <span v-if="readingTime" class="meta-item">
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.3" />
        <path d="M8 4.6V8l2.3 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      {{ readingTime }}
    </span>

    <span v-if="words" class="meta-item">
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 3h10v10H3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
        <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
      </svg>
      {{ words }} 字
    </span>

    <span v-if="tags?.length" class="meta-tags">
      <a v-for="tag in tags" :key="tag" class="meta-tag" :href="`/tags?tag=${encodeURIComponent(tag)}`">
        # {{ tag }}
      </a>
    </span>
  </div>
</template>

<style scoped>
.post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 18px;
  margin-top: 16px;
  font-size: 13.5px;
  color: var(--c-text-3);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.meta-item svg {
  width: 14px;
  height: 14px;
}

.meta-tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-tag {
  padding: 2px 10px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--c-brand-deep);
  background: var(--c-brand-softer);
  border-radius: 999px;
  transition:
    background-color var(--dur-fast) var(--ease-ios),
    transform var(--dur) var(--ease-spring-soft);
}

.meta-tag:hover {
  background: var(--c-brand-soft);
  transform: translateY(-1px);
}

.meta-tag:active {
  transform: scale(0.94);
}
</style>
