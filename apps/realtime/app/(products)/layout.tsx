'use client'

import { PRODUCT_NAMES } from '@/data/products'

import ProductsNav from '../../components/Products/ProductsNav'
import DefaultLayout from '@/components/Layouts/Default'

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout>
      <ProductsNav activePage={PRODUCT_NAMES.REALTIME} />
      {children}
    </DefaultLayout>
  )
}
