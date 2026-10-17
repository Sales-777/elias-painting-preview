import { Arrow } from './Icon'
import { Photo } from './Photo'
import { services } from '../content/site'

export function Hero() {
  return <section className="hero" id="home" aria-labelledby="hero-heading">
    <Photo id="IMG-024" className="hero-image" sizes="100vw" priority position="53% 55%" />
    <div className="hero-shade" />
    <div className="hero-content">
      <div className="hero-title"><h1 id="hero-heading">A finer<br />finish.</h1></div>
      <div className="hero-intro"><p>Painting, wall finishes<br className="desktop-break" /> and a fresh perspective.</p><a className="button button-light" href="#contact">Get in Touch <Arrow diagonal /></a></div>
      <a href="#services" className="hero-explore" aria-label="Explore services"><span>Explore the possibilities</span><Arrow className="arrow-down" /></a>
    </div>
  </section>
}

export function Services() {
  return <section id="services" className="services section-space container" aria-labelledby="services-heading">
    <div className="section-heading"><h2 id="services-heading">A new look.<br />Room to room.</h2><div><p>From the walls around you to the floor beneath you. Explore painting and finishing services for residential and commercial spaces.</p><a href="#contact" className="text-link">Tell us what you have in mind <Arrow diagonal /></a></div></div>
    <div className="service-features">
      <a className="service-feature" href="#contact" aria-label="Discuss interior and exterior painting"><div className="image-frame"><Photo id="IMG-029" sizes="(max-width: 767px) 100vw, 54vw" /><span className="image-action"><Arrow diagonal /></span></div><div className="feature-caption"><h3>Interior & exterior painting</h3><p>A different color. A new atmosphere.</p></div></a>
      <a className="service-feature service-feature-secondary" href="#epoxy" aria-label="Explore epoxy flooring"><div className="image-frame"><Photo id="IMG-062" sizes="(max-width: 767px) 100vw, 37vw" /><span className="image-action"><Arrow diagonal /></span></div><div className="feature-caption"><h3>Epoxy flooring</h3><p>Explore the finish, from the surface down.</p></div></a>
    </div>
    <div className="additional-services">{services.map(service => <article className={`service-row ${service.image === 'IMG-001' ? 'service-row-comparison' : ''}`} key={service.title}>
      {service.image ? <Photo id={service.image} sizes={service.image === 'IMG-001' ? '(min-width: 1400px) 176px, (min-width: 768px) 160px, 132px' : '120px'} className="service-thumbnail" alt={service.imageAlt} /> : <div className="service-placeholder" aria-hidden="true"><svg viewBox="0 0 70 70" width="50" height="50" fill="none"><path d="m15 48 17-23 15 11-8 12m-7-23 7-9 13 9-5 11M43 46l10 11m-4-16 12 7m-26 2 4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></div>}
      <div><h3>{service.title}</h3><p>{service.description}</p>{service.imageNote && <p className="service-image-note">{service.imageNote}</p>}</div><a href="#contact" className="service-contact" aria-label={`Ask about ${service.title.toLowerCase()}`}><Arrow diagonal /></a>
    </article>)}</div>
  </section>
}

export function WhyChooseUs() {
  return <section id="why-choose-us" className="why-section" aria-labelledby="why-heading"><div className="container why-inner"><h2 id="why-heading">Why choose us</h2><div><p className="why-statement">There’s a story behind every finish.</p><p>Company credentials and what sets the team apart are being confirmed for this preview.</p></div><a className="text-link" href="#contact">Start a conversation <Arrow diagonal /></a></div></section>
}

export function About() {
  return <section id="about" className="about-section container section-space" aria-labelledby="about-heading">
    <div className="about-copy"><h2 id="about-heading">Meet Elias<br />Painting.</h2><p className="body-large">Painting and finishing services for the spaces you live and work in.</p><p>The services documented on the existing site bring together interior and exterior painting, wall preparation, wallpaper, cabinet finishes, power washing and epoxy flooring.</p><a className="text-link" href="#gallery">Explore the image collection <Arrow diagonal /></a></div>
    <figure className="about-image"><Photo id="IMG-022" sizes="(max-width: 767px) 100vw, 42vw" /><figcaption>Interior preparation — image from the existing site.</figcaption></figure>
  </section>
}
