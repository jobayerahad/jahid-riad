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
  savePublication
} from '@/actions/admin'
import type { AdminData } from '@/lib/admin-data'
import type { AnyAdminActionResult, CmsItemKind } from '@/types/admin'
import { RepeaterField, ResultAlert, useUnsavedWarning } from './form-support'
import classes from './styles.module.css'

type Editable = Record<string, unknown>

const defaults: Record<CmsItemKind, Editable> = {
  experience: {
    organization: '',
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
    year: new Date().getFullYear(),
    type: 'Journal or conference paper',
    venue: '',
    pages: '',
    doi: '',
    paperUrl: '',
    scholarUrl: '',
    abstract: '',
    mediaAssetId: null,
    authors: [''],
    topics: [],
    featured: false,
    enabled: true
  },
  capability: { title: '', description: '', items: [], enabled: true },
  education: { institution: '', degree: '', location: '', startYear: 2020, endYear: 2024, detail: '', enabled: true }
}

const titles: Record<CmsItemKind, string> = {
  experience: 'Experience',
  publication: 'Publication',
  capability: 'Capability group',
  education: 'Education'
}

const stringValue = (value: unknown) => (typeof value === 'string' ? value : '')
const numberValue = (value: unknown) => (typeof value === 'number' ? value : 0)
const boolValue = (value: unknown) => Boolean(value)
const arrayValue = (value: unknown) => (Array.isArray(value) ? value.map(String) : [])

const itemLabel = (kind: CmsItemKind, item: Editable) => {
  if (kind === 'experience') return `${stringValue(item.role)} · ${stringValue(item.organization)}`
  if (kind === 'publication') return stringValue(item.title)
  if (kind === 'capability') return stringValue(item.title)
  return `${stringValue(item.degree)} · ${stringValue(item.institution)}`
}

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
            label="Location"
            required
            value={stringValue(value.location)}
            onChange={(event) => set('location', event.currentTarget.value)}
          />
          <Switch
            label="Current role"
            checked={boolValue(value.current)}
            onChange={(event) => set('current', event.currentTarget.checked)}
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
    return (
      <Stack>
        <Textarea
          label="Paper title"
          required
          minRows={2}
          value={stringValue(value.title)}
          onChange={(event) => set('title', event.currentTarget.value)}
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
          <TextInput
            label="Publication type"
            required
            value={stringValue(value.type)}
            onChange={(event) => set('type', event.currentTarget.value)}
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
        </SimpleGrid>
        <TextInput
          label="Google Scholar URL"
          required
          value={stringValue(value.scholarUrl)}
          onChange={(event) => set('scholarUrl', event.currentTarget.value)}
        />
        <Textarea
          label="Abstract or short summary"
          description={`${stringValue(value.abstract).length}/2000 characters`}
          minRows={4}
          value={stringValue(value.abstract)}
          onChange={(event) => set('abstract', event.currentTarget.value)}
        />
        <Select
          label="Publication image (optional)"
          description="Choose an image from the media library. Research cards remain metadata-first."
          searchable
          clearable
          data={data.media
            .filter((asset) => asset.kind === 'IMAGE')
            .map((asset) => ({
              value: asset.id,
              label: asset.originalFilename || asset.publicId || asset.secureUrl
            }))}
          value={stringValue(value.mediaAssetId) || null}
          onChange={(next) => set('mediaAssetId', next)}
        />
        <RepeaterField
          label="Author"
          values={arrayValue(value.authors)}
          onChange={(items) => set('authors', items)}
          placeholder="Author name"
        />
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
          value={numberValue(value.endYear)}
          onChange={(next) => set('endYear', Number(next))}
        />
      </SimpleGrid>
      <Textarea
        label="Details"
        required
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

export const CrudManager = ({ kind, data }: { kind: CmsItemKind; data: AdminData }) => {
  const router = useRouter()
  const [opened, setOpened] = useState(false)
  const [value, setValue] = useState<Editable>({ ...defaults[kind] })
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const items = useMemo(() => {
    const source =
      kind === 'experience'
        ? data.draft.experiences
        : kind === 'publication'
          ? data.draft.publications
          : kind === 'capability'
            ? data.draft.capabilities
            : data.draft.education
    return source as unknown as Editable[]
  }, [data, kind])
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
            : () => saveEducation(value)
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
        {filtered.map((item, index) => (
          <Card withBorder radius="md" padding="md" key={stringValue(item.id)}>
            <Group justify="space-between" align="center" wrap="nowrap">
              <div className={classes.grow}>
                <Group gap="xs">
                  <Text fw={700}>{itemLabel(kind, item)}</Text>
                  {!boolValue(item.enabled) && <Badge color="gray">Hidden</Badge>}
                </Group>
                {'year' in item && (
                  <Text size="sm" c="dimmed">
                    {stringValue(item.period) || numberValue(item.year)}
                  </Text>
                )}
              </div>
              <Group gap={4} wrap="nowrap">
                <ActionIcon
                  variant="subtle"
                  aria-label="Move up"
                  disabled={index === 0 || pending}
                  onClick={() => run(() => moveCmsItem(kind, stringValue(item.id), 'up'))}
                >
                  <HiOutlineArrowUp />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  aria-label="Move down"
                  disabled={index === filtered.length - 1 || pending}
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
        ))}
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
