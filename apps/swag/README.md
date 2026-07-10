# Swag — Supabase Archive, Collection 010 "Dark Mode"

An editorial rebrand of the [Supabase Swag Store](https://supabase.store/) homepage.

Concept: **a fashion-label drop site run by a database.** Dark gallery canvas, viewport-scale display typography, full-bleed campaign imagery, hairline spec-sheet chrome. Every product is a versioned artifact (`SB-001` … `SB-031`) with a listing status; the tech humor lives in deadpan system labels (the Greenmark™ provenance certificate, `row level security: enabled`) instead of SQL jokes on every surface. Dark mode only (the light mode tee is sold out forever).

## Structure

The store is a single page (`app/page.tsx`) composed from section components:

```
app/
  layout.tsx        root layout (fonts, metadata, hardcoded dark theme)
  page.tsx          the one and only page
  not-found.tsx     404
components/
  Nav/GrowNav       full-width hairline masthead with live cart total
  Hero/DropHero     full-bleed campaign opener + cursor-following chip,
                    spec-sheet strip, and the system status ticker
                    (PriceTicker)
  Lookbook          editorial 2-up campaign spread with scroll drift
  Catalog/Catalog   "The Archive" — editorial grid with mixed rhythm,
                    text filters, and dual-image hover crossfade
                    (ProductCard)
  SwagIsEarned      manifesto typography + Greenmark provenance block
  StoreFooter       link columns + closing wordmark
  MorphButton/      shared add-to-cart button (width + label morph)
  StoreContent      page composition (cart provider + motion config)
data/
  products.ts       catalog data (prices synced with the live store,
                    artifact indices, dual-image registry)
lib/
  animations.ts     shared enter/reveal/morph animation specs
  cart.tsx          cart context (count + total) and the "inserted" flash hook
  format-money.ts   USD formatting
public/
  favicon/          site icons
  images/store/     product imagery
```

## Run

From the repo root:

```bash
pnpm dev:swag
```

Open http://localhost:3002
