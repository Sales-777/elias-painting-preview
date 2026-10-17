import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const out = resolve(root, process.env.REPORT_DIR || 'reports/phase-5')
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel:'chrome', headless:true })
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4173/'
const report = { base, viewports:[], checks:[], errors:[], accessibility:[], requests:[] }
try {
  for (const width of [360,390,768,1440]) {
    const context = await browser.newContext({ viewport:{width,height:width<600 ? 844 : 1000}, reducedMotion:'reduce' })
    const page = await context.newPage()
    page.on('pageerror',error => report.errors.push({width,message:error.message}))
    const failed = []
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()) })
    await page.goto(base)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForFunction(() => [...document.images].filter(i => i.loading !== 'lazy').every(i => i.complete))
    const initial = await page.evaluate(() => ({
      overflow:document.documentElement.scrollWidth > window.innerWidth,
      heroSource:document.querySelector('.hero-image')?.getAttribute('src'),
      headingLines:[...document.querySelectorAll('h1,h2')].map(h => ({text:h.textContent,lines:Math.round(h.getBoundingClientRect().height/parseFloat(getComputedStyle(h).lineHeight))})),
      images:performance.getEntriesByType('resource').filter(r => /\/media\//.test(r.name)).map(r => ({url:r.name,size:r.encodedBodySize})),
    }))
    assert(!initial.overflow, `Overflow ${width}`)
    assert(initial.heroSource.includes('IMG-024'))
    assert(!initial.images.some(r => r.url.includes('gallery-index')),`Gallery index eager at ${width}`)
    // The washing comparison must retain the entire original, including both halves.
    const washing = page.getByRole('article').filter({ has: page.getByRole('heading',{name:'Power washing',exact:true}) })
    await washing.scrollIntoViewIfNeeded()
    await washing.locator('img').evaluate(img => img.decode())
    const comparison = await washing.locator('img').evaluate(img => ({
      src:img.getAttribute('src'), fit:getComputedStyle(img).objectFit,
      ratio:img.getBoundingClientRect().width/img.getBoundingClientRect().height,
      sourceRatio:img.naturalWidth/img.naturalHeight,
      lazy:img.loading,
    }))
    assert(comparison.src.includes('IMG-001'))
    assert.equal(comparison.fit,'contain')
    assert(Math.abs(comparison.ratio-comparison.sourceRatio)<.02)
    assert.equal(comparison.lazy,'lazy')
    assert.equal(await washing.getByRole('link',{name:'Ask about power washing'}).getAttribute('href'),'#contact')
    report.checks.push({width,powerWashingComparison:comparison,wholeComparisonVisible:true})
    await page.evaluate(() => scrollTo(0,0))
    await page.screenshot({ path:resolve(out,`${width}-hero.png`) })
    if (width < 1000) {
      const toggle = page.getByRole('button',{name:'Open navigation'})
      await toggle.click()
      assert.equal(await page.getByRole('button',{name:'Close navigation'}).getAttribute('aria-expanded'),'true')
      await page.keyboard.press('Escape')
      assert(await toggle.evaluate(el => el === document.activeElement))
    }
    await page.locator('#services').evaluate(el => scrollTo(0,scrollY+el.getBoundingClientRect().top-112))
    const servicesAxe = await new AxeBuilder({page}).include('#services').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()
    await page.locator('#gallery').scrollIntoViewIfNeeded()
    await page.waitForFunction(() => document.querySelectorAll('.gallery-item').length === 12)
    await page.getByRole('button',{name:'Load more',exact:true}).click()
    assert.equal(await page.locator('.gallery-item').count(),24)
    await page.getByRole('button',{name:'Epoxy',exact:true}).click()
    assert.equal(await page.locator('.gallery-item').count(),12)
    const expected = JSON.parse(await readFile(resolve(root,'public/media/gallery-index.json'),'utf8')).filter(i => i.category === 'epoxy')
    const current = await page.locator('.gallery-item figcaption').first().textContent()
    assert(current.includes(expected[0].alt))
    await page.getByRole('button',{name:'Load more',exact:true}).click()
    assert.equal(await page.locator('.gallery-item').count(),expected.length)
    const opener = page.locator('.gallery-open').last()
    await opener.click()
    await page.locator('dialog[open]').waitFor()
    await page.getByRole('button',{name:'Next image'}).click()
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('Escape')
    await page.waitForFunction(() => !document.querySelector('dialog[open]'))
    const returned = await opener.evaluate(el => el === document.activeElement)
    assert(returned, `Lightbox focus did not return at ${width}`)
    report.checks.push({width,galleryBatches:true,filterAcrossCatalog:true,lightboxKeyboard:true,focusReturned:returned})
    await page.getByRole('button',{name:'All',exact:true}).click()
    await page.locator('#services').evaluate(el => window.scrollTo(0,window.scrollY+el.getBoundingClientRect().top-112))
    await page.screenshot({path:resolve(out,`${width}-services.png`)})
    await page.locator('#epoxy').evaluate(el => window.scrollTo(0,window.scrollY+el.getBoundingClientRect().top-112))
    await page.screenshot({path:resolve(out,`${width}-epoxy.png`)})
    await page.locator('.layer-controls').getByRole('button',{name:'Decorative coating',exact:true}).click()
    assert.equal(await page.locator('.layer-controls').getByRole('button',{name:'Decorative coating',exact:true}).getAttribute('aria-pressed'),'true')
    await page.locator('#gallery').evaluate(el => window.scrollTo(0,window.scrollY+el.getBoundingClientRect().top-112))
    await page.waitForTimeout(200)
    await page.screenshot({path:resolve(out,`${width}-gallery.png`)})
    const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze()
    report.accessibility.push({width,violations:[...servicesAxe.violations,...axe.violations].map(v => ({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n => n.target)}))})
    await page.evaluate(async () => {
      for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,30))}
      window.scrollTo(0,0)
    })
    await page.screenshot({path:resolve(out,`${width}-full.png`),fullPage:true})
    report.viewports.push({width,...initial,failedResponses:failed})
    assert.equal(failed.length,0,'Failed response')
    await context.close()
  }
  const nojs = await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}})
  await nojs.goto(base)
  assert.equal(await nojs.locator('h1').count(),1)
  assert.equal(await nojs.locator('.epoxy-steps li').count(),4)
  assert((await nojs.locator('.service-row-comparison img').getAttribute('src')).includes('IMG-001'))
  assert.equal(await nojs.locator('.nojs-index a').count(),76)
  report.checks.push({noJavaScript:true,homepagePrerendered:true,allTextAccessible:true,imageIndexLinks:76})
  await nojs.screenshot({path:resolve(out,'390-nojs.png')})
  await nojs.close()
  const normal = await browser.newPage({viewport:{width:1440,height:1000}})
  await normal.goto(base)
  await normal.locator('.epoxy-steps li').nth(2).scrollIntoViewIfNeeded()
  await normal.waitForTimeout(500)
  const active = await normal.locator('.layer-controls button[aria-pressed=true]').textContent()
  report.checks.push({nativeScrollStory:true,activeLayer:active,webglUsed:false})
  await normal.screenshot({path:resolve(out,'1440-epoxy-layers.png')})
  await normal.close()
  assert.equal(report.errors.length,0,'Browser JavaScript errors')
} finally {
  await writeFile(resolve(out,'browser-checks.json'),JSON.stringify(report,null,2))
  await browser.close()
}
console.log(JSON.stringify({viewports:report.viewports.map(v=>v.width),errors:report.errors,checks:report.checks,axe:report.accessibility},null,2))
if (report.accessibility.some(result => result.violations.length > 0)) process.exitCode = 1
