'use client'

import { LayoutGroup, MotionConfig } from 'framer-motion'

import { Catalog } from '@/components/Catalog/Catalog'
import { DropHero } from '@/components/Hero/DropHero'
import { PriceTicker } from '@/components/Hero/PriceTicker'
import { Lookbook } from '@/components/Lookbook'
import { GrowNav } from '@/components/Nav/GrowNav'
import { StoreFooter } from '@/components/StoreFooter'
import { SwagIsEarned } from '@/components/SwagIsEarned'
import { CartProvider } from '@/lib/cart'

export function StoreContent() {
  return (
    // reducedMotion="user" drops transform motion (rise) for
    // prefers-reduced-motion while keeping the opacity fades
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <CartProvider>
          <GrowNav />
          <main>
            <DropHero />
            <PriceTicker />
            <Lookbook />
            <Catalog />
            <SwagIsEarned />
          </main>
          <StoreFooter />
        </CartProvider>
      </LayoutGroup>
    </MotionConfig>
  )
}
