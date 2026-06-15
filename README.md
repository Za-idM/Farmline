# Kisan Helpline 🌾

AI-powered farmer helpline — farmers call a number, an AI voice answers their farming queries in 11 Indian languages.

Built for hackathons. **Runs completely free.**

## Stack

- **Next.js 14** (App Router) — website + dashboard
- **Twilio** — phone number + inbound call handling (free trial: 75 min)
- **Sarvam AI** — STT + LLM + TTS in Indian languages (free credits on signup)
- **SQLite + Prisma 7** — call records, transcripts, summaries
- **Vercel** — free hosting with public HTTPS URL

---

## How a call works

```
Farmer calls Twilio number
  → Twilio hits /api/twilio/webhook
  → AI greets farmer in Hindi
  → Farmer speaks their question
  → Twilio hits /api/twilio/gather with transcript
  → Sarvam LLM generates farming answer (FREE - no token cost)
  → Answer spoken back to farmer via Sarvam TTS
  → Full transcript + AI summary saved to DB
  → Visible on dashboard at /dashboard
```

---

## Free Tier Limits (Hackathon)

| Service | Free Amount | Notes |
|---|---|---|
| Twilio | 75 voice minutes | No credit card needed |
| Twilio phone number | 1 free number | Provisioned on signup |
| Twilio trial restriction | Verified numbers only | Verify judge phones before demo |
| Sarvam LLM | Completely free | No token charges |
| Sarvam STT | ₹100–₹1,000 credits | ~65–650 calls free |
| Sarvam TTS | Included in credits | Bulbul v3 voices |
| Vercel hosting | Free tier | Perfect for Next.js |

---

## Setup Guide

### Step 1 — Clone and install

```bash
git clone <your-repo>
cd farmer-helpline
npm install
```

### Step 2 — Get your Sarvam AI key (free)

1. Go to [dashboard.sarvam.ai](https://dashboard.sarvam.ai)
2. Sign up with your email
3. You get ₹100–₹1,000 free credits automatically
4. Go to **API Keys** → create a key
5. Copy it — you'll need it in Step 5

### Step 3 — Get your Twilio credentials (free)

1. Go to [twilio.com](https://twilio.com) → **Sign up free** (no credit card)
2. Complete phone verification
3. In the Twilio Console dashboard, note down:
   - **Account SID** (starts with `AC...`)
   - **Auth Token**
4. Go to **Phone Numbers → Manage → Buy a number**
   - Search for a number, select any available one
   - It's free on trial
5. Note down the phone number

> **Trial restriction:** Twilio trial only allows calls from verified numbers.
> Go to **Phone Numbers → Verified Caller IDs** and add the phone numbers
> of anyone who will call during your demo (your phone, judges' phones).

### Step 4 — Deploy to Vercel (free)

Twilio needs a public HTTPS URL to send webhooks to. Vercel provides this for free.

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add environment variables (from Step 5 below) in Vercel's project settings
4. Deploy — Vercel gives you a URL like `https://farmer-helpline.vercel.app`

> **For local testing instead:** Install ngrok and run `ngrok http 3000`
> to get a temporary public URL. Free ngrok works fine for demos.

### Step 5 — Configure environment variables

Edit `.env` (locally) or add in Vercel dashboard:

```env
DATABASE_URL="file:./dev.db"

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

SARVAM_API_KEY=your_sarvam_api_key_here

NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

### Step 6 — Set up the database

```bash
npx prisma migrate dev
npx prisma generate
```

### Step 7 — Connect Twilio to your deployed URL

1. In Twilio Console → **Phone Numbers → Manage → Active Numbers**
2. Click your number
3. Under **Voice Configuration**:
   - **A call comes in:** Webhook → `https://your-vercel-url.vercel.app/api/twilio/webhook`
   - **Call status changes:** `https://your-vercel-url.vercel.app/api/twilio/status`
4. Save

### Step 8 — Test it

Call your Twilio number from a verified phone. The AI will greet you in Hindi and answer farming questions.

Open `https://your-vercel-url.vercel.app/dashboard` to see the call appear in real time.

---

## Local Development

```bash
npm run dev          # Start dev server at localhost:3000
npm run seed         # Load demo call data
npm run db:clear     # Wipe all call records
```

---

## Dashboard Features

- **Stats** — total calls, completed, in-progress, avg duration
- **Call table** — all calls with status, language, duration, summary
- **View** — full transcript in chat format + AI summary
- **Edit** — update summary or language on any call
- **Delete** — remove individual call records
- **Clear All** — wipe all records at once
- **Auto-refresh** — updates every 30 seconds

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/twilio/webhook` | POST | Twilio inbound call handler |
| `/api/twilio/gather` | POST | Processes farmer speech, returns AI answer |
| `/api/twilio/status` | POST | Twilio call status callback |
| `/api/calls` | GET | List all calls (paginated, filterable) |
| `/api/calls/[id]` | GET | Single call with transcript |
| `/api/calls/[id]` | PATCH | Edit summary / language |
| `/api/calls/[id]` | DELETE | Delete a call record |
| `/api/calls/clear` | DELETE | Delete all call records |
| `/api/stats` | GET | Dashboard stats |

---

## Supported Languages

| Code | Language |
|---|---|
| hi-IN | Hindi |
| ta-IN | Tamil |
| te-IN | Telugu |
| kn-IN | Kannada |
| ml-IN | Malayalam |
| bn-IN | Bengali |
| mr-IN | Marathi |
| gu-IN | Gujarati |
| pa-IN | Punjabi |
| or-IN | Odia |
| en-IN | English (Indian) |

---
