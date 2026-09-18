import About from '../about'
import Contact from '../contact'
import Footer from '../footer'
import Header from '../header'
import Hero from '../hero'
import Publications from '../publications'
import SelectedWork from '../selected-work'
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
        <SelectedWork content={snapshot} />
        <Publications content={snapshot} />
        <About content={snapshot} />
        <Contact content={snapshot} />
      </main>
      <Footer content={snapshot} />
    </>
  )
}

export default Home
