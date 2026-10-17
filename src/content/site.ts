export const site = {
  name: 'Elias Painting',
  fullName: 'Elias Painting Contractor',
  phoneDisplay: '908.256.4717',
  whatsapp: 'https://wa.me/19082564717',
  evidence: 'sources/auditoria/textos_e_servicos.md — 15/10/2026',
  status: 'Published details; current availability and ownership require confirmation.',
}

export const services = [
  { title: 'Wallpaper', description: 'Pattern, texture and a different feel for your walls.', image: 'IMG-011' },
  { title: 'Wall preparation', description: 'Sheetrock, plaster and skim coating Level 5.', image: 'IMG-021' },
  { title: 'Cabinet finishes', description: 'Cabinet painting and stain finishes.', image: 'IMG-016' },
  { title: 'Power washing', description: 'Exterior surface cleaning with pressure washing.', image: 'IMG-001', imageAlt: 'Brick steps and paving with contrasting darker and cleaner-looking halves, from the existing image collection.', imageNote: 'Comparison from the existing site.' },
]

export const epoxyStages = [
  { id: 'substrate', title: 'Start with the surface.', short: 'Preparation', text: 'Assessment, repairs and mechanical preparation come before the coating. The approach depends on the existing substrate.', layer: 0 },
  { id: 'primer', title: 'Build the foundation.', short: 'Primer', text: 'A primer or bonding layer may be specified for the selected system. It is not required in every coating assembly.', layer: 1 },
  { id: 'finish', title: 'Choose the finish.', short: 'Decorative coat', text: 'The coating carries the decorative finish. Flake and metallic looks are different options, not layers that always go together.', layer: 2 },
  { id: 'protection', title: 'Complete the system.', short: 'Protection & cure', text: 'A protective finish may be added where specified. Application intervals and curing follow the selected product system.', layer: 3 },
]
