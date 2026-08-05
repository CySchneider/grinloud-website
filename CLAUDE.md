# GRINLOUD.com — working notes for Claude

## Adding new picks to src/data.js

Whenever new pick entries are added to the `PICKS` array in [src/data.js](src/data.js) (e.g. a new Music Radar cycle), run this immediately afterward, before considering the task done:

```bash
node scripts/fetch-artist-images.mjs
```

This populates each new pick's `artistName` / `artistImage` fields from Spotify, resolved via the pick's own `links.spotify` track (not by searching the artist name — see the comment at the top of the script for why that used to produce wrong photos). `artistName`/`artistImage` are always the *primary* artist — whichever Spotify credits first on that track.

**Collab tracks (2+ credited artists):** the script also writes a `coArtists: [{ name, image }, ...]` array — one entry per additional artist Spotify credits on the track, each with their own photo. This is what makes `/?social` show a photo block for every artist on a collab pick, not just the primary one.

It's safe to re-run any time; it regenerates every pick's `artistName`/`artistImage`/`coArtists` (name + image only), not just missing ones. Re-running preserves any `instagram`/`tiktok` you've hand-added to a `coArtists` entry (matched by name) — the script never invents or overwrites those.

Requires `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` in a local `.env` file (gitignored) — see the script's header comment for one-time setup steps if `.env` is missing.

**Why this matters:** Cy tags artists on Instagram using these photos — a wrong or missing image is visible to the artist themselves, not just an internal cosmetic issue.

**Known limitation:** the order Spotify credits artists in on the track doesn't always match the order Cy typed them in the pick's `artist` string — worth a quick visual sanity check on new collab picks before publishing/tagging.

## Fun facts + artist social handles (research required, never invent)

For every new pick added to `PICKS`, also research and add for the **primary** artist (the one `artistName`/`artistImage` is of):

- `funFact` — 1–2 sentences, verifiable (label history, chart result, notable collab, artist milestone). Same tone as `info`: direct, no marketing speak. Only ever written for the primary artist, not co-artists.
- `artistInstagram` — the artist's own handle, e.g. `'@cloudriderdj'`.
- `artistTiktok` — same, if they have one.

**If the pick has `coArtists` (a collab track), also research `instagram` / `tiktok` for each entry in that array** — same rules as above, added directly into that co-artist's object, e.g.:

```js
coArtists: [
  { name: 'Lowderz', image: 'https://i.scdn.co/...', instagram: '@lowderz' },
],
```

**Never invent any of these.** Verify via web search (Beatport/label pages, the artist's own linktree, an interview/press piece, or their own Instagram/TikTok profile actually loading). If a fact or handle can't be confidently verified — ambiguous/common artist name, no findable profile, conflicting info — leave the field out entirely rather than guess. Flag the gap to Cy instead of filling it with a low-confidence guess.

These surface in `/?social` mode (see [src/Social.jsx](src/Social.jsx)) — the fun fact goes in the caption text, and every artist (primary + co-artists) gets its own photo block and handle line so Cy can tag everyone on a collab post.
