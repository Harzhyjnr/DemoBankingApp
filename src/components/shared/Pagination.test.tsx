import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from '@/components/shared/Pagination'

describe('Pagination', () => {
  it('shows the current page, total pages and total results', () => {
    render(<Pagination page={2} totalPages={10} total={250} onPageChange={() => {}} />)
    expect(screen.getByText('Showing page 2 of 10 (250 results)')).toBeInTheDocument()
  })

  it('disables previous on the first page and next on the last page', () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={10} total={250} onPageChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()

    rerender(<Pagination page={10} totalPages={10} total={250} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('calls onPageChange with the next and previous pages', async () => {
    const onPageChange = vi.fn()
    const user = userEvent.setup()
    render(<Pagination page={3} totalPages={10} total={250} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(4)

    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
