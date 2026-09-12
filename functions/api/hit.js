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

export async function onRequestPost(context) {
  try {
    const db = context.env.DB;
    if (!db) return new Response(null, { status: 204 }); // not wired up yet -- no-op

    const body = await context.request.json().catch(() => null);
    if (!body || (body.type !== 'view' && body.type !== 'play')) {
      return new Response(null, { status: 204 });
    }

    const path = typeof body.path === 'string' ? body.path.slice(0, 200) : null;
    const track = typeof body.track === 'string' ? body.track.slice(0, 300) : null;
    const country = context.request.cf?.country || null;

    await db
      .prepare('INSERT INTO events (ts, type, path, track, country) VALUES (?, ?, ?, ?, ?)')
      .bind(new Date().toISOString(), body.type, path, track, country)
      .run();

    return new Response(null, { status: 204 });
  } catch (err) {
    // Never let a tracking hiccup surface to the visitor.
    return new Response(null, { status: 204 });
  }
}
