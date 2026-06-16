// Enhanced meeting room types with screen sharing and mute controls
export interface ParticipantState {
  id: string
  name: string
  isMuted: boolean
  isVideoOn: boolean
  isScreenSharing: boolean
  screenShareStream?: string // URL or stream ID
}

export interface MeetingRoomEnhanced {
  id: string
  name: string
  code: string
  participants: ParticipantState[]
  createdAt: number
  maxParticipants: number // for scaling to 2000+
  screenShareOwner?: string // participant ID currently sharing
}

// Store participant states in memory
const participantStates = new Map<string, ParticipantState>()

// Store active meetings
const activeMeetings = new Map<string, MeetingRoomEnhanced>()

export function initializeParticipant(roomId: string, participantName: string): ParticipantState {
  const state: ParticipantState = {
    id: `${roomId}-${Date.now()}`,
    name: participantName,
    isMuted: false,
    isVideoOn: true,
    isScreenSharing: false,
  }
  participantStates.set(state.id, state)
  return state
}

export function toggleMute(participantId: string): ParticipantState | null {
  const state = participantStates.get(participantId)
  if (state) {
    state.isMuted = !state.isMuted
  }
  return state || null
}

export function toggleVideo(participantId: string): ParticipantState | null {
  const state = participantStates.get(participantId)
  if (state) {
    state.isVideoOn = !state.isVideoOn
  }
  return state || null
}

export function startScreenShare(participantId: string, streamId: string): ParticipantState | null {
  const state = participantStates.get(participantId)
  if (state) {
    state.isScreenSharing = true
    state.screenShareStream = streamId
  }
  return state || null
}

export function stopScreenShare(participantId: string): ParticipantState | null {
  const state = participantStates.get(participantId)
  if (state) {
    state.isScreenSharing = false
    state.screenShareStream = undefined
  }
  return state || null
}

export function removeParticipant(participantId: string): void {
  participantStates.delete(participantId)
}

export function createEnhancedMeeting(roomId: string, name: string, maxParticipants: number = 2000): MeetingRoomEnhanced {
  const meeting: MeetingRoomEnhanced = {
    id: roomId,
    name,
    code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    participants: [],
    createdAt: Date.now(),
    maxParticipants,
  }
  activeMeetings.set(roomId, meeting)
  return meeting
}

export function addParticipantToMeeting(roomId: string, participant: ParticipantState): void {
  const meeting = activeMeetings.get(roomId)
  if (meeting && meeting.participants.length < meeting.maxParticipants) {
    meeting.participants.push(participant)
  }
}

export function removeParticipantFromMeeting(roomId: string, participantId: string): void {
  const meeting = activeMeetings.get(roomId)
  if (meeting) {
    meeting.participants = meeting.participants.filter((p) => p.id !== participantId)
    removeParticipant(participantId)
  }
}

export function getMeetingParticipants(roomId: string): ParticipantState[] {
  const meeting = activeMeetings.get(roomId)
  return meeting?.participants || []
}

export function closeMeeting(roomId: string): void {
  const meeting = activeMeetings.get(roomId)
  if (meeting) {
    meeting.participants.forEach((p) => removeParticipant(p.id))
    activeMeetings.delete(roomId)
  }
}
