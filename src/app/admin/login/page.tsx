import { redirect } from 'next/navigation'
import { Alert, Center, Stack } from '@mantine/core'
import { getAdminSession } from '@/actions/admin'
import AdminLoginForm from '@/components/admin/login-form'
import { isAdminConfigured } from '@/lib/admin-config'

const LoginPage = async () => {
  if (await getAdminSession()) redirect('/admin')

  return (
    <Center mih="100svh" p="md">
      <Stack align="center" w="100%">
        {!isAdminConfigured() && <Alert color="yellow">Complete admin configuration is required before sign-in.</Alert>}
        <AdminLoginForm />
      </Stack>
    </Center>
  )
}

export default LoginPage
