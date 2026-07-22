<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onContentUpdated, useRoute } from 'vitepress'

interface Heading {
  id: string
  text: string
  level: number
  el: HTMLElement
}

defineProps<{ mobile?: boolean }>()

const headings = ref<Heading[]>([])
const activeId = ref('')
const route = useRoute()

function collect() {
  const els = document.querySelectorAll<HTMLElement>('.vp-doc h2[id], .vp-doc h3[id]')
  headings.value = [...els].map((el) => ({
    id: el.id,
    // 剔除锚点里的零宽字符与 # 记号
    text: (el.textContent || '').replace(/[#\u200b]/g, '').trim(),
    level: Number(el.tagName[1]),
    el,
  }))
  updateActive()
}

function updateActive() {
  const offset = 100
  let current = ''
  for (const h of headings.value) {
    if (h.el.getBoundingClientRect().top <= offset) current = h.id
  }
  if (current) activeId.value = current
}

function onScroll() {
  updateActive()
}

onMounted(() => {
  collect()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

// 内容渲染完成后重新收集标题
onContentUpdated(() => {
  nextTick(collect)
})

watch(
  () => route.path,
  () => {
    activeId.value = ''
    nextTick(collect)
  }
)

// 目录指示条的位置（每项固定行高 32px）
const ITEM_HEIGHT = 32
const markerStyle = computed(() => {
  const idx = headings.value.findIndex((h) => h.id === activeId.value)
  if (idx < 0) return { opacity: '0' } as const
  return { top: `${idx * ITEM_HEIGHT + 4}px`, opacity: '1' } as const
})

function onClick(id: string) {
  activeId.value = id
}
</script>

<template>
  <nav v-if="headings.length" class="toc" :class="{ mobile }" aria-label="文章目录">
    <p class="toc-title">目录</p>
    <div class="toc-list">
      <span class="toc-marker" aria-hidden="true" :style="markerStyle" />
      <a
        v-for="h in headings"
        :key="h.id"
        :href="`#${h.id}`"
        class="toc-link"
        :class="{ active: h.id === activeId, sub: h.level >= 3 }"
        @click="onClick(h.id)"
      >
        {{ h.text }}
      </a>
    </div>
  </nav>
</template>

<style scoped>
.toc-title {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-text-3);
}

.toc-list {
  position: relative;
  display: flex;
  flex-direction: column;
}

.toc-marker {
  position: absolute;
  left: -12px;
  width: 3px;
  height: 24px;
  border-radius: 3px;
  background: var(--c-brand);
  transition:
    top 0.32s var(--ease-spring-soft),
    opacity 0.25s var(--ease-ios);
}

.toc-link {
  display: block;
  height: 32px;
  line-height: 32px;
  padding-left: 2px;
  font-size: 13px;
  color: var(--c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    color var(--dur-fast) var(--ease-ios),
    transform var(--dur) var(--ease-spring-soft);
}

.toc-link.sub {
  padding-left: 16px;
  font-size: 12.5px;
}

.toc-link:hover {
  color: var(--c-text-1);
  transform: translateX(2px);
}

.toc-link.active {
  color: var(--c-brand);
  font-weight: 550;
}

/* 移动端：收起标题样式 */
.toc.mobile .toc-title {
  display: none;
}

.toc.mobile .toc-marker {
  left: -10px;
}
</style>
