'use client'

/* ─────────────────────────────────────────────────────────
 * LOOKBOOK — CAMPAIGN 010
 *
 * Editorial 2-up between the opener and the archive: two
 * tall campaign shots, nearly full-bleed, with deadpan
 * mono captions. The frames drift at slightly different
 * scroll speeds so the spread feels printed, not templated.
 * ───────────────────────────────────────────────────────── */

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

import { REVEAL, sectionVariants, staggerContainer } from '@/lib/animations'

const FIGURES = [
  {
    src: '/images/store/lookbook-01.png',
    alt: 'Campaign figure one — contributor in gold tee',
    caption: 'fig. 01 — contributor. 4,102 commits. gold tee earned, not bought. 2024.',
  },
  {
    src: '/images/store/lookbook-02.png',
    alt: 'Campaign figure two — maintainer with SupaSwag box',
    caption: 'fig. 02 — maintainer. row-level security enthusiast. box arrived unannounced.',
  },
]

/* Counter-drift, px of travel across the section's scroll range */
const DRIFT = 36

export function Lookbook() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const driftUp = useTransform(scrollYProgress, [0, 1], [DRIFT, -DRIFT])
  const driftDown = useTransform(scrollYProgress, [0, 1], [-DRIFT, DRIFT])
  const drifts = [driftUp, driftDown]

  return (
    <section ref={ref} aria-label="Campaign lookbook" className="overflow-hidden py-16 lg:py-24">
      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="show"
        viewport={REVEAL.viewport}
        className="archive-container"
      >
        <motion.p variants={sectionVariants} className="text-label mb-8 text-foreground-lighter">
          campaign_010 / shot on contributors
        </motion.p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
          {FIGURES.map((figure, i) => (
            <motion.figure key={figure.src} variants={sectionVariants} className="flex flex-col gap-3">
              <div className="overflow-hidden bg-surface-75">
                <motion.div style={{ y: drifts[i] }} className="-my-10">
                  <Image
                    src={figure.src}
                    alt={figure.alt}
                    width={960}
                    height={1200}
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </motion.div>
              </div>
              <figcaption className="text-label text-foreground-lighter">
                {figure.caption}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
