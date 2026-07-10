'use client'

/* ─────────────────────────────────────────────────────────
 * MORPH BUTTON
 *
 * click   width morphs to fit the new label (layout spring)
 *         old label fades out fast (120ms — system response)
 *         new label text-morphs in character by character
 *         (15ms stagger, rise + blur sharpen)
 * press   scale 0.97 for physical feedback
 * busy    disabled until the morph returns to idle
 * ───────────────────────────────────────────────────────── */

import { motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from 'ui'

import { MORPH } from '@/lib/animations'
import { MorphLabel } from './MorphLabel'

type MorphButtonProps = {
  morphed: boolean
  idleLabel: string
  morphedLabel: string
  onClick: () => void
  className?: string
  'aria-label'?: string
}

export function MorphButton({
  morphed,
  idleLabel,
  morphedLabel,
  onClick,
  className,
  'aria-label': ariaLabel,
}: MorphButtonProps) {
  const label = morphed ? morphedLabel : idleLabel

  // Chars only morph after the first interaction — never on mount,
  // so a grid full of buttons doesn't type itself in at page load.
  const [everMorphed, setEverMorphed] = useState(false)

  const handleClick = () => {
    if (morphed) return
    setEverMorphed(true)
    onClick()
  }

  return (
    <motion.button
      type="button"
      layout="size"
      transition={MORPH.width}
      whileTap={morphed ? undefined : { scale: 0.97 }}
      onClick={handleClick}
      disabled={morphed}
      aria-label={ariaLabel}
      aria-disabled={morphed}
      className={cn(
        'inline-flex items-center overflow-hidden whitespace-nowrap',
        morphed && 'pointer-events-none',
        className
      )}
    >
      <MorphLabel label={label} animateChars={everMorphed} />
    </motion.button>
  )
}
