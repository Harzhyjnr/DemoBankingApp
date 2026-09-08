import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your banking profile"
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}
