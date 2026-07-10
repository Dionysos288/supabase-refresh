export type TicketVariant = {
  id: string
  /** card face background */
  cardBg: string
  /** card border */
  edge: string
  /** primary ink on the card */
  ink: string
  /** secondary ink (mono captions, stub) */
  inkSoft: string
  /** resting ASCII art color */
  ascii: string
  /** ASCII color inside the torch beam */
  asciiLit: string
  /** glow behind lit characters */
  asciiGlow: string
  /** characters the bolt is printed with */
  chars: string[]
  /** perforation + barcode ink */
  stubInk: string
}

export const VARIANTS: TicketVariant[] = [
  {
    id: 'pine',
    cardBg: '#0e4632',
    edge: 'rgba(10, 51, 37, 0.9)',
    ink: '#f4f1ea',
    inkSoft: 'rgba(244, 241, 234, 0.55)',
    ascii: 'rgba(244, 241, 234, 0.5)',
    asciiLit: '#3ecf8e',
    asciiGlow: 'rgba(62, 207, 142, 0.55)',
    chars: ['%', '%', '%', 'o'],
    stubInk: 'rgba(244, 241, 234, 0.85)',
  },
  {
    id: 'ink',
    cardBg: '#141613',
    edge: 'rgba(0, 0, 0, 0.85)',
    ink: '#f4f1ea',
    inkSoft: 'rgba(244, 241, 234, 0.5)',
    ascii: 'rgba(244, 241, 234, 0.42)',
    asciiLit: '#3ecf8e',
    asciiGlow: 'rgba(62, 207, 142, 0.5)',
    chars: ['o', 'o', 'o', '0'],
    stubInk: 'rgba(244, 241, 234, 0.85)',
  },
  {
    id: 'paper',
    cardBg: '#faf8f2',
    edge: 'rgba(23, 24, 20, 0.16)',
    ink: '#171814',
    inkSoft: 'rgba(23, 24, 20, 0.5)',
    ascii: 'rgba(14, 70, 50, 0.5)',
    asciiLit: '#0e4632',
    asciiGlow: 'rgba(62, 207, 142, 0.5)',
    chars: ['+', '+', '+', '*'],
    stubInk: 'rgba(23, 24, 20, 0.75)',
  },
]
