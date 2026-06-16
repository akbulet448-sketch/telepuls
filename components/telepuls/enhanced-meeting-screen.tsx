"use client"

import { useState, useRef, useEffect } from "react"
import {
  ArrowLeft,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  X,
  Phone,
  Copy,
  Users,
} from "lucide-react"
import { genId } from "@/lib/telepuls-types"
import type { ParticipantState } from "@/lib/meeting-enhanced"
import {
  initializeParticipant,
  toggleMute,
  toggleVideo,
  startScreenShare,
  stopScreenShare,
} from "@/lib/meeting-enhanced"

interface EnhancedMeetingScreenProps {
  roomCode: string
  roomName: string
  onEnd: () => void
}

export function EnhancedMeetingScreen({
  roomCode,
  roomName,
  onEnd,
}: EnhancedMeetingScreenProps) {
  const [participants, setParticipants] = useState<ParticipantState[]>([])
  const [myState, setMyState] = useState<ParticipantState | null>(null)
  const [screenShareActive, setScreenShareActive] = useState(false)
  const [copied, setCopied] = useState(false)
  const videoGridRef = useRef<HTMLDivElement>(null)

  // Initialize current user
  useEffect(() => {
    const state = initializeParticipant(roomCode, "You")
    setMyState(state)
    setParticipants([state])
  }, [roomCode])

  const handleToggleMute = () => {
    if (myState) {
      const updated = toggleMute(myState.id)
      if (updated) {
        setMyState(updated)
        setParticipants((prev) =>
          prev.map((p) => (p.id === myState.id ? updated : p))
        )
      }
    }
  }

  const handleToggleVideo = () => {
    if (myState) {
      const updated = toggleVideo(myState.id)
      if (updated) {
        setMyState(updated)
        setParticipants((prev) =>
          prev.map((p) => (p.id === myState.id ? updated : p))
        )
      }
    }
  }

  const handleScreenShare = async () => {
    if (!screenShareActive && myState) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false,
        })
        const streamId = genId()
        const updated = startScreenShare(myState.id, streamId)
        if (updated) {
          setMyState(updated)
          setParticipants((prev) =>
            prev.map((p) => (p.id === myState.id ? updated : p))
          )
          setScreenShareActive(true)

          stream.getTracks().forEach((track) => {
            track.onended = () => {
              handleStopScreenShare()
            }
          })
        }
      } catch (error) {
        console.error("[v0] Screen share error:", error)
      }
    } else {
      handleStopScreenShare()
    }
  }

  const handleStopScreenShare = () => {
    if (myState) {
      const updated = stopScreenShare(myState.id)
      if (updated) {
        setMyState(updated)
        setParticipants((prev) =>
          prev.map((p) => (p.id === myState.id ? updated : p))
        )
        setScreenShareActive(false)
      }
    }
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}?join=${roomCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayParticipants = screenShareActive
    ? participants.filter((p) => p.isScreenSharing)
    : participants.slice(0, 9)

  return (
    <div className="flex h-full flex-col bg-black">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/20 bg-card/50 px-4 py-3 backdrop-blur-sm">
        <div>
          <h2 className="font-semibold text-white">{roomName}</h2>
          <p className="text-xs text-muted-foreground">
            {participants.length} participant{participants.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyInviteLink}
            className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm hover:bg-secondary"
            title="Copy invite link"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Invite"}
          </button>
          <button
            type="button"
            onClick={onEnd}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            aria-label="End call"
          >
            <Phone className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Video Grid */}
      <div
        ref={videoGridRef}
        className="flex-1 overflow-auto bg-black p-4"
      >
        <div
          className={`grid gap-4 ${
            displayParticipants.length === 1
              ? "grid-cols-1"
              : displayParticipants.length <= 4
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {displayParticipants.map((participant) => (
            <div
              key={participant.id}
              className="relative aspect-video overflow-hidden rounded-lg bg-secondary"
            >
              {/* Video placeholder */}
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-secondary/50">
                <div className="text-center">
                  <div className="mb-2 text-4xl">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium">{participant.name}</p>
                </div>
              </div>

              {/* Controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent px-2 py-2">
                {participant.isMuted ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4 text-green-500" />
                )}
                {!participant.isVideoOn && (
                  <VideoOff className="h-4 w-4 text-red-500" />
                )}
                {participant.isScreenSharing && (
                  <Share2 className="h-4 w-4 text-blue-500" />
                )}
              </div>

              {/* Name badge */}
              <div className="absolute top-2 left-2 rounded bg-black/60 px-2 py-1 text-xs font-medium">
                {participant.name}
              </div>
            </div>
          ))}
        </div>

        {/* Participant count info */}
        {participants.length > 9 && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-secondary/30 px-4 py-3 text-center text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {participants.length - 9} more participant{participants.length - 9 !== 1 ? "s" : ""} in
            meeting
          </div>
        )}
      </div>

      {/* Controls Footer */}
      <div className="flex items-center justify-center gap-3 border-t border-border/20 bg-card/50 px-4 py-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={handleToggleMute}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
            myState?.isMuted
              ? "bg-red-600 hover:bg-red-700"
              : "bg-primary hover:bg-primary/90"
          }`}
          title={myState?.isMuted ? "Unmute" : "Mute"}
        >
          {myState?.isMuted ? (
            <MicOff className="h-5 w-5 text-white" />
          ) : (
            <Mic className="h-5 w-5 text-white" />
          )}
        </button>

        <button
          type="button"
          onClick={handleToggleVideo}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
            !myState?.isVideoOn
              ? "bg-red-600 hover:bg-red-700"
              : "bg-primary hover:bg-primary/90"
          }`}
          title={myState?.isVideoOn ? "Turn off video" : "Turn on video"}
        >
          {myState?.isVideoOn ? (
            <Video className="h-5 w-5 text-white" />
          ) : (
            <VideoOff className="h-5 w-5 text-white" />
          )}
        </button>

        <button
          type="button"
          onClick={handleScreenShare}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
            screenShareActive
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-secondary hover:bg-secondary/90"
          }`}
          title={screenShareActive ? "Stop sharing" : "Share screen"}
        >
          <Share2 className="h-5 w-5 text-white" />
        </button>

        <div className="ml-2 text-xs text-muted-foreground">
          {screenShareActive && "Sharing screen"}
        </div>
      </div>
    </div>
  )
}
