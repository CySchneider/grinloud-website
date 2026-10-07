// Cloudflare Pages Function — SPA fallback for /pick/*  and /radar/*.
//
// scripts/generate-static-pages.js only bakes a static index.html for picks
// that were already public *at the last deploy*. A pick that went live after
// that (e.g. today's, since deploy.yml only runs on push — there's no daily
// rebuild) has no matching file on disk, so the platform's default static
// handling 404s on a direct load or a hard refresh, even though the SPA can
// render it fine client-side (App.jsx reads the date straight from the URL).
//
// context.next() first lets Pages serve the real static file if one exists,
// so dates that do have a generated page keep their own SEO/OG tags. Only
// when that lookup 404s do we fall back to the app shell at 200, so the
// client-side router can take over.
//
// Also handles the private opt-out switch for Cy's own devices: /?notrack=1
// sets the gl_notrack=1 cookie (1 year), /?notrack=0 removes it. Hits sent
// with that cookie are dropped by functions/api/hit.js. Set server-side on
// purpose: Safari (iOS/iPadOS/macOS) caps cookies written via document.cookie
// to 7 days, but leaves first-party Set-Cookie headers alone.
import { PICKS } from '../src/data.js';

function noTrackResponse(on) {
  const cookie = on
    ? 'gl_notrack=1; Max-Age=31536000; Path=/; Secure; SameSite=Lax'
    : 'gl_notrack=; Max-Age=0; Path=/; Secure; SameSite=Lax';
  const msg = on
    ? 'Tracking ist auf diesem Gerät/Browser jetzt AUS (1 Jahr).'
    : 'Tracking ist auf diesem Gerät/Browser wieder AN.';
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>GRINLOUD</title>
<style>body{background:#0a0a0a;color:#fff;font-family:'JetBrains Mono',monospace;padding:2rem 1.25rem;max-width:560px;margin:0 auto}a{color:#ff1f8f}</style>
</head><body><p>${msg}</p><p><a href="/">→ grinloud.com</a></p></body></html>`;
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': cookie,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const { pathname } = url;
  const notrack = url.searchParams.get('notrack');
  if (notrack === '1' || notrack === '0') return noTrackResponse(notrack === '1');

  if (!/^\/(pick|radar)\//.test(pathname)) return context.next();

  const response = await context.next();
  if (response.status !== 404) return response;

  const shell = await context.env.ASSETS.fetch(new URL('/', context.request.url));

  // Pick went live after the last deploy → the shell above still carries the
  // homepage's meta tags (= whatever pick was current at build time). Link
  // previews (WhatsApp, iMessage, Slack …) never run JS, so stamp this pick's
  // own title/description/cover into the shell server-side, mirroring what
  // scripts/generate-static-pages.js bakes into a real /pick/ page.
  const m = pathname.match(/^\/pick\/(\d{4}-\d{2}-\d{2})\/?$/);
  if (!m) return shell;
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Zurich' });
  const pick = m[1] <= today ? PICKS.find((p) => p.date === m[1]) : null; // never leak future picks
  if (!pick) return shell;
  return withPickMeta(shell, pick, url.origin + '/pick/' + pick.date + '/');
}

async function spotifyCover(spotifyUrl) {
  if (!spotifyUrl || spotifyUrl === '#') return null;
  try {
    const res = await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(spotifyUrl), {
      cf: { cacheTtl: 86400, cacheEverything: true },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.thumbnail_url) return null;
    return data.thumbnail_url.replace(/ab67616d0000(1e02|4851)/, 'ab67616d0000b273'); // -> 640x640
  } catch (e) {
    return null; // a Spotify hiccup must never break the page
  }
}

async function withPickMeta(shell, pick, pageUrl) {
  const cover = await spotifyCover(pick.links && pick.links.spotify);
  const title = pick.title + ' — ' + pick.artist + ' · GRINLOUD Pick of the Day';
  const desc = pick.info || pick.short || (pick.title + ' by ' + pick.artist + ' — ' + pick.genre + ', curated by GRINLOUD.');
  const set = (value) => ({ element(el) { el.setAttribute('content', value); } });
  let rw = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(title); } })
    .on('meta[name="description"]', set(desc))
    .on('meta[property="og:type"]', set('music.song'))
    .on('meta[property="og:url"]', set(pageUrl))
    .on('meta[property="og:title"]', set(title))
    .on('meta[property="og:description"]', set(desc))
    .on('meta[name="twitter:title"]', set(title))
    .on('meta[name="twitter:description"]', set(desc))
    .on('link[rel="canonical"]', { element(el) { el.setAttribute('href', pageUrl); } });
  if (cover) {
    rw = rw
      .on('meta[property="og:image"]', set(cover))
      .on('meta[property="og:image:width"]', set('640'))
      .on('meta[property="og:image:height"]', set('640'))
      .on('meta[name="twitter:image"]', set(cover));
  }
  const out = rw.transform(shell);
  const headers = new Headers(out.headers);
  headers.set('Cache-Control', 'public, max-age=300');
  return new Response(out.body, { status: 200, headers });
}
