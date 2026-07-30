// Generates static, crawlable/shareable detail pages for every published Pick
// of the Day and Music Radar episode, plus the sitemap that lists them all.
//
// Each page ships real title/OG/Twitter/JSON-LD meta tags (readable by
// crawlers that don't run JS) AND the exact same built app bundle used on the
// homepage. The visible body content is a static fallback rendered into
// #root; once the app's JS loads, React mounts and replaces it with the full
// interactive experience, deep-linked to this specific pick/radar via the
// page's own URL (see the /pick/ and /radar/ path parsing in App.jsx). So a
// shared link is both indexable and, when clicked, the real thing.
//
// Runs after `vite build` (see package.json) so it writes straight into
// dist/ and can read the just-built, hashed app bundle tags out of dist/index.html.
import { PICKS, RADAR, PREVIOUS_RADARS } from '../src/data.js';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

const SITE = 'https://grinloud.com';
const OG_IMAGE_DEFAULT = `${SITE}/OG-Graph.jpg`;
// Same timezone the app itself uses to decide what's public (App.jsx).
const TODAY = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Zurich' });

// Pull the real, hashed <script>/<link> tags out of the shell `vite build`
// just produced, so every generated page boots the identical app bundle.
const builtShell = readFileSync(join(DIST, 'index.html'), 'utf-8');
const APP_SCRIPT_TAG = builtShell.match(/<script type="module"[^>]*><\/script>/)?.[0];
const APP_CSS_TAG = builtShell.match(/<link rel="stylesheet"[^>]*>/)?.[0];
if (!APP_SCRIPT_TAG || !APP_CSS_TAG) {
  throw new Error('[generate-static-pages] Could not find the built app <script>/<link> tags in dist/index.html — make sure `vite build` ran first.');
}

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Collapses a raw data genre string (which can be a hybrid like "Tech House
// | Latin Tech" or an outlier like "Mainstage") down to whichever of our
// four core house genres it belongs to, for use in flowing marketing copy —
// the literal raw genre still shows as-is in metadata pills and JSON-LD.
function seoGenre(raw) {
  const g = String(raw || '');
  if (g.includes('Tech House')) return 'Tech House';
  if (g.includes('Bass House')) return 'Bass House';
  if (g.includes('Progressive House')) return 'Progressive House';
  return 'House';
}

// Picks at most 2 core genres out of a set, ordered Tech House / Bass House
// first — those are GRINLOUD's primary SEO targets — so a Radar spanning
// many genres still reads as a clean "X and Y mix" instead of a run-on list.
const GENRE_PRIORITY = ['Tech House', 'Bass House', 'Progressive House', 'House'];
function genreMixPhrase(genres) {
  const present = new Set(genres.map(seoGenre));
  const ordered = GENRE_PRIORITY.filter((g) => present.has(g));
  return ordered.length ? ordered.slice(0, 2).join(' and ') : 'House';
}

function writePage(relPath, html) {
  const dir = join(DIST, relPath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

// Scoped to .gl-fb-* so it can never collide with the real app's styles.css
// — this only styles the pre-hydration fallback, which React fully replaces.
const FALLBACK_STYLE = `
  .gl-fb { background: #FAF7F2; color: #0E0E0E; font-family: 'JetBrains Mono', monospace; padding: 48px 24px 120px; max-width: 680px; margin: 0 auto; }
  .gl-fb a { color: #FF0090; text-decoration: none; }
  .gl-fb a:hover { text-decoration: underline; }
  .gl-fb .gl-fb-back { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: rgba(14,14,14,0.55); margin-bottom: 48px; }
  .gl-fb .gl-fb-eyebrow { font-size: 10px; letter-spacing: 0.18em; opacity: 0.4; margin-bottom: 12px; }
  .gl-fb h1 { font-family: 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.15; margin-bottom: 8px; }
  .gl-fb .gl-fb-sub { font-size: 14px; opacity: 0.7; margin-bottom: 24px; }
  .gl-fb .gl-fb-meta { font-size: 12px; opacity: 0.55; letter-spacing: 0.04em; margin-bottom: 28px; }
  .gl-fb p.gl-fb-info { font-size: 13px; line-height: 1.8; opacity: 0.85; margin-bottom: 36px; max-width: 56ch; }
  .gl-fb p.gl-fb-context { font-size: 12px; line-height: 1.7; opacity: 0.6; max-width: 56ch; margin: -8px 0 32px; }
  .gl-fb p.gl-fb-fact { font-size: 12px; line-height: 1.7; opacity: 0.75; max-width: 56ch; margin: -8px 0 32px; border-top: 1px solid rgba(14,14,14,0.12); padding-top: 16px; }
  .gl-fb p.gl-fb-fact strong { opacity: 0.5; font-size: 10px; letter-spacing: 0.14em; display: block; margin-bottom: 6px; }
  .gl-fb .gl-fb-cta-row { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 48px; }
  .gl-fb .gl-fb-cta { display: inline-flex; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: rgba(14,14,14,0.55); border-bottom: 1px solid rgba(14,14,14,0.3); padding-bottom: 1px; }
  .gl-fb .gl-fb-cta--accent { color: #FF0090; border-color: #FF0090; }
  .gl-fb h2 { font-size: 11px; font-weight: 700; letter-spacing: 0.16em; opacity: 0.45; margin: 0 0 16px; }
  .gl-fb .gl-fb-tracklist { list-style: none; }
  .gl-fb .gl-fb-track { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid rgba(14,14,14,0.08); font-size: 13px; }
  .gl-fb .gl-fb-track__n { opacity: 0.35; width: 24px; flex-shrink: 0; }
  .gl-fb .gl-fb-track__title { font-weight: 600; }
  .gl-fb .gl-fb-track__artist { opacity: 0.6; }
  .gl-fb .gl-fb-track__meta { opacity: 0.4; font-size: 11px; margin-left: auto; white-space: nowrap; padding-left: 12px; }
  .gl-fb hr { border: none; border-top: 1px solid rgba(14,14,14,0.1); margin: 48px 0; }
`;

function head({ title, desc, url, ogType, image, jsonLd }) {
  return `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<!-- This page lives at a nested path (/pick/.../ or /radar/.../) but the app's
     own assets (logo, background videos, cover images) are referenced with
     relative, no-leading-slash paths that assume they run at "/". <base>
     forces those relative URLs back to the site root once the app hydrates. -->
<base href="/">
<link rel="icon" type="image/png" href="/grinloud-smiley-2026.png" />
<link rel="apple-touch-icon" href="/grinloud-smiley-2026.png" />
<link rel="canonical" href="${url}" />
<meta name="description" content="${esc(desc)}" />
<meta property="og:type" content="${ogType}" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${image}" />
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=UnifrakturMaguntia&family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
${APP_CSS_TAG}
${APP_SCRIPT_TAG}
<style>${FALLBACK_STYLE}</style>`;
}

// Only ever generate pages for what's actually public today — mirrors the
// exact visibility rules App.jsx uses, so a static page can never leak an
// unpublished Pick or an embargoed Radar ahead of its liveDate.
const publicPicks = PICKS.filter((p) => p.date <= TODAY);
const radarActuallyLive = !RADAR.liveDate || TODAY >= RADAR.liveDate;
const publicRadars = [...(radarActuallyLive ? [RADAR] : []), ...PREVIOUS_RADARS];

// ── Pick of the Day pages ───────────────────────────────────────────────
const pickUrls = [];
for (const pick of publicPicks) {
  const url = `${SITE}/pick/${pick.date}/`;
  const title = `${pick.title} — ${pick.artist} · GRINLOUD Pick of the Day`;
  const desc = pick.info || pick.short || `${pick.title} by ${pick.artist} — ${pick.genre}, curated by GRINLOUD.`;
  const spotify = pick.links?.spotify && pick.links.spotify !== '#' ? pick.links.spotify : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: pick.title,
    byArtist: { '@type': 'MusicGroup', name: pick.artist },
    genre: pick.genre,
    datePublished: pick.date,
    url: spotify || url,
    description: desc,
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${head({ title, desc, url, ogType: 'music.song', image: OG_IMAGE_DEFAULT, jsonLd })}
</head>
<body>
  <div id="root"><div class="gl-fb">
    <a href="/" class="gl-fb-back">← GRINLOUD</a>
    <div class="gl-fb-eyebrow">GRINLOUD · PICK OF THE DAY · ${pick.date}</div>
    <h1>${esc(pick.title)}</h1>
    <div class="gl-fb-sub">${esc(pick.artist)}</div>
    <div class="gl-fb-meta">${esc(pick.genre)} · ${pick.bpm} BPM · ${esc(pick.key)}${pick.label ? ` · ${esc(pick.label)}` : ''}</div>
    <p class="gl-fb-info">${esc(desc)}</p>
    ${pick.funFact ? `<p class="gl-fb-fact"><strong>THE DETAILS</strong>${esc(pick.funFact)}</p>` : ''}
    <div class="gl-fb-cta-row">
      ${spotify ? `<a class="gl-fb-cta gl-fb-cta--accent" href="${spotify}" target="_blank" rel="noreferrer">LISTEN ON SPOTIFY →</a>` : ''}
      <a class="gl-fb-cta" href="/">MORE PICKS →</a>
    </div>
    <p class="gl-fb-context">Part of GRINLOUD's daily ${seoGenre(pick.genre)} picks — new ${seoGenre(pick.genre)} tracks, hand-picked one at a time and mixed into the GRINLOUD Music Radar ${seoGenre(pick.genre)} mix every 10 days. <a href="/about.html">More about GRINLOUD</a>.</p>
    <hr>
    <p style="font-size:11px; opacity:0.35;"><a href="/about.html">About</a> · <a href="/privacy.html">Privacy</a> · <a href="/impressum.html">Impressum</a></p>
  </div></div>
</body>
</html>`;

  writePage(`pick/${pick.date}`, html);
  pickUrls.push({ loc: url, lastmod: pick.date, changefreq: 'yearly', priority: '0.6' });
}

// ── Music Radar pages ────────────────────────────────────────────────────
const radarUrls = [];
for (const radar of publicRadars) {
  const url = `${SITE}/radar/${radar.number}/`;
  const title = `Music Radar ${radar.number} — ${radar.subtitle || radar.title} · GRINLOUD`;
  const trackCount = radar.tracks?.length || 10;
  const subtitle = radar.subtitle ? radar.subtitle.replace(/\.$/, '') : '';
  // Genres actually present in this Radar's tracklist, so the mix is
  // described by what it really contains instead of the full genre roster.
  const genrePhrase = genreMixPhrase((radar.tracks || []).map((t) => t.genre));
  const desc = `GRINLOUD Music Radar ${radar.number}: a ${genrePhrase} mix of ${trackCount} new tracks${subtitle ? ` — ${subtitle}` : ''}, hand-picked and mixed together every 10 days.`;
  const image = radar.cover ? `${SITE}/${encodeURIComponent(radar.cover)}` : OG_IMAGE_DEFAULT;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicPlaylist',
    name: radar.title,
    url,
    numTracks: trackCount,
    track: (radar.tracks || []).map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'MusicRecording',
        name: t.title,
        byArtist: { '@type': 'MusicGroup', name: t.artist },
        genre: t.genre,
      },
    })),
  };

  const tracklistHtml = (radar.tracks || []).map((t) => `
      <li class="gl-fb-track">
        <span class="gl-fb-track__n">${t.n}</span>
        <span><span class="gl-fb-track__title">${esc(t.title)}</span><br><span class="gl-fb-track__artist">${esc(t.artist)}</span></span>
        <span class="gl-fb-track__meta">${esc(t.genre)} · ${t.bpm} BPM · ${esc(t.key)}</span>
      </li>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${head({ title, desc, url, ogType: 'music.playlist', image, jsonLd })}
</head>
<body>
  <div id="root"><div class="gl-fb">
    <a href="/" class="gl-fb-back">← GRINLOUD</a>
    <div class="gl-fb-eyebrow">GRINLOUD · MUSIC RADAR · ${radar.date}</div>
    <h1>Music Radar ${radar.number}</h1>
    <div class="gl-fb-sub">${esc(radar.subtitle || '')}</div>
    <div class="gl-fb-meta">${trackCount} TRACKS${radar.duration ? ` · ${esc(radar.duration)}` : ''}</div>
    <div class="gl-fb-cta-row">
      ${radar.spotifyUrl ? `<a class="gl-fb-cta gl-fb-cta--accent" href="${radar.spotifyUrl}" target="_blank" rel="noreferrer">PLAY ON SPOTIFY →</a>` : ''}
      <a class="gl-fb-cta" href="/">MORE PICKS →</a>
    </div>
    <h2>TRACKLIST</h2>
    <ul class="gl-fb-tracklist">${tracklistHtml}
    </ul>
    <p class="gl-fb-context">GRINLOUD Music Radar is a ${genrePhrase} mix — ${trackCount} new tracks, hand-picked and mixed together into one set every 10 days. <a href="/about.html">More about GRINLOUD</a>.</p>
    <hr>
    <p style="font-size:11px; opacity:0.35;"><a href="/about.html">About</a> · <a href="/privacy.html">Privacy</a> · <a href="/impressum.html">Impressum</a></p>
  </div></div>
</body>
</html>`;

  writePage(`radar/${radar.number}`, html);
  radarUrls.push({ loc: url, lastmod: radar.liveDate || TODAY, changefreq: 'monthly', priority: '0.7' });
}

// ── Homepage fallback content ───────────────────────────────────────────
// `vite build` ships index.html with an empty <div id="root"></div> and a
// generic, never-changing <title>/description — nothing for a crawler that
// doesn't execute JS, and a snippet that never reflects today's actual Pick
// even for ones that do. Stamp in the same static-fallback + per-pick meta
// this file already gives every /pick/ page, keyed to the current public
// pick, so "/" itself always has real, current content and metadata as of
// the last build (same freshness window as the rest of this script's output
// — see functions/_middleware.js for how same-day gaps are covered live).
const homePick = publicPicks[0];
if (homePick) {
  const title = `${homePick.title} — ${homePick.artist} · GRINLOUD`;
  const desc = homePick.info || homePick.short || `${homePick.title} by ${homePick.artist} — ${homePick.genre}, curated by GRINLOUD.`;
  const spotify = homePick.links?.spotify && homePick.links.spotify !== '#' ? homePick.links.spotify : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: homePick.title,
    byArtist: { '@type': 'MusicGroup', name: homePick.artist },
    genre: homePick.genre,
    datePublished: homePick.date,
    url: spotify || `${SITE}/`,
    description: desc,
  };

  const fallbackBody = `<div class="gl-fb">
    <div class="gl-fb-eyebrow">GRINLOUD · PICK OF THE DAY · ${homePick.date}</div>
    <h1>${esc(homePick.title)}</h1>
    <div class="gl-fb-sub">${esc(homePick.artist)}</div>
    <div class="gl-fb-meta">${esc(homePick.genre)} · ${homePick.bpm} BPM · ${esc(homePick.key)}${homePick.label ? ` · ${esc(homePick.label)}` : ''}</div>
    <p class="gl-fb-info">${esc(desc)}</p>
    ${homePick.funFact ? `<p class="gl-fb-fact"><strong>THE DETAILS</strong>${esc(homePick.funFact)}</p>` : ''}
    <div class="gl-fb-cta-row">
      ${spotify ? `<a class="gl-fb-cta gl-fb-cta--accent" href="${spotify}" target="_blank" rel="noreferrer">LISTEN ON SPOTIFY →</a>` : ''}
      <a class="gl-fb-cta" href="/about.html">ABOUT GRINLOUD →</a>
    </div>
    <p class="gl-fb-context">Today's ${seoGenre(homePick.genre)} Pick of the Day is part of GRINLOUD's daily ${seoGenre(homePick.genre)} picks. Every 10 days, the GRINLOUD Music Radar mixes 10 new Tech House and Bass House tracks into one set. <a href="/about.html">More about GRINLOUD</a>.</p>
  </div>`;

  const patchedHome = builtShell
    .replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:title"\s+content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta name="twitter:title"\s+content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace('<div id="root"></div>', `<div id="root">${fallbackBody}</div>`)
    .replace('</head>', `<script id="ld-pick" type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n<style>${FALLBACK_STYLE}</style>\n</head>`);

  writeFileSync(join(DIST, 'index.html'), patchedHome);
  console.log(`[generate-static-pages] Homepage fallback stamped for "${homePick.title} — ${homePick.artist}" (${homePick.date}).`);
}

// ── Sitemap ──────────────────────────────────────────────────────────────
const staticUrls = [
  { loc: `${SITE}/`, lastmod: TODAY, changefreq: 'daily', priority: '1.0' },
  { loc: `${SITE}/news.html`, lastmod: TODAY, changefreq: 'weekly', priority: '0.6' },
  { loc: `${SITE}/about.html`, lastmod: TODAY, changefreq: 'monthly', priority: '0.5' },
  { loc: `${SITE}/privacy.html`, lastmod: TODAY, changefreq: 'yearly', priority: '0.2' },
  { loc: `${SITE}/impressum.html`, lastmod: TODAY, changefreq: 'yearly', priority: '0.2' },
];

const allUrls = [...staticUrls, ...radarUrls, ...pickUrls];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

writeFileSync(join(DIST, 'sitemap.xml'), sitemap);

console.log(`[generate-static-pages] ${pickUrls.length} pick pages, ${radarUrls.length} radar pages (of ${PICKS.length} picks / ${1 + PREVIOUS_RADARS.length} radars total), sitemap with ${allUrls.length} URLs.`);
