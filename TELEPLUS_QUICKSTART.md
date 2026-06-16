# Teleplus Quick Start Guide

## What is Teleplus?

Teleplus is an all-in-one messaging platform combining WhatsApp, Telegram, IMO, and Messenger features:

✅ **Live Chatting** - Real-time one-on-one and group messaging
✅ **SMS Notifications** - Receive SMS directly in the app when someone texts your phone
✅ **Video/Audio Calls** - Direct communication with contacts
✅ **Group Meetings** - Video meetings with shareable invite links
✅ **Media Sharing** - Share photos, videos, and files instantly
✅ **User Profiles** - Customize your profile with name, status, and phone number

---

## Getting Started (5 minutes)

### Step 1: Create Your Profile
1. Open the app
2. Click on the **Profile** button (top right)
3. Enter your information:
   - **Display name** - Your name in the app
   - **Phone number** - To receive SMS notifications (optional but recommended)
   - **Status** - Your current status
   - **Avatar color** - Choose your favorite color
4. Click **Save profile**

### Step 2: Add a Contact (Direct Message)
1. Go to the **Chats** tab
2. Click the **+ Chat** button
3. Enter contact name and phone number
4. Click **Create chat**
5. Start messaging!

### Step 3: Create a Group
1. Go to the **Chats** tab
2. Click the **+ Group** button
3. Enter group name
4. Add participant names (comma-separated)
5. Click **Create group**
6. Group created! Share the group code with others

### Step 4: Join a Group
1. Go to the **Rooms** tab
2. Click **Join a meeting**
3. Enter the group/room code
4. Click **Join**

---

## Features Explained

### Live Chatting
- Send and receive messages instantly
- Messages appear in real-time
- Support for text, photos, videos, and files

### SMS Notifications
1. Set your phone number in Profile
2. When someone texts you, the message automatically appears in the app
3. A new conversation is created if needed
4. Works even when app is closed (if notifications are enabled)

**Setup SMS Service:**
- Twilio, Vonage, AWS SNS, or any custom SMS service
- See `SMS_INTEGRATION_GUIDE.md` for detailed setup

### Direct Messages
- Private one-on-one conversations
- Phone number visible in chat header
- Can be SMS notifications or app messages

### Group Chats
- Multiple participants in one conversation
- See all group members
- Shared media and files
- Group code for inviting others

### Meeting Rooms
- Create video/audio meeting spaces
- Generate invite code for sharing
- Room code is sharable via QR or link
- Join rooms using codes

### Media Sharing
- **Photos** - Share from camera or gallery
- **Videos** - Record or upload video files
- **Files** - Share documents, audio, anything

Click the attachment icons at bottom of chat to add media.

### Invite Links
- **Group chat link:** Share room codes to invite people
- **Format:** `?join=ABCD1234` (auto-joins when clicked)
- **QR Code:** Generate QR code from room code
- **Copy link:** Easy sharing via messaging apps

---

## Common Tasks

### How to Start a New Chat?
1. **Chats tab** → **+ Chat button**
2. Enter name and phone number (optional)
3. Start messaging

### How to Add Someone to a Group?
Groups are created with participants. To add more:
1. Create a new group with additional members
2. Or share the group code for them to join

### How to Share a Photo?
1. Open chat
2. Click **Photo icon** (image button)
3. Select photo from device
4. Click **Send**

### How to Join Someone's Meeting?
1. Get the **room code** from the host
2. Go to **Rooms tab** → **Join a meeting**
3. Enter code
4. Click **Join**
5. You're in! Can now voice/video chat

### How to Share a Meeting Link?
1. Create a **Meeting Room** in Rooms tab
2. Copy the **room code**
3. Share the code or QR code
4. Others enter the code in **Join a meeting**

### How to Set Status?
1. Open **Profile**
2. Edit **Status** field
3. Click **Save profile**

---

## Tips & Tricks

💡 **Stay Online** - Always check Profile to set phone number for SMS
💡 **Room Codes** - 6-character codes are easily shareable
💡 **Direct Messages** - Phone numbers help organize SMS conversations
💡 **Media** - Photos/videos compress automatically
💡 **Offline** - Messages are saved locally and sync when online
💡 **Privacy** - All data stored locally on your device

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| SMS not appearing | Check phone number is set in Profile, wait 5 seconds |
| Chat not loading | Refresh the app or check internet connection |
| Can't join meeting | Make sure room code is correct (case-insensitive) |
| Media not uploading | Check file size, try again or use smaller file |
| Message not sending | Check text isn't empty, internet is connected |

---

## SMS Integration (Advanced)

To receive real SMS messages in Teleplus:

### Option 1: Twilio (Easiest)
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get a phone number
3. Configure webhook: `your-app.vercel.app/api/notifications/sms`
4. Send SMS to your Twilio number → appears in app

### Option 2: Vonage/Nexmo
1. Sign up at [vonage.com](https://www.vonage.com)
2. Get a phone number
3. Configure webhook: `your-app.vercel.app/api/notifications/sms`
4. Send SMS → appears in app

### Option 3: AWS SNS
- Configure AWS to send SMS to webhook
- See `SMS_INTEGRATION_GUIDE.md`

---

## API Reference

### SMS Endpoint
```
POST /api/notifications/sms
{
  "from": "+1234567890",
  "to": "+0987654321",
  "message": "Hello!",
  "messageId": "msg-123"
}
```

### Real-Time Chat
```
GET /api/chat/stream?userId=user123
POST /api/chat/stream (send real-time message)
```

See `SMS_INTEGRATION_GUIDE.md` for full API docs.

---

## Deployment

### Deploy to Vercel
```bash
npm install
npm run build
npx vercel
```

### Configure SMS Webhook
- Update SMS service webhook to: `https://your-app.vercel.app/api/notifications/sms`
- Test by sending SMS to your number

---

## What's Next?

✨ **Features coming soon:**
- WebSocket for ultra-low-latency chat
- Database persistence (never lose messages)
- Message search
- Read receipts
- Typing indicators
- Voice messages
- Video calls
- End-to-end encryption

---

**Made with ❤️ using Next.js, React, and Tailwind CSS**

For more details, see `SMS_INTEGRATION_GUIDE.md`
