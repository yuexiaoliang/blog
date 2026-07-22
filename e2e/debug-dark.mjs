// 调试：暗色切换按钮点击行为
import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()

page.on('pageerror', (e) => console.log('PAGEERROR:', e.message))
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') console.log(m.type(), ':', m.text().slice(0, 220))
})

await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await page.waitForFunction(() => !!document.querySelector('#app').__vue_app__)
await new Promise((r) => setTimeout(r, 900))

const state = () =>
  page.evaluate(() => [
    document.documentElement.classList.contains('dark'),
    localStorage.getItem('vitepress-theme-appearance'),
  ])

console.log('before:', await state())
await page.click('.theme-toggle')
await new Promise((r) => setTimeout(r, 400))
console.log('after puppeteer click:', await state())
await page.evaluate(() => document.querySelector('.theme-toggle').click())
await new Promise((r) => setTimeout(r, 400))
console.log('after js click:', await state())

const info = await page.evaluate(() => {
  const el = document.querySelector('.theme-toggle')
  const b = el.getBoundingClientRect()
  const at = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)
  return { x: b.x, y: b.y, w: b.width, h: b.height, hit: at?.tagName + '.' + at?.className }
})
console.log('bbox/hit-test:', JSON.stringify(info))
await browser.close()
