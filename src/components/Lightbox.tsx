import { useEffect, useRef, useState } from 'react'
import type { GalleryItem } from './Gallery'
import { Arrow, CloseIcon } from './Icon'

export default function Lightbox({ items, selectedId, onClose, onChange }: { items:GalleryItem[]; selectedId:string; onClose:()=>void; onChange:(id:string)=>void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const index = items.findIndex(item => item.id === selectedId)
  const item = items[index]
  const [variant, setVariant] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const currentId = variant ?? item.id
  const src = currentId === item.id ? item.large : `${import.meta.env.BASE_URL}media/${currentId}-${Math.min(1600,item.width)}.webp`
  function navigate(offset:number) { setVariant(null); setFailed(false); onChange(items[(index+offset+items.length)%items.length].id) }
  function close() { dialog.current?.close(); onClose() }
  useEffect(() => {
    dialog.current?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])
  return <dialog ref={dialog} className="lightbox" aria-labelledby="lightbox-title" onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) close() }} onKeyDown={event => {
    if (event.key === 'Tab') {
      const controls = [...(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])]
      const first = controls[0], last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1) }
    if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1) }
  }}>
    <div className="lightbox-top"><p aria-live="polite">{index+1} / {items.length}</p><button className="icon-button" onClick={close} aria-label="Close image"><CloseIcon /></button></div>
    <div className="lightbox-stage">{failed ? <p>Image could not be loaded. <button onClick={() => { setFailed(false); setVariant(null) }}>Try the main image</button></p> : <img key={src} src={src} width={item.width} height={item.height} alt={item.alt} onError={() => setFailed(true)} />}</div>
    <div className="lightbox-bottom"><div><h2 id="lightbox-title">{item.alt}</h2><p>From the existing site; project attribution under review.</p>{item.groupedIds.length > 1 && <div className="variant-controls" aria-label="Grouped image versions">{item.groupedIds.map((id,i) => <button key={id} aria-pressed={id === currentId} onClick={() => { setFailed(false); setVariant(id) }}>{i === 0 ? 'Main image' : `Version ${i+1}`}</button>)}</div>}</div><div className="lightbox-navigation"><button className="icon-button" onClick={() => navigate(-1)} aria-label="Previous image"><Arrow className="arrow-back" /></button><button className="icon-button" onClick={() => navigate(1)} aria-label="Next image"><Arrow /></button></div></div>
  </dialog>
}
