// GRINLOUD — WhatsApp-Channel-Posts aus src/data.js generieren
// Usage:  node scripts/whatsapp-posts.mjs          → aktueller RADAR
//         node scripts/whatsapp-posts.mjs 017      → bestimmter Radar
// Output: Claude outputs/whatsapp/radar-XXX-whatsapp.txt (1 Post pro Tag, copy-paste-fertig)
// WhatsApp-Formatierung: *fett*, _kursiv_. Link geht auf die eigene Pick-Seite (grinloud.com/pick/DATUM/),
// die hat Cover als og:image → WA zeigt Vorschau. utm_source=whatsapp → im Stats-Dashboard als "WhatsApp".
import { PICKS, RADAR, PREVIOUS_RADARS } from '../src/data.js';
import { mkdirSync, writeFileSync } from 'node:fs';

const want = process.argv[2];
const all = [RADAR, ...PREVIOUS_RADARS];
const radar = want ? all.find(r => r.number === want.padStart(3, '0')) : RADAR;
if (!radar) { console.error('Radar nicht gefunden: ' + want); process.exit(1); }

const toISO = s => new Date(s + ' UTC').toISOString().slice(0, 10); // "19 OCT 2026" → 2026-10-19
const start = radar.liveDate, end = toISO(radar.nextDate);
const picks = PICKS.filter(p => p.date >= start && p.date < end).sort((a, b) => a.date.localeCompare(b.date));

const fmtDate = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC' });
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const posts = picks.map((p, i) => {
  const m = p.title.match(/^(.*?)\s*(\(.*\))?$/);
  const main = m[1], version = m[2] ? ' ' + m[2] : '';
  const track = (radar.tracks || []).find(t => norm(t.title) === norm(p.title));
  const artists = track ? track.artist : p.artist;
  const lines = [
    '🔊 *GRINLOUD DAILY PICK* · ' + fmtDate(p.date),
    '_Music Radar ' + radar.number + ' · ' + (i + 1) + '/' + picks.length + '_',
    '',
    '*' + main + '*' + version,
    artists,
    [p.genre, p.bpm + ' BPM', p.key, p.label].filter(Boolean).join(' · '),
    '',
    p.info,
  ];
  if (p.funFact) lines.push('', '💡 ' + p.funFact);
  lines.push('', '▶️ Listen: https://grinloud.com/pick/' + p.date + '/?utm_source=whatsapp');
  if (i === picks.length - 1) {
    lines.push('', 'That\'s Radar ' + radar.number + '. Full mix + playlist → https://grinloud.com/radar/' + radar.number + '/?utm_source=whatsapp', 'Next radar drops ' + fmtDate(end) + '.');
  }
  return { date: p.date, text: lines.join('\n') };
});

const out = posts.map(p => '═══════ ' + p.date + ' ═══════\n\n' + p.text).join('\n\n\n');
mkdirSync('Claude outputs/whatsapp', { recursive: true });
const file = 'Claude outputs/whatsapp/radar-' + radar.number + '-whatsapp.txt';
writeFileSync(file, out + '\n');
console.log(posts.length + ' Posts → ' + file);
