export type LivePeer = {
  name: string
  initials: string
  color: string
}

/** Your cursor/presence color — matches the presence card elsewhere on the page */
export const YOU_COLOR = '#e563f5'

/**
 * Restrained palette derived from the brand: brand green stays the anchor,
 * the blue and amber are calm companions rather than loud UI-kit hues.
 */
export const LIVE_PEERS: LivePeer[] = [
  { name: 'Ant', initials: 'AW', color: '#3ECF8E' },
  { name: 'Jonny', initials: 'JS', color: '#569AF6' },
  { name: 'Copple', initials: 'CP', color: '#E0A43B' },
]

export const SHELL_TIMING = {
  latencySample: 2400, // ms between latency re-samples (4-9ms jitter)
}

export type LiveVariantProps = {
  /** Report whether "You" is present so the shell can update the avatar stack */
  onYouChange: (present: boolean) => void
}
