import { site } from '../content/site'
import { Arrow } from './Icon'
import { Photo } from './Photo'

export function Contact() {
  return <>
    <section id="contact" className="contact-section" aria-labelledby="contact-heading"><div className="container contact-grid"><div><h2 id="contact-heading">Your space.<br />A fresh start.</h2><p>Have a painting or finishing project in mind?<br className="desktop-break" /> Let’s start with a conversation.</p></div><div className="contact-details"><p className="contact-phone">{site.phoneDisplay}</p><a className="button button-light" href={site.whatsapp} target="_blank" rel="noreferrer">Contact on WhatsApp <Arrow diagonal /></a><p className="contact-note">Contact details from the existing site.<br />Current availability is to be confirmed.</p></div></div></section>
    <footer className="site-footer container"><div className="footer-top"><a className="brand" href="#home"><Photo id="IMG-008" className="brand-logo" /><strong>Elias Painting</strong></a><nav aria-label="Footer navigation"><a href="#services">Services</a><a href="#epoxy">Epoxy</a><a href="#gallery">Our work</a><a href="#contact">Contact</a></nav><Photo id="IMG-007" className="tiger-logo" /></div><div className="footer-bottom"><p>Local design preview · Elias Painting Contractor</p><p>Photographs from the existing site. Project attribution, image rights and the relationship between the displayed marks await owner confirmation.</p></div></footer>
  </>
}
