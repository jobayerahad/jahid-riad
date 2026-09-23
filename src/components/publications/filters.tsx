'use client'

import { useMemo, useState } from 'react'
import { Button, Group, Select, Text } from '@mantine/core'
import PublicationCard from '@/components/publication-card'
import { formatPublicationType } from '@/lib/bibtex'
import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'
import classes from './filters.module.css'

type Publication = PublishedPortfolioSnapshot['publications'][number]

type Props = { publications: Publication[] }

const PublicationFilters = ({ publications }: Props) => {
  const [year, setYear] = useState<string | null>(null)
  const [type, setType] = useState<string | null>(null)
  const [topic, setTopic] = useState<string | null>(null)

  const years = useMemo(
    () => [...new Set(publications.map((item) => String(item.year)))].sort((a, b) => Number(b) - Number(a)),
    [publications]
  )
  const types = useMemo(
    () => [...new Set(publications.map((item) => item.type))].sort(),
    [publications]
  )
  const topics = useMemo(
    () => [...new Set(publications.flatMap((item) => item.topics))].sort((a, b) => a.localeCompare(b)),
    [publications]
  )

  const filtered = publications.filter((item) => {
    if (year && String(item.year) !== year) return false
    if (type && item.type !== type) return false
    if (topic && !item.topics.includes(topic)) return false
    return true
  })

  const clear = () => {
    setYear(null)
    setType(null)
    setTopic(null)
  }

  return (
    <div>
      <Group className={classes.filters} gap="sm" align="flex-end">
        <Select
          label="Year"
          placeholder="All years"
          data={years}
          value={year}
          onChange={setYear}
          clearable
          searchable
        />
        <Select
          label="Type"
          placeholder="All types"
          data={types.map((value) => ({ value, label: formatPublicationType(value) }))}
          value={type}
          onChange={setType}
          clearable
          searchable
        />
        <Select
          label="Topic"
          placeholder="All topics"
          data={topics}
          value={topic}
          onChange={setTopic}
          clearable
          searchable
        />
        {(year || type || topic) && (
          <Button variant="subtle" onClick={clear}>
            Clear filters
          </Button>
        )}
      </Group>
      <Text className={classes.count} size="sm" c="dimmed">
        Showing {filtered.length} of {publications.length}
      </Text>
      <div className={classes.list}>
        {filtered.map((publication) => (
          <PublicationCard publication={publication} headingOrder={2} key={publication.id} />
        ))}
        {!filtered.length && <Text c="dimmed">No publications match these filters.</Text>}
      </div>
    </div>
  )
}

export default PublicationFilters
