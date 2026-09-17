import Link from 'next/link'
import { Container, Text } from '@mantine/core'
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
          <Link href="/#experience">Experience</Link>
          <Link href="/publications">Publications</Link>
          <Link href="/#contact">Contact</Link>
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
