<script setup lang="ts">
import { useData } from 'vitepress'
import { data as posts } from '../data/posts.data'
import PostCard from './PostCard.vue'

const { theme } = useData()
const siteInfo = (theme.value.site || {}) as {
  name?: string
  tagline?: string
  author?: string
  socials?: { icon: string; label: string; link: string }[]
}

const recent = posts.slice(0, 6)
</script>

<template>
  <div class="home">
    <!-- 首屏 -->
    <section class="hero">
      <div class="hero-glow" aria-hidden="true" />
      <div class="container hero-inner">
        <div class="hero-avatar" aria-hidden="true">{{ (siteInfo.name || '拾')[0] }}</div>
        <h1 class="hero-title">{{ siteInfo.name }}</h1>
        <p class="hero-tagline">{{ siteInfo.tagline }}</p>
        <div v-if="siteInfo.socials?.length" class="hero-socials">
          <a
            v-for="s in siteInfo.socials"
            :key="s.link"
            :href="s.link"
            class="social-btn"
            :title="s.label"
            :aria-label="s.label"
            target="_blank"
            rel="noopener"
          >
            <!-- GitHub -->
            <svg v-if="s.icon === 'github'" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10 1.7a8.3 8.3 0 0 0-2.63 16.18c.42.08.57-.18.57-.4v-1.4c-2.32.5-2.8-1.13-2.8-1.13-.38-.97-.93-1.22-.93-1.22-.76-.52.06-.51.06-.51.84.06 1.28.86 1.28.86.75 1.29 1.96.92 2.44.7.07-.55.29-.92.53-1.13-1.85-.21-3.8-.93-3.8-4.13 0-.91.32-1.66.86-2.24-.09-.21-.37-1.07.08-2.22 0 0 .7-.23 2.3.86a7.9 7.9 0 0 1 4.18 0c1.6-1.09 2.3-.86 2.3-.86.45 1.15.17 2.01.08 2.22.54.58.86 1.33.86 2.24 0 3.21-1.96 3.92-3.82 4.12.3.26.56.77.56 1.56v2.3c0 .22.15.49.58.4A8.3 8.3 0 0 0 10 1.7Z"
              />
            </svg>
            <!-- 邮箱 -->
            <svg v-else viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" stroke="currentColor" stroke-width="1.6" />
              <path d="m3.5 6 6.5 4.8L16.5 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- 最新文章 -->
    <section class="home-posts container">
      <div class="section-head">
        <h2 class="section-title">最新文章</h2>
        <a class="more-link" href="/posts">
          查看全部
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>
      <div class="post-grid">
        <PostCard v-for="(post, i) in recent" :key="post.url" :post="post" :index="i" />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 首屏 */
.hero {
  position: relative;
  overflow: hidden;
  padding: 92px 0 84px;
  text-align: center;
}

.hero-glow {
  position: absolute;
  inset: -40% -10% auto;
  height: 480px;
  background:
    radial-gradient(46% 60% at 50% 40%, var(--c-brand-softer) 0%, transparent 70%),
    radial-gradient(30% 40% at 72% 30%, rgba(94, 92, 230, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.hero-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-avatar {
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 650;
  color: #fff;
  background: linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%);
  border-radius: 24px;
  box-shadow: 0 8px 28px rgba(10, 132, 255, 0.32);
  animation: avatar-in 0.7s var(--ease-spring-soft) both;
}

.hero-title {
  margin: 26px 0 0;
  font-size: clamp(2rem, 5vw, 2.7rem);
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--c-text-1);
  animation: fade-up 0.6s var(--ease-ios) 0.08s both;
}

.hero-tagline {
  margin: 14px 0 0;
  max-width: 420px;
  font-size: 16.5px;
  line-height: 1.8;
  color: var(--c-text-2);
  animation: fade-up 0.6s var(--ease-ios) 0.16s both;
}

.hero-socials {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  animation: fade-up 0.6s var(--ease-ios) 0.24s both;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--c-text-2);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: 50%;
  transition:
    color var(--dur-fast) var(--ease-ios),
    border-color var(--dur-fast) var(--ease-ios),
    transform var(--dur) var(--ease-spring-soft);
}

.social-btn svg {
  width: 18px;
  height: 18px;
}

.social-btn:hover {
  color: var(--c-brand);
  border-color: var(--c-brand);
  transform: translateY(-3px);
}

.social-btn:active {
  transform: translateY(0) scale(0.92);
}

@keyframes avatar-in {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.7);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 最新文章 */
.home-posts {
  padding-bottom: 24px;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 22px;
}

.section-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  color: var(--c-text-1);
}

.more-link {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-2);
  transition: color var(--dur-fast) var(--ease-ios);
}

.more-link svg {
  width: 14px;
  height: 14px;
  transition: transform var(--dur) var(--ease-spring-soft);
}

.more-link:hover {
  color: var(--c-brand);
}

.more-link:hover svg {
  transform: translateX(4px);
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 720px) {
  .hero {
    padding: 64px 0 56px;
  }
  .post-grid {
    grid-template-columns: 1fr;
  }
}
</style>
