import { Container, Title, Text } from '@mantine/core'
import { Element } from 'react-scroll'
import { motion } from 'framer-motion'
import { MdSchool } from 'react-icons/md'
import { BsCalendar2Date } from 'react-icons/bs'
import classes from './styles.module.css'

const education = [
  {
    degree: 'M.Sc. in Information Technology',
    institution: 'Washington University of Science and Technology',
    period: '2023 - 2024',
    description: 'Major in IT System and Management.'
  },
  {
    degree: 'B.Sc. in Computer Science and Telecommunication Engineering',
    institution: 'Noakhali Science and Technology University',
    period: '2013 - 2019',
    description: 'Focus on digital communication systems and image transmission technologies. .'
  },
  {
    degree: 'Higher Secondary Certificate',
    institution: 'Dhaka College',
    period: '2010 - 2012',
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
