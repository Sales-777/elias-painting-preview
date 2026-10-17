import { useEffect, useRef, useState } from 'react'
import { Arrow, CloseIcon } from './Icon'
import { Photo } from './Photo'

const links = [['Services', '#services'], ['Epoxy', '#epoxy'], ['Our work', '#gallery'], ['About', '#about']]

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [currentSection, setCurrentSection] = useState('')
  const trigger = useRef<HTMLButtonElement>(null)
  const nav = useRef<HTMLElement>(null)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 56)
    update()
    window.addEventListener('scroll', update, { passive: true })
    const observer = new IntersectionObserver(entries => {
      const current = entries.find(entry => entry.isIntersecting)
      if (current) setCurrentSection(`#${current.target.id}`)
    }, { rootMargin: '-15% 0px -65% 0px' })
    links.forEach(([, href]) => {
      const section = document.querySelector(href)
      if (section) observer.observe(section)
    })
    const home = document.querySelector('#home')
    const homeObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setCurrentSection('')
    }, { threshold: .5 })
    if (home) homeObserver.observe(home)
    return () => { window.removeEventListener('scroll', update); observer.disconnect(); homeObserver.disconnect() }
  }, [])
  useEffect(() => {
    if (!open) return
    const first = nav.current?.querySelector<HTMLAnchorElement>('a')
    first?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() }
      if (event.key === 'Tab') {
        const focusable = [trigger.current, ...Array.from(nav.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])].filter(Boolean) as HTMLElement[]
        const firstItem = focusable[0], last = focusable.at(-1)
        if (event.shiftKey && document.activeElement === firstItem) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); firstItem?.focus() }
      }
    }
    document.addEventListener('keydown', keydown)
    const closeOnResize = () => { if (window.innerWidth >= 1000) setOpen(false) }
    window.addEventListener('resize', closeOnResize)
    return () => { document.removeEventListener('keydown', keydown); window.removeEventListener('resize', closeOnResize) }
  }, [open])
  function navigate() { setOpen(false) }
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'menu-is-open' : ''}`}>
      <a className="brand" href="#home">
        <span className="brand-mark"><Photo id="IMG-008" className="brand-logo" alt="" /></span>
        <span><strong>Elias Painting</strong><span className="brand-subtitle">Painting & finishes</span></span>
      </a>
      <button className="menu-toggle" ref={trigger} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <CloseIcon /> : <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h18M3 16h18" stroke="currentColor" strokeWidth="1.5" /></svg>}</button>
      <nav ref={nav} id="primary-navigation" className={`primary-navigation ${open ? 'is-open' : ''}`} aria-label="Main navigation">
        {links.map(([text, href]) => <a key={href} href={href} onClick={navigate} aria-current={currentSection === href ? 'location' : undefined}>{text}</a>)}
        <a className="button button-dark" href="#contact" onClick={navigate}>Get in Touch <Arrow diagonal /></a>
      </nav>
    </header>
  </>
}
