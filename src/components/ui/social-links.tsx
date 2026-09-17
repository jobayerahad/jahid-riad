import { ActionIcon, Group, Tooltip } from '@mantine/core'
import { FaLinkedinIn } from 'react-icons/fa'
import { HiOutlineAcademicCap } from 'react-icons/hi2'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

type Props = {
  links: PublishedPortfolioSnapshot['profile']['socialLinks']
  variant?: 'light' | 'dark'
}

const icons = {
  linkedin: FaLinkedinIn,
  scholar: HiOutlineAcademicCap
}

const SocialLinks = ({ links, variant = 'light' }: Props) => (
  <Group gap="sm" aria-label="Professional profiles">
    {links
      .filter((link) => link.enabled)
      .map((link) => {
        const Icon = icons[link.kind]

        return (
          <Tooltip key={link.id ?? link.href} label={link.label} withArrow>
            <ActionIcon
              component="a"
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              aria-label={link.label}
              size={44}
              variant={variant === 'dark' ? 'light' : 'outline'}
              color={variant === 'dark' ? 'gray' : 'forest'}
            >
              <Icon aria-hidden="true" size={21} />
            </ActionIcon>
          </Tooltip>
        )
      })}
  </Group>
)

export default SocialLinks
