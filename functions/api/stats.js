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

  // Queries touching the columns/table from d1-migration-002-sources.sql
  // degrade to "no data" instead of taking the whole page down if that
  // migration hasn't been run yet.
  const safeAll = (sql) => db.prepare(sql).all().catch(() => ({ results: [] }));

  const [totals, byDay, byPath, byTrack, byCountry, bySource, otherRefs, filtered] = await Promise.all([
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
    safeAll(`
      WITH top_paths AS (
        SELECT path, COUNT(*) AS n FROM events
        WHERE type = 'view' AND path IS NOT NULL
        GROUP BY path ORDER BY n DESC LIMIT 20
      ),
      path_sources AS (
        SELECT path, source, COUNT(*) AS c,
          ROW_NUMBER() OVER (PARTITION BY path ORDER BY COUNT(*) DESC) AS rn
        FROM events
        WHERE type = 'view' AND source IS NOT NULL
        GROUP BY path, source
      )
      SELECT t.path, t.n,
        CASE WHEN s.source IS NULL THEN NULL ELSE s.source || ' (' || s.c || ')' END AS top_source
      FROM top_paths t
      LEFT JOIN path_sources s ON s.path = t.path AND s.rn = 1
      ORDER BY t.n DESC
    `).then(async (r) => r.results.length ? r : db.prepare(`
      SELECT path, COUNT(*) AS n FROM events
      WHERE type = 'view' AND path IS NOT NULL
      GROUP BY path ORDER BY n DESC LIMIT 20
    `).all()),
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
    safeAll(`
      SELECT COALESCE(source, 'unbekannt (vor Update)') AS source,
        SUM(CASE WHEN type = 'view' THEN 1 ELSE 0 END) AS views,
        SUM(CASE WHEN type = 'play' THEN 1 ELSE 0 END) AS plays
      FROM events
      WHERE ts >= datetime('now', '-30 days')
      GROUP BY 1 ORDER BY views DESC
    `),
    safeAll(`
      SELECT COALESCE(ref_host, 'utm: ' || utm_source) AS ref, COUNT(*) AS n
      FROM events
      WHERE type = 'view' AND source = 'Andere' AND ts >= datetime('now', '-30 days')
      GROUP BY 1 ORDER BY n DESC LIMIT 10
    `),
    safeAll(`
      SELECT
        SUM(CASE WHEN reason LIKE 'bot-%' THEN n ELSE 0 END) AS bots_total,
        SUM(CASE WHEN reason LIKE 'bot-%' AND day >= date('now', '-30 days') THEN n ELSE 0 END) AS bots_30d,
        SUM(CASE WHEN reason = 'self' THEN n ELSE 0 END) AS self_total,
        SUM(CASE WHEN reason = 'self' AND day >= date('now', '-30 days') THEN n ELSE 0 END) AS self_30d
      FROM filtered
    `),
  ]);
  const f = filtered.results[0] || {};

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
  .note { color:#aaa; font-size:0.75rem; margin:0 0 1rem; }
  .note b { color:#fff; font-weight:normal; }
</style></head>
<body>
  <h1>GRINLOUD — STATS (privat)</h1>
  <div class="totals">
    <div>${totals.views || 0}<span>Views total</span></div>
    <div>${totals.plays || 0}<span>Plays total</span></div>
  </div>
  <p class="note">Gefilterte Bots: <b>${f.bots_total || 0}</b> total · ${f.bots_30d || 0} letzte 30 Tage
    &nbsp;|&nbsp; Eigene Besuche (gl_notrack): <b>${f.self_total || 0}</b> total · ${f.self_30d || 0} letzte 30 Tage</p>

  <h2>Herkunft (letzte 30 Tage)</h2>
  ${rowsToTable(bySource.results, [{ key: 'source', label: 'Quelle' }, { key: 'views', label: 'Views' }, { key: 'plays', label: 'Plays' }])}

  <h2>«Andere» im Detail (letzte 30 Tage)</h2>
  ${rowsToTable(otherRefs.results, [{ key: 'ref', label: 'Referrer / UTM' }, { key: 'n', label: 'Views' }])}

  <h2>Letzte 30 Tage</h2>
  ${rowsToTable(byDay.results, [{ key: 'day', label: 'Tag' }, { key: 'views', label: 'Views' }, { key: 'plays', label: 'Plays' }])}

  <h2>Meistgesehene Seiten</h2>
  ${rowsToTable(byPath.results, [{ key: 'path', label: 'Pfad' }, { key: 'n', label: 'Views' }, { key: 'top_source', label: 'Wichtigste Quelle' }])}

  <h2>Meistgeklickte Tracks (Play)</h2>
  ${rowsToTable(byTrack.results, [{ key: 'track', label: 'Track (Spotify-URL)' }, { key: 'n', label: 'Plays' }])}

  <h2>Länder (Views)</h2>
  ${rowsToTable(byCountry.results, [{ key: 'country', label: 'Land' }, { key: 'n', label: 'Views' }])}
</body></html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
