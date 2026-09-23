import { redirect } from 'next/navigation'
import { Alert, Container } from '@mantine/core'
import { getAdminSession } from '@/actions/admin'
import AdminPanel from '@/components/admin/admin-panel'
import { getAdminData } from '@/lib/admin-data'
import { isAdminConfigured } from '@/lib/admin-config'

const AdminPage = async () => {
  if (!isAdminConfigured()) {
    return (
      <Container size="md" py={80}>
        <Alert color="yellow" title="Admin setup required">
          Configure PostgreSQL and the administrator environment variables, deploy migrations, then run the seed
          command documented in the README.
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
      <Container size="md" py={80}>
        <Alert color="red" title="CMS database update required">
          Run <code>npm run db:deploy</code> and <code>npm run db:seed</code>, then refresh this page.
        </Alert>
      </Container>
    )
  }
}

export default AdminPage
