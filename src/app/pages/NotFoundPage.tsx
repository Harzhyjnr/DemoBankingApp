import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Compass, Home, ReceiptText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 ring-1 ring-emerald-500/20">
        <Compass className="size-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <p className="text-5xl font-bold tracking-tight text-muted-foreground/40 tabular-nums">
          404
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Page not found</h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Nothing lives at{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs break-all">
            {pathname}
          </code>
          . The page may have moved, or the link may be wrong.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link to="/">
            <Home />
            Back to dashboard
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/transactions">
            <ReceiptText />
            View activity
          </Link>
        </Button>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft />
          Go back
        </Button>
      </div>
    </div>
  )
}
