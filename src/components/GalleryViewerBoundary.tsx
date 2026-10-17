import { Component, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { GalleryItem } from './Gallery'
import { CloseIcon } from './Icon'

// A rejected lazy import must only replace the viewer, never the homepage.
export class GalleryViewerBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export function GalleryViewerFallback({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [imageFailed, setImageFailed] = useState(false)
  useEffect(() => {
    dialog.current?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])
  function close() { dialog.current?.close(); onClose() }
  return <dialog ref={dialog} className="lightbox viewer-fallback" aria-labelledby="viewer-fallback-title" aria-describedby="viewer-fallback-message"
    onCancel={event => { event.preventDefault(); close() }}
    onClick={event => { if (event.target === event.currentTarget) close() }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return
      const controls = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]') ?? [])]
      const first = controls[0], last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }}>
    <div className="lightbox-top"><p>Simple image view</p><button className="icon-button" onClick={close} aria-label="Close image"><CloseIcon /></button></div>
    <div className="lightbox-stage">{imageFailed ? <p>This image could not be loaded. Close this view to keep browsing the collection.</p> : <img src={item.large} width={item.width} height={item.height} alt={item.alt} onError={() => setImageFailed(true)} />}</div>
    <div className="lightbox-bottom"><div><h2 id="viewer-fallback-title">{item.alt}</h2><p id="viewer-fallback-message" role="alert">The full image viewer could not load. You can still browse the collection or open this image directly.</p><div className="viewer-fallback-actions"><a className="button button-light" href={item.large} target="_blank" rel="noopener noreferrer">Open image directly</a><button className="button button-light" onClick={() => window.location.reload()}>Reload page</button></div></div></div>
  </dialog>
}
