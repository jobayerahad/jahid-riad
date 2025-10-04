import { Container, Title, Text } from '@mantine/core'
import { Element } from 'react-scroll'
import { motion } from 'framer-motion'
import { MdSchool } from 'react-icons/md'
import { BsCalendar2Date } from 'react-icons/bs'
import classes from './styles.module.css'

const education = [
  {
    degree: 'M.Sc. in Computer Science & Engineering',
    institution: 'University of Asia Pacific',
    period: '2021 - Present',
    description: 'Focus on Machine Learning, Deep Learning, and their applications in solving real-world problems.'
  },
  {
    degree: 'B.Sc. in Computer Science & Engineering',
    institution: 'Daffodil International University',
    period: '2016 - 2020',
    description: 'Graduated with honors. Completed thesis on "Machine Learning Approaches for Predictive Analytics".'
  },
  {
    degree: 'Higher Secondary Certificate',
    institution: 'Dhaka College',
    period: '2013 - 2015',
    description: 'Science Group with focus on Physics, Chemistry, and Mathematics.'
  }
]

const Education = () => {
  return (
    <Element name="education" className={classes.education}>
      <Container size="xl">
        <motion.div
          className={classes.sectionTitle}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Title className={classes.title}>Education</Title>
          <Text className={classes.subtitle}>My academic background and qualifications</Text>
        </motion.div>

        <div className={classes.grid}>
          {education.map((edu, index) => (
            <motion.div
              key={index}
              className={classes.card}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={classes.icon}>
                <MdSchool size={40} />
              </div>
              <Title order={3}>{edu.degree}</Title>
              <div className={classes.meta}>
                <div className={classes.metaItem}>
                  <MdSchool size={16} />
                  <span>{edu.institution}</span>
                </div>
                <div className={classes.metaItem}>
                  <BsCalendar2Date size={16} />
                  <span>{edu.period}</span>
                </div>
              </div>
              <Text>{edu.description}</Text>
            </motion.div>
          ))}
        </div>
      </Container>
    </Element>
  )
}

export default Education
