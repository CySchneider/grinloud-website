// Populates the `artistImage` field on every pick in src/data.js's PICKS
// array from Spotify's Web API.
//
// v3 — looks up each pick's own Spotify TRACK (already stored as
// `links.spotify` on every pick) and takes whichever artist Spotify has
// actually credited on that exact track, then fetches that artist's photo.
// This replaces the earlier name-search approach entirely: searching by
// artist NAME requires picking the "right" one out of everyone on Spotify
// who shares that name, and the disambiguation signal this script relied on
// (the `popularity` field) turned out to no longer be returned by Spotify's
// search endpoint for this app — silently making the tie-break a coin flip.
// Two different accounts named "Marta" exist on Spotify, for instance, and
// name search alone can't tell which one is the Toronto DJ in our data.
// Going via the track sidesteps the whole problem: there's no ambiguity in
// "who is credited on THIS track."
//
// Setup (one-time, free):
//   1. https://developer.spotify.com/dashboard -> Create app (any name/redirect
//      URI works, e.g. http://localhost:5173 — this script never uses OAuth
//      login, just the Client Credentials flow, so the redirect URI is never
//      actually hit).
//   2. Copy the Client ID and Client Secret into a `.env` file at the repo
//      root (already gitignored):
//        SPOTIFY_CLIENT_ID=xxxx
//        SPOTIFY_CLIENT_SECRET=xxxx
//
// Run: node scripts/fetch-artist-images.mjs
// Regenerates EVERY pick's artistImage (not just missing ones) — safe to
// re-run any time. A pick is only left without an artistImage if its
// Spotify link is missing/unparseable, or the credited artist has no photo
// on Spotify at all.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DATA_PATH = new URL('../src/data.js', import.meta.url);
const ENV_PATH = new URL('../.env', import.meta.url);

function loadEnv() {
  if (existsSync(ENV_PATH)) {
    for (const line of readFileSync(ENV_PATH, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}
loadEnv();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET.\nAdd them to a .env file at the repo root — see the comment at the top of this script for setup steps.');
  process.exit(1);
}

async function getAccessToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  const { access_token } = await res.json();
  return access_token;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DELAY_MS = 60;

// Spotify's batched "Get Several Tracks/Artists" (?ids=a,b,c) endpoints
// return 403 Forbidden for this app's access tier — the singular
// /v1/tracks/{id} and /v1/artists/{id} endpoints work fine, just one
// request per item instead of one per 50.
async function fetchByIds(ids, token, kind) {
  const map = new Map();
  for (const id of ids) {
    const res = await fetch(`https://api.spotify.com/v1/${kind}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await sleep(DELAY_MS);
    if (res.ok) map.set(id, await res.json());
  }
  return map;
}

async function main() {
  const token = await getAccessToken();
  const src = readFileSync(DATA_PATH, 'utf8');
  const lines = src.split('\n');

  const picksStart = lines.findIndex((l) => l.startsWith('const PICKS = ['));
  const picksEnd = lines.findIndex((l, i) => i > picksStart && l.trim() === '];');
  if (picksStart === -1 || picksEnd === -1) throw new Error('Could not locate PICKS array bounds in data.js');

  const jobs = [];
  let current = null;
  for (let i = picksStart; i < picksEnd; i++) {
    const line = lines[i];
    const idMatch = line.match(/^\s*id: '(pick-[\d-]+)'/);
    if (idMatch) { current = { id: idMatch[1], artist: null, imageLine: null }; continue; }
    if (!current) continue;
    // Most `artist:` values are single-quoted, but ones containing an
    // apostrophe (e.g. "DETROIT'S FILTHIEST") are written double-quoted
    // instead — match either. (Only used for the miss report, not matching.)
    const artistMatch = line.match(/^\s*artist: '([^']*)'/) || line.match(/^\s*artist: "([^"]*)"/);
    if (artistMatch) current.artist = artistMatch[1];
    if (line.includes('artistImage:')) current.imageLine = i;
    if (line.match(/^\s*links: \{/)) {
      const trackMatch = line.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/);
      current.trackId = trackMatch ? trackMatch[1] : null;
      current.linksLine = i;
      jobs.push(current);
      current = null;
    }
  }

  console.log(`${jobs.length} picks total.\n`);

  const withTrack = jobs.filter((j) => j.trackId);
  const noTrack = jobs.filter((j) => !j.trackId);

  console.log(`Fetching ${withTrack.length} tracks from Spotify...`);
  const trackIds = [...new Set(withTrack.map((j) => j.trackId))];
  const tracksById = await fetchByIds(trackIds, token, 'tracks');

  const artistIds = [...new Set(
    withTrack.map((j) => tracksById.get(j.trackId)?.artists?.[0]?.id).filter(Boolean)
  )];
  console.log(`Fetching ${artistIds.length} distinct credited artists...\n`);
  const artistsById = await fetchByIds(artistIds, token, 'artists');

  // Both kinds of edit ("remove this existing artistImage line", "insert a
  // new one here") reference line numbers in the ORIGINAL, unmodified
  // `lines` array — so they must be applied together in one single
  // bottom-to-top pass. Doing all removals first, then all insertions
  // mutates `lines` in between, silently invalidating every insertion index
  // that came after a removed line.
  const edits = []; // { atLine, kind: 'remove' } | { atLine, kind: 'insert', text }
  const misses = [];

  for (const job of jobs) {
    process.stdout.write(`${job.id}  ${(job.artist || '?').padEnd(32)} `);

    if (job.imageLine != null) edits.push({ atLine: job.imageLine, kind: 'remove' });

    if (!job.trackId) {
      console.log('no parseable Spotify track link — clearing field');
      misses.push({ ...job, reason: 'no Spotify track link' });
      continue;
    }
    const track = tracksById.get(job.trackId);
    if (!track) {
      console.log('track not found on Spotify — clearing field');
      misses.push({ ...job, reason: 'track lookup failed' });
      continue;
    }
    const creditedArtist = track.artists?.[0];
    const artist = creditedArtist && artistsById.get(creditedArtist.id);
    const image = artist?.images?.[0];
    if (!image) {
      console.log(`${creditedArtist?.name ?? 'unknown'} has no photo on Spotify — clearing field`);
      misses.push({ ...job, reason: `${creditedArtist?.name ?? 'unknown'} has no Spotify photo` });
      continue;
    }
    console.log(`-> ${artist.name}`);
    const anchorLine = job.imageLine ?? job.linksLine;
    const indent = lines[anchorLine].match(/^(\s*)/)[1];
    edits.push({ atLine: job.linksLine, kind: 'insert', text: `${indent}artistImage: '${image.url}',` });
  }

  // Single bottom-to-top pass, both edit kinds interleaved by original line
  // number — see the comment on `edits` above for why this must not be two
  // separate passes.
  edits.sort((a, b) => b.atLine - a.atLine);
  for (const edit of edits) {
    if (edit.kind === 'remove') lines.splice(edit.atLine, 1);
    else lines.splice(edit.atLine, 0, edit.text);
  }

  writeFileSync(DATA_PATH, lines.join('\n'));

  const setCount = edits.filter((e) => e.kind === 'insert').length;
  console.log(`\nDone. ${setCount} artistImage fields set from Spotify, ${misses.length} cleared (no confident match).`);
  if (misses.length) {
    console.log(`\nPicks now without an image (add manually if you have a preferred photo URL):`);
    for (const m of misses) console.log(`  - ${m.id}: ${m.artist} (${m.reason})`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
