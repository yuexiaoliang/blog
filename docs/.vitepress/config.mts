import { defineConfig } from 'vitepress'

/**
 * 中文友好的分词器：西文按词切分，中文切成二元组（bigram）。
 * 注意：该实现与 SearchDialog.vue 中客户端 loadJSON 使用的分词器必须完全一致，
 * 否则「建索引用 A 分词、查询用 B 分词」会导致查不到结果。
 */
export function tokenize(text: string): string[] {
  const tokens: string[] = []
  const CJK = '㐀-鿿豈-﫿'
  const segments = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []
  for (const seg of segments) {
    const parts = seg.match(new RegExp(`[${CJK}]+|[^${CJK}]+`, 'g')) || []
    for (const part of parts) {
      if (new RegExp(`^[${CJK}]+$`).test(part)) {
        if (part.length === 1) tokens.push(part)
        else for (let i = 0; i < part.length - 1; i++) tokens.push(part.slice(i, i + 2))
      } else {
        tokens.push(part)
      }
    }
  }
  return tokens
}

// 自定义主题的全部配置项都挂在 themeConfig 下，
// 与 VitePress 默认主题的配置互不依赖。
export default defineConfig({
  lang: 'zh-CN',
  title: '拾光',
  description: '一个记录技术与思考的安静角落',
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#fbfbfd' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }],
  ],

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    image: { lazyLoading: true },
  },

  themeConfig: {
    search: {
      provider: 'local',
      options: {
        /**
         * 把 frontmatter 的标题与摘要注入搜索索引。
         * VitePress 默认按「正文标题」切分章节，frontmatter 里的 title（正文无 h1）
         * 不会进入索引，导致按文章标题搜不到。这里在渲染结果前合成一个置顶标题章节。
         */
        async _render(md_src: string, env: any, md: any) {
          const html = md.render(md_src, env)
          const fm = env.frontmatter || {}
          if (!fm.title) return html
          const escape = (s: string) =>
            String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          const head =
            `<h1 id="top">${escape(fm.title)}<a class="header-anchor" href="#" aria-hidden="true">#</a></h1>` +
            (fm.description ? `<p>${escape(fm.description)}</p>` : '')
          return head + html
        },
        miniSearch: {
          // 构建期建索引使用的分词器（客户端需保持一致）
          options: { tokenize },
        },
      },
    },

    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts' },
      { text: '标签', link: '/tags' },
      { text: '归档', link: '/archives' },
      { text: '关于', link: '/about' },
    ],

    // 以下为自定义主题私有配置
    site: {
      name: '拾光',
      tagline: '记录技术与思考的安静角落',
      author: '拾光',
      socials: [
        { icon: 'github', label: 'GitHub', link: 'https://github.com/vuejs/vitepress' },
        { icon: 'mail', label: '邮箱', link: 'mailto:hi@shiguang.dev' },
      ],
    },

    footer: {
      message: '用心书写，慢慢积累',
      copyright: 'Copyright © 2026 拾光 · 基于 VitePress 构建',
    },
  } as any,
})
