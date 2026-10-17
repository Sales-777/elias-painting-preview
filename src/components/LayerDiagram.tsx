import type { RefObject } from 'react'

// Shared camera; depths are drawing units, never product dimensions.
export const staticLayerPositions = [300, 210, 120, 30]
export const layerNames = ['Concrete substrate', 'Primer · optional', 'Decorative coating', 'Protective finish · optional']
const labels = [['Concrete', 'substrate'], ['Primer', 'optional'], ['Decorative', 'coating'], ['Protective finish', 'optional']]
const identifiers = ['#aba99b', '#d8a675', '#a7b8ac', '#d1d9d7']
const footprint = 'M320 0 610 134 320 268 30 134Z'

function fragments(count: number, seed: number, concrete = false) {
  let state = seed
  const next = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296 }
  const colors = concrete ? ['#454841', '#d3cfc0', '#8e8c7d', '#b5b3a5'] : ['#dedfd7', '#bcc7c3', '#45534f', '#f1eee3', '#738680']
  return Array.from({ length: count }, (_, i) => {
    const x = next() * 170, y = next() * 145, size = concrete ? 1 + next() * 3 : 1 + next() * 2.7
    const points = [[x,y], [x+size,y-size*.35], [x+size*1.45,y+size*.6], [x+size*.35,y+size*1.2]].map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')
    return <polygon key={i} points={points} fill={colors[Math.floor(next()*colors.length)]} opacity={concrete ? .55 : .9}/>
  })
}
const flakes = fragments(175, 2048), aggregates = fragments(125, 8192, true)

export function LayerDiagram({ active, svgRef, onSelect, enhanced }: { active: number; svgRef: RefObject<SVGSVGElement | null>; onSelect: (index: number) => void; enhanced: boolean }) {
  return <div className="diagram-canvas"><svg ref={svgRef} className="layer-diagram" viewBox="0 0 940 660" role="group" aria-labelledby="layer-title layer-description" data-motion="static">
    <title id="layer-title">Explore an illustrative floor coating system</title>
    <desc id="layer-description">Select numbered layers 01 through 04, from concrete to optional protective finish. The matching numbered explanation appears below. All materials and depths are schematic, not the company's specification.</desc>
    <defs>
      <linearGradient id="concrete-top" x2=".8" y2="1"><stop stopColor="#b6b1a2"/><stop offset=".5" stopColor="#989b8c"/><stop offset="1" stopColor="#747e71"/></linearGradient>
      <linearGradient id="concrete-face" x2="0" y2="1"><stop stopColor="#969484"/><stop offset="1" stopColor="#64695d"/></linearGradient>
      <linearGradient id="primer-top" x2=".9" y2="1"><stop stopColor="#d6b18c"/><stop offset="1" stopColor="#a67e58"/></linearGradient>
      <linearGradient id="coating-top" x2=".8" y2="1"><stop stopColor="#bbc8c0"/><stop offset=".5" stopColor="#94a69e"/><stop offset="1" stopColor="#7d9389"/></linearGradient>
      <linearGradient id="finish-top" x1=".1" x2=".9" y2="1"><stop stopColor="#d6ded9"/><stop offset=".5" stopColor="#a2b3ad"/><stop offset="1" stopColor="#829b93"/></linearGradient>
      <linearGradient id="mineral-light" x1="0" y1="0" x2="1" y2=".4"><stop stopColor="#fff" stopOpacity="0"/><stop offset=".48" stopColor="#fff" stopOpacity=".02"/><stop offset=".58" stopColor="#fff" stopOpacity=".46"/><stop offset=".72" stopColor="#fff" stopOpacity=".03"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
      <radialGradient id="sample-shadow"><stop stopColor="#080f0d" stopOpacity=".8"/><stop offset="1" stopColor="#080f0d" stopOpacity="0"/></radialGradient>
      <pattern id="concrete-grain" width="170" height="145" patternUnits="userSpaceOnUse">{aggregates}</pattern>
      <pattern id="finish-flakes" width="170" height="145" patternUnits="userSpaceOnUse">{flakes}</pattern>
    </defs>
    <ellipse cx="330" cy="623" rx="330" ry="35" fill="url(#sample-shadow)"/>
    {layerNames.map((name, i) => <g key={name} className={`diagram-layer ${active === i ? 'selected-layer' : ''}`} data-layer={i} style={{ transform: `translateY(${staticLayerPositions[i]}px)` }} role={enhanced ? 'button' : undefined} tabIndex={enhanced ? 0 : undefined} aria-label={`${String(i+1).padStart(2,'0')} ${name}`} aria-pressed={enhanced ? active === i : undefined} aria-controls={enhanced ? 'active-layer-detail' : undefined} onClick={() => onSelect(i)} onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(i) }
      if (['ArrowUp','ArrowDown','Home','End'].includes(event.key)) {
        event.preventDefault()
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (i + (event.key === 'ArrowDown' ? 1 : 3)) % 4
        onSelect(next); svgRef.current?.querySelectorAll<SVGGElement>('[data-layer]')[next]?.focus()
      }
    }}>
      <g className="diagram-material">
        <ellipse cx="325" cy={i === 0 ? 310 : 277} rx="295" ry="22" fill="url(#sample-shadow)" opacity=".6"/>
        {i === 0 ? <>
          <path d="m30 134 290 134v56L30 190Z" fill="url(#concrete-face)"/>
          <path d="m320 268 290-134v56L320 324Z" fill="#606d61"/>
          <path d="m30 134 290 134v56L30 190Zm290 134 290-134v56L320 324Z" fill="url(#concrete-grain)"/>
        </> : <>
          <path d={`m30 134 290 134v${i === 1 ? 8 : i === 2 ? 16 : 7}L30 ${134+(i === 1 ? 8 : i === 2 ? 16 : 7)}Z`} fill={i === 1 ? '#956946' : i === 2 ? '#6e847a' : '#9db0a7'}/>
          <path d={`m320 268 290-134v${i === 1 ? 8 : i === 2 ? 16 : 7}L320 ${268+(i === 1 ? 8 : i === 2 ? 16 : 7)}Z`} fill={i === 1 ? '#785a41' : i === 2 ? '#49665a' : '#6c8b7e'}/>
        </>}
        <path d={footprint} fill={`url(#${['concrete-top','primer-top','coating-top','finish-top'][i]})`}/>
        {i === 0 && <path d={footprint} fill="url(#concrete-grain)"/>}
        {i >= 2 && <path d={footprint} fill="url(#finish-flakes)" opacity={i === 3 ? .3 : 1}/>}
        {i > 0 && <path d={footprint} fill="url(#mineral-light)" opacity={i === 3 ? .9 : .2}/>}
        <path d="m30 134 290 134 290-134" fill="none" stroke="#e2e7db" strokeOpacity=".6" strokeWidth="1.5"/>
        <path className="layer-dimmer" d={`M320 0 610 134v${i === 0 ? 56 : i === 1 ? 8 : i === 2 ? 16 : 7}L320 ${268+(i === 0 ? 56 : i === 1 ? 8 : i === 2 ? 16 : 7)} 30 ${134+(i === 0 ? 56 : i === 1 ? 8 : i === 2 ? 16 : 7)}V134Z`} fill="#0b1510"/>
        <path className="layer-selection-edge" d={footprint} fill="none"/>
      </g>
      <g className="layer-callout" aria-hidden="true">
        <path d="M602 134H663" fill="none" stroke={identifiers[i]} strokeWidth="2"/>
        <circle cx="608" cy="134" r="5" fill={identifiers[i]}/>
        <circle className="layer-number-disc" cx="690" cy="134" r="24" fill="#242925" stroke={identifiers[i]} strokeWidth="2"/>
        <text className="layer-number" x="690" y="143" textAnchor="middle" fill="#f3efe7">{String(i+1).padStart(2,'0')}</text>
        <text className="layer-name" x="734" y="126" fill="#f0eee7">{labels[i][0]}<tspan x="734" dy="28" className="layer-qualifier">{labels[i][1]}</tspan></text>
      </g>
    </g>)}
  </svg></div>
}
