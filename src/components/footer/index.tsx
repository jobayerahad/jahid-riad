import Link from 'next/link'
import { HiArrowRight } from 'react-icons/hi2'
import { getPortfolioContent } from '@/data/portfolio'
import SocialLinks from '@/components/ui/social-links'
import { Container } from '@/components/ui/container'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

async function getCopyrightYear() {
  'use cache'
  return new Date().getFullYear()
}

const Footer = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const [{ profile }, year] = await Promise.all([
    content ? Promise.resolve({ profile: content.profile }) : getPortfolioContent(),
    getCopyrightYear()
  ])
  return (
    <footer className={classes.footer}>
      <Container size="xl" className={classes.inner}>
        <div className={classes.identity}>
          <Link href="/" className={classes.brand}>
            {profile.shortName}
            <span>.</span>
          </Link>
          <p>{profile.positioning}</p>
        </div>
        <nav className={classes.nav} aria-label="Footer navigation">
          <Link href="/profile">
            Profile <HiArrowRight aria-hidden="true" />
          </Link>
          <Link href="/publications">
            Publications <HiArrowRight aria-hidden="true" />
          </Link>
          <Link href="/#work">
            Work <HiArrowRight aria-hidden="true" />
          </Link>
          <Link href="/#research">
            Research <HiArrowRight aria-hidden="true" />
          </Link>
          <Link href="/#contact">
            Contact <HiArrowRight aria-hidden="true" />
          </Link>
        </nav>
        <div className={classes.bottom}>
          <p>
            © {year} {profile.name}
          </p>
          <SocialLinks links={profile.socialLinks} variant="dark" />
        </div>
      </Container>
    </footer>
  )
}

export default Footer
