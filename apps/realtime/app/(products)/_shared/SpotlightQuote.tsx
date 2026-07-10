'use client'

import { useRef, useState } from 'react'
import { cn } from 'ui'

const SPOTLIGHT_RADIUS = 120

type Props = {
  className?: string
  children: React.ReactNode
}

export function SpotlightQuote({ className, children }: Props) {
  const textRef = useRef<HTMLDivElement>(null)
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = textRef.current?.getBoundingClientRect()
    if (!rect) return
    setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const mask = spot
    ? `radial-gradient(circle ${SPOTLIGHT_RADIUS}px at ${spot.x}px ${spot.y}px, black 0%, black 40%, transparent 100%)`
    : null

  return (
    // Padded hover zone (clipped by negative margin) so the spotlight
    // doesn't cut off the instant the cursor leaves the text itself
    <div
      className="-m-16 p-16"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setSpot(null)}
    >
      <div ref={textRef} className={cn('relative', className)}>
        <div className="text-foreground-lighter">{children}</div>
        {mask && (
          <div
            className="pointer-events-none absolute inset-0 text-foreground"
            style={{ WebkitMaskImage: mask, maskImage: mask }}
            aria-hidden
          >
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
