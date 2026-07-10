'use client'

/* ─────────────────────────────────────────────────────────
 * MULTIPLAYER PIXEL CANVAS
 *
 *    idle   the board starts ~68% painted; peer cursors arc
 *           to empty bolt cells and place green pixels in
 *           small bursts until the Supabase bolt completes.
 *           Bolt cells you painted magenta count as mistakes
 *           and get dutifully repainted green.
 *    done   a shimmer sweeps the finished bolt with a soft
 *           brand glow, then the whole board fades out once,
 *           swaps to a fresh prefill and fades back in
 *    draw   you paint instantly in your color — click or
 *           hold-and-drag, anywhere on the grid
 *
 * Performance notes: the pointer is tracked with motion
 * values (no React re-render per mousemove), pixel pops are
 * CSS keyframes (off main thread), and the reset animates a
 * single wrapper's opacity instead of exiting ~300 pixels.
 * ───────────────────────────────────────────────────────── */

import { animate, motion, motionValue, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'ui'

import { CursorArrow } from '../../CursorArrow'
import { LIVE_PEERS, YOU_COLOR, type LiveVariantProps } from './livePanel.data'

const TIMING = {
  startDelay: 400, // ms before the first peer paints
  stagger: 500, // ms offset between peers
  idleMin: 600, // min ms between painting trips
  idleMax: 1400, // max ms between painting trips
  paintGap: 220, // ms between pixels within a burst
  burstMin: 4, // pixels per trip
  burstMax: 7,
  celebrate: 1600, // ms the shimmer + glow play before the board fades
  boardFade: 350, // ms the board takes to fade out / back in
}

/**
 * The Supabase bolt, one char per cell — rasterized from the two wedge paths
 * of the official logo SVG (viewBox 0 0 109 113) so the finished pixel art
 * reads as the real mark: top wedge widening down-left, mirrored tail, and
 * the full-width band where the halves overlap.
 */
const BOLT = [
  '........##...........',
  '.......###...........',
  '......####...........',
  '......####...........',
  '.....#####...........',
  '....######...........',
  '...########..........',
  '..#################..',
  '..##################.',
  '.###################.',
  '.###################.',
  '.##################..',
  '..#################..',
  '...........#######...',
  '...........######....',
  '...........#####.....',
  '...........####......',
  '...........####......',
  '...........###.......',
  '...........##........',
]

const COLS = 33
const ROWS = 24
const BOLT_OFFSET = {
  c: Math.floor((COLS - BOLT[0].length) / 2),
  r: Math.floor((ROWS - BOLT.length) / 2),
}

/** Brand green with a little shade jitter so the fill feels hand-placed */
const GREENS = ['#3ECF8E', '#37BD81', '#4ADD9B', '#34B27B']

const BOLT_CELLS: string[] = BOLT.flatMap((row, r) =>
  row.split('').flatMap((ch, c) => (ch === '#' ? [`${c + BOLT_OFFSET.c},${r + BOLT_OFFSET.r}`] : []))
)

type PixelData = { color: string; pop: boolean }

type Phase = 'boot' | 'idle' | 'celebrate' | 'swap'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const rand = (min: number, max: number) => min + Math.random() * (max - min)

const randGreen = () => GREENS[Math.floor(Math.random() * GREENS.length)]

/**
 * Each round starts from a different-looking half-finished artwork: a random
 * fill pattern (scatter, swept from a side, growing from the center, or
 * closing in from the edges) at a random completeness, so no two feel alike.
 */
function prefillPixels(): Record<string, PixelData> {
  const cells = BOLT_CELLS.map((key) => {
    const [c, r] = key.split(',').map(Number)
    return { key, c, r }
  })
  const cx = cells.reduce((sum, p) => sum + p.c, 0) / cells.length
  const cy = cells.reduce((sum, p) => sum + p.r, 0) / cells.length

  const strategies: ((p: { c: number; r: number }) => number)[] = [
    () => 0, // pure scatter
    (p) => p.r, // from the top
    (p) => -p.r, // from the bottom
    (p) => p.c, // from the left
    (p) => -p.c, // from the right
    (p) => Math.hypot(p.c - cx, p.r - cy), // from the center out
    (p) => -Math.hypot(p.c - cx, p.r - cy), // from the edges in
    (p) => p.c + p.r, // diagonal sweep
  ]
  const score = strategies[Math.floor(Math.random() * strategies.length)]
  // Noise keeps the pattern's edge ragged instead of a clean geometric cut
  const noise = rand(1.5, 4)

  const fraction = rand(0.5, 0.85)
  const count = Math.floor(BOLT_CELLS.length * fraction)
  // On top of the big missing region, speckle single-pixel holes through the
  // filled area so it reads like many hands painted it, not one clean sweep
  const holeChance = rand(0.08, 0.18)
  return Object.fromEntries(
    cells
      .map((p) => ({ key: p.key, order: score(p) + rand(0, noise) }))
      .sort((a, b) => a.order - b.order)
      .slice(0, count)
      .filter(() => Math.random() > holeChance)
      .map(({ key }) => [key, { color: randGreen(), pop: false }])
  )
}

function CursorLabel({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="absolute left-[13px] top-[18px] whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  )
}

/** Static positioned div; the pop is a CSS keyframe so it runs off the main thread */
const Pixel = memo(function Pixel({
  left,
  top,
  size,
  color,
  pop,
  reducedMotion,
}: {
  left: number
  top: number
  size: number
  color: string
  pop: boolean
  reducedMotion: boolean
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute rounded-[2px]',
        pop && (reducedMotion ? 'rl-pixel-fade' : 'rl-pixel-pop')
      )}
      style={{ left, top, width: size, height: size, backgroundColor: color }}
    />
  )
})

export function PixelsVariant({ onYouChange }: LiveVariantProps) {
  const reducedMotion = useReducedMotion() ?? false
  const containerRef = useRef<HTMLDivElement>(null)
  const [youPresent, setYouPresent] = useState(false)
  const [pixels, setPixels] = useState<Record<string, PixelData>>({})
  const [phase, setPhase] = useState<Phase>('boot')
  const [fit, setFit] = useState({ cell: 14, ox: 0, oy: 0 })
  // Kept in sync manually so completion checks see paints before React re-renders
  const pixelsRef = useRef(pixels)
  const resetting = useRef(false)
  const drawing = useRef(false)
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  // Pointer position lives in motion values — mousemove never re-renders React
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const hoverX = useTransform(mouseX, (v) => fit.ox + Math.floor((v - fit.ox) / fit.cell) * fit.cell)
  const hoverY = useTransform(mouseY, (v) => fit.oy + Math.floor((v - fit.oy) / fit.cell) * fit.cell)

  const schedule = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t)
      fn()
    }, ms)
    timers.current.add(t)
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Seed on the client only — the random prefill would not survive SSR
  // hydration. The board then fades in as one layer instead of 160 pops.
  useEffect(() => {
    pixelsRef.current = reducedMotion
      ? Object.fromEntries(BOLT_CELLS.map((key) => [key, { color: randGreen(), pop: false }]))
      : prefillPixels()
    setPixels(pixelsRef.current)
    requestAnimationFrame(() => setPhase('idle'))
  }, [reducedMotion])

  const peerMVs = useMemo(
    () => new Map(LIVE_PEERS.map((p) => [p.name, { x: motionValue(0), y: motionValue(0) }])),
    []
  )

  // Fit the logical grid into the container, centered
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth - 24
      const h = el.clientHeight - 24
      const cell = Math.min(w / COLS, h / ROWS)
      setFit({ cell, ox: (el.clientWidth - cell * COLS) / 2, oy: (el.clientHeight - cell * ROWS) / 2 })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const setPresence = (present: boolean) => {
    setYouPresent(present)
    onYouChange(present)
  }

  const paint = (key: string, color: string) => {
    if (pixelsRef.current[key]?.color === color) return
    pixelsRef.current = { ...pixelsRef.current, [key]: { color, pop: true } }
    setPixels(pixelsRef.current)
  }

  /* ── Completion sequence ──────────────────────────────────
   *      0ms  last green pixel lands → shimmer sweep + glow
   *   1600ms  the board (one layer) fades out, 350ms ease-out
   *   2000ms  pixels swap to a fresh prefill, board fades in
   * ───────────────────────────────────────────────────────── */
  const checkComplete = () => {
    if (resetting.current) return
    // A bolt cell painted in your color is a "mistake" — the artwork only
    // counts as finished once the peers have repainted every one of them green
    const done = BOLT_CELLS.every((key) => {
      const px = pixelsRef.current[key]
      return px != null && px.color !== YOU_COLOR
    })
    if (!done) return
    resetting.current = true
    setPhase('celebrate')
    schedule(() => setPhase('swap'), TIMING.celebrate)
    schedule(() => {
      pixelsRef.current = prefillPixels()
      setPixels(pixelsRef.current)
      setPhase('idle')
      resetting.current = false
    }, TIMING.celebrate + TIMING.boardFade + 50)
  }

  const paintAtPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const c = Math.floor((e.clientX - rect.left - fit.ox) / fit.cell)
    const r = Math.floor((e.clientY - rect.top - fit.oy) / fit.cell)
    paint(`${c},${r}`, YOU_COLOR)
    checkComplete()
  }

  // Rest cursors around the board before the first paint — an effect after
  // paint would flash them at the top-left corner for a frame on load
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const rests = [
      { fx: 0.8, fy: 0.25 },
      { fx: 0.15, fy: 0.6 },
      { fx: 0.55, fy: 0.85 },
    ]
    LIVE_PEERS.forEach((peer, i) => {
      const mv = peerMVs.get(peer.name)!
      mv.x.set(rests[i % rests.length].fx * el.offsetWidth)
      mv.y.set(rests[i % rests.length].fy * el.offsetHeight)
    })
  }, [peerMVs])

  // Scripted painters
  useEffect(() => {
    if (reducedMotion) return
    let cancelled = false
    const claimed = new Set<string>()

    const cellCenter = (key: string, f: typeof fit) => {
      const [c, r] = key.split(',').map(Number)
      return { x: f.ox + (c + 0.5) * f.cell, y: f.oy + (r + 0.5) * f.cell }
    }

    const arcTo = async (
      mv: { x: ReturnType<typeof motionValue<number>>; y: ReturnType<typeof motionValue<number>> },
      tx: number,
      ty: number,
      duration: number
    ) => {
      const fx = mv.x.get()
      const fy = mv.y.get()
      const dx = tx - fx
      const dy = ty - fy
      const len = Math.hypot(dx, dy) || 1
      const bow = Math.min(34, len * 0.2) * (Math.random() < 0.5 ? -1 : 1)
      const cx = (fx + tx) / 2 - (dy / len) * bow
      const cy = (fy + ty) / 2 + (dx / len) * bow
      const t = motionValue(0)
      const unsub = t.on('change', (v) => {
        const u = 1 - v
        mv.x.set(u * u * fx + 2 * u * v * cx + v * v * tx)
        mv.y.set(u * u * fy + 2 * u * v * cy + v * v * ty)
      })
      await animate(t, 1, { duration, ease: [0.3, 0.65, 0.25, 1] })
      unsub()
    }

    const actorLoop = async (peerIdx: number) => {
      const peer = LIVE_PEERS[peerIdx]
      const cursor = peerMVs.get(peer.name)!
      // Short ramp-up, then the first trip goes straight to work — the long
      // "look at the board" idle only applies between later trips
      await sleep(TIMING.startDelay + peerIdx * TIMING.stagger)
      let firstTrip = true

      while (!cancelled) {
        if (!firstTrip) {
          const idle = rand(TIMING.idleMin, TIMING.idleMax)
          // While "thinking", hands rarely freeze solid — most idles include
          // a small aimless drift near the current spot
          if (Math.random() < 0.6) {
            const driftTime = Math.min(500, idle * 0.5)
            await arcTo(
              cursor,
              cursor.x.get() + rand(-20, 20),
              cursor.y.get() + rand(-14, 14),
              driftTime / 1000
            )
            await sleep(idle - driftTime)
          } else {
            await sleep(idle)
          }
        }
        firstTrip = false
        if (cancelled) return
        if (resetting.current) continue

        const el = containerRef.current
        if (!el) continue
        // Latest fit, recomputed cheaply from the container
        const w = el.clientWidth - 24
        const h = el.clientHeight - 24
        const cell = Math.min(w / COLS, h / ROWS)
        const f = { cell, ox: (el.clientWidth - cell * COLS) / 2, oy: (el.clientHeight - cell * ROWS) / 2 }

        // Unpainted bolt cells plus any of your "mistakes" inside the logo,
        // which peers dutifully repaint green
        const empty = BOLT_CELLS.filter((key) => {
          const px = pixelsRef.current[key]
          return (px == null || px.color === YOU_COLOR) && !claimed.has(key)
        })
        if (empty.length === 0) continue

        // Take a small contiguous-ish burst: a random start plus its neighbours
        const start = empty[Math.floor(Math.random() * empty.length)]
        const [sc, sr] = start.split(',').map(Number)
        const burst = empty
          .map((key) => {
            const [c, r] = key.split(',').map(Number)
            return { key, d: Math.hypot(c - sc, r - sr) }
          })
          .sort((a, b) => a.d - b.d)
          .slice(0, Math.floor(rand(TIMING.burstMin, TIMING.burstMax + 1)))
          .map((e) => e.key)

        burst.forEach((key) => claimed.add(key))

        try {
          const first = cellCenter(burst[0], f)
          // Travel time scales with distance (roughly constant hand speed with
          // per-trip jitter) so short hops are quick and long hauls take a
          // beat — a fixed duration made far-away trips look teleport-fast
          const dist = Math.hypot(first.x + 4 - cursor.x.get(), first.y + 6 - cursor.y.get())
          const travel = Math.min(1.7, Math.max(0.45, dist / rand(230, 330)))
          await arcTo(cursor, first.x + 4, first.y + 6, travel)
          if (cancelled) return
          // A beat to "aim" before the first pixel goes down
          await sleep(rand(80, 220))
          if (cancelled) return

          for (const key of burst) {
            if (cancelled) return
            if (resetting.current) break
            const target = cellCenter(key, f)
            await Promise.all([
              animate(cursor.x, target.x + 4, { duration: TIMING.paintGap / 1000, ease: 'easeOut' }),
              animate(cursor.y, target.y + 6, { duration: TIMING.paintGap / 1000, ease: 'easeOut' }),
            ])
            if (cancelled) return
            if (resetting.current) break
            paint(key, randGreen())
            checkComplete()
            await sleep(TIMING.paintGap * 0.4)
          }
        } finally {
          burst.forEach((key) => claimed.delete(key))
        }
      }
    }

    LIVE_PEERS.forEach((_, i) => void actorLoop(i))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion])

  // Pointer events (not mouse events) so touch works: on touch devices a
  // finger drag paints continuously, with pointer capture keeping the
  // stream alive even when the finger drifts off the panel edge.
  const trackPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    trackPointer(e)
    if (drawing.current) paintAtPointer(e)
  }

  const boardHidden = phase === 'boot' || phase === 'swap'

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 select-none overflow-hidden"
      // touch-action none: the browser must not turn paint drags into scrolls
      style={{ cursor: youPresent ? 'none' : undefined, touchAction: 'none' }}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setPresence(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return
        setPresence(false)
        drawing.current = false
      }}
      onPointerMove={handlePointerMove}
      onPointerDown={(e) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        drawing.current = true
        // Touch has no hover: presence (your cursor + outline) appears on
        // touch-down and clears on lift
        if (e.pointerType !== 'mouse') setPresence(true)
        trackPointer(e)
        paintAtPointer(e)
      }}
      onPointerUp={(e) => {
        drawing.current = false
        if (e.pointerType !== 'mouse') setPresence(false)
      }}
      onPointerCancel={(e) => {
        drawing.current = false
        if (e.pointerType !== 'mouse') setPresence(false)
      }}
    >
      {/* Cell grid backdrop — spans the full panel, aligned with the board cells */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, color-mix(in oklab, var(--foreground-muted) 14%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground-muted) 14%, transparent) 1px, transparent 1px)',
          backgroundSize: `${fit.cell}px ${fit.cell}px`,
          backgroundPosition: `${fit.ox}px ${fit.oy}px`,
        }}
      />

      {/* Painted pixels — the reset fades this single layer, not every pixel */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: boardHidden ? 0 : 1,
          transition: `opacity ${TIMING.boardFade}ms cubic-bezier(0.23, 1, 0.32, 1)`,
        }}
      >
        {Object.entries(pixels).map(([key, px]) => {
          const [c, r] = key.split(',').map(Number)
          return (
            <Pixel
              // Color is part of the key so repaints (peers fixing your
              // mistakes, or you drawing over green) replay the pop
              key={`${key}:${px.color}`}
              left={fit.ox + c * fit.cell + 1}
              top={fit.oy + r * fit.cell + 1}
              size={fit.cell - 2}
              color={px.color}
              pop={px.pop}
              reducedMotion={reducedMotion}
            />
          )
        })}
      </div>

      {/* Completion moment: one shimmer sweep + one soft glow, GPU-only */}
      {phase === 'celebrate' && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="rl-bolt-glow absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 55% 60% at 50% 50%, rgba(62,207,142,0.14), transparent 70%)',
            }}
          />
          {!reducedMotion && (
            <div
              className="rl-bolt-sweep absolute inset-0"
              style={{
                background:
                  'linear-gradient(115deg, transparent 36%, rgba(255,255,255,0.13) 50%, transparent 64%)',
              }}
            />
          )}
        </div>
      )}

      {/* Hover cell outline — snapped to the grid via motion values */}
      {youPresent && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 rounded-[2px] border"
          style={{ x: hoverX, y: hoverY, width: fit.cell, height: fit.cell, borderColor: YOU_COLOR }}
        />
      )}

      {/* Peer cursors — fade in with the board so load feels composed */}
      {!reducedMotion &&
        LIVE_PEERS.map((peer) => {
          const mv = peerMVs.get(peer.name)!
          return (
            <motion.div
              key={peer.name}
              className="pointer-events-none absolute left-0 top-0 z-10"
              style={{
                x: mv.x,
                y: mv.y,
                opacity: boardHidden ? 0 : 1,
                transition: `opacity ${TIMING.boardFade}ms cubic-bezier(0.23, 1, 0.32, 1)`,
              }}
            >
              <CursorArrow color={peer.color} size={18} />
              <CursorLabel name={peer.name} color={peer.color} />
            </motion.div>
          )
        })}

      {/* Your cursor */}
      {youPresent && (
        <motion.div
          className="pointer-events-none absolute left-0 top-0 z-20"
          style={{ x: mouseX, y: mouseY }}
        >
          <CursorArrow color={YOU_COLOR} size={18} />
          <CursorLabel name="You" color={YOU_COLOR} />
        </motion.div>
      )}

      <style>{`
        @keyframes rlPixelPop {
          from { transform: scale(0.6); opacity: 0; }
        }
        .rl-pixel-pop {
          animation: rlPixelPop 220ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes rlPixelFade {
          from { opacity: 0; }
        }
        .rl-pixel-fade {
          animation: rlPixelFade 200ms ease-out both;
        }
        @keyframes rlBoltSweep {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .rl-bolt-sweep {
          animation: rlBoltSweep 1s cubic-bezier(0.77, 0, 0.175, 1) 120ms both;
        }
        @keyframes rlBoltGlow {
          0% { opacity: 0; }
          25% { opacity: 1; }
          100% { opacity: 0; }
        }
        .rl-bolt-glow {
          animation: rlBoltGlow ${TIMING.celebrate}ms ease-out both;
        }
      `}</style>
    </div>
  )
}
