import { Container, Title, Text, SimpleGrid } from '@mantine/core'
import { Element } from 'react-scroll'
import { motion } from 'framer-motion'
import classes from './styles.module.css'

const stats = [
  { number: '5+', label: 'Years Experience' },
  { number: '20+', label: 'Projects Completed' },
  { number: '3', label: 'Publications' }
]

const About = () => {
  return (
    <Element name="about" className={classes.about}>
      <Container size="xl">
        <motion.div
          className={classes.sectionTitle}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Title className={classes.title}>About Me</Title>
          <Text className={classes.subtitle}>Learn more about my background, skills, and experience</Text>
        </motion.div>

        <div className={classes.content}>
          <motion.div
            className={classes.text}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Title order={3} className={classes.subheading}>
              Creating Digital Experiences That Matter
            </Title>
            <Text className={classes.description}>
              I&apos;m a passionate Computer Science graduate with expertise in web development, machine learning, and
              software engineering. My approach combines technical expertise with creative problem-solving to deliver
              solutions that are both functional and innovative.
            </Text>
            <Text className={classes.description}>
              Currently pursuing my MSc in Computer Science and Engineering at University of Asia Pacific, I&apos;m
              focused on research in machine learning applications and developing practical solutions to real-world
              problems.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={30} className={classes.stats}>
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className={classes.stat}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Text className={classes.statNumber}>{stat.number}</Text>
                  <Text className={classes.statLabel}>{stat.label}</Text>
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>

          <motion.div
            className={classes.image}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <img src="/riad-02.jpg" alt="Jahid Alam Riad" className={classes.aboutImage} />
          </motion.div>
        </div>
      </Container>
    </Element>
  )
}

export default About
