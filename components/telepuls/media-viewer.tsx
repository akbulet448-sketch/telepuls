"use client"

import { Download, Share2, X } from "lucide-react"
import type { MediaAttachment } from "@/lib/telepuls-types"
import { formatBytes } from "@/lib/telepuls-types"
import { downloadMedia, shareMedia } from "@/lib/telepuls-share"

interface MediaViewerProps {
  media: MediaAttachment
  onClose: () => void
}

export function MediaViewer({ media, onClose }: MediaViewerProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing ${media.name}`}
    >
      <div className="flex items-center justify-between gap-2 p-4 text-white">
        <p className="truncate text-sm font-medium">{media.name}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shareMedia(media)}
            className="rounded-full p-2 transition-colors hover:bg-white/15"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => downloadMedia(media)}
            className="rounded-full p-2 transition-colors hover:bg-white/15"
            aria-label="Download"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-white/15"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
        {media.kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.url || "/placeholder.svg"}
            alt={media.name}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        )}
        {media.kind === "video" && (
          <video
            src={media.url}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-lg"
          />
        )}
        {media.kind === "file" && (
          <div className="flex flex-col items-center gap-4 text-center text-white">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10">
              <Download className="h-10 w-10" />
            </div>
            <div>
              <p className="font-medium">{media.name}</p>
              <p className="text-sm text-white/60">{formatBytes(media.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => downloadMedia(media)}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Download file
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
