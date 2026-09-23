import type { PublishedPortfolioSnapshot } from '@/schemas/portfolio-content'

type Publication = PublishedPortfolioSnapshot['publications'][number]

const authorNames = (publication: Publication) =>
  publication.authors.map((author) => (typeof author === 'string' ? author : author.name))

const bibtexKey = (publication: Publication) => {
  const first = authorNames(publication)[0] ?? 'riad'
  const lastName =
    first
      .split(/\s+/)
      .at(-1)
      ?.replace(/[^a-zA-Z]/g, '') || 'riad'
  return `${lastName.toLowerCase()}${publication.year}${publication.slug.slice(0, 24).replace(/-/g, '')}`
}

const escapeBibtex = (value: string) => value.replace(/[{}]/g, '')

const entryType = (type: Publication['type']) => {
  switch (type) {
    case 'JOURNAL_ARTICLE':
      return 'article'
    case 'BOOK_CHAPTER':
      return 'incollection'
    case 'THESIS':
      return 'phdthesis'
    case 'PREPRINT':
      return 'misc'
    default:
      return 'inproceedings'
  }
}

export const formatPublicationType = (type: Publication['type'] | string) => {
  const labels: Record<string, string> = {
    JOURNAL_ARTICLE: 'Journal article',
    CONFERENCE_PAPER: 'Conference paper',
    WORKSHOP_PAPER: 'Workshop paper',
    BOOK_CHAPTER: 'Book chapter',
    PREPRINT: 'Preprint',
    THESIS: 'Thesis',
    OTHER: 'Publication'
  }
  return labels[type] ?? String(type)
}

export const generateBibtex = (publication: Publication) => {
  if (publication.bibtex?.trim()) return publication.bibtex.trim()

  const type = entryType(publication.type)
  const authors = authorNames(publication).map(escapeBibtex).join(' and ')
  const lines = [
    `@${type}{${bibtexKey(publication)},`,
    `  title = {${escapeBibtex(publication.title)}},`,
    `  author = {${authors}},`,
    `  year = {${publication.year}},`
  ]
  if (publication.month) lines.push(`  month = {${publication.month}},`)
  if (publication.venue) {
    const venueField = type === 'article' ? 'journal' : type === 'incollection' ? 'booktitle' : 'booktitle'
    lines.push(`  ${venueField} = {${escapeBibtex(publication.venue)}},`)
  }
  if (publication.pages) lines.push(`  pages = {${escapeBibtex(publication.pages)}},`)
  if (publication.doi) lines.push(`  doi = {${escapeBibtex(publication.doi)}},`)
  if (publication.paperUrl) lines.push(`  url = {${publication.paperUrl}},`)
  lines.push('}')
  return lines.join('\n')
}

export const normalizeAuthors = (
  authors: Publication['authors'] | Array<string | { name: string; isSelf?: boolean }>
) =>
  (authors ?? []).map((author) =>
    typeof author === 'string' ? { name: author, isSelf: /jahid|riad/i.test(author) } : author
  )
