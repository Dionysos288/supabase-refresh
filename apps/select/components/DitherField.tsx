'use client'

import React, { useEffect, useRef } from 'react'
import { mulberry32 } from '@/lib/prng'

/**
 * Full-screen animated ASCII dither field, the same living-background
 * language as the Select26 hero: organic blobs of single characters
 * that slowly morph. Rendered on canvas from thresholded 3D value
 * noise (x, y, time), stepped at ~13fps so it feels printed, not fluid.
 */

/* seeded permutation for deterministic value noise */
function buildPerm(seed: number) {
  const perm = new Uint8Array(512)
  const rand = mulberry32(seed)
  const base = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[base[i], base[j]] = [base[j], base[i]]
  }
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255]
  return perm
}

const PERM = buildPerm(26)

const smooth = (t: number) => t * t * (3 - 2 * t)
const hash3 = (x: number, y: number, z: number) =>
  PERM[(PERM[(PERM[x & 255] + y) & 255] + z) & 255] / 255

/* trilinear 3D value noise */
function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const zi = Math.floor(z)
  const xf = smooth(x - xi)
  const yf = smooth(y - yi)
  const zf = smooth(z - zi)

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const c000 = hash3(xi, yi, zi)
  const c100 = hash3(xi + 1, yi, zi)
  const c010 = hash3(xi, yi + 1, zi)
  const c110 = hash3(xi + 1, yi + 1, zi)
  const c001 = hash3(xi, yi, zi + 1)
  const c101 = hash3(xi + 1, yi, zi + 1)
  const c011 = hash3(xi, yi + 1, zi + 1)
  const c111 = hash3(xi + 1, yi + 1, zi + 1)

  return lerp(
    lerp(lerp(c000, c100, xf), lerp(c010, c110, xf), yf),
    lerp(lerp(c001, c101, xf), lerp(c011, c111, xf), yf),
    zf
  )
}

/* nested contour bands — highest first */
const BANDS: Array<{ min: number; char: string; color: string }> = [
  { min: 0.67, char: '%', color: 'rgba(62, 207, 142, 0.9)' },
  { min: 0.62, char: 'o', color: 'rgba(62, 207, 142, 0.55)' },
  { min: 0.57, char: '#', color: 'rgba(244, 241, 234, 0.7)' },
  { min: 0.53, char: 'x', color: 'rgba(244, 241, 234, 0.4)' },
  { min: 0.5, char: '+', color: 'rgba(62, 207, 142, 0.35)' },
  { min: 0.475, char: '/', color: 'rgba(244, 241, 234, 0.18)' },
]

const CELL = 18
const FRAME_MS = 75

export const DitherField = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cols = 0
    let rows = 0
    let raf = 0
    let last = 0
    let t = 17.3

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(window.innerWidth / CELL) + 1
      rows = Math.ceil(window.innerHeight / CELL) + 1
      ctx.font = '600 11px "Source Code Pro", ui-monospace, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
    }

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // two octaves of morphing noise — low frequency for big solid blobs
          let v = noise3(x * 0.026, y * 0.036, t) * 0.84
          v += noise3(x * 0.09 + 40, y * 0.12 + 40, t * 1.5) * 0.16

          const band = BANDS.find((b) => v >= b.min)
          if (!band) continue
          // per-cell dropout keeps the print organic
          if (hash3(x * 7, y * 13, 5) < 0.07) continue
          ctx.fillStyle = band.color
          ctx.fillText(band.char, x * CELL + CELL / 2, y * CELL + CELL / 2)
        }
      }
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (now - last < FRAME_MS) return
      last = now
      t += 0.0135
      draw()
    }

    resize()
    window.addEventListener('resize', resize)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      draw()
    } else {
      raf = requestAnimationFrame(frame)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      aria-hidden="true"
    />
  )
}
