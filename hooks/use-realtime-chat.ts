'use client'

import { useEffect, useRef, useCallback } from 'react'

interface RealtimeMessage {
  type: 'connected' | 'message'
  conversationId?: string
  senderId?: string
  senderName?: string
  message?: string
  timestamp?: number
}

interface UseRealtimeChatOptions {
  userId: string
  onMessage?: (data: RealtimeMessage) => void
  enabled?: boolean
}

/**
 * Hook to connect to real-time chat stream
 */
export function useRealtimeChat({
  userId,
  onMessage,
  enabled = true,
}: UseRealtimeChatOptions) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (!enabled || !userId) return
    
    try {
      const eventSource = new EventSource(`/api/chat/stream?userId=${encodeURIComponent(userId)}`)

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as RealtimeMessage
          onMessage?.(data)
        } catch (e) {
          console.error('[Realtime Chat] Failed to parse message:', e)
        }
      }

      eventSource.onerror = (error) => {
        console.error('[Realtime Chat] Connection error:', error)
        eventSource.close()
        eventSourceRef.current = null

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000)
      }

      eventSourceRef.current = eventSource
    } catch (error) {
      console.error('[Realtime Chat] Failed to connect:', error)
    }
  }, [userId, enabled, onMessage])

  useEffect(() => {
    connect()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])

  return {
    isConnected: eventSourceRef.current !== null,
  }
}

/**
 * Send a real-time message to recipients
 */
export async function sendRealtimeMessage({
  conversationId,
  senderId,
  senderName,
  message,
  recipientUserIds = [],
}: {
  conversationId: string
  senderId: string
  senderName: string
  message: string
  recipientUserIds?: string[]
}) {
  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        senderId,
        senderName,
        message,
        recipientUserIds,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[Send Realtime Message] Error:', error)
    throw error
  }
}
