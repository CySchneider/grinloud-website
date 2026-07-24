# GRINLOUD — Brand Tokens v1.0
> Kompakte Referenz für Claude. Immer aktuell halten wenn sich etwas ändert.

---

## Identity

**Brand:** GRINLOUD
**Betreiber:** Isuntu GmbH (Cy / Cyrill Schneider)
**Website:** grinloud.com (Cloudflare Pages, static HTML)
**Instagram:** @grinloud
**Typ:** Lifestyle Movement / Brand

**Mantra (Reihenfolge wichtig):**
> Be you. Feel good. Go for it.

**Tagline:** spread good vibes

**Persönlichkeit:** Laut & provokativ · Verspielt & energetisch
**Nie:** Passiv, negativ, belehrend, sarkastisch, pastell, Stockfotos

---

## Logo

### Varianten (Priorität)
1. **Primär:** Yellow Smiley + Schriftzug auf Hot Pink
2. **Sekundär:** Yellow Smiley + Schriftzug auf Black
3. **Tertiär:** Pink Smiley auf White (Icon-only)
4. **Schriftzug-only:** SVG auf transparentem Hintergrund

### Wichtige Regeln
- Schriftzug = **proprietärer SVG-Pfad** — nie durch Bungee oder anderen Font ersetzen
- Dateien: `Logo_GRINLOUD_Smiley_Yellow.svg`, `Logo_GRINLOUD_Smiley_Pink.svg`, `GRINLOUD-Schriftzug.svg`
- Smiley-only erlaubt als Icon (Favicon, App, Sticker) — Mindestgrösse 24px
- Kein Verzerren, Rotieren, Recolouring ausserhalb Palette

### GRINLOUD in Text (Bungee)
- Im Fliesstext / UI: `GRINLOUD` in Bungee, GRIN und LOUD dürfen unterschiedliche Farben haben
- Beispiel auf Pink: GRIN=#FFE600, LOUD=#0A0A0A
- Beispiel auf Black: GRIN=#FFE600, LOUD=#FF0090
- Beispiel auf Hell: GRIN=#FF0090, LOUD=#0A0A0A

---

## Farben

| Name     | Hex     | RGB              | Einsatz                          |
|----------|---------|------------------|----------------------------------|
| Hot Pink | #FF0090 | 255 · 0 · 144    | Primärfarbe, Hintergründe, Akzente |
| Yellow   | #FFE600 | 255 · 230 · 0    | Logo, Headlines, CTA             |
| Black    | #0A0A0A | 10 · 10 · 10     | Hintergründe, Text, Konturen     |
| White    | #FFFFFF | 255 · 255 · 255  | Hintergründe, helle Flächen      |

### Erlaubte Kombinationen
- Pink bg + Yellow text ✓
- Black bg + Yellow text ✓
- Yellow bg + Black text ✓
- Pink bg + Black text ✓
- Black bg + Pink text ✓
- White bg + Pink text ✓

---

## Typografie

### Display / Headlines
- **Font:** Bungee (Google Fonts, Weight 400)
- **Import:** `https://fonts.googleapis.com/css2?family=Bungee`
- **CSS:** `font-family: 'Bungee', sans-serif;`
- **Einsatz:** Alle Headlines, Poster, Ticker, Mantra, Buttons, Hero-Texte
- **Nie:** Fliesstext, lange Lesestrecken

### Body / UI
- **Font:** DM Sans (Google Fonts)
- **Import:** `https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500`
- **CSS:** `font-family: 'DM Sans', sans-serif;`
- **Gewichte:** 300 Fliesstext · 400 Highlight · 500 Labels/Tags
- **Einsatz:** Website-Text, Captions, Bio, UI

---

## Motion

| Element          | Wert                    | Notiz                              |
|------------------|-------------------------|------------------------------------|
| Animationen      | ease-out · 0.3–0.8s     | Immer fadeUp (unten nach oben)     |
| Ticker / Loop    | linear · 16–22s         | Signature-Element, alle Medien     |
| Smiley-Rotation  | linear · 12s · infinite | Rotierender Ring, subtil           |

---

## Sound Identity

- **Genre:** Progressive House · Bass House · Electronic Anthem
- **BPM:** 124–132
- **Energie:** Uplifting, emotional, treibend — nie aggressiv
- **Vocals:** Melodisch, klar — Cy One Voice (Suno)
- **Artist:** Cy Schneider (@cyslowdown auf Suno)
- **Referenz-Song:** Sunshine Ready by Cy Schneider
- **Suno Style-Prompt:** `Progressive House, Bass House, Melodic Electronic, Uplifting Anthem, Driving 128 BPM, Deep Warm Bassline, Lush Emotional Synths, Clean Male Vocals, Cy One Voice, Euphoric Drop, Melancholic Verse, Swedish House Influence, Studio Production, No Crowd Sounds`

---

## Stimme & Ton

**GRINLOUD spricht so:**
- Direkt, kurz, auf den Punkt
- Motivierend ohne zu belehren
- Einladend statt fordernd
- Positiv ohne naiv zu sein
- Englisch als Hauptsprache

**GRINLOUD sagt nie:**
- "Chill", "entspann dich", "stress dich nicht"
- Negativität, Sarkasmus, Ironie
- Corporate-Speak oder Buzzwords
- Generische Motivations-Floskeln

**Gute Beispiele:**
- "Dream big. Start small. Go hard."
- "Every small win matters. Celebrate them all — then want more."
- "Spread love like it costs nothing. Because it doesn't."

---

## Manifesto (vollständig)

```
You only get one life.
Not a rehearsal. Not a draft.
This is it. Right now.

So feel it.
Feel good. Be loud about it.
Be exactly who you are — unapologetically, undeniably you.

In a world that never stops scrolling,
it's easy to miss yourself.
Take a breath. Feel the music. Feel yourself.
Figure out what makes you tick.
That's where it starts.

Set your goals.
Not because someone told you to.
Because you want to look back and grin.
Dream big. Start small. Go hard.
Every step forward counts. Every small win matters.
Celebrate them all — then want more.

Spread love like it costs nothing — because it doesn't.
Be kind. Be real. Be humble.
Think of others. Leave people better than you found them.
Be the person people remember for all the right reasons.
Do good. Put it out there.
What goes around comes around — always.

Show up with energy.
Give energy. Get energy back.
Nothing is handed to you — but with the right attitude,
the right mindset, the right fire inside,
you become unstoppable.
That energy is contagious. That aura opens doors.
Go after things. Proactively. Boldly. Now.

Let the music guide you.
Ride the wave of bass and groove.
Let a track lift you, move you, carry you forward.
Dance or chill — however you feel it.
Just be present for it.
Loud doesn't mean lost.

GRINLOUD is not a brand.
It's a decision.

Be you. Feel good. Go for it.
```

---

## Website

- **URL:** grinloud.com
- **Hosting:** Cloudflare Pages
- **Stack:** Static HTML (index.html + manifesto.html)
- **Fonts Website:** Bungee (Titel) + DM Sans (Body)
- **Struktur:**
  - `index.html` — Homepage (Pink Hero, Smiley SVG, Ticker, Manifesto-Teaser, Vibe-Grid)
  - `manifesto.html` — Vollständiges Manifesto (Black BG)
  - `og-image.png` — 1200×630px Social Preview
  - `logo-grinloud.svg` — Schriftzug SVG (transparent)

---

## Signature Design-Elemente

1. **Ticker / Tape** — gelber oder schwarzer horizontaler Endlostext
2. **Rotierender Smiley-Ring** — gestrichelter Kreis um den Smiley
3. **Vibe-Grid** — Farb-Kacheln mit Mantra-Worten (Yellow/Pink/Black wechselnd)
4. **Drop Shadow Text** — Bungee-Text mit 4–6px Offset-Shadow in Black auf Yellow

---

## Content-Säulen

1. **Mantra & Mindset** — animierte Reels/Poster, Manifesto-Lines
2. **Music & Energy** — Playlists (Apple Music/Spotify via Beatport), Release-Spotlights (House/Tech House/Bass House), DJ-Features
3. **Lifestyle & Community** — spread love, small wins, authentische Menschen-Momente

---

## Cy Schneider (der Mensch hinter GRINLOUD)

- Cy ist sichtbar aber dezent — GRINLOUD ist die Hauptfigur
- Musik-Releases unter "Cy Schneider" auf Apple Music / Spotify
- Suno-Account: @cyslowdown
- bio.site: bio.site/cy.schneider
- Instagram (persönlich): @journal.of.cy
- Stimme: kuratierend, geschmackssicher, nicht Ego-Content

---

*Zuletzt aktualisiert: April 2026 — v1.0*
