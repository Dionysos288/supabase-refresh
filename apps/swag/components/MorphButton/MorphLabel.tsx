'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { MORPH } from '@/lib/animations'

type MorphLabelProps = {
  label: string
  animateChars: boolean
}

/** Label crossfade + per-character morph used by MorphButton. */
export function MorphLabel({ label, animateChars }: MorphLabelProps) {
  return (
    <motion.span layout="position" className="relative inline-flex items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={label}
          layout="position"
          exit={{ opacity: 0, transition: MORPH.labelExit }}
          className="inline-flex items-center"
        >
          {animateChars
            ? label.split('').map((char, i) => (
                <motion.span
                  key={`${label}-${i}`}
                  initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ ...MORPH.charEnter, delay: i * MORPH.charStagger }}
                  className="inline-block whitespace-pre"
                >
                  {char}
                </motion.span>
              ))
            : label}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}
