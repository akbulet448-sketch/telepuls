"use client"

import { useState } from "react"
import { MessageCirclePlus, Search, UserRound, Users, X, MessageSquare } from "lucide-react"
import { useTelePuls } from "@/contexts/telepuls-context"
import type { Conversation } from "@/lib/telepuls-types"
import { formatTime } from "@/lib/telepuls-types"
import { Avatar } from "./avatar"

interface ChatListScreenProps {
  onOpenConversation: (c: Conversation) => void
  onOpenProfile: () => void
}

export function ChatListScreen({ onOpenConversation, onOpenProfile }: ChatListScreenProps) {
  const { data, profile, createConversation, getMessages } = useTelePuls()
  const [query, setQuery] = useState("")
  const [showNew, setShowNew] = useState(false)

  const filtered = data.conversations.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  )

  const lastPreview = (c: Conversation) => {
    const msgs = getMessages(c.id)
    const last = msgs[msgs.length - 1]
    if (!last) return { text: "No messages yet", ts: c.createdAt }
    const prefix = last.senderId === "me" ? "You: " : ""
    const body = last.media
      ? last.media.kind === "image"
        ? "Photo"
        : last.media.kind === "video"
          ? "Video"
          : last.media.name
      : last.text
    return { text: `${prefix}${body}`, ts: last.createdAt }
  }

  const sorted = [...filtered].sort(
    (a, b) => lastPreview(b).ts - lastPreview(a).ts,
  )

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="border-b border-border bg-card px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-primary">TelePuls</h1>
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Profile"
            className="rounded-full transition-transform active:scale-95"
          >
            <Avatar name={profile.name} color={profile.avatarColor} size={38} />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-secondary px-3.5 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <MessageCirclePlus className="h-8 w-8 text-primary" />
            </div>
            <p className="font-medium">No conversations yet</p>
            <p className="text-sm text-muted-foreground">
              Start a direct chat or create a group to begin messaging and sharing media.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {sorted.map((c) => {
              const preview = lastPreview(c)
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onOpenConversation(c)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50"
                  >
                    <Avatar name={c.name} color={c.avatarColor} size={50} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 truncate font-semibold">
                          {c.kind === "group" && (
                            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          )}
                          {c.kind === "direct" && c.phoneNumbers && (
                            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-blue-500" title="SMS conversation" />
                          )}
                          {c.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatTime(preview.ts)}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{preview.text}</p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowNew(true)}
        className="absolute bottom-20 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
        aria-label="New conversation"
      >
        <MessageCirclePlus className="h-6 w-6" />
      </button>

      {showNew && (
        <NewConversationDialog
          onClose={() => setShowNew(false)}
          onCreate={(kind, name, parts, phones) => {
            const c = createConversation(kind, name, parts, phones)
            setShowNew(false)
            onOpenConversation(c)
          }}
        />
      )}
    </div>
  )
}

function NewConversationDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (kind: "direct" | "group", name: string, participants: string[], phoneNumbers?: string[]) => void
}) {
  const [kind, setKind] = useState<"direct" | "group">("direct")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [members, setMembers] = useState("")

  const submit = () => {
    if (!name.trim()) return
    if (kind === "direct" && !phone.trim()) return
    const parts =
      kind === "group"
        ? members
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [name.trim()]
    const phones = kind === "direct" ? [phone.trim()] : undefined
    onCreate(kind, name.trim(), parts, phones)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-t-3xl bg-card p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New conversation</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1 hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex gap-2 rounded-full bg-secondary p-1">
          <button
            type="button"
            onClick={() => setKind("direct")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-colors ${
              kind === "direct" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            <UserRound className="h-4 w-4" /> Direct
          </button>
          <button
            type="button"
            onClick={() => setKind("group")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-colors ${
              kind === "group" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Users className="h-4 w-4" /> Group
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium">
          {kind === "direct" ? "Contact name" : "Group name"}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={kind === "direct" ? "e.g. Alex Morgan" : "e.g. Weekend Trip"}
          className="mb-4 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />

        {kind === "direct" && (
          <>
            <label className="mb-1 block text-sm font-medium">Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="e.g. +1 (555) 123-4567"
              className="mb-4 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </>
        )}

        {kind === "group" && (
          <>
            <label className="mb-1 block text-sm font-medium">Participants</label>
            <input
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="Comma separated names"
              className="mb-4 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!name.trim() || (kind === "direct" && !phone.trim())}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          Start chatting
        </button>
      </div>
    </div>
  )
}
