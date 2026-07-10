import SectionContainer from '@/components/Layouts/SectionContainer'
import { Database, Globe, ShieldCheck } from 'lucide-react'

import { ArchitectureDiagram } from './ArchitectureDiagram'

const CALLOUTS = [
  {
    icon: Database,
    title: 'Broadcast from your database',
    description:
      'Stream changes straight from the Postgres replication log, or send messages from triggers — no extra infrastructure to run.',
  },
  {
    icon: ShieldCheck,
    title: 'Authorized by Row Level Security',
    description:
      'Private channels reuse the same RLS policies that already protect your tables. One security model for data at rest and in motion.',
  },
  {
    icon: Globe,
    title: 'Globally distributed',
    description:
      'A distributed cluster routes messages close to your users and scales with your project — no capacity planning required.',
  },
]

export function ArchitectureSection() {
  return (
    <SectionContainer spacing="sections">
      <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-2">
        <h3 className="max-w-xl text-2xl text-foreground-lighter md:text-4xl">
          Part of your database
          <br />
          <span className="text-foreground">not bolted on</span>
        </h3>
        <p className="text-sm text-foreground-lighter lg:text-base">
          Realtime is built into every Supabase project. Changes flow from Postgres through a
          globally distributed cluster to your clients — checked against your Row Level Security
          policies on the way.
        </p>
      </div>

      <ArchitectureDiagram />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {CALLOUTS.map((callout) => {
          const Icon = callout.icon
          return (
            <div
              key={callout.title}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface-75 px-6 py-5"
            >
              <Icon size={18} strokeWidth={1.5} className="text-brand" />
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-medium text-foreground">{callout.title}</h4>
                <p className="text-sm text-foreground-lighter">{callout.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </SectionContainer>
  )
}
