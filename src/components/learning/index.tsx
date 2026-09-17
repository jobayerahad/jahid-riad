import { Container, Text, Title } from '@mantine/core'
import { professionalLearning } from '@/data/professional-learning'
import SectionHeader from '@/components/ui/section-header'
import classes from './styles.module.css'

const Learning = () => (
  <section id="learning" className={`section ${classes.section}`} aria-labelledby="learning-title">
    <Container size="xl">
      <SectionHeader
        id="learning-title"
        eyebrow="Further background"
        title="Professional learning"
        description="Coursework in software delivery and scientific reviewing."
      />
      <div className={classes.layout}>
        <div>
          <Title order={3}>Courses &amp; reviewing</Title>
          <ul className={classes.list}>
            {professionalLearning.training.map((item) => (
              <li key={item.name}>
                <span>{item.name}</span>
                <Text component="span">{item.issuer}</Text>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Title order={3}>Languages</Title>
          <ul className={classes.list}>
            {professionalLearning.languages.map((item) => (
              <li key={item.name}>
                <span>{item.name}</span>
                <Text component="span">{item.level}</Text>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  </section>
)

export default Learning
