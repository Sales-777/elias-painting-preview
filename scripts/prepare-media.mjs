import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import sharp from 'sharp'
import { groupCatalog } from './gallery-model.mjs'

const root = resolve(import.meta.dirname, '..')
const base = process.env.PAGES_BASE_PATH || '/'
if (!base.startsWith('/') || !base.endsWith('/') || base.includes('..')) {
  throw new Error('PAGES_BASE_PATH must start and end with / and contain no ..')
}
const catalog = JSON.parse(await readFile(resolve(root, 'docs/image-catalog.json'), 'utf8'))
const directory = resolve(root, 'public/media')
await mkdir(directory, { recursive: true })
await mkdir(resolve(root, 'src/content'), { recursive: true })
await mkdir(resolve(root, 'reports/phase-2'), { recursive: true })
const labels = {
  'IMG-001': 'Brick steps and paving', 'IMG-002': 'Decorative flake floor', 'IMG-003': 'Marble-look floor finish',
  'IMG-004': 'Garage floor detail', 'IMG-005': 'Blue garage floor', 'IMG-006': 'Floor coating with a roller',
  'IMG-009': 'Interior walls and staircase', 'IMG-010': 'Light gray garage floor', 'IMG-011': 'Geometric wallpaper',
  'IMG-012': 'Bedroom wall covering', 'IMG-013': 'Residential exterior', 'IMG-014': 'Ceiling preparation',
  'IMG-015': 'Published washing comparison — unverified', 'IMG-016': 'Cabinet finish samples',
  'IMG-017': 'Decorative floor detail', 'IMG-019': 'Garage interior and floor', 'IMG-020': 'Exterior at dusk',
  'IMG-021': 'Wall and arch preparation', 'IMG-022': 'Interior preparation and protection',
  'IMG-023': 'Warm-toned home interior', 'IMG-024': 'Sunlit interior and painted trim', 'IMG-025': 'Bedroom trim detail',
  'IMG-026': 'Interior staircase and trim', 'IMG-027': 'Dining room walls and trim', 'IMG-028': 'Blue-gray living room',
  'IMG-029': 'Painted walls and white wainscoting', 'IMG-030': 'Interior walls and windows', 'IMG-031': 'Two-tone wall finish',
  'IMG-032': 'Drywall preparation', 'IMG-033': 'Decorative ceiling in progress', 'IMG-034': 'Arches during preparation',
  'IMG-035': 'Hallway wall finish', 'IMG-036': 'Coffered ceiling and interior trim', 'IMG-037': 'Entryway and staircase',
  'IMG-038': 'Kitchen interior', 'IMG-039': 'Living room wall finish', 'IMG-040': 'Accent wall and fireplace',
  'IMG-041': 'Two-tone interior walls', 'IMG-042': 'Living room trim', 'IMG-043': 'Curved staircase',
  'IMG-044': 'Blue-toned bedroom', 'IMG-045': 'Interior walls and ceiling', 'IMG-046': 'Purple interior walls',
  'IMG-047': 'Staircase and handrail', 'IMG-048': 'Dining room interior', 'IMG-049': 'Entryway walls',
  'IMG-051': 'Flake floor in a garage', 'IMG-054': 'Industrial floor surface', 'IMG-055': 'Garage floor surface',
  'IMG-056': 'Speckled floor finish', 'IMG-057': 'Floor surface and columns', 'IMG-058': 'Coated exterior floor area',
  'IMG-059': 'Floor work in progress', 'IMG-060': 'Floor coating in progress', 'IMG-061': 'Dark garage floor',
  'IMG-062': 'Light decorative flake finish', 'IMG-068': 'Commercial interior and wall detail',
  'IMG-069': 'Commercial interior', 'IMG-071': 'Storefront exterior', 'IMG-074': 'Reception wall finish',
  'IMG-076': 'Building exterior and service vehicle', 'IMG-081': 'Workshop exterior',
}
const generated = {}
const report = { records: catalog.items.length, files: [], unchangedSources: true }
for (const item of catalog.items) {
  const source = resolve(root, item.path)
  const input = await readFile(source)
  const sha256 = createHash('sha256').update(input).digest('hex')
  if (sha256 !== item.sha256) throw new Error(`Source changed: ${item.id}`)
  if (['logo', 'brand-panel'].includes(item.role)) continue
  const widths = [...new Set([Math.min(480, item.width), Math.min(800, item.width), Math.min(1600, item.width)])].sort((a,b) => a-b)
  if (item.id === 'IMG-024' || item.id === 'IMG-006') widths.push(Math.min(2400, item.width))
  const variants = []
  for (const width of widths) {
    const filename = `${item.id}-${width}.webp`
    const file = resolve(directory, filename)
    let exists = true
    try { await stat(file) } catch { exists = false }
    if (!exists) await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: width > 800 ? 78 : 76 }).toFile(file)
    const info = await sharp(file).metadata()
    const bytes = (await stat(file)).size
    variants.push({ width: info.width, height: info.height, url: `${base}media/${filename}`, bytes })
  }
  generated[item.id] = {
    id: item.id, width: item.width, height: item.height,
    alt: labels[item.id] || 'Building facade and exterior finishes',
    category: item.category_candidate, sourceHash: sha256,
    src: variants[0].url, srcSet: variants.map(v => `${v.url} ${v.width}w`).join(', '),
    large: variants.find(v => v.width >= Math.min(1600,item.width))?.url || variants.at(-1).url,
    variants,
  }
  report.files.push({ id: item.id, source: item.path, sha256, variants })
}
for (const item of catalog.items.filter(i => i.role === 'logo')) {
  const dest = resolve(directory, `${item.id}.jpg`)
  await copyFile(resolve(root, item.path), dest)
  generated[item.id] = { id:item.id, width:item.width, height:item.height, src:`${base}media/${item.id}.jpg`, srcSet:'', large:`${base}media/${item.id}.jpg`, alt:item.id === 'IMG-008' ? 'Elias Painting tiger with ladder — original mark' : 'Tiger Epoxy Coating — original paw mark' }
}
const groups = groupCatalog(catalog.items)
const featured = ['IMG-024', 'IMG-029', 'IMG-028', 'IMG-006', 'IMG-062', 'IMG-077', 'IMG-022', 'IMG-021']
const gallery = groups.map(item => ({...generated[item.id], groupedIds:[item.id,...item.variants]})).sort((a,b) => {
  const rank = id => featured.includes(id) ? featured.indexOf(id) : 100 + Number(id.slice(4))
  return rank(a.id)-rank(b.id)
})
await writeFile(resolve(root, 'src/content/media.generated.json'), JSON.stringify(generated))
await writeFile(resolve(directory, 'gallery-index.json'), JSON.stringify(gallery.map(({sourceHash,variants,...item}) => item)))
await writeFile(resolve(root, 'reports/phase-2/media-derivatives.json'), JSON.stringify(report,null,2))
console.log(`Prepared ${Object.keys(generated).length} media entries; ${gallery.length} gallery groups from 79 photo candidates. Originals unchanged.`)
