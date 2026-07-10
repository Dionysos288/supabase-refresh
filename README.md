# Supabase Refresh

Three self-contained Supabase marketing surfaces in one pnpm workspace, structured like the Supabase open-source monorepo (`apps/` + `packages/`).

| App | What it is | Dev URL |
| --- | --- | --- |
| [`apps/realtime`](apps/realtime) | The `/realtime` product page — hero, feature cards, architecture diagram, API section | http://localhost:3001/realtime |
| [`apps/swag`](apps/swag) | The swag store, rebuilt as an editorial "archive" drop site | http://localhost:3002 |
| [`apps/select`](apps/select) | Supabase Select 2026 — a collectible conference ticket page | http://localhost:3003 |

## Structure

```
apps/
  realtime/      Next.js app — Supabase Realtime product page
  swag/          Next.js app — swag store
  select/        Next.js app — Select 2026 ticket page
packages/
  ui/            shared React components (Button, NavigationMenu, Accordion,
                 dropdowns, brand icons, cn) + the compiled theme CSS
  config/        Tailwind v4 design system: tokens, themes, utilities,
                 variants, typography config, shared PostCSS config
  tsconfig/      shared TypeScript configs (base / nextjs / react-library)
  eslint-config-supabase/  shared flat ESLint config for the apps
```

All three apps are static marketing pages built with Next.js (App Router), React 19, Tailwind CSS v4 and Framer Motion. They share the design system through `packages/config` (imported at the top of each app's `styles/globals.css`) and UI primitives through `packages/ui`.

## Getting started

Requirements: Node 22+, pnpm 10.

```bash
pnpm install

pnpm dev:realtime   # http://localhost:3001
pnpm dev:swag       # http://localhost:3002
pnpm dev:select     # http://localhost:3003
```

## Scripts

```bash
pnpm build       # production build of all three apps
pnpm typecheck   # tsc --noEmit across all apps
pnpm lint        # eslint across all apps
```

Each app also has its own `dev`, `build`, `lint` and `typecheck` scripts — see the per-app READMEs for details on how each page is put together.
