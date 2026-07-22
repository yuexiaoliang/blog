<script setup lang="ts">
import { useData } from 'vitepress'

const { theme } = useData()
const footer = theme.value.footer as { message?: string; copyright?: string } | undefined
</script>

<template>
  <footer v-if="footer" class="footer">
    <div class="container footer-inner">
      <p v-if="footer.message" class="footer-message">{{ footer.message }}</p>
      <p v-if="footer.copyright" class="footer-copyright">{{ footer.copyright }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 72px;
  padding: 36px 0 44px;
  border-top: 1px solid var(--c-divider);
}

.footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

.footer-message {
  margin: 0;
  font-size: 13.5px;
  color: var(--c-text-2);
}

.footer-copyright {
  margin: 0;
  font-size: 12.5px;
  color: var(--c-text-3);
}
</style>
