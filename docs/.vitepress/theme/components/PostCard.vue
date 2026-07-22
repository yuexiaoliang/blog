<script setup lang="ts">
import type { Post } from '../data/posts.data'

defineProps<{ post: Post; index?: number }>()
</script>

<template>
  <a class="post-card" :href="post.url" :style="{ '--i': index ?? 0 }">
    <div class="post-card-meta">
      <time class="post-card-date" :datetime="post.date.display">{{ post.date.display }}</time>
      <span v-if="post.tags.length" class="post-card-tags">{{ post.tags.join(' · ') }}</span>
    </div>
    <h3 class="post-card-title">{{ post.title }}</h3>
    <p v-if="post.description" class="post-card-desc">{{ post.description }}</p>
    <span class="post-card-more">
      阅读全文
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </a>
</template>

<style scoped>
.post-card {
  display: flex;
  flex-direction: column;
  padding: 22px 24px 18px;
  background: var(--c-bg-elevated);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-l);
  box-shadow: var(--card-shadow-rest);
  transition:
    transform var(--dur) var(--ease-spring-soft),
    box-shadow var(--dur) var(--ease-ios),
    border-color var(--dur) var(--ease-ios),
    background-color var(--dur) var(--ease-ios);
  animation: card-in 0.55s var(--ease-ios) both;
  animation-delay: calc(0.06s + var(--i) * 0.06s);
}

.post-card:hover {
  transform: translateY(-4px);
  border-color: var(--c-border-strong);
  box-shadow: var(--card-shadow-hover);
}

.post-card:active {
  transform: translateY(-1px) scale(0.985);
  transition-duration: var(--dur-fast);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  color: var(--c-text-3);
}

.post-card-tags {
  padding: 2px 9px;
  color: var(--c-brand-deep);
  background: var(--c-brand-softer);
  border-radius: 999px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

.post-card-title {
  margin: 12px 0 0;
  font-size: 1.14rem;
  font-weight: 650;
  line-height: 1.5;
  letter-spacing: -0.005em;
  color: var(--c-text-1);
  transition: color var(--dur-fast) var(--ease-ios);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card:hover .post-card-title {
  color: var(--c-brand);
}

.post-card-desc {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.75;
  color: var(--c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-more {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: auto;
  padding-top: 16px;
  font-size: 13.5px;
  font-weight: 550;
  color: var(--c-text-3);
  transition: color var(--dur-fast) var(--ease-ios);
}

.post-card-more svg {
  width: 13px;
  height: 13px;
  transition: transform var(--dur) var(--ease-spring-soft);
}

.post-card:hover .post-card-more {
  color: var(--c-brand);
}

.post-card:hover .post-card-more svg {
  transform: translateX(4px);
}
</style>
