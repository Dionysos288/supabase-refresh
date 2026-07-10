'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import type { Product } from '@/data/products'

type CartState = {
  count: number
  total: number
  add: (product: Product) => void
}

const CartContext = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([])

  const add = useCallback((product: Product) => {
    setItems((prev) => [...prev, product])
  }, [])

  const value = useMemo<CartState>(
    () => ({
      count: items.length,
      total: items.reduce((sum, item) => sum + item.price, 0),
      add,
    }),
    [items, add]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

/**
 * "inserted ✓" feedback flag for add-to-cart buttons: `flash()` sets it,
 * it resets itself after `ms`. The timer is cleared on unmount.
 */
export function useAddedFlash(ms = 1600) {
  const [added, setAdded] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const flash = useCallback(() => {
    setAdded(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(false), ms)
  }, [ms])

  return [added, flash] as const
}
