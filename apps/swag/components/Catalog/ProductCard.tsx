'use client'

import Image from 'next/image'
import { cn } from 'ui'

import { MorphButton } from '@/components/MorphButton/MorphButton'
import { artifactNumber, productUrl, type Product } from '@/data/products'
import { useAddedFlash, useCart } from '@/lib/cart'
import { formatMoney } from '@/lib/format-money'

/**
 * Archive entry — a gallery print, not a card. Square corners,
 * no border; the image sits directly on the canvas with an
 * index/name/price caption row beneath it.
 *
 * When a product has a generated dual-image pair, hover
 * crossfades studio → editorial; otherwise the single image
 * eases up 1.03.
 */
export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const { add } = useCart()
  const [added, flashAdded] = useAddedFlash()

  const handleAdd = () => {
    if (product.soldOut || added) return
    add(product)
    flashAdded()
  }

  const hasPair = Boolean(product.images)

  const statuses = [
    product.soldOut && 'retired',
    product.squadOnly && 'squad only',
    product.presale && 'pre-sale',
  ].filter(Boolean) as string[]

  return (
    <article className="group flex h-full flex-col gap-3">
      <div
        className={cn(
          'relative overflow-hidden bg-surface-75',
          // Featured entries span two grid rows on lg — the image grows to
          // fill that height so it lines up with the small entries beside it
          featured ? 'aspect-square lg:aspect-auto lg:min-h-0 lg:flex-1' : 'aspect-square'
        )}
      >
        <a href={productUrl(product)} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden>
          <Image
            src={product.images?.studio ?? product.image}
            alt={product.name}
            fill
            sizes={featured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
            className={cn(
              'object-cover transition-[opacity,transform] duration-700 ease-out',
              !hasPair && 'group-hover:scale-[1.03]',
              hasPair && 'group-hover:opacity-0',
              product.soldOut && 'opacity-50 saturate-0'
            )}
          />
          {hasPair && (
            <Image
              src={product.images!.editorial}
              alt={`${product.name} — editorial view`}
              fill
              sizes={featured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
              className={cn(
                'object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100',
                product.soldOut && 'saturate-0'
              )}
            />
          )}
        </a>

        {!product.soldOut && (
          <div
            className={cn(
              'absolute inset-x-3 bottom-3 flex justify-start transition-[transform,opacity]',
              'max-md:opacity-100 max-md:translate-y-0',
              'md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-within:translate-y-0 md:focus-within:opacity-100'
            )}
          >
            <MorphButton
              onClick={handleAdd}
              morphed={added}
              idleLabel="+ insert"
              morphedLabel="inserted ✓"
              aria-label={`Add ${product.name} to cart`}
              className={cn(
                'border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest backdrop-blur transition-colors',
                added
                  ? 'border-brand bg-brand text-background'
                  : 'border-foreground/40 bg-background/80 text-foreground hover:border-foreground hover:bg-foreground hover:text-background'
              )}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          {/* Muted, not brand green — index is metadata, and green is
              reserved for live/interactive signals (cart, active filter) */}
          <span className="text-label shrink-0 text-foreground-muted">
            {artifactNumber(product)}
          </span>
          <span className="text-label text-foreground-muted">
            {statuses.map((status) => `[${status}]`).join(' ')}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="min-w-0 text-sm leading-snug text-foreground">
            <a
              href={productUrl(product)}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-brand"
            >
              {product.name}
            </a>
          </h3>
          <p
            className={cn(
              'shrink-0 font-mono text-xs tabular-nums',
              product.soldOut ? 'text-foreground-muted line-through' : 'text-foreground-lighter'
            )}
          >
            {formatMoney(product.price)}
          </p>
        </div>
      </div>
    </article>
  )
}
