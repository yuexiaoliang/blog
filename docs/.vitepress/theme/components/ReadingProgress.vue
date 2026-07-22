<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const progress = ref(0)
let onScroll: () => void

onMounted(() => {
  onScroll = () => {
    const el = document.documentElement
    const max = el.scrollHeight - el.clientHeight
    progress.value = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <div
    class="reading-progress"
    :style="{ transform: `scaleX(${progress})`, opacity: progress > 0.005 ? 1 : 0 }"
    aria-hidden="true"
  />
</template>

<style scoped>
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: 2.5px;
  transform-origin: left center;
  background: linear-gradient(90deg, #0a84ff, #5e5ce6);
  transition: opacity 0.4s var(--ease-ios);
  pointer-events: none;
}
</style>
