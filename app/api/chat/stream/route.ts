/**
 * Simple Real-Time Chat System
 * Uses Server-Sent Events (SSE) for real-time updates
 */

import { NextRequest, NextResponse } from 'next/server'

// In production: use a proper database or message queue
const activeConnections: Set<{
  userId: string
  controller: ReadableStreamDefaultController<Uint8Array>
}> = new Set()

const messageQueue: Array<{
  userId: string
  message: string
  senderId: string
  senderName: string
  conversationId: string
  timestamp: number
}> = []

/**
 * Stream endpoint for real-time messages
 * Client connects with: new EventSource(`/api/chat/stream?userId=${userId}`)
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  
  if (!userId) {
    return new NextResponse('userId parameter required', { status: 400 })
  }

  // Create response with SSE headers
  const encoder = new TextEncoder()
  let controller: ReadableStreamDefaultController<Uint8Array>

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl
      const connection = { userId, controller }
      activeConnections.add(connection)

      // Send initial connection confirmation
      ctrl.enqueue(encoder.encode('data: {"type": "connected"}\n\n'))

      // Send any queued messages
      messageQueue.forEach((msg) => {
        if (msg.userId === userId) {
          ctrl.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'message', ...msg })}\n\n`)
          )
        }
      })
      messageQueue.length = 0 // Clear queue

      // Keep connection alive
      const keepAlive = setInterval(() => {
        try {
          ctrl.enqueue(encoder.encode(': keep-alive\n\n'))
        } catch (e) {
          clearInterval(keepAlive)
        }
      }, 30000)

      // Cleanup on disconnect
      ;(request as any).signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        activeConnections.delete(connection)
      })
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

/**
 * POST endpoint to send real-time messages
 * Broadcasts to all connected clients in a conversation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, senderId, senderName, message, recipientUserIds } = body

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'conversationId and message required' },
        { status: 400 }
      )
    }

    const messageData = {
      conversationId,
      senderId: senderId || 'anonymous',
      senderName: senderName || 'User',
      message,
      timestamp: Date.now(),
      userId: '', // Will be set per recipient
    }

    // Broadcast to connected clients
    const encoder = new TextEncoder()
    const recipientIds = recipientUserIds || []

    activeConnections.forEach((conn) => {
      if (recipientIds.includes(conn.userId)) {
        try {
          conn.controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'message', ...messageData })}\n\n`)
          )
        } catch (e) {
          activeConnections.delete(conn)
        }
      }
    })

    // Queue messages for disconnected clients
    recipientIds.forEach((userId) => {
      messageQueue.push({ ...messageData, userId })
      // Keep queue size reasonable
      if (messageQueue.length > 1000) {
        messageQueue.shift()
      }
    })

    return NextResponse.json({ success: true, message: 'Message sent' })
  } catch (error) {
    console.error('[Chat Stream Error]', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
