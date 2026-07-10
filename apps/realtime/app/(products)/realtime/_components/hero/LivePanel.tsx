'use client'

import { useState } from 'react'

import { LivePanelShell } from './LivePanelShell'
import { PixelsVariant } from './variants/PixelsVariant'

export function LivePanel() {
  const [youPresent, setYouPresent] = useState(false)

  return (
    <LivePanelShell channel="canvas:place" youPresent={youPresent}>
      <PixelsVariant onYouChange={setYouPresent} />
    </LivePanelShell>
  )
}
