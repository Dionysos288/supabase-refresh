import React from 'react'

/* deterministic Code39-ish bar pattern — decorative only */
const SEED = [2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 1, 2, 1, 3, 2, 1, 1, 1, 3, 1, 2, 2, 1, 1, 3, 1, 1, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2]

export const Barcode = ({ color, className }: { color: string; className?: string }) => {
  let x = 0
  const bars: React.ReactNode[] = []
  SEED.forEach((w, i) => {
    if (i % 2 === 0) {
      bars.push(<rect key={i} x={x} y={0} width={w * 1.4} height={26} fill={color} />)
    }
    x += w * 1.4 + 1.4
  })
  return (
    <svg viewBox={`0 0 ${x} 26`} className={className} preserveAspectRatio="none" aria-hidden="true">
      {bars}
    </svg>
  )
}
