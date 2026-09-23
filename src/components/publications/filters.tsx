'use client'

import { useMemo, useState } from 'react'
import PublicationCard from '@/components/publication-card'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
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
  const types = useMemo(() => [...new Set(publications.map((item) => item.type))].sort(), [publications])
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
      <div className={`${classes.filters} flex flex-wrap items-end gap-3`}>
        <div className="grid min-w-[10rem] flex-1 gap-1.5">
          <Label htmlFor="filter-year">Year</Label>
          <Combobox
            id="filter-year"
            placeholder="All years"
            options={years.map((value) => ({ value, label: value }))}
            value={year}
            onChange={setYear}
            clearable
          />
        </div>
        <div className="grid min-w-[10rem] flex-1 gap-1.5">
          <Label htmlFor="filter-type">Type</Label>
          <Combobox
            id="filter-type"
            placeholder="All types"
            options={types.map((value) => ({ value, label: formatPublicationType(value) }))}
            value={type}
            onChange={setType}
            clearable
          />
        </div>
        <div className="grid min-w-[10rem] flex-1 gap-1.5">
          <Label htmlFor="filter-topic">Topic</Label>
          <Combobox
            id="filter-topic"
            placeholder="All topics"
            options={topics.map((value) => ({ value, label: value }))}
            value={topic}
            onChange={setTopic}
            clearable
          />
        </div>
        {(year || type || topic) && (
          <Button variant="subtle" onClick={clear}>
            Clear filters
          </Button>
        )}
      </div>
      <p className={`${classes.count} text-sm text-muted-foreground`}>
        Showing {filtered.length} of {publications.length}
      </p>
      <div className={classes.list}>
        {filtered.map((publication) => (
          <PublicationCard publication={publication} headingOrder={2} key={publication.id} />
        ))}
        {!filtered.length && <p className="text-muted-foreground">No publications match these filters.</p>}
      </div>
    </div>
  )
}

export default PublicationFilters
