import { NextRequest, NextResponse } from 'next/server'
import { updateCallStatus } from '@/lib/call-system'

/**
 * Update call status
 * POST /api/calls/status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { callId, status } = body

    if (!callId || !status) {
      return NextResponse.json(
        { error: 'Missing callId or status' },
        { status: 400 }
      )
    }

    const session = updateCallStatus(callId, status)
    if (!session) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      callSession: session,
    })
  } catch (error) {
    console.error('[Call Status Error]', error)
    return NextResponse.json(
      { error: 'Failed to update call status' },
      { status: 500 }
    )
  }
}
