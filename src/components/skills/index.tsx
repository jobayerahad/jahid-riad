import { getPortfolioContent } from '@/data/portfolio'
import { Container } from '@/components/ui/container'
import SectionHeader from '@/components/ui/section-header'
import Reveal from '@/components/ui/reveal'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const Skills = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const snapshot = content ?? (await getPortfolioContent())
  const capabilityGroups = snapshot.capabilities.filter((item) => item.enabled)
  const { copy } = snapshot

  return (
    <section id="skills" className={`section ${classes.skills}`} aria-labelledby="skills-title">
      <Container size="xl">
        <SectionHeader
          id="skills-title"
          eyebrow={copy.capabilitiesEyebrow}
          title={copy.capabilitiesTitle}
          description={copy.capabilitiesDescription}
        />
        <div className={classes.grid}>
          {capabilityGroups.map((group) => (
            <Reveal as="article" className={classes.group} key={group.id}>
              <h3>{group.title}</h3>
              <p className={classes.description}>{group.description}</p>
              <ul className={classes.items} aria-label={`${group.title} skills`}>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default Skills
