"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ImageIcon, Paperclip, Send, Users, Save } from "lucide-react"
import { useTelePuls } from "@/contexts/telepuls-context"
import type { Conversation, MediaAttachment } from "@/lib/telepuls-types"
import { readFileAsAttachment } from "@/lib/telepuls-share"
import { Avatar } from "./avatar"
import { MessageBubble } from "./message-bubble"
import { MediaViewer } from "./media-viewer"
import { SaveContactModal } from "./save-contact-modal"

interface ConversationScreenProps {
  conversation: Conversation
  onBack: () => void
}

export function ConversationScreen({ conversation, onBack }: ConversationScreenProps) {
  const { data, sendMessage } = useTelePuls()
  const [text, setText] = useState("")
  const [pending, setPending] = useState<MediaAttachment | null>(null)
  const [viewer, setViewer] = useState<MediaAttachment | null>(null)
  const [showSaveContact, setShowSaveContact] = useState(false)
  const imageInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Get messages from data to ensure reactivity
  const messages = data.messages
    .filter((m) => m.conversationId === conversation.id)
    .sort((a, b) => a.createdAt - b.createdAt)

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 0)
  }, [messages.length, pending])

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const att = await readFileAsAttachment(files[0])
    setPending(att)
  }

  const handleSend = () => {
    if (!text.trim() && !pending) return
    console.log("[v0] Sending message:", { text, pending })
    sendMessage(conversation.id, text.trim(), pending)
    setText("")
    setPending(null)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={conversation.name} color={conversation.avatarColor} size={40} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold leading-tight">{conversation.name}</h2>
          {conversation.kind === "group" ? (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {conversation.participants.length} participants
            </p>
          ) : (
            <>
              <p className="text-xs text-primary">online</p>
              {conversation.phoneNumbers && conversation.phoneNumbers[0] && (
                <p className="text-xs text-muted-foreground">{conversation.phoneNumbers[0]}</p>
              )}
            </>
          )}
        </div>
        {conversation.kind === "direct" && conversation.phoneNumbers && (
          <button
            type="button"
            onClick={() => setShowSaveContact(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Save contact"
            aria-label="Save contact"
          >
            <Save className="h-5 w-5" />
          </button>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
        {messages.length === 0 && !pending && (
          <div className="m-auto max-w-xs text-center text-sm text-muted-foreground">
            No messages yet. Say hello, share a photo, video, or file to get started.
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            message={m}
            showSender={conversation.kind === "group" && messages[i - 1]?.senderId !== m.senderId}
            onOpenMedia={setViewer}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {pending && (
        <div className="flex items-center gap-3 border-t border-border bg-secondary/60 px-3 py-2">
          {pending.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pending.url || "/placeholder.svg"} alt="" className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-card">
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <p className="min-w-0 flex-1 truncate text-sm">{pending.name}</p>
          <button
            type="button"
            onClick={() => setPending(null)}
            className="text-sm font-medium text-destructive"
          >
            Remove
          </button>
        </div>
      )}

      <footer className="flex items-end gap-2 border-t border-border bg-card px-2.5 py-2.5">
        <input
          ref={imageInput}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => imageInput.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
          aria-label="Attach photo or video"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>
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
          placeholder="Message"
          className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2 text-[15px] outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() && !pending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-5 w-5" />
        </button>
      </footer>

      {viewer && <MediaViewer media={viewer} onClose={() => setViewer(null)} />}
      {showSaveContact && (
        <SaveContactModal
          conversation={conversation}
          onClose={() => setShowSaveContact(false)}
        />
      )}
    </div>
  )
}
