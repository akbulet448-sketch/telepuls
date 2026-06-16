"use client"

import { FileText, Play, Share2 } from "lucide-react"
import type { MediaAttachment, Message } from "@/lib/telepuls-types"
import { formatBytes, formatTime } from "@/lib/telepuls-types"
import { shareMedia } from "@/lib/telepuls-share"

interface MessageBubbleProps {
  message: Message
  showSender: boolean
  onOpenMedia: (media: MediaAttachment) => void
}

export function MessageBubble({ message, showSender, onOpenMedia }: MessageBubbleProps) {
  const own = message.senderId === "me"
  const media = message.media

  return (
    <div className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
      {showSender && !own && (
        <span className="mb-1 ml-1 text-xs font-medium text-muted-foreground">
          {message.senderName}
        </span>
      )}
      <div
        className={`max-w-[78%] overflow-hidden rounded-2xl shadow-sm ${
          own
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-card text-card-foreground"
        }`}
      >
        {media && (
          <div className="relative">
            {media.kind === "image" && (
              <button
                type="button"
                onClick={() => onOpenMedia(media)}
                className="block w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.url || "/placeholder.svg"}
                  alt={media.name}
                  className="max-h-64 w-full object-cover"
                />
              </button>
            )}
            {media.kind === "video" && (
              <button
                type="button"
                onClick={() => onOpenMedia(media)}
                className="relative block w-full"
              >
                <video src={media.url} className="max-h-64 w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55">
                    <Play className="h-6 w-6 fill-white text-white" />
                  </span>
                </span>
              </button>
            )}
            {media.kind === "file" && (
              <button
                type="button"
                onClick={() => onOpenMedia(media)}
                className={`flex w-60 items-center gap-3 p-3 text-left ${
                  own ? "" : ""
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    own ? "bg-white/20" : "bg-secondary"
                  }`}
                >
                  <FileText className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{media.name}</span>
                  <span className={`block text-xs ${own ? "text-white/70" : "text-muted-foreground"}`}>
                    {formatBytes(media.size)}
                  </span>
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => shareMedia(media)}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-opacity hover:bg-black/65"
              aria-label="Share media"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        )}
        {message.text && (
          <p className="whitespace-pre-wrap break-words px-3.5 py-2 text-[15px] leading-relaxed">
            {message.text}
          </p>
        )}
        <span
          className={`block px-3.5 pb-1.5 text-right text-[10px] ${
            own ? "text-white/70" : "text-muted-foreground"
          } ${message.text ? "" : "pt-1"}`}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  )
}
