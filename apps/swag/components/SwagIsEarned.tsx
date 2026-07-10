'use client'

/* ─────────────────────────────────────────────────────────
 * SWAG IS EARNED
 *
 * Eyebrow + full-width statement, then the manifesto copy
 * and CTA.
 *
 * scroll   statement lines rise, copy + CTA follow
 * ───────────────────────────────────────────────────────── */

import { motion } from 'framer-motion'

import { REVEAL, sectionVariants, staggerContainer } from '@/lib/animations'

const STATEMENT = [
  { text: "You can't buy this.", muted: false },
  { text: 'Well, you can.', muted: true },
  { text: "It's just $1,000,000.", muted: false },
]

export function SwagIsEarned() {
  return (
    <section aria-labelledby="earned-heading" className="border-t border-border">
      <div className="archive-container py-16 lg:py-24">
        <motion.div
          variants={staggerContainer(0.14)}
          initial="hidden"
          whileInView="show"
          viewport={REVEAL.viewport}
          className="flex flex-col items-start"
        >
          <motion.p variants={sectionVariants} className="text-label mb-5 text-foreground-lighter">
            the fine print
          </motion.p>

          <h2 id="earned-heading" className="text-display-sm w-full text-foreground">
            {STATEMENT.map((line) => (
              <span key={line.text} className="block overflow-hidden sm:whitespace-nowrap">
                <motion.span
                  variants={{
                    hidden: { y: '110%' },
                    show: { y: 0, transition: REVEAL.spring },
                  }}
                  className={line.muted ? 'block text-foreground-muted' : 'block'}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h2>

          <motion.p
            variants={sectionVariants}
            className="mt-8 max-w-xl text-sm leading-relaxed text-foreground-lighter lg:text-base"
          >
            The prices are a joke. The swag is not. Most of it is gifted to contributors, meetup
            hosts, and the SupaSquad. Ship a PR, host a meetup, help in Discord, and a box might
            just show up. Every artifact carries the Greenmark: earned, shipped from Singapore,
            never rendered in light mode.
          </motion.p>

          <motion.div variants={sectionVariants} className="mt-8">
            <a
              href="https://github.com/supabase/supabase"
              target="_blank"
              rel="noreferrer"
              className="inline-block border border-foreground bg-foreground px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-background transition-colors hover:border-brand hover:bg-brand"
            >
              Start contributing
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
