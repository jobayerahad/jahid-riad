import Link from 'next/link'
import {
  HiArrowUpRight,
  HiOutlineArrowsRightLeft,
  HiOutlineBeaker,
  HiOutlineBriefcase,
  HiOutlineCircleStack
} from 'react-icons/hi2'
import { getPortfolioContent } from '@/data/portfolio'
import { getSelectedWorkStories } from '@/lib/portfolio-presentation'
import { Container } from '@/components/ui/container'
import Reveal, { MotionGroup } from '@/components/ui/reveal'
import classes from './styles.module.css'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

const SelectedWork = async ({ content }: { content?: PublishedPortfolioSnapshot }) => {
  const snapshot = content ?? (await getPortfolioContent())
  const stories = getSelectedWorkStories(snapshot).slice(0, 3)
  const storyIcons = [HiOutlineArrowsRightLeft, HiOutlineCircleStack, HiOutlineBeaker]

  return (
    <section id="work" className={classes.section} aria-labelledby="work-title">
      <Container size="xl">
        <Reveal as="header" className={classes.heading}>
          <div>
            <p className={classes.eyebrow}>
              <HiOutlineBriefcase aria-hidden="true" /> Selected work
            </p>
            <h2 id="work-title">Work across decisions, systems, and AI.</h2>
          </div>
          <p>Three areas that show how Jahid approaches complex technology problems.</p>
        </Reveal>

        <MotionGroup as="ol" className={classes.grid} stagger={0.1}>
          {stories.map((story, index) => {
            const Icon = storyIcons[index] ?? HiOutlineBriefcase

            return (
              <Reveal as="li" className={classes.item} grouped key={story.number}>
                <Link href={story.href} className={classes.itemLink} aria-label={`${story.linkLabel}: ${story.title}`}>
                  <div className={classes.visualShell}>
                    <div className={classes.visual} data-index={index} aria-hidden="true">
                      <span>{story.number}</span>
                      <strong>{story.visualLabel}</strong>
                      <i />
                    </div>
                  </div>
                  <div className={classes.meta}>
                    <Icon aria-hidden="true" />
                    <span>{story.evidence}</span>
                  </div>
                  <h3>{story.title}</h3>
                  <p className={classes.body}>{story.body}</p>
                  <span className={classes.link}>
                    {story.linkLabel} <HiArrowUpRight aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </MotionGroup>
      </Container>
    </section>
  )
}

export default SelectedWork
