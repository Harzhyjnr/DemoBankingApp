import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  resetKeys?: unknown[]
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

function resetKeysChanged(previous: unknown[] = [], next: unknown[] = []) {
  return (
    previous.length !== next.length || previous.some((key, index) => !Object.is(key, next[index]))
  )
}

// eslint-disable-next-line react-refresh/only-export-components
function ErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
        <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          This part of the app hit an unexpected error. Trying again usually clears it.
        </p>
      </div>
      <p className="max-w-md rounded-lg bg-muted/60 px-3 py-2 font-mono text-xs break-words text-muted-foreground">
        {error.message || 'Unknown error'}
      </p>
      <Button onClick={onReset}>
        <RotateCcw />
        Try again
      </Button>
    </div>
  )
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (this.state.error && resetKeysChanged(previousProps.resetKeys, this.props.resetKeys)) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (error) return <ErrorFallback error={error} onReset={this.reset} />
    return this.props.children
  }
}
