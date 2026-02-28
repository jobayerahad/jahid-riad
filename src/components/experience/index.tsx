import { Container, Title, Text } from '@mantine/core'
import { Element } from 'react-scroll'
import { motion } from 'framer-motion'
import classes from './styles.module.css'

const experiences = [
  {
    period: '10th Nov 2025 - Present',
    title: 'IT Business Analyst',
    organization: 'UpSkill Consultancy INC, Jackson Heights, New York',
    description:
      'Bridge business needs and IT solutions through requirements analysis, stakeholder collaboration, data insights, and system implementation support.'
  },
  {
    period: '10th Feb 2025 - 09th Nov 2025',
    title: 'Trainee Business Analyst',
    organization: 'Global systems LLC, Irving, Texas',
    description:
      'Analyze business processes, translate requirements into data-driven solutions, and support stakeholders with reports and dashboards.'
  },
  {
    period: '2019 - 2020',
    title: 'Computer Technology Lecturer',
    organization: 'Institute of Science Trade and Technology (ISTT) Dhaka, Bangladesh',
    description:
      'Delivered computer science courses, updated curriculum, and mentored students in programming, systems, and career development.'
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
                <Text className={classes.timelineOrg}>{exp.organization}</Text>
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
