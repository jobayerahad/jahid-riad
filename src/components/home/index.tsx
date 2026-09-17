import About from '../about'
import Contact from '../contact'
import Education from '../education'
import Experience from '../experience'
import Footer from '../footer'
import Header from '../header'
import Hero from '../hero'
import Learning from '../learning'
import Publications from '../publications'
import Skills from '../skills'
import { getPortfolioContent } from '@/data/portfolio'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const Home = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const snapshot = content ?? (await getPortfolioContent())
  return (
    <>
      <a className="skipLink" href="#main-content">
        Skip to main content
      </a>
      <Header />
      <main id="main-content">
        <Hero content={snapshot} />
        <About content={snapshot} />
        <Experience content={snapshot} />
        <Publications content={snapshot} />
        <Education content={snapshot} />
        <Skills content={snapshot} />
        <Learning />
        <Contact content={snapshot} />
      </main>
      <Footer content={snapshot} />
    </>
  )
}

export default Home
