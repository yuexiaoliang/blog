import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import './styles/index.css'

// 完全自定义的主题：不复用默认主题的任何组件与样式。
export default {
  Layout,
  enhanceApp() {
    // 预留全局组件注册入口
  },
} satisfies Theme
