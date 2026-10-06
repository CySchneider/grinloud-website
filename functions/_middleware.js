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

  return context.env.ASSETS.fetch(new URL('/', context.request.url));
}
