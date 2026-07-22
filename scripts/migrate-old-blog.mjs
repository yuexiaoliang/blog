// 一次性迁移脚本：把 github.com/yuexiaoliang/blog 的文章同步进本项目
// 用法：node scripts/migrate-old-blog.mjs（仓库需先 clone 到 /tmp/oldblog 或系统临时目录 oldblog）
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const SRC = [tmpdir(), 'oldblog'].join('/')
if (!existsSync(SRC)) {
  console.error(`源仓库不存在：${SRC}，请先 git clone https://github.com/yuexiaoliang/blog ${SRC}`)
  process.exit(1)
}

const POSTS = [
  {
    src: 'Windows 怎样使用 Git 自动提交来备份重要文件',
    slug: 'windows-git-auto-backup',
    title: 'Windows 怎样使用 Git 自动提交来备份重要文件',
    date: '2023-01-08',
    tags: ['Git', 'Windows', '自动化'],
    description:
      '共享服务器中了勒索病毒之后，把共享前端目录初始化为 Git 仓库，用提交脚本加 Windows 任务计划程序实现无人值守的自动备份。',
  },
  {
    src: '中英双语的 git commit 助手-以通义千问为例',
    slug: 'bilingual-git-commit-assistant',
    title: '中英双语的 git commit 助手：以通义千问为例',
    date: '2024-06-12',
    tags: ['Git', 'AI', '效率'],
    description:
      '用通义千问加一份 prompt 打造 commit 助手，把随手写的提交信息一键转换为 Conventional Commits 规范格式并翻译为英文。',
  },
  {
    src: '写个 Markdown 自动生成个人在线简历以及PDF版',
    slug: 'markdown-to-resume',
    title: '写个 Markdown 自动生成个人在线简历以及 PDF 版',
    date: '2023-01-07',
    tags: ['Markdown', '开源', '工程化'],
    description:
      '用 Markdown 维护简历，基于 Vite 生成 HTML 与 PDF，配合 GitHub Actions 自动部署到 GitHub Pages，改简历只需两步。',
  },
  {
    src: '极佳、极简、通用的表格合并方案',
    slug: 'table-merge-solution',
    title: '极佳、极简、通用的表格（Table）合并单元格方案',
    date: '2022-10-04',
    tags: ['前端', 'JavaScript', '开源'],
    description:
      '用表格数据预先解析出一份虚拟表格，配合 UI 库的 span-method 实现通用单元格合并，已开源为 table-merge，支持多个 UI 框架。',
  },
  {
    src: '远程不方便，自己搭个内网穿透服务（frp）',
    slug: 'frp-intranet-tunnel',
    title: '远程开发不方便，自己搭个内网穿透服务（frp）',
    date: '2022-12-10',
    tags: ['内网穿透', 'frp', '运维'],
    description:
      '远程桌面开发太卡？基于 frp 自建内网穿透服务，代理公司测试环境的 http 地址，记录服务端与客户端的完整部署过程。',
  },
]

const DOCS_POSTS = 'docs/posts'
const PUBLIC_IMAGES = 'docs/public/images'

// 1. 清空占位示例文章
for (const f of readdirSync(DOCS_POSTS)) {
  if (f.endsWith('.md')) rmSync(join(DOCS_POSTS, f))
}
console.log('已清空占位示例文章')

// 2. 逐篇迁移
for (const post of POSTS) {
  const dir = join(SRC, post.src)
  let body = readFileSync(join(dir, 'README.md'), 'utf8').replace(/\r\n/g, '\n')

  // 去掉与标题重复的首个 h1
  body = body.replace(/^#\s+.+\n+/, '')

  // 重写图片引用：相对路径 → /images/<slug>/
  body = body
    .replace(/src="\.\/([^"]+)"/g, `src="/images/${post.slug}/$1"`)
    .replace(/]\((?!https?:|\/|#)([^)\s]+\.(?:png|gif|jpe?g|webp))\)/g, `](/images/${post.slug}/$1)`)

  const frontmatter = [
    '---',
    `title: ${JSON.stringify(post.title)}`,
    `date: ${post.date}`,
    `tags: [${post.tags.join(', ')}]`,
    `description: ${JSON.stringify(post.description)}`,
    '---',
    '',
  ].join('\n')

  writeFileSync(join(DOCS_POSTS, `${post.slug}.md`), frontmatter + body)

  // 复制图片资源（跳过封面图）
  const imgDir = join(PUBLIC_IMAGES, post.slug)
  mkdirSync(imgDir, { recursive: true })
  let imgs = 0
  for (const f of readdirSync(dir)) {
    if (!/\.(png|gif|jpe?g|webp)$/i.test(f)) continue
    if (f.startsWith('封面')) continue
    cpSync(join(dir, f), join(imgDir, f))
    imgs++
  }
  console.log(`✅ ${post.slug} (${post.date}, ${post.tags.join('/')}, ${imgs} 张图片)`)
}

console.log('\n迁移完成')
