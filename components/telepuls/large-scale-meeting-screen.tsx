"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react"
import { DEFAULT_MEETING_CONFIG } from "@/lib/scalable-meetings"
import type { ServerParticipant } from "@/lib/scalable-meetings"

interface LargeScaleMeetingScreenProps {
  roomCode: string
  roomName: string
  participantsCount: number
  onEnd: () => void
}

export function LargeScaleMeetingScreen({
  roomCode,
  roomName,
  participantsCount,
  onEnd,
}: LargeScaleMeetingScreenProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [participants, setParticipants] = useState<ServerParticipant[]>([])
  const [myMuted, setMyMuted] = useState(false)
  const [myVideoOn, setMyVideoOn] = useState(true)

  const totalPages = Math.ceil(
    participantsCount / DEFAULT_MEETING_CONFIG.participantsPerPage
  )
  const canGoNext = currentPage < totalPages - 1
  const canGoPrev = currentPage > 0

  useEffect(() => {
    // In production, fetch paginated participants from server
    // Example: const data = await fetch(`/api/meetings/${roomCode}/participants?page=${currentPage}`)
    console.log("[v0] Loading page", currentPage)
  }, [currentPage, roomCode])

  const handleNextPage = () => {
    if (canGoNext) setCurrentPage((p) => p + 1)
  }

  const handlePrevPage = () => {
    if (canGoPrev) setCurrentPage((p) => p - 1)
  }

  const startPage = currentPage * DEFAULT_MEETING_CONFIG.participantsPerPage + 1
  const endPage = Math.min(
    (currentPage + 1) * DEFAULT_MEETING_CONFIG.participantsPerPage,
    participantsCount
  )

  return (
    <div className="flex h-full flex-col bg-black">
      {/* Header with stats */}
      <header className="border-b border-border/20 bg-card/50 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">{roomName}</h2>
            <p className="text-xs text-muted-foreground">
              {participantsCount.toLocaleString()} participant{participantsCount !== 1 ? "s" : ""} • {roomCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onEnd}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            End Meeting
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-secondary/20 to-background p-6">
        {/* Large participant grid - optimized for 2000+ */}
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/20 shadow-lg transition-transform hover:scale-105"
              >
                {/* Participant tile */}
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="mb-2 text-2xl">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-center text-xs font-medium">
                    {participant.name.split(" ")[0]}
                  </p>
                </div>

                {/* Status indicators */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {participant.isMuted && (
                    <div
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600/80"
                      title="Muted"
                    >
                      <VolumeX className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                  {!participant.isVideoOn && (
                    <div
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600/80"
                      title="Video off"
                    >
                      <svg
                        className="h-2.5 w-2.5 fill-white"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-2-2H5V5h14v12z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Name label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                  <p className="truncate text-xs font-medium text-white">
                    {participant.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination info */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={!canGoPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary disabled:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-center text-sm text-muted-foreground">
                Showing {startPage.toLocaleString()} - {endPage.toLocaleString()} of{" "}
                {participantsCount.toLocaleString()} • Page {currentPage + 1} of {totalPages}
              </div>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={!canGoNext}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary disabled:bg-muted"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom controls */}
      <div className="border-t border-border/20 bg-card/50 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <Users className="mb-1 inline h-4 w-4" /> {participantsCount.toLocaleString()} in meeting
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMyMuted(!myMuted)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                myMuted
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-primary hover:bg-primary/90"
              }`}
              title={myMuted ? "Unmute" : "Mute"}
            >
              {myMuted ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMyVideoOn(!myVideoOn)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                !myVideoOn
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-primary hover:bg-primary/90"
              }`}
              title={myVideoOn ? "Turn off video" : "Turn on video"}
            >
              <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>
          </div>

          <div className="text-xs text-muted-foreground">
            {myMuted ? "Muted" : "Unmuted"}
          </div>
        </div>
      </div>
    </div>
  )
}
