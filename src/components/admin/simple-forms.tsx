'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, type Resolver } from 'react-hook-form'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2'
import { z } from 'zod'
import { saveAbout, saveProfileHero, saveSectionCopy, saveSettings } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { AdminData } from '@/lib/admin-data'
import { aboutFormSchema, profileHeroFormSchema, sectionCopyFormSchema, settingsFormSchema } from '@/schemas/admin'
import type { AnyAdminActionResult } from '@/types/admin'
import { applyServerErrors, FormFooter, ResultAlert, useUnsavedWarning } from './form-support'
import classes from './styles.module.css'

type CommonProps = { data: AdminData }

type ProfileHeroValues = z.infer<typeof profileHeroFormSchema>
type AboutValues = z.infer<typeof aboutFormSchema>
type SectionCopyValues = z.infer<typeof sectionCopyFormSchema>
type SettingsValues = z.infer<typeof settingsFormSchema>

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

const SectionHeading = ({ title, description }: { title: string; description: string }) => (
  <div>
    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    <p className="text-muted-foreground">{description}</p>
  </div>
)

const DividerLabel = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3">
    <p className="shrink-0 text-sm font-semibold text-muted-foreground">{label}</p>
    <Separator className="flex-1" />
  </div>
)

export const ProfileHeroForm = ({ data }: CommonProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const { profile, hero, copy, settings } = data.draft
  const form = useForm<ProfileHeroValues>({
    resolver: zodResolver(profileHeroFormSchema) as Resolver<ProfileHeroValues>,
    defaultValues: {
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
  const socialLinks = useFieldArray({ control: form.control, name: 'socialLinks' })
  useUnsavedWarning(form.formState.isDirty)

  return (
    <Form {...form}>
      <form
        className={classes.formCard}
        onSubmit={form.handleSubmit((values) =>
          startTransition(async () => {
            setResult(null)
            const response = await saveProfileHero(values)
            setResult(response)
            if (!response.ok) applyServerErrors(form, response.fieldErrors)
            else {
              form.reset(values)
              router.refresh()
            }
          })
        )}
      >
        <div className="flex flex-col gap-6">
          <SectionHeading title="Profile & Hero" description="Identity, positioning, hero copy, links, and portrait." />
          <ResultAlert result={result} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input required maxLength={120} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short name</FormLabel>
                  <FormControl>
                    <Input required maxLength={80} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current role</FormLabel>
                  <FormControl>
                    <Input required maxLength={120} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input required maxLength={160} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="positioning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Positioning line</FormLabel>
                <FormControl>
                  <Input required maxLength={180} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional summary</FormLabel>
                <FormControl>
                  <Textarea required className="min-h-20" maxLength={1200} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DividerLabel label="Hero copy" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="heading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heading</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accent text</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="introduction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Introduction</FormLabel>
                <FormControl>
                  <Textarea required className="min-h-20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="primaryLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary button label</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="primaryHref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary button target</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondaryLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary button label</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondaryHref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary button target</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="focusLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Focus label</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="heroImageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hero portrait</FormLabel>
                  <FormControl>
                    <Combobox
                      clearable
                      options={mediaOptions(data)}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      placeholder="Select portrait"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DividerLabel label="Professional links" />
          {socialLinks.fields.map((link, index) => (
            <div key={link.id} className={`grid gap-4 sm:grid-cols-4 ${classes.repeaterCard}`}>
              <FormField
                control={form.control}
                name={`socialLinks.${index}.kind`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-[42px] w-full rounded-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platformOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`socialLinks.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`socialLinks.${index}.href`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-wrap items-end gap-3">
                <FormField
                  control={form.control}
                  name={`socialLinks.${index}.enabled`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0 pb-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Visible</FormLabel>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => socialLinks.remove(index)}
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
            onClick={() => socialLinks.append({ label: '', href: '', kind: 'linkedin', enabled: true })}
          >
            <HiOutlinePlus />
            Add professional link
          </Button>
          <FormFooter pending={pending} dirty={form.formState.isDirty} />
        </div>
      </form>
    </Form>
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
  const form = useForm<AboutValues>({
    resolver: zodResolver(aboutFormSchema) as Resolver<AboutValues>,
    defaultValues: {
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
  const principleFields = useFieldArray({ control: form.control, name: 'principles' })
  useUnsavedWarning(form.formState.isDirty)

  return (
    <Form {...form}>
      <form
        className={classes.formCard}
        onSubmit={form.handleSubmit((values) =>
          startTransition(async () => {
            const response = await saveAbout(values)
            setResult(response)
            if (!response.ok) applyServerErrors(form, response.fieldErrors)
            else {
              form.reset(values)
              router.refresh()
            }
          })
        )}
      >
        <div className="flex flex-col gap-6">
          <SectionHeading title="About" description="Narrative, principles, and supporting image." />
          <ResultAlert result={result} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="aboutEyebrow"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eyebrow</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aboutTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heading</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="aboutBody"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About body</FormLabel>
                <FormControl>
                  <Textarea required className="min-h-28" maxLength={1600} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="aboutImageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About image</FormLabel>
                  <FormControl>
                    <Combobox
                      clearable
                      options={mediaOptions(data)}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      placeholder="Select image"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aboutImageAlt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image alt text</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aboutCaptionLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image caption label</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DividerLabel label="Principles" />
          {principleFields.fields.map((item, index) => (
            <div key={item.id} className={`grid gap-4 sm:grid-cols-2 ${classes.repeaterCard}`}>
              <FormField
                control={form.control}
                name={`principles.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`principles.${index}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation</FormLabel>
                    <FormControl>
                      <Textarea required className="min-h-16" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`principles.${index}.enabled`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Visible</FormLabel>
                  </FormItem>
                )}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => principleFields.remove(index)}
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
            onClick={() => principleFields.append({ id: crypto.randomUUID(), title: '', text: '', enabled: true })}
          >
            <HiOutlinePlus />
            Add principle
          </Button>
          <FormFooter pending={pending} dirty={form.formState.isDirty} />
        </div>
      </form>
    </Form>
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

  const form = useForm<SectionCopyValues>({
    resolver: zodResolver(sectionCopyFormSchema) as Resolver<SectionCopyValues>,
    defaultValues: {
      sections,
      contactPanelTitle: data.draft.copy.contactPanelTitle,
      contactPrivacyCopy: data.draft.copy.contactPrivacyCopy,
      expectedUpdatedAt: data.timestamps.copy
    }
  })
  useUnsavedWarning(form.formState.isDirty)
  const watchedSections = form.watch('sections')

  return (
    <Form {...form}>
      <form
        className={classes.formCard}
        onSubmit={form.handleSubmit((values) =>
          startTransition(async () => {
            const known = new Set(sectionKeys as readonly string[])
            const mergedSections =
              mode === 'contact'
                ? [...data.draft.sections.filter((item) => item.section !== 'CONTACT'), ...values.sections]
                : [...data.draft.sections.filter((item) => !known.has(item.section)), ...values.sections]
            const response = await saveSectionCopy({
              ...values,
              sections: mergedSections
            })
            setResult(response)
            if (!response.ok) applyServerErrors(form, response.fieldErrors)
            else {
              form.reset(values)
              router.refresh()
            }
          })
        )}
      >
        <div className="flex flex-col gap-6">
          <SectionHeading
            title={mode === 'contact' ? 'Contact copy' : 'Section copy'}
            description={
              mode === 'contact'
                ? 'Contact section labels and privacy notice.'
                : 'Headings and descriptions for major sections.'
            }
          />
          <ResultAlert result={result} />
          {watchedSections.map((section, index) => (
            <div key={section.section} className={`flex flex-col gap-3 ${classes.repeaterCard}`}>
              <p className="font-bold">{section.section}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`sections.${index}.eyebrow`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eyebrow</FormLabel>
                      <FormControl>
                        <Input required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`sections.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name={`sections.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea required className="min-h-16" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {section.section === 'PUBLICATIONS' || section.section === 'CONTACT' ? (
                <FormField
                  control={form.control}
                  name={`sections.${index}.actionLabel`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action label</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>
          ))}
          {mode === 'contact' ? (
            <>
              <FormField
                control={form.control}
                name="contactPanelTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Panel title</FormLabel>
                    <FormControl>
                      <Input required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPrivacyCopy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy copy</FormLabel>
                    <FormControl>
                      <Textarea required className="min-h-20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : null}
          <FormFooter pending={pending} dirty={form.formState.isDirty} />
        </div>
      </form>
    </Form>
  )
}

export const SettingsForm = ({ data }: CommonProps) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const { settings } = data.draft
  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsFormSchema) as Resolver<SettingsValues>,
    defaultValues: {
      siteName: settings.siteName,
      siteUrl: settings.siteUrl,
      defaultTitle: settings.defaultTitle,
      titleTemplate: settings.titleTemplate,
      metaDescription: settings.metaDescription,
      keywords: settings.keywords,
      openGraphTitle: settings.openGraphTitle,
      openGraphDescription: settings.openGraphDescription,
      twitterTitle: settings.twitterTitle,
      twitterDescription: settings.twitterDescription,
      logoImageId: settings.logoImageId ?? null,
      openGraphImageId: settings.openGraphImageId ?? null,
      cvAssetId: settings.cvAssetId ?? null,
      expectedUpdatedAt: data.timestamps.settings
    }
  })
  useUnsavedWarning(form.formState.isDirty)

  return (
    <Form {...form}>
      <form
        className={classes.formCard}
        onSubmit={form.handleSubmit((values) =>
          startTransition(async () => {
            const response = await saveSettings(values)
            setResult(response)
            if (!response.ok) applyServerErrors(form, response.fieldErrors)
            else {
              form.reset(values)
              router.refresh()
            }
          })
        )}
      >
        <div className="flex flex-col gap-6">
          <SectionHeading title="SEO & Settings" description="Site metadata, social cards, logo, and CV." />
          <ResultAlert result={result} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site name</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="siteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site URL</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default title</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="titleTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title template</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta description</FormLabel>
                <FormControl>
                  <Textarea required className="min-h-20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords</FormLabel>
                <FormDescription>Comma-separated</FormDescription>
                <FormControl>
                  <Input
                    value={field.value.join(', ')}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="openGraphTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Open Graph title</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="twitterTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter title</FormLabel>
                  <FormControl>
                    <Input required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="openGraphDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Open Graph description</FormLabel>
                <FormControl>
                  <Textarea required className="min-h-16" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="twitterDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter description</FormLabel>
                <FormControl>
                  <Textarea required className="min-h-16" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="logoImageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <Combobox
                      clearable
                      options={mediaOptions(data)}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      placeholder="Select logo"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="openGraphImageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Open Graph image</FormLabel>
                  <FormControl>
                    <Combobox
                      clearable
                      options={mediaOptions(data)}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      placeholder="Select image"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cvAssetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CV PDF</FormLabel>
                  <FormControl>
                    <Combobox
                      clearable
                      options={mediaOptions(data, 'PDF')}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      placeholder="Select PDF"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormFooter pending={pending} dirty={form.formState.isDirty} />
        </div>
      </form>
    </Form>
  )
}
