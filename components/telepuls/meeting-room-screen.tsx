"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Check, Copy, Phone, Send, Share2, Users, Video } from "lucide-react"
import { useTelePuls } from "@/contexts/telepuls-context"
import type { MeetingRoom } from "@/lib/telepuls-types"
import { formatTime } from "@/lib/telepuls-types"
import { inviteLink, nativeShare } from "@/lib/telepuls-share"
import { Avatar } from "./avatar"

interface MeetingRoomScreenProps {
  room: MeetingRoom
  onBack: () => void
}

export function MeetingRoomScreen({ room, onBack }: MeetingRoomScreenProps) {
  const { getRoomMessages, sendRoomMessage } = useTelePuls()
  const [text, setText] = useState("")
  const [copied, setCopied] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const messages = getRoomMessages(room.id)
  const link = inviteLink(room.code)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const handleShare = () => {
    nativeShare({
      title: `Join my TelePuls meeting: ${room.name}`,
      text: `Join my meeting "${room.name}" on TelePuls. Invite code: ${room.code}`,
      url: link,
    })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const handleSend = () => {
    if (!text.trim()) return
    sendRoomMessage(room.id, text.trim())
    setText("")
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-secondary"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold leading-tight">{room.name}</h2>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {room.participants.length} in room
          </p>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary"
          aria-label="Audio call"
        >
          <Phone className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-label="Video call"
        >
          <Video className="h-4 w-4" />
        </button>
      </header>

      {/* invite + participants */}
      <div className="border-b border-border bg-accent/40 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {room.participants.map((p) => (
            <span
              key={p}
              className="flex items-center gap-1.5 rounded-full bg-card py-1 pl-1 pr-2.5 text-xs font-medium shadow-sm"
            >
              <Avatar name={p} color="oklch(0.62 0.16 200)" size={20} />
              {p}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
              Invite code
            </span>
            <span className="block truncate font-mono text-sm font-semibold">{room.code}</span>
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
            aria-label="Copy invite link"
          >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
        {messages.length === 0 && (
          <div className="m-auto max-w-xs text-center text-sm text-muted-foreground">
            This is the room chat. Discuss with everyone who joins via the invite link.
          </div>
        )}
        {messages.map((m) => {
          const own = m.senderId === "me"
          return (
            <div key={m.id} className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
              {!own && (
                <span className="mb-0.5 ml-1 text-xs font-medium text-muted-foreground">
                  {m.senderName}
                </span>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[15px] shadow-sm ${
                  own
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md border border-border bg-card"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <span className={`mt-0.5 block text-right text-[10px] ${own ? "text-white/70" : "text-muted-foreground"}`}>
                  {formatTime(m.createdAt)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <footer className="flex items-end gap-2 border-t border-border bg-card px-2.5 py-2.5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          rows={1}
          placeholder="Message the room"
          className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2 text-[15px] outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      </footer>
    </div>
  )
}
