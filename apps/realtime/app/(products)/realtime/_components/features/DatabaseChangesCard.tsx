'use client'

/* ─────────────────────────────────────────────────────────
 * DATABASE CHANGES STORYBOARD
 *
 *  intro   the scripted conversation loops forever
 *          (4.5s apart) — pauses while the input is focused
 *   type   each keypress reveals the flow's next line for
 *          your side; if the other side was due to speak,
 *          their line posts first so you're replying to it
 *   send   Enter works once the line is fully typed, the
 *          input blurs, and the loop resumes with the answer
 *    0ms   insert chip swaps to the new row (brand flash)
 *  200ms   message lands in the chat UI (ring flash)
 * ───────────────────────────────────────────────────────── */

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SendHorizonal } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from 'ui'

const TIMING = {
  ambientInterval: 4500, // ms between flow messages — matches the Broadcast card's auto-fire cadence
  tableToChat: 200, // ms from table row to chat bubble
  flashClear: 600, // ms the green flash stays
}

const MAX_MESSAGES = 20

type ChatMsg = { id: number; user: string; text: string }

const INITIAL_MESSAGES: ChatMsg[] = [
  { id: 1, user: 'Alice', text: 'Hey, is the deploy ready?' },
  { id: 2, user: 'Bob', text: 'Almost — running final tests now.' },
  { id: 3, user: 'Alice', text: 'Nice, let me know when it\u2019s live.' },
]

/** One conversation, looped forever. Typing picks up wherever the flow is. */
const CONVERSATION: Omit<ChatMsg, 'id'>[] = [
  { user: 'Bob', text: 'All green. Deploying now.' },
  { user: 'Alice', text: 'Awesome, checking it out.' },
  { user: 'Bob', text: 'Latency dropped to 42ms!' },
  { user: 'Alice', text: 'Presence is live too — I can see your cursor.' },
  { user: 'Bob', text: 'Every one of these messages is a Postgres insert.' },
  { user: 'Alice', text: 'No polling, no queues. It just shows up.' },
  { user: 'Bob', text: 'RLS still applies — private channels for free.' },
  { user: 'Alice', text: 'Broadcast next? Live cursors on the dashboard.' },
  { user: 'Bob', text: 'Already on it. supabase db push and we ship.' },
  { user: 'Alice', text: 'Build in a weekend, ship on a Friday.' },
]

export function DatabaseChangesCard() {
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES)
  const [tableFlashId, setTableFlashId] = useState<number | null>(null)
  const [chatFlashId, setChatFlashId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const tableBoxRef = useRef<HTMLDivElement>(null)
  const chatBoxRef = useRef<HTMLDivElement>(null)
  const [connector, setConnector] = useState<{ x: number; top: number; height: number } | null>(
    null
  )
  const [isInView, setIsInView] = useState(false)
  const flowIdx = useRef(0)
  const typedCharIdx = useRef(0)
  const [typedMessage, setTypedMessage] = useState<string | null>(null)
  const isPausedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextId = useRef(100)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const reducedMotion = useReducedMotion() ?? false

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      threshold: 0.3,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // The dashed connector spans the measured gap between the table and the
  // chat, centered on their visible horizontal overlap at any card width
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const measure = () => {
      const table = tableBoxRef.current
      const chat = chatBoxRef.current
      if (!table || !chat) return
      const c = container.getBoundingClientRect()
      const t = table.getBoundingClientRect()
      const ch = chat.getBoundingClientRect()
      const left = Math.max(t.left, ch.left, c.left)
      const right = Math.min(t.right, ch.right, c.right)
      setConnector({
        x: (left + right) / 2 - c.left,
        top: t.bottom - c.top,
        height: Math.max(0, ch.top - t.bottom),
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  const insertMessage = (msg: Omit<ChatMsg, 'id'>) => {
    const newMsg = { ...msg, id: ++nextId.current }
    setMessages((prev) => [...prev.slice(-(MAX_MESSAGES - 1)), newMsg])
    setTableFlashId(newMsg.id)
    timers.current.push(
      setTimeout(() => {
        setChatFlashId(newMsg.id)
        timers.current.push(
          setTimeout(() => {
            setTableFlashId(null)
            setChatFlashId(null)
          }, TIMING.flashClear)
        )
      }, TIMING.tableToChat)
    )
  }

  // Follow new chat messages after they've committed to the DOM. The chat is
  // column-reverse so it stays pinned to the bottom natively; this only pulls
  // the view back down when a message arrives while scrolled up in history.
  // While the input is focused the user may browse freely, so leave them be.
  useEffect(() => {
    const chat = chatScrollRef.current
    if (!chat) return
    if (!isPausedRef.current || Math.abs(chat.scrollTop) < 80) {
      chat.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [messages])

  // column-reverse pins instantly, so a new bubble makes history jump up.
  // Compensate: start the feed displaced down by the new bubble's height and
  // slide it to rest — one smooth GPU transform, bubbles themselves stay still.
  const chatListRef = useRef<HTMLDivElement>(null)
  const prevListHeight = useRef(0)
  useLayoutEffect(() => {
    const list = chatListRef.current
    if (!list) return
    const height = list.offsetHeight
    const delta = height - prevListHeight.current
    const first = prevListHeight.current === 0
    prevListHeight.current = height
    if (first || delta <= 0 || reducedMotion) return
    const chat = chatScrollRef.current
    // Reading history further up — don't shift what they're looking at
    if (chat && Math.abs(chat.scrollTop) > 8) return
    list.animate(
      [{ transform: `translateY(${delta}px)` }, { transform: 'translateY(0)' }],
      { duration: 250, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
    )
  }, [messages, reducedMotion])

  const nextFlowMessage = () => {
    const msg = CONVERSATION[flowIdx.current % CONVERSATION.length]
    flowIdx.current++
    return msg
  }

  // The conversation loops forever — paused while the input is focused
  useEffect(() => {
    if (!isInView || isPaused) return
    const interval = setInterval(() => {
      insertMessage(nextFlowMessage())
    }, TIMING.ambientInterval)
    return () => clearInterval(interval)
  }, [isInView, isPaused])

  // Keep the caret (and the input's view) at the end of the revealed text
  // so long lines stay readable without growing the box
  useEffect(() => {
    const el = inputRef.current
    if (!el || document.activeElement !== el) return
    el.setSelectionRange(el.value.length, el.value.length)
    el.scrollLeft = el.scrollWidth
  }, [draft])

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
      return
    }

    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return

    e.preventDefault()

    // Starting a line: if the other side was due to speak, let their
    // message post first — you never type right after your own side
    if (typedCharIdx.current === 0) {
      while (CONVERSATION[flowIdx.current % CONVERSATION.length].user !== 'Alice') {
        insertMessage(nextFlowMessage())
      }
      setTypedMessage(CONVERSATION[flowIdx.current % CONVERSATION.length].text)
    }

    const message = typedMessage ?? CONVERSATION[flowIdx.current % CONVERSATION.length].text
    if (typedCharIdx.current >= message.length) return

    typedCharIdx.current++
    setDraft(message.slice(0, typedCharIdx.current))
  }

  const canSend = typedMessage !== null && draft === typedMessage

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!canSend) return
    const text = typedMessage
    setDraft('')
    typedCharIdx.current = 0
    setTypedMessage(null)
    flowIdx.current++ // you sent this flow message yourself
    insertMessage({ user: 'You', text })
    // Blur hands control back to the loop, which delivers the reply
    inputRef.current?.blur()
  }

  return (
    <div
      ref={containerRef}
      // pt-5 lines the chip up with the Broadcast card's "Send event" button;
      // the chat then stretches to the bottom padding so it fills the card
      className="relative flex h-full w-full flex-col items-center gap-5 px-6 pb-5 pt-5"
    >
      {/* Latest insert — one minimal chip instead of the full Postgres table */}
      <div ref={tableBoxRef} className="relative z-[2] w-full max-w-[320px]">
          <AnimatePresence initial={false} mode="popLayout">
            {messages.slice(-1).map((msg) => (
              <motion.div
                key={msg.id}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                transition={{ type: 'spring', duration: 0.45, bounce: 0 }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl border bg-surface-100 px-3 py-2 shadow-xs transition-colors duration-500 dark:shadow-sm',
                  tableFlashId === msg.id ? 'border-brand/50' : 'border-border'
                )}
              >
                <span className="shrink-0 font-mono text-[10px] font-medium text-brand">
                  INSERT
                </span>
                <span className="shrink-0 font-mono text-[10px] text-foreground-muted">
                  {msg.user.toLowerCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-foreground">{msg.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
      </div>

      {/* Connecting dashed lines — measured so they touch both boxes */}
      {connector && connector.height > 6 && (
        <div
          className="absolute z-[1] flex -translate-x-1/2 gap-2 text-background-surface-300"
          style={{ left: connector.x, top: connector.top }}
        >
          {[0, 0.5].map((delay) => (
            <svg
              key={delay}
              width="2"
              height={connector.height}
              fill="none"
              className="overflow-visible"
            >
              <line
                x1="1"
                y1="0"
                x2="1"
                y2={connector.height}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                style={{
                  animation: reducedMotion ? 'none' : `rlDashFlow 1s linear infinite ${delay}s`,
                }}
              />
            </svg>
          ))}
          <style>{`@keyframes rlDashFlow { to { stroke-dashoffset: -8; } }`}</style>
        </div>
      )}

      {/* Chat UI with input — same width as the chip above it */}
        <div
          ref={chatBoxRef}
          className="relative z-[2] flex min-h-0 w-full max-w-[320px] flex-1 flex-col overflow-hidden rounded-lg border border-border bg-surface-200"
        >
          <div
            ref={chatScrollRef}
            className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%)',
            }}
          >
            {/* column-reverse on the scroller pins to the newest message; the
                inner list is what slides when a new bubble lands */}
            <div ref={chatListRef} className="flex flex-col pb-3 pt-1">
              {messages.map((msg) => {
                const isMine = msg.user === 'You' || msg.user === 'Alice'
                const bubbleClassName = cn(
                  // rl-bubble-in is a mount-only CSS fade: bubbles never change
                  // element type afterwards, so nothing remounts or re-animates
                  // when the next message arrives
                  'rl-bubble-in max-w-[75%] rounded-xl px-3 py-1.5 text-xs leading-snug transition-colors duration-500',
                  isMine
                    ? 'rounded-br-sm bg-brand/15 text-foreground'
                    : 'rounded-bl-sm bg-surface-300 text-foreground',
                  chatFlashId === msg.id && 'ring-1 ring-brand/30'
                )

                return (
                  <div key={msg.id} className="w-full shrink-0">
                    <div className={cn('flex pt-2', isMine ? 'justify-end' : 'justify-start')}>
                      <div className={bubbleClassName}>{msg.text}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <style>{`
            @keyframes rlBubbleIn { from { opacity: 0; } }
            .rl-bubble-in { animation: rlBubbleIn 200ms cubic-bezier(0.23, 1, 0.32, 1) both; }
          `}</style>
          <form
            onSubmit={handleSend}
            // Clicks anywhere in the form (incl. the disabled send button)
            // must not blur the input, or the half-typed draft gets wiped
            onMouseDown={(e) => {
              if (e.target !== inputRef.current) e.preventDefault()
            }}
            className="flex items-center gap-2 border-t border-border px-3 py-2"
          >
            <input
              ref={inputRef}
              value={draft}
              // Content comes from onKeyDown revealing the script; the no-op
              // keeps React's controlled-input contract satisfied
              onChange={() => {}}
              onFocus={() => {
                isPausedRef.current = true
                setIsPaused(true)
              }}
              onBlur={() => {
                // A half-typed draft belongs to a flow message the loop will
                // now play itself, so drop it rather than desync the script
                setDraft('')
                typedCharIdx.current = 0
                setTypedMessage(null)
                isPausedRef.current = false
                setIsPaused(false)
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Send a message — watch it insert"
              aria-label="Send a message"
              maxLength={60}
              className="min-w-0 flex-1 bg-transparent text-xs text-foreground placeholder:text-foreground-muted focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send message"
              tabIndex={canSend ? 0 : -1}
              className="text-foreground-muted transition-colors enabled:hover:text-brand disabled:pointer-events-none disabled:opacity-30"
              disabled={!canSend}
            >
              <SendHorizonal size={14} />
            </button>
          </form>
        </div>
    </div>
  )
}
