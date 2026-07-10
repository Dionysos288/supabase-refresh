'use client'

/* ─────────────────────────────────────────────────────────
 * ARCHITECTURE STORYBOARD (loops every 4.5s while in view)
 *
 *     0ms   INSERT chip pops above Postgres
 *   400ms   pulse travels Postgres → Realtime (0.7s)
 *  1100ms   RLS badge on Realtime flashes green (check passes)
 *  1500ms   pulses fan out to the 3 clients (0.7s, 80ms stagger)
 *  2250ms   clients flash on arrival
 *  3300ms   everything settles back to idle
 * ───────────────────────────────────────────────────────── */

import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { Database, Monitor, Server, ShieldCheck, Smartphone, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from 'ui'

const TIMING = {
  chip: 0,
  pipe: 400,
  rls: 1100,
  fan: 1500,
  clientsLit: 2250,
  settle: 3300,
  cycle: 4500,
  travel: 0.7,
  fanStagger: 0.08,
}

const STAGE_AT: [number, number][] = [
  [TIMING.chip, 1],
  [TIMING.pipe, 2],
  [TIMING.rls, 3],
  [TIMING.fan, 4],
  [TIMING.clientsLit, 5],
  [TIMING.settle, 0],
]

const PIPE_PATH = 'M120,160 L400,160'
const FAN_PATHS = [
  'M400,160 C560,160 580,64 700,64',
  'M400,160 L700,160',
  'M400,160 C560,160 580,256 700,256',
]

const CLIENTS = [
  { icon: Monitor, label: 'Web' },
  { icon: Smartphone, label: 'Mobile' },
  { icon: Server, label: 'Server' },
] as const

function Pulse({ d, delay }: { d: string; delay: number }) {
  return (
    <path
      d={d}
      pathLength={1}
      stroke="#3ECF8E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="0.15 2"
      style={{
        strokeDashoffset: 0.15,
        animation: `archPulse ${TIMING.travel}s ${delay}s linear forwards`,
      }}
    />
  )
}

function InsertChip({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
          className="rounded-full border border-brand/40 bg-brand/10 px-2.5 py-1 font-mono text-[10px] text-brand whitespace-nowrap"
        >
          INSERT INTO messages
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PostgresNode() {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-100 px-4 py-3 shadow-xs dark:shadow-sm">
      <Database size={18} strokeWidth={1.5} className="text-brand" />
      <div className="flex flex-col">
        <span className="text-xs font-medium text-foreground sm:text-sm">Postgres</span>
        <span className="text-[10px] text-foreground-muted">your database</span>
      </div>
    </div>
  )
}

function RealtimeNode({ stage }: { stage: number }) {
  const active = stage >= 2 && stage <= 5
  return (
    <div className="relative">
      <div
        className={cn(
          'relative flex items-center gap-3 rounded-xl border bg-surface-100 px-5 py-4 transition-[border-color,box-shadow] duration-300',
          active ? 'border-brand/60' : 'border-border'
        )}
        style={{
          boxShadow: active
            ? '0 0 32px rgba(62,207,142,0.18), 0 1px 2px rgba(0,0,0,0.3)'
            : '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        <Zap size={20} strokeWidth={1.5} className="text-brand" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground sm:text-base">Realtime</span>
          <span className="text-[10px] text-foreground-muted">globally distributed</span>
        </div>
      </div>
      <motion.div
        animate={stage === 3 ? { scale: 1.15, y: 0 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.4 }}
        className={cn(
          'absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors duration-300 whitespace-nowrap',
          stage === 3
            ? 'border-brand/60 bg-brand/15 text-brand'
            : 'border-border bg-surface-200 text-foreground-light'
        )}
      >
        <ShieldCheck size={12} strokeWidth={2} />
        RLS check
      </motion.div>
    </div>
  )
}

function ClientNode({ label, icon: Icon, lit }: { label: string; icon: typeof Monitor; lit: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border bg-surface-100 px-3 py-2 shadow-xs transition-[border-color,color] duration-300 dark:shadow-sm',
        lit ? 'border-brand text-brand' : 'border-border text-foreground-light'
      )}
    >
      <Icon size={14} strokeWidth={1.5} />
      <span className="text-[11px]">{label}</span>
    </div>
  )
}

/** Vertical connector for the stacked mobile layout */
function VerticalConnector({
  height,
  active,
  pulseKey,
}: {
  height: number
  active: boolean
  pulseKey?: string
}) {
  const d = `M1,-1 L1,${height + 1}`
  return (
    <svg width="2" height={height} fill="none" className="block shrink-0 overflow-visible">
      <path
        d={d}
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-border-strong dark:stroke-[var(--background-surface-300)]"
      />
      {active && pulseKey && <Pulse key={pulseKey} d={d} delay={0} />}
    </svg>
  )
}

/* Vertical analog of the desktop fan: one point at the bottom of Realtime
 * splitting into three lines, one per client column (centres at 1/6, 1/2, 5/6
 * of the 280px-wide client grid below). */
const MOBILE_FAN_WIDTH = 280
const MOBILE_FAN_HEIGHT = 56
const MOBILE_FAN_PATHS = [
  'M140,0 C140,30 46.7,26 46.7,56',
  'M140,0 L140,56',
  'M140,0 C140,30 233.3,26 233.3,56',
]

function FanConnector({ active, cycle }: { active: boolean; cycle: number }) {
  return (
    <svg
      width={MOBILE_FAN_WIDTH}
      height={MOBILE_FAN_HEIGHT}
      viewBox={`0 0 ${MOBILE_FAN_WIDTH} ${MOBILE_FAN_HEIGHT}`}
      fill="none"
      className="block shrink-0 overflow-visible"
    >
      {MOBILE_FAN_PATHS.map((d) => (
        <path
          key={d}
          d={d}
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-border-strong dark:stroke-[var(--background-surface-300)]"
        />
      ))}
      {active &&
        MOBILE_FAN_PATHS.map((d, i) => (
          <Pulse key={`fan-${cycle}-${i}`} d={d} delay={i * TIMING.fanStagger} />
        ))}
    </svg>
  )
}

function ArchitectureDiagramMobile({
  stage,
  cycle,
  clientsLit,
}: {
  stage: number
  cycle: number
  clientsLit: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-0 py-8 md:hidden">
      {/* Fixed slot so the chip never pushes the diagram when it appears */}
      <div className="relative mb-3 h-7 w-full shrink-0">
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <InsertChip visible={stage >= 1 && stage <= 4} />
        </div>
      </div>

      <PostgresNode />
      <VerticalConnector height={32} active={stage >= 2} pulseKey={`pipe-${cycle}`} />

      {/* mb-5 reserves space for the RLS badge that hangs below the node */}
      <div className="mb-5">
        <RealtimeNode stage={stage} />
      </div>

      <FanConnector active={stage >= 4} cycle={cycle} />

      <div
        className="grid grid-cols-3 justify-items-center"
        style={{ width: MOBILE_FAN_WIDTH }}
      >
        {CLIENTS.map((client) => (
          <ClientNode key={client.label} label={client.label} icon={client.icon} lit={clientsLit} />
        ))}
      </div>
    </div>
  )
}

function ArchitectureDiagramDesktop({
  stage,
  cycle,
  clientsLit,
}: {
  stage: number
  cycle: number
  clientsLit: boolean
}) {
  const CLIENT_POSITIONS = [
    { top: '20%' },
    { top: '50%' },
    { top: '80%' },
  ]

  return (
    <div className="relative hidden aspect-[800/320] md:block">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 320"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {[PIPE_PATH, ...FAN_PATHS].map((d) => (
          <path
            key={d}
            d={d}
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-border-strong dark:stroke-[var(--background-surface-300)]"
          />
        ))}
        {stage >= 2 && <Pulse key={`pipe-${cycle}`} d={PIPE_PATH} delay={0} />}
        {stage >= 4 &&
          FAN_PATHS.map((d, i) => (
            <Pulse key={`fan-${cycle}-${i}`} d={d} delay={i * TIMING.fanStagger} />
          ))}
      </svg>

      <div className="absolute left-[15%] top-[29.5%] -translate-x-1/2">
        <InsertChip visible={stage >= 1 && stage <= 4} />
      </div>

      <div className="absolute left-[15%] top-1/2 -translate-x-1/2 -translate-y-1/2">
        <PostgresNode />
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <RealtimeNode stage={stage} />
      </div>

      {CLIENTS.map((client, i) => (
        <div
          key={client.label}
          className="absolute left-[87.5%] -translate-x-1/2 -translate-y-1/2"
          style={{ top: CLIENT_POSITIONS[i].top }}
        >
          <ClientNode label={client.label} icon={client.icon} lit={clientsLit} />
        </div>
      ))}
    </div>
  )
}

export function ArchitectureDiagram() {
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { amount: 0.4 })
  const reducedMotion = useReducedMotion() ?? false
  const [stage, setStage] = useState(0)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (!inView || reducedMotion) return
    let timeouts: ReturnType<typeof setTimeout>[] = []

    const runCycle = () => {
      timeouts = STAGE_AT.map(([at, s]) => setTimeout(() => setStage(s), at))
    }

    runCycle()
    const loop = setInterval(() => {
      setCycle((c) => c + 1)
      runCycle()
    }, TIMING.cycle)

    return () => {
      clearInterval(loop)
      timeouts.forEach(clearTimeout)
      setStage(0)
    }
  }, [inView, reducedMotion])

  const clientsLit = stage === 5

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[820px]">
      <ArchitectureDiagramMobile stage={stage} cycle={cycle} clientsLit={clientsLit} />
      <ArchitectureDiagramDesktop stage={stage} cycle={cycle} clientsLit={clientsLit} />

      <style>{`
        @keyframes archPulse {
          from { stroke-dashoffset: 0.15; }
          to { stroke-dashoffset: -1; }
        }
      `}</style>
    </div>
  )
}
