/**
 * Video/Audio Call System using WebRTC
 * Supports P2P audio/video calls between users
 */

export type CallType = 'audio' | 'video'
export type CallStatus = 'idle' | 'calling' | 'ringing' | 'active' | 'ended'

export interface CallSession {
  id: string
  initiatorId: string
  initiatorName: string
  recipientId: string
  recipientName: string
  type: CallType
  status: CallStatus
  startedAt?: number
  endedAt?: number
  duration?: number
}

export interface CallState {
  currentCall: CallSession | null
  ringtone: boolean
  microphoneEnabled: boolean
  cameraEnabled: boolean
  speakerEnabled: boolean
}

// In-memory call sessions (in production, use a database or message queue)
const callSessions: Map<string, CallSession> = new Map()
const callListeners: Map<string, Set<(session: CallSession) => void>> = new Map()

export function createCallSession(
  initiatorId: string,
  initiatorName: string,
  recipientId: string,
  recipientName: string,
  type: CallType
): CallSession {
  const session: CallSession = {
    id: `call-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    initiatorId,
    initiatorName,
    recipientId,
    recipientName,
    type,
    status: 'calling',
    startedAt: Date.now(),
  }
  callSessions.set(session.id, session)
  notifyListeners(recipientId, session)
  return session
}

export function updateCallStatus(callId: string, status: CallStatus): CallSession | null {
  const session = callSessions.get(callId)
  if (!session) return null
  session.status = status
  if (status === 'active' && !session.startedAt) {
    session.startedAt = Date.now()
  }
  if (status === 'ended') {
    session.endedAt = Date.now()
    if (session.startedAt) {
      session.duration = session.endedAt - session.startedAt
    }
  }
  notifyListeners(session.recipientId, session)
  notifyListeners(session.initiatorId, session)
  return session
}

export function endCall(callId: string): CallSession | null {
  const session = callSessions.get(callId)
  if (!session) return null
  updateCallStatus(callId, 'ended')
  setTimeout(() => callSessions.delete(callId), 5000) // Clean up after 5s
  return session
}

export function getCallSession(callId: string): CallSession | null {
  return callSessions.get(callId) || null
}

export function getUserActiveCalls(userId: string): CallSession[] {
  return Array.from(callSessions.values()).filter(
    (s) => (s.initiatorId === userId || s.recipientId === userId) && s.status !== 'ended'
  )
}

// Listener system for real-time updates
function notifyListeners(userId: string, session: CallSession) {
  const listeners = callListeners.get(userId)
  if (listeners) {
    listeners.forEach((listener) => listener(session))
  }
}

export function subscribeToCallUpdates(
  userId: string,
  callback: (session: CallSession) => void
): () => void {
  if (!callListeners.has(userId)) {
    callListeners.set(userId, new Set())
  }
  callListeners.get(userId)!.add(callback)

  // Return unsubscribe function
  return () => {
    const listeners = callListeners.get(userId)
    if (listeners) {
      listeners.delete(callback)
    }
  }
}

export function formatCallDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}
