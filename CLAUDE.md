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
