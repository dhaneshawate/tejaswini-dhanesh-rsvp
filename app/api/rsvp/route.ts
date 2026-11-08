import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedEvents = new Set(["haldi", "wedding"]);
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

type RSVPBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  guests?: unknown;
  events?: unknown;
  allergyNotes?: unknown;
  message?: unknown;
  website?: unknown;
};

function clean(value: unknown, max = 1000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    };
    return entities[character];
  });
}

function getRateLimitKey(request: Request): string {
  // Use the first forwarded IP supplied by the hosting platform.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  for (const [storedKey, entry] of rateLimit) {
    if (entry.resetAt <= now) rateLimit.delete(storedKey);
  }
  const current = rateLimit.get(key);
  if (!current || current.resetAt <= now) {
    rateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (current.count >= MAX_REQUESTS) return true;
  current.count += 1;
  return false;
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 20_000) {
      return NextResponse.json({ error: "Your RSVP is too large. Please shorten your message and try again." }, { status: 413 });
    }

    if (isRateLimited(getRateLimitKey(request))) {
      return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
    }

    const body = (await request.json()) as RSVPBody;
    // Honeypot: return a generic success to automated form spam.
    if (clean(body.website, 200)) return NextResponse.json({ ok: true });

    const name = clean(body.name, 120);
    const email = clean(body.email, 254);
    const phone = clean(body.phone, 30);
    const allergyNotes = clean(body.allergyNotes, 1000);
    const message = clean(body.message, 1000);
    const guests = Number(body.guests);
    const rawEvents = Array.isArray(body.events) ? body.events : [];
    const events = rawEvents.filter((event): event is string => typeof event === "string" && allowedEvents.has(event));

    if (name.length < 2) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }
    if (!Number.isInteger(guests) || guests < 1 || guests > 10) {
      return NextResponse.json({ error: "Please choose between 1 and 10 guests." }, { status: 400 });
    }
    if (events.length === 0 || events.length !== rawEvents.length || new Set(events).size !== events.length) {
      return NextResponse.json({ error: "Please select at least one valid event." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please check the email address you entered." }, { status: 400 });
    }
    if (phone && !/^[+()\d\s.-]{7,30}$/.test(phone)) {
      return NextResponse.json({ error: "Please check the phone number you entered." }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS?.replace(/\s/g, "");
    const to = process.env.RSVP_TO_EMAIL || "dhanesh.awate@gmail.com";
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = process.env.SMTP_SECURE !== "false";

    if (!smtpUser || !smtpPass || !to || !Number.isInteger(port) || port < 1 || port > 65535) {
      return NextResponse.json(
        { error: "RSVP email is not configured yet. Please contact the couple directly." },
        { status: 503 }
      );
    }

    const eventLabels = events.map((event) =>
      event === "haldi"
        ? "Haldi & Dance — 10 February 2027, 6:00 PM onwards"
        : "Wedding Ceremony — 11 February 2027, 12:22 PM noon"
    );

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });

    const safeName = escapeHtml(name);
    const html = `
      <div style="font-family:Arial,sans-serif;color:#34232a;line-height:1.6;max-width:640px;margin:auto">
        <h2 style="color:#702b43">New wedding RSVP</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${escapeHtml(email || "Not provided")}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
        <p><strong>Total guests (including respondent):</strong> ${guests}</p>
        <p><strong>Events attending:</strong></p>
        <ul>${eventLabels.map((label) => `<li>${escapeHtml(label)}</li>`).join("")}</ul>
        <p><strong>Food allergies / dietary notes:</strong><br>${escapeHtml(allergyNotes || "None provided").replace(/\n/g, "<br>")}</p>
        <p><strong>Message:</strong><br>${escapeHtml(message || "None").replace(/\n/g, "<br>")}</p>
      </div>`;

    await transporter.sendMail({
      from: `Wedding RSVP <${smtpUser}>`,
      to,
      replyTo: email || undefined,
      subject: `Wedding RSVP: ${name} (${guests} ${guests === 1 ? "guest" : "guests"})`,
      text: [
        "NEW WEDDING RSVP", "", `Name: ${name}`, `Email: ${email || "Not provided"}`,
        `Phone: ${phone || "Not provided"}`, `Total guests (including respondent): ${guests}`,
        "", "Events attending:", ...eventLabels.map((label) => `- ${label}`), "",
        `Food allergies / dietary notes: ${allergyNotes || "None provided"}`,
        `Message for the couple: ${message || "None"}`,
      ].join("\n"),
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Avoid logging RSVP content or credentials.
    console.error("RSVP email delivery failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "We couldn’t send your RSVP just now. Please try again in a moment or contact the couple directly." },
      { status: 502 }
    );
  }
}
