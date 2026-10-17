import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { groupCatalog, galleryPage } from '../scripts/gallery-model.mjs'

const catalog = JSON.parse(await readFile(new URL('../docs/image-catalog.json',import.meta.url),'utf8'))
test('Every photo candidate is represented exactly once, including grouped variants', () => {
  const groups = groupCatalog(catalog.items)
  const all = groups.flatMap(item => [item.id,...item.variants])
  assert.equal(groups.length,76)
  assert.equal(new Set(all).size,79)
  assert.equal(all.length,79)
  assert(!all.includes('IMG-007') && !all.includes('IMG-008') && !all.includes('IMG-018'))
  assert(!all.includes('IMG-015') && !all.includes('IMG-016'))
  assert.deepEqual(groups.find(item => item.id === 'IMG-002').variants,['IMG-050'])
  assert.deepEqual(groups.find(item => item.id === 'IMG-019').variants,['IMG-052'])
  assert.deepEqual(groups.find(item => item.id === 'IMG-003').variants,['IMG-053'])
})
test('Filtering covers the complete collection before the first batch is sliced', () => {
  const items = Array.from({length:40},(_,i) => ({id:`${i}`,category:i>=25 ? 'epoxy' : 'residential'}))
  const page = galleryPage(items,'Epoxy')
  assert.equal(page.total,15)
  assert.equal(page.items.length,12)
  assert.equal(page.items[0].id,'25')
  assert.equal(page.hasMore,true)
  assert.equal(galleryPage(items,'Epoxy',24).items.length,15)
  assert.equal(galleryPage(items,'Other').items.length,0)
})
