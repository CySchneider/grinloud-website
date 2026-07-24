# GRINLOUD — Pick of the Day Carousel: Workflow für Claude Cowork

Diese Datei beschreibt den vollständigen, wiederholbaren Ablauf, um für einen beliebigen GRINLOUD "Pick of the Day" ein 6-teiliges Instagram/TikTok-Carousel (HTML, 1080×1350px pro Slide) plus passende Caption zu erstellen. Ziel: Cowork soll das eigenständig ausführen können, ohne dass Cy jedes Mal manuell Dateien hochladen muss.

---

## 0. Voraussetzung: Wo kommen die Track-Daten her?

**Wichtig:** Das Projekt-File `data.js` in diesem Claude-Projekt ist veraltet (Stand ~11. Mai 2026). Für aktuelle Picks NICHT darauf verlassen.

Reihenfolge der Datenquellen (erste verfügbare nehmen):
1. **Live-Repo:** Falls Cowork Zugriff auf das GitHub-Repo/Cloudflare-Deployment hat, `src/data.js` dort lesen (PICKS-Array, neueste zuerst) — das ist die einzige verlässliche aktuelle Quelle.
2. **Cy nennt Titel + Artist direkt** im Chat.
3. Falls beides fehlt: aktiv nachfragen, welcher Track dran ist (Radar-Reihenfolge nicht selbst raten, wenn kein aktueller Datenstand vorliegt).

## 1. Recherche pro Track (falls Daten nicht schon vollständig vorliegen)

Für jeden Pick per Web-Suche verifizieren (Beatport ist die autoritative Quelle für Genre/BPM/Key/Label/Release-Datum):
- Genre (exakter Beatport-Genre-Tag, z.B. "Bass House", "Tech House", "Mainstage")
- BPM & Key (z.B. "130 BPM - E Major")
- Label
- Release-Datum
- Track-Länge (Extended Mix bevorzugt, sonst Spotify-Standardversion)
- **Ein echter, verifizierter "Fun Fact"** zu Track oder Artist (z.B. Label-Historie, Kollabo-Premiere, Chart-Erfolg, Artist-Meilenstein). Keine erfundenen Fakten — nur was recherchierbar ist.

Cover-Art & Artist-Bild:
- Über die offizielle Spotify-Track-Seite (`open.spotify.com/track/...`) per `web_fetch` die `meta-og:image`-URL (Cover, i.scdn.co) und die Artist-Bild-URL (`ab6761610000f178...` bzw. höher aufgelöst `ab67616100005174...`) auslesen.
- Bei Kollab-Tracks: den zuerst/prominentesten gelisteten Artist als Hauptbild nehmen, andere per "with X, Y" darunter erwähnen. Cy kann das jederzeit korrigieren (z.B. "hebt Walker & Royce hervor, nicht Odd Mob").
- **Nie eigene Cover-Art generieren oder anders reproduzieren** — immer die echte, offiziell gehostete Spotify-CDN-URL verlinken (das ist keine Reproduktion, sondern ein Embed wie auf der Website selbst).

## 2. Feste Assets (immer gleich, einmal ablegen)

- `grinloud-says-still.jpg` — das GRINLOUD-Charakter-Still (sitzend, Flutlicht-Szene), wird in JEDEM Carousel für Slide 5 verwendet. Liegt bereits vor, muss nicht neu erzeugt werden.
- Smiley-Icon als Base64-SVG — fest im `<script>`-Block jeder Carousel-Datei einprogrammiert (`data-smiley`-Attribute werden per JS automatisch befüllt).

## 3. Design-System (fix, nicht pro Post ändern)

- **Fonts:** Archivo Black (Headlines), Space Grotesk (Fliesstext), JetBrains Mono (Labels/Meta), UnifrakturMaguntia (nur für den `grinloud.com`-Schriftzug)
- **Farben:** `--black:#0A0A0A`. Akzentfarbe `--accent` ist fix pro Post aus der Neon-Palette: Pink `#FF1F8F` · Yellow `#FFE600` · Blue `#00C2FF` · Green `#39FF14` · Orange `#FF6200`. Wenn kein Screenshot/keine Vorgabe existiert, plausibelste Farbe zum Genre wählen und im Chat kurz nennen.
- **Neo-Brutalist-Stil:** Karten (`.nb-card`) und gerahmte Bilder (`.nb-frame`) haben IMMER einen **schwarzen** Rahmen (4px) und einen **schwarzen** Offset-Schatten (10px/12px) — nie weiss, nie in Akzentfarbe.
- **Keine Slide-Titel/Labels und kein Padding zwischen den Slides** — jede `.slide` ist exakt 1080×1350px, `body` hat `margin:0; padding:0`, damit OBS sauber pro Slide screenshotten kann.
- **OBS-Jumper:** Pfeiltaste/Leertaste/Klick springt exakt 1350px weiter (Script am Dateiende, immer 1:1 übernehmen).

## 4. Die 6 Slides im Detail

| # | Inhalt | Hintergrund |
|---|--------|-------------|
| 1 | Pill "☻ PICK OF THE DAY · DD.MM.YYYY" + gerahmtes Cover (420×420) + Tracktitel (Archivo Black) + Mix-Version klein darunter | Cover geblurrt (2px, brightness 0.55) + dunkler Gradient-Scrim |
| 2 | Kein Pill, kein Smiley. Gerahmtes Artist-Bild (420×420) + "TODAY'S ARTIST(S)" Label + Name gross in Akzentfarbe + ggf. "with X, Y" darunter | Artist-Foto geblurrt als BG (verhindert Pixeligkeit bei niedriger Auflösung) |
| 3 | Kein Pill, kein Smiley. Kleines Cover-Thumbnail (200×200) + `.nb-card` darunter mit Pick-Nummer/Datum, Genre, BPM, Key, Label | Cover geblurrt als BG |
| 4 | "THE DETAILS": Release Date, Duration, dann ein Fliesstext-Fun-Fact (Space Grotesk) | Cover geblurrt als BG |
| 5 | "GRINLOUD SAYS:" Card mit kleinem gelbem Smiley-Icon (26px) neben dem Label, Zitat-Text (2–3 Sätze, GRINLOUD-Tonfall: direkt, kein Marketing-Sprech) | `grinloud-says-still.jpg`, `object-position:center bottom; transform:scale(1.05); transform-origin:50% 100%` (zeigt Kopf zu ~7/8, Hand kommt unten hervor) |
| 6 | Smiley + `grinloud.com` (Blackletter) + "House Music Curated Daily" + Trennlinie + "New Pick every day.<br>New Radar every 10 days.<br>Don't miss it." (gleiche `.label`-Formatierung wie der Claim darüber, keine Akzentfarbe) | animierte Ripple-Kreise, schwarz |

**Wichtig bei Slide 5 (GRINLOUD SAYS Zitat):** Der Text ist immer ein NEUER Entwurf pro Track (2 Artists/Track-Charakter einbauen), wird Cy als Vorschlag präsentiert — er darf und wird ihn oft anpassen wollen.

## 5. Datei-Output

- Dateiname: `pick-YYYY-MM-DD-instagram.html`
- Zusätzliche Assets (Video/Still, falls pro Post individuell) im selben Ordner ablegen wie die HTML-Datei — relative Pfade, keine absoluten.
- Bei Verwendung von `grinloud-says-still.jpg`: einmal zentral ablegen und in jeder neuen Datei per relativem Pfad referenzieren, nicht jedes Mal neu hochladen.

## 6. Instagram/TikTok Caption (separat, nach dem Carousel)

**Prinzip (Stand 2026):** Hashtags sind für die Auffindbarkeit zweitrangig geworden. Instagram indexiert Captions wie eine Suchanfrage-Antwort. Der Opener muss die Kernbegriffe (Genre, Pick-Charakter, alle Artist-Namen, Tracktitel) als vollständigen Satz enthalten — kein Label-Stapel.

Fixe Struktur:
```
New [Genre] Pick of the Day: [Artist(s)] — "[Tracktitel]"

[BPM] BPM · [Key], out now on [Label].

☻ 𝗚𝗥𝗜𝗡𝗟𝗢𝗨𝗗 𝗦𝗔𝗬𝗦: [2-Satz-Zitat aus Slide 5, identisch]

New Pick every day, new Radar every 10 — link in bio.

#[genre] #[artistname] #newmusic #[genre-oder-mood] #grinloud
```

Regeln:
- **Bold nur für "GRINLOUD SAYS:"** (via Unicode Mathematical Alphanumeric Bold, z.B. 𝗚𝗥𝗜𝗡𝗟𝗢𝗨𝗗 — das ist KEIN echtes Markdown-Bold, sondern andere Unicode-Zeichen). Alle Keywords (Titel, Artist, Genre, Hashtags) bleiben Plain-Text, sonst werden sie von der Suche nicht als die eigentlichen Wörter erkannt.
- Genau **5 Hashtags**, davon 2 fix (`#grinloud` + Genre-Tag), 2–3 dynamisch passend zum Artist/Sound.
- "Link in bio" statt direkter URL (algorithmische Unterdrückung von Direktlinks).
- Keine Emojis ausser dem GRINLOUD-Smiley-Zeichen ☻.

## 7. Copyright/Rechtliches (immer beachten)

- Cover-Art und Artist-Fotos NUR als Link/Embed auf die offizielle Spotify-CDN-URL — nie selbst nachbauen, nie fremde Fotos von anderswo (Pressefotos, Google Images) verwenden.
- Songtexte/Lyrics nie zitieren oder reproduzieren.
- Fun Facts müssen aus recherchierbaren Quellen stammen, nicht erfunden werden.

---

**Kurz gesagt für Cowork:** Track-Daten holen (Repo/Cy-Angabe/Recherche) → Cover+Artist-URLs von Spotify holen → Template-Datei (`grinloud-carousel-template.html`, liegt bei) mit den Platzhaltern befüllen → als `pick-YYYY-MM-DD-instagram.html` speichern → Caption nach obigem Schema schreiben → beides Cy zur Freigabe zeigen, bevor gepostet wird.
