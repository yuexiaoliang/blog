<script setup lang="ts">
defineProps<{ title: string; description?: string; count?: number }>()
</script>

<template>
  <header class="page-header">
    <h1 class="page-title">{{ title }}</h1>
    <p v-if="description || count !== undefined" class="page-desc">
      {{ description }}
      <span v-if="count !== undefined" class="page-count">{{ count }}</span>
    </p>
  </header>
</template>

<style scoped>
.page-header {
  padding: 64px 0 36px;
  animation: fade-up 0.5s var(--ease-ios) both;
}

.page-title {
  margin: 0;
  font-size: clamp(1.7rem, 4vw, 2.1rem);
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--c-text-1);
}

.page-desc {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0 0;
  font-size: 14.5px;
  color: var(--c-text-2);
}

.page-count {
  display: inline-block;
  padding: 1px 10px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-brand-deep);
  background: var(--c-brand-softer);
  border-radius: 999px;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
