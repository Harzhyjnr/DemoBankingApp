import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/shared/Spinner'
import { FieldError } from '@/components/shared/FieldError'
import { loginSchema, type LoginValues } from '@/lib/validation/auth'
import { zodToFieldErrors } from '@/lib/validation/formErrors'
import type { LoginPayload } from '@/lib/auth/authApi'
import { loginUser } from '@/lib/auth/authApi'
import { useAuthStore } from '@/lib/auth/authStore'
import { queryClient } from '@/app/queryClient'

type LoginVariables = LoginPayload & { rememberMe: boolean }

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const mutation = useMutation({
    mutationFn: ({ email, password }: LoginVariables) => loginUser({ email, password }),
    onSuccess: (data, { rememberMe }) => {
      login(data.token, data.user, rememberMe)
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
    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      clearErrors()
      const fieldErrors = zodToFieldErrors<LoginValues>(parsed.error)
      for (const [field, fieldError] of Object.entries(fieldErrors)) {
        if (fieldError) {
          setError(field as keyof LoginValues, {
            type: fieldError.type,
            message: fieldError.message,
          })
        }
      }
      return
    }
    try {
      await mutation.mutateAsync({ ...parsed.data })
    } catch {
      // Error surfaced through mutation.error for inline display.
    }
  })

  const fillDemoCredentials = () => {
    setValue('email', 'demo@bank.com', { shouldDirty: true })
    setValue('password', 'demo1234', { shouldDirty: true })
  }

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
            >
              <Mail className="size-4" />
            </span>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-9"
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
          </div>
          <FieldError id={errors.email ? 'email-error' : undefined}>
            {errors.email?.message}
          </FieldError>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
            >
              <Lock className="size-4" />
            </span>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="pl-9 pr-10"
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

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id="rememberMe" {...register('rememberMe')} />
            <Label htmlFor="rememberMe" className="cursor-pointer">
              Remember me
            </Label>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500" aria-hidden="true" />
            256-bit encryption
          </span>
        </div>

        <FieldError>{mutation.isError ? submitError : null}</FieldError>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="h-11 w-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700"
        >
          {mutation.isPending ? <Spinner label="Signing in" /> : 'Sign in'}
        </Button>
      </form>

      <div className="mt-5 rounded-2xl border border-dashed border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-4 dark:from-emerald-500/5 dark:to-teal-500/5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles
                className="size-4 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              Try the demo account
            </p>
            <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
              demo@bank.com / demo1234
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={fillDemoCredentials}
          >
            <KeyRound className="size-3.5" aria-hidden="true" />
            Use demo account
          </Button>
        </div>
      </div>
    </>
  )
}
