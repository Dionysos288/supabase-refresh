'use client'

/* ─────────────────────────────────────────────────────────
 * GROW NAV
 *
 * stage 0   compact pill: logo + cart total + menu icon
 * click     stage 1 — icon morphs to an X (150ms)
 *           stage 2 — panel height grows with a spring,
 *                     links fade up (staggered 40ms)
 * close     panel collapses, icon morphs back
 * cart      count + total roll digit by digit on change
 * ───────────────────────────────────────────────────────── */

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from 'ui'

import { fadeDownMount } from '@/lib/animations'
import { useCart } from '@/lib/cart'
import { formatMoney } from '@/lib/format-money'
import { RollingText } from './RollingText'

/* Panel expansion */
const PANEL = {
  spring: { type: 'spring' as const, stiffness: 320, damping: 32 },
  openDelay: 0.06, //  seconds after click before the panel grows
}

/* Menu links */
const LINKS = {
  stagger: 0.04, //     seconds between links
  appearDelay: 0.12, // seconds after click before the first link
  offsetY: 6, //        px each link rises
  spring: { type: 'spring' as const, stiffness: 400, damping: 30 },
  items: [
    { label: 'store', href: '/' },
    { label: 'shipping + faqs', href: 'https://supabase.store/pages/shipping-faqs' },
    { label: 'supabase.com', href: 'https://supabase.com' },
    { label: 'github', href: 'https://github.com/supabase/supabase' },
  ],
}

/* Menu icon bars (hamburger → X) */
const ICON = {
  transition: { duration: 0.15, ease: 'easeOut' as const },
}

/* Cart button width morph */
const CART = {
  spring: { type: 'spring' as const, stiffness: 350, damping: 30 },
}

export function GrowNav() {
  const [open, setOpen] = useState(false)
  const { count, total } = useCart()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <motion.nav
        {...fadeDownMount(0, 0.8)}
        className={cn(
          'pointer-events-auto overflow-hidden rounded-2xl border border-border',
          'bg-surface-75/90 shadow-lg backdrop-blur-xl'
        )}
      >
        <div className="flex items-center gap-3 px-3 py-2 sm:gap-4 sm:px-4 sm:py-2.5">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground"
            aria-label="Supabase Swag home"
          >
            <SupabaseMark />
            <span className="whitespace-nowrap font-mono text-xs">
              supabase<span className="text-foreground-lighter">/swag</span>
            </span>
          </Link>

          <span aria-hidden className="h-4 w-px bg-border" />

          {/* Status readout, not a link — the demo store has no cart page */}
          <motion.span
            layout
            transition={CART.spring}
            role="status"
            aria-live="polite"
            aria-label={`Cart: ${count} items`}
            className="-mx-1 whitespace-nowrap rounded-lg px-1 py-0.5 font-mono text-xs text-foreground-lighter"
          >
            cart (<RollingText value={String(count)} />)
            <AnimatePresence initial={false}>
              {count > 0 && (
                <motion.span
                  key="total"
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="text-brand"
                >
                  {' · '}
                  <RollingText value={formatMoney(total)} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.span>

          <span aria-hidden className="h-4 w-px bg-border" />

          <button
            type="button"
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-surface-200"
          >
            <span className="relative block h-3 w-4">
              <motion.span
                initial={false}
                animate={{ rotate: open ? 45 : 0, y: open ? 5 : 0 }}
                transition={ICON.transition}
                className="absolute left-0 top-0 block h-px w-4 bg-foreground"
              />
              <motion.span
                initial={false}
                animate={{ opacity: open ? 0 : 1 }}
                transition={ICON.transition}
                className="absolute left-0 top-[5px] block h-px w-4 bg-foreground"
              />
              <motion.span
                initial={false}
                animate={{ rotate: open ? -45 : 0, y: open ? -5 : 0 }}
                transition={ICON.transition}
                className="absolute left-0 top-[10px] block h-px w-4 bg-foreground"
              />
            </span>
          </button>
        </div>

        <motion.div
          id="nav-menu"
          initial={false}
          animate={{ height: open ? 'auto' : 0 }}
          transition={{ ...PANEL.spring, delay: open ? PANEL.openDelay : 0 }}
          aria-hidden={!open}
          className="overflow-hidden"
        >
          <ul className="flex flex-col gap-1 border-t border-border px-4 py-3">
            {LINKS.items.map((link, i) => (
              <motion.li
                key={link.label}
                initial={false}
                animate={{
                  opacity: open ? 1 : 0,
                  y: open ? 0 : LINKS.offsetY,
                }}
                transition={{
                  ...LINKS.spring,
                  delay: open ? LINKS.appearDelay + i * LINKS.stagger : 0,
                }}
              >
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  className="block whitespace-nowrap py-1 font-mono text-xs uppercase tracking-widest text-foreground-lighter transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.nav>
    </div>
  )
}

function SupabaseMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 109 113" fill="none" aria-hidden>
      <path
        d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z"
        fill="url(#nav-grad)"
      />
      <path
        d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z"
        fill="#3ECF8E"
      />
      <defs>
        <linearGradient
          id="nav-grad"
          x1="53.9738"
          y1="54.974"
          x2="94.1635"
          y2="71.8295"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#249361" />
          <stop offset="1" stopColor="#3ECF8E" />
        </linearGradient>
      </defs>
    </svg>
  )
}
