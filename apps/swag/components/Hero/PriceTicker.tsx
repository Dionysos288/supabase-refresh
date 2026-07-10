'use client'

import { motion } from 'framer-motion'
import { cn } from 'ui'

import { artifactNumber, byPriceDesc, PRODUCTS } from '@/data/products'
import { fadeUpMount } from '@/lib/animations'
import { formatMoney } from '@/lib/format-money'

/**
 * System status band. Every artifact scrolls by with its index,
 * price, and listing status — this is where the absurd pricing
 * lives now (the $1,000,000 entries speak for themselves at
 * reading pace). CSS marquee, slow: two identical runs, each
 * translating -100% of itself, 120s per loop.
 */
export function PriceTicker() {
  const entries = byPriceDesc(PRODUCTS)

  return (
    // aria-hidden: every entry is also in the catalog below — the ticker is
    // a decorative duplicate that would be noise for screen readers
    <motion.div
      {...fadeUpMount(1.2, 0.9)}
      aria-hidden="true"
      className="mt-8 overflow-hidden border-y border-border py-4"
    >
      <div className="flex w-max">
        {[0, 1].map((run) => (
          <div
            key={run}
            aria-hidden={run === 1}
            className="animate-marquee flex w-max items-center [animation-duration:120s] motion-reduce:animate-none"
          >
            {entries.map((product) => (
              <span
                key={`${run}-${product.id}`}
                className="text-label flex items-center gap-3 whitespace-nowrap px-6"
              >
                <span className={cn(product.soldOut ? 'text-foreground-muted' : 'text-brand')}>
                  {artifactNumber(product)}
                </span>
                <span
                  className={cn(
                    product.soldOut ? 'text-foreground-muted' : 'text-foreground-light'
                  )}
                >
                  {product.name}
                </span>
                <span
                  className={cn(
                    'tabular-nums',
                    product.soldOut ? 'text-foreground-muted line-through' : 'text-foreground'
                  )}
                >
                  {formatMoney(product.price)}
                </span>
                <span className="text-foreground-muted">
                  {product.soldOut ? '[retired]' : '[listed]'}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
