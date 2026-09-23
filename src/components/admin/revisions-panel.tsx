'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { HiOutlineArrowTopRightOnSquare, HiOutlineArrowUturnLeft } from 'react-icons/hi2'
import { rollbackRevision } from '@/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className={`${classes.formCard} flex flex-col gap-6`}>
      <div>
        <h2 className="text-xl font-bold tracking-tight">Revision history</h2>
        <p className="text-muted-foreground">
          Every publish is immutable. Rollback creates a new version and restores its draft.
        </p>
      </div>
      <Card className="gap-0 rounded-md py-4 shadow-none">
        <CardContent className="px-4">
          <h3 className="text-base font-semibold">Draft vs live</h3>
          <p className="mt-3 text-sm">Working draft: {draftSummary}</p>
          <p className="text-sm text-muted-foreground">
            Live revision: {live ? `v${live.version}` : 'none'}
            {data.state.hasUnpublishedChanges ? ' · unpublished changes pending' : ' · in sync'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Open Preview to compare the full draft visually against a historical revision.
          </p>
        </CardContent>
      </Card>
      <ResultAlert result={result} />
      {data.revisions.map((revision) => (
        <Card key={revision.id} className="gap-0 rounded-md py-4 shadow-none">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">Version {revision.version}</p>
                {revision.active ? <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">Live</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(revision.publishedAt).toLocaleString()} · {revision.publishedBy}
              </p>
              {revision.note ? <p className="mt-1">{revision.note}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="subtle">
                <Link href={`/admin/preview?revision=${revision.id}`} target="_blank">
                  <HiOutlineArrowTopRightOnSquare />
                  Preview
                </Link>
              </Button>
              <Button
                variant="light"
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
                <HiOutlineArrowUturnLeft />
                Roll back
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
