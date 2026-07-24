---
name: GRINLOUD Pick of the Day Carousel
description: Erstellt das tägliche GRINLOUD "Pick of the Day" Instagram/TikTok-Carousel (6 HTML-Slides, 1080x1350px) plus passende Caption. Nutzen bei jeder Anfrage zu einem neuen Pick-of-the-Day-Post, Radar-Track-Carousel oder Instagram-Beschreibung für GRINLOUD.
---

# GRINLOUD Pick of the Day Carousel

Diese Skill baut für einen GRINLOUD-Track ein fertiges 6-Slide-Instagram/TikTok-Carousel plus Caption.

## Schritt 1 — Lies zuerst die Workflow-Datei
Öffne `GRINLOUD-CAROUSEL-WORKFLOW.md` in diesem Skill-Ordner und folge ihr Schritt für Schritt. Sie enthält:
- Woher die Track-Daten kommen (Live-Repo bevorzugt, sonst Nutzer fragen — NIE raten)
- Recherche-Anforderungen (Beatport für Genre/BPM/Key/Label/Release, Spotify für Cover/Artist-Bild, ein echter Fun Fact)
- Das komplette Design-System (Fonts, Farben, Neo-Brutalist-Regeln)
- Slide-für-Slide-Aufbau (Tabelle)
- Caption-Format inkl. SEO-Regeln und Bold-Konvention
- Copyright-Regeln

## Schritt 2 — Nutze das Template
`grinloud-carousel-template.html` in diesem Skill-Ordner enthält das komplette 6-Slide-Grundgerüst mit `{{PLATZHALTERN}}`. Alle Tokens sind im Kommentar am Dateianfang erklärt. Fülle sie aus recherchierten/gegebenen Daten und speichere das Ergebnis als `pick-YYYY-MM-DD-instagram.html`.

## Schritt 3 — Feste Assets
`grinloud-says-still.jpg` (ebenfalls in diesem Ordner) muss in den gleichen Output-Ordner kopiert werden wie die fertige HTML-Datei — wird in jedem Carousel für Slide 5 verwendet.

## Escape Valve (wichtig)
Wenn der heutige Track, sein Genre/BPM/Key/Label/Release-Datum oder ein verifizierbarer Fun Fact nicht sicher ermittelbar ist: **nachfragen, nicht erfinden.** Gleiches gilt für die Akzentfarbe, falls sie nicht aus einer Vorgabe/einem Screenshot hervorgeht — dann plausibelste Farbe zum Genre wählen und das im Chat kurz transparent machen.

## Beispiel-Trigger
- "Karussell für den heutigen Pick"
- "Mach mir das Instagram-Carousel für [Track]"
- "Beschreibung für den Pick von heute"
