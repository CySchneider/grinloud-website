// Cloudflare Pages Function — private stats page for the D1 events table.
// Open https://grinloud.com/api/stats?key=YOUR_STATS_KEY in a browser.
// Wrong or missing key -> plain 404, so the endpoint doesn't announce itself.
// See functions/api/hit.js for the one-time D1 + STATS_KEY setup this needs.

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function rowsToTable(rows, cols) {
  if (!rows.length) return '<p class="empty">— keine Daten —</p>';
  const head = cols.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('');
  const body = rows
    .map((r) => `<tr>${cols.map((c) => `<td>${escapeHtml(r[c.key] ?? '—')}</td>`).join('')}</tr>`)
    .join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

export async function onRequestGet(context) {
  const notFound = () => new Response('Not found.', { status: 404 });

  const key = context.env.STATS_KEY;
  const provided = new URL(context.request.url).searchParams.get('key');
  if (!key || !provided || provided !== key) return notFound();

  const db = context.env.DB;
  if (!db) return new Response('D1 not bound yet — see functions/api/hit.js setup notes.', { status: 200 });

  const [totals, byDay, byPath, byTrack, byCountry] = await Promise.all([
    db.prepare(`
      SELECT
        SUM(CASE WHEN type = 'view' THEN 1 ELSE 0 END) AS views,
        SUM(CASE WHEN type = 'play' THEN 1 ELSE 0 END) AS plays
      FROM events
    `).first(),
    db.prepare(`
      SELECT substr(ts, 1, 10) AS day,
        SUM(CASE WHEN type = 'view' THEN 1 ELSE 0 END) AS views,
        SUM(CASE WHEN type = 'play' THEN 1 ELSE 0 END) AS plays
      FROM events
      WHERE ts >= datetime('now', '-30 days')
      GROUP BY day ORDER BY day DESC
    `).all(),
    db.prepare(`
      SELECT path, COUNT(*) AS n FROM events
      WHERE type = 'view' AND path IS NOT NULL
      GROUP BY path ORDER BY n DESC LIMIT 20
    `).all(),
    db.prepare(`
      SELECT track, COUNT(*) AS n FROM events
      WHERE type = 'play' AND track IS NOT NULL
      GROUP BY track ORDER BY n DESC LIMIT 20
    `).all(),
    db.prepare(`
      SELECT COALESCE(country, '—') AS country, COUNT(*) AS n FROM events
      WHERE type = 'view'
      GROUP BY country ORDER BY n DESC LIMIT 15
    `).all(),
  ]);

  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<title>GRINLOUD — Stats</title>
<meta name="robots" content="noindex, nofollow">
<style>
  body { background:#0a0a0a; color:#fff; font-family:'JetBrains Mono', monospace; padding:2rem 1.25rem; max-width:960px; margin:0 auto; }
  h1 { font-size:0.9rem; letter-spacing:0.12em; color:#ff1f8f; text-transform:uppercase; margin:0 0 1.5rem; }
  h2 { font-size:0.75rem; letter-spacing:0.08em; color:#aaa; text-transform:uppercase; margin:2rem 0 0.5rem; }
  .totals { display:flex; gap:2rem; margin-bottom:1rem; }
  .totals div { font-size:1.8rem; }
  .totals span { display:block; font-size:0.65rem; color:#888; letter-spacing:0.08em; text-transform:uppercase; }
  table { width:100%; border-collapse:collapse; font-size:0.8rem; }
  th, td { text-align:left; padding:0.35rem 0.6rem; border-bottom:1px solid #222; }
  th { color:#888; font-weight:normal; text-transform:uppercase; font-size:0.65rem; letter-spacing:0.06em; }
  .empty { color:#666; font-size:0.8rem; }
</style></head>
<body>
  <h1>GRINLOUD — STATS (privat)</h1>
  <div class="totals">
    <div>${totals.views || 0}<span>Views total</span></div>
    <div>${totals.plays || 0}<span>Plays total</span></div>
  </div>

  <h2>Letzte 30 Tage</h2>
  ${rowsToTable(byDay.results, [{ key: 'day', label: 'Tag' }, { key: 'views', label: 'Views' }, { key: 'plays', label: 'Plays' }])}

  <h2>Meistgesehene Seiten</h2>
  ${rowsToTable(byPath.results, [{ key: 'path', label: 'Pfad' }, { key: 'n', label: 'Views' }])}

  <h2>Meistgeklickte Tracks (Play)</h2>
  ${rowsToTable(byTrack.results, [{ key: 'track', label: 'Track (Spotify-URL)' }, { key: 'n', label: 'Plays' }])}

  <h2>Länder (Views)</h2>
  ${rowsToTable(byCountry.results, [{ key: 'country', label: 'Land' }, { key: 'n', label: 'Views' }])}
</body></html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
