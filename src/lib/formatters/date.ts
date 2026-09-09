export function formatDate(iso: string): string {
  if (!iso) return ''
  const date = new Date(`${iso.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatMonthShort(month: string): string {
  const [year, monthIndex] = month.split('-').map(Number)
  if (!year || !monthIndex || monthIndex < 1 || monthIndex > 12) return month
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
    new Date(year, monthIndex - 1, 1),
  )
}
