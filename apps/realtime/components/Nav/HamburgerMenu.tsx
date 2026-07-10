import React from 'react'
import { cn } from 'ui'

type HamburgerButtonProps = {
  toggleFlyOut: () => void
  expanded: boolean
}

const HamburgerButton = ({ toggleFlyOut, expanded }: HamburgerButtonProps) => (
  <div className="inset-y-0 flex items-center lg:hidden">
    <button
      onClick={toggleFlyOut}
      className={cn(
        'text-foreground-lighter focus-visible:ring-brand bg-transparent hover:text-foreground-light transition-colors hover:bg-overlay inline-flex items-center justify-center rounded-md p-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset'
      )}
      aria-expanded={expanded}
      aria-controls="mobile-menu"
    >
      <span className="sr-only">Open main menu</span>

      <svg
        className="block w-6 h-6"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  </div>
)

export default HamburgerButton
