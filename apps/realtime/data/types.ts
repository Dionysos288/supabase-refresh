import type { ComponentType } from 'react'

/** Props every nav icon renderer accepts — the lucide-compatible subset the menus use. */
export type NavIconProps = {
  size?: number | string
  strokeWidth?: number | string
  className?: string
}

export type NavIcon = ComponentType<NavIconProps>

/** A link entry in the nav dropdown columns. */
export type NavLink = {
  text: string
  description?: string
  url?: string
  icon?: NavIcon
}
