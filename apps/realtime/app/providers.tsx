'use client'

import { ThemeProvider } from 'next-themes'

function Providers({ children }: { children: React.ReactNode }) {
  return (
    // attribute stays at the next-themes default (`data-theme`): the design
    // system's `dark:` variant matches [data-theme*='dark'], not a class
    <ThemeProvider
      themes={['dark', 'light']}
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}

export default Providers
