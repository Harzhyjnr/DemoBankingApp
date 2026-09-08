import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your accounts"
      footer={
        <p>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
