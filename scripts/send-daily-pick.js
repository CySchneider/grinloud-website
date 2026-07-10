// GRINLOUD — Daily Pick of the Day newsletter
// Runs every morning at 09:00 CET via GitHub Actions.
// 1. Reads today's pick from src/data.js
// 2. Fetches active subscribers from Beehiiv
// 3. Sends a beautiful HTML email to each via Resend

import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BEEHIIV_PUB_ID  = process.env.BEEHIIV_PUBLICATION_ID;
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const RESEND_API_KEY  = process.env.RESEND_API_KEY;

const FROM_ADDRESS = 'GRINLOUD <pick@grinloud.com>';

if (!BEEHIIV_PUB_ID || !BEEHIIV_API_KEY || !RESEND_API_KEY) {
  console.error('Missing required env vars (BEEHIIV_PUBLICATION_ID, BEEHIIV_API_KEY, RESEND_API_KEY)');
  process.exit(1);
}

// ── Load today's pick from data.js ─────────────────────────────────────────

const dataFile = fs.readFileSync(path.join(__dirname, '../src/data.js'), 'utf8')
  .replace(/^export\s*\{[^}]*\};?\s*$/m, '');
const sandbox  = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataFile, sandbox);
const { PICKS } = sandbox.window.GRINLOUD_DATA;

const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Zurich' });
const pick = PICKS.find(p => p.date === todayStr);

if (!pick) {
  console.log(`No pick found for ${todayStr} — skipping.`);
  process.exit(0);
}

console.log(`📧 Preparing newsletter: "${pick.title}" — ${pick.artist} (${todayStr})`);

// ── Fetch all active Beehiiv subscribers (paginated) ──────────────────────
async function getSubscribers() {
  const emails = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions?status=active&limit=100&page=${page}`,
      { headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` } }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Beehiiv error ${res.status}: ${JSON.stringify(err)}`);
    }
    const { data, total_results } = await res.json();
    if (!data || data.length === 0) break;

    emails.push(...data.map(s => s.email));
    console.log(`  Loaded page ${page} — ${emails.length}/${total_results} subscribers`);

    if (emails.length >= total_results) break;
    page++;
  }

  return emails;
}

// ── Build HTML email ───────────────────────────────────────────────────────
const accentColors = {
  pink:   '#FF1F8F',
  yellow: '#FFE000',
  blue:   '#00C2FF',
  green:  '#39FF14',
  orange: '#FF6200',
};
const accent = accentColors[pick.accent] || '#FF1F8F';

// Yellow is very light — darken ink opacity slightly for legibility
const inkOnAccent   = '#0A0A0A';
const inkDim        = 'rgba(10,10,10,0.45)';
const paper         = '#F5F2EE';

function buildHtml() {
  const [yyyy, mm, dd] = pick.date.split('-');
  const dateFormatted  = `${dd} · ${mm} · ${yyyy}`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${pick.title} — GRINLOUD Pick of the Day</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
</head>
<body bgcolor="${accent}" style="margin:0;padding:0;background:${accent};min-height:100vh;">

<!-- Outer wrapper — full accent background -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${accent}" style="background:${accent};min-height:100vh;">
<tr><td align="center" valign="top" style="padding:0;">

  <!-- Content column — max 600px -->
  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

    <!-- ── NAV ── -->
    <tr><td style="padding:20px 32px 18px;border-bottom:2px solid ${inkOnAccent};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <!-- Logo mark — yellow bg fills any transparent edge, 4px border + offset shadow like website -->
            <img src="https://grinloud.com/Logo%20GRINLOUD%20Smiley%20Yellow%20black.png" width="36" height="36" alt="GRINLOUD" style="display:inline-block;vertical-align:middle;margin-right:10px;border-radius:50%;border:4px solid ${inkOnAccent};box-shadow:4px 4px 0 ${inkOnAccent};background:#FFE000;">
            <span style="font-family:'Archivo Black','Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:900;letter-spacing:0;color:${inkOnAccent};vertical-align:middle;text-transform:uppercase;">GRINLOUD</span>
          </td>
          <td align="right">
            <span style="font-family:'JetBrains Mono','IBM Plex Mono','Courier New',monospace;font-size:9px;font-weight:700;letter-spacing:0.18em;color:${inkDim};text-transform:uppercase;">Pick of the Day</span>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- ── HERO ── -->
    <tr><td style="padding:40px 32px 0;">

      <!-- Date + genre eyebrow -->
      <p style="margin:0 0 20px;font-family:'JetBrains Mono','IBM Plex Mono','Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:0.16em;color:${inkDim};text-transform:uppercase;">
        ${dateFormatted} &nbsp;·&nbsp; ${pick.genre.toUpperCase()}
      </p>

      <!-- Track title — Archivo Black, tight, uppercase -->
      <h1 style="margin:0 0 14px;font-family:'Archivo Black','Helvetica Neue',Arial,sans-serif;font-size:52px;font-weight:900;line-height:0.9;letter-spacing:-0.03em;color:${inkOnAccent};text-transform:uppercase;">
        ${pick.title}
      </h1>

      <!-- Artist -->
      <p style="margin:0 0 28px;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:700;letter-spacing:-0.01em;color:${inkOnAccent};">
        ${pick.artist}
      </p>

      <!-- Divider line -->
      <div style="height:2px;background:${inkOnAccent};opacity:0.15;margin-bottom:28px;"></div>

      <!-- Description -->
      <p style="margin:0 0 32px;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;font-size:16px;line-height:1.55;color:${inkOnAccent};opacity:0.8;max-width:480px;">
        ${pick.info}
      </p>

      <!-- Meta pills — BPM · KEY · LABEL (mirrors .meta-pill on website) -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
        <tr>
          ${[['BPM', pick.bpm], ['KEY', pick.key], ['LABEL', pick.label]].map(([l, v]) => `
          <td style="padding-right:6px;vertical-align:middle;">
            <span style="display:inline-block;padding:6px 10px;border:2px solid ${inkOnAccent};border-radius:4px;font-family:'JetBrains Mono','IBM Plex Mono','Courier New',monospace;font-size:10px;letter-spacing:0.12em;color:${inkOnAccent};white-space:nowrap;">
              <span style="opacity:0.5;">${l}&ensp;</span><span style="font-weight:600;">${v || '—'}</span>
            </span>
          </td>`).join('')}
        </tr>
      </table>

      <!-- CTA — to website -->
      <div style="margin-bottom:48px;">
        <a href="https://grinloud.com" style="display:inline-block;background:${inkOnAccent};color:${paper};font-family:'JetBrains Mono','IBM Plex Mono','Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:0.14em;padding:7px 14px;border-radius:999px;text-decoration:none;text-transform:uppercase;">GRINLOUD.COM &#8599;</a>
      </div>

    </td></tr>

    <!-- ── FOOTER ── -->
    <tr><td style="padding:20px 32px 24px;">
      <p style="margin:0 0 4px;font-family:'JetBrains Mono','IBM Plex Mono','Courier New',monospace;font-size:9px;font-weight:700;letter-spacing:0.16em;color:${inkDim};text-transform:uppercase;">
        House Music Curated Daily &nbsp;·&nbsp; Mixed All 10 Days
      </p>
      <p style="margin:0;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;font-size:11px;color:${inkDim};">
        <a href="https://grinloud.com" style="color:${inkDim};text-decoration:none;">grinloud.com</a>
        &nbsp;·&nbsp;
        <a href="{{unsubscribe_url}}" style="color:${inkDim};text-decoration:none;">Unsubscribe</a>
      </p>
    </td></tr>

  </table>

</td></tr>
</table>

</body>
</html>`;
}

// ── Send via Resend (one email per subscriber) ─────────────────────────────
async function sendEmail(toEmail, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from:    FROM_ADDRESS,
      to:      [toEmail],
      subject: `Pick of the Day: ${pick.title} — ${pick.artist}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Resend error ${res.status} for ${toEmail}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const subscribers = await getSubscribers();
  console.log(`📋 ${subscribers.length} active subscriber(s)`);

  if (subscribers.length === 0) {
    console.log('No subscribers yet — nothing to send.');
    return;
  }

  const html = buildHtml();
  let sent = 0, failed = 0;

  for (const email of subscribers) {
    try {
      await sendEmail(email, html);
      console.log(`  ✓ ${email}`);
      sent++;
      // Small delay to stay within rate limits
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      console.error(`  ✗ ${email}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Done — ${sent} sent, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
