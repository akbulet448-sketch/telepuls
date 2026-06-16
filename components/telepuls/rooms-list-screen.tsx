"use client"

import { useState } from "react"
import { LogIn, Share2, Users, Video, X } from "lucide-react"
import { useTelePuls } from "@/contexts/telepuls-context"
import type { MeetingRoom } from "@/lib/telepuls-types"
import { inviteLink, nativeShare } from "@/lib/telepuls-share"

interface RoomsListScreenProps {
  onOpenRoom: (room: MeetingRoom) => void
}

export function RoomsListScreen({ onOpenRoom }: RoomsListScreenProps) {
  const { data, createRoom, joinRoom } = useTelePuls()
  const [dialog, setDialog] = useState<"create" | "join" | null>(null)
  const [value, setValue] = useState("")

  const submit = () => {
    if (!value.trim()) return
    if (dialog === "create") {
      const room = createRoom(value.trim())
      setDialog(null)
      setValue("")
      onOpenRoom(room)
    } else {
      const room = joinRoom(value.trim())
      setDialog(null)
      setValue("")
      if (room) onOpenRoom(room)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="border-b border-border bg-card px-4 pb-4 pt-4">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Meeting Rooms</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Create a room and share the invite link, or join with a code.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setValue("")
              setDialog("create")
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Video className="h-4 w-4" /> New room
          </button>
          <button
            type="button"
            onClick={() => {
              setValue("")
              setDialog("join")
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card py-2.5 text-sm font-semibold text-foreground"
          >
            <LogIn className="h-4 w-4" /> Join
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {data.rooms.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <p className="font-medium">No meeting rooms yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Create your first room to start a group meeting with a shareable invite link.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.rooms.map((room) => (
              <li key={room.id}>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => onOpenRoom(room)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                      <Video className="h-6 w-6" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{room.name}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {room.participants.length} · code {room.code}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      nativeShare({
                        title: `Join ${room.name}`,
                        text: `Join my meeting "${room.name}" on TelePuls. Code: ${room.code}`,
                        url: inviteLink(room.code),
                      })
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"
                    aria-label="Share invite"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-t-3xl bg-card p-5 sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {dialog === "create" ? "New meeting room" : "Join a room"}
              </h2>
              <button type="button" onClick={() => setDialog(null)} aria-label="Close" className="rounded-full p-1 hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="mb-1 block text-sm font-medium">
              {dialog === "create" ? "Room name" : "Invite code"}
            </label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={dialog === "create" ? "e.g. Team Standup" : "e.g. AB12CD"}
              className="mb-4 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim()}
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {dialog === "create" ? "Create & enter" : "Join room"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
