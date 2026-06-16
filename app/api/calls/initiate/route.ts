import { NextRequest, NextResponse } from 'next/server'
import {
  createCallSession,
  updateCallStatus,
  endCall,
  getUserActiveCalls,
  getCallSession,
} from '@/lib/call-system'
import type { CallType } from '@/lib/call-system'

/**
 * Initiate a call
 * POST /api/calls/initiate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { initiatorId, initiatorName, recipientId, recipientName, type } = body

    if (!initiatorId || !recipientId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if recipient already has active calls
    const existingCalls = getUserActiveCalls(recipientId)
    if (existingCalls.length > 0) {
      return NextResponse.json(
        { 
          error: 'Recipient is busy',
          existingCall: existingCalls[0]
        },
        { status: 409 }
      )
    }

    const session = createCallSession(
      initiatorId,
      initiatorName,
      recipientId,
      recipientName,
      type as CallType
    )

    return NextResponse.json({
      success: true,
      callSession: session,
    })
  } catch (error) {
    console.error('[Call Initiate Error]', error)
    return NextResponse.json(
      { error: 'Failed to initiate call' },
      { status: 500 }
    )
  }
}
