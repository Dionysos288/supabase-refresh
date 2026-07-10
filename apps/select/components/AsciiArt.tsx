'use client'

import { useEffect, useState } from 'react'
import { mulberry32 } from '@/lib/prng'

/* Official Supabase bolt mark (109x113 viewBox) */
const BOLT_PATHS = [
  'M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z',
  'M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z',
]

/**
 * Rasterizes the Supabase bolt into a character grid (client-side canvas
 * sampling), the same dot-matrix language as the Select26 site hero.
 */
export function useAsciiBolt(cols: number, rows: number, chars: string[], seed: number) {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = cols
    canvas.height = rows
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // map the 109x113 logo viewBox onto the grid with a little padding
    ctx.setTransform((cols * 0.92) / 109, 0, 0, (rows * 0.92) / 113, cols * 0.04, rows * 0.04)
    ctx.fillStyle = '#fff'
    for (const d of BOLT_PATHS) ctx.fill(new Path2D(d))

    const alpha = ctx.getImageData(0, 0, cols, rows).data
    const rand = mulberry32(seed)
    const out: string[] = []
    for (let y = 0; y < rows; y++) {
      let line = ''
      for (let x = 0; x < cols; x++) {
        const filled = alpha[(y * cols + x) * 4 + 3] > 96
        if (!filled) {
          line += ' '
        } else if (rand() < 0.045) {
          line += ' ' // dropped dots keep it looking printed, not rendered
        } else {
          line += chars[Math.floor(rand() * chars.length)]
        }
      }
      out.push(line)
    }
    setLines(out)
  }, [cols, rows, chars, seed])

  return lines
}

