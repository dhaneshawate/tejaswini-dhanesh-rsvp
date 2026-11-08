"use client";

import { FormEvent, useEffect, useState } from "react";

const events = [
  { id: "haldi", day: "DAY ONE · WEDNESDAY", date: "10 February 2027", title: "Haldi (Turmeric ceremony)", time: "6:00 PM onwards", description: "A sunshine-filled evening of haldi, music, dancing and happy chaos.", dress: "Yellow & Pastel Yellow (Indian Traditional)", symbol: "✺" },
  { id: "wedding", day: "DAY TWO · THURSDAY", date: "11 February 2027", title: "Wedding Ceremony", time: "12:22 PM noon", description: "Join us as we begin our forever, surrounded by the people we love.", dress: "Indian Festive / Traditional", symbol: "❋" }
];

type RSVPResponse = { ok?: boolean; error?: string };

export default function Home() {
  const [selected, setSelected] = useState<string[]>(["haldi", "wedding"]);
  const [guests, setGuests] = useState("1");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date("2027-02-11T12:22:00+05:30").getTime();
    setDaysLeft(Math.max(0, Math.ceil((target - Date.now()) / 86400000)));
  }, []);

  function toggleEvent(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function submitRSVP(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      guests: Number(data.get("guests") || 1),
      events: selected,
      allergyNotes: String(data.get("allergyNotes") || ""),
      message: String(data.get("message") || ""),
      website: String(data.get("website") || "")
    };

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as RSVPResponse;
      if (!response.ok || !result.ok) throw new Error(result.error || "We couldn't send your RSVP. Please try again.");
      setStatus("success");
      form.reset();
      setSelected(["haldi", "wedding"]);
      setGuests("1");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <main>
      <nav className="nav-shell" aria-label="Main navigation">
        <a className="wordmark" href="#home">T <span>&</span> D</a>
        <div className="nav-links">
          <a href="#celebrations">Celebrations</a>
          <a href="#story">Our story</a>
          <a href="#venue">Venue</a>
          <a className="nav-rsvp" href="#rsvp">RSVP <span>↗</span></a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-photo" role="img" aria-label="Tejaswini and Dhanesh together outdoors" />
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow light">A CELEBRATION OF LOVE</p>
          <p className="hero-intro">With full hearts and joyful anticipation,</p>
          <h1>Tejaswini <br /><span>&</span><br />Dhanesh</h1>
          <div className="ornament"><i /> <span>❦</span> <i /></div>
          <p className="hero-date">10 — 11 FEBRUARY 2027</p>
          <p className="hero-copy">Two families, countless blessings,<br />and the beginning of our forever.</p>
          <a href="#rsvp" className="button button-light">Kindly RSVP <span>↗</span></a>
        </div>
        <div className="hero-vertical">THE WEDDING CELEBRATION</div>
        <a className="scroll-cue" href="#welcome"><span /> SCROLL TO EXPLORE</a>
      </section>

      <section className="welcome section-pad" id="welcome">
        <p className="eyebrow">SAVE THE DATES</p>
        <h2>Our favourite chapter<br /><em>starts with you.</em></h2>
        <p className="welcome-copy">The best days are made even more beautiful by the people we share them with. We would be honoured to have you with us as we celebrate our wedding.</p>
        <div className="countdown">
          <span className="countdown-number">{daysLeft === null ? "—" : daysLeft}</span>
          <span className="countdown-label">DAYS UNTIL OUR WEDDING</span>
        </div>
        <div className="welcome-flower" aria-hidden="true">❋</div>
      </section>

      <section className="events-section section-pad" id="celebrations">
        <div className="section-heading">
          <p className="eyebrow">THE WEDDING FESTIVITIES</p>
          <h2>Two days. <em>One forever.</em></h2>
          <p>Come for the rituals, stay for the dancing, and leave with memories.</p>
        </div>
        <div className="event-grid">
          {events.map((event, index) => (
            <article className={`event-card event-card-${index + 1}`} key={event.id}>
              <div className="event-image-wrap">
                <div className={`event-image event-image-${index + 1}`} role="img" aria-label={index === 0 ? "Couple portrait in festive Indian attire" : "A close and intimate wedding moment"} />
                <span className="event-number">0{index + 1}</span>
              </div>
              <div className="event-info">
                <p className="eyebrow">{event.day}</p>
                <h3>{event.title}</h3>
                <p className="event-date">{event.date}</p>
                <p className="event-time">{event.time}</p>
                <p className="event-description">{event.description}</p>
                <div className="event-meta"><span>{event.symbol}</span> <b>{event.dress}</b> </div>
                <a href="#rsvp" className="text-link">RSVP for this event <span>↗</span></a>
              </div>
            </article>
          ))}
        </div>
        {/* <p className="dress-note"><span>✦</span> Yellow & Pastel Yellow (Indian Traditional)</p> */}
      </section>

      <section className="story-section" id="story">
        <div className="story-image" role="img" aria-label="A candid moment from the couple" />
        <div className="story-copy">
          <p className="eyebrow">A LITTLE ABOUT US</p>
          <h2>Every love story<br />has its <em>own magic.</em></h2>
          <p className="placeholder-note">Your story goes here.</p>
          <p className="story-placeholder">Ten years of knowing each other. Seven years of living oceans apart. They were two separate chapters until a mutual friend’s wedding brought them back to the same page. A quiet journey home after the celebration sparked the one conversation that changed everything. On 11th February, they will step into the forever they always belonged in. They never planned this love story, but life had been writing it all along—a love that is finally finding its way home.</p>
          <span className="signature">With love, T & D</span>
        </div>
      </section>

      <section className="venue-section section-pad" id="venue">
        <div className="section-heading">
          <p className="eyebrow">WHERE IT ALL HAPPENS</p>
          <h2>Meet us in <em>Pune.</em></h2>
          <p>We can’t wait to welcome you.</p>
        </div>
        <div className="venue-card">
          <div className="venue-art">
            <span className="venue-flower">✺</span>
            <span className="venue-monogram">T <i>&</i> D</span>
            <span className="venue-art-caption">A DAY TO REMEMBER</span>
          </div>
          <div className="venue-details">
            <p className="eyebrow">OUR WEDDING VENUE</p>
            <h3>MDS Banquets & Lawns</h3>
            <p>Dadasaheb Sahasrabudhe Rd,<br />Kiwale, Ravet, Pimpri-Chinchwad,<br />Maharashtra 412101</p>
            <p className="venue-city">PUNE · MAHARASHTRA</p>
            <a className="button button-dark" href="https://www.google.com/maps/search/?api=1&query=MDS+Banquets+%26+Lawns%2C+Dadasaheb+Sahasrabudhe+Rd%2C+Kiwale%2C+Ravet%2C+Pimpri-Chinchwad%2C+Maharashtra+412101" target="_blank" rel="noreferrer">Get directions <span>↗</span></a>
          </div>
        </div>
      </section>

      <section className="schedule-strip section-pad">
        <p className="eyebrow">PLAN YOUR VISIT</p>
        <h2>A few helpful <em>details.</em></h2>
        <div className="helpful-grid">
          <article><span className="help-icon">⌖</span><h3>Getting there</h3><p>Both celebrations take place at MDS Banquets & Lawns in Kiwale, Ravet, Pune.</p><a href="https://www.google.com/maps/search/?api=1&query=MDS+Banquets+%26+Lawns+Kiwale+Ravet+Pune" target="_blank" rel="noreferrer">Open map ↗</a></article>
          <article><span className="help-icon">✧</span><h3>What to wear</h3><p>Festive Indian attire is perfect for the wedding. Yellow & Pastel Yellow (Indian Traditional) For Haldi (Turmeric ceremony)</p><a href="#celebrations">See celebrations ↗</a></article>
          <article><span className="help-icon">♡</span><h3>Food & care</h3><p>We’ll be serving vegetarian food. Please tell us about any food allergies in your RSVP.</p><a href="#rsvp">Share dietary notes ↗</a></article>
        </div>
      </section>

      <section className="rsvp-section section-pad" id="rsvp">
        <div className="rsvp-intro">
          <p className="eyebrow light">KINDLY RESPOND</p>
          <h2>Will you join<br />our <em>celebration?</em></h2>
          <p>Your presence is the most precious gift. Let us know which moments you’ll be celebrating with us.</p>
          <div className="rsvp-flower" aria-hidden="true">❋</div>
          <p className="reply-by">TEJASWINI & DHANESH · FEBRUARY 2027</p>
        </div>
        <form className="rsvp-form" onSubmit={submitRSVP}>
          {status === "success" ? (
            <div className="success-panel" role="status">
              <span className="success-icon">✓</span>
              <h3>Thank you, lovely human!</h3>
              <p>Your RSVP has been sent. We can’t wait to celebrate with you.</p>
              <button className="text-link" type="button" onClick={() => setStatus("idle")}>Submit another response ↗</button>
            </div>
          ) : (
            <>
              <div className="form-heading"><span>01</span><h3>Your details</h3></div>
              <div className="field">
                <label htmlFor="name">Full name <b>*</b></label>
                <input id="name" name="name" autoComplete="name" placeholder="Your name" required maxLength={120} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} />
                </div>
                <div className="field">
                  <label htmlFor="phone">Phone number</label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+91" maxLength={30} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="guests">Total guests attending, including you <b>*</b></label>
                <select id="guests" name="guests" value={guests} onChange={(e) => setGuests(e.target.value)} required>
                  {[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}
                </select>
              </div>
              <div className="form-heading form-heading-events"><span>02</span><h3>Which events will you attend?</h3></div>
              <p className="field-hint">Choose one or both celebrations.</p>
              <div className="event-options">
                {events.map((event) => (
                  <label className={`event-option ${selected.includes(event.id) ? "is-selected" : ""}`} key={event.id}>
                    <input type="checkbox" checked={selected.includes(event.id)} onChange={() => toggleEvent(event.id)} />
                    <span className="custom-check">{selected.includes(event.id) ? "✓" : ""}</span>
                    <span className="option-copy"><strong>{event.title}</strong><small>{event.date} · {event.time}</small></span>
                  </label>
                ))}
              </div>
              <div className="field">
                <label htmlFor="allergyNotes">Food allergies or dietary notes</label>
                <textarea id="allergyNotes" name="allergyNotes" rows={3} maxLength={1000} placeholder="We’ll be serving vegetarian food. Please share any allergies or dietary needs." />
              </div>
              <div className="field">
                <label htmlFor="message">A note for the couple <span className="optional">(optional)</span></label>
                <textarea id="message" name="message" rows={2} maxLength={1000} placeholder="A wish, a note, or just a little hello…" />
              </div>
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="website">Leave this field empty</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              {status === "error" && <p className="error-message" role="alert">{error}</p>}
              <button className="button button-dark submit-button" type="submit" disabled={status === "sending" || selected.length === 0}>
                {status === "sending" ? "Sending your RSVP…" : "Send my RSVP"} <span>↗</span>
              </button>
              {selected.length === 0 && <p className="field-hint error-inline">Please select at least one event.</p>}
              <p className="privacy-note">Your details will only be used to coordinate our wedding celebrations.</p>
            </>
          )}
        </form>
      </section>

      <footer className="footer">
        <div className="footer-monogram">T <i>&</i> D</div>
        <p>We can’t wait to celebrate with you.</p>
        <p className="footer-names">TEJASWINI & DHANESH · 10—11 FEBRUARY 2027</p>
        <a href="#home" className="back-top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
