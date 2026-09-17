import { redirect } from 'next/navigation'
import { Button, Group, Text } from '@mantine/core'
import { getAdminSession } from '@/actions/admin'
import Home from '@/components/home'
import { ensureCmsInitialized, readDraftSnapshot } from '@/lib/cms'
import { prisma } from '@/lib/prisma'
import { publishedPortfolioSnapshotSchema } from '@/schemas/portfolio-content'
import classes from './styles.module.css'

const AdminPreviewPage = async ({ searchParams }: { searchParams: Promise<{ revision?: string }> }) => {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  await ensureCmsInitialized(session.user.email)
  const { revision: revisionId } = await searchParams
  const revision = revisionId ? await prisma.contentRevision.findUnique({ where: { id: revisionId } }) : null
  const historical = revision ? publishedPortfolioSnapshotSchema.safeParse(revision.snapshot) : null
  const content = historical?.success ? historical.data : await readDraftSnapshot()
  const label = historical?.success ? `Version ${revision?.version} preview` : 'Draft preview'

  return (
    <>
      <div className={classes.banner} role="status">
        <Group justify="space-between" gap="sm" wrap="nowrap">
          <div>
            <Text fw={700}>{label}</Text>
            <Text size="xs">Only signed-in administrators can see this version.</Text>
          </div>
          <Button component="a" href="/admin" color="dark" variant="white" size="sm">
            Return to admin
          </Button>
        </Group>
      </div>
      <div className={classes.preview}>
        <Home content={content} />
      </div>
    </>
  )
}

export default AdminPreviewPage
