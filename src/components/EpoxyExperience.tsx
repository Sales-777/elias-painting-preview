import { useEffect, useRef, useState } from 'react'
import { epoxyStages } from '../content/site'
import { Arrow } from './Icon'
import { Photo } from './Photo'
import { LayerDiagram, layerNames, staticLayerPositions } from './LayerDiagram'

export function EpoxyExperience() {
  const [active, setActive] = useState(0)
  const [mode, setMode] = useState<'scroll' | 'manual'>('scroll')
  const [motionAllowed, setMotionAllowed] = useState(false)
  const [enhanced, setEnhanced] = useState(false)
  const steps = useRef<(HTMLLIElement | null)[]>([])
  const story = useRef<HTMLDivElement>(null)
  const diagram = useRef<SVGSVGElement>(null)
  const visual = useRef<HTMLDivElement>(null)
  const selectLayer = (index: number) => { setMode('manual'); setActive(index) }
  useEffect(() => {
    const element = visual.current
    if (!element) return
    // An oversized sticky panel aligns its bottom with the viewport, keeping
    // controls reachable on shorter desktops without an inner scroll area.
    const observer = new ResizeObserver(([entry]) => element.style.setProperty('--visual-height', `${entry.borderBoxSize[0]?.blockSize ?? element.offsetHeight}px`))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    setEnhanced(true)
    const media = window.matchMedia('(min-width: 1000px) and (prefers-reduced-motion: no-preference)')
    const update = () => setMotionAllowed(media.matches)
    update(); media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (mode !== 'scroll' || !motionAllowed) return
    const visibility = new Map<Element, number>()
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0))
      const current = [...visibility].filter(([,ratio]) => ratio > 0).sort((a,b) => b[1]-a[1])[0]
      if (current) setActive(Number((current[0] as HTMLElement).dataset.step))
    }, { rootMargin: '-25% 0px -35% 0px', threshold: [0, .25, .5, .75] })
    steps.current.forEach(step => step && observer.observe(step))
    return () => observer.disconnect()
  }, [mode, motionAllowed])
  useEffect(() => {
    const svg = diagram.current, element = story.current
    if (!svg || !element) return
    const layers = [...svg.querySelectorAll<SVGGElement>('[data-layer]')]
    const apply = (positions: number[]) => layers.forEach((layer, i) => { layer.style.transform = `translateY(${positions[i]}px)` })
    if (!motionAllowed) { svg.dataset.motion = 'static'; apply(staticLayerPositions); return }
    if (mode === 'manual') {
      svg.dataset.motion = 'manual'
      apply(staticLayerPositions.map((position, i) => position - (active === i ? 8 : 0)))
      return
    }
    svg.dataset.motion = 'scroll'
    let frame = 0, visible = false
    const update = () => {
      frame = 0
      if (!visible) return
      const rect = element.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, (window.innerHeight * .75 - rect.top) / (rect.height - window.innerHeight * .15)))
      const gap = 54 + 32 * Math.sin(Math.PI * progress)
      apply([300, 292 - gap, 276 - gap * 2, 269 - gap * 3])
      svg.dataset.separation = gap.toFixed(1)
    }
    const schedule = () => { if (!frame && visible) frame = requestAnimationFrame(update) }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) schedule()
    }, { rootMargin: '80px' })
    observer.observe(element)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => { observer.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); cancelAnimationFrame(frame) }
  }, [mode, active, motionAllowed])

  return <section id="epoxy" className="epoxy-section" aria-labelledby="epoxy-heading">
    <div className="epoxy-photo"><Photo id="IMG-006" sizes="100vw" position="42% 48%" /><div className="epoxy-photo-shade"/><div className="container epoxy-photo-heading"><h2 id="epoxy-heading">Look beneath<br />the finish.</h2><p>A closer look at epoxy flooring.</p></div></div>
    <div ref={story} className={`container epoxy-story ${mode === 'manual' ? 'is-manual' : ''}`}>
      <div className="epoxy-visual" ref={visual}>
        <div className="epoxy-visual-heading"><h3>Built in layers.</h3><p>The finish is only part of the story.</p></div>
        <LayerDiagram active={active} svgRef={diagram} onSelect={selectLayer} enhanced={enhanced}/>
        <div className="layer-controls" role="group" aria-label="Explore schematic layers">{epoxyStages.map((stage,i) => <button key={stage.id} type="button" disabled={!enhanced} aria-pressed={active === i} aria-controls="active-layer-detail" onClick={() => selectLayer(i)}><span className="control-number" data-material={i} aria-hidden="true">{String(i+1).padStart(2,'0')}</span><span>{layerNames[i].split(' · ')[0]}{i === 1 || i === 3 ? <small>Optional</small> : null}</span></button>)}</div>
        <div id="active-layer-detail" className="active-layer-detail" role="region" aria-label="Selected layer explanation" aria-live={mode === 'manual' ? 'polite' : 'off'} aria-atomic="true"><p className="selected-layer-title"><span>{String(active+1).padStart(2,'0')}</span>{epoxyStages[active].title}</p><p>{epoxyStages[active].text}</p></div>
        {mode === 'manual' && motionAllowed && <button className="scroll-follow" onClick={() => setMode('scroll')}>Follow the story as you scroll</button>}
        <p className="diagram-caption">Illustrative system; layers vary by project.<br />Schematic — not to scale.</p>
      </div>
      <div className="epoxy-narrative"><ol className="epoxy-steps">{epoxyStages.map((stage,i) => <li key={stage.id} id={`epoxy-step-${stage.id}`} ref={el => { steps.current[i] = el }} data-step={i} className={active === i ? 'active-step' : ''}><span className="step-layer-name">{String(i+1).padStart(2,'0')} / {layerNames[i]}</span><h3>{enhanced ? <button type="button" onClick={() => selectLayer(i)} aria-pressed={active === i} aria-controls="active-layer-detail">{stage.title}</button> : stage.title}</h3><p>{stage.text}</p>{i === 3 && <a href="#contact" className="text-link">Talk about your floor <Arrow diagonal /></a>}</li>)}</ol><p className="technical-note">A conceptual explanation, not a specification. The products and process used for a particular project must be confirmed with the applicator.</p></div>
    </div>
  </section>
}
