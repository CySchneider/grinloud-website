// One-time backfill: populates the `artistImage` field on every pick in
// src/data.js's PICKS array that's missing one, sourced from Deezer's public
// artist search API (no auth/API key required — unlike Spotify's Web API,
// which needs a Client ID/Secret we don't have).
//
// Deezer returns a generic grey-silhouette avatar for artists it has no
// real photo for. There are (at least) two variants of it: a per-artist
// random-hash copy and a shared one at the literal MD5-of-empty-string path
// (d41d8cd9...) — different URLs, but pixel-identical content each time.
// We fetch each candidate's 500x500 image and compare its content hash
// against both known placeholder hashes, falling through to the next search
// result instead of writing a placeholder into data.js. (An earlier version
// of this script only checked byte length against one variant and missed
// the other — always verify against real bytes, not a single sample.)
//
// Run: node scripts/fetch-artist-images.mjs
// Safe to re-run — only touches picks where artistImage is still missing.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const DATA_PATH = new URL('../src/data.js', import.meta.url);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const PLACEHOLDER_MD5S = new Set([
  '786c9a9535eee5d3571cc8170e220d13', // per-artist random-hash silhouette
  'c9d19c4bba2c1605876c762729974916', // shared d41d8cd9... silhouette
]);
const DELAY_MS = 200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Deezer's fuzzy search sometimes returns a completely unrelated artist as
// its top hit for an obscure/misspelled name (seen live: "SNOOKO" -> "Snoop
// Dogg", "BONAFIQUE" -> "Nomadique", "ANYMA × LISA" -> "Anomalisa") — always
// with a real (non-placeholder) photo, so the placeholder filter alone
// doesn't catch it. Require the normalized names to actually match before
// accepting a candidate at all.
const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
function namesMatch(query, candidate) {
  const nq = normalize(query);
  const nc = normalize(candidate);
  if (!nq || !nc) return false;
  if (nq === nc) return true;
  return nq.length >= 4 && (nc.includes(nq) || nq.includes(nc));
}

async function searchArtistImage(name) {
  const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=5`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const { data } = await res.json();
  if (!data || !data.length) return null;

  // Prefer a close name match among the results, but still try every
  // candidate in ranked order if the best match turns out to be a
  // placeholder-photo artist.
  const ranked = [...data].sort((a, b) => {
    const an = a.name.toLowerCase() === name.toLowerCase() ? 0 : 1;
    const bn = b.name.toLowerCase() === name.toLowerCase() ? 0 : 1;
    return an - bn;
  });

  for (const candidate of ranked) {
    if (!candidate.picture_big) continue;
    if (!namesMatch(name, candidate.name)) continue;
    const imgRes = await fetch(candidate.picture_big, { headers: { 'User-Agent': UA } });
    if (!imgRes.ok) continue;
    const buf = Buffer.from(await imgRes.arrayBuffer());
    await sleep(DELAY_MS);
    const md5 = createHash('md5').update(buf).digest('hex');
    if (PLACEHOLDER_MD5S.has(md5)) continue; // generic silhouette — skip
    return { url: candidate.picture_xl, matchedName: candidate.name };
  }
  return null;
}

function mainArtistName(artistField) {
  const first = artistField.split(',')[0].trim();
  // Strip trailing disambiguation tags like "(CA)" / "(AUS)" for the search
  // query — Deezer matches better on the bare name.
  return first.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

async function main() {
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
    if (idMatch) { current = { id: idMatch[1], hasImage: false, artist: null, linksLine: null }; continue; }
    if (!current) continue;
    const artistMatch = line.match(/^\s*artist: '([^']*)'/);
    if (artistMatch) current.artist = artistMatch[1];
    if (line.includes('artistImage:')) current.hasImage = true;
    if (line.match(/^\s*links: \{/)) {
      current.linksLine = i;
      jobs.push(current);
      current = null;
    }
  }

  const todo = jobs.filter((j) => !j.hasImage && j.artist);
  console.log(`${jobs.length} picks total, ${todo.length} missing artistImage.\n`);

  const insertions = []; // { atLine, text }
  const misses = [];

  for (const job of todo) {
    const name = mainArtistName(job.artist);
    process.stdout.write(`${job.id}  ${name.padEnd(28)} `);
    let result = null;
    try {
      result = await searchArtistImage(name);
    } catch (err) {
      console.log(`ERROR (${err.message})`);
      misses.push({ ...job, name, reason: err.message });
      continue;
    }
    if (!result) {
      console.log('no usable photo found');
      misses.push({ ...job, name, reason: 'no usable photo found' });
      continue;
    }
    console.log(`-> ${result.matchedName}`);
    const indent = lines[job.linksLine].match(/^(\s*)/)[1];
    insertions.push({ atLine: job.linksLine, text: `${indent}artistImage: '${result.url}',` });
    await sleep(DELAY_MS);
  }

  // Apply insertions bottom-to-top so earlier line indices stay valid.
  insertions.sort((a, b) => b.atLine - a.atLine);
  for (const { atLine, text } of insertions) {
    lines.splice(atLine, 0, text);
  }

  writeFileSync(DATA_PATH, lines.join('\n'));

  console.log(`\nDone. ${insertions.length} artistImage fields added.`);
  if (misses.length) {
    console.log(`\n${misses.length} picks still without an image (add manually):`);
    for (const m of misses) console.log(`  - ${m.id}: ${m.name} (${m.reason})`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
