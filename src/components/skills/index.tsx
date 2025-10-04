'use client'

import { Container, Title, Text } from '@mantine/core'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import classes from './styles.module.css'

const skills = {
  technical: [
    { name: 'Python', percentage: 95 },
    { name: 'JavaScript', percentage: 90 },
    { name: 'Machine Learning', percentage: 85 },
    { name: 'React', percentage: 80 }
  ],
  research: [
    { name: 'Data Analysis', percentage: 90 },
    { name: 'Statistical Modeling', percentage: 85 },
    { name: 'Academic Writing', percentage: 80 },
    { name: 'Research Methodology', percentage: 85 }
  ]
}

const Skills = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="skills" className={classes.skills} ref={ref}>
      <Container size="xl">
        <motion.div
          className={classes.sectionTitle}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Title className={classes.title}>Skills & Expertise</Title>
          <Text className={classes.subtitle}>My technical skills and areas of expertise</Text>
        </motion.div>

        <div className={classes.container}>
          <motion.div
            className={classes.category}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Title order={3}>Technical Skills</Title>
            {skills.technical.map((skill, index) => (
              <div key={skill.name} className={classes.skillItem}>
                <div className={classes.skillHeader}>
                  <span className={classes.skillName}>{skill.name}</span>
                  <span className={classes.skillPercentage}>{skill.percentage}%</span>
                </div>
                <div className={classes.skillBar}>
                  <motion.div
                    className={classes.skillProgress}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${skill.percentage}%` } : { width: 0 }}
                    transition={{ duration: 1.5, delay: index * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            className={classes.category}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Title order={3}>Research Skills</Title>
            {skills.research.map((skill, index) => (
              <div key={skill.name} className={classes.skillItem}>
                <div className={classes.skillHeader}>
                  <span className={classes.skillName}>{skill.name}</span>
                  <span className={classes.skillPercentage}>{skill.percentage}%</span>
                </div>
                <div className={classes.skillBar}>
                  <motion.div
                    className={classes.skillProgress}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${skill.percentage}%` } : { width: 0 }}
                    transition={{ duration: 1.5, delay: (index + skills.technical.length) * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  )
}

export default Skills
