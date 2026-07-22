// 调试：移动端 TOC/菜单失败 + 404 来源
import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844 })

page.on('response', (r) => {
  if (r.status() >= 400) console.log('HTTP', r.status(), r.url())
})
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message))

await page.goto('http://localhost:4173/posts/css-spring-easing', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 800))

const info = await page.evaluate(() => ({
  innerWidth: window.innerWidth,
  hasVpDoc: !!document.querySelector('.vp-doc'),
  h2Count: document.querySelectorAll('.vp-doc h2[id]').length,
  tocMobileExists: !!document.querySelector('.toc-mobile'),
  tocMobileBtnExists: !!document.querySelector('.toc-mobile-btn'),
  tocMobileBtnVisible: (() => {
    const el = document.querySelector('.toc-mobile-btn')
    return el ? getComputedStyle(el).display : 'no-element'
  })(),
  menuBtnDisplay: (() => {
    const el = document.querySelector('.menu-btn')
    return el ? getComputedStyle(el).display : 'no-element'
  })(),
  docHeader: document.querySelector('.doc-title')?.textContent ?? null,
}))
console.log(JSON.stringify(info, null, 2))

// 尝试点汉堡菜单
if (info.menuBtnDisplay !== 'none' && info.menuBtnDisplay !== 'no-element') {
  await page.click('.menu-btn')
  await new Promise((r) => setTimeout(r, 500))
  const screen = await page.evaluate(() => ({
    screenExists: !!document.querySelector('.screen'),
    screenLinks: document.querySelectorAll('.screen-link').length,
    bodyNoScroll: document.body.classList.contains('no-scroll'),
  }))
  console.log('menu after click:', JSON.stringify(screen))
}

await browser.close()
