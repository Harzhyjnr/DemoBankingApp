import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/shared/Spinner'
import { FieldError } from '@/components/shared/FieldError'
import { registerSchema, type RegisterValues } from '@/lib/validation/auth'
import { zodToFieldErrors } from '@/lib/validation/formErrors'
import { registerUser } from '@/lib/auth/authApi'
import { useAuthStore } from '@/lib/auth/authStore'
import { queryClient } from '@/app/queryClient'

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const mutation = useMutation({
    mutationFn: ({ firstName, lastName, email, password }: RegisterValues) =>
      registerUser({ firstName, lastName, email, password }),
    onSuccess: (data) => {
      login(data.token, data.user)
      queryClient.clear()
      const from = searchParams.get('from')
      navigate(from && from.startsWith('/') ? from : '/', { replace: true })
    },
  })

  const submitError =
    mutation.error instanceof Error
      ? mutation.error.message
      : 'Something went wrong. Please try again.'

  const onSubmit = handleSubmit(async (values) => {
    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      clearErrors()
      const fieldErrors = zodToFieldErrors<RegisterValues>(parsed.error)
      for (const [field, fieldError] of Object.entries(fieldErrors)) {
        if (fieldError) {
          setError(field as keyof RegisterValues, {
            type: fieldError.type,
            message: fieldError.message,
          })
        }
      }
      return
    }
    try {
      await mutation.mutateAsync(parsed.data)
    } catch {
      // Error surfaced through mutation.error for inline display.
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            aria-invalid={errors.firstName ? 'true' : undefined}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            {...register('firstName')}
          />
          <FieldError id={errors.firstName ? 'firstName-error' : undefined}>
            {errors.firstName?.message}
          </FieldError>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            aria-invalid={errors.lastName ? 'true' : undefined}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            {...register('lastName')}
          />
          <FieldError id={errors.lastName ? 'lastName-error' : undefined}>
            {errors.lastName?.message}
          </FieldError>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={errors.email ? 'true' : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        <FieldError id={errors.email ? 'email-error' : undefined}>
          {errors.email?.message}
        </FieldError>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className="pr-10"
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-0 h-full"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <FieldError id={errors.password ? 'password-error' : undefined}>
          {errors.password?.message}
        </FieldError>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.confirmPassword ? 'true' : undefined}
          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          {...register('confirmPassword')}
        />
        <FieldError id={errors.confirmPassword ? 'confirmPassword-error' : undefined}>
          {errors.confirmPassword?.message}
        </FieldError>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox id="acceptTerms" className="mt-1" {...register('acceptTerms')} />
        <Label htmlFor="acceptTerms" className="cursor-pointer font-normal leading-snug">
          I agree to the Terms of Service and Privacy Policy.
        </Label>
      </div>
      <FieldError>{errors.acceptTerms?.message}</FieldError>

      <FieldError>{mutation.isError ? submitError : null}</FieldError>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? <Spinner label="Creating account" /> : 'Create account'}
      </Button>
    </form>
  )
}
