'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from 'ui'

const THEMES = [
  { value: 'system', name: 'System' },
  { value: 'dark', name: 'Dark' },
  { value: 'light', name: 'Light' },
]

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  // next-themes resolves the active theme on the client only; render nothing
  // until mounted to avoid a hydration mismatch on the icon.
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center justify-center h-7 w-7 text-foreground-light rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-foreground-lighter',
            className
          )}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-[20px] w-[20px]" />
          ) : (
            <Sun className="h-[20px] w-[20px]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {THEMES.map((item) => (
            <DropdownMenuRadioItem key={item.value} value={item.value}>
              {item.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
