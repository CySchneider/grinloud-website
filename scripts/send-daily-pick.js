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

// ── Fetch the track's Spotify cover art (same oEmbed + upscale trick the
// site itself uses in src/shared.jsx — the 300x300 thumbnail_url's image ID
// encodes size, ab67616d00001e02 → ab67616d0000b273 gets the 640x640 original
// with no extra request) ────────────────────────────────────────────────────
async function fetchCoverArt(spotifyUrl) {
  if (!spotifyUrl || spotifyUrl === '#') return null;
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`);
    if (!res.ok) return null;
    const { thumbnail_url } = await res.json();
    if (!thumbnail_url) return null;
    return thumbnail_url.replace(/ab67616d0000(1e02|4851)/, 'ab67616d0000b273');
  } catch {
    return null;
  }
}

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

// ── Build HTML email — mirrors the site's current "Quiet Signal" look
// (src/Home.jsx + the --qs-* tokens in src/styles.css): flat off-white page,
// Space Grotesk/DM Sans/JetBrains Mono, accent used only as a small dot and
// a label-chip color, no boxed pills or full-bleed accent background. ──────
const ACCENT_COLORS = {
  pink:   '#FF1F8F',
  yellow: '#FFE600',
  blue:   '#00C2FF',
  green:  '#39FF14',
  orange: '#FF6200',
};
const accent = ACCENT_COLORS[pick.accent] || ACCENT_COLORS.pink;

const bg      = '#FAF7F2';
const ink     = '#0E0E0E';
const ink75   = 'rgba(14,14,14,0.75)';
const ink55   = 'rgba(14,14,14,0.55)';
const ink40   = 'rgba(14,14,14,0.40)';
const ink35   = 'rgba(14,14,14,0.35)';
const ink12   = 'rgba(14,14,14,0.12)';
const ink08   = 'rgba(14,14,14,0.08)';

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=DM+Sans:wght@300;400&family=JetBrains+Mono:wght@600;700&family=UnifrakturMaguntia&display=swap" rel="stylesheet">`;

function metaLine(pick) {
  return [`${pick.bpm} BPM`, pick.key, pick.label, pick.genre, pick.release]
    .filter(Boolean)
    .join(` <span style="opacity:0.5;">&middot;</span> `);
}

function quoteCard(label, text) {
  if (!text) return '';
  return `
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr><td>
          <span style="display:inline-block;background:${ink};color:${accent};font-family:'JetBrains Mono','IBM Plex Mono','Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:3px 6px;border-radius:2px;margin-bottom:8px;">${label}</span>
        </td></tr>
        <tr><td style="padding-top:8px;">
          <p style="margin:0;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-weight:300;font-size:14px;line-height:1.6;color:${ink75};max-width:420px;">${text}</p>
        </td></tr>
      </table>`;
}

function buildHtml(coverUrl) {
  const [yyyy, mm, dd] = pick.date.split('-');
  const dateFormatted  = `${dd} · ${mm} · ${yyyy}`;
  const linkStyle = `display:inline-block;font-family:'JetBrains Mono','IBM Plex Mono','Courier New',monospace;font-size:11px;font-weight:600;letter-spacing:0.1em;color:${ink55};text-decoration:none;border-bottom:1px solid ${ink35};padding-bottom:1px;text-transform:uppercase;`;

  const streamingLinks = [['spotify', 'SPOTIFY'], ['youtube', 'YOUTUBE'], ['beatport', 'BEATPORT']]
    .filter(([key]) => pick.links?.[key] && pick.links[key] !== '#')
    .map(([key, label]) => `<td style="padding-right:20px;"><a href="${pick.links[key]}" style="${linkStyle}">${label} &#8599;</a></td>`)
    .join('');

  const coverImg = coverUrl
    ? `<img src="${coverUrl}" width="152" height="152" alt="${pick.title} — ${pick.artist} cover art" style="display:block;width:152px;height:152px;border-radius:2px;object-fit:cover;">`
    : '';

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${pick.title} — GRINLOUD Pick of the Day</title>
${FONTS}
</head>
<body bgcolor="${bg}" style="margin:0;padding:0;background:${bg};">

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bg}" style="background:${bg};">
<tr><td align="center" valign="top" style="padding:0;">

  <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

    <!-- ── HEADER ── -->
    <tr><td style="padding:20px 32px;border-bottom:1px solid ${ink08};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <img src="https://grinloud.com/grinloud-smiley-2026.png" width="28" height="28" alt="GRINLOUD" style="display:inline-block;vertical-align:middle;margin-right:8px;border-radius:50%;">
            <span style="font-family:'UnifrakturMaguntia',cursive;font-size:20px;color:${ink};vertical-align:middle;">grinloud.com</span>
          </td>
          <td align="right">
            <span style="font-family:'JetBrains Mono','IBM Plex Mono','Courier New',monospace;font-size:9px;font-weight:700;letter-spacing:0.14em;color:${ink40};text-transform:uppercase;">House Music Curated</span>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- ── HERO ── -->
    <tr><td style="padding:40px 32px 0;">

      <!-- Eyebrow: accent dot + PICK OF THE DAY — date -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tr>
          <td style="padding-right:8px;"><span style="display:inline-block;width:6px;height:6px;border-radius:1px;background:${accent};"></span></td>
          <td><span style="font-family:'JetBrains Mono','IBM Plex Mono','Courier New',monospace;font-size:11px;font-weight:600;letter-spacing:0.14em;color:${ink40};text-transform:uppercase;">Pick of the Day — ${dateFormatted}</span></td>
        </tr>
      </table>

      ${coverUrl ? `<div style="margin-bottom:24px;">${coverImg}</div>` : ''}

      <!-- Track title — Space Grotesk, not shouting -->
      <h1 style="margin:0 0 10px;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;font-size:34px;font-weight:700;line-height:1.05;letter-spacing:-0.015em;color:${ink};">
        ${pick.title}
      </h1>

      <!-- Artist + photo -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        <tr>
          ${pick.artistImage ? `<td style="padding-right:14px;vertical-align:middle;"><img src="${pick.artistImage}" width="52" height="52" alt="${pick.artist} photo" style="display:block;width:52px;height:52px;border-radius:50%;object-fit:cover;"></td>` : ''}
          <td style="vertical-align:middle;">
            <p style="margin:0 0 4px;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-weight:500;font-size:18px;color:${ink};">${pick.artist}</p>
            <p style="margin:0;font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;font-weight:300;font-size:13px;color:${ink75};">${metaLine(pick)}</p>
          </td>
        </tr>
      </table>

      <div style="height:1px;background:${ink12};margin-bottom:22px;"></div>

      ${quoteCard('Grinloud Says', pick.info)}
      ${quoteCard('Fun Fact', pick.funFact)}

      <!-- Actions: play (opens Spotify) + streaming links -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:44px;">
        <tr>
          <td style="padding-right:20px;">
            <a href="${pick.links?.spotify || 'https://grinloud.com'}" style="display:inline-block;font-family:'JetBrains Mono','IBM Plex Mono','Courier New',monospace;font-size:12px;font-weight:700;letter-spacing:0.1em;color:${ink};text-decoration:none;border-bottom:2px solid ${ink};padding-bottom:2px;">&#9654; PLAY PREVIEW</a>
          </td>
          ${streamingLinks}
        </tr>
      </table>

    </td></tr>

    <!-- ── FOOTER ── -->
    <tr><td style="padding:0 32px 32px;">
      <p style="margin:0 0 8px;font-family:'JetBrains Mono','IBM Plex Mono','Courier New',monospace;font-size:10px;font-weight:600;letter-spacing:0.06em;color:${ink40};">
        <a href="https://grinloud.com" style="color:${ink40};text-decoration:none;">grinloud.com</a>
        <span style="opacity:0.6;">&middot;</span>
        <a href="https://grinloud.com/about.html" style="color:${ink40};text-decoration:none;">About</a>
        <span style="opacity:0.6;">&middot;</span>
        <a href="https://grinloud.com/privacy.html" style="color:${ink40};text-decoration:none;">Privacy</a>
        <span style="opacity:0.6;">&middot;</span>
        <a href="https://grinloud.com/impressum.html" style="color:${ink40};text-decoration:none;">Impressum</a>
        <span style="opacity:0.6;">&middot;</span>
        <a href="{{unsubscribe_url}}" style="color:${ink40};text-decoration:none;">Unsubscribe</a>
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

  const coverUrl = await fetchCoverArt(pick.links?.spotify);
  console.log(coverUrl ? `🎨 Cover art resolved: ${coverUrl}` : '⚠️  No cover art found — sending without one.');

  const html = buildHtml(coverUrl);
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
