'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Burger, Container, Drawer } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import classes from './styles.module.css'

const sectionLinks = [
  { id: 'about', label: 'Profile' },
  { id: 'experience', label: 'Experience' },
  { id: 'publications', label: 'Research' },
  { id: 'education', label: 'Background' },
  { id: 'contact', label: 'Contact' }
]

const Header = () => {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [opened, { toggle, close }] = useDisclosure(false)

  const navItems = sectionLinks.map(({ id, label }) => (
    <Link
      key={id}
      href={isHome ? `#${id}` : `/#${id}`}
      className={id === 'contact' ? classes.contactLink : classes.link}
      onClick={close}
    >
      {label}
    </Link>
  ))

  return (
    <header className={classes.header}>
      <Container size="xl" className={classes.inner}>
        <Link href={isHome ? '#home' : '/'} className={classes.brand} aria-label="Jahid Riad, home">
          Jahid Riad<span>.</span>
        </Link>
        <nav className={classes.desktopNav} aria-label="Primary navigation">
          {navItems}
        </nav>
        <Burger
          className={classes.burger}
          opened={opened}
          onClick={toggle}
          hiddenFrom="md"
          size="sm"
          aria-label={opened ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={opened}
          aria-controls="mobile-navigation"
        />
        <Drawer
          id="mobile-navigation"
          opened={opened}
          onClose={close}
          title="Navigation"
          position="right"
          size="min(22rem, 100%)"
          padding="lg"
          hiddenFrom="md"
          transitionProps={{ transition: 'slide-left', duration: 220 }}
          classNames={{ title: classes.drawerTitle }}
        >
          <nav className={classes.mobileNav} aria-label="Mobile navigation">
            {navItems}
          </nav>
        </Drawer>
      </Container>
    </header>
  )
}

export default Header
