import type { CSSProperties } from 'react'
import media from '../content/media.generated.json'

export type AssetId = keyof typeof media
export function asset(id: string) { return media[id as AssetId] }

export function Photo({ id, className = '', sizes = '(max-width: 767px) 100vw, 50vw', priority = false, position, alt }: {
  id: string; className?: string; sizes?: string; priority?: boolean; position?: string; alt?: string
}) {
  const image = asset(id)
  return <img src={image.src} srcSet={image.srcSet || undefined} sizes={image.srcSet ? sizes : undefined} width={image.width} height={image.height} alt={alt ?? image.alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" className={className} style={position ? { objectPosition: position } as CSSProperties : undefined} />
}
