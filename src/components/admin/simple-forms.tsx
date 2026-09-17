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
  TagsInput,
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

export const ProfileHeroForm = ({ data }: CommonProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const { profile, copy, settings } = data.draft
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      ...profile,
      heroHeading: copy.heroHeading,
      heroAccent: copy.heroAccent,
      heroIntroduction: copy.heroIntroduction,
      heroPrimaryLabel: copy.heroPrimaryLabel,
      heroPrimaryHref: copy.heroPrimaryHref,
      heroSecondaryLabel: copy.heroSecondaryLabel,
      heroSecondaryHref: copy.heroSecondaryHref,
      heroFocusLabel: copy.heroFocusLabel,
      heroImageId: settings.heroImageId ?? null,
      expectedUpdatedAt: data.timestamps.profile,
      expectedCopyUpdatedAt: data.timestamps.copy,
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
        <TextInput
          label="Positioning line"
          description="Short specialties shown above the hero heading."
          required
          maxLength={180}
          {...form.getInputProps('positioning')}
        />
        <Textarea
          label="Professional summary"
          description={`${form.values.summary.length}/1200 characters`}
          required
          minRows={3}
          maxLength={1200}
          {...form.getInputProps('summary')}
        />
        <Divider label="Hero copy" labelPosition="left" />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Heading" required maxLength={180} {...form.getInputProps('heroHeading')} />
          <TextInput label="Accent text" required maxLength={100} {...form.getInputProps('heroAccent')} />
        </SimpleGrid>
        <Textarea
          label="Introduction"
          description={`Use {name} and {role} placeholders if useful. ${form.values.heroIntroduction.length}/600 characters`}
          required
          minRows={3}
          maxLength={600}
          {...form.getInputProps('heroIntroduction')}
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Primary button label" required {...form.getInputProps('heroPrimaryLabel')} />
          <TextInput label="Primary button target" required {...form.getInputProps('heroPrimaryHref')} />
          <TextInput label="Secondary button label" required {...form.getInputProps('heroSecondaryLabel')} />
          <TextInput label="Secondary button target" required {...form.getInputProps('heroSecondaryHref')} />
          <TextInput label="Photo caption label" required {...form.getInputProps('heroFocusLabel')} />
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
            <Select
              label="Platform"
              data={[
                { value: 'linkedin', label: 'LinkedIn' },
                { value: 'scholar', label: 'Google Scholar' }
              ]}
              {...form.getInputProps(`socialLinks.${index}.kind`)}
            />
            <TextInput label="Label" {...form.getInputProps(`socialLinks.${index}.label`)} />
            <TextInput label="URL" {...form.getInputProps(`socialLinks.${index}.href`)} />
            <Group align="end">
              <Switch label="Visible" {...form.getInputProps(`socialLinks.${index}.enabled`, { type: 'checkbox' })} />
              <Button
                type="button"
                variant="subtle"
                color="red"
                onClick={() => form.removeListItem('socialLinks', index)}
                leftSection={<HiOutlineTrash />}
              >
                Remove
              </Button>
            </Group>
          </SimpleGrid>
        ))}
        <Button
          type="button"
          variant="light"
          className={classes.addRow}
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
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      aboutEyebrow: data.draft.copy.aboutEyebrow,
      aboutTitle: data.draft.copy.aboutTitle,
      aboutBody: data.draft.copy.aboutBody,
      aboutImageAlt: data.draft.copy.aboutImageAlt,
      aboutCaptionLabel: data.draft.copy.aboutCaptionLabel,
      principleOneTitle: data.draft.copy.principleOneTitle,
      principleOneText: data.draft.copy.principleOneText,
      principleTwoTitle: data.draft.copy.principleTwoTitle,
      principleTwoText: data.draft.copy.principleTwoText,
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
        <Textarea
          label="About body"
          description={`${form.values.aboutBody.length}/1600 characters`}
          required
          minRows={5}
          maxLength={1600}
          {...form.getInputProps('aboutBody')}
        />
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
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Stack>
            <TextInput label="First principle" required {...form.getInputProps('principleOneTitle')} />
            <Textarea label="Explanation" minRows={3} {...form.getInputProps('principleOneText')} />
          </Stack>
          <Stack>
            <TextInput label="Second principle" required {...form.getInputProps('principleTwoTitle')} />
            <Textarea label="Explanation" minRows={3} {...form.getInputProps('principleTwoText')} />
          </Stack>
        </SimpleGrid>
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
  const copy = data.draft.copy
  const form = useForm({ mode: 'controlled', initialValues: { ...copy, expectedUpdatedAt: data.timestamps.copy } })
  useUnsavedWarning(form.isDirty())
  const headerFields = [
    ['experience', 'Experience'],
    ['publications', 'Publications'],
    ['capabilities', 'Capabilities'],
    ['education', 'Education']
  ] as const
  return (
    <form
      className={classes.formCard}
      onSubmit={form.onSubmit((values) =>
        startTransition(async () => {
          const response = await saveSectionCopy(values)
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
          <Title order={2}>{mode === 'contact' ? 'Contact copy' : 'Section headings'}</Title>
          <Text c="dimmed">Edit visitor-facing labels and explanations.</Text>
        </div>
        <ResultAlert result={result} />
        {mode === 'sections' ? (
          headerFields.map(([prefix, label]) => (
            <Stack key={prefix} className={classes.repeaterCard}>
              <Title order={3} size="h4">
                {label}
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput label="Eyebrow" {...form.getInputProps(`${prefix}Eyebrow`)} />
                <TextInput label="Heading" {...form.getInputProps(`${prefix}Title`)} />
              </SimpleGrid>
              <Textarea label="Description" minRows={2} {...form.getInputProps(`${prefix}Description`)} />
              {prefix === 'publications' && (
                <TextInput label="View-all button label" {...form.getInputProps('publicationsActionLabel')} />
              )}
            </Stack>
          ))
        ) : (
          <Stack>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="Eyebrow" {...form.getInputProps('contactEyebrow')} />
              <TextInput label="Heading" {...form.getInputProps('contactTitle')} />
              <TextInput label="Information panel heading" {...form.getInputProps('contactPanelTitle')} />
            </SimpleGrid>
            <Textarea label="Section description" minRows={3} {...form.getInputProps('contactDescription')} />
            <Textarea label="Privacy and response copy" minRows={4} {...form.getInputProps('contactPrivacyCopy')} />
          </Stack>
        )}
        <FormFooter pending={pending} dirty={form.isDirty()} />
      </Stack>
    </form>
  )
}

export const SettingsForm = ({ data }: CommonProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const form = useForm({
    mode: 'controlled',
    initialValues: { ...data.draft.settings, expectedUpdatedAt: data.timestamps.settings }
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
          <Title order={2}>SEO & Site settings</Title>
          <Text c="dimmed">Search previews, social previews, logo, CV, and canonical identity.</Text>
        </div>
        <ResultAlert result={result} />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Site name" required {...form.getInputProps('siteName')} />
          <TextInput label="Canonical site URL" required {...form.getInputProps('siteUrl')} />
          <TextInput label="Default page title" required {...form.getInputProps('defaultTitle')} />
          <TextInput
            label="Title template"
            description="Use %s for the page title."
            required
            {...form.getInputProps('titleTemplate')}
          />
        </SimpleGrid>
        <Textarea
          label="Search description"
          description={`${form.values.metaDescription.length}/320 characters`}
          minRows={3}
          maxLength={320}
          required
          {...form.getInputProps('metaDescription')}
        />
        <TagsInput label="Search keywords" splitChars={[',']} {...form.getInputProps('keywords')} />
        <Divider label="Social previews" labelPosition="left" />
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Open Graph title" {...form.getInputProps('openGraphTitle')} />
          <TextInput label="Twitter title" {...form.getInputProps('twitterTitle')} />
          <Textarea label="Open Graph description" minRows={3} {...form.getInputProps('openGraphDescription')} />
          <Textarea label="Twitter description" minRows={3} {...form.getInputProps('twitterDescription')} />
          <Select label="Logo" searchable clearable data={mediaOptions(data)} {...form.getInputProps('logoImageId')} />
          <Select
            label="Social preview image"
            searchable
            clearable
            data={mediaOptions(data)}
            {...form.getInputProps('openGraphImageId')}
          />
          <Select
            label="Public CV"
            searchable
            clearable
            data={mediaOptions(data, 'PDF')}
            {...form.getInputProps('cvAssetId')}
          />
        </SimpleGrid>
        <FormFooter pending={pending} dirty={form.isDirty()} />
      </Stack>
    </form>
  )
}
