import { cn } from 'ui'

import Footer from '@/components/Footer'
import Nav from '@/components/Nav/Nav'

type Props = {
  hideHeader?: boolean
  hideFooter?: boolean
  stickyNavbar?: boolean
  className?: string
  footerClassName?: string
  children: React.ReactNode
}

const DefaultLayout = (props: Props) => {
  const {
    hideHeader = false,
    hideFooter = false,
    stickyNavbar = true,
    className = '',
    footerClassName = '',
    children,
  } = props

  return (
    <>
      <Nav hideNavbar={hideHeader} stickyNavbar={stickyNavbar} />
      <main className={cn('relative min-h-screen', className)}>{children}</main>
      <Footer className={footerClassName} hideFooter={hideFooter} />
    </>
  )
}

export default DefaultLayout
