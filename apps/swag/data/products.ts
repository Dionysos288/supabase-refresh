export type ProductCategory = 'tees' | 'caps' | 'stickers' | 'misc'

export type Product = {
  /** Slug — matches `/images/store/<id>.*` and `supabase.store/products/<id>` */
  id: string
  name: string
  price: number
  image: string
  /**
   * Archive artifact number (SB-001 …). The featured drop is SB-001;
   * catalog items follow in listing order.
   */
  index: number
  /**
   * Dual campaign shots (see docs/swag-image-prompts.md).
   * `studio` is the resting card image, `editorial` crossfades in on
   * hover. Cards fall back to `image` until these are generated.
   */
  images?: { studio: string; editorial: string }
  category: ProductCategory
  soldOut?: boolean
  /** Only available to SupaSquad members + the Supabase team */
  squadOnly?: boolean
  presale?: boolean
}

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const

/** The hero drop — the one item priced like actual merch. Artifact SB-001. */
export const FEATURED: Product = {
  id: 'tshirt',
  name: 'T Shirt (Dark mode)',
  price: 50,
  image: '/images/store/tshirt.png',
  index: 1,
  images: {
    studio: '/images/store/tshirt-studio.png',
    editorial: '/images/store/tshirt-editorial.png',
  },
  category: 'tees',
}

type CatalogEntry = Omit<Product, 'index'>

/**
 * Full catalog, prices synced with the live store (July 2026).
 * Community + SupaSquad collections merged; squad exclusives are flagged.
 */
const CATALOG: CatalogEntry[] = [
  { id: 'supabase-yc-cap', name: 'Supabase YC Cap', price: 100, image: '/images/store/supabase-yc-cap.png', category: 'caps' },
  { id: 'supalaunchweek14-dark-mode-tee', name: '#SupaLaunchWeek14 Dark Mode Tee', price: 500_000, image: '/images/store/supalaunchweek14-dark-mode-tee.png', category: 'tees' },
  { id: 'supalaunchweek13-dark-mode-tee', name: '#SupaLaunchWeek13 Dark Mode Tee', price: 500_000, image: '/images/store/supalaunchweek13-dark-mode-tee.jpg', category: 'tees' },
  { id: 'supalaunchweek12-dark-mode-tee', name: '#SupaLaunchWeek12 Dark Mode Tee', price: 500_000, image: '/images/store/supalaunchweek12-dark-mode-tee.png', category: 'tees', squadOnly: true },
  { id: 'supaswag-box', name: 'SupaSwag box', price: 50_000, image: '/images/store/supaswag-box.png', category: 'misc' },
  { id: 'drizzle-x-supacap', name: 'Drizzle x SupaCap', price: 100_000, image: '/images/store/drizzle-x-supacap.jpg', category: 'caps' },
  { id: 'supalaunchweekx-dark-mode-tee', name: '#SupaLaunchWeekX Dark Mode Tee', price: 500_000, image: '/images/store/supalaunchweekx-dark-mode-tee.jpg', category: 'tees' },
  { id: 'supalaunchweek8-t-shirt', name: '#SupaLaunchWeek8 T-shirt', price: 500_000, image: '/images/store/supalaunchweek8-t-shirt.png', category: 'tees' },
  { id: 'supabases-50k-github-tee', name: "Supabase's 50K GitHub Tee", price: 10_000, image: '/images/store/supabases-50k-github-tee.png', category: 'tees' },
  { id: 'supalaunchweek7-stickers-pack', name: '#SupaLaunchWeek7 Stickers Pack', price: 500, image: '/images/store/supalaunchweek7-stickers-pack.jpg', category: 'stickers' },
  { id: 'supalaunchweek7-mechanical-keyboard', name: '#SupaLaunchWeek7 Mechanical keyboard', price: 1_000_000, image: '/images/store/supalaunchweek7-mechanical-keyboard.jpg', category: 'misc', soldOut: true },
  { id: 'supalaunchweek7-tee', name: '#SupaLaunchWeek7 Dark Mode Tee', price: 500_000, image: '/images/store/supalaunchweek7-tee.jpg', category: 'tees' },
  { id: 'supaverified-silver-tee', name: 'Supaverified Silver Tee', price: 100_000, image: '/images/store/supaverified-silver-tee.png', category: 'tees' },
  { id: 'supaverified-tee', name: 'Supaverified Tee', price: 10_000, image: '/images/store/supaverified-tee.png', category: 'tees' },
  { id: 'supaverified-gold-tee', name: 'Supaverified Gold Tee', price: 1_000_000, image: '/images/store/supaverified-gold-tee.png', category: 'tees' },
  { id: 'silver-supacap', name: 'Silver SupaCap', price: 500_000, image: '/images/store/silver-supacap.jpg', category: 'caps' },
  { id: 'gold-supacap', name: 'Gold SupaCap', price: 1_000_000, image: '/images/store/gold-supacap.png', category: 'caps' },
  { id: 'supacap', name: 'SupaCap', price: 100, image: '/images/store/supacap.png', category: 'caps' },
  { id: 'japan-swag-collection', name: 'Japan SupaTee', price: 50, image: '/images/store/japan-swag-collection.png', category: 'tees' },
  { id: 'supabrew-6-pack', name: 'Supabrew - 6 pack', price: 32, image: '/images/store/supabrew-6-pack.png', category: 'misc', soldOut: true },
  { id: 'jons-stickers', name: "Jon's Stickers", price: 5, image: '/images/store/jons-stickers.jpg', category: 'stickers' },
  { id: 'supacoaster', name: 'SupaCoaster', price: 100, image: '/images/store/supacoaster.jpg', category: 'misc' },
  { id: 'holiday-hackdays-gold-tee', name: 'Holiday Hackdays Gold Tee', price: 1_000_000, image: '/images/store/holiday-hackdays-gold-tee.png', category: 'tees', soldOut: true },
  { id: 'jons-supatee', name: "Jon's SupaTee", price: 50, image: '/images/store/jons-supatee.png', category: 'tees' },
  { id: 'webcam-cover', name: 'Webcam cover', price: 99, image: '/images/store/webcam-cover.jpg', category: 'misc' },
  { id: 'thors-supa-hammer-tee-pre-sale', name: "Thor's Supa Hammer Tee", price: 50, image: '/images/store/thors-supa-hammer-tee-pre-sale.png', category: 'tees', presale: true },
  { id: 'hacktoberfest-silver-tee', name: 'Hacktoberfest Silver Tee', price: 500_000, image: '/images/store/hacktoberfest-silver-tee.png', category: 'tees', soldOut: true },
  { id: 'hacktoberfest-gold-tee', name: 'Hacktoberfest Gold Tee', price: 1_000_000, image: '/images/store/hacktoberfest-gold-tee.png', category: 'tees', soldOut: true },
  { id: 'supabase-hoodie', name: 'Hoodies (Team only)', price: 200, image: '/images/store/supabase-hoodie.png', category: 'tees', soldOut: true, squadOnly: true },
  { id: 't-shirts-light-mode-supasquad-only', name: 'T Shirts (Light mode)', price: 0, image: '/images/store/t-shirts-light-mode-supasquad-only.png', category: 'tees', soldOut: true, squadOnly: true },
]

function withIndex(entry: CatalogEntry, index: number): Product {
  return {
    ...entry,
    index,
    images: {
      studio: `/images/store/${entry.id}-studio.png`,
      editorial: `/images/store/${entry.id}-editorial.png`,
    },
  }
}

export const PRODUCTS: Product[] = CATALOG.map((entry, i) => withIndex(entry, i + 2))

/** Price descending — the catalog's "order by absurdity desc" */
export function byPriceDesc(products: Product[]) {
  return [...products].sort((a, b) => b.price - a.price)
}

/** SB-### artifact label, e.g. `SB-014` */
export function artifactNumber(product: Pick<Product, 'index'>) {
  return `SB-${String(product.index).padStart(3, '0')}`
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  tees: 'Tees',
  caps: 'Caps',
  stickers: 'Stickers',
  misc: 'Misc',
}

export function productUrl(product: Product) {
  return `https://supabase.store/products/${product.id}`
}
