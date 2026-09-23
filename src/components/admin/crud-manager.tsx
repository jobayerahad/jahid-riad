'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  Title
} from '@mantine/core'
import {
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineDocumentDuplicate,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineTrash
} from 'react-icons/hi2'
import {
  deleteCmsItem,
  duplicateCmsItem,
  moveCmsItem,
  saveCapability,
  saveEducation,
  saveExperience,
  saveLearning,
  savePublication,
  saveWorkStory
} from '@/actions/admin'
import type { AdminData } from '@/lib/admin-data'
import type { AnyAdminActionResult, CmsItemKind } from '@/types/admin'
import { RepeaterField, ResultAlert, useUnsavedWarning } from './form-support'
import classes from './styles.module.css'

type Editable = Record<string, unknown>
type AuthorRow = { name: string; isSelf: boolean }

const defaults: Record<CmsItemKind, Editable> = {
  experience: {
    organization: '',
    organizationUrl: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    summary: '',
    highlights: [''],
    enabled: true
  },
  publication: {
    title: '',
    slug: '',
    year: new Date().getFullYear(),
    month: null,
    type: 'JOURNAL_ARTICLE',
    status: 'PUBLISHED',
    venue: '',
    pages: '',
    doi: '',
    paperUrl: '',
    scholarUrl: '',
    abstract: '',
    bibtex: '',
    coverImageId: null,
    pdfAssetId: null,
    authors: [{ name: '', isSelf: false }],
    topics: [],
    featured: false,
    enabled: true
  },
  capability: { title: '', description: '', items: [], enabled: true },
  education: {
    institution: '',
    degree: '',
    location: '',
    startYear: 2020,
    endYear: null,
    detail: '',
    enabled: true
  },
  learning: {
    title: '',
    issuer: '',
    year: new Date().getFullYear(),
    credentialUrl: '',
    enabled: true
  },
  work: {
    title: '',
    body: '',
    evidence: '',
    href: '',
    linkLabel: '',
    visualLabel: '',
    enabled: true
  }
}

const titles: Record<CmsItemKind, string> = {
  experience: 'Experience',
  publication: 'Publication',
  capability: 'Capability group',
  education: 'Education',
  learning: 'Learning',
  work: 'Work story'
}

const publicationTypeOptions = [
  { value: 'JOURNAL_ARTICLE', label: 'Journal article' },
  { value: 'CONFERENCE_PAPER', label: 'Conference paper' },
  { value: 'WORKSHOP_PAPER', label: 'Workshop paper' },
  { value: 'BOOK_CHAPTER', label: 'Book chapter' },
  { value: 'PREPRINT', label: 'Preprint' },
  { value: 'THESIS', label: 'Thesis' },
  { value: 'OTHER', label: 'Other' }
]

const publicationStatusOptions = [
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'UNDER_REVIEW', label: 'Under review' },
  { value: 'PREPRINT', label: 'Preprint' }
]

const stringValue = (value: unknown) => (typeof value === 'string' ? value : '')
const numberValue = (value: unknown) => (typeof value === 'number' ? value : 0)
const boolValue = (value: unknown) => Boolean(value)
const arrayValue = (value: unknown) => (Array.isArray(value) ? value.map(String) : [])
const nullableNumber = (value: unknown) => (typeof value === 'number' ? value : null)

const authorsValue = (value: unknown): AuthorRow[] => {
  if (!Array.isArray(value)) return [{ name: '', isSelf: false }]
  return value.map((item) => {
    if (typeof item === 'string') return { name: item, isSelf: /jahid|riad/i.test(item) }
    if (item && typeof item === 'object' && 'name' in item) {
      const row = item as { name?: unknown; isSelf?: unknown }
      return { name: typeof row.name === 'string' ? row.name : '', isSelf: Boolean(row.isSelf) }
    }
    return { name: '', isSelf: false }
  })
}

const itemLabel = (kind: CmsItemKind, item: Editable) => {
  if (kind === 'experience') return `${stringValue(item.role)} · ${stringValue(item.organization)}`
  if (kind === 'publication') return stringValue(item.title)
  if (kind === 'capability') return stringValue(item.title)
  if (kind === 'learning') return `${stringValue(item.title)} · ${stringValue(item.issuer)}`
  if (kind === 'work') return stringValue(item.title)
  return `${stringValue(item.degree)} · ${stringValue(item.institution)}`
}

const mediaSelectData = (data: AdminData, kind: 'IMAGE' | 'PDF') =>
  data.media
    .filter((asset) => asset.kind === kind)
    .map((asset) => ({
      value: asset.id,
      label: asset.originalFilename || asset.publicId || asset.secureUrl
    }))

const ItemFields = ({
  kind,
  value,
  set,
  data
}: {
  kind: CmsItemKind
  value: Editable
  set: (key: string, value: unknown) => void
  data: AdminData
}) => {
  if (kind === 'experience') {
    return (
      <Stack>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Role"
            required
            value={stringValue(value.role)}
            onChange={(event) => set('role', event.currentTarget.value)}
          />
          <TextInput
            label="Organization"
            required
            value={stringValue(value.organization)}
            onChange={(event) => set('organization', event.currentTarget.value)}
          />
          <TextInput
            label="Organization URL"
            value={stringValue(value.organizationUrl)}
            onChange={(event) => set('organizationUrl', event.currentTarget.value)}
          />
          <TextInput
            label="Location"
            required
            value={stringValue(value.location)}
            onChange={(event) => set('location', event.currentTarget.value)}
          />
          <Switch
            label="Current role"
            checked={boolValue(value.current)}
            onChange={(event) => {
              const checked = event.currentTarget.checked
              set('current', checked)
              if (checked) set('endDate', '')
            }}
          />
          <TextInput
            type="date"
            label="Start date"
            required
            value={stringValue(value.startDate)}
            onChange={(event) => set('startDate', event.currentTarget.value)}
          />
          <TextInput
            type="date"
            label="End date"
            disabled={boolValue(value.current)}
            value={stringValue(value.endDate)}
            onChange={(event) => set('endDate', event.currentTarget.value)}
          />
        </SimpleGrid>
        <Textarea
          label="Role summary"
          description={`${stringValue(value.summary).length}/1200 characters`}
          required
          minRows={4}
          value={stringValue(value.summary)}
          onChange={(event) => set('summary', event.currentTarget.value)}
        />
        <RepeaterField
          label="Highlight"
          values={arrayValue(value.highlights)}
          onChange={(items) => set('highlights', items)}
          placeholder="Describe a responsibility or outcome"
        />
        <Switch
          label="Visible when published"
          checked={boolValue(value.enabled)}
          onChange={(event) => set('enabled', event.currentTarget.checked)}
        />
      </Stack>
    )
  }

  if (kind === 'publication') {
    const authors = authorsValue(value.authors)
    return (
      <Stack>
        <Textarea
          label="Paper title"
          required
          minRows={2}
          value={stringValue(value.title)}
          onChange={(event) => set('title', event.currentTarget.value)}
        />
        <TextInput
          label="Slug"
          description="Lowercase kebab-case URL segment"
          required
          value={stringValue(value.slug)}
          onChange={(event) => set('slug', event.currentTarget.value)}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <NumberInput
            label="Year"
            required
            min={1900}
            max={2200}
            value={numberValue(value.year)}
            onChange={(next) => set('year', Number(next))}
          />
          <NumberInput
            label="Month"
            min={1}
            max={12}
            value={nullableNumber(value.month) ?? undefined}
            onChange={(next) => set('month', next === '' || next == null ? null : Number(next))}
          />
          <Select
            label="Publication type"
            required
            data={publicationTypeOptions}
            value={stringValue(value.type) || null}
            onChange={(next) => set('type', next ?? 'JOURNAL_ARTICLE')}
          />
          <Select
            label="Status"
            required
            data={publicationStatusOptions}
            value={stringValue(value.status) || null}
            onChange={(next) => set('status', next ?? 'PUBLISHED')}
          />
          <TextInput
            label="Venue"
            value={stringValue(value.venue)}
            onChange={(event) => set('venue', event.currentTarget.value)}
          />
          <TextInput
            label="Pages"
            value={stringValue(value.pages)}
            onChange={(event) => set('pages', event.currentTarget.value)}
          />
          <TextInput
            label="DOI"
            value={stringValue(value.doi)}
            onChange={(event) => set('doi', event.currentTarget.value)}
          />
          <TextInput
            label="Paper URL"
            value={stringValue(value.paperUrl)}
            onChange={(event) => set('paperUrl', event.currentTarget.value)}
          />
          <TextInput
            label="Google Scholar URL"
            value={stringValue(value.scholarUrl)}
            onChange={(event) => set('scholarUrl', event.currentTarget.value)}
          />
        </SimpleGrid>
        <Textarea
          label="Abstract or short summary"
          description={`${stringValue(value.abstract).length}/2000 characters`}
          minRows={4}
          value={stringValue(value.abstract)}
          onChange={(event) => set('abstract', event.currentTarget.value)}
        />
        <Textarea
          label="BibTeX"
          description="Optional citation entry"
          minRows={4}
          value={stringValue(value.bibtex)}
          onChange={(event) => set('bibtex', event.currentTarget.value)}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Select
            label="Cover image"
            description="Optional image from the media library"
            searchable
            clearable
            data={mediaSelectData(data, 'IMAGE')}
            value={stringValue(value.coverImageId) || null}
            onChange={(next) => set('coverImageId', next)}
          />
          <Select
            label="PDF asset"
            description="Optional PDF from the media library"
            searchable
            clearable
            data={mediaSelectData(data, 'PDF')}
            value={stringValue(value.pdfAssetId) || null}
            onChange={(next) => set('pdfAssetId', next)}
          />
        </SimpleGrid>
        <Stack gap="xs">
          <Text fw={600} size="sm">
            Authors
          </Text>
          {authors.map((author, index) => (
            <SimpleGrid key={`author-${index}`} cols={{ base: 1, sm: 3 }} className={classes.repeaterCard}>
              <TextInput
                label="Name"
                required
                value={author.name}
                onChange={(event) =>
                  set(
                    'authors',
                    authors.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, name: event.currentTarget.value } : row
                    )
                  )
                }
              />
              <Switch
                label="This is me"
                checked={author.isSelf}
                onChange={(event) =>
                  set(
                    'authors',
                    authors.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, isSelf: event.currentTarget.checked } : row
                    )
                  )
                }
              />
              <Group align="end">
                <Button
                  type="button"
                  variant="subtle"
                  color="red"
                  leftSection={<HiOutlineTrash />}
                  disabled={authors.length <= 1}
                  onClick={() => set('authors', authors.filter((_, rowIndex) => rowIndex !== index))}
                >
                  Remove
                </Button>
              </Group>
            </SimpleGrid>
          ))}
          <Button
            type="button"
            variant="light"
            leftSection={<HiOutlinePlus />}
            onClick={() => set('authors', [...authors, { name: '', isSelf: false }])}
          >
            Add author
          </Button>
        </Stack>
        <TagsInput
          label="Topics"
          value={arrayValue(value.topics)}
          onChange={(items) => set('topics', items)}
          splitChars={[',']}
        />
        <Group>
          <Switch
            label="Featured on homepage"
            checked={boolValue(value.featured)}
            onChange={(event) => set('featured', event.currentTarget.checked)}
          />
          <Switch
            label="Visible when published"
            checked={boolValue(value.enabled)}
            onChange={(event) => set('enabled', event.currentTarget.checked)}
          />
        </Group>
      </Stack>
    )
  }

  if (kind === 'capability') {
    return (
      <Stack>
        <TextInput
          label="Group title"
          required
          value={stringValue(value.title)}
          onChange={(event) => set('title', event.currentTarget.value)}
        />
        <Textarea
          label="Description"
          required
          minRows={3}
          value={stringValue(value.description)}
          onChange={(event) => set('description', event.currentTarget.value)}
        />
        <TagsInput
          label="Skills and tools"
          value={arrayValue(value.items)}
          onChange={(items) => set('items', items)}
          splitChars={[',']}
        />
        <Switch
          label="Visible when published"
          checked={boolValue(value.enabled)}
          onChange={(event) => set('enabled', event.currentTarget.checked)}
        />
      </Stack>
    )
  }

  if (kind === 'learning') {
    return (
      <Stack>
        <TextInput
          label="Title"
          required
          value={stringValue(value.title)}
          onChange={(event) => set('title', event.currentTarget.value)}
        />
        <TextInput
          label="Issuer"
          required
          value={stringValue(value.issuer)}
          onChange={(event) => set('issuer', event.currentTarget.value)}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <NumberInput
            label="Year"
            min={1900}
            max={2200}
            value={nullableNumber(value.year) ?? undefined}
            onChange={(next) => set('year', next === '' || next == null ? null : Number(next))}
          />
          <TextInput
            label="Credential URL"
            value={stringValue(value.credentialUrl)}
            onChange={(event) => set('credentialUrl', event.currentTarget.value)}
          />
        </SimpleGrid>
        <Switch
          label="Visible when published"
          checked={boolValue(value.enabled)}
          onChange={(event) => set('enabled', event.currentTarget.checked)}
        />
      </Stack>
    )
  }

  if (kind === 'work') {
    return (
      <Stack>
        <TextInput
          label="Title"
          required
          value={stringValue(value.title)}
          onChange={(event) => set('title', event.currentTarget.value)}
        />
        <Textarea
          label="Body"
          required
          minRows={4}
          value={stringValue(value.body)}
          onChange={(event) => set('body', event.currentTarget.value)}
        />
        <TextInput
          label="Evidence"
          required
          value={stringValue(value.evidence)}
          onChange={(event) => set('evidence', event.currentTarget.value)}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label="Link"
            required
            value={stringValue(value.href)}
            onChange={(event) => set('href', event.currentTarget.value)}
          />
          <TextInput
            label="Link label"
            required
            value={stringValue(value.linkLabel)}
            onChange={(event) => set('linkLabel', event.currentTarget.value)}
          />
          <TextInput
            label="Visual label"
            required
            value={stringValue(value.visualLabel)}
            onChange={(event) => set('visualLabel', event.currentTarget.value)}
          />
        </SimpleGrid>
        <Switch
          label="Visible when published"
          checked={boolValue(value.enabled)}
          onChange={(event) => set('enabled', event.currentTarget.checked)}
        />
      </Stack>
    )
  }

  return (
    <Stack>
      <TextInput
        label="Degree or credential"
        required
        value={stringValue(value.degree)}
        onChange={(event) => set('degree', event.currentTarget.value)}
      />
      <TextInput
        label="Institution"
        required
        value={stringValue(value.institution)}
        onChange={(event) => set('institution', event.currentTarget.value)}
      />
      <TextInput
        label="Location"
        required
        value={stringValue(value.location)}
        onChange={(event) => set('location', event.currentTarget.value)}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <NumberInput
          label="Start year"
          min={1900}
          max={2200}
          value={numberValue(value.startYear)}
          onChange={(next) => set('startYear', Number(next))}
        />
        <NumberInput
          label="End year"
          min={1900}
          max={2200}
          value={nullableNumber(value.endYear) ?? undefined}
          onChange={(next) => set('endYear', next === '' || next == null ? null : Number(next))}
        />
      </SimpleGrid>
      <Textarea
        label="Details"
        minRows={4}
        value={stringValue(value.detail)}
        onChange={(event) => set('detail', event.currentTarget.value)}
      />
      <Switch
        label="Visible when published"
        checked={boolValue(value.enabled)}
        onChange={(event) => set('enabled', event.currentTarget.checked)}
      />
    </Stack>
  )
}

const itemsForKind = (kind: CmsItemKind, data: AdminData) => {
  if (kind === 'experience') return data.draft.experiences
  if (kind === 'publication') return data.draft.publications
  if (kind === 'capability') return data.draft.capabilities
  if (kind === 'education') return data.draft.education
  if (kind === 'learning') return data.draft.learning
  return data.draft.workStories
}

export const CrudManager = ({ kind, data }: { kind: CmsItemKind; data: AdminData }) => {
  const router = useRouter()
  const [opened, setOpened] = useState(false)
  const [value, setValue] = useState<Editable>({ ...defaults[kind] })
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const items = useMemo(() => itemsForKind(kind, data) as unknown as Editable[], [data, kind])
  const filtered = items.filter((item) => itemLabel(kind, item).toLowerCase().includes(search.toLowerCase()))
  const dirty = JSON.stringify(value) !== JSON.stringify(defaults[kind])
  useUnsavedWarning(opened && dirty)

  const openNew = () => {
    setValue({ ...defaults[kind] })
    setResult(null)
    setOpened(true)
  }
  const openEdit = (item: Editable) => {
    setValue({ ...item })
    setResult(null)
    setOpened(true)
  }
  const run = (task: () => Promise<AnyAdminActionResult>, close = false) =>
    startTransition(async () => {
      const response = await task()
      setResult(response)
      if (response.ok) {
        if (close) setOpened(false)
        router.refresh()
      }
    })
  const save = () => {
    const task =
      kind === 'experience'
        ? () => saveExperience(value)
        : kind === 'publication'
          ? () => savePublication(value)
          : kind === 'capability'
            ? () => saveCapability(value)
            : kind === 'education'
              ? () => saveEducation(value)
              : kind === 'learning'
                ? () => saveLearning(value)
                : () => saveWorkStory(value)
    run(task, true)
  }

  return (
    <Stack className={classes.formCard} gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>{titles[kind]}</Title>
          <Text c="dimmed">Add, edit, duplicate, hide, remove, and control display order.</Text>
        </div>
        <Button leftSection={<HiOutlinePlus />} onClick={openNew}>
          Add {titles[kind].toLowerCase()}
        </Button>
      </Group>
      <ResultAlert result={result} />
      {kind === 'publication' && (
        <TextInput
          placeholder="Search publications"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
      )}
      <Stack gap="sm">
        {filtered.map((item) => {
          const globalIndex = items.findIndex((candidate) => candidate.id === item.id)
          return (
            <Card withBorder radius="md" padding="md" key={stringValue(item.id)}>
              <Group justify="space-between" align="center" wrap="nowrap">
                <div className={classes.grow}>
                  <Group gap="xs">
                    <Text fw={700}>{itemLabel(kind, item)}</Text>
                    {!boolValue(item.enabled) && <Badge color="gray">Hidden</Badge>}
                  </Group>
                  {'year' in item && (
                    <Text size="sm" c="dimmed">
                      {stringValue(item.period) || (typeof item.year === 'number' ? item.year : '')}
                    </Text>
                  )}
                </div>
                <Group gap={4} wrap="nowrap">
                  <ActionIcon
                    variant="subtle"
                    aria-label="Move up"
                    disabled={globalIndex <= 0 || pending || Boolean(search.trim())}
                    onClick={() => run(() => moveCmsItem(kind, stringValue(item.id), 'up'))}
                  >
                    <HiOutlineArrowUp />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    aria-label="Move down"
                    disabled={globalIndex < 0 || globalIndex >= items.length - 1 || pending || Boolean(search.trim())}
                    onClick={() => run(() => moveCmsItem(kind, stringValue(item.id), 'down'))}
                  >
                    <HiOutlineArrowDown />
                  </ActionIcon>
                  <ActionIcon variant="subtle" aria-label="Edit" onClick={() => openEdit(item)}>
                    <HiOutlinePencilSquare />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    aria-label="Duplicate"
                    onClick={() => run(() => duplicateCmsItem(kind, stringValue(item.id)))}
                  >
                    <HiOutlineDocumentDuplicate />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label="Delete"
                    onClick={() => {
                      if (window.confirm('Remove this item from the draft?'))
                        run(() => deleteCmsItem(kind, stringValue(item.id)))
                    }}
                  >
                    <HiOutlineTrash />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          )
        })}
        {!filtered.length && <Text c="dimmed">No items found.</Text>}
      </Stack>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={`${stringValue(value.id) ? 'Edit' : 'Add'} ${titles[kind].toLowerCase()}`}
        size="lg"
        fullScreen={false}
      >
        <Stack>
          <ResultAlert result={result} />
          <ItemFields
            kind={kind}
            value={value}
            data={data}
            set={(key, next) => setValue((current) => ({ ...current, [key]: next }))}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button loading={pending} onClick={save}>
              Save draft
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
