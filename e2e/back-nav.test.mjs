// E2E：验证客户端导航（尤其「返回上一页」）不白屏
// 用法：先 npm run build && npm run preview，再 node e2e/back-nav.test.mjs
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const results = []
const failures = []

async function step(name, fn) {
  try {
    const detail = (await fn()) ?? ''
    results.push(`  ✅ ${name}${detail ? ` (${detail})` : ''}`)
  } catch (e) {
    results.push(`  ❌ ${name} — ${e.message.split('\n')[0]}`)
    failures.push(name)
  }
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })

const consoleErrors = []
page.on('response', (r) => {
  if (r.status() >= 400 && !r.url().includes('favicon')) consoleErrors.push(`HTTP ${r.status()} ${r.url()}`)
})
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message))
page.on('console', (m) => {
  const text = m.text()
  if (text.includes('Hydration') || text.includes('[Vue warn]')) consoleErrors.push('VUE: ' + text.slice(0, 160))
})

const T = { timeout: 8000 }

/** 等待 Vue 完成水合（客户端 JS 真正运行），再等入场动画播完（卡片 opacity 动画 ~0.6s） */
async function hydrated() {
  await page.waitForFunction(() => !!document.querySelector('#app').__vue_app__, T)
  await new Promise((r) => setTimeout(r, 900))
}

// 1. 首页 → 点击文章卡片 → 正文
await page.goto(BASE + '/', { waitUntil: 'networkidle0' })
await step('首页加载并完成水合', async () => {
  await hydrated()
  return `${(await page.$$('.post-card')).length} 张卡片`
})
await step('首页 → 正文（点击卡片）', async () => {
  await page.click('.post-card')
  await page.waitForSelector('.doc-title', T)
  await hydrated()
  return await page.$eval('.doc-title', (el) => el.textContent.trim())
})

// 2. 浏览器后退 —— 原白屏复现点
await step('后退回首页（原白屏点）', async () => {
  await page.goBack()
  await page.waitForSelector('.post-card', T)
  await hydrated()
  return `${(await page.$$('.post-card')).length} 张卡片`
})

// 3. 正文 → 标签 → 后退
await page.goto(BASE + '/posts/hello-vitepress', { waitUntil: 'networkidle0' })
await hydrated()
await step('正文 → 标签页（点击底部标签）', async () => {
  await page.click('.footer-tag')
  await page.waitForSelector('.tag-chip.active', T)
  return await page.$eval('.tag-chip.active', (el) => el.textContent.trim())
})
await step('标签页 → 后退回正文', async () => {
  await page.goBack()
  await page.waitForSelector('.doc-title', T)
})

// 4. 文章间跳转 + 连续后退
await step('正文 A → 正文 B（经标签页进另一篇）', async () => {
  await page.click('.footer-tag')
  await page.waitForSelector('.post-row', T)
  await page.click('.post-row')
  await page.waitForSelector('.doc-title', T)
  return await page.$eval('.doc-title', (el) => el.textContent.trim())
})
await step('正文 B → 后退 → 标签页 → 后退 → 正文 A', async () => {
  await page.goBack()
  await page.waitForSelector('.tag-chip.active', T)
  await page.goBack()
  await page.waitForSelector('.doc-title', T)
})

// 5. 搜索：⌘K 快捷键 + 点击触发各测一次
await page.goto(BASE + '/', { waitUntil: 'networkidle0' })
await hydrated()
await step('⌘K 唤起搜索 → 输入 → 回车打开 → 后退回首页', async () => {
  await page.evaluate(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
  })
  await page.waitForSelector('.search-input', T)
  await page.type('.search-input', '暗色模式')
  await page.waitForSelector('.search-result', T)
  await page.keyboard.press('Enter')
  await page.waitForSelector('.doc-title', T)
  const title = await page.$eval('.doc-title', (el) => el.textContent.trim())
  await page.goBack()
  await page.waitForSelector('.post-card', T)
  return title
})
await step('点击搜索按钮唤起 → 点击结果 → 后退', async () => {
  await hydrated()
  await page.click('.search-trigger')
  await page.waitForSelector('.search-input', T)
  await page.type('.search-input', 'rebase')
  await page.waitForSelector('.search-result', T)
  await page.click('.search-result')
  await page.waitForSelector('.doc-title', T)
  await page.goBack()
  await page.waitForSelector('.post-card', T)
})

// 6. 主题切换后导航（不预设初始主题：断言「切换取反」且「导航后保持」）
await step('切换主题 → 进文章 → 后退（状态保持）', async () => {
  await hydrated()
  const before = await page.evaluate(() => document.documentElement.classList.contains('dark'))
  await page.click('.theme-toggle')
  await page.waitForFunction((b) => document.documentElement.classList.contains('dark') !== b, T, before)
  await page.click('.post-card')
  await page.waitForSelector('.doc-title', T)
  await page.goBack()
  await page.waitForSelector('.post-card', T)
  await hydrated()
  const after = await page.evaluate(() => document.documentElement.classList.contains('dark'))
  if (after !== !before) throw new Error('主题状态在导航后丢失')
  return after ? '暗色保持' : '亮色保持'
})

// 7. 移动端
await page.setViewport({ width: 390, height: 844 })
await step('移动端：正文目录折叠可用', async () => {
  await page.goto(BASE + '/posts/css-spring-easing', { waitUntil: 'networkidle0' })
  await hydrated()
  await page.waitForSelector('.toc-mobile-btn', T)
  await page.click('.toc-mobile-btn')
  await page.waitForSelector('.toc-collapse.open .toc-link', T)
  return `${(await page.$$('.toc-collapse .toc-link')).length} 个标题`
})
await step('移动端：汉堡菜单 → 导航 → 后退', async () => {
  await page.click('.menu-btn')
  await page.waitForSelector('.screen-link', T)
  await page.click('.screen-link:nth-child(3)')
  await page.waitForSelector('.tag-chip', T)
  await page.goBack()
  await page.waitForSelector('.doc-title', T)
})

await browser.close()

console.log('\n— E2E 结果 —')
console.log(results.join('\n'))
console.log(consoleErrors.length ? `\n资源/JS 错误:\n${consoleErrors.join('\n')}` : '\n无资源错误、无 JS 错误')
if (failures.length) {
  console.log(`\n${failures.length} 项失败`)
  process.exit(1)
}
console.log('\n全部通过')
