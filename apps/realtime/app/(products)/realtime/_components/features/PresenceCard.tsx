'use client'

/* ─────────────────────────────────────────────────────────
 * PRESENCE STORYBOARD
 *
 *   idle   4 peer cursors drift on small loops (6-8.5s)
 *  hover   native cursor hides, your cursor takes over and
 *          "You" pops into the avatar stack (spring, no bounce)
 * ───────────────────────────────────────────────────────── */

import { motion } from 'framer-motion'
import { useRef, useState } from 'react'

import { CursorArrow } from '../CursorArrow'
import { YOU_COLOR } from '../hero/variants/livePanel.data'

const PRESENCE_USERS = [
  { name: 'Alan', initials: 'AD', color: '#3ECF8E' },
  { name: 'Jonny', initials: 'JW', color: '#6c63ff' },
  { name: 'Copple', initials: 'CP', color: '#F06A50' },
  { name: 'Terry', initials: 'TP', color: '#f1a10d' },
]

const CURSOR_PATHS: { x: number; y: number }[][] = [
  [
    { x: 24, y: 38 },
    { x: 28, y: 42 },
    { x: 22, y: 44 },
    { x: 26, y: 36 },
  ],
  [
    { x: 58, y: 30 },
    { x: 54, y: 34 },
    { x: 60, y: 36 },
    { x: 56, y: 28 },
  ],
  [
    { x: 36, y: 64 },
    { x: 40, y: 68 },
    { x: 34, y: 70 },
    { x: 38, y: 62 },
  ],
  [
    { x: 68, y: 56 },
    { x: 64, y: 60 },
    { x: 70, y: 62 },
    { x: 66, y: 54 },
  ],
]

const CURSOR_DURATIONS = [6, 7.5, 8.5, 7]

/** Arrow with an absolutely-positioned label so it never wraps at container edges */
function Cursor({ color, name }: { color: string; name: string }) {
  return (
    <div className="relative">
      <CursorArrow color={color} />
      <span
        className="absolute left-[14px] top-[20px] rounded px-1.5 py-0.5 text-[9px] font-medium text-white shadow-sm whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </div>
  )
}

function PresenceCursor({
  user,
  path,
  duration,
}: {
  user: (typeof PRESENCE_USERS)[number]
  path: { x: number; y: number }[]
  duration: number
}) {
  const xFrames = [...path.map((p) => `${p.x}%`), `${path[0].x}%`]
  const yFrames = [...path.map((p) => `${p.y}%`), `${path[0].y}%`]

  return (
    <motion.div
      className="absolute"
      initial={{ left: `${path[0].x}%`, top: `${path[0].y}%` }}
      animate={{ left: xFrames, top: yFrames }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Cursor color={user.color} name={user.name} />
    </motion.div>
  )
}

export function PresenceCard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ cursor: hovered ? 'none' : undefined }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Stacked avatars — leftmost on top (0, -1, -2, …) */}
      <div className="absolute right-4 top-4 z-10 flex -space-x-0.5">
        {PRESENCE_USERS.map((user, i) => (
          <div
            key={user.name}
            className="avatar-fill relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-medium text-foreground"
            style={{ zIndex: -i }}
          >
            {user.initials}
          </div>
        ))}
        <motion.div
          className="avatar-fill relative flex h-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-[9px] font-medium text-foreground"
          style={{ zIndex: -PRESENCE_USERS.length }}
          initial={{ opacity: 0, scale: 0.5, width: 0 }}
          animate={
            hovered
              ? { opacity: 1, scale: 1, width: 28 }
              : { opacity: 0, scale: 0.5, width: 0 }
          }
          transition={{ type: 'spring', duration: 0.47, bounce: 0 }}
        >
          You
        </motion.div>
      </div>

      {/* Animated peer cursors */}
      {PRESENCE_USERS.map((user, i) => (
        <PresenceCursor
          key={user.name}
          user={user}
          path={CURSOR_PATHS[i]}
          duration={CURSOR_DURATIONS[i]}
        />
      ))}

      {/* Your cursor */}
      {hovered && (
        <div className="pointer-events-none absolute z-20" style={{ left: mouse.x, top: mouse.y }}>
          <Cursor color={YOU_COLOR} name="You" />
        </div>
      )}
    </div>
  )
}
