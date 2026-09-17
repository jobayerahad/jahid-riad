'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Badge,
  Burger,
  Button,
  Card,
  Drawer,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title
} from '@mantine/core'
import {
  HiOutlineAcademicCap,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBookOpen,
  HiOutlineBriefcase,
  HiOutlineChartBarSquare,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlinePhoto,
  HiOutlineRocketLaunch,
  HiOutlineUserCircle,
  HiOutlineWrenchScrewdriver
} from 'react-icons/hi2'
import { publishDraft } from '@/actions/admin'
import { authClient } from '@/lib/auth-client'
import type { AdminData } from '@/lib/admin-data'
import type { AnyAdminActionResult, CmsSection } from '@/types/admin'
import { AboutForm, ProfileHeroForm, SectionCopyForm, SettingsForm } from './simple-forms'
import { CrudManager } from './crud-manager'
import { MediaManager } from './media-manager'
import { RevisionsPanel } from './revisions-panel'
import { ResultAlert } from './form-support'
import classes from './styles.module.css'

const navigation: { id: CmsSection; label: string; icon: typeof HiOutlineHome }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { id: 'profile', label: 'Profile & Hero', icon: HiOutlineUserCircle },
  { id: 'about', label: 'About', icon: HiOutlineDocumentText },
  { id: 'experience', label: 'Experience', icon: HiOutlineBriefcase },
  { id: 'publications', label: 'Publications', icon: HiOutlineBookOpen },
  { id: 'capabilities', label: 'Capabilities', icon: HiOutlineWrenchScrewdriver },
  { id: 'education', label: 'Education', icon: HiOutlineAcademicCap },
  { id: 'contact', label: 'Contact copy', icon: HiOutlineChatBubbleLeftRight },
  { id: 'media', label: 'Media', icon: HiOutlinePhoto },
  { id: 'settings', label: 'SEO & Settings', icon: HiOutlineCog6Tooth },
  { id: 'revisions', label: 'Revisions', icon: HiOutlineClock }
]

const Dashboard = ({ data, navigate }: { data: AdminData; navigate: (section: CmsSection) => void }) => {
  const counts = [
    ['Experience', data.draft.experiences.length, 'experience'],
    ['Publications', data.draft.publications.length, 'publications'],
    ['Capabilities', data.draft.capabilities.length, 'capabilities'],
    ['Education', data.draft.education.length, 'education']
  ] as const
  const missing = [
    !data.draft.settings.heroImage && 'Hero portrait is missing',
    !data.draft.settings.openGraphImage && 'Custom social preview image is missing',
    !data.draft.settings.cvAsset && 'Public CV is not configured'
  ].filter(Boolean) as string[]

  return (
    <Stack gap="xl">
      <div>
        <Title order={1}>Dashboard</Title>
        <Text c="dimmed">Manage the working draft, preview it, and publish when ready.</Text>
      </div>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {counts.map(([label, count, section]) => (
          <Card key={label} withBorder radius="md" className={classes.statCard} onClick={() => navigate(section)}>
            <Text size="sm" c="dimmed">
              {label}
            </Text>
            <Text className={classes.statValue}>{count}</Text>
          </Card>
        ))}
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder radius="md">
          <Group justify="space-between">
            <Title order={2} size="h4">
              Publication status
            </Title>
            <Badge color={data.state.hasUnpublishedChanges ? 'orange' : 'teal'}>
              {data.state.hasUnpublishedChanges ? 'Draft changes' : 'Up to date'}
            </Badge>
          </Group>
          <Text mt="md">Live version: {data.state.version || 'Not published'}</Text>
          <Text size="sm" c="dimmed">
            Last published: {data.state.publishedAt ? new Date(data.state.publishedAt).toLocaleString() : 'Never'}
          </Text>
        </Card>
        <Card withBorder radius="md">
          <Title order={2} size="h4">
            Content checks
          </Title>
          {missing.length ? (
            <Stack gap={4} mt="md">
              {missing.map((item) => (
                <Text size="sm" key={item}>
                  • {item}
                </Text>
              ))}
            </Stack>
          ) : (
            <Text mt="md" c="teal">
              All recommended content is configured.
            </Text>
          )}
        </Card>
      </SimpleGrid>
    </Stack>
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
    <Stack gap={4}>
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
    </Stack>
  )

  const content =
    section === 'dashboard' ? (
      <Dashboard data={data} navigate={navigate} />
    ) : section === 'profile' ? (
      <ProfileHeroForm
        key={`${data.timestamps.profile}-${data.timestamps.copy}-${data.timestamps.settings}`}
        data={data}
      />
    ) : section === 'about' ? (
      <AboutForm key={`${data.timestamps.copy}-${data.timestamps.settings}`} data={data} />
    ) : section === 'experience' ? (
      <Stack gap="xl">
        <SectionCopyForm key={data.timestamps.copy} data={data} mode="sections" />
        <CrudManager kind="experience" data={data} />
      </Stack>
    ) : section === 'publications' ? (
      <CrudManager kind="publication" data={data} />
    ) : section === 'capabilities' ? (
      <CrudManager kind="capability" data={data} />
    ) : section === 'education' ? (
      <CrudManager kind="education" data={data} />
    ) : section === 'contact' ? (
      <SectionCopyForm key={data.timestamps.copy} data={data} mode="contact" />
    ) : section === 'media' ? (
      <MediaManager data={data} />
    ) : section === 'settings' ? (
      <SettingsForm key={data.timestamps.settings} data={data} />
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
        <Burger
          hiddenFrom="md"
          opened={drawerOpened}
          onClick={() => setDrawerOpened((opened) => !opened)}
          aria-label="Open admin navigation"
        />
        <Group gap="sm" ml="auto">
          <Badge color={data.state.hasUnpublishedChanges ? 'orange' : 'teal'} variant="light">
            {data.state.hasUnpublishedChanges ? 'Unpublished changes' : `Live v${data.state.version}`}
          </Badge>
          <Button
            component={Link}
            href="/admin/preview"
            target="_blank"
            variant="default"
            leftSection={<HiOutlineArrowTopRightOnSquare />}
          >
            Preview
          </Button>
          <Button
            leftSection={<HiOutlineRocketLaunch />}
            disabled={!data.state.hasUnpublishedChanges}
            onClick={() => setPublishOpened(true)}
          >
            Publish
          </Button>
          <Button
            variant="subtle"
            color="gray"
            onClick={() =>
              startTransition(async () => {
                await authClient.signOut()
                router.replace('/admin/login')
                router.refresh()
              })
            }
          >
            Sign out
          </Button>
        </Group>
      </header>
      <main className={classes.adminMain}>{content}</main>

      <Drawer opened={drawerOpened} onClose={() => setDrawerOpened(false)} title="Portfolio CMS" hiddenFrom="md">
        {nav}
      </Drawer>
      <Modal opened={publishOpened} onClose={() => setPublishOpened(false)} title="Publish portfolio">
        <Stack>
          <Text>The complete working draft will become public as a new immutable version.</Text>
          <Textarea
            label="Revision note"
            placeholder="What changed? (optional)"
            maxLength={160}
            value={note}
            onChange={(event) => setNote(event.currentTarget.value)}
          />
          <ResultAlert result={result} />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setPublishOpened(false)}>
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
          </Group>
        </Stack>
      </Modal>
    </div>
  )
}

export default AdminPanel
