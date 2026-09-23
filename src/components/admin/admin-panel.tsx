'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import {
  HiOutlineAcademicCap,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBars3,
  HiOutlineBookOpen,
  HiOutlineBriefcase,
  HiOutlineChartBarSquare,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineInbox,
  HiOutlineLightBulb,
  HiOutlineLockClosed,
  HiOutlinePhoto,
  HiOutlineRocketLaunch,
  HiOutlineSparkles,
  HiOutlineUserCircle,
  HiOutlineWrenchScrewdriver,
  HiOutlineXMark
} from 'react-icons/hi2'
import { changeAdminPassword, publishDraft, revokeAllAdminSessions, updateContactMessageStatus } from '@/actions/admin'
import { signOutAdmin } from '@/actions/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import type { AdminData } from '@/lib/admin-data'
import { changePasswordSchema } from '@/schemas/admin'
import type { AnyAdminActionResult, CmsSection } from '@/types/admin'
import { z } from 'zod'
import { AboutForm, ProfileHeroForm, SectionCopyForm, SettingsForm } from './simple-forms'
import { CrudManager } from './crud-manager'
import { MediaManager } from './media-manager'
import { RevisionsPanel } from './revisions-panel'
import { applyServerErrors, ResultAlert, useUnsavedWarning } from './form-support'
import classes from './styles.module.css'

type PasswordValues = z.infer<typeof changePasswordSchema>

const navigation: { id: CmsSection; label: string; icon: typeof HiOutlineHome }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { id: 'profile', label: 'Profile & Hero', icon: HiOutlineUserCircle },
  { id: 'about', label: 'About', icon: HiOutlineDocumentText },
  { id: 'experience', label: 'Experience', icon: HiOutlineBriefcase },
  { id: 'publications', label: 'Publications', icon: HiOutlineBookOpen },
  { id: 'capabilities', label: 'Capabilities', icon: HiOutlineWrenchScrewdriver },
  { id: 'education', label: 'Education', icon: HiOutlineAcademicCap },
  { id: 'learning', label: 'Learning', icon: HiOutlineLightBulb },
  { id: 'work', label: 'Work', icon: HiOutlineSparkles },
  { id: 'contact', label: 'Contact copy', icon: HiOutlineChatBubbleLeftRight },
  { id: 'messages', label: 'Messages', icon: HiOutlineInbox },
  { id: 'media', label: 'Media', icon: HiOutlinePhoto },
  { id: 'settings', label: 'SEO & Settings', icon: HiOutlineCog6Tooth },
  { id: 'revisions', label: 'Revisions', icon: HiOutlineClock },
  { id: 'account', label: 'Account', icon: HiOutlineLockClosed }
]

const messageStatusOptions = [
  { value: 'NEW', label: 'New' },
  { value: 'READ', label: 'Read' },
  { value: 'ARCHIVED', label: 'Archived' }
] as const

const Dashboard = ({ data, navigate }: { data: AdminData; navigate: (section: CmsSection) => void }) => {
  const counts = [
    ['Experience', data.draft.experiences.length, 'experience'],
    ['Publications', data.draft.publications.length, 'publications'],
    ['Capabilities', data.draft.capabilities.length, 'capabilities'],
    ['Education', data.draft.education.length, 'education'],
    ['Learning', data.draft.learning.length, 'learning'],
    ['Work', data.draft.workStories.length, 'work'],
    ['Messages', data.messages.length, 'messages']
  ] as const
  const missing = [
    !data.draft.settings.heroImage && 'Hero portrait is missing',
    !data.draft.settings.openGraphImage && 'Custom social preview image is missing',
    !data.draft.settings.cvAsset && 'Public CV is not configured'
  ].filter(Boolean) as string[]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Manage the working draft, preview it, and publish when ready.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map(([label, count, section]) => (
          <Card
            key={label}
            className={`cursor-pointer gap-0 rounded-md py-4 shadow-none ${classes.statCard}`}
            onClick={() => navigate(section)}
          >
            <CardContent className="px-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={classes.statValue}>{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="gap-0 rounded-md py-4 shadow-none">
          <CardContent className="px-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Publication status</h2>
              <Badge
                className={
                  data.state.hasUnpublishedChanges
                    ? 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                    : 'bg-teal-100 text-teal-800 hover:bg-teal-100'
                }
              >
                {data.state.hasUnpublishedChanges ? 'Draft changes' : 'Up to date'}
              </Badge>
            </div>
            <p className="mt-4">Live version: {data.state.version || 'Not published'}</p>
            <p className="text-sm text-muted-foreground">
              Last published: {data.state.publishedAt ? new Date(data.state.publishedAt).toLocaleString() : 'Never'}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 rounded-md py-4 shadow-none">
          <CardContent className="px-4">
            <h2 className="text-base font-semibold">Content checks</h2>
            {missing.length ? (
              <ul className="mt-4 space-y-1">
                {missing.map((item) => (
                  <li key={item} className="text-sm">
                    • {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-teal-700">All recommended content is configured.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const MessagesPanel = ({ data }: { data: AdminData }) => {
  const router = useRouter()
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className={`${classes.formCard} flex flex-col gap-6`}>
      <div>
        <h2 className="text-xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">Contact form submissions from the public site.</p>
      </div>
      <ResultAlert result={result} />
      {!data.messages.length ? <p className="text-muted-foreground">No messages yet.</p> : null}
      <div className="flex flex-col gap-3">
        {data.messages.map((message) => (
          <Card key={message.id} className="gap-0 rounded-md py-4 shadow-none">
            <CardContent className="flex flex-wrap items-start justify-between gap-4 px-4">
              <div className={classes.grow}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{message.subject}</p>
                  <Badge
                    className={
                      message.status === 'NEW'
                        ? 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                        : message.status === 'READ'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                          : undefined
                    }
                    variant={message.status === 'ARCHIVED' ? 'secondary' : 'default'}
                  >
                    {message.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {message.name} · {message.email} · {new Date(message.createdAt).toLocaleString()}
                </p>
                <p className="mt-3 whitespace-pre-wrap">{message.message}</p>
              </div>
              <Select
                value={message.status}
                disabled={pending}
                onValueChange={(next) => {
                  if (!next || next === message.status) return
                  startTransition(async () => {
                    const response = await updateContactMessageStatus(message.id, next as 'NEW' | 'READ' | 'ARCHIVED')
                    setResult(response)
                    if (response.ok) router.refresh()
                  })
                }}
              >
                <SelectTrigger className="h-[42px] w-40 rounded-sm" aria-label={`Status for ${message.subject}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {messageStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

const AccountPanel = () => {
  const router = useRouter()
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const [pending, startTransition] = useTransition()
  const form = useForm<PasswordValues>({
    resolver: zodResolver(changePasswordSchema) as Resolver<PasswordValues>,
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })
  useUnsavedWarning(form.formState.isDirty)

  return (
    <div className="flex flex-col gap-8">
      <Form {...form}>
        <form
          className={classes.formCard}
          onSubmit={form.handleSubmit((values) =>
            startTransition(async () => {
              const response = await changeAdminPassword(values)
              setResult(response)
              if (!response.ok) applyServerErrors(form, response.fieldErrors)
              if (response.ok) {
                form.reset({ currentPassword: '', newPassword: '', confirmPassword: '' })
                router.refresh()
              }
            })
          )}
        >
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Account</h2>
              <p className="text-muted-foreground">Change your admin password or revoke active sessions.</p>
            </div>
            <ResultAlert result={result} />
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormDescription>At least 12 characters</FormDescription>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-wrap items-center justify-end gap-3">
              {form.formState.isDirty ? <p className="text-sm text-orange-600">Unsaved changes</p> : null}
              <Button type="submit" loading={pending} disabled={!form.formState.isDirty}>
                Update password
              </Button>
            </div>
          </div>
        </form>
      </Form>
      <Card className={`gap-0 rounded-md py-4 shadow-none ${classes.formCard}`}>
        <CardContent className="flex flex-col gap-4 px-0 sm:px-0">
          <h3 className="text-base font-semibold">Sessions</h3>
          <p className="text-sm text-muted-foreground">
            Sign out every admin session, including this one. You will need to sign in again.
          </p>
          <Button
            variant="light"
            className="w-fit text-destructive"
            loading={pending}
            onClick={() => {
              if (!window.confirm('Revoke all admin sessions and sign out?')) return
              startTransition(async () => {
                const response = await revokeAllAdminSessions()
                setResult(response)
                if (response.ok) {
                  router.replace('/admin/login')
                  router.refresh()
                }
              })
            }}
          >
            Revoke all sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

const AdminPanel = ({ data }: { data: AdminData }) => {
  const router = useRouter()
  const [section, setSection] = useState<CmsSection>('dashboard')
  const [drawerOpened, setDrawerOpened] = useState(false)
  const [publishOpened, setPublishOpened] = useState(false)
  const [note, setNote] = useState('')
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const [pending, startTransition] = useTransition()

  const navigate = (next: CmsSection) => {
    setSection(next)
    setDrawerOpened(false)
    setResult(null)
  }
  const nav = (
    <nav className="flex flex-col gap-1">
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            className={classes.navItem}
            data-active={section === item.id || undefined}
            onClick={() => navigate(item.id)}
          >
            <Icon aria-hidden="true" />
            {item.label}
          </button>
        )
      })}
    </nav>
  )

  const content =
    section === 'dashboard' ? (
      <Dashboard data={data} navigate={navigate} />
    ) : section === 'profile' ? (
      <ProfileHeroForm
        key={`${data.timestamps.profile}-${data.timestamps.hero}-${data.timestamps.settings}`}
        data={data}
      />
    ) : section === 'about' ? (
      <AboutForm key={`${data.timestamps.copy}-${data.timestamps.settings}`} data={data} />
    ) : section === 'experience' ? (
      <div className="flex flex-col gap-8">
        <SectionCopyForm key={data.timestamps.copy} data={data} mode="sections" />
        <CrudManager kind="experience" data={data} />
      </div>
    ) : section === 'publications' ? (
      <CrudManager kind="publication" data={data} />
    ) : section === 'capabilities' ? (
      <CrudManager kind="capability" data={data} />
    ) : section === 'education' ? (
      <CrudManager kind="education" data={data} />
    ) : section === 'learning' ? (
      <CrudManager kind="learning" data={data} />
    ) : section === 'work' ? (
      <CrudManager kind="work" data={data} />
    ) : section === 'contact' ? (
      <SectionCopyForm key={data.timestamps.copy} data={data} mode="contact" />
    ) : section === 'messages' ? (
      <MessagesPanel data={data} />
    ) : section === 'media' ? (
      <MediaManager data={data} />
    ) : section === 'settings' ? (
      <SettingsForm key={data.timestamps.settings} data={data} />
    ) : section === 'account' ? (
      <AccountPanel />
    ) : (
      <RevisionsPanel data={data} />
    )

  return (
    <div className={classes.adminShell}>
      <aside className={classes.sidebar}>
        <div className={classes.brand}>
          <HiOutlineChartBarSquare />
          <div>
            <strong>Portfolio CMS</strong>
            <span>Content administration</span>
          </div>
        </div>
        {nav}
      </aside>
      <header className={classes.adminHeader}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={classes.menuButton}
          aria-label="Open admin navigation"
          onClick={() => setDrawerOpened((opened) => !opened)}
        >
          {drawerOpened ? <HiOutlineXMark /> : <HiOutlineBars3 />}
        </Button>
        <div className={classes.adminHeaderActions}>
          <Badge
            className={`${classes.adminHeaderBadge} ${
              data.state.hasUnpublishedChanges
                ? 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                : 'bg-teal-100 text-teal-800 hover:bg-teal-100'
            }`}
          >
            {data.state.hasUnpublishedChanges ? 'Unpublished changes' : `Live v${data.state.version}`}
          </Badge>
          <Button asChild variant="outline">
            <Link href="/admin/preview" target="_blank">
              <HiOutlineArrowTopRightOnSquare />
              Preview
            </Link>
          </Button>
          <Button disabled={!data.state.hasUnpublishedChanges} onClick={() => setPublishOpened(true)}>
            <HiOutlineRocketLaunch />
            Publish
          </Button>
          <Button
            variant="subtle"
            onClick={() =>
              startTransition(async () => {
                await signOutAdmin()
                router.replace('/admin/login')
                router.refresh()
              })
            }
          >
            Sign out
          </Button>
        </div>
      </header>
      <main className={classes.adminMain}>{content}</main>

      <Sheet open={drawerOpened} onOpenChange={setDrawerOpened}>
        <SheetContent side="left" className="bg-[var(--color-dark)] text-white sm:max-w-xs">
          <SheetHeader>
            <SheetTitle className="text-white">Portfolio CMS</SheetTitle>
          </SheetHeader>
          <div className="px-2">{nav}</div>
        </SheetContent>
      </Sheet>
      <Dialog open={publishOpened} onOpenChange={setPublishOpened}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish portfolio</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p>The complete working draft will become public as a new immutable version.</p>
            <div className="grid gap-2">
              <label htmlFor="publish-note" className="text-sm font-medium">
                Revision note
              </label>
              <Textarea
                id="publish-note"
                placeholder="What changed? (optional)"
                maxLength={160}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
            <ResultAlert result={result} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpened(false)}>
              Cancel
            </Button>
            <Button
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  const response = await publishDraft({ note })
                  setResult(response)
                  if (response.ok) {
                    setPublishOpened(false)
                    setNote('')
                    router.refresh()
                  }
                })
              }
            >
              Publish now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminPanel
