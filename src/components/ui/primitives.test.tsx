import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function openTrigger(el: HTMLElement) {
  // Radix v2/React 19 menus open on pointerdown; jsdom fireEvent cannot
  // fabricate a PointerEvent with a button, so dispatch the full gesture.
  fireEvent.pointerDown(el, { pointerId: 1, pointerType: 'mouse', button: 0 })
  fireEvent.mouseDown(el, { button: 0 })
  fireEvent.pointerUp(el, { pointerId: 1, pointerType: 'mouse', button: 0 })
  fireEvent.mouseUp(el, { button: 0 })
  fireEvent.click(el)
}

function DialogHarness() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Confirm</DialogTitle>
        <DialogDescription>Do you want to continue?</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

function SelectHarness() {
  return (
    <Select defaultValue="usd">
      <SelectTrigger className="w-[160px]" aria-label="Currency">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="usd">USD</SelectItem>
        <SelectItem value="eur">EUR</SelectItem>
        <SelectItem value="gbp">GBP</SelectItem>
      </SelectContent>
    </Select>
  )
}

describe('Radix primitives: roles, focus & keyboard behavior (jsdom)', () => {
  it('dialog: exposes role=dialog and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<DialogHarness />)

    await user.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('select: exposes a listbox and selects an option', async () => {
    render(<SelectHarness />)

    const trigger = screen.getByRole('combobox', { name: 'Currency' })
    expect(trigger).toHaveTextContent('USD')

    openTrigger(trigger)
    const listbox = await screen.findByRole('listbox', {}, { timeout: 2000 })
    expect(listbox).toBeInTheDocument()

    fireEvent.click(screen.getByRole('option', { name: 'EUR' }))
    expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveTextContent('EUR')
  })

  it('dropdown: trigger exposes an accessible menu button (open/nav covered in e2e)', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    const trigger = screen.getByRole('button', { name: 'Menu' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
  })
})
