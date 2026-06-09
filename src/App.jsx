// Main App: routing, state, Tweaks wiring.
import React from 'react'
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakSlider } from '../tweaks-panel.jsx'
import { TopBrand, TopNav, NewsletterModal, SpotifyPreviewBar } from './shared.jsx'
import { HomeA } from './HomeA.jsx'
import { HomeB } from './HomeB.jsx'
import { Cinema } from './Cinema.jsx'
import { RadarCover } from './RadarCover.jsx'
import { MusicRadar } from './MusicRadar.jsx'
import { Archive } from './Archive.jsx'

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "variant": "A",
  "bgColor": "pink",
  "typeScale": 1.0,
  "logoPos": "top",
  "overlay": 0.30,
  "density": "regular"
}/*EDITMODE-END*/;

// Neon palette — primary pink, then yellow, then blue / green / orange.
const COLOR_MAP = {
  pink:   { bg: '#FF1F8F', ink: '#0A0A0A', overlayTint: '#FF1F8F' },
  yellow: { bg: '#FFE600', ink: '#0A0A0A', overlayTint: '#FFE600' },
  blue:   { bg: '#00C2FF', ink: '#0A0A0A', overlayTint: '#00C2FF' },
  green:  { bg: '#39FF14', ink: '#0A0A0A', overlayTint: '#39FF14' },
  orange: { bg: '#FF6200', ink: '#0A0A0A', overlayTint: '#FF6200' }
};

// ── Special modes ─────────────────────────────────────────────────────────
const _params      = new URLSearchParams(window.location.search);
const isCinemaMode = _params.has('cinema');
const isRadarMode  = _params.has('radar');
const isAdmin      = _params.has('admin');

// Deep-link to a specific radar: ?music-radar=005 / ?music-radar=004 etc.
// Looks in current RADAR first, then PREVIOUS_RADARS.
const _radarParam = _params.get('music-radar');
const _allRadars  = _radarParam
  ? [window.GRINLOUD_DATA.RADAR, ...window.GRINLOUD_DATA.PREVIOUS_RADARS]
  : [];
const _deepLinkedRadar = _radarParam
  ? (_allRadars.find(r => r.number === _radarParam) || null)
  : null;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState(_deepLinkedRadar ? 'radar' : 'home');
  const [archiveTab, setArchiveTab] = React.useState('picks');

  const allPicks = window.GRINLOUD_DATA.PICKS;
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Zurich' });

  // Determine which radar is currently "live" for regular visitors.
  // If RADAR.liveDate is in the future, fall back to the first previous radar.
  const currentRadar = window.GRINLOUD_DATA.RADAR;
  const radarActuallyLive = !currentRadar.liveDate || todayStr >= currentRadar.liveDate;
  const liveRadar = (isAdmin || radarActuallyLive)
    ? currentRadar
    : (window.GRINLOUD_DATA.PREVIOUS_RADARS[0] || currentRadar);

  const [selectedRadar, setSelectedRadar] = React.useState(_deepLinkedRadar || liveRadar);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState(null); // overrides pick spotify when set
  const [showNewsletter, setShowNewsletter] = React.useState(false);

  // Regular users: only past + today picks. Admin (?admin): all picks incl. future.
  const picks = isAdmin
    ? allPicks
    : allPicks.filter(p => p.date <= todayStr);

  // Auto-detect today's pick; fall back to index 0 (most recent visible)
  const todayIdx = picks.findIndex((p) => p.date === todayStr);
  const [pickIdx, setPickIdx] = React.useState(todayIdx >= 0 ? todayIdx : 0);

  const pick = picks[pickIdx];

  const palette = COLOR_MAP[t.bgColor] || COLOR_MAP.pink;

  // When pick changes, sync accent color + update JSON-LD for SEO
  React.useEffect(() => {
    if (pick.accent) setTweak('bgColor', pick.accent);
    // Update structured data for current pick
    let ld = document.getElementById('ld-pick');
    if (!ld) { ld = document.createElement('script'); ld.id = 'ld-pick'; ld.type = 'application/ld+json'; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'MusicRecording',
      'name': pick.title,
      'byArtist': { '@type': 'MusicGroup', 'name': pick.artist },
      'genre': pick.genre,
      'datePublished': pick.date,
      'url': pick.links?.spotify && pick.links.spotify !== '#' ? pick.links.spotify : 'https://grinloud.com',
      'description': pick.info,
    });
  }, [pickIdx]);

  const canPrev = pickIdx < picks.length - 1; // can go to older pick
  const canNext = pickIdx > 0;                // can go to newer pick
  const prev = () => canPrev && setPickIdx((i) => i + 1);
  const next = () => canNext && setPickIdx((i) => i - 1);

  React.useEffect(() => {
    // Apply background color to root so it bleeds behind the scaled stage.
    document.documentElement.style.setProperty('--page-bg', palette.bg);
    document.documentElement.style.setProperty('--ink', palette.ink);
  }, [palette]);

  // Stop preview when route or pick changes; clear track override when leaving radar
  React.useEffect(() => { setIsPlaying(false); }, [route, pickIdx]);
  React.useEffect(() => { if (route !== 'radar') setPreviewUrl(null); }, [route]);

  // Dynamic page title
  React.useEffect(() => {
    const titles = {
      home:    `${pick.title} — ${pick.artist} · GRINLOUD`,
      radar:   `Music Radar ${selectedRadar.number} · GRINLOUD`,
      archive: 'Archive · GRINLOUD',
    };
    document.title = titles[route] || 'GRINLOUD — House Music Curated Daily';
  }, [route, pickIdx, selectedRadar]);

  const Home = t.variant === 'A' ? HomeA : HomeB;

  // Cinema mode — render fullscreen pick view, no UI
  if (isCinemaMode) return <Cinema pick={pick} />;

  // Radar cover mode — fullscreen promo card for Instagram / TikTok
  if (isRadarMode) return <RadarCover radar={window.GRINLOUD_DATA.RADAR} />;

  return (
    <div className="app" style={{ background: palette.bg, color: palette.ink }}>
      <TopBrand />
      <TopNav
        route={route}
        setRoute={(r) => {
          if (r === 'archive') setArchiveTab(route === 'radar' ? 'radars' : 'picks');
          setRoute(r);
        }}
        onBack={() => setRoute('home')}
        onNewsletter={() => setShowNewsletter(true)}
        onGotoRadar={() => { setSelectedRadar(liveRadar); setRoute('radar'); }}
        accent={palette.bg}
        isAdmin={isAdmin}
      />

      {route === 'home' && (
        <Home
          pick={pick}
          accent={palette.bg}
          contrastInk={palette.ink}
          prev={prev}
          next={next}
          canPrev={canPrev}
          canNext={canNext}
          onPlay={() => setIsPlaying((p) => !p)}
          isPlaying={isPlaying}
          typeScale={t.typeScale}
          infoDensity={t.density}
          logoPos={t.logoPos}
          overlayOpacity={t.overlay}
          onGotoRadar={() => setRoute('radar')}
          isAdmin={isAdmin}
        />
      )}

      {route === 'radar' && (
        <MusicRadar
          radar={selectedRadar}
          accent={palette.bg}
          contrastInk={palette.ink}
          onBack={() => setRoute('home')}
          onGotoArchive={() => { setArchiveTab('radars'); setRoute('archive'); }}
          onPreviewTrack={(url) => { setPreviewUrl(url); setIsPlaying(true); }}
        />
      )}

      {route === 'archive' && (
        <Archive
          accent={palette.bg}
          contrastInk={palette.ink}
          onBack={() => setRoute('home')}
          onGotoRadar={() => { setSelectedRadar(liveRadar); setRoute('radar'); }}
          onOpenRadar={(r) => { setSelectedRadar(r); setRoute('radar'); }}
          onPreviewTrack={(url) => { setPreviewUrl(url); setIsPlaying(true); }}
          initialTab={archiveTab}
          isAdmin={isAdmin}
        />
      )}

      <NewsletterModal
        open={showNewsletter}
        onClose={() => setShowNewsletter(false)}
        accent={palette.bg}
      />

      <SpotifyPreviewBar
        spotifyUrl={previewUrl || pick.links.spotify}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Variant" />
        <TweakRadio
          label="Homepage"
          value={t.variant}
          options={['A', 'B']}
          onChange={(v) => setTweak('variant', v)}
        />

        <TweakSection label="Background" />
        <TweakColor
          label="Accent"
          value={palette.bg}
          options={['#FF1F8F', '#FFE600', '#FF6200', '#00C2FF', '#39FF14']}
          onChange={(hex) => {
            const map = { '#FF1F8F': 'pink', '#FFE600': 'yellow', '#FF6200': 'orange', '#00C2FF': 'blue', '#39FF14': 'green' };
            setTweak('bgColor', map[hex] || 'pink');
          }}
        />
        <TweakSlider
          label="Video overlay"
          value={t.overlay}
          min={0} max={1} step={0.05}
          onChange={(v) => setTweak('overlay', v)}
        />

        <TweakSection label="Typography" />
        <TweakSlider
          label="Track title scale"
          value={t.typeScale}
          min={0.6} max={1.6} step={0.05}
          onChange={(v) => setTweak('typeScale', v)}
        />
        <TweakRadio
          label="Info density"
          value={t.density}
          options={['minimal', 'regular', 'comfy']}
          onChange={(v) => setTweak('density', v)}
        />

        <TweakSection label="Logo" />
        <TweakRadio
          label="Position"
          value={t.logoPos}
          options={['top', 'corner', 'big']}
          onChange={(v) => setTweak('logoPos', v)}
        />
      </TweaksPanel>
    </div>
  );
}

export { App };
