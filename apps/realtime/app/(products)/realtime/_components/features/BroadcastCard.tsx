'use client'

/* ─────────────────────────────────────────────────────────
 * BROADCAST STORYBOARD
 *
 *   idle   auto-fires an event every 4.5s while in view
 *  click   "Send event" fires immediately (button pips)
 *    0ms   pulse leaves the channel node down 4 curves,
 *          staggered 120ms per curve
 *  900ms   pulse reaches each client — node flashes brand
 *          green for 500ms
 * ───────────────────────────────────────────────────────── */

import { useInView } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'ui'

const TIMING = {
  autoInterval: 4500, // ms between automatic events
  travel: 1.1, // s for a pulse to run a curve
  curveStagger: 0.12, // s between each curve starting
  arrival: 950, // ms until the leading edge hits the node
  flashClear: 500, // ms the node stays lit
}

const CLIENT_X_PERCENT = [23.2, 39.5, 61, 77]

/** Bottom edge of the "Send event" button (top-5 + button height) */
const SOURCE_Y = 56

/** Curves are computed from the real container size so the endpoints always
    meet the source button and the percent-positioned client nodes */
function buildPaths(w: number, h: number) {
  const cx = w / 2
  const yEnd = h - 44 // client node center (bottom-6 + half of h-10)
  const span = yEnd - SOURCE_Y
  return CLIENT_X_PERCENT.map((pct) => {
    const x = (pct / 100) * w
    return `M${cx},${SOURCE_Y} C${cx},${SOURCE_Y + span * 0.37} ${x},${SOURCE_Y + span * 0.56} ${x},${yEnd}`
  })
}

const CLIENT_ICONS = [
  <g key="user">
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
  </g>,
  <g key="image">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </g>,
  <g key="layers">
    <path
      d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L21 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m2 17 8.58 3.91a2 2 0 0 0 1.66 0L21 17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>,
  <g key="database">
    <ellipse cx="12" cy="5" rx="7" ry="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M19 12c0 1.66-3.13 3-7 3s-7-1.34-7-3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 5v14c0 1.66 3.13 3 7 3s7-1.34 7-3V5" stroke="currentColor" strokeWidth="1.5" />
  </g>,
]

type Pulse = { id: number; bornAt: number }

export function BroadcastCard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { amount: 0.3 })
  const [pulses, setPulses] = useState<Pulse[]>([])
  const [litNodes, setLitNodes] = useState<boolean[]>(() =>
    CLIENT_X_PERCENT.map(() => false)
  )
  const [size, setSize] = useState({ w: 360, h: 320 })
  const pulseId = useRef(0)
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  // One clear-timer per client node; a new arrival extends the flash instead
  // of stacking counts, so the state can never get stuck out of balance
  const flashTimers = useRef<(ReturnType<typeof setTimeout> | null)[]>(
    CLIENT_X_PERCENT.map(() => null)
  )
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() =>
      setSize({ w: el.offsetWidth, h: el.offsetHeight })
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const paths = useMemo(() => buildPaths(size.w, size.h), [size])

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
      timers.current.clear()
      flashTimers.current.forEach((t) => t && clearTimeout(t))
      flashTimers.current = CLIENT_X_PERCENT.map(() => null)
    },
    []
  )

  /** setTimeout that removes itself from the pending set once it fires */
  const schedule = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t)
      fn()
    }, ms)
    timers.current.add(t)
  }

  const setLit = (i: number, on: boolean) => {
    setLitNodes((prev) => {
      if (prev[i] === on) return prev
      const next = [...prev]
      next[i] = on
      return next
    })
  }

  /** Light node i now and (re)arm its single clear timer. If several pulses
      arrive close together the flash window just extends — there is no
      counter that can drift out of sync and leave a node stuck lit. */
  const flashNode = (i: number) => {
    setLit(i, true)
    const prev = flashTimers.current[i]
    if (prev) clearTimeout(prev)
    flashTimers.current[i] = setTimeout(() => {
      flashTimers.current[i] = null
      setLit(i, false)
    }, TIMING.flashClear)
  }

  const PULSE_LIFE =
    (CLIENT_X_PERCENT.length * TIMING.curveStagger + TIMING.travel) * 1000 + TIMING.flashClear

  const fireEvent = () => {
    const id = ++pulseId.current
    const now = Date.now()
    // Adding also prunes: any pulse past its lifetime is dropped here even if
    // its own removal timer got lost (e.g. cleared by a hot-reload cleanup)
    setPulses((prev) => [
      ...prev.filter((p) => now - p.bornAt < PULSE_LIFE),
      { id, bornAt: now },
    ])

    CLIENT_X_PERCENT.forEach((_, i) => {
      const arrivalOffset = i * TIMING.curveStagger * 1000 + TIMING.arrival
      schedule(() => flashNode(i), arrivalOffset)
    })

    schedule(() => setPulses((prev) => prev.filter((p) => p.id !== id)), PULSE_LIFE)
  }

  const stopAutoTimer = () => {
    if (autoTimer.current) {
      clearInterval(autoTimer.current)
      autoTimer.current = null
    }
  }

  const startAutoTimer = () => {
    stopAutoTimer()
    autoTimer.current = setInterval(fireEvent, TIMING.autoInterval)
  }

  const handleSendClick = () => {
    fireEvent()
    // Restart the countdown so an auto event doesn't fire right after a click
    if (autoTimer.current) startAutoTimer()
  }

  useEffect(() => {
    if (!inView) return
    fireEvent()
    startAutoTimer()
    return stopAutoTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {/* Source node — a real button */}
      {/* Full-width flex centering — left-1/2 caps shrink-to-fit at half the card */}
      <div className="absolute inset-x-0 top-5 z-10 flex justify-center px-2">
        <button
          onClick={handleSendClick}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-surface-100 px-3 py-2 shadow-xs transition-[border-color,background-color,transform] duration-150 ease-out hover:border-brand/50 hover:bg-surface-200 active:scale-95 dark:shadow-sm"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="text-brand"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m22 8-6 4 6 4V8Z" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="shrink-0 whitespace-nowrap text-xs font-medium text-foreground">
            Send event
          </span>
          <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-foreground-muted">
            room-1
          </span>
        </button>
      </div>

      {/* Curves + travelling pulses — drawn in real pixel space so they
          always meet the button and client nodes at any width */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${size.w} ${size.h}`}
        fill="none"
        preserveAspectRatio="none"
      >
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-border-strong dark:stroke-[var(--background-surface-300)]"
          />
        ))}
        {/* flatMap keeps this a single flat keyed list — with nested arrays
            React reconciles the inner arrays by position, so removing an old
            pulse would remount the others and restart their animations */}
        {pulses.flatMap((pulse) =>
          paths.map((d, i) => (
            <path
              key={`${pulse.id}-${i}`}
              d={d}
              pathLength={1}
              stroke="#3ECF8E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="0.12 2"
              style={{
                strokeDashoffset: 0.12,
                animation: `broadcastPulse ${TIMING.travel}s ${i * TIMING.curveStagger}s linear forwards`,
              }}
            />
          ))
        )}
      </svg>

      {/* Client nodes */}
      {CLIENT_ICONS.map((icon, i) => {
        const isFlashing = litNodes[i]
        return (
          <div
            key={i}
            className={cn(
              'absolute bottom-6 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-xl border bg-surface-100 shadow-xs transition-[border-color,color] duration-300 dark:shadow-sm',
              isFlashing ? 'border-brand text-brand' : 'border-border text-foreground-muted'
            )}
            style={{ left: `${CLIENT_X_PERCENT[i]}%` }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              {icon}
            </svg>
          </div>
        )
      })}

      {/* Gap (2) is longer than the path so the pattern never repeats a second
          dash onto the path; the pulse ends fully off the end (offset -1) */}
      <style>{`
        @keyframes broadcastPulse {
          from { stroke-dashoffset: 0.12; }
          to { stroke-dashoffset: -1; }
        }
      `}</style>
    </div>
  )
}
