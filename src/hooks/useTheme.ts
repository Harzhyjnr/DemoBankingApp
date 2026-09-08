import { useCallback, useState } from 'react'
import { getTheme, setTheme, type Theme } from '@/lib/theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getTheme())

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      setTheme(next)
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
