import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'

const root = resolve(import.meta.dirname, '..')
const out = resolve(root, process.env.REPORT_DIR || 'reports/post-audit-2026-10-17')
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4173/'
const dist = resolve(root, process.env.DIST_DIR || 'dist')
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const report = { base, checks:[], errors:[], expectedFaultErrors:[], accessibility:[] }
await mkdir(out, { recursive:true })
const browser = await chromium.launch({channel:'chrome',headless:true})
const hash = value => createHash('sha256').update(value).digest('hex')
async function gallery(page) {
  await page.locator('#gallery').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => document.querySelectorAll('.gallery-item').length === 12)
}
async function axe(page, selector, label) {
  const result = await new AxeBuilder({page}).include(selector).withTags(tags).analyze()
  const violations = result.violations.map(v => ({id:v.id,impact:v.impact,targets:v.nodes.map(n => n.target)}))
  report.accessibility.push({label,violations})
  assert.deepEqual(violations, [], `Accessibility: ${label}`)
}
try {
  for (const width of [320,360,390,768,1024,1440,1920]) {
    const context = await browser.newContext({viewport:{width,height:width<600?844:1000},reducedMotion:'reduce',hasTouch:width<600})
    const page = await context.newPage()
    page.on('pageerror',e => report.errors.push({width,message:e.message}))
    await page.goto(base)
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow')
    const notice = await page.locator('.demo-notice').boundingBox()
    assert(notice && notice.y >= 0 && notice.y+notice.height < (width<600?844:1000), 'Demo notice outside first viewport')
    assert.match(await page.locator('.demo-notice').innerText(), /Independent design preview\.\s*Not the official website\./)
    assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Overflow ${width}`)
    assert.equal(await page.locator('#contact a[href^="https://wa.me/"]').getAttribute('href'),'https://wa.me/19082564717')
    assert.equal(await page.locator('a[href^="tel:"],a[href^="mailto:"],form').count(),0)
    await page.getByRole('link',{name:'Explore the possibilities',exact:true}).waitFor()
    await page.getByRole('link',{name:/^Elias Painting Painting & finishes$/}).waitFor()
    await page.getByRole('link',{name:/^Interior & exterior painting/}).waitFor()
    await page.getByRole('link',{name:/^Epoxy flooring/}).waitFor()
    for (const selector of ['.site-header','#home','#services']) {
      await page.locator(selector).scrollIntoViewIfNeeded()
      await axe(page,selector,`${width} ${selector}`)
    }
    if ([390,1440].includes(width)) {
      await page.evaluate(() => scrollTo(0,0))
      await page.screenshot({path:resolve(out,`${width}-hero.png`)})
      await gallery(page)
      const catalog = await (await context.request.get(new URL('media/gallery-index.json',base).href)).json()
      const counts = []
      for (const category of ['All','Residential','Commercial','Epoxy','Other']) {
        await page.locator('.gallery-filters').getByRole('button',{name:category,exact:true}).click()
        while (await page.getByRole('button',{name:'Load more',exact:true}).count()) await page.getByRole('button',{name:'Load more',exact:true}).click()
        const expected = catalog.filter(item => category==='All' || item.category===(category==='Other'?'unclassified':category.toLowerCase())).length
        assert.equal(await page.locator('.gallery-item').count(), expected)
        const opener = page.locator('.gallery-open').last()
        await opener.click()
        await page.locator('dialog[open] .lightbox-stage img').evaluate(img => img.decode())
        await page.getByRole('button',{name:'Next image',exact:true}).click()
        await page.keyboard.press('ArrowLeft')
        await page.keyboard.press('Escape')
        assert(await opener.evaluate(el => el===document.activeElement))
        counts.push({category,count:expected})
      }
      await page.locator('.gallery-filters').getByRole('button',{name:'All',exact:true}).click()
      while (await page.getByRole('button',{name:'Load more',exact:true}).count()) await page.getByRole('button',{name:'Load more',exact:true}).click()
      for (const [index,item] of catalog.entries()) {
        if (item.groupedIds.length<2) continue
        await page.locator('.gallery-open').nth(index).click()
        for (let variant=0;variant<item.groupedIds.length;variant++) {
          await page.locator('.variant-controls button').nth(variant).click()
          await page.locator('.lightbox-stage img').evaluate(img => img.decode())
        }
        await page.keyboard.press('Escape')
      }
      await page.locator('.epoxy-story').scrollIntoViewIfNeeded()
      const before = await page.locator('[data-layer]').evaluateAll(els => els.map(el => getComputedStyle(el).transform))
      for (let step=0;step<4;step++) {
        const button = page.locator('.layer-controls button').nth(step)
        if(width<600) await button.tap(); else await button.click()
        assert.equal(await button.getAttribute('aria-pressed'),'true')
        assert.equal(await page.locator('.epoxy-steps .active-step').getAttribute('data-step'),String(step))
      }
      assert.deepEqual(await page.locator('[data-layer]').evaluateAll(els => els.map(el => getComputedStyle(el).transform)),before)
      await axe(page,'.epoxy-story',`${width} epoxy labels`)
      await page.screenshot({path:resolve(out,`${width}-epoxy.png`)})
      report.checks.push({width,counts,groupedVersions:true,epoxyTouchKeyboardStatic:true})
    }
    await context.close()
    report.checks.push({width,demoNoticeInFirstViewport:true,namesMatchVisibleText:true,noindex:true})
  }
  // Repeat the exact failure from the audit, in fresh contexts (no warm module cache).
  for (const width of [390,1440]) {
    const context = await browser.newContext({viewport:{width,height:width<600?844:1000},reducedMotion:'reduce'})
    const page = await context.newPage()
    page.on('pageerror',error => report.expectedFaultErrors.push(error.message))
    await page.route('**/Lightbox-*.js',route => route.abort('failed'))
    await page.goto(base); await gallery(page)
    const opener = page.locator('.gallery-open').first()
    await opener.click()
    await page.locator('dialog.viewer-fallback[open]').waitFor()
    assert.equal(await page.locator('main').count(),1)
    await page.locator('.viewer-fallback img').evaluate(img => img.decode())
    const direct = page.getByRole('link',{name:'Open image directly',exact:true})
    assert.equal((await context.request.get(new URL(await direct.getAttribute('href'),base).href)).status(),200)
    for(let n=0;n<8;n++) {
      await page.keyboard.press('Tab')
      assert(await page.locator('.viewer-fallback').evaluate(el => el.contains(document.activeElement)), 'Fallback focus escaped')
    }
    await axe(page,'.viewer-fallback',`${width} module failure fallback`)
    await page.screenshot({path:resolve(out,`${width}-viewer-fallback.png`)})
    await page.keyboard.press('Escape')
    assert(await opener.evaluate(el => el===document.activeElement))
    assert.equal(await page.evaluate(() => document.body.style.overflow),'')
    await opener.click()
    await page.getByRole('button',{name:'Close image',exact:true}).click()
    await page.getByRole('button',{name:'Epoxy',exact:true}).click()
    assert.equal(await page.locator('.gallery-item').count(),12)
    await page.locator('.gallery-open').first().click()
    await page.unroute('**/Lightbox-*.js')
    await page.getByRole('button',{name:'Reload page',exact:true}).click()
    await page.waitForLoadState('networkidle')
    await gallery(page)
    await page.locator('.gallery-open').first().click()
    await page.locator('dialog[open]:not(.viewer-fallback)').waitFor()
    await page.keyboard.press('Escape')
    report.checks.push({width,moduleFailureContained:true,imageFallback:true,focusAndEscape:true,filtersAfterFailure:true,reloadRecovery:true})
    await context.close()
  }
  const pending = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
  const slow = await pending.newPage()
  let held
  await slow.route('**/Lightbox-*.js',route => { held=route })
  await slow.goto(base); await gallery(slow)
  const opener = slow.locator('.gallery-open').first()
  await opener.click(); await slow.getByRole('button',{name:'Cancel',exact:true}).click()
  assert(await opener.evaluate(el => el===document.activeElement))
  assert.equal(await slow.locator('main').count(),1)
  await held?.abort(); await pending.close()
  report.checks.push({slowViewerCanBeCancelled:true})
  const request = await browser.newContext()
  const media = JSON.parse(await readFile(resolve(dist,'media/gallery-index.json'),'utf8'))
  const featured = JSON.parse(await readFile(resolve(dist,'..','src/content/media.generated.json'),'utf8'))
  const urls = new Set()
  for(const item of [...media,...Object.values(featured)]) {
    urls.add(item.src); urls.add(item.large)
    for(const source of item.srcSet?.split(',') || []) if(source.trim()) urls.add(source.trim().split(/\s+/)[0])
    for(const id of item.groupedIds || []) urls.add(`${new URL('media/',base).pathname}${id}-${Math.min(1600,item.width)}.webp`)
  }
  const actualUrls=[...urls].filter(Boolean)
  for(const src of actualUrls) {
    const url=new URL(src,base), response=await request.request.get(url.href)
    assert.equal(response.status(),200,src)
    const filename=url.pathname.split('/media/')[1]
    assert.equal(hash(await response.body()),hash(await readFile(resolve(dist,'media',filename))),src)
  }
  const icon = await request.request.get(new URL('media/IMG-008.jpg',base).href)
  assert.equal(icon.status(),200)
  report.checks.push({verifiedMediaUrls:actualUrls.length,allMediaMatchDistribution:true,favicon:true})
  await request.close()
  assert.deepEqual(report.errors,[],'Unexpected JavaScript errors in normal use')
} finally {
  await browser.close()
  await writeFile(resolve(out,'demo-readiness.json'),JSON.stringify(report,null,2))
}
console.log(JSON.stringify({base,checks:report.checks,accessibilityScans:report.accessibility.length,normalErrors:report.errors},null,2))
