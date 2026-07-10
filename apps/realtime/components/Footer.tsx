'use client'

import { CheckIcon } from '@heroicons/react/outline'
import SupabaseWordmark from '@/components/Nav/SupabaseWordmark'
import footerData from '@/data/Footer'
import Link from 'next/link'
import {
  cn,
  IconDiscord,
  IconGitHubSolid,
  IconInstagram,
  IconTikTok,
  IconTwitterX,
  IconYoutubeSolid,
} from 'ui'
import { ThemeToggle } from '@/components/ThemeToggle'

import SectionContainer from '@/components/Layouts/SectionContainer'

interface Props {
  className?: string
  hideFooter?: boolean
}

const Footer = (props: Props) => {
  if (props.hideFooter) {
    return null
  }

  return (
    <footer className={cn('bg-alternative', props.className)}>
      <h2 id="footerHeading" className="sr-only">
        Footer
      </h2>
      <div className="w-full py-0!">
        <SectionContainer className="grid grid-cols-2 md:flex items-center justify-between text-foreground md:justify-center gap-8 md:gap-16 xl:gap-28 py-6! md:py-10! text-sm">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            We protect your data.
            <Link href="/security" className="text-brand-link hover:underline">
              More on Security
            </Link>
          </div>
          <ul className="flex flex-col md:flex-row gap-2 md:gap-8 justify-center md:items-center">
            <li className="flex items-center gap-2 whitespace-nowrap flex-nowrap">
              <CheckIcon className="w-4 h-4" /> SOC2 Type 2{' '}
              <span className="text-foreground-lighter hidden sm:inline">Certified</span>
            </li>
            <li className="flex items-center gap-2 whitespace-nowrap flex-nowrap">
              <CheckIcon className="w-4 h-4" /> HIPAA{' '}
              <span className="text-foreground-lighter hidden sm:inline">Compliant</span>
            </li>
            <li className="flex items-center gap-2 whitespace-nowrap flex-nowrap">
              <CheckIcon className="w-4 h-4" /> ISO 27001{' '}
              <span className="text-foreground-lighter hidden sm:inline">Certified</span>
            </li>
          </ul>
        </SectionContainer>
        <div className="w-full h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </div>
      <SectionContainer className="py-8">
        <div className="xl:grid xl:grid-cols-7 xl:gap-4">
          <div className="xl:col-span-2 flex flex-col gap-8">
            <Link href="#" as="/" className="w-40">
              <SupabaseWordmark className="w-40 h-[30px]" />
            </Link>
            <div className="flex space-x-5">
              <a
                href="https://twitter.com/supabase"
                className="text-foreground-lighter hover:text-foreground transition"
              >
                <span className="sr-only">Twitter</span>
                <IconTwitterX size={22} />
              </a>

              <a
                href="https://github.com/supabase"
                className="text-foreground-lighter hover:text-foreground transition"
              >
                <span className="sr-only">GitHub</span>
                <IconGitHubSolid size={22} />
              </a>

              <a
                href="https://discord.supabase.com/"
                className="text-foreground-lighter hover:text-foreground transition"
              >
                <span className="sr-only">Discord</span>
                <IconDiscord size={22} />
              </a>

              <a
                href="https://youtube.com/c/supabase"
                className="text-foreground-lighter hover:text-foreground transition"
              >
                <span className="sr-only">Youtube</span>
                <IconYoutubeSolid size={22} />
              </a>

              <a
                href="https://www.tiktok.com/@supabase.com"
                className="text-foreground-lighter hover:text-foreground transition"
              >
                <span className="sr-only">TikTok</span>
                <IconTikTok size={22} />
              </a>

              <a
                href="https://www.instagram.com/supabasecom"
                className="text-foreground-lighter hover:text-foreground transition"
              >
                <span className="sr-only">Instagram</span>
                <IconInstagram size={22} />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 xl:col-span-5 xl:mt-0">
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 xl:grid-cols-6">
              {footerData.map((segment) => {
                return (
                  <div key={`footer_${segment.title}`}>
                    <h6 className="text-foreground overwrite text-base">{segment.title}</h6>
                    <ul className="mt-4 space-y-2">
                      {segment.links.map((link, idx) => {
                        const children = (
                          <div className="text-sm transition-colors text-foreground-lighter hover:text-foreground">
                            {link.text}
                          </div>
                        )

                        return (
                          <li key={`${segment.title}_link_${idx}`}>
                            {link.url.startsWith('https') ? (
                              <a href={link.url}>{children}</a>
                            ) : (
                              <Link href={link.url}>{children}</Link>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="border-default mt-32 flex justify-between border-t pt-8">
          <small className="small">&copy; Supabase Inc</small>
          <ThemeToggle />
        </div>
      </SectionContainer>
    </footer>
  )
}

export default Footer
