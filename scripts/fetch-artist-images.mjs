// Populates the `artistName` / `artistImage` fields (primary artist) and the
// `coArtists` array (every other credited artist) on each pick in
// src/data.js's PICKS array, from Spotify's Web API.
//
// v4 — looks up each pick's own Spotify TRACK (already stored as
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
// On a collab track, Spotify credits more than one artist. This script now
// fetches ALL of them: artists[0] becomes `artistName` / `artistImage` (the
// "primary" — same as before), and every other credited artist becomes an
// entry in `coArtists: [{ name, image, instagram, tiktok }]`. Only `name`
// and `image` are ever written by this script — `instagram` / `tiktok` are
// hand-researched (see CLAUDE.md) and preserved across re-runs by matching
// on `name`, the same way this script has always left `artistInstagram` /
// `artistTiktok` / `funFact` alone.
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
// Regenerates EVERY pick's artistName/artistImage/coArtists (not just
// missing ones) — safe to re-run any time. A pick is only left without a
// primary image if its Spotify link is missing/unparseable, or the credited
// artist has no photo on Spotify at all.

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

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
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
    if (idMatch) {
      current = { id: idMatch[1], artist: null, nameLine: null, imageLine: null, coArtistsStart: null, coArtistsEnd: null, existingCoArtists: [] };
      continue;
    }
    if (!current) continue;
    // Most `artist:` values are single-quoted, but ones containing an
    // apostrophe (e.g. "DETROIT'S FILTHIEST") are written double-quoted
    // instead — match either. (Only used for the console report, not matching.)
    const artistMatch = line.match(/^\s*artist: '([^']*)'/) || line.match(/^\s*artist: "([^"]*)"/);
    if (artistMatch) current.artist = artistMatch[1];
    if (line.match(/^\s*artistName: /)) { current.nameLine = i; continue; }
    if (line.includes('artistImage:')) { current.imageLine = i; continue; }
    if (line.match(/^\s*coArtists: \[\s*$/)) {
      const start = i;
      let j = i + 1;
      while (j < picksEnd && !lines[j].match(/^\s*\],?\s*$/)) {
        const nameM = lines[j].match(/name: '((?:\\.|[^'\\])*)'/);
        const igM = lines[j].match(/instagram: '((?:\\.|[^'\\])*)'/);
        const ttM = lines[j].match(/tiktok: '((?:\\.|[^'\\])*)'/);
        if (nameM) {
          current.existingCoArtists.push({
            name: nameM[1].replace(/\\(.)/g, '$1'),
            instagram: igM ? igM[1].replace(/\\(.)/g, '$1') : undefined,
            tiktok: ttM ? ttM[1].replace(/\\(.)/g, '$1') : undefined,
          });
        }
        j++;
      }
      current.coArtistsStart = start;
      current.coArtistsEnd = j; // line index of the closing '],'
      i = j;
      continue;
    }
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

  // Every credited artist on every track — not just the first — since
  // co-artists now need photos too.
  const artistIds = [...new Set(
    withTrack.flatMap((j) => tracksById.get(j.trackId)?.artists?.map((a) => a.id) ?? []).filter(Boolean)
  )];
  console.log(`Fetching ${artistIds.length} distinct credited artists...\n`);
  const artistsById = await fetchByIds(artistIds, token, 'artists');

  // All edits ("remove this existing line/block", "insert new lines here")
  // reference line numbers in the ORIGINAL, unmodified `lines` array — so
  // they must be applied together in one single bottom-to-top pass. Doing
  // all removals first, then all insertions mutates `lines` in between,
  // silently invalidating every insertion index that came after a removed
  // line/block.
  const edits = []; // { atLine, kind: 'remove' | 'removeRange', count? } | { atLine, kind: 'insert', text }
  const misses = [];

  for (const job of jobs) {
    process.stdout.write(`${job.id}  ${(job.artist || '?').padEnd(32)} `);

    if (job.coArtistsStart != null) edits.push({ atLine: job.coArtistsStart, kind: 'removeRange', count: job.coArtistsEnd - job.coArtistsStart + 1 });
    if (job.imageLine != null) edits.push({ atLine: job.imageLine, kind: 'remove' });
    if (job.nameLine != null) edits.push({ atLine: job.nameLine, kind: 'remove' });

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
    const credits = track.artists || [];
    const primaryCredit = credits[0];
    const primary = primaryCredit && artistsById.get(primaryCredit.id);
    const primaryImage = primary?.images?.[0];
    if (!primaryImage) {
      console.log(`${primaryCredit?.name ?? 'unknown'} has no photo on Spotify — clearing field`);
      misses.push({ ...job, reason: `${primaryCredit?.name ?? 'unknown'} has no Spotify photo` });
      continue;
    }

    const indent = lines[job.linksLine].match(/^(\s*)/)[1];
    const insertLines = [
      `${indent}artistName: '${esc(primary.name)}',`,
      `${indent}artistImage: '${primaryImage.url}',`,
    ];

    const coCredits = credits.slice(1);
    let coNote = '';
    if (coCredits.length) {
      const coLines = [];
      const reportBits = [];
      for (const credit of coCredits) {
        const art = artistsById.get(credit.id);
        const name = art?.name || credit.name;
        const image = art?.images?.[0]?.url;
        const preserved = job.existingCoArtists.find((e) => e.name === name);
        const parts = [`name: '${esc(name)}'`];
        if (image) parts.push(`image: '${image}'`);
        if (preserved?.instagram) parts.push(`instagram: '${esc(preserved.instagram)}'`);
        if (preserved?.tiktok) parts.push(`tiktok: '${esc(preserved.tiktok)}'`);
        coLines.push(`${indent}  { ${parts.join(', ')} },`);
        reportBits.push(image ? name : `${name} (no photo)`);
      }
      insertLines.push(`${indent}coArtists: [`, ...coLines, `${indent}],`);
      coNote = ` + ${reportBits.join(', ')}`;
    }

    console.log(`-> ${primary.name}${coNote}`);
    edits.push({ atLine: job.linksLine, kind: 'insert', text: insertLines.join('\n') });
  }

  // Single bottom-to-top pass, all edit kinds interleaved by original line
  // number — see the comment on `edits` above for why this must not be
  // split into separate passes.
  edits.sort((a, b) => b.atLine - a.atLine);
  for (const edit of edits) {
    if (edit.kind === 'remove') lines.splice(edit.atLine, 1);
    else if (edit.kind === 'removeRange') lines.splice(edit.atLine, edit.count);
    else lines.splice(edit.atLine, 0, edit.text);
  }

  writeFileSync(DATA_PATH, lines.join('\n'));

  const setCount = edits.filter((e) => e.kind === 'insert').length;
  console.log(`\nDone. ${setCount} picks updated with artist photo(s), ${misses.length} cleared (no confident match).`);
  if (misses.length) {
    console.log(`\nPicks now without an image (add manually if you have a preferred photo URL):`);
    for (const m of misses) console.log(`  - ${m.id}: ${m.artist} (${m.reason})`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
