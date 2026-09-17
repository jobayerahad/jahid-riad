import { Container, SimpleGrid, Text, Title } from '@mantine/core'
import { FiMapPin } from 'react-icons/fi'
import SectionHeader from '@/components/ui/section-header'
import SocialLinks from '@/components/ui/social-links'
import Reveal from '@/components/ui/reveal'
import { getPortfolioContent } from '@/data/portfolio'
import LazyContactForm from './lazy-form'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const Contact = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const { profile, copy } = content ?? (await getPortfolioContent())

  return (
    <section id="contact" className={classes.section} aria-labelledby="contact-title">
      <Container size="xl">
        <SectionHeader
          id="contact-title"
          eyebrow={copy.contactEyebrow}
          title={copy.contactTitle}
          description={copy.contactDescription}
          inverse
        />

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 36, md: 64 }} className={classes.grid}>
          <Reveal className={classes.info} direction="left">
            <Title order={3}>{copy.contactPanelTitle}</Title>
            <Text>{copy.contactPrivacyCopy}</Text>

            <div className={classes.detail}>
              <FiMapPin aria-hidden="true" />
              <div>
                <Text component="span">Location</Text>
                <Text>{profile.location}</Text>
              </div>
            </div>

            <SocialLinks links={profile.socialLinks} variant="dark" />
          </Reveal>

          <Reveal direction="right" delay={80}>
            <LazyContactForm siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''} />
          </Reveal>
        </SimpleGrid>
      </Container>
    </section>
  )
}

export default Contact
