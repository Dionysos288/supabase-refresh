import { ArchitectureSection } from './architecture/ArchitectureSection'
import { FeaturesSection } from './features/FeaturesSection'
import { LiveHero } from './hero/LiveHero'
import { ProofBand } from './ProofBand'
import { QuoteSection } from './QuoteSection'
import { BuiltWithSupabaseSection } from '@/components/BuiltWithSupabaseSection'
import { CTASection } from '@/components/CTASection'

export function RealtimeContent({ apiSlot }: { apiSlot: React.ReactNode }) {
  return (
    <div className="overflow-x-clip">
      <section aria-label="Hero">
        <LiveHero />
      </section>
      <section id="proof" className="border-t border-border" aria-label="Performance benchmarks">
        <ProofBand />
      </section>
      <section id="features" className="border-t border-border" aria-label="Realtime features">
        <FeaturesSection />
      </section>
      <section id="quote" className="border-t border-border" aria-label="Customer quote">
        <QuoteSection />
      </section>
      <section id="api" className="border-t border-border" aria-label="API examples">
        {apiSlot}
      </section>
      <section id="how-it-works" className="border-t border-border" aria-label="How it works">
        <ArchitectureSection />
      </section>
      <section
        id="built-with-supabase"
        className="border-t border-border"
        aria-label="Built with Supabase"
      >
        <BuiltWithSupabaseSection />
      </section>
      <section id="get-started" className="border-t border-border" aria-label="Get started">
        <CTASection />
      </section>
    </div>
  )
}
