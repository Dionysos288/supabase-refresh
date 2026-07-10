'use client'

/* ─────────────────────────────────────────────────────────
 * API SECTION STORYBOARD
 *
 *   idle   active tab's underline fills over 10s, then the
 *          next tab activates (paused while hovering, or
 *          when the section is off-screen)
 * switch   code cross-fades + panel height animates; the
 *          live preview cross-fades and its console clears
 * ───────────────────────────────────────────────────────── */

import SectionContainer from '@/components/Layouts/SectionContainer'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { Database, Radio, Users } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { cn } from 'ui'

import { PreviewPanel } from './PreviewPanel'

const ICONS = { Database, Users, Radio } as const

type IconName = keyof typeof ICONS

type ApiExample = {
  icon: IconName
  title: string
  channel: string
  description: string
  darkHtml: string
  lightHtml: string
}

const TIMING = {
  interval: 10_000, // ms a tab stays active
  tick: 30, // ms per progress update
}

export function ApiSectionClient({ examples }: { examples: ApiExample[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const inViewRef = useRef<HTMLDivElement>(null)
  const inView = useInView(inViewRef, { amount: 0.3 })
  const active = examples[activeIdx]

  useEffect(() => {
    if (!inView || paused) return
    const increment = (100 / TIMING.interval) * TIMING.tick
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + increment, 100))
    }, TIMING.tick)
    return () => clearInterval(interval)
  }, [inView, paused])

  useEffect(() => {
    if (progress < 100) return
    setActiveIdx((prev) => (prev + 1) % examples.length)
    setProgress(0)
  }, [progress, examples.length])

  const handleTabClick = (index: number) => {
    setActiveIdx(index)
    setProgress(0)
  }

  // Height animation: measure an invisible always-mounted copy of the active
  // snippet so the panel can animate to the target height during cross-fades
  const measureRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()
  // Flips one render after the first measurement, so the initial height
  // snaps into place (duration 0) and only later changes animate
  const [hasMeasured, setHasMeasured] = useState(false)

  useEffect(() => {
    const el = measureRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight))
    ro.observe(el)
    setHeight(el.offsetHeight)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (height != null) setHasMeasured(true)
  }, [height])

  return (
    <SectionContainer ref={inViewRef} spacing="sections">
      <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-2">
        <h3 className="max-w-xl text-2xl text-foreground-lighter md:text-4xl">
          Write a few lines
          <br />
          <span className="text-foreground">watch them run</span>
        </h3>
        <p className="text-sm text-foreground-lighter lg:text-base">
          APIs that you can understand, with powerful libraries on client and server. The panel on
          the right is what the code produces.
        </p>
      </div>

      <div
        className="flex flex-col gap-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div role="tablist" aria-label="Realtime API examples" className="flex flex-wrap gap-2">
          {examples.map((example, index) => {
            const isActive = index === activeIdx
            const Icon = ICONS[example.icon]
            return (
              <button
                key={example.title}
                role="tab"
                id={`api-tab-${index}`}
                aria-selected={isActive}
                aria-controls="api-tabpanel"
                onClick={() => handleTabClick(index)}
                className={cn(
                  'relative flex items-center gap-2 overflow-hidden rounded-md border px-4 py-2 text-sm transition-colors',
                  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-foreground-lighter',
                  isActive
                    ? 'border-border bg-surface-100 text-foreground'
                    : 'border-transparent text-foreground-lighter hover:text-foreground'
                )}
              >
                <Icon size={15} strokeWidth={1.5} aria-hidden="true" />
                {example.title}
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[2px] bg-brand"
                  style={{ width: isActive ? `${progress}%` : 0 }}
                />
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id="api-tabpanel"
          aria-labelledby={`api-tab-${activeIdx}`}
          className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2"
        >
          <motion.div
            initial={false}
            animate={height != null ? { height } : undefined}
            transition={
              hasMeasured ? { duration: 0.35, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }
            }
            className="relative overflow-hidden rounded-md border border-border"
          >
            <div
              ref={measureRef}
              aria-hidden
              className="pointer-events-none invisible absolute inset-x-0 top-0 overflow-x-auto pb-12 [&_pre]:!bg-transparent [&_pre]:m-0 [&_pre]:p-6"
              style={{ fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: active.darkHtml }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={active.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15, delay: 0.05 } }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="overflow-x-auto pb-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div
                  dangerouslySetInnerHTML={{ __html: active.darkHtml }}
                  className="hidden dark:block [&_pre]:!bg-transparent [&_pre]:m-0 [&_pre]:p-6"
                  style={{ fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.7 }}
                />
                <div
                  dangerouslySetInnerHTML={{ __html: active.lightHtml }}
                  className="block dark:hidden [&_pre]:!bg-transparent [&_pre]:m-0 [&_pre]:p-6"
                  style={{ fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.7 }}
                />
              </motion.div>
            </AnimatePresence>
            <Link
              href="/docs/guides/realtime"
              className="absolute bottom-4 right-4 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-surface-100 px-3 py-1.5 text-xs text-foreground-light transition-colors hover:bg-surface-200 hover:text-foreground"
            >
              Documentation
              <svg
                width={12}
                height={12}
                viewBox="0 0 12 12"
                fill="none"
                className="shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M3.5 2.5H9.5V8.5M9.5 2.5L2.5 9.5"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>

          <PreviewPanel channel={active.channel} active={inView} />
        </div>
      </div>
    </SectionContainer>
  )
}
