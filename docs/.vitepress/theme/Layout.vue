<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import NavBar from './components/NavBar.vue'
import NavScreen from './components/NavScreen.vue'
import FooterBar from './components/FooterBar.vue'
import SearchDialog from './components/SearchDialog.vue'
import BackToTop from './components/BackToTop.vue'
import Home from './components/Home.vue'
import PostsPage from './components/PostsPage.vue'
import TagsPage from './components/TagsPage.vue'
import ArchivesPage from './components/ArchivesPage.vue'
import DocPage from './components/DocPage.vue'
import NotFound from './components/NotFound.vue'
import { useSearchShortcut } from './composables/useSearch'

const { frontmatter } = useData()
const route = useRoute()

const layout = computed(() => (frontmatter.value.layout as string) || 'doc')

useSearchShortcut()
</script>

<template>
  <div class="layout" :class="`layout--${layout}`">
    <NavBar />
    <NavScreen />

    <main class="main">
      <Transition name="page" mode="out-in">
        <Home v-if="layout === 'home'" key="home" />
        <PostsPage v-else-if="layout === 'posts'" key="posts" />
        <TagsPage v-else-if="layout === 'tags'" key="tags" />
        <ArchivesPage v-else-if="layout === 'archives'" key="archives" />
        <NotFound v-else-if="layout === 'not-found'" key="not-found" />
        <DocPage v-else :key="route.path" />
      </Transition>
    </main>

    <FooterBar />
    <SearchDialog />
    <BackToTop />
  </div>
</template>

<style>
.main {
  min-height: calc(100vh - var(--nav-height));
  padding-top: var(--nav-height);
}

/* 页面切换：克制地上浮淡入 */
.page-enter-active {
  transition:
    opacity 0.32s var(--ease-ios),
    transform 0.32s var(--ease-ios);
}
.page-leave-active {
  transition:
    opacity 0.16s var(--ease-ios),
    transform 0.16s var(--ease-ios);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
