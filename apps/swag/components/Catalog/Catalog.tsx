'use client'

/* ─────────────────────────────────────────────────────────
 * THE ARCHIVE
 *
 * reveal   wordmark rises, filter row follows, entries
 *          stagger in as a wave on mount
 * filter   uppercase text row with a shared-layout
 *          underline; the grid re-sorts via popLayout —
 *          leavers fade out as a quick wave, survivors
 *          glide to their new slots, arrivals rise in
 * height   the grid wrapper's height is measured with a
 *          ResizeObserver and animated on a spring, so
 *          the section below eases into place instead of
 *          jumping up when a filter shrinks the grid
 * rhythm   every 13th entry spans two columns so the grid
 *          reads as a curated spread, not a template
 * ───────────────────────────────────────────────────────── */

import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { cn } from 'ui'

import { byPriceDesc, CATEGORY_LABELS, PRODUCTS, type ProductCategory } from '@/data/products'
import { REVEAL, sectionVariants, staggerContainer } from '@/lib/animations'
import { ProductCard } from './ProductCard'

const FILTERS = ['all', 'tees', 'caps', 'stickers', 'misc'] as const
type Filter = (typeof FILTERS)[number]

/* Section header → filter row cascade */
const SECTION = {
  stagger: 0.1, // seconds between header block and filter row
}

/* Entry grid choreography */
const GRID = {
  stagger: 0.045, //     seconds between entering cards (wave)
  maxDelay: 0.3, //      cap so long lists never feel sluggish
  exitStagger: 0.012, // seconds between exiting cards (quick wave)
  maxExitDelay: 0.1, //  exits must clear fast — they block nothing
  exit: { duration: 0.14, ease: 'easeOut' as const },
  layout: { type: 'spring' as const, stiffness: 320, damping: 34 },
  // Grid wrapper height — heavy enough to feel settled, not bouncy
  height: { type: 'spring' as const, stiffness: 240, damping: 34 },
}

/* Editorial rhythm — repeats every 13 entries:
 *   row 1+2   one featured 2×2 image with 4 small entries
 *             filling the height beside it
 *   row 3+4   two standard rows of 4
 * The featured image swaps sides (left/right) each cycle. */
const CYCLE = 13

/* Card variants, staggered per-index via `custom`. The enter target
 * explicitly resets every value the exit touches (opacity, scale,
 * pointerEvents), so a card caught mid-exit by a rapid filter change
 * always animates back to a fully-restored, clickable state. */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: REVEAL.offsetY, scale: 1 },
  enter: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    pointerEvents: 'auto',
    transition: { ...REVEAL.spring, delay: Math.min(i * GRID.stagger, GRID.maxDelay) },
  }),
  exit: (i: number) => ({
    opacity: 0,
    scale: 0.97,
    // exiting (popped-out) cards must never capture hover/clicks
    pointerEvents: 'none',
    transition: { ...GRID.exit, delay: Math.min(i * GRID.exitStagger, GRID.maxExitDelay) },
  }),
}

/** Tracks an element's rendered height so the wrapper can animate it. */
function useMeasuredHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, height }
}

export function Catalog() {
  const [filter, setFilter] = useState<Filter>('all')
  const { ref: gridRef, height: gridHeight } = useMeasuredHeight<HTMLUListElement>()

  const visible = byPriceDesc(
    filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === (filter as ProductCategory))
  )

  return (
    <section id="catalog" aria-labelledby="catalog-heading" className="archive-container py-16 lg:py-24">
      <motion.div
        variants={staggerContainer(SECTION.stagger)}
        initial="hidden"
        whileInView="show"
        viewport={REVEAL.viewport}
      >
        <motion.div variants={sectionVariants}>
          <h2 id="catalog-heading" className="text-display-sm text-foreground">
            The Archive
          </h2>
          <p className="text-label mt-3 text-foreground-muted" aria-hidden>
            <span className="text-[#569CD6]">select</span> *{' '}
            <span className="text-[#569CD6]">from</span> swag
            {filter !== 'all' && (
              <>
                {' '}
                <span className="text-[#569CD6]">where</span> category ={' '}
                <span className="text-brand">&apos;{filter}&apos;</span>
              </>
            )}{' '}
            <span className="text-[#569CD6]">order by</span> absurdity{' '}
            <span className="text-[#569CD6]">desc</span>;
          </p>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          className="mt-8 -mx-4 border-b border-border px-4 sm:mx-0 sm:px-0"
          role="group"
          aria-label="Filter by category"
        >
          <div className="flex flex-nowrap items-baseline gap-x-5 overflow-x-auto pb-px [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:gap-x-6 sm:gap-y-0 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((option) => {
              const active = filter === option
              const count =
                option === 'all'
                  ? PRODUCTS.length
                  : PRODUCTS.filter((p) => p.category === option).length
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(option)}
                  className={cn(
                    'text-label relative shrink-0 pb-3 transition-colors',
                    active ? 'text-brand' : 'text-foreground-muted hover:text-foreground-light'
                  )}
                >
                  {option === 'all' ? 'All' : CATEGORY_LABELS[option as ProductCategory]}
                  <sup className="ml-1 tabular-nums">{count}</sup>
                  {active && (
                    <motion.span
                      layoutId="filter-underline"
                      className="absolute inset-x-0 bottom-0 h-px bg-brand"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* Height buffer: the inner grid resizes instantly when a filter
          swaps the entries, but this wrapper eases to the new height on
          a spring — so the section below never jumps into view. Until
          the first measurement lands it stays at auto height. */}
      <motion.div
        initial={false}
        animate={gridHeight !== null ? { height: gridHeight } : undefined}
        transition={GRID.height}
        className="mt-10 overflow-clip"
      >
        <ul
          ref={gridRef}
          // relative anchors popLayout's absolutely-positioned exiting cards;
          // grid-flow-row-dense backfills the small entries beside a featured
          // image when it sits on the right.
          className="relative grid grid-flow-row-dense grid-cols-1 gap-x-4 gap-y-12 min-[550px]:grid-cols-2 lg:grid-cols-4 lg:gap-x-6"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((product, i) => {
              const featured = i % CYCLE === 0
              const flipped = Math.floor(i / CYCLE) % 2 === 1
              return (
                <motion.li
                  layout="position"
                  // featured cards are a different size, and layout="position"
                  // can't tween size — so a card whose featured status changes
                  // gets a new key and cleanly exits/re-enters instead of
                  // snapping between the two frames
                  key={`${product.id}:${featured ? 'featured' : 'standard'}`}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="enter"
                  exit="exit"
                  transition={{ layout: GRID.layout }}
                  className={cn(
                    featured && 'min-[550px]:col-span-2 lg:row-span-2',
                    featured && flipped && 'lg:col-start-3'
                  )}
                >
                  <ProductCard product={product} featured={featured} />
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      </motion.div>
    </section>
  )
}
