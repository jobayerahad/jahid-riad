'use client'

import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import { Container, Group, Burger, Drawer, ScrollArea, Image } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { motion } from 'framer-motion'
import classes from './styles.module.css'

const links = [
  { link: 'home', label: 'Home' },
  { link: 'about', label: 'About' },
  { link: 'experience', label: 'Experience' },
  { link: 'education', label: 'Education' },
  { link: 'publications', label: 'Publications' },
  { link: 'contact', label: 'Contact' }
]

const Header = () => {
  const [opened, { toggle, close }] = useDisclosure(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const items = links.map((link) => (
    <Link key={link.label} to={link.link} className={classes.link} smooth={true} duration={500}>
      {link.label}
    </Link>
  ))

  return (
    <motion.header
      className={`${classes.header} ${scrolled ? classes.scrolled : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Container size="xl" className={classes.inner}>
        <motion.div
          className={classes.logo}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <Image src="/logo-flat.png" alt="Jahid Alam Riad" h="2.5rem" w="auto" />
        </motion.div>

        <Group gap={30} visibleFrom="md" className={classes.links}>
          {items}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />

        <Drawer opened={opened} onClose={close} size="100%" padding="md" hiddenFrom="md" zIndex={1000000}>
          <ScrollArea h={`calc(100vh - 80px)`} mx="-md">
            {items}
          </ScrollArea>
        </Drawer>
      </Container>
    </motion.header>
  )
}

export default Header
