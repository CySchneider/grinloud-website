# GRINLOUD.com — working notes for Claude

## Adding new picks to src/data.js

Whenever new pick entries are added to the `PICKS` array in [src/data.js](src/data.js) (e.g. a new Music Radar cycle), run this immediately afterward, before considering the task done:

```bash
node scripts/fetch-artist-images.mjs
```

This populates each new pick's `artistImage` field from Spotify, resolved via the pick's own `links.spotify` track (not by searching the artist name — see the comment at the top of the script for why that used to produce wrong photos). It's safe to re-run any time; it regenerates every pick's image, not just missing ones.

Requires `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` in a local `.env` file (gitignored) — see the script's header comment for one-time setup steps if `.env` is missing.

**Why this matters:** Cy tags artists on Instagram using these photos — a wrong or missing image is visible to the artist themselves, not just an internal cosmetic issue.

**Known limitation:** on a multi-artist/collab track, the script uses whichever artist Spotify credits *first* on that exact track — this may not always be the artist Cy most wants to feature/tag. Worth a quick visual sanity check on new collab picks before publishing/tagging.

## Fun facts + artist social handles (research required, never invent)

For every new pick added to `PICKS`, also research and add (on the same artist the `artistImage` is of — i.e. whichever artist Spotify credits first on that track):

- `funFact` — 1–2 sentences, verifiable (label history, chart result, notable collab, artist milestone). Same tone as `info`: direct, no marketing speak.
- `artistInstagram` — the artist's own handle, e.g. `'@cloudriderdj'`.
- `artistTiktok` — same, if they have one.

**Never invent any of these.** Verify via web search (Beatport/label pages, the artist's own linktree, an interview/press piece, or their own Instagram/TikTok profile actually loading). If a fact or handle can't be confidently verified — ambiguous/common artist name, no findable profile, conflicting info — leave the field out entirely rather than guess. Flag the gap to Cy instead of filling it with a low-confidence guess.

These surface in `/?social` mode (see [src/Social.jsx](src/Social.jsx)) — the fun fact goes in the caption text, the handles let Cy tag the artist directly when posting.
