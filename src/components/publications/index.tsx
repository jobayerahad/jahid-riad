import { Container, Title, Text } from '@mantine/core'
import { Element } from 'react-scroll'
import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa6'
import classes from './styles.module.css'

const publications = [
  {
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80',
    category: 'Machine Learning',
    year: '2022',
    title: 'Deep Learning Approaches for Early Disease Detection',
    description:
      'This paper explores the application of convolutional neural networks in medical imaging for early diagnosis of diseases.'
  },
  {
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    category: 'Data Mining',
    year: '2021',
    title: 'Predictive Analytics in Healthcare Using Machine Learning',
    description:
      'Research on developing predictive models for patient outcomes using various machine learning algorithms and data mining techniques.'
  },
  {
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    category: 'Web Development',
    year: '2020',
    title: 'Modern Web Development Frameworks: A Comparative Study',
    description:
      'Analysis of popular web development frameworks and their performance characteristics in building scalable applications.'
  }
]

const Publications = () => {
  return (
    <Element name="publications" className={classes.publications}>
      <Container size="xl">
        <motion.div
          className={classes.sectionTitle}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Title className={classes.title}>Publications</Title>
          <Text className={classes.subtitle}>My research papers and academic publications</Text>
        </motion.div>

        <div className={classes.grid}>
          {publications.map((pub, index) => (
            <motion.div
              key={index}
              className={classes.card}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <img src={pub.image} alt={pub.title} className={classes.image} />
              <div className={classes.content}>
                <div className={classes.meta}>
                  <span className={classes.tag}>{pub.category}</span>
                  <span>{pub.year}</span>
                </div>
                <Title order={3}>{pub.title}</Title>
                <Text>{pub.description}</Text>
                <a href="#" className={classes.link}>
                  Read Paper <FaArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Element>
  )
}

export default Publications
