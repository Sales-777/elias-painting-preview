import { Header } from './components/Header'
import { Hero, Services, WhyChooseUs, About } from './components/IntroSections'
import { EpoxyExperience } from './components/EpoxyExperience'
import { Gallery } from './components/Gallery'
import { Contact } from './components/Contact'

export default function App() {
  return <><Header /><main id="main"><Hero /><Services /><WhyChooseUs /><About /><EpoxyExperience /><Gallery /><Contact /></main></>
}
