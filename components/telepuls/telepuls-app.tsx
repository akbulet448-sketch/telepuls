"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Video } from "lucide-react"
import { TelePulsProvider, useTelePuls } from "@/contexts/telepuls-context"
import type { Conversation, MeetingRoom } from "@/lib/telepuls-types"
import { ChatListScreen } from "./chat-list-screen"
import { ConversationScreen } from "./conversation-screen"
import { RoomsListScreen } from "./rooms-list-screen"
import { MeetingRoomScreen } from "./meeting-room-screen"
import { ProfileScreen } from "./profile-screen"

type Tab = "chats" | "rooms"
type Overlay =
  | { kind: "conversation"; conversation: Conversation }
  | { kind: "room"; room: MeetingRoom }
  | { kind: "profile" }
  | null

function Shell() {
  const { joinRoom } = useTelePuls()
  const [tab, setTab] = useState<Tab>("chats")
  const [overlay, setOverlay] = useState<Overlay>(null)

  // Handle ?join=CODE invite links — auto-enter the meeting room
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const code = params.get("join")
    if (code) {
      const room = joinRoom(code)
      if (room) {
        setTab("rooms")
        setOverlay({ kind: "room", room })
      }
      const url = new URL(window.location.href)
      url.searchParams.delete("join")
      window.history.replaceState({}, "", url.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-md flex-col overflow-hidden bg-background shadow-xl">
      <div className="relative flex-1 overflow-hidden">
        {tab === "chats" ? (
          <ChatListScreen
            onOpenConversation={(c) => setOverlay({ kind: "conversation", conversation: c })}
            onOpenProfile={() => setOverlay({ kind: "profile" })}
          />
        ) : (
          <RoomsListScreen onOpenRoom={(r) => setOverlay({ kind: "room", room: r })} />
        )}
      </div>

      {/* bottom nav */}
      {!overlay && (
        <nav className="flex border-t border-border bg-card">
          <button
            type="button"
            onClick={() => setTab("chats")}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
              tab === "chats" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            Chats
          </button>
          <button
            type="button"
            onClick={() => setTab("rooms")}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
              tab === "rooms" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Video className="h-5 w-5" />
            Rooms
          </button>
        </nav>
      )}

      {/* full-screen overlays */}
      {overlay?.kind === "conversation" && (
        <div className="absolute inset-0 z-30 animate-in slide-in-from-right duration-200">
          <ConversationScreen
            conversation={overlay.conversation}
            onBack={() => setOverlay(null)}
          />
        </div>
      )}
      {overlay?.kind === "room" && (
        <div className="absolute inset-0 z-30 animate-in slide-in-from-right duration-200">
          <MeetingRoomScreen room={overlay.room} onBack={() => setOverlay(null)} />
        </div>
      )}
      {overlay?.kind === "profile" && (
        <div className="absolute inset-0 z-30 animate-in slide-in-from-right duration-200">
          <ProfileScreen onBack={() => setOverlay(null)} />
        </div>
      )}
    </div>
  )
}

export function TelePulsApp() {
  return (
    <TelePulsProvider>
      <Shell />
    </TelePulsProvider>
  )
}
