# Tejaswini & Dhanesh — Wedding RSVP

A responsive Next.js wedding invitation and RSVP website. The existing design, copy, event details, photos, and RSVP form have been preserved. The RSVP API now sends email through Gmail SMTP using Nodemailer; it does not use a paid email API.

## Free email setup (Gmail)

Email delivery has no per-email service charge when you use a Gmail account within Google's limits. You need access to a Gmail account and must create an App Password:

1. Sign in to the Gmail account that will send RSVP notifications.
2. Enable **2-Step Verification** in that Google account.
3. Create an **App Password** from Google Account → Security → App passwords. Google may not show this option for every account or account type.
4. Copy the generated 16-character app password. Do not use your normal Gmail password.
5. Copy `.env.example` to `.env.local` and fill in the values:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-16-character-google-app-password
RSVP_TO_EMAIL=dhanesh.awate@gmail.com
```

`SMTP_USER` is the Gmail account used to send the notification. `RSVP_TO_EMAIL` is where you receive RSVP notifications. Keep `.env.local` private and never add credentials to client-side code or commit them to Git.

## Run locally

Requires Node.js 20.9 or later.

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Gmail App Password
npm run dev
```

Open http://localhost:3000 and submit a test RSVP. Confirm that the email arrives at `dhanesh.awate@gmail.com` before sharing the site.

## Free deployment

You can deploy the Next.js project on Vercel's Hobby plan for a personal wedding invitation site, subject to its current usage limits and terms. Import the project from GitHub, then add the five environment variables above under Project → Settings → Environment Variables and redeploy. Do not upload `.env.local` to GitHub.

Free plans and provider policies can change. Gmail has sending limits and may temporarily block unusual activity; this is intended for a small, personal event and is not a bulk-mail service. Your hosting provider must permit outbound SMTP connections. If the deployment platform blocks SMTP, this Gmail SMTP method will not work there; do not silently treat the on-screen form response as proof of delivery. Check the deployment's function logs and test a real email after every production deployment.

## What the RSVP endpoint does

- Server-side validation for guest count, selected events, email, and phone.
- Honeypot field to catch basic automated spam.
- A small per-instance request limit to reduce repeated submissions.
- Escapes guest-provided text before rendering the notification email.
- Sends the notification to `dhanesh.awate@gmail.com` and sets the guest's email as reply-to when provided.
- Does not persist RSVP records in a database; the email is the notification/record.

The in-memory request limit is best-effort and resets when a serverless instance restarts; it is not a substitute for a shared, persistent rate-limit service. For a small private event this keeps the stack free and simple, but no public endpoint can be guaranteed spam-proof without additional infrastructure.

## Project

- `app/page.tsx` — invitation and existing RSVP form
- `app/globals.css` — existing visual styling
- `app/api/rsvp/route.ts` — server-side validation and Gmail SMTP delivery
- `public/images/` — original project photos
