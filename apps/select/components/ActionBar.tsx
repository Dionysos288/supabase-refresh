'use client'

import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, DownloadIcon, LinkIcon, PrinterIcon, ShareIcon } from './icons'

const SHARE_TEXT =
  "I'm going to Supabase Select 2026 — a curated day of talks. Oct 2, San Francisco."

type ActionBarProps = {
  onReprint: () => void
  /** true while the reprint animation is running */
  reprinting: boolean
  captureRef: React.RefObject<HTMLDivElement | null>
  ticketNumber: string
}

const iconButton =
  'flex h-10 w-10 items-center justify-center rounded-md border border-paper/15 bg-paper/[0.06] text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-paper/15 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bolt/50'

export const ActionBar = ({ onReprint, reprinting, captureRef, ticketNumber }: ActionBarProps) => {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!captureRef.current || downloading) return
    setDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 3,
        backgroundColor: 'transparent',
      })
      const link = document.createElement('a')
      link.download = `supabase-select-2026-ticket-${ticketNumber.replace('#', '')}.png`
      link.href = dataUrl
      link.click()
    } catch {
      /* capture can fail on unsupported browsers — leave the ticket on screen */
    } finally {
      setDownloading(false)
    }
  }, [captureRef, downloading, ticketNumber])

  const handleShare = useCallback(async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Supabase Select 2026', text: SHARE_TEXT, url })
        return
      } catch {
        /* user dismissed — fall through to intent */
      }
    }
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(url)}`
    window.open(intent, '_blank', 'noopener,noreferrer')
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable (permissions / insecure context) — no state change */
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
      className="flex items-center gap-2"
    >
      <button
        type="button"
        onClick={onReprint}
        aria-disabled={reprinting}
        aria-busy={reprinting}
        className="flex h-10 items-center gap-2 rounded-md border border-brand-bolt/20 bg-pine px-4 text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-pine-deep active:scale-[0.97] aria-disabled:cursor-default aria-disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bolt/50"
      >
        <PrinterIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Reprint ticket</span>
      </button>
      <button
        type="button"
        onClick={handleDownload}
        title="Download ticket as PNG"
        aria-label="Download ticket as PNG"
        className={`${iconButton} ${downloading ? 'animate-pulse' : ''}`}
      >
        <DownloadIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={handleShare}
        title="Share your ticket"
        aria-label="Share your ticket"
        className={iconButton}
      >
        <ShareIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={handleCopy}
        title="Copy link"
        aria-label={copied ? 'Link copied' : 'Copy link'}
        aria-live="polite"
        className={iconButton}
      >
        {copied ? <CheckIcon className="h-4 w-4 text-pine" /> : <LinkIcon className="h-4 w-4" />}
      </button>
    </motion.div>
  )
}
