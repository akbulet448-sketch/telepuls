# Teleplus SMS Notifications Integration Guide

## Overview

Teleplus now supports receiving SMS notifications directly in the app. When someone sends an SMS to your phone number, you'll automatically receive a notification in the app, and it will create a conversation thread with that contact.

## Setting Up Your Phone Number

1. Open **Profile** in Teleplus
2. Enter your phone number in the "Phone number" field
3. Save your profile
4. The app will automatically start polling for incoming SMS notifications every 5 seconds

## Integration with SMS Services

You can integrate Teleplus with any SMS service provider. Here's how:

### Using Twilio

1. **Get your Twilio credentials:**
   - Sign up at [twilio.com](https://www.twilio.com)
   - Get your Account SID and Auth Token
   - Purchase a phone number or use an existing one

2. **Configure Webhook:**
   - In Twilio Console → Phone Numbers → Manage Numbers
   - Select your number and scroll to "Messaging"
   - Set the "A Message Comes In" webhook to:
     ```
     https://your-app-domain.com/api/notifications/sms
     ```
   - Method: HTTP POST

3. **Test SMS:**
   - Send an SMS to your Twilio phone number
   - The message will appear in Teleplus as a new conversation

### Using Vonage/Nexmo

1. **Configure Webhook:**
   - In Vonage Dashboard → Phone Numbers
   - Set SMS inbound webhook to:
     ```
     https://your-app-domain.com/api/notifications/sms
     ```

2. **Send Test SMS:**
   - Send an SMS to your Vonage number
   - It will appear in Teleplus

### Using AWS SNS

1. **Create SNS Topic:**
   ```bash
   aws sns create-topic --name teleplus-sms
   ```

2. **Subscribe endpoint:**
   ```bash
   aws sns subscribe \
     --topic-arn arn:aws:sns:region:account:teleplus-sms \
     --protocol https \
     --notification-endpoint https://your-app-domain.com/api/notifications/sms
   ```

3. **AWS will send a subscription confirmation** — the app automatically handles this

### Using Any Custom SMS Service

If using a different SMS provider, POST to `/api/notifications/sms` with this JSON format:

```json
{
  "from": "+1234567890",
  "to": "+0987654321",
  "message": "Hello from SMS!",
  "messageId": "unique-message-id-123",
  "timestamp": 1234567890000,
  "service": "custom"
}
```

## API Endpoints

### POST /api/notifications/sms
**Receive incoming SMS notifications**

Request:
```json
{
  "from": "+1234567890",
  "to": "+0987654321",
  "message": "Message content",
  "messageId": "msg-123"
}
```

Response:
```json
{
  "success": true,
  "message": "SMS notification received",
  "notification": { /* echo of the notification */ }
}
```

### GET /api/notifications/sms?phone=+1234567890
**Retrieve pending SMS notifications** (for testing)

Response:
```json
{
  "phoneNumber": "+1234567890",
  "notificationCount": 2,
  "notifications": [
    {
      "from": "+1111111111",
      "message": "Hi there!",
      "timestamp": 1234567890000
    }
  ]
}
```

### DELETE /api/notifications/sms?phone=+1234567890
**Clear notifications for a phone number** (for testing)

## Real-Time Chat API

### GET /api/chat/stream?userId={userId}
**Connect to real-time chat stream**

```javascript
const eventSource = new EventSource(`/api/chat/stream?userId=${userId}`);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('New message:', data);
};

eventSource.onerror = () => {
  console.log('Connection closed');
};
```

### POST /api/chat/stream
**Send a real-time message**

Request:
```json
{
  "conversationId": "conv-123",
  "senderId": "user-123",
  "senderName": "John Doe",
  "message": "Hello!",
  "recipientUserIds": ["user-456", "user-789"]
}
```

Response:
```json
{
  "success": true,
  "message": "Message sent"
}
```

## Using the Real-Time Chat Hook

```typescript
import { useRealtimeChat, sendRealtimeMessage } from '@/hooks/use-realtime-chat'

function ChatComponent() {
  const { isConnected } = useRealtimeChat({
    userId: 'current-user-id',
    onMessage: (data) => {
      if (data.type === 'message') {
        console.log('Received:', data.message)
      }
    },
    enabled: true,
  })

  const handleSend = async () => {
    await sendRealtimeMessage({
      conversationId: 'conv-123',
      senderId: 'current-user-id',
      senderName: 'You',
      message: 'Hello!',
      recipientUserIds: ['recipient-id'],
    })
  }

  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <button onClick={handleSend}>Send</button>
    </div>
  )
}
```

## SMS Workflow

1. **User receives SMS** → Sent to `/api/notifications/sms`
2. **Backend processes** → Extracts sender phone number
3. **App polls** → Every 5 seconds checks for new SMS
4. **Creates conversation** → If first time from this sender
5. **Displays notification** → Message appears in chat list
6. **User can reply** → Send SMS back through the app

## Testing Locally

To test SMS functionality without a real SMS service:

1. **Simulate incoming SMS:**
   ```bash
   curl -X POST http://localhost:3000/api/notifications/sms \
     -H "Content-Type: application/json" \
     -d '{
       "from": "+1234567890",
       "to": "+9876543210",
       "message": "Test message",
       "messageId": "test-123"
     }'
   ```

2. **Check notifications:**
   ```bash
   curl "http://localhost:3000/api/notifications/sms?phone=%2B9876543210"
   ```

3. **Set your phone number** in the Profile screen to: `+9876543210`

4. **Notifications will appear** in the chat list automatically

## Features

✅ Automatic SMS polling (every 5 seconds)
✅ Creates conversations from SMS senders
✅ Displays SMS in real-time
✅ Works offline (queues messages)
✅ Multiple SMS service support
✅ Real-time live chat with WebSocket-like experience
✅ Group conversations
✅ Media sharing
✅ Meeting room invites

## Deployment Notes

### Vercel Deployment

1. **Add environment variables** if needed for SMS service
2. **Enable serverless functions** (default on Vercel)
3. **Configure webhook URLs** in your SMS service to use:
   ```
   https://your-app.vercel.app/api/notifications/sms
   ```

### Self-Hosted Deployment

1. Ensure Node.js 18+ is running
2. SMS webhook endpoint must be publicly accessible
3. For production, consider:
   - Using a database instead of in-memory storage
   - Implementing message persistence
   - Adding authentication to webhook endpoints
   - Using Redis for connection management

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SMS not appearing | Check phone number is set in Profile |
| Slow notifications | Reduce polling interval in context (currently 5s) |
| Messages disappearing | Notifications are stored in memory; refresh clears them |
| Webhook failures | Check your SMS service logs; ensure URL is public |

## Future Enhancements

- WebSocket instead of SSE for lower latency
- Database persistence for SMS history
- SMS delivery confirmations
- MMS (multimedia messaging) support
- End-to-end encryption
- Message read receipts
