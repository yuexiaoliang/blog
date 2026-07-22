<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const visible = ref(false)
let onScroll: () => void

onMounted(() => {
  onScroll = () => {
    visible.value = window.scrollY > 600
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <Transition name="pop">
    <button
      v-if="visible"
      class="back-to-top"
      aria-label="回到顶部"
      title="回到顶部"
      @click="backToTop"
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 16V4M10 4l-5 5M10 4l5 5"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 26px;
  bottom: 30px;
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: var(--c-text-2);
  background: color-mix(in srgb, var(--c-bg-elevated) 82%, transparent);
  border: 1px solid var(--c-border);
  border-radius: 50%;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: var(--card-shadow-rest);
  transition:
    color var(--dur-fast) var(--ease-ios),
    border-color var(--dur-fast) var(--ease-ios),
    box-shadow var(--dur) var(--ease-ios);
}

.back-to-top:hover {
  color: var(--c-brand);
  border-color: var(--c-brand);
  box-shadow: var(--card-shadow-hover);
}

.back-to-top:active {
  transform: scale(0.9);
}

.back-to-top svg {
  width: 18px;
  height: 18px;
}

/* 弹性出现/收起 */
.pop-enter-active {
  transition:
    opacity 0.25s var(--ease-ios),
    transform 0.4s var(--ease-spring);
}
.pop-leave-active {
  transition:
    opacity 0.18s var(--ease-ios),
    transform 0.18s var(--ease-ios);
}
.pop-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.6);
}
.pop-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.8);
}
</style>
