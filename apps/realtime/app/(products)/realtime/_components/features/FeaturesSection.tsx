import SectionContainer from '@/components/Layouts/SectionContainer'

import { BroadcastCard } from './BroadcastCard'
import { DatabaseChangesCard } from './DatabaseChangesCard'
import { PresenceCard } from './PresenceCard'

const FEATURES = [
  {
    title: 'Database changes',
    description:
      'Listen to inserts, updates, and deletes in your Postgres database and react instantly. Try it — send a message.',
    visual: DatabaseChangesCard,
  },
  {
    title: 'Presence',
    description:
      'Store and synchronize online user state consistently across all connected clients.',
    visual: PresenceCard,
  },
  {
    title: 'Broadcast',
    description:
      'Send any data to any client subscribed to the same channel with low latency. Fire one yourself.',
    visual: BroadcastCard,
  },
]

export function FeaturesSection() {
  return (
    <SectionContainer spacing="sections">
      <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-2">
        <h3 className="max-w-xl text-2xl text-foreground-lighter md:text-4xl">
          Three ways
          <br />
          <span className="text-foreground">to go realtime</span>
        </h3>
        <p className="text-sm text-foreground-lighter lg:text-base">
          Database changes, presence tracking, and broadcast messaging — everything you need to
          build collaborative, real-time applications.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {FEATURES.map((feature) => {
          const Visual = feature.visual
          return (
            <div
              key={feature.title}
              className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface-75"
            >
              <div className="relative flex h-[320px] items-center justify-center">
                <Visual />
              </div>
              <div className="flex flex-col gap-1 px-6 py-5">
                <h4 className="text-sm font-medium text-foreground">{feature.title}</h4>
                <p className="text-sm text-foreground-lighter">{feature.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </SectionContainer>
  )
}
