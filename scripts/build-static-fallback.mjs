import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '..')
const { render } = await import(pathToFileURL(resolve(root, '.ssr/entry-server.js')).href)
const media = JSON.parse(await readFile(resolve(root, 'public/media/gallery-index.json'), 'utf8'))
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
let html = await readFile(resolve(root, 'dist/index.html'), 'utf8')
const links = ['residential','commercial','epoxy','unclassified'].map(category => `<details><summary>${category === 'unclassified' ? 'Other' : category[0].toUpperCase()+category.slice(1)}</summary>${media.filter(item => item.category === category).map(item => `<a href="${escape(item.large)}">${escape(item.alt)}</a>`).join('')}</details>`).join('')
html = html.replace('<!--app-html-->', render())
html = html.replace('</body>', `<noscript><section class="nojs-index" aria-label="Complete image collection"><h2>Image collection</h2><p>Project attribution and image rights await owner confirmation. Open an image to view it in full.</p>${links}</section><style>.menu-toggle,.gallery-filters,.gallery-count,.gallery-status{display:none!important}.primary-navigation{display:flex!important;position:static;flex-wrap:wrap;gap:8px 20px}.site-header{position:absolute;flex-wrap:wrap}.primary-navigation .button{margin-top:0}.layer-dimmer{opacity:0}.epoxy-visual{position:static}.layer-controls button{cursor:default}</style></noscript></body>`)
await writeFile(resolve(root, 'dist/index.html'), html)
console.log('Homepage prerendered; complete no-JS image index included on the same page. No extra pages created.')
