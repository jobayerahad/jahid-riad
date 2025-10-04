'use client'

import Hero from '../hero'
import Experience from '../experience'
import Education from '../education'
import Publications from '../publications'
import Skills from '../skills'
import Footer from '../footer'
import Header from '../header'
import About from '../about'
import Contact from '../contact'

const Home = () => (
  <>
    <Header />

    <main>
      <Hero />
      <About />
      <Experience />
      <Education />
      <Publications />
      <Skills />
      <Contact />
    </main>

    <Footer />
  </>
)

export default Home
