export const categories = ['All', 'Residential', 'Commercial', 'Epoxy', 'Other']
export const batchSize = 12

export function groupCatalog(items) {
  const eligible = items.filter(item => item.role === 'photo-candidate')
  const canonical = eligible.filter(item => !item.duplicate_of)
  return canonical.map(item => ({
    ...item,
    variants: eligible.filter(variant => variant.duplicate_of === item.id).map(variant => variant.id),
  }))
}

export function filterGallery(items, category) {
  if (category === 'All') return items
  const key = category === 'Other' ? 'unclassified' : category.toLowerCase()
  return items.filter(item => item.category === key)
}

export function galleryPage(items, category, count = batchSize) {
  const filtered = filterGallery(items, category)
  return { total: filtered.length, items: filtered.slice(0, count), hasMore: filtered.length > count }
}
