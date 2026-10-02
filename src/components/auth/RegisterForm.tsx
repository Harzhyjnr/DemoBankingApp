import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Fingerprint, Lock, Mail, ScanFace, ShieldCheck, User } from 'lucide-react'
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
  const [showConfirm, setShowConfirm] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      bvn: '',
      nin: '',
      acceptTerms: false,
    },
    mode: 'onSubmit',
  })

  const password = watch('password')
  const passwordStrength =
    password.length === 0
      ? ''
      : password.length < 8
        ? 'At least 8 characters required'
        : password.length < 12
          ? 'Good'
          : 'Strong'

  const mutation = useMutation({
    mutationFn: ({ firstName, lastName, email, password, bvn, nin }: RegisterValues) =>
      registerUser({ firstName, lastName, email, password, bvn, nin }),
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
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First name</Label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
            >
              <User className="size-4" />
            </span>
            <Input
              id="firstName"
              autoComplete="given-name"
              className="pl-9"
              aria-invalid={errors.firstName ? 'true' : undefined}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              {...register('firstName')}
            />
          </div>
          <FieldError id={errors.firstName ? 'firstName-error' : undefined}>
            {errors.firstName?.message}
          </FieldError>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
            >
              <User className="size-4" />
            </span>
            <Input
              id="lastName"
              autoComplete="family-name"
              className="pl-9"
              aria-invalid={errors.lastName ? 'true' : undefined}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              {...register('lastName')}
            />
          </div>
          <FieldError id={errors.lastName ? 'lastName-error' : undefined}>
            {errors.lastName?.message}
          </FieldError>
        </div>
      </div>

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

      <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 p-4 dark:from-emerald-500/5 dark:to-teal-500/5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <ShieldCheck
              className="size-4 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          </span>
          <div>
            <p className="text-sm font-semibold">Verify your identity</p>
            <p className="text-xs text-muted-foreground">
              We confirm your account with your government-issued IDs before activation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="bvn">BVN</Label>
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
              >
                <Fingerprint className="size-4" />
              </span>
              <Input
                id="bvn"
                inputMode="numeric"
                autoComplete="off"
                placeholder="11-digit BVN"
                maxLength={11}
                className="pl-9 pr-24 font-mono tabular-nums tracking-widest"
                aria-invalid={errors.bvn ? 'true' : undefined}
                aria-describedby={errors.bvn ? 'bvn-error' : undefined}
                {...register('bvn', {
                  onChange: (event) => {
                    event.target.value = event.target.value.replace(/\D/g, '').slice(0, 11)
                  },
                })}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] font-medium text-muted-foreground">
                {watch('bvn').length}/11
              </span>
            </div>
            <FieldError id={errors.bvn ? 'bvn-error' : undefined}>{errors.bvn?.message}</FieldError>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="nin">NIN</Label>
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
              >
                <ScanFace className="size-4" />
              </span>
              <Input
                id="nin"
                inputMode="numeric"
                autoComplete="off"
                placeholder="11-digit NIN"
                maxLength={11}
                className="pl-9 pr-24 font-mono tabular-nums tracking-widest"
                aria-invalid={errors.nin ? 'true' : undefined}
                aria-describedby={errors.nin ? 'nin-error' : undefined}
                {...register('nin', {
                  onChange: (event) => {
                    event.target.value = event.target.value.replace(/\D/g, '').slice(0, 11)
                  },
                })}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] font-medium text-muted-foreground">
                {watch('nin').length}/11
              </span>
            </div>
            <FieldError id={errors.nin ? 'nin-error' : undefined}>{errors.nin?.message}</FieldError>
          </div>
        </div>
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
            autoComplete="new-password"
            className="pl-9 pr-10"
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby={
              errors.password ? 'password-error' : passwordStrength ? 'password-hint' : undefined
            }
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
        {passwordStrength ? (
          <p id="password-hint" className="text-xs text-muted-foreground">
            {passwordStrength}
          </p>
        ) : null}
        <FieldError id={errors.password ? 'password-error' : undefined}>
          {errors.password?.message}
        </FieldError>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
          >
            <Lock className="size-4" />
          </span>
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            className="pl-9 pr-10"
            aria-invalid={errors.confirmPassword ? 'true' : undefined}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            {...register('confirmPassword')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-0 h-full"
            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            onClick={() => setShowConfirm((current) => !current)}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
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

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="h-11 w-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700"
      >
        {mutation.isPending ? <Spinner label="Creating account" /> : 'Create account'}
      </Button>
    </form>
  )
}
