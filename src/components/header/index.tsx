'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HiArrowUpRight, HiBars3, HiXMark } from 'react-icons/hi2'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import classes from './styles.module.css'

const pageLinks = [
  { href: '/profile', label: 'Profile' },
  { href: '/publications', label: 'Publications' }
]

const sectionLinks = [
  { id: 'work', label: 'Work' },
  { id: 'research', label: 'Research' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' }
]

const Header = () => {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [opened, setOpened] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const close = () => setOpened(false)
  const toggle = () => setOpened((value) => !value)

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

  const pageItems = pageLinks.map(({ href, label }) => (
    <Link
      key={href}
      href={href}
      className={classes.link}
      onClick={close}
      data-active={pathname === href || pathname.startsWith(`${href}/`) ? true : undefined}
      aria-current={pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined}
    >
      {label}
    </Link>
  ))

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

  const allNav = (
    <>
      {pageItems}
      {navItems}
    </>
  )

  return (
    <header className={classes.header} data-scrolled={scrolled || undefined}>
      <Container size="xl" className={classes.inner}>
        <Link href={isHome ? '#home' : '/'} className={classes.brand} aria-label="Jahid Riad, home">
          Jahid Riad<span>.</span>
        </Link>
        <nav className={classes.desktopNav} aria-label="Primary navigation">
          {allNav}
        </nav>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`${classes.burger} md:hidden`}
          onClick={toggle}
          aria-label={opened ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={opened}
          aria-controls="mobile-navigation"
        >
          {opened ? <HiXMark aria-hidden="true" /> : <HiBars3 aria-hidden="true" />}
        </Button>
        <Sheet open={opened} onOpenChange={setOpened}>
          <SheetContent id="mobile-navigation" side="right" className="w-[min(22rem,100%)] p-6" showCloseButton={false}>
            <SheetHeader className="px-0 pt-0">
              <SheetTitle className={classes.drawerTitle}>Navigation</SheetTitle>
            </SheetHeader>
            <nav className={classes.mobileNav} aria-label="Mobile navigation">
              {allNav}
            </nav>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  )
}

export default Header
