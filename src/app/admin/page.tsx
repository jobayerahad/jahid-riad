import { redirect } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Container } from '@/components/ui/container'
import { getAdminSession } from '@/actions/admin'
import AdminPanel from '@/components/admin/admin-panel'
import { getAdminData } from '@/lib/admin-data'
import { isAdminConfigured } from '@/lib/admin-config'

const AdminPage = async () => {
  if (!isAdminConfigured()) {
    return (
      <Container size="md" className="py-20">
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertTitle>Admin setup required</AlertTitle>
          <AlertDescription>
            Configure PostgreSQL and the administrator environment variables, deploy migrations, then run the seed
            command documented in the README.
          </AlertDescription>
        </Alert>
      </Container>
    )
  }

  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  try {
    const data = await getAdminData(session.user.email)
    return <AdminPanel data={data} />
  } catch {
    return (
      <Container size="md" className="py-20">
        <Alert variant="destructive">
          <AlertTitle>CMS database update required</AlertTitle>
          <AlertDescription>
            Run <code>npm run db:deploy</code> and <code>npm run db:seed</code>, then refresh this page.
          </AlertDescription>
        </Alert>
      </Container>
    )
  }
}

export default AdminPage
