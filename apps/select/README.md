# Select — 2026 ticket page

A single-page collectible ticket for [Supabase Select](https://select.supabase.com/) attendees.
After applying, you land here: a dot-matrix "admit one" pass floating over a living ASCII
dither field, in the Select26 visual language — deep pine green, cream ink, character art.

## Features

- **Animated dither background** — a full-screen canvas of morphing ASCII blobs
  (`%`, `o`, `#`, `x`, `+`, `/`) driven by thresholded 3D value noise, stepped at ~13fps
  so it feels printed. Honors `prefers-reduced-motion`.
- **ASCII bolt** — the Supabase logo rasterized into a character grid at runtime (canvas
  sampling), printed row-by-row like a dot-matrix printer on load and on every reprint.
- **Torch hover + tilt** — the card leans toward the pointer while a torch beam lights up
  the ASCII characters underneath in Supabase green; the ticket idles on a slow float.
- **Ticket craft** — perforation with punched side notches, tear-off stub, decorative
  barcode, ticket number `#042`, and the official dithered Select26 wordmark up top.
- **Reprint** — cycles three inks: Pine (deep green / `%`), Ink (near-black / `o`),
  Paper (cream / `+`), each fed through the printer slot and reprinted row-by-row.
- **Download** — exports the ticket as a transparent PNG (`html-to-image`).
- **Share / copy link** — Web Share API with an X-intent fallback.

## Structure

- `app/page.tsx` — page composition (dither field, header, ticket, actions)
- `components/DitherField.tsx` — animated full-screen ASCII noise canvas
- `components/AsciiArt.tsx` — ASCII rasterizer for the bolt
- `components/Ticket/Ticket.tsx` — the pass: tilt, torch hover, print animation, stub, notches
- `components/Ticket/variants.ts` — the three ink palettes
- `components/Ticket/Barcode.tsx` — decorative stub barcode
- `components/ActionBar.tsx` — reprint / download / share / copy
- `lib/prng.ts` — seeded PRNG shared by the dither field and the ASCII rasterizer

## Run

From the repo root:

```bash
pnpm dev:select
```

Open http://localhost:3003
