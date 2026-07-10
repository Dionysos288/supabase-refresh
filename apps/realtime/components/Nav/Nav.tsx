'use client'

import { getMenu } from '@/data/nav'
import Link from 'next/link'
import React, { useState } from 'react'
import { useWindowSize } from 'react-use'
import { Button, buttonVariants, cn } from 'ui'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from 'ui/src/components/shadcn/ui/navigation-menu'

import GitHubButton from './GitHubButton'
import HamburgerButton from './HamburgerMenu'
import MenuItem from './MenuItem'
import { MobileMenu } from './MobileMenu'
import RightClickBrandLogo from './RightClickBrandLogo'

interface Props {
  hideNavbar: boolean
  stickyNavbar?: boolean
}

const Nav = ({ hideNavbar, stickyNavbar = true }: Props) => {
  const { width } = useWindowSize()
  const [open, setOpen] = useState(false)
  const menu = getMenu()

  // Lock page scroll behind the mobile menu overlay
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto'
  }, [open])

  // The menu only exists below lg — close it if the viewport crosses over
  React.useEffect(() => {
    if (width >= 1024) setOpen(false)
  }, [width])

  if (hideNavbar) {
    return null
  }

  return (
    <>
      <div
        className={cn('sticky top-0 z-40 transform', !stickyNavbar && 'relative')}
        style={{ transform: 'translate3d(0,0,999px)' }}
      >
        <div className="absolute inset-0 h-full w-full bg-background/90 dark:bg-background/95" />
        <nav className="relative z-40 border-default border-b backdrop-blur-xs">
          <div className="section-container relative flex justify-between h-16">
            <div className="flex items-center flex-1 sm:items-stretch justify-between">
              <div className="flex items-center">
                <div className="flex items-center shrink-0">
                  <RightClickBrandLogo />
                </div>
                <NavigationMenu
                  delayDuration={0}
                  className="hidden pl-8 sm:space-x-4 lg:flex h-16"
                  viewportClassName="rounded-xl bg-background"
                >
                  <NavigationMenuList>
                    {menu.primaryNav.map((menuItem) =>
                      menuItem.hasDropdown ? (
                        <NavigationMenuItem className="text-sm font-medium" key={menuItem.title}>
                          <NavigationMenuTrigger
                            className={cn(
                              buttonVariants({ variant: 'text', size: 'small' }),
                              'bg-transparent! hover:text-brand-link data-open:text-brand-link! data-radix-collection-item:focus-visible:ring-2 data-radix-collection-item:focus-visible:ring-foreground-lighter data-radix-collection-item:focus-visible:text-foreground px-2 h-auto'
                            )}
                          >
                            {menuItem.title}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>{menuItem.dropdown}</NavigationMenuContent>
                        </NavigationMenuItem>
                      ) : (
                        <NavigationMenuItem className="text-sm font-medium" key={menuItem.title}>
                          <NavigationMenuLink asChild>
                            <MenuItem
                              href={menuItem.url}
                              title={menuItem.title}
                              className="group-hover:bg-transparent text-foreground focus-visible:text-brand-link"
                              hoverColor="brand"
                            />
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      )
                    )}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
              <div className="flex items-center gap-2 opacity-0 animate-fade-in scale-100! delay-300">
                <GitHubButton />
                <Button variant="default" className="hidden lg:block" asChild>
                  <Link href="https://supabase.com/dashboard">Sign in</Link>
                </Button>
                <Button className="hidden lg:block" asChild>
                  <Link href="https://supabase.com/dashboard/sign-up">Start your project</Link>
                </Button>
              </div>
            </div>
            <HamburgerButton toggleFlyOut={() => setOpen(true)} expanded={open} />
          </div>
          <MobileMenu open={open} setOpen={setOpen} menu={menu} />
        </nav>
      </div>
    </>
  )
}

export default Nav
