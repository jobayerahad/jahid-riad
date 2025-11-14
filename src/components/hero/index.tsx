'use client'

import Link from 'next/link'
import { Container, Button } from '@mantine/core'
import { Element } from 'react-scroll'
import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa6'
import { FiDownload } from 'react-icons/fi'
import classes from './styles.module.css'

const Hero = () => {
  return (
    <Element name="home" className={classes.hero}>
      <Container size="xl" className={classes.container}>
        <div className={classes.content}>
          <motion.div
            className={classes.text}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className={classes.tagline}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Researcher & Engineer
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Hi, I'm <span>Md. Jahid Alam Riad</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              I&apos;m a Computer Science graduate with expertise in web development, machine learning, and software
              engineering. Passionate about creating innovative solutions to complex problems.
            </motion.p>

            <motion.div
              className={classes.buttons}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Button
                size="lg"
                rightSection={<FaArrowRight size={20} />}
                className={classes.primaryButton}
                component={Link}
                href="https://scholar.google.com/citations?user=fCis8uEAAAAJ&hl=en"
                target="_blank"
              >
                View Publications
              </Button>

              <Button
                size="lg"
                variant="outline"
                leftSection={<FiDownload size={20} />}
                className={classes.secondaryButton}
                component={Link}
                href="/md_jahid_alam_riad_cv.pdf"
                download
              >
                Download CV
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className={classes.image}
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className={classes.imageContainer}>
              <img src="/riad-01.jpg" alt="Jahid Alam Riad" className={classes.profileImage} />
              <div className={classes.imageBackground}></div>
            </div>
          </motion.div>
        </div>
      </Container>
    </Element>
  )
}

export default Hero
