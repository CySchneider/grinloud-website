// GRINLOUD — Daily Pick of the Day newsletter
// Runs every morning at 09:00 CET via GitHub Actions.
// 1. Reads today's pick from src/data.js
// 2. Fetches active subscribers from Beehiiv
// 3. Sends a beautiful HTML email to each via Resend

const BEEHIIV_PUB_ID  = process.env.BEEHIIV_PUBLICATION_ID;
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const RESEND_API_KEY  = process.env.RESEND_API_KEY;

const FROM_ADDRESS = 'GRINLOUD <pick@grinloud.com>';

if (!BEEHIIV_PUB_ID || !BEEHIIV_API_KEY || !RESEND_API_KEY) {
  console.error('Missing required env vars (BEEHIIV_PUBLICATION_ID, BEEHIIV_API_KEY, RESEND_API_KEY)');
  process.exit(1);
}

// ── Load today's pick from data.js ─────────────────────────────────────────
const fs  = require('fs');
const vm  = require('vm');
const path = require('path');

const dataFile = fs.readFileSync(path.join(__dirname, '../src/data.js'), 'utf8');
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

function buildHtml() {
  const links = pick.links || {};
  const spotifyBtn  = links.spotify  && links.spotify  !== '#' ? `<a href="${links.spotify}"  style="display:inline-block;background:#1DB954;color:#fff;font-family:'Helvetica Neue',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;padding:11px 22px;border-radius:24px;text-decoration:none;margin:4px 4px 4px 0;">▶ SPOTIFY</a>` : '';
  const youtubeBtn  = links.youtube  && links.youtube  !== '#' ? `<a href="${links.youtube}"  style="display:inline-block;background:#FF0000;color:#fff;font-family:'Helvetica Neue',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;padding:11px 22px;border-radius:24px;text-decoration:none;margin:4px 4px 4px 0;">▶ YOUTUBE</a>` : '';
  const beatportBtn = links.beatport && links.beatport !== '#' ? `<a href="${links.beatport}" style="display:inline-block;background:#96CF00;color:#000;font-family:'Helvetica Neue',sans-serif;font-size:12px;font-weight:700;letter-spacing:0.1em;padding:11px 22px;border-radius:24px;text-decoration:none;margin:4px 4px 4px 0;">BEATPORT</a>` : '';

  const [yyyy, mm, dd] = pick.date.split('-');
  const dateFormatted  = `${dd} · ${mm} · ${yyyy}`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${pick.title} — GRINLOUD Pick of the Day</title></head>
<body style="margin:0;padding:0;background:#0A0A0A;">

<!-- Accent header -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${accent};">
  <tr><td style="padding:18px 32px;">
    <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:900;letter-spacing:0.06em;color:#0A0A0A;">GRINLOUD</span>
    <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.15em;color:rgba(0,0,0,0.55);margin-left:14px;">PICK OF THE DAY</span>
  </td></tr>
</table>

<!-- Main -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0A0A0A;">
  <tr><td style="padding:40px 32px 8px;">

    <!-- Date + genre -->
    <p style="margin:0 0 14px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;color:rgba(255,255,255,0.4);">
      ${dateFormatted} &nbsp;·&nbsp; ${pick.genre.toUpperCase()}
    </p>

    <!-- Title -->
    <h1 style="margin:0 0 10px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:38px;font-weight:900;line-height:1.05;letter-spacing:-0.02em;color:#F5F2EE;">
      ${pick.title}
    </h1>

    <!-- Artist -->
    <p style="margin:0 0 26px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:0.08em;color:${accent};">
      ${pick.artist}
    </p>

    <!-- Description -->
    <p style="margin:0 0 28px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:16px;line-height:1.7;color:rgba(245,242,238,0.8);max-width:500px;">
      ${pick.info}
    </p>

    <!-- Meta -->
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:30px;">
      <tr>
        ${[['BPM', pick.bpm], ['KEY', pick.key], ['LABEL', pick.label]].map(([l, v]) => `
        <td style="padding-right:20px;vertical-align:top;">
          <span style="display:block;font-family:'Helvetica Neue',Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:0.15em;color:rgba(255,255,255,0.35);">${l}</span>
          <span style="display:block;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;color:#F5F2EE;margin-top:3px;">${v || '—'}</span>
        </td>`).join('')}
      </tr>
    </table>

    <!-- Listen buttons -->
    <div style="margin-bottom:40px;">${spotifyBtn}${youtubeBtn}${beatportBtn}</div>

  </td></tr>
</table>

<!-- Divider -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0A0A0A;">
  <tr><td style="padding:0 32px;"><div style="height:1px;background:#222;"></div></td></tr>
</table>

<!-- Footer -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0A0A0A;">
  <tr><td style="padding:24px 32px 32px;">
    <p style="margin:0 0 6px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;color:rgba(255,255,255,0.3);">
      HOUSE MUSIC CURATED DAILY &nbsp;·&nbsp; MIXED ALL 10 DAYS
    </p>
    <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.2);">
      <a href="https://grinloud.com" style="color:rgba(255,255,255,0.35);text-decoration:none;">grinloud.com</a>
      &nbsp;·&nbsp;
      <a href="{{unsubscribe_url}}" style="color:rgba(255,255,255,0.25);text-decoration:none;">Unsubscribe</a>
    </p>
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
