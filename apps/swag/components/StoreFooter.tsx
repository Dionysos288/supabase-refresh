'use client'

/* ─────────────────────────────────────────────────────────
 * FOOTER
 *
 * Editorial close: link columns under a hairline, then the
 * full-width SUPABASE wordmark as the final image of the
 * page, then the legal line. The wordmark rises inside a
 * mask on scroll.
 * ───────────────────────────────────────────────────────── */

import { motion } from 'framer-motion'

import { REVEAL, sectionVariants } from '@/lib/animations'

const LINK_GROUPS = [
  {
    title: 'Supabase',
    links: [
      { label: 'Website', href: 'https://supabase.com' },
      { label: 'Blog', href: 'https://supabase.com/blog' },
      { label: 'Careers', href: 'https://supabase.com/careers' },
    ],
  },
  {
    title: 'Archive',
    links: [
      { label: 'Shipping & FAQs', href: 'https://supabase.store/pages/shipping-faqs' },
      { label: 'Swag story', href: 'https://supabase.com/blog/supabase-swag-store' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'GitHub', href: 'https://github.com/supabase/supabase' },
      { label: 'Twitter', href: 'https://twitter.com/supabase' },
      { label: 'YouTube', href: 'https://youtube.com/@supabase' },
    ],
  },
]

export function StoreFooter() {
  return (
    <footer className="border-t border-border">
      <div className="archive-container grid grid-cols-2 gap-10 py-14 sm:grid-cols-4">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={REVEAL.viewport}
          className="col-span-2 sm:col-span-1"
        >
          <p className="text-label text-foreground">Built in a weekend.</p>
          <p className="text-label mt-1 text-foreground-lighter">Worn for millions.</p>
          <p className="mt-4 max-w-[28ch] text-xs leading-relaxed text-foreground-muted">
            Supabase is the Postgres development platform. The tee is optional but encouraged.
          </p>
        </motion.div>

        {LINK_GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3 className="text-label mb-4 text-foreground-muted">{group.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground-lighter transition-colors hover:text-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="archive-container overflow-hidden">
        <motion.p
          aria-hidden
          initial={{ y: '40%', opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-32px' }}
          transition={REVEAL.spring}
          className="select-none text-center font-heading text-[clamp(3rem,12.5vw,13rem)] font-bold uppercase leading-[0.85] tracking-[-0.05em] text-foreground/90"
        >
          Supabase
        </motion.p>
      </div>

      <div className="archive-container flex flex-col items-center justify-between gap-2 border-t border-border py-5 sm:flex-row">
        <p className="text-label text-foreground-muted">© {new Date().getFullYear()} Supabase</p>
        <p className="text-label text-foreground-muted">light mode tees remain sold out</p>
      </div>
    </footer>
  )
}
