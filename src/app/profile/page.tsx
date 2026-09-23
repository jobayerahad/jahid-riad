import type { Metadata } from 'next'
import { Container, Text, Title } from '@mantine/core'
import Education from '@/components/education'
import Experience from '@/components/experience'
import Footer from '@/components/footer'
import Header from '@/components/header'
import Learning from '@/components/learning'
import Skills from '@/components/skills'
import { getPortfolioContent } from '@/data/portfolio'
import classes from './styles.module.css'

export const metadata: Metadata = {
  title: 'Profile & Background',
  description: 'Experience, education, capabilities, and professional background for Md. Jahid Alam Riad.',
  alternates: { canonical: '/profile' }
}

const ProfilePage = async () => {
  const content = await getPortfolioContent()

  return (
    <>
      <a className="skipLink" href="#main-content">
        Skip to main content
      </a>
      <Header />
      <main id="main-content">
        <header className={classes.hero}>
          <Container size="xl">
            <Text className={classes.eyebrow}>Profile &amp; background</Text>
            <Title order={1}>The supporting record.</Title>
            <Text className={classes.intro}>
              A detailed view of the experience, education, and capabilities behind the selected work and research.
            </Text>
          </Container>
        </header>
        <Experience content={content} />
        <Education content={content} />
        <Skills content={content} />
        <Learning content={content} />
      </main>
      <Footer content={content} />
    </>
  )
}

export default ProfilePage
