import type { ReactNode } from 'react'
import { Landmark } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Landmark className="h-6 w-6" aria-hidden="true" />
          <span className="font-semibold">Banking App</span>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
        {footer ? (
          <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}
