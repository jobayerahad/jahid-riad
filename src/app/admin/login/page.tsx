import { redirect } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getAdminSession } from '@/actions/admin'
import AdminLoginForm from '@/components/admin/login-form'
import { isAdminConfigured } from '@/lib/admin-config'

const LoginPage = async () => {
  if (await getAdminSession()) redirect('/admin')

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="flex w-full flex-col items-center gap-4">
        {!isAdminConfigured() ? (
          <Alert className="w-full max-w-[440px] border-amber-200 bg-amber-50 text-amber-900">
            <AlertDescription>Complete admin configuration is required before sign-in.</AlertDescription>
          </Alert>
        ) : null}
        <AdminLoginForm />
      </div>
    </div>
  )
}

export default LoginPage
