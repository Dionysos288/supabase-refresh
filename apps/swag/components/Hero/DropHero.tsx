'use client'

/* ─────────────────────────────────────────────────────────
 * CAMPAIGN OPENER — COLLECTION 010 "DARK MODE"
 *
 * Full-viewport campaign image with the collection wordmark
 * overlaid, followed by a hairline spec-sheet strip holding
 * the size selector + insert CTA.
 *
 *    0ms   campaign image fades in (1.4s, slow scale settle)
 *  300ms   metadata line fades up
 *  500ms   wordmark line 1 rises inside its mask (1.1s)
 *  620ms   wordmark line 2 rises
 *  950ms   caption + scroll cue fade up
 *          spec strip fades in after the wordmark lands
 *
 * cursor   hovering the image spawns a square chip that
 *          follows the mouse with a slow spring and a
 *          scrolling "insert into cart" marquee; clicking
 *          anywhere on the image inserts into cart
 * ───────────────────────────────────────────────────────── */

import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { cn } from 'ui'

import { MorphButton } from '@/components/MorphButton/MorphButton'
import { artifactNumber, FEATURED, SIZES } from '@/data/products'
import { fadeUpMount, MORPH, MOUNT } from '@/lib/animations'
import { useAddedFlash, useCart } from '@/lib/cart'
import { formatMoney } from '@/lib/format-money'

const CAMPAIGN_IMAGE = '/images/store/campaign-hero.png'

/* Wordmark lines (rise inside overflow-hidden masks) */
const WORDMARK = {
  duration: 1.1,
  lines: [
    { text: 'Dark', delay: 0.5 },
    { text: 'Mode', delay: 0.62 },
  ],
}

/* Deliberate, heavier cursor spring than the old pill chip */
const CURSOR_SPRING = { stiffness: 220, damping: 34 }

/* Cursor chip — fixed widths so the spring morphs between exact values */
const CHIP = {
  width: MORPH.width,
  idle: 208, //    marquee viewport
  success: 116, // "inserted ✓" label
  labelExit: MORPH.labelExit,
  charStagger: MORPH.charStagger,
  charEnter: MORPH.charEnter,
}

export function DropHero() {
  const { add } = useCart()
  const [size, setSize] = useState<string>('M')
  const [ctaAdded, flashCtaAdded] = useAddedFlash()
  const [chipAdded, flashChipAdded] = useAddedFlash()

  const handleCtaAdd = () => {
    if (ctaAdded) return
    add(FEATURED)
    flashCtaAdded()
  }

  const handleChipAdd = () => {
    if (chipAdded) return
    add(FEATURED)
    flashChipAdded()
  }

  return (
    // Image + spec strip together fill exactly one viewport, so the
    // price ticker below stays out of the first impression
    <section aria-labelledby="hero-heading" className="flex h-dvh min-h-[560px] flex-col">
      <div className="relative min-h-0 w-full flex-1 overflow-hidden border-b border-border">
        <CampaignImage added={chipAdded} onActivate={handleChipAdd} />

        {/* Overlaid copy — pointer-events off so the image stays clickable */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-4 pb-8 pt-24 sm:px-6 lg:px-10 lg:pb-10">
          <motion.p
            {...fadeUpMount(0.3, 0.9)}
            className="text-label flex flex-wrap items-center gap-x-3 gap-y-1 text-foreground-light"
          >
            <span className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping motion-reduce:animate-none bg-brand opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 bg-brand" />
              </span>
              collection_010
            </span>
            <span aria-hidden className="text-foreground-muted">/</span>
            <span>31 artifacts</span>
            <span aria-hidden className="text-foreground-muted">/</span>
            <span>status: live</span>
          </motion.p>

          <div>
            <h1 id="hero-heading" className="text-display text-foreground">
              {WORDMARK.lines.map((line) => (
                <span key={line.text} className="block overflow-hidden">
                  <motion.span
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: WORDMARK.duration, ease: MOUNT.ease, delay: line.delay }}
                    className="block"
                  >
                    {line.text}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.div
              {...fadeUpMount(0.95, 0.9)}
              className="mt-5 flex flex-wrap items-end justify-between gap-4"
            >
              <p className="max-w-sm text-sm leading-relaxed text-foreground-light">
                The only theme we ship. Light mode is{' '}
                <span className="text-foreground line-through decoration-foreground-muted">
                  sold out
                </span>{' '}
                forever.
              </p>
              {/* pointer-events-auto: the overlay disables pointer events so
                  the image stays clickable — re-enable them for this link */}
              <a
                href="#catalog"
                className="text-label pointer-events-auto hidden text-foreground-lighter transition-colors hover:text-foreground sm:block"
              >
                scroll to browse the archive ↓
              </a>
            </motion.div>
          </div>
        </div>

        {/* Frame gradient so the wordmark reads over any image */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-background/90 via-background/20 to-background/60"
        />
      </div>

      <motion.div
        {...fadeUpMount(1.1, 0.9)}
        className="border-b border-border"
      >
        <div className="archive-container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-label text-brand">{artifactNumber(FEATURED)}</span>
            <span className="text-sm uppercase tracking-wide text-foreground">{FEATURED.name}</span>
            <span className="font-mono text-xs tabular-nums text-foreground-lighter">
              {formatMoney(FEATURED.price)}
            </span>
            <span className="text-label text-foreground-muted">100% cotton / 0% light mode</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center" role="group" aria-label="Size">
              {SIZES.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={size === option}
                  onClick={() => setSize(option)}
                  className={cn(
                    'min-w-9 border-y border-l border-border px-2 py-1.5 font-mono text-xs transition-colors last:border-r',
                    size === option
                      ? 'bg-foreground text-background'
                      : 'text-foreground-lighter hover:bg-surface-75 hover:text-foreground'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            <MorphButton
              onClick={handleCtaAdd}
              morphed={ctaAdded}
              idleLabel="insert into cart"
              morphedLabel={`inserted · size ${size}`}
              className={cn(
                'border px-6 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors',
                ctaAdded
                  ? 'border-brand bg-brand-300 text-brand-600'
                  : 'border-foreground bg-foreground text-background hover:bg-brand hover:border-brand'
              )}
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/** Full-bleed campaign image with a square chip that follows the cursor. */
function CampaignImage({ added, onActivate }: { added: boolean; onActivate: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [hovering, setHovering] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, CURSOR_SPRING)
  const springY = useSpring(y, CURSOR_SPRING)

  // Last known viewport position of the mouse, so the chip can
  // re-anchor to the cursor when the page scrolls under it.
  // Tracked window-wide (not just over the image) so scrolling
  // the hero *under* a stationary cursor can open the chip too.
  const client = useRef<{ x: number; y: number } | null>(null)

  const syncToCursor = () => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect || !client.current) return
    x.set(client.current.x - rect.left)
    y.set(client.current.y - rect.top)
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      client.current = { x: e.clientX, y: e.clientY }
    }
    const onScroll = () => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect || !client.current) return
      const { x: cx, y: cy } = client.current
      const inside = cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom
      if (inside) syncToCursor()
      // Open when the hero scrolls under the cursor, close when it leaves
      setHovering(inside)
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const chipLabel = added ? 'inserted ✓' : 'insert into cart'

  const handleClick = () => {
    if (added) return
    onActivate()
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label="Insert T Shirt (Dark mode) into cart"
      onClick={handleClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={(e) => {
        client.current = { x: e.clientX, y: e.clientY }
        syncToCursor()
      }}
      className={cn('absolute inset-0 block h-full w-full', hovering && 'md:cursor-none')}
    >
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: MOUNT.ease }}
        className="h-full w-full"
      >
        <Image
          src={CAMPAIGN_IMAGE}
          alt="T Shirt (Dark mode) — black tee with the Supabase wordmark"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      <AnimatePresence>
        {hovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            style={{ x: springX, y: springY }}
            className="pointer-events-none absolute left-0 top-0 z-20 hidden -translate-x-1/2 -translate-y-1/2 md:block"
          >
            <motion.div
              initial={false}
              animate={{ width: added ? CHIP.success : CHIP.idle }}
              transition={CHIP.width}
              className="overflow-hidden border border-foreground bg-background/90 py-2 shadow-lg backdrop-blur"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={chipLabel}
                  exit={{ opacity: 0, transition: CHIP.labelExit }}
                  className={cn(
                    'flex items-center font-mono text-[11px] uppercase tracking-widest',
                    added ? 'justify-center px-4 text-brand' : 'text-foreground'
                  )}
                >
                  {added ? (
                    chipLabel.split('').map((char, i) => (
                      <motion.span
                        key={`${chipLabel}-${i}`}
                        initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ ...CHIP.charEnter, delay: i * CHIP.charStagger }}
                        className="inline-block whitespace-pre"
                      >
                        {char}
                      </motion.span>
                    ))
                  ) : (
                    <span className="flex w-max">
                      {[0, 1].map((run) => (
                        <span
                          key={run}
                          aria-hidden={run === 1}
                          className="animate-marquee whitespace-pre [animation-duration:8s] motion-reduce:animate-none"
                        >
                          {' insert into cart · insert into cart ·'}
                        </span>
                      ))}
                    </span>
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
