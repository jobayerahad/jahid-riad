import { FaGithub, FaLinkedinIn, FaOrcid, FaResearchgate, FaXTwitter } from 'react-icons/fa6'
import { HiArrowUpRight, HiOutlineAcademicCap, HiOutlineEnvelope, HiOutlineGlobeAlt } from 'react-icons/hi2'
import classes from './social-links.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

type Props = {
  links: PublishedPortfolioSnapshot['profile']['socialLinks']
  variant?: 'light' | 'dark'
}

const icons = {
  linkedin: FaLinkedinIn,
  scholar: HiOutlineAcademicCap,
  github: FaGithub,
  orcid: FaOrcid,
  researchgate: FaResearchgate,
  x: FaXTwitter,
  email: HiOutlineEnvelope,
  website: HiOutlineGlobeAlt
}

const SocialLinks = ({ links, variant = 'light' }: Props) => (
  <nav className={classes.links} data-variant={variant} aria-label="Professional profiles">
    {links
      .filter((link) => link.enabled)
      .map((link) => {
        const Icon = icons[link.kind] ?? HiOutlineGlobeAlt

        return (
          <a
            key={link.id ?? link.href}
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            <span className={classes.iconBox} aria-hidden="true">
              <Icon />
            </span>
            <span>{link.label}</span>
            <HiArrowUpRight className={classes.arrow} aria-hidden="true" />
          </a>
        )
      })}
  </nav>
)

export default SocialLinks
