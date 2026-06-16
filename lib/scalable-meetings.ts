// Scalable meeting system for 2000+ participants
// Uses WebRTC for peer connections and optimized rendering

export interface ScalableMeetingConfig {
  maxParticipants: number
  renderLimit: number // max participants to render UI for (visual limit)
  participantsPerPage: number // pagination
}

export const DEFAULT_MEETING_CONFIG: ScalableMeetingConfig = {
  maxParticipants: 2000, // support up to 2000 participants
  renderLimit: 16, // render up to 16 participant tiles at once
  participantsPerPage: 4, // load 4 per page
}

// Server-side participant storage (in production, use Redis or database)
interface ServerParticipant {
  id: string
  roomId: string
  name: string
  joinedAt: number
  lastActive: number
  isMuted: boolean
  isVideoOn: boolean
  isScreenSharing: boolean
}

// Store for tracking active participants (in-memory for demo)
const serverParticipants = new Map<string, ServerParticipant[]>()

/**
 * Create a new scalable meeting room
 */
export function createScalableMeeting(roomId: string): void {
  if (!serverParticipants.has(roomId)) {
    serverParticipants.set(roomId, [])
  }
}

/**
 * Add participant to meeting with server-side tracking
 */
export function addParticipantToScalableMeeting(
  roomId: string,
  participantId: string,
  name: string
): boolean {
  const participants = serverParticipants.get(roomId)
  if (!participants) return false

  if (participants.length >= DEFAULT_MEETING_CONFIG.maxParticipants) {
    return false // Meeting at capacity
  }

  const participant: ServerParticipant = {
    id: participantId,
    roomId,
    name,
    joinedAt: Date.now(),
    lastActive: Date.now(),
    isMuted: false,
    isVideoOn: true,
    isScreenSharing: false,
  }

  participants.push(participant)
  return true
}

/**
 * Remove participant from meeting
 */
export function removeParticipantFromScalableMeeting(
  roomId: string,
  participantId: string
): void {
  const participants = serverParticipants.get(roomId)
  if (participants) {
    const idx = participants.findIndex((p) => p.id === participantId)
    if (idx !== -1) {
      participants.splice(idx, 1)
    }
  }
}

/**
 * Get paginated list of participants (for performance)
 */
export function getParticipantsPaginated(
  roomId: string,
  page: number = 0
): ServerParticipant[] {
  const participants = serverParticipants.get(roomId) || []
  const start = page * DEFAULT_MEETING_CONFIG.participantsPerPage
  const end = start + DEFAULT_MEETING_CONFIG.participantsPerPage
  return participants.slice(start, end)
}

/**
 * Get total participant count
 */
export function getParticipantCount(roomId: string): number {
  return serverParticipants.get(roomId)?.length || 0
}

/**
 * Get total pages for pagination
 */
export function getParticipantPages(roomId: string): number {
  const count = getParticipantCount(roomId)
  return Math.ceil(count / DEFAULT_MEETING_CONFIG.participantsPerPage)
}

/**
 * Update participant state (mute/unmute, video on/off)
 */
export function updateParticipantState(
  roomId: string,
  participantId: string,
  state: Partial<ServerParticipant>
): void {
  const participants = serverParticipants.get(roomId)
  if (participants) {
    const participant = participants.find((p) => p.id === participantId)
    if (participant) {
      Object.assign(participant, state, { lastActive: Date.now() })
    }
  }
}

/**
 * Broadcast participant state to all other participants
 * In production: use WebSocket or Server-Sent Events
 */
export function broadcastParticipantStateChange(
  roomId: string,
  participantId: string,
  state: Partial<ServerParticipant>
): void {
  updateParticipantState(roomId, participantId, state)
  // In production, emit event to all connected clients via WebSocket
  // Example: io.to(roomId).emit('participant-state-changed', { participantId, state })
}

/**
 * End meeting and cleanup
 */
export function endScalableMeeting(roomId: string): void {
  serverParticipants.delete(roomId)
}

/**
 * Get statistics about the meeting
 */
export function getMeetingStats(roomId: string) {
  const participants = serverParticipants.get(roomId) || []
  const stats = {
    totalParticipants: participants.length,
    mutedCount: participants.filter((p) => p.isMuted).length,
    videoOffCount: participants.filter((p) => !p.isVideoOn).length,
    screenSharingCount: participants.filter((p) => p.isScreenSharing).length,
    averageSessionTime: participants.length
      ? Math.round(
          participants.reduce((sum, p) => sum + (Date.now() - p.joinedAt), 0) /
            participants.length
        )
      : 0,
  }
  return stats
}

/**
 * Cleanup inactive participants (last active > 5 minutes)
 */
export function cleanupInactiveParticipants(roomId: string): number {
  const participants = serverParticipants.get(roomId)
  if (!participants) return 0

  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  const removed = participants.filter((p) => p.lastActive < fiveMinutesAgo).length

  serverParticipants.set(
    roomId,
    participants.filter((p) => p.lastActive >= fiveMinutesAgo)
  )

  return removed
}
