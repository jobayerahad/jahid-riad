'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import { HiOutlineArrowTopRightOnSquare, HiOutlineArrowUturnLeft } from 'react-icons/hi2'
import { rollbackRevision } from '@/actions/admin'
import type { AdminData } from '@/lib/admin-data'
import type { AnyAdminActionResult } from '@/types/admin'
import { ResultAlert } from './form-support'
import classes from './styles.module.css'

export const RevisionsPanel = ({ data }: { data: AdminData }) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<AnyAdminActionResult | null>(null)
  const live = data.revisions.find((revision) => revision.active)
  const draftSummary = [
    `${data.draft.experiences.length} experience`,
    `${data.draft.publications.length} publications`,
    `${data.draft.capabilities.length} capabilities`,
    `${data.draft.education.length} education`,
    `${data.draft.learning.length} learning`,
    `${data.draft.workStories.length} work stories`
  ].join(' · ')

  return (
    <Stack className={classes.formCard} gap="lg">
      <div>
        <Title order={2}>Revision history</Title>
        <Text c="dimmed">Every publish is immutable. Rollback creates a new version and restores its draft.</Text>
      </div>
      <Card withBorder radius="md">
        <Title order={3} size="h4">
          Draft vs live
        </Title>
        <Text mt="sm" size="sm">
          Working draft: {draftSummary}
        </Text>
        <Text size="sm" c="dimmed">
          Live revision: {live ? `v${live.version}` : 'none'}
          {data.state.hasUnpublishedChanges ? ' · unpublished changes pending' : ' · in sync'}
        </Text>
        <Text size="sm" mt="xs" c="dimmed">
          Open Preview to compare the full draft visually against a historical revision.
        </Text>
      </Card>
      <ResultAlert result={result} />
      {data.revisions.map((revision) => (
        <Card key={revision.id} withBorder radius="md">
          <Group justify="space-between" align="center">
            <div>
              <Group gap="xs">
                <Text fw={700}>Version {revision.version}</Text>
                {revision.active && <Badge color="teal">Live</Badge>}
              </Group>
              <Text size="sm" c="dimmed">
                {new Date(revision.publishedAt).toLocaleString()} · {revision.publishedBy}
              </Text>
              {revision.note && <Text mt="xs">{revision.note}</Text>}
            </div>
            <Group gap="xs">
              <Button
                component={Link}
                href={`/admin/preview?revision=${revision.id}`}
                target="_blank"
                variant="subtle"
                leftSection={<HiOutlineArrowTopRightOnSquare />}
              >
                Preview
              </Button>
              <Button
                variant="light"
                leftSection={<HiOutlineArrowUturnLeft />}
                disabled={revision.active || pending}
                onClick={() => {
                  if (!window.confirm(`Publish a rollback to version ${revision.version}?`)) return
                  startTransition(async () => {
                    const response = await rollbackRevision(revision.id)
                    setResult(response)
                    if (response.ok) router.refresh()
                  })
                }}
              >
                Roll back
              </Button>
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  )
}
