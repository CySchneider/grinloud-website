# GRINLOUD — CoWork Master Brief
> Vollständige Referenz für Claude im CoWork-Projekt. Stand: 15. Juli 2026 (v2.0).
> Dieses Dokument ersetzt jede Erklärung. Einfach ins Projekt laden und loslegen.
> Ersetzt v1.0 (Mai 2026) — die Website ist seither komplett neu gebaut (React-App statt statischer Einzelseiten).

---

## 1. WER IST GRINLOUD

**GRINLOUD** ist eine House Music Lifestyle Brand und Bewegung, betrieben unter **Isuntu GmbH**, Weidenweg 26, 4303 Kaiseraugst, Schweiz.
Gründer und Kurator: **Cy Schneider** (Cyrill Schneider), Basel, Schweiz.

GRINLOUD ist immer **in Grossbuchstaben** zu schreiben.

**Mantra** (Reihenfolge unveränderlich):
> Be you. Feel good. Go for it.

**Tagline:** House Music Curated Daily / spread good vibes

**Kern-Philosophie:** Cy ist der Mensch hinter GRINLOUD — sichtbar, aber nicht im Fokus. GRINLOUD ist die Hauptfigur.

**Persönlichkeit:** Laut & provokativ · Verspielt & energetisch · Direkt · Nie belehrend
**Niemals:** Passiv, negativ, sarkastisch, pastell, Stockfotos, Corporate-Speak

---

## 2. WAS GRINLOUD HEUTE IST (das Kernprodukt)

Die Website hat sich fundamental verändert: von einer statischen Radar-Seiten-Sammlung zu einer echten täglichen Content-Maschine.

**Zwei Formate, ein Rhythmus:**
1. **Pick of the Day** — jeden Tag ein einzelner, handverlesener Track. Die Homepage zeigt immer den heutigen Pick; man kann per Pfeiltasten/Swipe durch alle vergangenen Picks zurückblättern.
2. **Music Radar** — alle 10 Tage, 10 Tracks als kuratierte Playlist mit eigenem Theme/Subtitle und Mixcloud/Spotify-Link.

**Genres:** House · Tech House · Progressive House · Bass House (gelegentlich Mainstage/Festival-Anthems als Ausreisser, siehe Radar 009)
**BPM-Range:** 124–132 (ideal), bis 134 ausnahmsweise
**Zielgruppe (siehe about.html):** DJs bei der Track-Suche, Radioshows, House-Music-Hörer, die eine schnelle verlässliche tägliche Quelle wollen — kein Feed, kein Algorithmus.

---

## 3. WEBSITE — grinloud.com (komplett neu, Stand Juli 2026)

### Tech-Stack (KRITISCH — hat sich komplett geändert seit v1.0)
- **Framework:** Vite + React 18 (SPA), kein statisches Einzel-HTML mehr
- **Hosting:** **Cloudflare Pages** (Projekt: `grinloud-website`) — NICHT Cloudflare Workers Static Assets wie in v1.0 dokumentiert
- **Deploy:** GitHub Actions (`.github/workflows/deploy.yml`) — bei jedem Push auf `main`: `npm ci` → `npm run build` → `wrangler pages deploy dist`. Kein manueller ZIP-Upload mehr.
- **Build-Befehl:** `npm run build` = `vite build` + `node scripts/generate-static-pages.js`
- **Cloudflare Pages Functions** (`functions/`):
  - `_middleware.js` — SPA-Fallback: liefert für `/pick/*` und `/radar/*` das App-Shell aus, falls keine vorgebaute statische Seite existiert (z.B. für einen Pick, der erst nach dem letzten Deploy live ging) → verhindert 404 bei Direct-Load/Refresh
  - `subscribe.js` — Server-seitiger Proxy zur Beehiiv-Subscription-API (vermeidet CORS, versteckt den API-Key)

### Repo-Struktur
```
src/
  App.jsx          ← Routing/State (Home/Radar/Archive), URL-Sync, Tweaks-Panel
  data.js          ← ALLE Picks + Radars als JS-Objekte (window.GRINLOUD_DATA)
  HomeA.jsx / HomeB.jsx  ← zwei Homepage-Varianten (A/B-Test via Tweaks-Panel)
  MusicRadar.jsx   ← Radar-Detailansicht (Tracklist, Player)
  Archive.jsx       ← Archiv-Ansicht (alle Picks + alle Radars, Tabs)
  Cinema.jsx        ← Vollbild-Modus ohne UI (für ?cinema Query-Param)
  RadarCover.jsx    ← Vollbild-Promo-Card für Instagram/TikTok (?radar Query-Param)
  shared.jsx        ← BackgroundVideo, LogoMark, StreamingLinks, TopNav, NewsletterModal, etc.
  icons.jsx, styles.css, main.jsx
scripts/
  generate-static-pages.js  ← generiert nach vite build statische, crawlbare /pick/YYYY-MM-DD/
                               und /radar/0XX/ Seiten (echte OG/Twitter/JSON-LD-Tags für
                               Crawler, die kein JS ausführen) + sitemap.xml
  send-daily-pick.js         ← Newsletter-Versand (siehe Abschnitt 5)
functions/
  _middleware.js, subscribe.js  (siehe oben)
tweaks-panel.jsx    ← Live-Tweak-Panel für Design-Iteration (Farbe, Typo, Logo-Position etc.)
index.html, about.html, impressum.html, privacy.html, 404.html
sitemap.xml, robots.txt, llms.txt
dist/               ← Build-Output (nicht versioniert relevant, wird deployed)
```

### Wie eine Seite gerendert wird (wichtig für SEO-Verständnis)
Jeder Pick und jeder Radar hat eine **statisch vorgebaute** `index.html` unter `/pick/YYYY-MM-DD/` bzw. `/radar/0XX/` mit echten Meta-Tags (Title, OG, Twitter, JSON-LD `MusicRecording`/`MusicPlaylist`) UND einem Fallback-Body für Crawler ohne JS. Sobald die React-App lädt, übernimmt sie und rendert die volle interaktive Ansicht, exakt auf diesen Pick/Radar gemappt (URL wird geparst). Ein geteilter Link ist also gleichzeitig indexierbar UND voll funktional.

`scripts/generate-static-pages.js` baut diese Seiten nur für das, was **zum Build-Zeitpunkt bereits öffentlich** ist (gleiche Sichtbarkeits-Logik wie die App: `pick.date <= heute`, `radar.liveDate <= heute`). Ein Pick, der erst nach dem letzten Deploy live geht, hat noch keine vorgebaute Seite → dafür sorgt `_middleware.js` (SPA-Fallback statt 404).

### Routing / URL-Struktur
- `/` — Homepage, zeigt den heutigen Pick of the Day (Video-Hintergrund, Titel, Artist, BPM/Key/Genre, "GRINLOUD SAYS"-Zitat, Play/Streaming-Links, Share-Button)
- `/pick/YYYY-MM-DD/` — Deep-Link auf einen spezifischen Pick
- `/radar/0XX/` — Deep-Link auf einen spezifischen Radar
- `/?archive=picks` bzw. `/?archive=radars` — Archiv-Ansicht (alle vergangenen Picks/Radars als Grid), kein eigener Static-Path, lebt hinter Query-Param
- `?admin` — Admin-Modus: zeigt auch zukünftige/geplante Picks & Radars (mit "SCHEDULED"-Badge), sonst nur was schon live ist
- `?cinema` — Vollbild-Modus ohne UI
- `?radar` — Vollbild-Promo-Card-Modus (Cover-Export für Social)
- `/about.html`, `/privacy.html`, `/impressum.html` — statische Info-Seiten (eigenes minimalistisches Design, JetBrains-Mono, unabhängig von der React-App)

### Sitemap (aktuell, automatisch generiert bei jedem Build)
- `https://grinloud.com/` (daily, prio 1.0)
- `https://grinloud.com/about.html` (monthly)
- `https://grinloud.com/privacy.html`, `/impressum.html` (yearly)
- `https://grinloud.com/radar/0XX/` — je einer pro veröffentlichtem Radar (aktuell 001–009)
- `https://grinloud.com/pick/YYYY-MM-DD/` — je einer pro veröffentlichtem Pick (aktuell 90 Picks, 22. Apr – 20. Jul 2026)

### Homepage-Struktur (Variante A, Default)
Video-Loop-Hintergrund (thematisch passend zum Radar-Zyklus) mit Farbfilter + Vignette → "PICK OF THE DAY · Datum"-Pill → Spotify-Cover → riesiger Track-Titel (clamp-skaliert) → Artist → Genre/BPM/Key → "GRINLOUD SAYS"-Zitat-Block → Play-Preview-Button + Streaming-Links (Spotify/YouTube/Beatport, SoundCloud ausgeblendet) + Share-Button → GRINLOUD-Brand-Footer. Links/rechts Pfeile zum Blättern durch Picks. Es gibt eine **Variante B** (`HomeB.jsx`), umschaltbar im Tweaks-Panel — noch in Iteration.

### Design-System aktuell
- **Akzentfarben (Neon-Palette):** Pink `#FF1F8F` (primär) · Yellow `#FFE600` · Blue `#00C2FF` · Green `#39FF14` · Orange `#FF6200` — jeder Pick hat eine feste Akzentfarbe, die beim Wechsel automatisch übernommen wird
- **Fonts:** Archivo Black (Headlines/Radar-Nummer) · Space Grotesk (Body/UI) · JetBrains Mono (Meta/Labels/Legal-Seiten) · UnifrakturMaguntia (vereinzelt, dekorativ) — **Bungee ist nicht mehr die Haupt-Headline-Schrift**, das war v1.0
- **Hintergrund-Videos:** Pool von kurzen Loop-Clips (Grok-generiert + thematische Serien: Parkhaus, Ibiza, Drive-Thru, Partyboat, Stadion — je einer Serie pro Radar-Zyklus), zyklisch den Picks zugewiesen
- **Logo:** `Logo GRINLOUD Smiley Yellow black.svg/png` als `<img>`-Tag, klickbar mit zufälliger Mini-Animation (bounce/wobble/spin/shake/heartbeat/flip/squish/nod/pop/dizzy)
- **Tweaks-Panel** (`?` im Code, sichtbar im Dev/Admin): Live-Editor für Homepage-Variante, Akzentfarbe, Video-Overlay-Opacity, Titel-Skalierung, Info-Dichte (minimal/regular/comfy), Logo-Position (top/corner/big) — Werte werden als `TWEAK_DEFAULTS` in `App.jsx` persistiert

---

## 4. CONTENT-STAND (Stand 15. Juli 2026)

### Music Radar — bisherige Ausgaben
| # | Datum | Subtitle | Video-Serie |
|---|-------|----------|-------------|
| 001 | 22 Apr 2026 | "Where it started." | Grok-Videos (initial) |
| 002 | 02 Mai 2026 | "No blog. No template." | Grok-Videos |
| 003 | 12 Mai 2026 | "Pure energy. No filler." | Grok-Videos |
| 004 | 22 Mai 2026 | "Ten tracks. Ten days. All killer." | Grok-Videos |
| 005 | 01 Jun 2026 | "Pure Club. Zero Filler." | Parkhaus-Serie |
| 006 | 11 Jun 2026 | "Less rush. More flow." | Ibiza-Serie |
| 007 | 21 Jun 2026 | "Say Please. Manners Optional." | Drive-Thru-Serie |
| 008 | 01 Jul 2026 | "Slow Burn. Still Bangs." | Partyboat-Serie |
| 009 | 11 Jul 2026 | "Ten tracks. One pulse." | Stadion-Serie |

Radar 009 ist aktuell live (bis ca. 21. Jul 2026, dann Radar 010).

### Pick of the Day
- **90 Picks** durchgehend seit 22. April 2026, ein Track pro Tag, keine Lücken
- Jeder Pick: Titel, Artist(s), BPM, Key, Label, Release-Datum, Genre, Akzentfarbe, Info-Text ("GRINLOUD SAYS"), Kurzfassung, Streaming-Links (Spotify/YouTube/Beatport)
- Aktuellster Pick im Repo (Stand jetzt): 20. Juli 2026 — "Rave (PAROOKAVILLE Anthem 2026)" von Marten Hørger
- Neue Picks werden direkt in `src/data.js` als Objekte im `PICKS`-Array ergänzt (neueste zuerst)

### Archiv
Eigene Ansicht mit zwei Tabs: "PICKS OF THE DAY" (Grid aller vergangenen Picks, anklickbar → Spotify-Preview) und "MUSIC RADARS" (Grid aller Radars inkl. Cover). Admin-Modus zeigt zusätzlich geplante/zukünftige Einträge mit "+N SCHEDULED"-Badge.

---

## 5. NEWSLETTER (neu seit v1.0 — existierte in v1.0 noch nicht in Produktion)

- **Anbieter:** Beehiiv (Subscription-Management) + **Resend** (E-Mail-Versand)
- **Absender:** `GRINLOUD <pick@grinloud.com>`
- **Ablauf:** GitHub Actions Workflow `daily-newsletter.yml`, Cron `0 6 * * *` UTC (Ziel: ~09:00 CEST Zustellung)
  1. `scripts/send-daily-pick.js` liest den heutigen Pick aus `src/data.js`
  2. Holt alle aktiven Subscriber von Beehiiv (paginiert)
  3. Baut eine gebrandete HTML-Mail (Akzentfarbe des Tages, Archivo Black Headline, Meta-Pills BPM/KEY/LABEL) und verschickt sie einzeln über Resend
  4. Auch manuell auslösbar via `workflow_dispatch`
- **Anmeldung auf der Website:** `functions/subscribe.js` — serverseitiger Proxy zu Beehiiv, damit der API-Key nie im Browser landet
- **Env Vars (GitHub Secrets):** `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `RESEND_API_KEY`

---

## 6. BRAND IDENTITY (weiterhin gültig)

### Farben (Brand-Palette — unabhängig von der Neon-Akzent-Palette der Website-Picks)
| Name     | Hex     | Einsatz                              |
|----------|---------|--------------------------------------|
| Hot Pink | #FF0090 | Primärfarbe, Hintergründe, Akzente   |
| Yellow   | #FFE600 | Logo, Headlines, CTA                 |
| Black    | #0A0A0A | Hintergründe, Text                   |
| White    | #FFFFFF | Helle Flächen                        |

### Typografie (Brand allgemein, nicht zu verwechseln mit Website-Fonts oben)
- **Bungee** — Markenschriftzug-Ersatz in Social/Print, NIE für Fliesstext
- **DM Sans** — Body/UI in Brand-Assets ausserhalb der Website
- **DM Mono** — Badges, Meta-Labels, Nummern

### Logo-Regeln (KRITISCH)
- Der GRINLOUD-Schriftzug ist ein **proprietärer SVG-Pfad** — niemals durch Bungee oder anderen Font ersetzen
- Aktuelle Logo-Datei auf der Website: `Logo GRINLOUD Smiley Yellow black.svg/png`
- Smiley = immer als `<img>`-Tag einbetten — **nie** als inline SVG manipulieren, keine Transforms, kein schwarzer Kreis-Border
- Kein Verzerren, Rotieren, Recolouring ausserhalb der Palette

### GRINLOUD in Text (zweifarbig, Bungee)
- Auf Pink: GRIN=#FFE600, LOUD=#0A0A0A
- Auf Black: GRIN=#FFE600, LOUD=#FF0090
- Auf Hell: GRIN=#FF0090, LOUD=#0A0A0A

### Signature Design-Elemente
1. **Ticker / Tape** — gelber oder schwarzer Endlostext horizontal
2. **Rotierender Smiley-Ring** — gestrichelter Kreis, subtil
3. **Vibe-Grid** — Farb-Kacheln mit Mantra-Worten
4. **Drop Shadow Text** — Bungee mit Offset-Shadow

---

## 7. STIMME & TON

**GRINLOUD spricht so:** Direkt · kurz · auf den Punkt · motivierend ohne zu belehren · positiv ohne naiv
**Hauptsprache:** Englisch
**Instagram-Signatur:** ☻ ♥ ☻ (Opener/Closing in Captions) · einzelnes ☻ in Bio

**Gut:**
- "Dream big. Start small. Go hard."
- "Every small win matters. Celebrate them all — then want more."
- "Spread love like it costs nothing. Because it doesn't."

**Nie:** "Chill" · "entspann dich" · Negativität · Ironie · Buzzwords

---

## 8. MANIFESTO (vollständig, unveränderlich)

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

## 9. CURATION-KRITERIEN (Pick of the Day & Music Radar)

**Genres (erlaubt):** House · Tech House · Bass House · Progressive House · Melodic House (gelegentlich Mainstage/Festival-Anthem als bewusster Ausreisser)
**BPM-Range:** 124–132 BPM (ideal), bis 134 ausnahmsweise
**Ausschlusskriterien:**
- Kein Dance/Pop (auch wenn House-ähnlich)
- Kein Electro House
- BPM >135 = zu schnell
- Tracks älter als ~6 Monate vermeiden (ausser Classics mit klarem Grund)
- Bass House ≠ Electro — genau prüfen

**Qualitätsmerkmale:** Dancefloor-tauglich · Energie · Groove · Charakter · Mix-Kompatibilität
**Referenz-Artists:** Dom Dolla · James Hype · Vintage Culture · John Summit · Anyma · ANOTR · Odd Mob · Chris Lorenzo · Mau P · CID · Green Velvet

---

## 10. PLATTFORMEN & LINKS

| Platform       | URL / Handle                                                        |
|----------------|---------------------------------------------------------------------|
| Website        | https://grinloud.com                                                |
| Instagram      | https://www.instagram.com/grinloud/                                 |
| YouTube        | https://youtube.com/@grinloud                                       |
| Mixcloud       | https://www.mixcloud.com/cyrill/                                    |
| Newsletter     | Beehiiv-Publikation, Anmeldung über grinloud.com                    |
| E-Mail (allg.) | hello@grinloud.com                                                   |
| E-Mail (Pick)  | pick@grinloud.com (Newsletter-Absender)                             |
| Cy Instagram   | @journal.of.cy                                                       |
| Cy Suno        | @cyslowdown                                                          |

---

## 11. TOOLS & SETUP

### DJ & Recording (Mac)
- **Hardware:** Hercules DJControl Inpulse T7 (44.1kHz USB, fix)
- **Software:** Djay Pro + Beatport Link Subscription
- **Recording-Chain:** Djay Pro → DJControl ch1-2 direkt; Booth Output → BlackHole 2ch → GarageBand; Multi-Output Device: BlackHole 2ch (primary) + DJControl (Drift Correction ON), 44.1kHz; Auto-Gain OFF, Headroom -6dB
- **Mastering-Ziel für Mixcloud:** ~-10.0 LUFS Integrated · True Peak ≤ -1 dBTP
- **DAW:** GarageBand (Volume Automation via A-Taste)

### Musik-Produktion
- **Tool:** Suno AI (Artist: "Cy Schneider", Account: @cyslowdown)
- **Status:** Demo/Reel-Tool, noch nicht club-tauglich
- **Anthem-Chorus (fix):** "Be you / Feel good / Go for it / This is now / Be you / Feel good / Grin loud"

### Video & Social
- Mac Screenshot: Cmd+Shift+5 (Recording), Cmd+Shift+4 (Slides)
- Instagram Carousel: HTML bei 405×540px, Screenshot bei 267% Zoom → 1080×1440px
- Playlist-Konvertierung: Soundiiz.com

---

## 12. LEARNINGS & FALLSTRICKE

- **Hosting-Wechsel:** Website läuft jetzt auf Cloudflare **Pages** (Git-Deploy via GitHub Actions), nicht mehr auf Workers Static Assets mit manuellem ZIP-Upload
- **Statische Seiten sind Snapshots:** `generate-static-pages.js` bäckt nur, was zum Build-Zeitpunkt schon öffentlich ist — ohne täglichen Rebuild braucht ein brandneuer Pick den `_middleware.js`-Fallback, sonst 404 bei Direct-Load
- **Safari:** Keine Arrow Functions / Template Literals in kritischen Render-Pfaden → Blank Screen (galt für die alte statische Version, bei der React-App weniger relevant, aber im Hinterkopf behalten)
- **Smiley-SVG:** Immer base64/`<img>` — inline SVG-Manipulation = kaputt
- **Spotify Free:** Kein Web API für Playlist-Erstellung — alles manuell
- **BPM-Check:** Bass House ≠ Electro. Immer Beatport-Genre prüfen.
- **iOS Autoplay:** Spotify-Preview-Play muss synchron im User-Gesture-Kontext ausgelöst werden (siehe Git-History: mehrere Fixes für Autoplay/Pause auf Mobile)

---

## 13. CY — ARBEITSSTIL

- **Direkt, kurz, entscheidungsfreudig** — kurzes klares Feedback, erwartet Ausführung statt Optionen
- Pushes für Boldness und Authentizität — "zu brav" ist ein Flag
- Eigenes Tempo — nicht pushen, nicht vorgreifen
- Iteriert schnell auf visuelle Assets — gibt spezifisches Feedback (Grösse, Spacing, Farbe)
- Kommuniziert auf Schweizerdeutsch/Deutsch und Englisch
- **Bei unklaren Aufgaben:** Nachfragen was genau gemeint ist
- Commits nach jedem Push direkt auf `main` — kein separates Review-Gate für kleine Fixes

---

*GRINLOUD CoWork Brief v2.0 — 15. Juli 2026 — Erstellt für Claude CoWork-Projekt. Ersetzt v1.0 (Mai 2026, statische Website, Radar 001–004).*
