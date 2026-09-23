import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
        <div className="flex flex-nowrap items-center justify-between gap-3">
          <div>
            <p className="font-bold">{label}</p>
            <p className="text-xs opacity-90">Only signed-in administrators can see this version.</p>
          </div>
          <Button asChild variant="white" size="sm">
            <Link href="/admin">Return to admin</Link>
          </Button>
        </div>
      </div>
      <div className={classes.preview}>
        <Home content={content} />
      </div>
    </>
  )
}

export default AdminPreviewPage
