import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Arrow } from './Icon'
import { GalleryViewerBoundary, GalleryViewerFallback } from './GalleryViewerBoundary'

const Lightbox = lazy(() => import('./Lightbox'))
const filters = ['All', 'Residential', 'Commercial', 'Epoxy', 'Other']
export type GalleryItem = { id:string; width:number; height:number; alt:string; category:string; src:string; srcSet:string; large:string; groupedIds:string[] }

export function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [status, setStatus] = useState<'waiting'|'loading'|'ready'|'error'>('waiting')
  const [attempt, setAttempt] = useState(0)
  const [category, setCategory] = useState('All')
  const [count, setCount] = useState(12)
  const [selected, setSelected] = useState<string | null>(null)
  const section = useRef<HTMLElement>(null)
  const returnFocus = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect(); setStatus('loading')
      fetch(`${import.meta.env.BASE_URL}media/gallery-index.json`, { signal:controller.signal }).then(response => {
        if (!response.ok) throw new Error('Collection unavailable')
        return response.json()
      }).then(data => { setItems(data); setStatus('ready') }).catch(error => { if (error.name !== 'AbortError') setStatus('error') })
    }, { rootMargin:'600px' })
    if (section.current) observer.observe(section.current)
    return () => { observer.disconnect(); controller.abort() }
  }, [attempt])
  const filtered = useMemo(() => items.filter(item => category === 'All' || item.category === (category === 'Other' ? 'unclassified' : category.toLowerCase())), [items, category])
  function changeFilter(filter:string) { setCategory(filter); setCount(12) }
  function closeViewer() { setSelected(null); returnFocus.current?.focus() }
  const selectedItem = filtered.find(item => item.id === selected)
  return <section ref={section} className="gallery-section container section-space" id="gallery" aria-labelledby="gallery-heading">
    <div className="section-heading"><h2 id="gallery-heading">Our work.<br />A closer look.</h2><div><p>Explore interiors, exteriors and floor finishes from the existing image collection.</p><p className="collection-note">Preview collection: project attribution and image rights are awaiting owner confirmation.</p></div></div>
    <div className="gallery-toolbar"><div className="gallery-filters" role="group" aria-label="Filter image collection">{filters.map(filter => <button key={filter} aria-pressed={filter === category} onClick={() => changeFilter(filter)}>{filter}</button>)}</div><p className="gallery-count" aria-live="polite" aria-atomic="true">{status === 'ready' ? `${Math.min(count, filtered.length)} of ${filtered.length} images` : status === 'error' ? 'Collection unavailable' : 'Preparing the collection…'}</p></div>
    {status === 'error' ? <div className="gallery-status"><p>The collection could not be loaded.</p><button className="button button-dark" onClick={() => setAttempt(value => value+1)}>Try again <Arrow /></button></div> : <>
      <div key={category} className="gallery-grid" aria-busy={status !== 'ready'}>{filtered.slice(0,count).map(item => <figure className="gallery-item" key={item.id}>
        <button className="gallery-open" onClick={event => { returnFocus.current = event.currentTarget; setSelected(item.id) }} aria-label={`Open image: ${item.alt}`}><img src={item.src} srcSet={item.srcSet} sizes="(max-width: 767px) 100vw, 48vw" width={item.width} height={item.height} loading="lazy" decoding="async" alt={item.alt} /><span className="image-action"><Arrow diagonal /></span></button><figcaption><span>{item.alt}</span><span>{item.category === 'unclassified' ? 'Collection' : item.category.charAt(0).toUpperCase()+item.category.slice(1)}</span></figcaption>
      </figure>)}</div>
      {status !== 'ready' && <p className="gallery-status">Loading the collection…</p>}
      {status === 'ready' && filtered.length === 0 && <p className="gallery-status">There are no images in this category yet. Try another category.</p>}
      {filtered.length > count && <div className="load-more"><button className="button button-dark" onClick={() => setCount(value => value+12)}>Load more <Arrow /></button><p>Explore at your own pace.</p></div>}
    </>}
    <noscript><p>The interactive collection needs JavaScript. The complete collection is available in the image index below.</p></noscript>
    {selectedItem && <GalleryViewerBoundary fallback={<GalleryViewerFallback item={selectedItem} onClose={closeViewer} />}><Suspense fallback={<div role="status" className="lightbox-loading">Opening image… <button onClick={closeViewer}>Cancel</button></div>}><Lightbox items={filtered} selectedId={selectedItem.id} onChange={setSelected} onClose={closeViewer} /></Suspense></GalleryViewerBoundary>}
  </section>
}
