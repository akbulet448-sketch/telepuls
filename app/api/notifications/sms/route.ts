import { NextRequest, NextResponse } from 'next/server'

/**
 * SMS Notification Webhook Handler
 * 
 * This endpoint receives incoming SMS notifications from services like:
 * - Twilio
 * - AWS SNS
 * - Vonage/Nexmo
 * 
 * Integration guide: Configure your SMS service webhook to POST to /api/notifications/sms
 */

interface SMSNotification {
  from: string // sender phone number
  to: string // recipient phone number
  message: string // SMS content
  timestamp?: number
  messageId?: string
  service?: 'twilio' | 'sns' | 'vonage' | 'custom'
}

// Store notifications in memory (in production, use a database)
const notifications: Map<string, SMSNotification[]> = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Parse different SMS service formats
    let smsData: SMSNotification

    // Twilio format
    if (body.From && body.Body) {
      smsData = {
        from: body.From,
        to: body.To || '',
        message: body.Body,
        timestamp: Date.now(),
        messageId: body.MessageSid,
        service: 'twilio',
      }
    }
    // Vonage format
    else if (body.msisdn && body.text) {
      smsData = {
        from: body.msisdn,
        to: body.to || '',
        message: body.text,
        timestamp: Date.now(),
        messageId: body['message-id'],
        service: 'vonage',
      }
    }
    // Custom format
    else {
      smsData = {
        from: body.from || '',
        to: body.to || '',
        message: body.message || '',
        timestamp: body.timestamp || Date.now(),
        messageId: body.messageId,
        service: 'custom',
      }
    }

    console.log('[SMS Notification]', smsData)

    // Store notification
    const key = smsData.to || 'default'
    if (!notifications.has(key)) {
      notifications.set(key, [])
    }
    notifications.get(key)!.push(smsData)

    // In production: 
    // 1. Save to database
    // 2. Send push notification to recipient's app
    // 3. Trigger real-time update via WebSocket

    return NextResponse.json({
      success: true,
      message: 'SMS notification received',
      notification: smsData,
    })
  } catch (error) {
    console.error('[SMS Error]', error)
    return NextResponse.json(
      { error: 'Failed to process SMS notification' },
      { status: 400 }
    )
  }
}

// GET endpoint to retrieve notifications (for testing)
export async function GET(request: NextRequest) {
  const phoneNumber = request.nextUrl.searchParams.get('phone')
  
  if (!phoneNumber) {
    return NextResponse.json(
      { error: 'Phone number parameter required' },
      { status: 400 }
    )
  }

  const userNotifications = notifications.get(phoneNumber) || []

  return NextResponse.json({
    phoneNumber,
    notificationCount: userNotifications.length,
    notifications: userNotifications,
  })
}

// DELETE endpoint to clear notifications (for testing)
export async function DELETE(request: NextRequest) {
  const phoneNumber = request.nextUrl.searchParams.get('phone')
  
  if (phoneNumber) {
    notifications.delete(phoneNumber)
    return NextResponse.json({ success: true, cleared: phoneNumber })
  }

  notifications.clear()
  return NextResponse.json({ success: true, cleared: 'all' })
}
