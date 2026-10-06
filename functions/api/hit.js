// Cloudflare Pages Function — records a pageview or play-click into D1.
// Zero third-party analytics, zero cost: this is just an INSERT into the
// D1 database bound to this Pages project (free tier: 100k rows written/day,
// 5GB storage — miles more than grinloud.com will ever need).
//
// One-time setup (Cloudflare dashboard, no CLI needed):
//   1. Workers & Pages -> D1 -> Create database -> name it e.g. "grinloud-analytics"
//   2. Open it -> Console tab -> paste the contents of d1-schema.sql -> run once
//   3. Pages -> grinloud-website -> Settings -> Functions -> D1 database bindings
//      -> Add binding: variable name "DB", database = the one you just made
//   4. Same Settings -> Functions -> also add an environment variable
//      STATS_KEY = <a password you pick> (used by functions/api/stats.js
//      to keep /api/stats private -- anyone who doesn't know it gets a 404)
//   5. Redeploy (next push, or "Retry deployment" in the dashboard) so the
//      binding takes effect.
//
// Until step 3 is done, this function fails silently (DB undefined) and the
// site keeps working exactly as before -- the client-side call is fire-and-
// forget and never throws on the page.
//
// Hits are only ever sent by the SPA's own JS (src/App.jsx sendHit), so a
// plain server request without JS (most crawlers, link previews) never
// reaches this endpoint in the first place. On top of that, three filters
// drop hits here and only bump a per-day counter in `filtered` instead:
//   - 'self': the gl_notrack=1 cookie, set via /?notrack=1 (functions/_middleware.js)
//   - 'bot-cf': Cloudflare's own bot signal, where the plan exposes one
//   - 'bot-ua': a known bot/crawler/preview/headless User-Agent, or
//     navigator.webdriver reported by the client

const BOT_UA = /\bbot\b|bot\/|bot;|bot\)|\+https?:\/\/|crawl|spider|slurp|preview|headless|phantom|puppeteer|playwright|selenium|lighthouse|pagespeed|googlebot|google-inspectiontool|adsbot|mediapartners|bingbot|bingpreview|yandex|baidu|duckduckbot|applebot|petalbot|semrush|ahrefs|mj12bot|dotbot|facebookexternalhit|facebookcatalog|meta-externalagent|slackbot|discordbot|telegrambot|whatsapp|twitterbot|linkedinbot|pinterest|skypeuripreview|embedly|quora link|redditbot|gptbot|chatgpt-user|oai-searchbot|claudebot|claude-web|anthropic-ai|perplexity|bytespider|ccbot|amazonbot|python-requests|python-urllib|curl\/|wget|go-http-client|okhttp|node-fetch|axios|httpclient|java\//i;

function botReason(request, body) {
  const bm = request.cf?.botManagement;
  // botManagement (incl. verifiedBot + score) only exists on plans with Bot
  // Management; on the free plan it's undefined and we fall through to the
  // User-Agent list.
  if (bm && (bm.verifiedBot || (typeof bm.score === 'number' && bm.score > 0 && bm.score < 30))) return 'bot-cf';
  if (request.cf?.verifiedBotCategory) return 'bot-cf';
  const ua = request.headers.get('User-Agent') || '';
  if (!ua || BOT_UA.test(ua)) return 'bot-ua';
  if (body.wd === true) return 'bot-ua';
  return null;
}

function hasNoTrackCookie(request) {
  return /(?:^|;\s*)gl_notrack=1(?:;|$)/.test(request.headers.get('Cookie') || '');
}

// Only the hostname of the referrer is kept, never the full URL.
function cleanHost(raw) {
  if (typeof raw !== 'string' || !raw) return null;
  try {
    return new URL(raw.includes('://') ? raw : `https://${raw}`).hostname.toLowerCase().replace(/^www\./, '').slice(0, 100) || null;
  } catch (_) {
    return null;
  }
}

function cleanUtm(v) {
  return typeof v === 'string' && v ? v.trim().toLowerCase().slice(0, 60) : null;
}

// Buckets for the stats page. UTM beats referrer, since in-app browsers and
// mail clients usually strip the referrer entirely.
function classifySource(host, utmSource, utmMedium) {
  const u = `${utmSource || ''} ${utmMedium || ''}`;
  const h = host || '';
  if (/newsletter|beehiiv|e-?mail|\bmail\b/.test(u) || /beehiiv|(^|\.)mail\.|webmail|outlook\.|gmx\.|(^|\.)web\.de$/.test(h)) return 'Newsletter';
  if (/\bgoogle\b/.test(u) || /(^|\.)google\.[a-z.]+$/.test(h) || h === 'com.google.android.googlequicksearchbox') return 'Google';
  if (/youtube|\byt\b/.test(u) || /(^|\.)(youtube\.com|youtu\.be)$/.test(h)) return 'YouTube';
  if (/instagram|\big\b/.test(u) || /(^|\.)instagram\.com$/.test(h)) return 'Instagram';
  if (/tiktok/.test(u) || /(^|\.)tiktok\.com$/.test(h)) return 'TikTok';
  if (h === 'grinloud.com' || h.endsWith('.grinloud.com') || h.endsWith('.pages.dev')) return 'Intern';
  if (!h && !utmSource) return 'Direkt';
  return 'Andere';
}

async function countFiltered(db, reason) {
  await db
    .prepare(`INSERT INTO filtered (day, reason, n) VALUES (?, ?, 1)
              ON CONFLICT(day, reason) DO UPDATE SET n = n + 1`)
    .bind(new Date().toISOString().slice(0, 10), reason)
    .run();
}

export async function onRequestPost(context) {
  try {
    const db = context.env.DB;
    if (!db) return new Response(null, { status: 204 }); // not wired up yet -- no-op

    const { request } = context;
    const body = await request.json().catch(() => null);
    if (!body || (body.type !== 'view' && body.type !== 'play')) {
      return new Response(null, { status: 204 });
    }

    const skip = hasNoTrackCookie(request) ? 'self' : botReason(request, body);
    if (skip) {
      await countFiltered(db, skip).catch(() => {});
      return new Response(null, { status: 204 });
    }

    const path = typeof body.path === 'string' ? body.path.slice(0, 200) : null;
    const track = typeof body.track === 'string' ? body.track.slice(0, 300) : null;
    const country = request.cf?.country || null;
    const refHost = cleanHost(body.ref);
    const utmSource = cleanUtm(body.utm_source);
    const utmMedium = cleanUtm(body.utm_medium);
    const source = classifySource(refHost, utmSource, utmMedium);

    const ts = new Date().toISOString();
    await db
      .prepare(`INSERT INTO events (ts, type, path, track, country, source, ref_host, utm_source, utm_medium)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(ts, body.type, path, track, country, source, refHost, utmSource, utmMedium)
      .run()
      // d1-migration-002-sources.sql not run yet -> keep recording in the
      // old shape rather than losing the hit.
      .catch(() => db
        .prepare('INSERT INTO events (ts, type, path, track, country) VALUES (?, ?, ?, ?, ?)')
        .bind(ts, body.type, path, track, country)
        .run());

    return new Response(null, { status: 204 });
  } catch (err) {
    // Never let a tracking hiccup surface to the visitor.
    return new Response(null, { status: 204 });
  }
}
