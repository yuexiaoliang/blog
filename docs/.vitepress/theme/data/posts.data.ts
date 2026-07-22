import { createContentLoader } from 'vitepress'

export interface Post {
  title: string
  url: string
  date: {
    /** 用于排序的时间戳 */
    time: number
    /** YYYY-MM-DD */
    display: string
    /** YYYY */
    year: string
    /** MM-DD */
    short: string
  }
  tags: string[]
  description: string
  /** 正文字数（估算） */
  words: number
}

function parseDate(raw: unknown) {
  const d = raw instanceof Date ? raw : new Date(String(raw ?? Date.now()))
  const time = d.getTime()
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = d.getUTCFullYear()
  const m = pad(d.getUTCMonth() + 1)
  const day = pad(d.getUTCDate())
  return { time, display: `${y}-${m}-${day}`, year: String(y), short: `${m}-${day}` }
}

function countWords(src: string) {
  const text = src
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~\-|!]/g, '')
    .replace(/\s+/g, '')
  return text.length
}

export default createContentLoader<Post>('posts/**/*.md', {
  includeSrc: true,
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter, src }) => ({
        title: frontmatter.title ?? '未命名文章',
        url,
        date: parseDate(frontmatter.date),
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        description: frontmatter.description ?? '',
        words: countWords(src ?? ''),
      }))
      .sort((a, b) => b.date.time - a.date.time)
  },
})
