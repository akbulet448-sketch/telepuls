"use client"

import type { MediaAttachment } from "./telepuls-types"
import { genId } from "./telepuls-types"

export function fileKind(file: File): MediaAttachment["kind"] {
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  return "file"
}

export function readFileAsAttachment(file: File): Promise<MediaAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        id: genId(),
        kind: fileKind(file),
        url: reader.result as string,
        name: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
      })
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** Native share. Falls back to clipboard for text/links. Returns true if handled. */
export async function nativeShare(opts: {
  title?: string
  text?: string
  url?: string
}): Promise<{ ok: boolean; copied: boolean }> {
  const nav = typeof navigator !== "undefined" ? navigator : undefined
  if (nav && "share" in nav) {
    try {
      await (nav as Navigator).share({
        title: opts.title,
        text: opts.text,
        url: opts.url,
      })
      return { ok: true, copied: false }
    } catch {
      // user cancelled or share failed — fall through to copy
    }
  }
  const toCopy = [opts.text, opts.url].filter(Boolean).join("\n")
  if (toCopy && nav && "clipboard" in nav) {
    try {
      await (nav as Navigator).clipboard.writeText(toCopy)
      return { ok: true, copied: true }
    } catch {
      return { ok: false, copied: false }
    }
  }
  return { ok: false, copied: false }
}

/** Share a media attachment file natively if supported. */
export async function shareMedia(media: MediaAttachment): Promise<{ ok: boolean; copied: boolean }> {
  const nav = typeof navigator !== "undefined" ? navigator : undefined
  try {
    if (nav && "canShare" in nav) {
      const res = await fetch(media.url)
      const blob = await res.blob()
      const file = new File([blob], media.name, { type: media.mimeType })
      const shareData = { files: [file], title: media.name }
      // @ts-expect-error canShare with files
      if ((nav as Navigator).canShare(shareData)) {
        await (nav as Navigator).share(shareData)
        return { ok: true, copied: false }
      }
    }
  } catch {
    // fall through
  }
  return nativeShare({ title: media.name, text: `Shared via TelePuls: ${media.name}` })
}

export function downloadMedia(media: MediaAttachment): void {
  const a = document.createElement("a")
  a.href = media.url
  a.download = media.name
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function inviteLink(code: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://telepuls.app"
  return `${origin}/?join=${code}`
}
