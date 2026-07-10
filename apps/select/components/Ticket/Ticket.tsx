'use client'

import React, { useCallback, useMemo, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useAsciiBolt } from '../AsciiArt'
import { Barcode } from './Barcode'
import type { TicketVariant } from './variants'

/* ─────────────────────────────────────────────────────────
 * TICKET STORYBOARD
 *
 * Idle      slow float, y 0 → -8 → 0 (6.5s loop)
 * Hover     card leans toward pointer (±10° / ±11° spring),
 *           scale 1 → 1.02, shadow deepens with a green cast;
 *           torch beam lights ASCII chars, some flicker/scramble
 * Press     scale dips to 0.985
 *
 * REPRINT (stages driven by page-level TIMING)
 *    0ms   stage 1 — portal slit snaps open (spring); 120ms later
 *          the ticket retracts up through it, clip-path pinned
 *          at the slot line
 *  500ms   stage 2 — ink swapped, ticket feeds down out of the slit
 *          in 24 stepped notches under its cast shadow;
 *          ASCII bolt reprints row-by-row (1.3s, 32 steps)
 * 1700ms   stage 0 — slit lingers 360ms, lips seal over 720ms
 *          (opacity trails so you see the close), then fades
 * ───────────────────────────────────────────────────────── */

const FLOAT = {
  offsetY: -8, // px the card drifts up while idle
  duration: 6.5, // seconds per float loop
}

const TILT = {
  rotateX: 10, // deg toward/away from pointer (vertical)
  rotateY: 11, // deg toward/away from pointer (horizontal)
  hoverScale: 1.02, // scale while hovered
  tapScale: 0.985, // scale while pressed
  spring: { stiffness: 170, damping: 20 },
  settle: { type: 'spring' as const, stiffness: 260, damping: 22 },
}

const PORTAL = {
  closedScaleX: 0.06, // nearly sealed — you see the lips meet
  open: {
    opacity: { duration: 0.16, ease: 'easeOut' as const },
    scaleX: { type: 'spring' as const, stiffness: 460, damping: 24 }, // slight overshoot — the cut "snaps" open
  },
  close: {
    // seal first, fade last — opacity must not vanish before the lip closes
    scaleX: {
      duration: 0.72,
      ease: [0.77, 0, 0.175, 1] as const, // ease-in-out — deliberate lip meeting
    },
    opacity: {
      duration: 0.28,
      delay: 0.58, // stays visible through most of the seal
      ease: [0.23, 1, 0.32, 1] as const,
    },
  },
}

const TORCH_RADIUS = 110 // px beam radius

const TORCH = {
  mask: `radial-gradient(${TORCH_RADIUS}px circle at var(--tx) var(--ty), black 45%, transparent 80%)`,
  scrambleShare: 0.24, // fraction of chars that flicker under the beam
  scrambleChars: ['0', '1', '*', '·'],
}

const GRID = { cols: 48, rows: 30, charW: 5.4, lineH: 9 }
const STUB_HEIGHT = 96
const NOTCH = 11

/* notches punched where the stub perforation meets the card edges */
const notchMask = `radial-gradient(circle ${NOTCH}px at 0 calc(100% - ${STUB_HEIGHT}px), transparent ${NOTCH - 0.5}px, black ${NOTCH}px), radial-gradient(circle ${NOTCH}px at 100% calc(100% - ${STUB_HEIGHT}px), transparent ${NOTCH - 0.5}px, black ${NOTCH}px)`

type TicketProps = {
  variant: TicketVariant
  number: string
  name: string
  /** node captured for the PNG download */
  captureRef: React.RefObject<HTMLDivElement | null>
  /** 0 = idle · 1 = retracting into slot · 2 = feeding back out */
  printStage: 0 | 1 | 2
}

/* deterministic per-index hash for the scramble layer */
const scrambleAt = (i: number) => ((i * 2654435761) >>> 0) / 4294967296

export const Ticket = ({
  variant,
  number,
  name,
  captureRef,
  printStage,
}: TicketProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const torchRef = useRef<HTMLDivElement | null>(null)
  const ascii = useAsciiBolt(GRID.cols, GRID.rows, variant.chars, 7)

  /* 3D follow — the card leans toward the pointer */
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [TILT.rotateX, -TILT.rotateX]), TILT.spring)
  const rotateY = useSpring(useTransform(px, [0, 1], [-TILT.rotateY, TILT.rotateY]), TILT.spring)

  /* torch beam follows the pointer over the ASCII art only */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = torchRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty('--tx', `${x}px`)
      el.style.setProperty('--ty', `${y}px`)
      if (cardRef.current) {
        const cardRect = cardRef.current.getBoundingClientRect()
        px.set((e.clientX - cardRect.left) / cardRect.width)
        py.set((e.clientY - cardRect.top) / cardRect.height)
      }
    },
    [px, py]
  )

  const handlePointerLeave = useCallback(() => {
    const el = torchRef.current
    if (!el) return
    el.style.setProperty('--tx', '-999px')
    el.style.setProperty('--ty', '-999px')
    px.set(0.5)
    py.set(0.5)
  }, [px, py])

  const asciiText = ascii.join('\n')

  /* glitchy sibling of the art — only visible inside the torch beam */
  const scrambleText = useMemo(
    () =>
      asciiText
        .split('')
        .map((ch, i) => {
          if (ch === ' ' || ch === '\n') return ch
          if (scrambleAt(i) > TORCH.scrambleShare) return ' '
          return TORCH.scrambleChars[Math.floor(scrambleAt(i * 31) * TORCH.scrambleChars.length)]
        })
        .join(''),
    [asciiText]
  )

  const asciiLayerStyle: React.CSSProperties = {
    fontSize: GRID.lineH,
    lineHeight: `${GRID.lineH}px`,
    letterSpacing: 0,
  }

  const feedClass =
    printStage === 1 ? 'animate-retract' : printStage === 2 ? 'animate-feed' : ''

  return (
    <motion.div
      style={{ perspective: 1200 }}
      animate={{ y: [0, FLOAT.offsetY, 0] }}
      transition={{ duration: FLOAT.duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: TILT.hoverScale }}
        whileTap={{ scale: TILT.tapScale }}
        transition={TILT.settle}
        className="group will-change-transform"
      >
        <div ref={captureRef} className="ticket-shadow relative">
          {/* ── printer slot: a lens-shaped hole straddling the clip line.
               The ticket is clipped at y=0 — the slit's upper half shows as
               the dark opening above the paper's cut edge, and its tapered
               tips poke out on both sides of the card as it passes through. */}
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{
              opacity: printStage > 0 ? 1 : 0,
              scaleX: printStage > 0 ? 1 : PORTAL.closedScaleX,
            }}
            transition={printStage > 0 ? PORTAL.open : PORTAL.close}
            className="pointer-events-none absolute -top-[9px] left-1/2 z-0 h-[18px] w-[116%] -translate-x-1/2"
          >
            <svg viewBox="0 0 200 18" preserveAspectRatio="none" className="h-full w-full">
              <path d="M4 9 C 32 2.2, 168 2.2, 196 9 C 168 15.8, 32 15.8, 4 9 Z" fill="#000" />
              {/* rim light on the cut edges — a black hole on a dark page
                  is invisible without light catching its lips */}
              <path
                d="M4 9 C 32 2.2, 168 2.2, 196 9"
                fill="none"
                stroke="rgba(244, 241, 234, 0.16)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M4 9 C 32 15.8, 168 15.8, 196 9"
                fill="none"
                stroke="rgba(244, 241, 234, 0.38)"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </motion.div>

          {/* the ticket — clip-path keeps its cut edge pinned at the slot.
               isolate + overflow-hidden force WebKit to flatten this subtree:
               iOS Safari ignores clip-path on elements inside the 3D tilt
               context (preserve-3d ancestor), so without this the retracting
               ticket slides up fully visible instead of vanishing into the
               slot. The overflow clip also hides the card even if clip-path
               support fails entirely. */}
          <div className="relative isolate z-10 overflow-hidden">
            <div
              ref={cardRef}
              className={`relative flex w-full flex-col overflow-hidden rounded-lg ${feedClass}`}
              style={
                {
                  background: variant.cardBg,
                  color: variant.ink,
                  border: `1px solid ${variant.edge}`,
                  maskImage: notchMask,
                  WebkitMaskImage: notchMask,
                  maskComposite: 'intersect',
                  WebkitMaskComposite: 'source-in',
                } as React.CSSProperties
              }
            >
              <div className="flex items-center justify-between px-5 pt-4">
                <div
                  className="font-mono text-[9px] font-semibold tracking-[0.24em]"
                  style={{ color: variant.inkSoft }}
                >
                  SUPABASE / SELECT
                </div>
                <div className="font-mono text-[11px] font-bold tracking-[0.08em]">{number}</div>
              </div>

              <div className="flex flex-col items-center gap-1 px-6 pt-5">
                <p
                  className="w-full text-center font-serif text-[30px] font-medium italic leading-tight"
                  style={{ color: variant.ink }}
                >
                  {name}
                </p>
                <div
                  className="font-mono text-[9px] font-semibold tracking-[0.24em]"
                  style={{ color: variant.inkSoft }}
                >
                  ATTENDEE · OCTOBER 2 2026
                </div>
              </div>

              {/* ASCII bolt — reprints row-by-row on every reprint */}
              <div
                ref={torchRef}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                className="relative flex flex-1 items-center justify-center py-4"
                style={{ '--tx': '-999px', '--ty': '-999px' } as React.CSSProperties}
              >
                <div
                  key={variant.id}
                  className="animate-print relative"
                  style={{ width: GRID.cols * GRID.charW, height: GRID.rows * GRID.lineH }}
                >
                  <pre
                    aria-hidden="true"
                    className="select-none font-mono"
                    style={{ ...asciiLayerStyle, color: variant.ascii }}
                  >
                    {asciiText}
                  </pre>
                  {/* lit layer revealed by the torch beam */}
                  <pre
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 select-none font-mono"
                    style={{
                      ...asciiLayerStyle,
                      color: variant.asciiLit,
                      textShadow: `0 0 6px ${variant.asciiGlow}, 0 0 14px ${variant.asciiGlow}`,
                      maskImage: TORCH.mask,
                      WebkitMaskImage: TORCH.mask,
                    }}
                  >
                    {asciiText}
                  </pre>
                  {/* glitch layer — flickering chars inside the beam */}
                  <pre
                    aria-hidden="true"
                    className="animate-scramble pointer-events-none absolute inset-0 select-none font-mono"
                    style={{
                      ...asciiLayerStyle,
                      color: variant.asciiLit,
                      maskImage: TORCH.mask,
                      WebkitMaskImage: TORCH.mask,
                    }}
                  >
                    {scrambleText}
                  </pre>
                </div>
              </div>

              <div
                className="mx-4 border-t border-dashed"
                style={{ borderColor: variant.inkSoft }}
                aria-hidden="true"
              />

              <div
                className="flex items-center justify-between gap-4 px-5"
                style={{ height: STUB_HEIGHT }}
              >
                <div className="flex flex-col gap-1">
                  <div
                    className="font-mono text-[9px] font-semibold tracking-[0.2em]"
                    style={{ color: variant.inkSoft }}
                  >
                    ADMIT ONE
                  </div>
                  <div className="font-mono text-[11px] font-bold tracking-[0.06em]">
                    555 20TH STREET
                  </div>
                  <div
                    className="font-mono text-[9px] font-semibold tracking-[0.2em]"
                    style={{ color: variant.inkSoft }}
                  >
                    SAN FRANCISCO, CA
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Barcode color={variant.stubInk} className="h-[26px] w-[120px]" />
                  <div
                    className="font-mono text-[8px] font-semibold tracking-[0.3em]"
                    style={{ color: variant.inkSoft }}
                  >
                    SELECT26·{number}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── contact shadow the hole's front lip throws onto the paper,
               seating the emerging ticket into the slit */}
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ opacity: printStage > 0 ? 1 : 0 }}
            transition={printStage > 0 ? PORTAL.open.opacity : PORTAL.close.opacity}
            className="pointer-events-none absolute left-1/2 top-0 z-20 h-[10px] w-full -translate-x-1/2"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.12) 60%, transparent)',
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
