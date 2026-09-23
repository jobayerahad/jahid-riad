'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Divider,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2'
import { saveAbout, saveProfileHero, saveSectionCopy, saveSettings } from '@/actions/admin'
import type { AdminData } from '@/lib/admin-data'
import type { AnyAdminActionResult } from '@/types/admin'
import { FormFooter, ResultAlert, useUnsavedWarning } from './form-support'
import classes from './styles.module.css'

type CommonProps = { data: AdminData }

const errorsFrom = (result: AnyAdminActionResult) => (!result.ok && result.fieldErrors ? result.fieldErrors : {})

const mediaOptions = (data: AdminData, kind: 'IMAGE' | 'PDF' = 'IMAGE') =>
  data.media
    .filter((asset) => asset.kind === kind)
    .map((asset) => ({ value: asset.id, label: asset.originalFilename || asset.publicId || asset.secureUrl }))

const platformOptions = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'scholar', label: 'Google Scholar' },
  { value: 'github', label: 'GitHub' },
  { value: 'orcid', label: 'ORCID' },
  { value: 'researchgate', label: 'ResearchGate' },
  { value: 'x', label: 'X' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Website' }
]

export const ProfileHeroForm = ({ data }: CommonProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const { profile, hero, copy, settings } = data.draft
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      ...profile,
      heading: hero?.heading ?? copy.heroHeading,
      accent: hero?.accent ?? copy.heroAccent,
      introduction: hero?.introduction ?? copy.heroIntroduction,
      primaryLabel: hero?.primaryLabel ?? copy.heroPrimaryLabel,
      primaryHref: hero?.primaryHref ?? copy.heroPrimaryHref,
      secondaryLabel: hero?.secondaryLabel ?? copy.heroSecondaryLabel,
      secondaryHref: hero?.secondaryHref ?? copy.heroSecondaryHref,
      focusLabel: hero?.focusLabel ?? copy.heroFocusLabel,
      heroImageId: settings.heroImageId ?? null,
      expectedUpdatedAt: data.timestamps.profile,
      expectedHeroUpdatedAt: data.timestamps.hero,
      expectedSettingsUpdatedAt: data.timestamps.settings
    }
  })
  useUnsavedWarning(form.isDirty())

  const submit = form.onSubmit((values) =>
    startTransition(async () => {
      setResult(null)
      const response = await saveProfileHero(values)
      setResult(response)
      if (!response.ok) form.setErrors(errorsFrom(response))
      else {
        form.resetDirty(values)
        router.refresh()
      }
    })
  )

  return (
    <form onSubmit={submit} className={classes.formCard}>
      <Stack gap="lg">
        <div>
          <Title order={2}>Profile & Hero</Title>
          <Text c="dimmed">Identity, positioning, hero copy, links, and portrait.</Text>
        </div>
        <ResultAlert result={result} />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Full name" required maxLength={120} {...form.getInputProps('name')} />
          <TextInput label="Short name" required maxLength={80} {...form.getInputProps('shortName')} />
          <TextInput label="Current role" required maxLength={120} {...form.getInputProps('role')} />
          <TextInput label="Location" required maxLength={160} {...form.getInputProps('location')} />
        </SimpleGrid>
        <TextInput label="Positioning line" required maxLength={180} {...form.getInputProps('positioning')} />
        <Textarea label="Professional summary" required minRows={3} maxLength={1200} {...form.getInputProps('summary')} />
        <Divider label="Hero copy" labelPosition="left" />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Heading" required {...form.getInputProps('heading')} />
          <TextInput label="Accent text" required {...form.getInputProps('accent')} />
        </SimpleGrid>
        <Textarea label="Introduction" required minRows={3} {...form.getInputProps('introduction')} />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Primary button label" required {...form.getInputProps('primaryLabel')} />
          <TextInput label="Primary button target" required {...form.getInputProps('primaryHref')} />
          <TextInput label="Secondary button label" required {...form.getInputProps('secondaryLabel')} />
          <TextInput label="Secondary button target" required {...form.getInputProps('secondaryHref')} />
          <TextInput label="Focus label" required {...form.getInputProps('focusLabel')} />
          <Select
            label="Hero portrait"
            searchable
            clearable
            data={mediaOptions(data)}
            {...form.getInputProps('heroImageId')}
          />
        </SimpleGrid>
        <Divider label="Professional links" labelPosition="left" />
        {form.values.socialLinks.map((link, index) => (
          <SimpleGrid key={link.id ?? index} cols={{ base: 1, sm: 4 }} className={classes.repeaterCard}>
            <Select label="Platform" data={platformOptions} {...form.getInputProps(`socialLinks.${index}.kind`)} />
            <TextInput label="Label" {...form.getInputProps(`socialLinks.${index}.label`)} />
            <TextInput label="URL" {...form.getInputProps(`socialLinks.${index}.href`)} />
            <Group align="flex-end">
              <Switch label="Visible" {...form.getInputProps(`socialLinks.${index}.enabled`, { type: 'checkbox' })} />
              <Button
                variant="subtle"
                color="red"
                leftSection={<HiOutlineTrash />}
                onClick={() => form.removeListItem('socialLinks', index)}
              >
                Remove
              </Button>
            </Group>
          </SimpleGrid>
        ))}
        <Button
          variant="light"
          leftSection={<HiOutlinePlus />}
          onClick={() => form.insertListItem('socialLinks', { label: '', href: '', kind: 'linkedin', enabled: true })}
        >
          Add professional link
        </Button>
        <FormFooter pending={pending} dirty={form.isDirty()} />
      </Stack>
    </form>
  )
}

export const AboutForm = ({ data }: CommonProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const principles = data.draft.principles.length
    ? data.draft.principles
    : data.draft.copy.principles.map((item, index) => ({
        id: item.id ?? `principle-${index + 1}`,
        title: item.title,
        text: item.text,
        enabled: item.enabled
      }))
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      aboutEyebrow: data.draft.copy.aboutEyebrow,
      aboutTitle: data.draft.copy.aboutTitle,
      aboutBody: data.draft.copy.aboutBody,
      aboutImageAlt: data.draft.copy.aboutImageAlt,
      aboutCaptionLabel: data.draft.copy.aboutCaptionLabel,
      principles,
      aboutImageId: data.draft.settings.aboutImageId ?? null,
      expectedUpdatedAt: data.timestamps.copy,
      expectedSettingsUpdatedAt: data.timestamps.settings
    }
  })
  useUnsavedWarning(form.isDirty())

  return (
    <form
      className={classes.formCard}
      onSubmit={form.onSubmit((values) =>
        startTransition(async () => {
          const response = await saveAbout(values)
          setResult(response)
          if (!response.ok) form.setErrors(errorsFrom(response))
          else {
            form.resetDirty(values)
            router.refresh()
          }
        })
      )}
    >
      <Stack gap="lg">
        <div>
          <Title order={2}>About</Title>
          <Text c="dimmed">Narrative, principles, and supporting image.</Text>
        </div>
        <ResultAlert result={result} />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Eyebrow" required {...form.getInputProps('aboutEyebrow')} />
          <TextInput label="Heading" required {...form.getInputProps('aboutTitle')} />
        </SimpleGrid>
        <Textarea label="About body" required minRows={5} maxLength={1600} {...form.getInputProps('aboutBody')} />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Select
            label="About image"
            searchable
            clearable
            data={mediaOptions(data)}
            {...form.getInputProps('aboutImageId')}
          />
          <TextInput label="Image alt text" required {...form.getInputProps('aboutImageAlt')} />
          <TextInput label="Image caption label" required {...form.getInputProps('aboutCaptionLabel')} />
        </SimpleGrid>
        <Divider label="Principles" labelPosition="left" />
        {form.values.principles.map((item, index) => (
          <SimpleGrid key={item.id ?? index} cols={{ base: 1, sm: 2 }} className={classes.repeaterCard}>
            <TextInput label="Title" required {...form.getInputProps(`principles.${index}.title`)} />
            <Textarea label="Explanation" required minRows={2} {...form.getInputProps(`principles.${index}.text`)} />
            <Switch label="Visible" {...form.getInputProps(`principles.${index}.enabled`, { type: 'checkbox' })} />
            <Button
              variant="subtle"
              color="red"
              leftSection={<HiOutlineTrash />}
              onClick={() => form.removeListItem('principles', index)}
            >
              Remove
            </Button>
          </SimpleGrid>
        ))}
        <Button
          variant="light"
          leftSection={<HiOutlinePlus />}
          onClick={() => form.insertListItem('principles', { id: crypto.randomUUID(), title: '', text: '', enabled: true })}
        >
          Add principle
        </Button>
        <FormFooter pending={pending} dirty={form.isDirty()} />
      </Stack>
    </form>
  )
}

type CopyMode = 'sections' | 'contact'

export const SectionCopyForm = ({ data, mode }: CommonProps & { mode: CopyMode }) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const sectionKeys =
    mode === 'contact'
      ? (['CONTACT'] as const)
      : (['EXPERIENCE', 'PUBLICATIONS', 'CAPABILITIES', 'EDUCATION', 'LEARNING', 'WORK'] as const)

  const sections = sectionKeys.map((section) => {
    const existing = data.draft.sections.find((item) => item.section === section)
    return {
      section,
      eyebrow: existing?.eyebrow ?? '',
      title: existing?.title ?? '',
      description: existing?.description ?? '',
      actionLabel: existing?.actionLabel ?? ''
    }
  })

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      sections,
      contactPanelTitle: data.draft.copy.contactPanelTitle,
      contactPrivacyCopy: data.draft.copy.contactPrivacyCopy,
      expectedUpdatedAt: data.timestamps.copy
    }
  })
  useUnsavedWarning(form.isDirty())

  return (
    <form
      className={classes.formCard}
      onSubmit={form.onSubmit((values) =>
        startTransition(async () => {
          const known = new Set(sectionKeys as readonly string[])
          const mergedSections =
            mode === 'contact'
              ? [
                  ...data.draft.sections.filter((item) => item.section !== 'CONTACT'),
                  ...values.sections
                ]
              : [
                  ...data.draft.sections.filter((item) => !known.has(item.section)),
                  ...values.sections
                ]
          const response = await saveSectionCopy({
            ...values,
            sections: mergedSections
          })
          setResult(response)
          if (!response.ok) form.setErrors(errorsFrom(response))
          else {
            form.resetDirty(values)
            router.refresh()
          }
        })
      )}
    >
      <Stack gap="lg">
        <div>
          <Title order={2}>{mode === 'contact' ? 'Contact copy' : 'Section copy'}</Title>
          <Text c="dimmed">
            {mode === 'contact' ? 'Contact section labels and privacy notice.' : 'Headings and descriptions for major sections.'}
          </Text>
        </div>
        <ResultAlert result={result} />
        {form.values.sections.map((section, index) => (
          <Stack key={section.section} className={classes.repeaterCard} gap="sm">
            <Text fw={700}>{section.section}</Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="Eyebrow" required {...form.getInputProps(`sections.${index}.eyebrow`)} />
              <TextInput label="Title" required {...form.getInputProps(`sections.${index}.title`)} />
            </SimpleGrid>
            <Textarea label="Description" required minRows={2} {...form.getInputProps(`sections.${index}.description`)} />
            {section.section === 'PUBLICATIONS' || section.section === 'CONTACT' ? (
              <TextInput label="Action label" {...form.getInputProps(`sections.${index}.actionLabel`)} />
            ) : null}
          </Stack>
        ))}
        {mode === 'contact' ? (
          <>
            <TextInput label="Panel title" required {...form.getInputProps('contactPanelTitle')} />
            <Textarea label="Privacy copy" required minRows={3} {...form.getInputProps('contactPrivacyCopy')} />
          </>
        ) : null}
        <FormFooter pending={pending} dirty={form.isDirty()} />
      </Stack>
    </form>
  )
}

export const SettingsForm = ({ data }: CommonProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const { settings } = data.draft
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      ...settings,
      keywords: settings.keywords,
      logoImageId: settings.logoImageId ?? null,
      openGraphImageId: settings.openGraphImageId ?? null,
      cvAssetId: settings.cvAssetId ?? null,
      expectedUpdatedAt: data.timestamps.settings
    }
  })
  useUnsavedWarning(form.isDirty())

  return (
    <form
      className={classes.formCard}
      onSubmit={form.onSubmit((values) =>
        startTransition(async () => {
          const response = await saveSettings(values)
          setResult(response)
          if (!response.ok) form.setErrors(errorsFrom(response))
          else {
            form.resetDirty(values)
            router.refresh()
          }
        })
      )}
    >
      <Stack gap="lg">
        <div>
          <Title order={2}>SEO & Settings</Title>
          <Text c="dimmed">Site metadata, social cards, logo, and CV.</Text>
        </div>
        <ResultAlert result={result} />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Site name" required {...form.getInputProps('siteName')} />
          <TextInput label="Site URL" required {...form.getInputProps('siteUrl')} />
          <TextInput label="Default title" required {...form.getInputProps('defaultTitle')} />
          <TextInput label="Title template" required {...form.getInputProps('titleTemplate')} />
        </SimpleGrid>
        <Textarea label="Meta description" required minRows={3} {...form.getInputProps('metaDescription')} />
        <TextInput
          label="Keywords"
          description="Comma-separated"
          value={form.values.keywords.join(', ')}
          onChange={(event) =>
            form.setFieldValue(
              'keywords',
              event.currentTarget.value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            )
          }
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Open Graph title" required {...form.getInputProps('openGraphTitle')} />
          <TextInput label="Twitter title" required {...form.getInputProps('twitterTitle')} />
        </SimpleGrid>
        <Textarea label="Open Graph description" required minRows={2} {...form.getInputProps('openGraphDescription')} />
        <Textarea label="Twitter description" required minRows={2} {...form.getInputProps('twitterDescription')} />
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Select label="Logo" searchable clearable data={mediaOptions(data)} {...form.getInputProps('logoImageId')} />
          <Select
            label="Open Graph image"
            searchable
            clearable
            data={mediaOptions(data)}
            {...form.getInputProps('openGraphImageId')}
          />
          <Select label="CV PDF" searchable clearable data={mediaOptions(data, 'PDF')} {...form.getInputProps('cvAssetId')} />
        </SimpleGrid>
        <FormFooter pending={pending} dirty={form.isDirty()} />
      </Stack>
    </form>
  )
}
