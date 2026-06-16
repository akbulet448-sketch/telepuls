export type MediaKind = "image" | "video" | "file"

export interface MediaAttachment {
  id: string
  kind: MediaKind
  url: string // data URL
  name: string
  size: number // bytes
  mimeType: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  text: string
  media: MediaAttachment | null
  createdAt: number
}

export type ConversationKind = "direct" | "group"

export interface Conversation {
  id: string
  kind: ConversationKind
  name: string
  avatarColor: string
  participants: string[] // display names
  phoneNumbers?: string[] // contact numbers for direct chats
  participantPhotos?: { [name: string]: string } // profile photos of participants
  createdAt: number
}

export interface MeetingRoom {
  id: string
  name: string
  code: string // invite code
  participants: string[]
  createdAt: number
}

export interface RoomMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  text: string
  createdAt: number
}

export interface Contact {
  id: string
  name: string
  phoneNumber: string
  email?: string
  photo?: string
  notes?: string
  createdAt: number
}

export interface Profile {
  id: string
  name: string
  phoneNumber?: string // user's phone number for SMS notifications
  email?: string // user's email address
  avatarColor: string
  status: string
  profilePhoto?: string // base64 encoded photo or data URL
}

export interface TelePulsData {
  profile: Profile
  conversations: Conversation[]
  messages: Message[]
  rooms: MeetingRoom[]
  roomMessages: RoomMessage[]
  contacts: Contact[]
}

export const AVATAR_COLORS = [
  "oklch(0.62 0.16 200)",
  "oklch(0.65 0.18 30)",
  "oklch(0.6 0.17 145)",
  "oklch(0.64 0.17 300)",
  "oklch(0.7 0.16 70)",
  "oklch(0.6 0.16 260)",
]

export function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString([], { month: "short", day: "numeric" })
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function genId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

export function genCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}
