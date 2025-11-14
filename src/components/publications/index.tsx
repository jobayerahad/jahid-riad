import { Container, Title, Text } from '@mantine/core'
import { Element } from 'react-scroll'
import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa6'
import classes from './styles.module.css'

const publications = [
  {
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    category: 'Artificial Intelligence',
    year: '2025',
    title: 'Exploring Religions and Cross-Cultural Sensitivities in Conversational AI',
    description:
      'With the fast growth of conversational AI, it is very important that these systems can handle religion and cultural sensitivity correctly.',
    url: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=fCis8uEAAAAJ&citation_for_view=fCis8uEAAAAJ:qjMakFHDy7sC'
  },
  {
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80',
    category: 'U-Net Architecture',
    year: '2024',
    title:
      'Advanced retinal image segmentation using u-net architecture: A leap forward in ophthalmological diagnostics',
    description:
      'The expeditious advancement of deep learning in the field of biomedical imaging has facilitated the emergence of innovative diagnostic instruments, hence revolutionising the domain of ophthalmology.',
    url: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=fCis8uEAAAAJ&citation_for_view=fCis8uEAAAAJ:u-x6o8ySG0sC'
  },
  {
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    category: 'Large Language Model',
    year: '2024',
    title: 'Fine-Tuning Large Language Models for Sentiment Classification of AI-Related Tweets',
    description:
      'Fine-tuning large language models (LLMs) for sentiment analysis presents a promising avenue for enhancing the understanding of public sentiment surrounding artificial intelligence (AI) topics.',
    url: 'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=fCis8uEAAAAJ&citation_for_view=fCis8uEAAAAJ:9yKSN-GCB0IC'
  }
]

const Publications = () => (
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
              <a href={pub.url} target="_blank" className={classes.link}>
                Read Paper <FaArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </Container>
  </Element>
)

export default Publications
