import { Container, Title, Text } from '@mantine/core'
import { Element } from 'react-scroll'
import { motion } from 'framer-motion'
import classes from './styles.module.css'

const experiences = [
  {
    period: '2021 - Present',
    title: 'Research Assistant',
    description:
      'Working on machine learning applications in healthcare and developing predictive models for disease diagnosis at University of Asia Pacific.'
  },
  {
    period: '2020 - 2021',
    title: 'Web Developer',
    description:
      'Developed and maintained responsive web applications using modern frameworks and technologies for various clients and projects.'
  },
  {
    period: '2019 - 2020',
    title: 'Software Engineering Intern',
    description:
      'Gained hands-on experience in software development lifecycle, agile methodologies, and collaborative coding practices.'
  }
]

const Experience = () => {
  return (
    <Element name="experience" className={classes.experience}>
      <Container size="xl">
        <motion.div
          className={classes.sectionTitle}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Title className={classes.title}>Experience</Title>
          <Text className={classes.subtitle}>My professional journey and research experience</Text>
        </motion.div>

        <div className={classes.timeline}>
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              className={classes.timelineItem}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className={classes.timelineDot}></div>
              <div className={classes.timelineContent}>
                <Text className={classes.timelineDate}>{exp.period}</Text>
                <Title order={3} className={classes.timelineTitle}>
                  {exp.title}
                </Title>
                <Text className={classes.timelineDescription}>{exp.description}</Text>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Element>
  )
}

export default Experience
