# GRINLOUD — CoWork Master Brief
> Vollständige Referenz für Claude im CoWork-Projekt. Stand: Mai 2026.
> Dieses Dokument ersetzt jede Erklärung. Einfach ins Projekt laden und loslegen.

---

## 1. WER IST GRINLOUD

**GRINLOUD** ist eine House Music Lifestyle Brand und Bewegung, betrieben unter **Isuntu GmbH**.  
Gründer und Kurator: **Cy Schneider** (Cyrill Schneider), Basel, Schweiz.

GRINLOUD ist immer **in Grossbuchstaben** zu schreiben.

**Mantra** (Reihenfolge unveränderlich):
> Be you. Feel good. Go for it.

**Tagline:** spread good vibes

**Kern-Philosophie:** Cy ist der Mensch hinter GRINLOUD — sichtbar, aber nicht im Fokus. GRINLOUD ist die Hauptfigur.

**Persönlichkeit:** Laut & provokativ · Verspielt & energetisch · Direkt · Nie belehrend  
**Niemals:** Passiv, negativ, sarkastisch, pastell, Stockfotos, Corporate-Speak

---

## 2. BRAND IDENTITY

### Farben
| Name     | Hex     | Einsatz                              |
|----------|---------|--------------------------------------|
| Hot Pink | #FF0090 | Primärfarbe, Hintergründe, Akzente   |
| Yellow   | #FFE600 | Logo, Headlines, CTA                 |
| Black    | #0A0A0A | Hintergründe, Text                   |
| White    | #FFFFFF | Helle Flächen                        |

**Erlaubte Kombis:** Pink/Yellow ✓ · Black/Yellow ✓ · Yellow/Black ✓ · Pink/Black ✓ · Black/Pink ✓ · White/Pink ✓

### Typografie
- **Bungee** (Google Fonts) — Headlines, Poster, Ticker, Mantra, Buttons. NIE für Fliesstext.
- **DM Sans 300/400/500** (Google Fonts) — Body, Captions, UI
- **DM Mono** — Badges, Meta-Labels, Nummern

### Logo-Regeln (KRITISCH)
- Der GRINLOUD-Schriftzug ist ein **proprietärer SVG-Pfad** — niemals durch Bungee oder anderen Font ersetzen
- Logo-Dateien: `Logo_GRINLOUD_Smiley_Yellow.svg`, `Logo_GRINLOUD_Smiley_Pink.svg`, `GRINLOUD-Schriftzug.svg`
- Smiley = immer als base64 `<img>` Tag einbetten — **nie** als inline SVG manipulieren
- Kein Verzerren, Rotieren, Recolouring ausserhalb der Palette
- Yellow Smiley auf Pink BG = primäre Logo-Variante
- GRINLOUD-Charakter trägt **weisse Sneakers** — immer weiss, nie schwarz oder grau

### GRINLOUD in Text (Bungee, zweifarbig)
- Auf Pink: GRIN=#FFE600, LOUD=#0A0A0A
- Auf Black: GRIN=#FFE600, LOUD=#FF0090
- Auf Hell: GRIN=#FF0090, LOUD=#0A0A0A

### Motion
- Animationen: ease-out · 0.3–0.8s · immer fadeUp
- Ticker/Loop: linear · 16–22s · Signature-Element
- Smiley-Rotation: linear · 12s · infinite

### Signature Design-Elemente
1. **Ticker / Tape** — gelber oder schwarzer Endlostext horizontal
2. **Rotierender Smiley-Ring** — gestrichelter Kreis, subtil
3. **Vibe-Grid** — Farb-Kacheln mit Mantra-Worten (Yellow/Pink/Black)
4. **Drop Shadow Text** — Bungee mit 4–6px Offset-Shadow Black auf Yellow

---

## 3. STIMME & TON

**GRINLOUD spricht so:** Direkt · kurz · auf den Punkt · motivierend ohne zu belehren · positiv ohne naiv  
**Hauptsprache:** Englisch  
**Instagram-Signatur:** ☻ ♥ ☻ (Opener oder Closing in Captions) · einzelnes ☻ in Bio

**Gut:**
- "Dream big. Start small. Go hard."
- "Every small win matters. Celebrate them all — then want more."
- "Spread love like it costs nothing. Because it doesn't."

**Nie:** "Chill" · "entspann dich" · Negativität · Ironie · Buzzwords

---

## 4. MANIFESTO (vollständig, unveränderlich)

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

## 5. MUSIK — MUSIC RADAR SERIE

### Was ist Music Radar?
Alle 10 Tage: 10 kuratierte House-Tracks. Cy researcht und entscheidet final, Claude unterstützt mit Research und Texten.

**Output pro Radar:**
- Radar-HTML-Seite (radar-00X.html) mit Mixcloud-Embed + Trackliste + Einzeltrack-Karten
- Spotify-Playlist (manuell, da Spotify Free kein API-Zugang)
- Beatport DJ Chart (Cy published selbst)
- Instagram-Carousel-HTML (405×540px, screenshot bei 267% Zoom → 1080×1440px)

### Curation-Kriterien
**Genres (erlaubt):** House · Tech House · Bass House · Progressive House · Melodic House  
**BPM-Range:** 124–132 BPM (ideal), bis 134 ausnahmsweise  
**Ausschlusskriterien:**
- Kein Dance/Pop (auch wenn House-ähnlich)
- Kein Electro House
- BPM >135 = zu schnell
- Tracks älter als ~6 Monate vermeiden (ausser Classics mit klarem Grund)
- Green Velvet "La La Land" = zu alt, abgelehnt
- Bass House ≠ Electro — genau prüfen

**Qualitätsmerkmale:** Dancefloor-tauglich · Energie · Groove · Charakter · Mix-Kompatibilität  
**Referenz-Artists:** Dom Dolla · James Hype · Vintage Culture · John Summit · Anyma · ANOTR · Odd Mob · Chris Lorenzo · Mau P

### Bisherige Radars

**Radar 001** (22. Apr – 1. Mai 2026) · [Spotify](https://open.spotify.com/playlist/3UmKMhYsJXRqzUygP37ihw) · [Apple Music](https://music.apple.com/ch/playlist/grinloud-music-radar-001/pl.u-JNAmtzob9E) · [Beatport](https://www.beatport.com/de/chart/music-radar-001/890903)
1. James Hype — Trigger Finger
2. Tiësto & Lucas & Steve (feat. Prospa & Cloonee) — Free Your Mind
3. ANOTR & 54 Ultra — Talk To You
4. Max Styler & Vintage Culture — Freaky 1 ⭐
5. Dom Dolla & Puretone — Addicted To Bass (Relapse)
6. John Summit & The Chainsmokers — All The Time
7. Dubdogz & FEZZO & Zaark — How Does It Feel
8. Mau P — Neck
9. Max Styler & Ad-Apt (feat. Solomun) — One More
10. Omar+ & Luke Dean — Back To The 305

**Radar 002** (2.–11. Mai 2026) · Beatport Chart ebenfalls published
1. Anyma × LISA — Bad Angel
2. Armin van Buuren × Skytech — She A Freak
3. Beltran × The Flirts — Passion (R U Satisfied)
4. Chris Lorenzo × AMO — Hots 4 U
5. Odd Mob feat. Luciana — Rock The Rhythm
6. Chris Lorenzo × Kah-Lo — In This Bih'
7. Dom Dolla × Tiga — Don't Worry Baby
8. Chris Lake × ATRIP — Make You Fight
9. Noizu — Slay To The Rhythm
10. Dean Turnley — Actin' Tough

**Radar 003** (12.–21. Mai 2026) · Mixcloud: grinloud-music-radar-003
1. Deeper Purpose, Jack Orley & Michael Ekow — Stunner
2. Four Tet & Tony Romera — Baby ⭐
3. CID — Loaded Gun
4. Marco Faraone — Like That
5. RSquared & Iglesias — Let's Freak
6. Mojjo & Caique Carvalho — Mind Alert
7. Greggio — Attack
8. KC Lights — Dança
9. Layton Giordani & AR/CO — She's A Devil
10. KREAM & SCRIPT — Turn Up The Dose

**Radar 004** (ab 22. Mai 2026) · [Spotify](https://open.spotify.com/playlist/5pwS4zMbmMb9WAOQhdPLTQ)
1. Kungs & CHANEY — Addicted
2. Tony Romera — Can't Sleep *(im Mixcloud-Mix ersetzt durch: Mark Knight & James Hurr ft. Cutty Ranks — Bad Man [126 BPM, Gb Major])*
3. Volkoder & Vintage Culture — Hands Up
4. Odd Mob — Dancing Boys Dancing Girls
5. Walker & Royce / Alok — My Own Thang
6. Prospa — Don't Stop
7. Alesso & JOA — Turn Up The Bass
8. David Guetta & Marten Hørger — The Past The Present The Future
9. SIDEPIECE — Function
10. James Hype — Seratonin

**Nächstes:** Radar 005 (ca. 1. Juni 2026) — noch nicht gestartet

### Radar-Workflow (so läuft es ab)
1. Claude recherchiert ~15–20 Kandidaten via Web Search (Beatport Hot/New, Spotify Editorial, aktuelle Charts, 1001tracklists.com)
2. Cy filtert und entscheidet final die 10 Tracks
3. Claude erstellt: radar-00X.html + Instagram-Carousel-HTML + Captions
4. Cy recorded Mixcloud-Mix, verlinkt
5. Cy erstellt Spotify-Playlist manuell
6. Cy published Beatport DJ Chart

---

## 6. WEBSITE — grinloud.com

### Hosting & Deployment (KRITISCH)
- **Platform:** Cloudflare Workers Static Assets (NICHT Cloudflare Pages)
- **Account:** cyrill.schneider@gmail.com
- **Deploy-Methode:** Vollständiger ZIP-Upload — immer alle Files, nie partial update
- **Kein** `_redirects`, `_routes.json` oder `_worker.js` — nicht unterstützt
- Redirect-Shims (~120 Bytes) für alte URLs zur Rückwärtskompatibilität

### Aktuelle Dateistruktur (grinloud-v8)
```
index.html               ← Homepage (Scroll-Snap Cover-Flow)
manifesto.html           ← Vollständiges Manifesto
radar-001.html           ← Music Radar 001
radar-002.html           ← Music Radar 002
radar-003.html           ← Music Radar 003
radar-004.html           ← Music Radar 004 (ausstehend)
radar-002-instagram.html ← Instagram-Carousel Radar 002
manifesto-carousel.html  ← Manifesto-Carousel
tracks.json              ← Alle Track-Daten (30 Tracks Apr–Mai 2026)
og.jpg                   ← OG-Image (Smiley-Pattern, Pink/Yellow)
favicon.svg
favicon.png
apple-touch-icon.png
track-YYYY-MM-DD.html    ← ca. 30 Dateien, eine pro Track
```

### index.html Struktur
Ticker (Black/Yellow) → Hero (Pink, rotierender Smiley, GRINLOUD in Bungee, Mantra, CTA) → Music Radar Teaser (Black) → Manifesto Teaser (Yellow) → Vibe Grid (3 Zellen: Pink/Yellow/Black) → Footer

**Footer-Mantra:** "House music, curated daily. One track that moves."

### Tech-Regeln
- Safari-Kompatibilität: Keine Arrow Functions und Template Literals in kritischen Render-Pfaden (hat früher Blank Screens verursacht)
- Smiley-Logo: immer base64-embed als `<img>` — kein inline SVG, keine transforms, keine viewBox-Änderungen, kein schwarzer Kreis-Border
- Fonts via Google Fonts CDN
- 40 parametrische SVG-Animationen, deterministisches Farb-System
- OG-Tags pro Track für WhatsApp/Instagram-Sharing

### Geplante Website-Neugestaltung
Cy möchte die Website **minimalistisch aber cool** mit GRINLOUD als Protagonisten neu aufbauen. Ziel: cleaner, starker Brand-Auftritt. Details werden im CoWork-Projekt gemeinsam erarbeitet.

---

## 7. PLATTFORMEN & LINKS

| Platform       | URL / Handle                                                        |
|----------------|---------------------------------------------------------------------|
| Website        | https://grinloud.com                                                |
| Instagram      | https://www.instagram.com/grinloud/                                 |
| Mixcloud       | https://www.mixcloud.com/cyrill/                                    |
| Spotify (Cy)   | https://open.spotify.com/user/31d7ezpcd2d77ca2y5w3cv4q4kdy         |
| Email          | hello@grinloud.com (Cloudflare Email Routing → persönlicher Inbox) |
| Cy Instagram   | @journal.of.cy                                                      |
| Cy Suno        | @cyslowdown                                                         |
| OG Image       | og.jpg (Smiley-Pattern, Pink/Yellow)                                |

**Beatport DJ Charts:** Radar 001–003 live. Cy evaluiert ob/wie diese in die Website integriert werden.

---

## 8. TOOLS & SETUP

### DJ & Recording (Mac)
- **Hardware:** Hercules DJControl Inpulse T7 (44.1kHz USB, fix)
- **Software:** Djay Pro + Beatport Link Subscription
- **Recording-Chain:**
  - Djay Pro Output → DJControl ch1-2 (direkt, kein Latenz)
  - Booth Output → BlackHole 2ch
  - GarageBand Input → BlackHole 2ch (Auto-Level OFF)
  - Multi-Output Device: BlackHole 2ch (primary) + DJControl (Drift Correction ON), 44.1kHz
  - Auto-Gain in Djay Pro: OFF · Headroom: -6dB
- **Mastering-Ziel für Mixcloud:** ~-10.0 LUFS Integrated · True Peak ≤ -1 dBTP
- **DAW:** GarageBand (Volume Automation via A-Taste)

### Musik-Produktion
- **Tool:** Suno AI (Artist: "Cy Schneider", Account: @cyslowdown)
- **Status:** Suno = Demo / Reel-Tool. Noch nicht club-tauglich (Referenz: Duke Dumont, Swedish House Mafia, James Hype, Tiësto)
- **Suno Style-Elemente die funktionieren:** Marimba/Xylophone/Music Box als unerwartetes melodisches Instrument · Warme analoge Synth-Leads · Subtiles Gospel-Piano · Massive Sidechain-Compression · Plötzliche Stille vor dem Drop · Minimale Lyrics · Hypnotische Chorus-Wiederholung · Herausfordernder/provokativer Ton (nie soft oder Motivations-Poster)
- **Anthem-Chorus (fix, nie ändern):** "Be you / Feel good / Go for it / This is now / Be you / Feel good / Grin loud"

### Video & Social
- Mac Screenshot: Cmd+Shift+5 (Recording), Cmd+Shift+4 (Slides)
- iMovie: 1080p H.264 Export
- Instagram Carousel: HTML bei 405×540px, Screenshot bei 267% Zoom → 1080×1440px
- Playlist-Konvertierung: Soundiiz.com

---

## 9. LEARNINGS & FALLSTRICKE

- **Cloudflare:** Immer Full-Replace ZIP, nie partiell. Workers Static Assets, nicht Pages.
- **Safari:** Keine Arrow Functions / Template Literals in kritischen Pfaden → Blank Screen
- **Smiley-SVG:** Immer base64 als `<img>` — inline SVG-Manipulation = kaputt
- **Spotify Free:** Kein Web API für Playlist-Erstellung — alles manuell
- **BPM-Check:** 138 BPM Dance/Pop ≠ Tech House. Bass House ≠ Electro. Immer Beatport-Genre prüfen.
- **Beatport Charts:** Gain Reach durch aktives Sharing, nicht organisch. Ohne eigene Releases kein separates Artist-Profil.
- **Green Velvet "La La Land":** Zu alt — abgelehnt als Curation-Beispiel

---

## 10. CY — ARBEITSSTIL

- **Direkt, kurz, entscheidungsfreudig** — kurzes klares Feedback, erwartet Ausführung statt Optionen
- Pushes für Boldness und Authentizität — "zu brav" ist ein Flag
- Eigenes Tempo — nicht pushen, nicht vorgreifen
- Neue Tools/Channels werden vorsichtig evaluiert bevor Commitment
- Iteriert schnell auf visuelle Assets — gibt spezifisches Feedback (Grösse, Spacing, Farbe)
- Kommuniziert auf Schweizerdeutsch/Deutsch und Englisch
- **Bei unklaren Aufgaben:** Nachfragen was genau gemeint ist

---

*GRINLOUD CoWork Brief v1.0 — Mai 2026 — Erstellt für Claude CoWork-Projekt*
