'use client'

/* ─────────────────────────────────────────────────────────
 * ROLLING TEXT (number ticker)
 *
 * Each character sits in its own overflow-hidden slot; when
 * it changes, the old char rolls up and out while the new
 * one rolls in from below (spring). Pair with tabular-nums
 * so slots don't shift width as digits change.
 * ───────────────────────────────────────────────────────── */

import { AnimatePresence, motion } from 'framer-motion'

const ROLL = {
  spring: { type: 'spring' as const, stiffness: 500, damping: 40 },
}

export function RollingText({ value }: { value: string }) {
  return (
    <span className="inline-flex overflow-hidden tabular-nums">
      {value.split('').map((char, i) => (
        <span key={i} className="relative inline-block">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={char}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={ROLL.spring}
              className="inline-block whitespace-pre"
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}
