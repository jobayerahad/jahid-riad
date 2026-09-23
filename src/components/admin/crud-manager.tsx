'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { AdminData } from '@/lib/admin-data'
import type { AnyAdminActionResult, CmsItemKind } from '@/types/admin'
import { Field, RepeaterField, ResultAlert, TagsInput, useUnsavedWarning } from './form-support'
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

const SwitchRow = ({
  label,
  checked,
  onCheckedChange
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) => (
  <label className="flex items-center gap-3 text-sm font-medium">
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
    {label}
  </label>
)

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
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role">
            <Input required value={stringValue(value.role)} onChange={(e) => set('role', e.target.value)} />
          </Field>
          <Field label="Organization">
            <Input
              required
              value={stringValue(value.organization)}
              onChange={(e) => set('organization', e.target.value)}
            />
          </Field>
          <Field label="Organization URL">
            <Input
              value={stringValue(value.organizationUrl)}
              onChange={(e) => set('organizationUrl', e.target.value)}
            />
          </Field>
          <Field label="Location">
            <Input required value={stringValue(value.location)} onChange={(e) => set('location', e.target.value)} />
          </Field>
          <SwitchRow
            label="Current role"
            checked={boolValue(value.current)}
            onCheckedChange={(checked) => {
              set('current', checked)
              if (checked) set('endDate', '')
            }}
          />
          <Field label="Start date">
            <Input
              type="date"
              required
              value={stringValue(value.startDate)}
              onChange={(e) => set('startDate', e.target.value)}
            />
          </Field>
          <Field label="End date">
            <Input
              type="date"
              disabled={boolValue(value.current)}
              value={stringValue(value.endDate)}
              onChange={(e) => set('endDate', e.target.value)}
            />
          </Field>
        </div>
        <Field label="Role summary" description={`${stringValue(value.summary).length}/1200 characters`}>
          <Textarea
            required
            className="min-h-24"
            value={stringValue(value.summary)}
            onChange={(e) => set('summary', e.target.value)}
          />
        </Field>
        <RepeaterField
          label="Highlight"
          values={arrayValue(value.highlights)}
          onChange={(items) => set('highlights', items)}
          placeholder="Describe a responsibility or outcome"
        />
        <SwitchRow
          label="Visible when published"
          checked={boolValue(value.enabled)}
          onCheckedChange={(checked) => set('enabled', checked)}
        />
      </div>
    )
  }

  if (kind === 'publication') {
    const authors = authorsValue(value.authors)
    return (
      <div className="flex flex-col gap-4">
        <Field label="Paper title">
          <Textarea
            required
            className="min-h-16"
            value={stringValue(value.title)}
            onChange={(e) => set('title', e.target.value)}
          />
        </Field>
        <Field label="Slug" description="Lowercase kebab-case URL segment">
          <Input required value={stringValue(value.slug)} onChange={(e) => set('slug', e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Year">
            <Input
              type="number"
              required
              min={1900}
              max={2200}
              value={numberValue(value.year)}
              onChange={(e) => set('year', Number(e.target.value))}
            />
          </Field>
          <Field label="Month">
            <Input
              type="number"
              min={1}
              max={12}
              value={nullableNumber(value.month) ?? ''}
              onChange={(e) => set('month', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Publication type">
            <Select value={stringValue(value.type) || 'JOURNAL_ARTICLE'} onValueChange={(next) => set('type', next)}>
              <SelectTrigger className="h-[42px] w-full rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {publicationTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={stringValue(value.status) || 'PUBLISHED'} onValueChange={(next) => set('status', next)}>
              <SelectTrigger className="h-[42px] w-full rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {publicationStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Venue">
            <Input value={stringValue(value.venue)} onChange={(e) => set('venue', e.target.value)} />
          </Field>
          <Field label="Pages">
            <Input value={stringValue(value.pages)} onChange={(e) => set('pages', e.target.value)} />
          </Field>
          <Field label="DOI">
            <Input value={stringValue(value.doi)} onChange={(e) => set('doi', e.target.value)} />
          </Field>
          <Field label="Paper URL">
            <Input value={stringValue(value.paperUrl)} onChange={(e) => set('paperUrl', e.target.value)} />
          </Field>
          <Field label="Google Scholar URL">
            <Input value={stringValue(value.scholarUrl)} onChange={(e) => set('scholarUrl', e.target.value)} />
          </Field>
        </div>
        <Field label="Abstract or short summary" description={`${stringValue(value.abstract).length}/2000 characters`}>
          <Textarea
            className="min-h-24"
            value={stringValue(value.abstract)}
            onChange={(e) => set('abstract', e.target.value)}
          />
        </Field>
        <Field label="BibTeX" description="Optional citation entry">
          <Textarea
            className="min-h-24 font-mono text-sm"
            value={stringValue(value.bibtex)}
            onChange={(e) => set('bibtex', e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cover image" description="Optional image from the media library">
            <Combobox
              clearable
              options={mediaSelectData(data, 'IMAGE')}
              value={stringValue(value.coverImageId) || null}
              onChange={(next) => set('coverImageId', next)}
              placeholder="Select cover image"
            />
          </Field>
          <Field label="PDF asset" description="Optional PDF from the media library">
            <Combobox
              clearable
              options={mediaSelectData(data, 'PDF')}
              value={stringValue(value.pdfAssetId) || null}
              onChange={(next) => set('pdfAssetId', next)}
              placeholder="Select PDF"
            />
          </Field>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Authors</p>
          {authors.map((author, index) => (
            <div key={`author-${index}`} className={`grid gap-4 sm:grid-cols-3 ${classes.repeaterCard}`}>
              <Field label="Name">
                <Input
                  required
                  value={author.name}
                  onChange={(e) =>
                    set(
                      'authors',
                      authors.map((row, rowIndex) => (rowIndex === index ? { ...row, name: e.target.value } : row))
                    )
                  }
                />
              </Field>
              <SwitchRow
                label="This is me"
                checked={author.isSelf}
                onCheckedChange={(checked) =>
                  set(
                    'authors',
                    authors.map((row, rowIndex) => (rowIndex === index ? { ...row, isSelf: checked } : row))
                  )
                }
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={authors.length <= 1}
                  onClick={() =>
                    set(
                      'authors',
                      authors.filter((_, rowIndex) => rowIndex !== index)
                    )
                  }
                >
                  <HiOutlineTrash />
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="light"
            onClick={() => set('authors', [...authors, { name: '', isSelf: false }])}
          >
            <HiOutlinePlus />
            Add author
          </Button>
        </div>
        <TagsInput label="Topics" value={arrayValue(value.topics)} onChange={(items) => set('topics', items)} />
        <div className="flex flex-wrap gap-6">
          <SwitchRow
            label="Featured on homepage"
            checked={boolValue(value.featured)}
            onCheckedChange={(checked) => set('featured', checked)}
          />
          <SwitchRow
            label="Visible when published"
            checked={boolValue(value.enabled)}
            onCheckedChange={(checked) => set('enabled', checked)}
          />
        </div>
      </div>
    )
  }

  if (kind === 'capability') {
    return (
      <div className="flex flex-col gap-4">
        <Field label="Group title">
          <Input required value={stringValue(value.title)} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <Field label="Description">
          <Textarea
            required
            className="min-h-20"
            value={stringValue(value.description)}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
        <TagsInput label="Skills and tools" value={arrayValue(value.items)} onChange={(items) => set('items', items)} />
        <SwitchRow
          label="Visible when published"
          checked={boolValue(value.enabled)}
          onCheckedChange={(checked) => set('enabled', checked)}
        />
      </div>
    )
  }

  if (kind === 'learning') {
    return (
      <div className="flex flex-col gap-4">
        <Field label="Title">
          <Input required value={stringValue(value.title)} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <Field label="Issuer">
          <Input required value={stringValue(value.issuer)} onChange={(e) => set('issuer', e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Year">
            <Input
              type="number"
              min={1900}
              max={2200}
              value={nullableNumber(value.year) ?? ''}
              onChange={(e) => set('year', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Credential URL">
            <Input value={stringValue(value.credentialUrl)} onChange={(e) => set('credentialUrl', e.target.value)} />
          </Field>
        </div>
        <SwitchRow
          label="Visible when published"
          checked={boolValue(value.enabled)}
          onCheckedChange={(checked) => set('enabled', checked)}
        />
      </div>
    )
  }

  if (kind === 'work') {
    return (
      <div className="flex flex-col gap-4">
        <Field label="Title">
          <Input required value={stringValue(value.title)} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <Field label="Body">
          <Textarea
            required
            className="min-h-24"
            value={stringValue(value.body)}
            onChange={(e) => set('body', e.target.value)}
          />
        </Field>
        <Field label="Evidence">
          <Input required value={stringValue(value.evidence)} onChange={(e) => set('evidence', e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Link">
            <Input required value={stringValue(value.href)} onChange={(e) => set('href', e.target.value)} />
          </Field>
          <Field label="Link label">
            <Input required value={stringValue(value.linkLabel)} onChange={(e) => set('linkLabel', e.target.value)} />
          </Field>
          <Field label="Visual label">
            <Input
              required
              value={stringValue(value.visualLabel)}
              onChange={(e) => set('visualLabel', e.target.value)}
            />
          </Field>
        </div>
        <SwitchRow
          label="Visible when published"
          checked={boolValue(value.enabled)}
          onCheckedChange={(checked) => set('enabled', checked)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Degree or credential">
        <Input required value={stringValue(value.degree)} onChange={(e) => set('degree', e.target.value)} />
      </Field>
      <Field label="Institution">
        <Input required value={stringValue(value.institution)} onChange={(e) => set('institution', e.target.value)} />
      </Field>
      <Field label="Location">
        <Input required value={stringValue(value.location)} onChange={(e) => set('location', e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start year">
          <Input
            type="number"
            min={1900}
            max={2200}
            value={numberValue(value.startYear)}
            onChange={(e) => set('startYear', Number(e.target.value))}
          />
        </Field>
        <Field label="End year">
          <Input
            type="number"
            min={1900}
            max={2200}
            value={nullableNumber(value.endYear) ?? ''}
            onChange={(e) => set('endYear', e.target.value === '' ? null : Number(e.target.value))}
          />
        </Field>
      </div>
      <Field label="Details">
        <Textarea
          className="min-h-24"
          value={stringValue(value.detail)}
          onChange={(e) => set('detail', e.target.value)}
        />
      </Field>
      <SwitchRow
        label="Visible when published"
        checked={boolValue(value.enabled)}
        onCheckedChange={(checked) => set('enabled', checked)}
      />
    </div>
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
    <div className={`${classes.formCard} flex flex-col gap-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{titles[kind]}</h2>
          <p className="text-muted-foreground">Add, edit, duplicate, hide, remove, and control display order.</p>
        </div>
        <Button onClick={openNew}>
          <HiOutlinePlus />
          Add {titles[kind].toLowerCase()}
        </Button>
      </div>
      <ResultAlert result={result} />
      {kind === 'publication' ? (
        <Input placeholder="Search publications" value={search} onChange={(event) => setSearch(event.target.value)} />
      ) : null}
      <div className="flex flex-col gap-3">
        {filtered.map((item) => {
          const globalIndex = items.findIndex((candidate) => candidate.id === item.id)
          return (
            <Card key={stringValue(item.id)} className="gap-0 rounded-md py-4 shadow-none">
              <CardContent className="flex items-center justify-between gap-3 px-4">
                <div className={classes.grow}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{itemLabel(kind, item)}</p>
                    {!boolValue(item.enabled) ? <Badge variant="secondary">Hidden</Badge> : null}
                  </div>
                  {'year' in item ? (
                    <p className="text-sm text-muted-foreground">
                      {stringValue(item.period) || (typeof item.year === 'number' ? item.year : '')}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Move up"
                    disabled={globalIndex <= 0 || pending || Boolean(search.trim())}
                    onClick={() => run(() => moveCmsItem(kind, stringValue(item.id), 'up'))}
                  >
                    <HiOutlineArrowUp />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Move down"
                    disabled={globalIndex < 0 || globalIndex >= items.length - 1 || pending || Boolean(search.trim())}
                    onClick={() => run(() => moveCmsItem(kind, stringValue(item.id), 'down'))}
                  >
                    <HiOutlineArrowDown />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => openEdit(item)}>
                    <HiOutlinePencilSquare />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Duplicate"
                    onClick={() => run(() => duplicateCmsItem(kind, stringValue(item.id)))}
                  >
                    <HiOutlineDocumentDuplicate />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    aria-label="Delete"
                    onClick={() => {
                      if (window.confirm('Remove this item from the draft?'))
                        run(() => deleteCmsItem(kind, stringValue(item.id)))
                    }}
                  >
                    <HiOutlineTrash />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {!filtered.length ? <p className="text-muted-foreground">No items found.</p> : null}
      </div>

      <Dialog open={opened} onOpenChange={setOpened}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{`${stringValue(value.id) ? 'Edit' : 'Add'} ${titles[kind].toLowerCase()}`}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <ResultAlert result={result} />
            <ItemFields
              kind={kind}
              value={value}
              data={data}
              set={(key, next) => setValue((current) => ({ ...current, [key]: next }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button loading={pending} onClick={save}>
              Save draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
