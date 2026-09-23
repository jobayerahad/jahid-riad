import Image from 'next/image'
import { Container, Text, Title } from '@mantine/core'
import { HiOutlineEnvelope, HiOutlineMapPin } from 'react-icons/hi2'
import SocialLinks from '@/components/ui/social-links'
import Reveal, { MotionGroup } from '@/components/ui/reveal'
import { getPortfolioContent } from '@/data/portfolio'
import { getContactPortrait } from '@/lib/portfolio-presentation'
import LazyContactForm from './lazy-form'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const Contact = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const snapshot = content ?? (await getPortfolioContent())
  const { profile, copy, settings } = snapshot
  const portrait = getContactPortrait(settings)

  return (
    <section id="contact" className={classes.section} aria-labelledby="contact-title">
      <Container size="xl">
        <div className={classes.grid}>
          <MotionGroup className={classes.info} stagger={0.07}>
            <Reveal grouped>
              <Text className={classes.eyebrow}>
                <HiOutlineEnvelope aria-hidden="true" /> {copy.contactEyebrow}
              </Text>
            </Reveal>
            <Reveal grouped>
              <Title order={2} id="contact-title">
                {copy.contactTitle}
              </Title>
            </Reveal>
            <Reveal grouped>
              <Text className={classes.description}>{copy.contactDescription}</Text>
            </Reveal>

            <Reveal grouped>
              <div className={classes.detail}>
                <span className={classes.detailIcon}>
                  <HiOutlineMapPin aria-hidden="true" />
                </span>
                <div>
                  <Text component="span">Location</Text>
                  <Text>{profile.location}</Text>
                </div>
              </div>
            </Reveal>

            <Reveal grouped>
              <SocialLinks links={profile.socialLinks} variant="dark" />
            </Reveal>
          </MotionGroup>

          {portrait ? (
            <Reveal className={classes.portraitColumn} delay={60} variant="image">
              <figure className={classes.portraitFigure}>
                <div className={classes.portraitFrame} style={{ position: 'relative' }}>
                  <Image
                    src={portrait.url}
                    alt={portrait.altText ?? profile.name}
                    fill
                    sizes="(max-width: 48em) 14rem, (max-width: 62em) 13rem, 15vw"
                    className={classes.portrait}
                  />
                </div>
                <figcaption>{profile.shortName}</figcaption>
              </figure>
            </Reveal>
          ) : null}

          <Reveal className={classes.formColumn} delay={100} direction="right">
            <LazyContactForm siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''} />
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

export default Contact
