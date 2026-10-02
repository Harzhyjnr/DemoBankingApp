import type { ReactNode } from 'react'
import { ArrowRight, Coins, Headset, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/shared/Logo'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

const features = [
  { icon: Coins, text: 'Hold naira and crypto in a single wallet' },
  { icon: ShieldCheck, text: 'BVN + NIN-verified accounts, activated in minutes' },
  { icon: Sparkles, text: 'Smart insights that help your money grow' },
  { icon: Zap, text: 'Instant transfers, verified in a tap' },
]

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 p-12 text-white lg:flex">
        <div aria-hidden="true" className="absolute inset-0 bg-grid opacity-20 bg-radial-fade" />
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-32 -bottom-32 size-[28rem] rounded-full bg-emerald-300/20 blur-3xl"
        />

        <div className="relative">
          <Logo
            markClassName="bg-white/15 text-white shadow-none"
            className="text-white [&_span]:!text-white"
          />
        </div>

        <div className="relative max-w-md space-y-8">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            NIBSS-grade security standards
          </span>
          <h2 className="text-3xl leading-tight font-bold tracking-tight">
            Banking that feels{' '}
            <span className="underline decoration-white/40 underline-offset-8">instant</span>,
            everywhere.
          </h2>
          <ul className="space-y-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <li key={feature.text} className="flex items-center gap-3 text-sm text-white/85">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  {feature.text}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="relative flex flex-col gap-4 text-sm text-white/85">
          <div className="flex items-center gap-3">
            <Headset className="size-4 shrink-0" aria-hidden="true" />
            <span>24/7 support — we&apos;re here when you need us</span>
            <ArrowRight className="ml-auto size-4 shrink-0" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className="size-3.5 fill-current text-amber-300"
                  aria-hidden="true"
                />
              ))}
            </span>
            <span>4.9 · trusted by 2M+ customers</span>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="w-full max-w-md">
          <Card className="overflow-hidden border-border/70 bg-card/80 shadow-card-hover backdrop-blur">
            <div
              aria-hidden="true"
              className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
            />
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
          {footer ? (
            <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
