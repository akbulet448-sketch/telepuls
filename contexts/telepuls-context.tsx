"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { loadData, saveData } from "@/lib/telepuls-storage"
import type {
  Conversation,
  ConversationKind,
  MediaAttachment,
  MeetingRoom,
  Message,
  Profile,
  RoomMessage,
  TelePulsData,
  Contact,
} from "@/lib/telepuls-types"
import { AVATAR_COLORS, genCode, genId } from "@/lib/telepuls-types"

// SMS Notification polling interval (ms)
const SMS_POLL_INTERVAL = 5000

interface TelePulsContextValue {
  data: TelePulsData
  profile: Profile
  updateProfile: (patch: Partial<Profile>) => void
  createConversation: (
    kind: ConversationKind,
    name: string,
    participants: string[],
    phoneNumbers?: string[],
  ) => Conversation
  deleteConversation: (id: string) => void
  getMessages: (conversationId: string) => Message[]
  sendMessage: (
    conversationId: string,
    text: string,
    media: MediaAttachment | null,
  ) => void
  createRoom: (name: string) => MeetingRoom
  joinRoom: (code: string) => MeetingRoom | null
  getRoomMessages: (roomId: string) => RoomMessage[]
  sendRoomMessage: (roomId: string, text: string) => void
  pollSMSNotifications: () => Promise<void>
  addContact: (contact: Contact) => void
  deleteContact: (id: string) => void
}

const TelePulsContext = createContext<TelePulsContextValue | undefined>(undefined)

export function TelePulsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TelePulsData>(() => loadData())
  const hydrated = useRef(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Poll for SMS notifications
  const pollSMSNotifications = async () => {
    const phoneNumber = data.profile.phoneNumber
    if (!phoneNumber) return

    try {
      const response = await fetch(`/api/notifications/sms?phone=${encodeURIComponent(phoneNumber)}`)
      const result = await response.json()

      if (result.notifications && result.notifications.length > 0) {
        // Create or find conversation for SMS sender
        for (const sms of result.notifications) {
          const senderPhone = sms.from
          const senderName = `Contact: ${senderPhone}`

          // Check if conversation exists
          let conversation = data.conversations.find(
            (c) => c.kind === "direct" && c.phoneNumbers?.includes(senderPhone)
          )

          if (!conversation) {
            // Create new conversation
            conversation = {
              id: genId(),
              kind: "direct",
              name: senderName,
              avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
              participants: [senderName],
              phoneNumbers: [senderPhone],
              createdAt: Date.now(),
            }
            setData((d) => ({ ...d, conversations: [conversation!, ...d.conversations] }))
          }

          // Add message
          const message: Message = {
            id: sms.messageId || genId(),
            conversationId: conversation.id,
            senderId: senderPhone,
            senderName,
            text: sms.message,
            media: null,
            createdAt: sms.timestamp || Date.now(),
          }

          setData((d) => {
            // Check if message already exists
            if (d.messages.find((m) => m.id === message.id)) {
              return d
            }
            return { ...d, messages: [...d.messages, message] }
          })
        }

        // Clear notifications after processing
        await fetch(`/api/notifications/sms?phone=${encodeURIComponent(phoneNumber)}`, {
          method: "DELETE",
        })
      }
    } catch (error) {
      console.error("[v0] SMS polling error:", error)
    }
  }

  useEffect(() => {
    // re-load on mount to sync with localStorage (SSR safety)
    setData(loadData())
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (hydrated.current) saveData(data)
  }, [data])

  // Setup SMS polling
  useEffect(() => {
    if (data.profile.phoneNumber) {
      pollSMSNotifications() // Poll immediately
      pollIntervalRef.current = setInterval(pollSMSNotifications, SMS_POLL_INTERVAL)
      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      }
    }
  }, [data.profile.phoneNumber])

  const updateProfile = (patch: Partial<Profile>) => {
    setData((d) => ({ ...d, profile: { ...d.profile, ...patch } }))
  }

  const createConversation = (
    kind: ConversationKind,
    name: string,
    participants: string[],
    phoneNumbers?: string[],
  ): Conversation => {
    const conv: Conversation = {
      id: genId(),
      kind,
      name,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      participants:
        kind === "group" ? ["You", ...participants] : participants,
      phoneNumbers:
        kind === "direct" ? phoneNumbers : undefined,
      createdAt: Date.now(),
    }
    setData((d) => ({ ...d, conversations: [conv, ...d.conversations] }))
    return conv
  }

  const deleteConversation = (id: string) => {
    setData((d) => ({
      ...d,
      conversations: d.conversations.filter((c) => c.id !== id),
      messages: d.messages.filter((m) => m.conversationId !== id),
    }))
  }

  const getMessages = (conversationId: string): Message[] =>
    data.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt - b.createdAt)

  const sendMessage = (
    conversationId: string,
    text: string,
    media: MediaAttachment | null,
  ) => {
    console.log("[v0] Context.sendMessage called:", { conversationId, text, media })
    const msg: Message = {
      id: genId(),
      conversationId,
      senderId: "me",
      senderName: "You",
      text,
      media,
      createdAt: Date.now(),
    }
    console.log("[v0] Creating message:", msg)
    setData((d) => {
      const updated = { ...d, messages: [...d.messages, msg] }
      console.log("[v0] Data updated with message, total messages:", updated.messages.length)
      return updated
    })
  }

  const createRoom = (name: string): MeetingRoom => {
    const room: MeetingRoom = {
      id: genId(),
      name,
      code: genCode(),
      participants: ["You"],
      createdAt: Date.now(),
    }
    setData((d) => ({ ...d, rooms: [room, ...d.rooms] }))
    return room
  }

  const joinRoom = (code: string): MeetingRoom | null => {
    const normalized = code.trim().toUpperCase()
    const existing = data.rooms.find((r) => r.code === normalized)
    if (existing) {
      if (!existing.participants.includes("You")) {
        setData((d) => ({
          ...d,
          rooms: d.rooms.map((r) =>
            r.id === existing.id
              ? { ...r, participants: [...r.participants, "You"] }
              : r,
          ),
        }))
      }
      return existing
    }
    // joining an external invite — create a placeholder room
    const room: MeetingRoom = {
      id: genId(),
      name: `Room ${normalized}`,
      code: normalized,
      participants: ["You"],
      createdAt: Date.now(),
    }
    setData((d) => ({ ...d, rooms: [room, ...d.rooms] }))
    return room
  }

  const getRoomMessages = (roomId: string): RoomMessage[] =>
    data.roomMessages
      .filter((m) => m.roomId === roomId)
      .sort((a, b) => a.createdAt - b.createdAt)

  const sendRoomMessage = (roomId: string, text: string) => {
    const msg: RoomMessage = {
      id: genId(),
      roomId,
      senderId: "me",
      senderName: "You",
      text,
      createdAt: Date.now(),
    }
    setData((d) => ({ ...d, roomMessages: [...d.roomMessages, msg] }))
  }

  const addContact = (contact: Contact) => {
    setData((d) => ({ ...d, contacts: [contact, ...d.contacts] }))
  }

  const deleteContact = (id: string) => {
    setData((d) => ({ ...d, contacts: d.contacts.filter((c) => c.id !== id) }))
  }

  const value: TelePulsContextValue = {
    data,
    profile: data.profile,
    updateProfile,
    createConversation,
    deleteConversation,
    getMessages,
    sendMessage,
    createRoom,
    joinRoom,
    getRoomMessages,
    sendRoomMessage,
    pollSMSNotifications,
    addContact,
    deleteContact,
  }

  return <TelePulsContext.Provider value={value}>{children}</TelePulsContext.Provider>
}

export function useTelePuls() {
  const ctx = useContext(TelePulsContext)
  if (!ctx) throw new Error("useTelePuls must be used within TelePulsProvider")
  return ctx
}
