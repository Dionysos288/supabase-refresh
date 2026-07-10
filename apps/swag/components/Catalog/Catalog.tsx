'use client'

/* ─────────────────────────────────────────────────────────
 * THE ARCHIVE
 *
 * reveal   wordmark rises, filter row follows, then one
 *          viewport trigger staggers the entries through
 * filter   uppercase text row with a shared-layout
 *          underline; the grid swaps instantly (popLayout)
 * rhythm   every 7th entry spans two columns so the grid
 *          reads as a curated spread, not a template
 * ───────────────────────────────────────────────────────── */

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
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

/* Entry grid reveal */
const GRID = {
  stagger: 0.05, // seconds between entries (single trigger)
}

/* Editorial rhythm — repeats every 13 entries:
 *   row 1+2   one featured 2×2 image with 4 small entries
 *             filling the height beside it
 *   row 3+4   two standard rows of 4
 * The featured image swaps sides (left/right) each cycle. */
const CYCLE = 13

const cardVariants = {
  hidden: { opacity: 0, y: REVEAL.offsetY },
  show: { opacity: 1, y: 0, transition: REVEAL.spring },
}

export function Catalog() {
  const [filter, setFilter] = useState<Filter>('all')

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
          className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-border pb-3"
          role="group"
          aria-label="Filter by category"
        >
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
                  'text-label relative pb-1 transition-colors',
                  active ? 'text-brand' : 'text-foreground-muted hover:text-foreground-light'
                )}
              >
                {option === 'all' ? 'All' : CATEGORY_LABELS[option as ProductCategory]}
                <sup className="ml-1 tabular-nums">{count}</sup>
                {active && (
                  <motion.span
                    layoutId="filter-underline"
                    className="absolute -bottom-[13px] left-0 right-0 h-px bg-brand"
                  />
                )}
              </button>
            )
          })}
        </motion.div>
      </motion.div>

      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.02 }}
        variants={staggerContainer(GRID.stagger)}
        // relative anchors popLayout's absolutely-positioned exiting cards;
        // overflow-clip keeps them from painting (or capturing hover) outside
        // the grid — e.g. over the section below when the filtered grid shrinks.
        // grid-flow-row-dense backfills the small entries beside a featured
        // image when it sits on the right.
        className="relative mt-10 grid grid-flow-row-dense grid-cols-2 gap-x-4 gap-y-12 overflow-clip lg:grid-cols-4 lg:gap-x-6"
      >
        <AnimatePresence mode="popLayout">
          {visible.map((product, i) => {
            const featured = i % CYCLE === 0
            const flipped = Math.floor(i / CYCLE) % 2 === 1
            return (
              <motion.li
                layout="position"
                key={product.id}
                variants={cardVariants}
                initial="hidden"
                animate="show"
                // pointerEvents none so an exiting (or stuck) invisible card
                // can never capture hover/clicks meant for the page beneath it
                exit={{ opacity: 0, scale: 0.97, pointerEvents: 'none', transition: { duration: 0.08 } }}
                className={cn(
                  featured && 'col-span-2 lg:row-span-2',
                  featured && flipped && 'lg:col-start-3'
                )}
              >
                <ProductCard product={product} featured={featured} />
              </motion.li>
            )
          })}
        </AnimatePresence>
      </motion.ul>
    </section>
  )
}
