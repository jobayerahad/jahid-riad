'use client'

import { Container } from '@mantine/core'

import Hero from './hero'
import Experience from './experience'
import Education from './education'
import Publications from './publications'
import Skills from './skills'
import Certificates from './certificates'
import Languages from './languages'
import Footer from './footer'

const Home = () => (
  <Container size="lg" py="xl">
    <Hero />
    <Experience />
    <Education />
    <Publications />
    <Skills />
    <Certificates />
    <Languages />
    <Footer />
  </Container>
)

export default Home
