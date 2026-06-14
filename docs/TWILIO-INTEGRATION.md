# Twilio Integration Guide

## Prerequisites

- A [Twilio account](https://www.twilio.com/try-twilio) (free trial works)
- At least one Twilio phone number with SMS capability

## Step 1: Get Credentials

1. Go to [Twilio Console](https://console.twilio.com)
2. Copy your **Account SID** and **Auth Token** from the dashboard

## Step 2: Enter Credentials in TwilioHub

1. Log in to TwilioHub
2. Go to **Settings → Twilio Credentials**
3. Enter your Account SID and Auth Token
4. Click **Test Connection** to verify

## Step 3: Sync Phone Numbers

1. After successfully connecting, click **Sync Phone Numbers**
2. Your Twilio phone numbers will be imported
3. Webhooks will be automatically configured on each number

## Step 4: Browser Calling (Softphone)

For browser-based calling, you need additional credentials:

### Create an API Key

1. In Twilio Console → Account → API Keys & Tokens
2. Click **Create API Key** → Standard
3. Copy the **SID** (API Key SID) and **Secret**
4. Enter these in TwilioHub → Settings → Twilio Credentials

### Create a TwiML App

1. In Twilio Console → Phone Numbers → Manage → TwiML Apps
2. Click **Create new TwiML App**
3. Set **Voice Request URL** to: `https://your-domain.com/api/webhooks/twilio/voice`
4. Copy the **TwiML App SID**
5. Enter it in TwilioHub → Settings → Twilio Credentials

## Webhook URLs

TwilioHub automatically configures these webhooks on your phone numbers:

| Event | URL |
|-------|-----|
| Incoming SMS | `https://your-domain.com/api/webhooks/twilio/sms/incoming` |
| SMS Status Callback | `https://your-domain.com/api/webhooks/twilio/sms/status` |
| Incoming Voice | `https://your-domain.com/api/webhooks/twilio/voice` |
| Voice Status Callback | `https://your-domain.com/api/webhooks/twilio/voice/status` |

## Troubleshooting

**"Unable to connect to Twilio"**
- Check that your Account SID and Auth Token are correct
- Ensure your Twilio account is active and not suspended

**SMS not delivered**
- Verify the phone number has SMS capability
- Check the Twilio Console error logs
- For US numbers, ensure A2P 10DLC registration if required

**Browser calling not working**
- Ensure you've created an API Key and TwiML App
- Check browser microphone permissions
- The TwiML App Voice URL must match your deployment URL exactly

**Webhooks failing**
- Your TwilioHub instance must be publicly accessible
- The URL cannot be `localhost` — use a real domain or ngrok for development

## Local Development with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 80

# Use the ngrok URL (e.g. https://abc123.ngrok.io) as APP_URL in .env
# Re-sync phone numbers after changing APP_URL
```
