import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

expect.extend(toHaveNoViolations)

function Boom({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('Kaboom from a crashing child')
  return <div>Recovered content</div>
}

function RepairableChild() {
  const [shouldThrow, setShouldThrow] = useState(true)
  return (
    <>
      <button type="button" onClick={() => setShouldThrow(false)}>
        Repair child
      </button>
      <ErrorBoundary>
        <Boom shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </>
  )
}

function ChildHealedOnRouteChange() {
  const [resetKey, setResetKey] = useState(1)
  return (
    <>
      <button type="button" onClick={() => setResetKey((key) => key + 1)}>
        Change route
      </button>
      <ErrorBoundary resetKeys={[resetKey]}>
        <Boom shouldThrow={resetKey === 1} />
      </ErrorBoundary>
    </>
  )
}

function silenceReactErrorLogging() {
  vi.spyOn(console, 'error').mockImplementation(() => {})
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('renders its children while nothing throws', () => {
    render(
      <ErrorBoundary>
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Recovered content')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the fallback with the error message when a child throws', () => {
    silenceReactErrorLogging()
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <Boom />
      </ErrorBoundary>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Something went wrong')
    expect(alert).toHaveTextContent('Kaboom from a crashing child')
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
  })

  it('keeps the error until reset, then re-renders the children', async () => {
    silenceReactErrorLogging()
    const user = userEvent.setup()

    render(<RepairableChild />)

    expect(screen.getByRole('alert')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Repair child' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByText('Recovered content')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('clears the error when a reset key changes', async () => {
    silenceReactErrorLogging()
    const user = userEvent.setup()

    render(<ChildHealedOnRouteChange />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Change route' }))
    expect(screen.getByText('Recovered content')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('has no accessibility violations on the fallback', async () => {
    silenceReactErrorLogging()
    const { container } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(await axe(container)).toHaveNoViolations()
  })
})
