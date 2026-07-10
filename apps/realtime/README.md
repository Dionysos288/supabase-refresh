# Realtime — product page

A fully static build of the Supabase `/realtime` marketing page: nav, footer, hero and feature sections, with no auth, telemetry, or server dependencies. Anything the chrome needs (GitHub stars, jobs count, blog links) is checked-in local data in `data/staticContent.ts`.

## Structure

```
app/
  layout.tsx                      root layout (fonts, metadata, theme provider)
  page.tsx                        redirects / → /realtime
  (products)/realtime/            the realtime page + its section components
    _components/
      hero/                       live hero (pixel-painting board, live panel)
      features/                   Broadcast / Presence / Database Changes cards
      architecture/               animated architecture diagram
      api/                        API section with tabbed live previews
components/
  Nav/, Footer                    the www site chrome (static, logged-out)
  Layouts/, Products/             page scaffolding (DefaultLayout, SectionContainer, ProductsNav)
  TextLink, ThemeToggle           small shared pieces used by the chrome
data/
  nav.tsx, Footer.ts, ...         nav + footer + dropdown content
  products.ts                     product names/icons used by the nav
fonts/                            next/font setup (Inter, Manrope, Source Code Pro)
public/images/                    only the logos/avatars the page references
```

The page content lives in `app/(products)/realtime/` — everything else is the surrounding site chrome.

## Run

From the repo root:

```bash
pnpm dev:realtime
```

Open http://localhost:3001/realtime (root `/` redirects there).
