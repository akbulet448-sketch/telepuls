'use client'

import { useEffect, useRef, useState } from 'react'
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import type { CallSession } from '@/lib/call-system'
import { formatCallDuration } from '@/lib/call-system'

interface CallUIProps {
  call: CallSession
  isInitiator: boolean
  onAnswer?: () => void
  onDecline?: () => void
  onEnd?: () => void
  onToggleMic?: (enabled: boolean) => void
  onToggleCamera?: (enabled: boolean) => void
}

export function CallUI({
  call,
  isInitiator,
  onAnswer,
  onDecline,
  onEnd,
  onToggleMic,
  onToggleCamera,
}: CallUIProps) {
  const [duration, setDuration] = useState(0)
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(call.type === 'video')
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (call.status === 'active' && call.startedAt) {
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - (call.startedAt || 0)) / 1000)
        setDuration(elapsed)
      }, 1000)
    }
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
    }
  }, [call.status, call.startedAt])

  const getStatusText = () => {
    switch (call.status) {
      case 'calling':
        return isInitiator ? 'Calling...' : 'Incoming call'
      case 'ringing':
        return 'Ringing...'
      case 'active':
        return formatCallDuration(duration)
      case 'ended':
        return 'Call ended'
      default:
        return 'Connecting...'
    }
  }

  const contactName = isInitiator ? call.recipientName : call.initiatorName

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Contact info */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-3xl font-bold text-white">
            {contactName.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-semibold text-white">{contactName}</h2>
          <p className="text-sm text-slate-300">{getStatusText()}</p>
        </div>

        {/* Call controls */}
        {call.status === 'ringing' && !isInitiator && (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onAnswer}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              title="Answer call"
            >
              <Phone className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={onDecline}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              title="Decline call"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>
        )}

        {call.status === 'active' && (
          <div className="flex gap-3">
            {call.type === 'video' && (
              <button
                type="button"
                onClick={() => {
                  setCameraEnabled(!cameraEnabled)
                  onToggleCamera?.(!cameraEnabled)
                }}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 ${
                  cameraEnabled ? 'bg-slate-600 text-white' : 'bg-red-500 text-white'
                }`}
                title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {cameraEnabled ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMicEnabled(!micEnabled)
                onToggleMic?.(!micEnabled)
              }}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 ${
                micEnabled ? 'bg-slate-600 text-white' : 'bg-red-500 text-white'
              }`}
              title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {micEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={onEnd}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110 active:scale-95"
              title="End call"
            >
              <PhoneOff className="h-5 w-5" />
            </button>
          </div>
        )}

        {call.status === 'calling' && isInitiator && (
          <button
            type="button"
            onClick={onEnd}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110 active:scale-95"
            title="Cancel call"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        )}

        {call.status === 'ended' && (
          <button
            type="button"
            onClick={onEnd}
            className="rounded-full bg-slate-700 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
          >
            Close
          </button>
        )}
      </div>

      {/* Video streams placeholder */}
      {call.type === 'video' && call.status === 'active' && (
        <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-20 pointer-events-none">
          <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-black/50">
            <span className="text-xs text-slate-400">Local video</span>
          </div>
          <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-black/50">
            <span className="text-xs text-slate-400">Remote video</span>
          </div>
        </div>
      )}
    </div>
  )
}
