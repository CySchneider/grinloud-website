// A Music Radar unlocks the evening BEFORE its liveDate, at 18:00
// Europe/Zurich — that's when Cy starts the YouTube Premiere, while people
// are still online (midnight gets no audience and no YouTube push).
// liveDate itself stays the date of the radar's first pick; only the radar's
// public visibility moves earlier. Plain JS (no JSX) so the build-time
// scripts/generate-static-pages.js can share it with the app.
const RADAR_UNLOCK_HOUR = 18;

function zurichNow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(now).map(p => [p.type, p.value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

function isRadarLive(radar, now = new Date()) {
  if (!radar.liveDate) return true;
  const eve = new Date(radar.liveDate + 'T00:00:00Z');
  eve.setUTCDate(eve.getUTCDate() - 1);
  const eveStr = eve.toISOString().slice(0, 10);
  const { date, hour } = zurichNow(now);
  return date > eveStr || (date === eveStr && hour >= RADAR_UNLOCK_HOUR);
}

export { isRadarLive };
