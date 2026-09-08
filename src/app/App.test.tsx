import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import AppShell from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/app/queryClient'

expect.extend(toHaveNoViolations)

function RepresentativeForm() {
  return (
    <form
      aria-label="Representative form"
      onSubmit={(event) => event.preventDefault()}
      className="grid gap-4"
    >
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Ada" required />
      <Button type="submit">Save</Button>
    </form>
  )
}

function RepresentativeDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

describe('AppShell', () => {
  it('renders the page shell', () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    )
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('a11y: representative form + dialog', () => {
  it('has no accessibility violations on a form', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <RepresentativeForm />
      </QueryClientProvider>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations on an open dialog', async () => {
    const { container } = render(<RepresentativeDialog />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open dialog' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    // Radix focuses the dialog and aria-hides the background; axe the dialog node.
    expect(await axe(dialog)).toHaveNoViolations()
    expect(container).toBeTruthy()
  })
})
