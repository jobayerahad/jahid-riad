'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Burger, Container, Drawer } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { HiArrowUpRight } from 'react-icons/hi2'
import classes from './styles.module.css'

const sectionLinks = [
  { id: 'work', label: 'Work' },
  { id: 'research', label: 'Research' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' }
]

const Header = () => {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [opened, { toggle, close }] = useDisclosure(false)
  const [activeSection, setActiveSection] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 18)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  useEffect(() => {
    if (!isHome) return

    const sections = sectionLinks
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActiveSection(visible.target.id)
      },
      { rootMargin: '-24% 0px -58% 0px', threshold: [0, 0.15, 0.4] }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [isHome])

  const navItems = sectionLinks.map(({ id, label }) => (
    <Link
      key={id}
      href={isHome ? `#${id}` : `/#${id}`}
      className={id === 'contact' ? classes.contactLink : classes.link}
      onClick={close}
      data-active={isHome && activeSection === id ? true : undefined}
      aria-current={isHome && activeSection === id ? 'location' : undefined}
    >
      {label}
      {id === 'contact' ? <HiArrowUpRight aria-hidden="true" /> : null}
    </Link>
  ))

  return (
    <header className={classes.header} data-scrolled={scrolled || undefined}>
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
