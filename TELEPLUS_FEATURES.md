# Teleplus - Complete Feature Documentation

## System Overview

Teleplus is a unified messaging and communication platform built with Next.js, React, and Tailwind CSS. It combines real-time chat, SMS notifications, video/audio calls, group meetings, and media sharing in one application.

---

## Core Features

### 1. Real-Time Live Chat

**Technology:** Server-Sent Events (SSE) with real-time message streaming

**Features:**
- Instant message delivery
- Text, photo, video, and file sharing
- Direct and group conversations
- Message history stored locally
- Offline message queueing
- Read receipts (via timestamps)

**API Endpoints:**
- `GET /api/chat/stream?userId={id}` - Connect to real-time stream
- `POST /api/chat/stream` - Send real-time message

**Usage Example:**
```javascript
import { useRealtimeChat, sendRealtimeMessage } from '@/hooks/use-realtime-chat'

const { isConnected } = useRealtimeChat({
  userId: 'user-123',
  onMessage: (data) => console.log('New message:', data),
  enabled: true
})
```

---

### 2. SMS Notifications

**Technology:** Webhook-based SMS integration with automatic polling

**Setup:**
- Configure SMS service (Twilio, Vonage, AWS SNS, custom)
- Set phone number in user profile
- App automatically polls every 5 seconds
- SMS creates/updates conversations

**Supported Services:**
- Twilio
- Vonage/Nexmo
- AWS SNS
- Custom HTTP webhooks

**API Endpoints:**
- `POST /api/notifications/sms` - Receive incoming SMS
- `GET /api/notifications/sms?phone={number}` - Retrieve notifications
- `DELETE /api/notifications/sms?phone={number}` - Clear notifications

**Integration Example (Twilio):**
```bash
# Webhook URL in Twilio Console
https://your-app.vercel.app/api/notifications/sms
```

---

### 3. Video/Audio Calls

**Technology:** WebRTC signaling with call state management

**Features:**
- Initiate audio or video calls
- Answer/decline incoming calls
- Toggle microphone on/off
- Toggle camera on/off (video calls)
- Call duration tracking
- Call history

**Call States:**
- `idle` - No active call
- `calling` - Outgoing call initiated
- `ringing` - Incoming call received
- `active` - Call in progress
- `ended` - Call terminated

**API Endpoints:**
- `POST /api/calls/initiate` - Start a call
- `POST /api/calls/status` - Update call status
- `POST /api/calls/end` - End call
- `GET /api/calls/end?callId={id}` - Get call details

**Usage Example:**
```typescript
import { createCallSession } from '@/lib/call-system'

const call = createCallSession(
  'user-123',           // initiatorId
  'John Doe',           // initiatorName
  'user-456',           // recipientId
  'Jane Smith',         // recipientName
  'video'               // 'audio' | 'video'
)
```

---

### 4. Group Meetings with Invite Links

**Features:**
- Create meeting rooms with unique codes
- Share room codes via link or QR code
- Auto-join from invite link with `?join=CODE`
- Meeting room participants list
- Real-time room messages
- 6-character shareable codes

**Room Management:**
- Create room: Returns meeting room with code
- Join room: Code-based join with auto-create if needed
- Get room messages: Retrieve conversation history
- Send room message: Real-time message in room

**Example:**
```typescript
// Create a meeting
const room = createRoom('Team Meeting')
console.log(room.code) // e.g., "ABC123"

// Share link
const inviteLink = `https://app.com/?join=${room.code}`

// Join from code
const joined = joinRoom('ABC123')
```

---

### 5. Media Sharing

**Supported Types:**
- Images (JPEG, PNG, WebP, GIF)
- Videos (MP4, WebM, MOV)
- Files (Documents, archives, etc.)
- Maximum file size: Limited by browser

**Features:**
- Preview in chat
- Download capability
- Data URL storage (local)
- File metadata (name, size, MIME type)

**Example:**
```typescript
const media: MediaAttachment = {
  id: 'media-123',
  kind: 'image',
  url: 'data:image/jpeg;base64,...',
  name: 'photo.jpg',
  size: 245000,
  mimeType: 'image/jpeg'
}

sendMessage(conversationId, 'Check this out!', media)
```

---

### 6. User Profiles

**Profile Information:**
- Display name
- Phone number (for SMS notifications)
- Status message
- Avatar color
- User ID

**Customization:**
- 6 avatar color options
- Custom status messages
- Phone number for SMS
- Display name editable

---

## Architecture

### Client-Side
- React components with hooks
- Context API for state management
- localStorage for persistence
- EventSource for real-time updates

### Server-Side
- Next.js API routes (serverless)
- In-memory storage for calls/SMS
- SSE for real-time messaging
- Webhook handlers for SMS services

### Data Storage
- **Local:** localStorage (conversations, messages, rooms)
- **Session:** In-memory (calls, SMS notifications)
- **Production:** Ready for database integration (Neon, Supabase, etc.)

---

## File Structure

```
/app
  /api
    /calls
      /initiate/route.ts      - Start call
      /status/route.ts        - Update call status
      /end/route.ts           - End call
    /chat
      /stream/route.ts        - Real-time chat stream
    /notifications
      /sms/route.ts           - SMS webhook handler

/components/telepuls
  /avatar.tsx                 - User avatar component
  /call-ui.tsx               - Call interface
  /chat-list-screen.tsx      - Conversations list
  /conversation-screen.tsx   - Chat interface
  /media-viewer.tsx          - Media display
  /meeting-room-screen.tsx   - Room interface
  /message-bubble.tsx        - Message component
  /profile-screen.tsx        - Profile editor
  /rooms-list-screen.tsx     - Rooms list
  /telepuls-app.tsx          - Main app shell

/contexts
  /telepuls-context.tsx      - State management

/hooks
  /use-realtime-chat.ts      - Real-time chat hook

/lib
  /call-system.ts            - Call management
  /telepuls-types.ts         - TypeScript types
  /telepuls-storage.ts       - localStorage helpers
  /telepuls-share.ts         - Media helpers
```

---

## Type Definitions

### Message
```typescript
interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  text: string
  media: MediaAttachment | null
  createdAt: number
}
```

### Conversation
```typescript
interface Conversation {
  id: string
  kind: 'direct' | 'group'
  name: string
  avatarColor: string
  participants: string[]
  phoneNumbers?: string[] // for SMS conversations
  createdAt: number
}
```

### MeetingRoom
```typescript
interface MeetingRoom {
  id: string
  name: string
  code: string
  participants: string[]
  createdAt: number
}
```

### CallSession
```typescript
interface CallSession {
  id: string
  initiatorId: string
  initiatorName: string
  recipientId: string
  recipientName: string
  type: 'audio' | 'video'
  status: 'idle' | 'calling' | 'ringing' | 'active' | 'ended'
  startedAt?: number
  endedAt?: number
  duration?: number
}
```

---

## Deployment Guide

### Vercel (Recommended)

```bash
# Install dependencies
npm install

# Build
npm run build

# Deploy
npx vercel
```

### Environment Variables

For SMS integration, add to `.env.local`:
```
# Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Vonage
VONAGE_API_KEY=your_key
VONAGE_API_SECRET=your_secret

# AWS SNS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

### Production Considerations

1. **Database Integration**
   - Replace localStorage with Neon, Supabase, or Firebase
   - Store message history permanently
   - Implement database migrations

2. **Message Queue**
   - Replace in-memory storage with Redis/Upstash
   - Ensure message delivery at scale
   - Handle connection failures

3. **WebRTC Signaling**
   - Implement STUN/TURN servers
   - Use production signaling (Twilio, Daily, etc.)
   - Add ICE candidate handling

4. **Security**
   - Add authentication/authorization
   - Encrypt sensitive data
   - Implement rate limiting
   - Add CORS policies

5. **Monitoring**
   - Add error tracking (Sentry)
   - Implement logging
   - Monitor API performance
   - Track SMS delivery

---

## Testing

### Local Testing

1. **SMS Webhook:**
```bash
curl -X POST http://localhost:3000/api/notifications/sms \
  -H "Content-Type: application/json" \
  -d '{"from":"+1234567890","to":"+9876543210","message":"Test"}'
```

2. **Real-Time Chat:**
- Open app in two browser windows
- Send message from one window
- Observe real-time delivery in other window

3. **Calls:**
- Create two user profiles
- Initiate call from one to other
- Accept/decline/end call
- Verify duration tracking

---

## Roadmap

### Phase 2
- WebSocket support (lower latency)
- Message search and filtering
- Message reactions/emojis
- Read receipts
- Typing indicators

### Phase 3
- Voice messages
- Screen sharing
- Multi-user video calls
- Message encryption
- Call recording

### Phase 4
- Payment integration (Stripe)
- Premium features
- Analytics dashboard
- Admin panel
- API for third-party apps

---

## Support & Troubleshooting

### Common Issues

**SMS not arriving:**
- Check phone number is set in profile
- Verify webhook URL is public and accessible
- Check SMS service logs
- Ensure polling interval is running

**Calls not connecting:**
- Check firewall/NAT settings
- Verify WebRTC support in browser
- Check STUN server availability
- Enable camera/microphone permissions

**Real-time messages slow:**
- Check internet connection speed
- Reduce polling interval (if needed)
- Monitor server performance
- Check browser console for errors

---

**Documentation Version:** 1.0  
**Last Updated:** June 2026  
**Built with:** Next.js 16, React 19, Tailwind CSS 4
