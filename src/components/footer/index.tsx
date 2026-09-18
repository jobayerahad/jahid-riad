import Link from 'next/link'
import { Container, Text } from '@mantine/core'
import { HiArrowRight } from 'react-icons/hi2'
import { getPortfolioContent } from '@/data/portfolio'
import SocialLinks from '@/components/ui/social-links'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const Footer = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const { profile } = content ?? (await getPortfolioContent())
  return (
    <footer className={classes.footer}>
      <Container size="xl" className={classes.inner}>
        <div className={classes.identity}>
          <Link href="/" className={classes.brand}>
            {profile.shortName}
            <span>.</span>
          </Link>
          <Text>{profile.positioning}</Text>
        </div>
        <nav className={classes.nav} aria-label="Footer navigation">
          <Link href="/#work">
            Work <HiArrowRight aria-hidden="true" />
          </Link>
          <Link href="/#research">
            Research <HiArrowRight aria-hidden="true" />
          </Link>
          <Link href="/#about">
            About <HiArrowRight aria-hidden="true" />
          </Link>
          <Link href="/#contact">
            Contact <HiArrowRight aria-hidden="true" />
          </Link>
        </nav>
        <div className={classes.bottom}>
          <Text>
            © {new Date().getFullYear()} {profile.name}
          </Text>
          <SocialLinks links={profile.socialLinks} variant="dark" />
        </div>
      </Container>
    </footer>
  )
}

export default Footer
