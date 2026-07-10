import Link from 'next/link'

const STATS = [
  { value: 6, suffix: 'ms', label: 'median latency', sub: 'under sustained load' },
  { value: 224_000, suffix: '', label: 'messages per second', sub: 'to 32,000 users' },
  { value: 250_000, suffix: '', label: 'concurrent users', sub: 'on a single project' },
]

const BENCHMARKS_URL = '/docs/guides/realtime/benchmarks'

function StatValue({ value, suffix }: { value: number; suffix: string }) {
  return (
    <span className="tabular-nums">
      {value.toLocaleString('en-US')}
      {suffix && <span className="text-foreground-lighter">{suffix}</span>}
    </span>
  )
}

export function ProofBand() {
  return (
    <div className="section-container py-10 md:py-14">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 sm:border-l sm:border-border sm:pl-6 first:sm:border-l-0 first:sm:pl-0"
          >
            <span className="text-3xl text-foreground md:text-4xl lg:text-5xl">
              <StatValue value={stat.value} suffix={stat.suffix} />
            </span>
            <span className="text-sm text-foreground-light">{stat.label}</span>
            <span className="text-xs text-foreground-muted">{stat.sub}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-start">
        <Link
          href={BENCHMARKS_URL}
          className="text-xs text-foreground-lighter underline decoration-foreground-muted underline-offset-4 transition-colors hover:text-foreground"
        >
          From our public Realtime benchmarks
        </Link>
      </div>
    </div>
  )
}
