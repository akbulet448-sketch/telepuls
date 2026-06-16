import { NextRequest, NextResponse } from 'next/server'
import { endCall, getCallSession } from '@/lib/call-system'

/**
 * End a call
 * POST /api/calls/end
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { callId } = body

    if (!callId) {
      return NextResponse.json(
        { error: 'Missing callId' },
        { status: 400 }
      )
    }

    const session = endCall(callId)
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
    console.error('[Call End Error]', error)
    return NextResponse.json(
      { error: 'Failed to end call' },
      { status: 500 }
    )
  }
}

/**
 * Get call details
 * GET /api/calls/end?callId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const callId = request.nextUrl.searchParams.get('callId')

    if (!callId) {
      return NextResponse.json(
        { error: 'Missing callId' },
        { status: 400 }
      )
    }

    const session = getCallSession(callId)
    if (!session) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      callSession: session,
    })
  } catch (error) {
    console.error('[Call Get Error]', error)
    return NextResponse.json(
      { error: 'Failed to get call' },
      { status: 500 }
    )
  }
}
