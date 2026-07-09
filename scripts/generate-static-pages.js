// Generates static, crawlable/shareable detail pages for every Pick of the Day
// and every Music Radar episode, plus the sitemap that lists them all.
// Runs after `vite build` (see package.json) so it writes straight into dist/.
import { PICKS, RADAR, PREVIOUS_RADARS } from '../src/data.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

const SITE = 'https://grinloud.com';
const OG_IMAGE_DEFAULT = `${SITE}/OG-Graph.jpg`;
const TODAY = new Date().toISOString().slice(0, 10);

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function writePage(relPath, html) {
  const dir = join(DIST, relPath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

const PAGE_STYLE = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0A0A; color: #F5F2EE; font-family: 'JetBrains Mono', monospace; padding: 48px 24px 120px; max-width: 680px; margin: 0 auto; }
  a { color: #FFE000; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .back { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; border: 1.5px solid rgba(245,242,238,0.3); padding: 8px 16px; border-radius: 999px; margin-bottom: 48px; }
  .eyebrow { font-size: 10px; letter-spacing: 0.18em; opacity: 0.45; margin-bottom: 12px; }
  h1 { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 8px; }
  .sub { font-size: 14px; opacity: 0.7; margin-bottom: 24px; }
  .meta { font-size: 12px; opacity: 0.55; letter-spacing: 0.04em; margin-bottom: 28px; }
  p.info { font-size: 13px; line-height: 1.8; opacity: 0.85; margin-bottom: 36px; max-width: 56ch; }
  .cta-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }
  .cta { display: inline-flex; padding: 10px 20px; border: 1.5px solid rgba(245,242,238,0.3); border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #F5F2EE; }
  .cta--accent { background: #FFE000; border-color: #FFE000; color: #0A0A0A; }
  h2 { font-size: 11px; font-weight: 700; letter-spacing: 0.16em; opacity: 0.5; margin: 0 0 16px; }
  .tracklist { list-style: none; }
  .track { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid rgba(245,242,238,0.08); font-size: 13px; }
  .track__n { opacity: 0.35; width: 24px; flex-shrink: 0; }
  .track__title { font-weight: 600; }
  .track__artist { opacity: 0.6; }
  .track__meta { opacity: 0.4; font-size: 11px; margin-left: auto; white-space: nowrap; padding-left: 12px; }
  hr { border: none; border-top: 1px solid rgba(245,242,238,0.1); margin: 48px 0; }
`;

function head({ title, desc, url, ogType, image, jsonLd }) {
  return `<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
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
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="preconnect" href="https://static.cloudflareinsights.com">
<script async src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "b9dab09245b944069c482cf974dd117c"}'></script>
<style>${PAGE_STYLE}</style>`;
}

// ── Pick of the Day pages ───────────────────────────────────────────────
const pickUrls = [];
for (const pick of PICKS) {
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
  <a href="/" class="back">← GRINLOUD</a>
  <div class="eyebrow">GRINLOUD · PICK OF THE DAY · ${pick.date}</div>
  <h1>${esc(pick.title)}</h1>
  <div class="sub">${esc(pick.artist)}</div>
  <div class="meta">${esc(pick.genre)} · ${pick.bpm} BPM · ${esc(pick.key)}${pick.label ? ` · ${esc(pick.label)}` : ''}</div>
  <p class="info">${esc(desc)}</p>
  <div class="cta-row">
    ${spotify ? `<a class="cta cta--accent" href="${spotify}" target="_blank" rel="noreferrer">LISTEN ON SPOTIFY →</a>` : ''}
    <a class="cta" href="/">MORE PICKS →</a>
  </div>
  <hr>
  <p style="font-size:11px; opacity:0.35;"><a href="/about.html">About</a> · <a href="/privacy.html">Privacy</a> · <a href="/impressum.html">Impressum</a></p>
</body>
</html>`;

  writePage(`pick/${pick.date}`, html);
  pickUrls.push({ loc: url, lastmod: pick.date, changefreq: 'yearly', priority: '0.6' });
}

// ── Music Radar pages ────────────────────────────────────────────────────
const radarUrls = [];
for (const radar of [RADAR, ...PREVIOUS_RADARS]) {
  const url = `${SITE}/radar/${radar.number}/`;
  const title = `Music Radar ${radar.number} — ${radar.subtitle || radar.title} · GRINLOUD`;
  const trackCount = radar.tracks?.length || 10;
  const subtitle = radar.subtitle ? radar.subtitle.replace(/\.$/, '') : '';
  const desc = `${radar.title}${subtitle ? `: ${subtitle}` : ''}. ${trackCount} tracks curated by GRINLOUD — House, Tech House, Progressive, Bass House. ${radar.date}.`;
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
    <li class="track">
      <span class="track__n">${t.n}</span>
      <span><span class="track__title">${esc(t.title)}</span><br><span class="track__artist">${esc(t.artist)}</span></span>
      <span class="track__meta">${esc(t.genre)} · ${t.bpm} BPM · ${esc(t.key)}</span>
    </li>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${head({ title, desc, url, ogType: 'music.playlist', image, jsonLd })}
</head>
<body>
  <a href="/" class="back">← GRINLOUD</a>
  <div class="eyebrow">GRINLOUD · MUSIC RADAR · ${radar.date}</div>
  <h1>Music Radar ${radar.number}</h1>
  <div class="sub">${esc(radar.subtitle || '')}</div>
  <div class="meta">${trackCount} TRACKS${radar.duration ? ` · ${esc(radar.duration)}` : ''}</div>
  <div class="cta-row">
    ${radar.spotifyUrl ? `<a class="cta cta--accent" href="${radar.spotifyUrl}" target="_blank" rel="noreferrer">PLAY ON SPOTIFY →</a>` : ''}
    <a class="cta" href="/?music-radar=${radar.number}">OPEN IN GRINLOUD →</a>
  </div>
  <h2>TRACKLIST</h2>
  <ul class="tracklist">${tracklistHtml}
  </ul>
  <hr>
  <p style="font-size:11px; opacity:0.35;"><a href="/about.html">About</a> · <a href="/privacy.html">Privacy</a> · <a href="/impressum.html">Impressum</a></p>
</body>
</html>`;

  writePage(`radar/${radar.number}`, html);
  radarUrls.push({ loc: url, lastmod: radar.liveDate || TODAY, changefreq: 'monthly', priority: '0.7' });
}

// ── Sitemap ──────────────────────────────────────────────────────────────
const staticUrls = [
  { loc: `${SITE}/`, lastmod: TODAY, changefreq: 'daily', priority: '1.0' },
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

console.log(`[generate-static-pages] ${pickUrls.length} pick pages, ${radarUrls.length} radar pages, sitemap with ${allUrls.length} URLs.`);
