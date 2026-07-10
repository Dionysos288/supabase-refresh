'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, MotionConfig } from 'framer-motion'
import { ActionBar } from '@/components/ActionBar'
import { DitherField } from '@/components/DitherField'
import { SelectWordmark } from '@/components/icons'
import { Ticket } from '@/components/Ticket/Ticket'
import { VARIANTS } from '@/components/Ticket/variants'

const TICKET_NUMBER = '#042'
const ATTENDEE_NAME = 'Dion Zeneli'

/* ─────────────────────────────────────────────────────────
 * REPRINT STORYBOARD
 *
 * Read top-to-bottom. Each value is ms after clicking Reprint.
 *
 *     0ms   portal slit snaps open (spring, slight overshoot)
 *   120ms   old ticket retracts up through it (ease-in)
 *   500ms   ink swapped to the next variant; ticket feeds back down
 *           in 24 stepped notches under the slit's cast shadow
 *  1700ms   paper fully fed; slit lingers open 360ms
 *  2060ms   lips seal shut over 720ms (visible), then fade
 *           ASCII bolt prints row-by-row (1.3s, 32 steps)
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  retract: 500, // 120ms portal-open delay + 380ms retract (matches .animate-retract)
  feed: 1200, // stepped feed duration (matches .animate-feed)
  linger: 360, // beat with slit open after paper settles, before lip seals
}

/** 0 = idle · 1 = retracting · 2 = feeding */
type PrintStage = 0 | 1 | 2

export default function SelectTicketPage() {
  const [variantIndex, setVariantIndex] = useState(0)
  const [printStage, setPrintStage] = useState<PrintStage>(0)
  const captureRef = useRef<HTMLDivElement | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const handleReprint = useCallback(() => {
    if (printStage !== 0) return
    setPrintStage(1)
    timers.current.push(
      window.setTimeout(() => {
        setVariantIndex((i) => (i + 1) % VARIANTS.length)
        setPrintStage(2)
      }, TIMING.retract),
      window.setTimeout(() => setPrintStage(0), TIMING.retract + TIMING.feed + TIMING.linger)
    )
  }, [printStage])

  const variant = VARIANTS[variantIndex]

  return (
    // Disables transform-based motion for prefers-reduced-motion users while
    // keeping the opacity fades
    <MotionConfig reducedMotion="user">
      {/* Mobile locks to one static viewport (h-svh, no scroll) so the
          ticket can be dragged with a finger without fighting the page;
          sm+ keeps the roomier min-height layout */}
      <main className="relative flex h-svh flex-col items-center justify-center overflow-hidden px-6 py-12 sm:h-auto sm:min-h-dvh sm:py-24">
        <DitherField />
        {/* soft falloff behind the ticket so it reads against the field */}
        <div
          className="pointer-events-none fixed inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(46% 60% at 50% 52%, rgba(11, 12, 10, 0.88) 0%, rgba(11, 12, 10, 0.45) 60%, transparent 100%)',
          }}
        />
        {/* edge scrims so header + footer type stays readable over the field */}
        <div
          className="pointer-events-none fixed inset-x-0 top-0 h-32"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(to bottom, rgba(11, 12, 10, 0.92) 0%, rgba(11, 12, 10, 0.55) 55%, transparent 100%)',
          }}
        />
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 h-24"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(to top, rgba(11, 12, 10, 0.92) 0%, rgba(11, 12, 10, 0.55) 55%, transparent 100%)',
          }}
        />

        <h1 className="sr-only">Your Supabase Select 2026 ticket</h1>

        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute left-0 top-0 z-20 flex w-full items-center justify-between p-6 sm:p-8"
        >
          <a href="https://select.supabase.com" aria-label="Supabase Select 26">
            <SelectWordmark className="h-8 w-auto text-paper md:h-10" />
          </a>
          <div className="hidden rounded-md border border-paper/10 bg-[#0b0c0a]/70 px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.22em] text-paper/85 backdrop-blur-sm sm:block">
            OCTOBER 2 · SAN FRANCISCO
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18, mass: 0.9 }}
          // Hold-and-drag the ticket anywhere; it springs back on release.
          // touch-action none keeps the browser from claiming the gesture.
          drag
          dragSnapToOrigin
          dragElastic={0.6}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 24 }}
          whileDrag={{ scale: 1.03 }}
          className="relative z-10 w-full cursor-grab active:cursor-grabbing"
          style={{ maxWidth: 340, touchAction: 'none' }}
        >
          <Ticket
            variant={variant}
            number={TICKET_NUMBER}
            name={ATTENDEE_NAME}
            captureRef={captureRef}
            printStage={printStage}
          />
        </motion.div>

        <div className="relative z-10 mt-8">
          <ActionBar
            onReprint={handleReprint}
            reprinting={printStage !== 0}
            captureRef={captureRef}
            ticketNumber={TICKET_NUMBER}
          />
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          // hidden on mobile so the page fits exactly one viewport height
          className="absolute bottom-0 left-0 z-20 hidden w-full items-center justify-center p-6 sm:flex"
        >
          <p className="rounded-md border border-paper/10 bg-[#0b0c0a]/70 px-3 py-1.5 text-center font-mono text-[9px] font-medium tracking-[0.18em] text-paper/80 backdrop-blur-sm sm:text-[10px] sm:tracking-[0.22em]">
            CURATED DAY OF TALKS BY SUPABASE
          </p>
        </motion.footer>
      </main>
    </MotionConfig>
  )
}