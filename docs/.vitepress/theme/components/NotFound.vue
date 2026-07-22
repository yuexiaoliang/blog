<script setup lang="ts">
</script>

<template>
  <div class="not-found container">
    <p class="nf-code">404</p>
    <h1 class="nf-title">页面走丢了</h1>
    <p class="nf-desc">你要找的页面不存在，或者已经被移动到了别处。</p>
    <div class="nf-actions">
      <a class="nf-btn primary" href="/">回到首页</a>
      <a class="nf-btn" href="/posts">看看文章</a>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 120px 24px 80px;
  min-height: 56vh;
  justify-content: center;
}

.nf-code {
  margin: 0;
  font-size: clamp(4rem, 14vw, 6.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  background: linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: nf-in 0.6s var(--ease-spring-soft) both;
}

.nf-title {
  margin: 20px 0 0;
  font-size: 1.5rem;
  font-weight: 650;
  color: var(--c-text-1);
  animation: nf-in 0.6s var(--ease-ios) 0.08s both;
}

.nf-desc {
  margin: 12px 0 0;
  font-size: 15px;
  color: var(--c-text-2);
  animation: nf-in 0.6s var(--ease-ios) 0.14s both;
}

.nf-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  animation: nf-in 0.6s var(--ease-ios) 0.2s both;
}

.nf-btn {
  display: inline-flex;
  align-items: center;
  height: 42px;
  padding: 0 24px;
  font-size: 14.5px;
  font-weight: 550;
  color: var(--c-text-2);
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  transition:
    color var(--dur-fast) var(--ease-ios),
    border-color var(--dur-fast) var(--ease-ios),
    transform var(--dur) var(--ease-spring-soft),
    box-shadow var(--dur) var(--ease-ios);
}

.nf-btn:hover {
  color: var(--c-text-1);
  border-color: var(--c-border-strong);
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-rest);
}

.nf-btn:active {
  transform: scale(0.95);
  transition-duration: var(--dur-fast);
}

.nf-btn.primary {
  color: #fff;
  background: var(--c-brand);
  border-color: var(--c-brand);
}

.nf-btn.primary:hover {
  color: #fff;
  box-shadow: 0 6px 18px rgba(10, 132, 255, 0.35);
}

@keyframes nf-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
