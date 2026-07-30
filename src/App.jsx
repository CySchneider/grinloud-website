// Main App: routing, state, Tweaks wiring.
import React from 'react'
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakSlider } from '../tweaks-panel.jsx'
import { TopBrand, TopNav, NewsletterModal, SpotifyPreviewBar } from './shared.jsx'
import { Home } from './Home.jsx'
import { Cinema } from './Cinema.jsx'
import { RadarCover } from './RadarCover.jsx'
import { MusicRadar } from './MusicRadar.jsx'
import { Archive } from './Archive.jsx'

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "bgColor": "pink",
  "typeScale": 1.0,
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

// Parses the current address bar into the app state it points at: a radar
// (?music-radar=005 or the static /radar/005/ path), a Pick of the Day
// (?pick=2026-07-09 or /pick/2026-07-09/), or the archive (?archive=picks|radars).
// Used both for the initial deep-link on load and to restore state when the
// user hits the browser back/forward buttons (see the popstate handler below).
function parseLocationState() {
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname;
  const radarPathMatch = path.match(/^\/radar\/(\d{3})\/?$/);
  const pickPathMatch  = path.match(/^\/pick\/(\d{4}-\d{2}-\d{2})\/?$/);
  const archiveParam = params.get('archive');
  return {
    radarNumber: params.get('music-radar') || radarPathMatch?.[1] || null,
    pickDate: params.get('pick') || pickPathMatch?.[1] || null,
    isArchive: archiveParam === 'picks' || archiveParam === 'radars',
    archiveTab: archiveParam === 'radars' ? 'radars' : 'picks',
  };
}

const _initialLoc = parseLocationState();
const _allRadars  = _initialLoc.radarNumber
  ? [window.GRINLOUD_DATA.RADAR, ...window.GRINLOUD_DATA.PREVIOUS_RADARS]
  : [];
const _deepLinkedRadar = _initialLoc.radarNumber
  ? (_allRadars.find(r => r.number === _initialLoc.radarNumber) || null)
  : null;
const _pickParam = _initialLoc.pickDate;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState(_initialLoc.isArchive ? 'archive' : (_deepLinkedRadar ? 'radar' : 'home'));
  const [archiveTab, setArchiveTab] = React.useState(_initialLoc.archiveTab);

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
  const paramIdx = _pickParam ? picks.findIndex((p) => p.date === _pickParam) : -1;
  const [pickIdx, setPickIdx] = React.useState(paramIdx >= 0 ? paramIdx : (todayIdx >= 0 ? todayIdx : 0));

  // Clamp pickIdx to valid range in case picks array changes length (e.g. midnight filter update)
  const safePickIdx = picks.length > 0 ? Math.max(0, Math.min(picks.length - 1, pickIdx)) : 0;
  const pick = picks[safePickIdx];

  const palette = COLOR_MAP[t.bgColor] || COLOR_MAP.pink;

  // When pick changes, sync accent color + update JSON-LD for SEO
  React.useEffect(() => {
    if (!pick) return;
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

  // "PICK" nav link / logo / wordmark always land on today's pick, never
  // wherever prev/next last left the carousel — clicking Home should feel
  // like a fresh reload, not "back to where I was browsing".
  const goHome = () => {
    setPickIdx(todayIdx >= 0 ? todayIdx : 0);
    setRoute('home');
  };

  // Shared play/pause toggle for Music Radar and Archive tracklists — a row
  // is "playing" when its own Spotify URL matches previewUrl AND isPlaying
  // is true, so pressing its Play control again pauses instead of restarting.
  const toggleTrackPreview = (url) => {
    if (!url || url === '#') return;
    if (isPlaying && previewUrl === url) {
      window.grinloudPauseSpotify();
      setIsPlaying(false);
    } else {
      window.grinloudPlaySpotify(url);
      setPreviewUrl(url);
      setIsPlaying(true);
    }
  };

  // If a preview is already playing, prev/next should carry it over to the
  // new pick instead of just stopping — grinloudPlaySpotify must be called
  // synchronously in this click handler (not from an effect) or iOS Safari
  // drops the user-gesture token and refuses to autoplay.
  const continueAcrossPickRef = React.useRef(false);
  const gotoPick = (idx) => {
    const target = picks[idx];
    const canContinue = isPlaying && target?.links?.spotify && target.links.spotify !== '#';
    if (canContinue) {
      continueAcrossPickRef.current = true;
      window.grinloudPlaySpotify(target.links.spotify);
    }
    setPickIdx(idx);
  };
  const prev = () => canPrev && gotoPick(pickIdx + 1);
  const next = () => canNext && gotoPick(pickIdx - 1);

  // Stop preview when route or pick changes — except right after prev/next
  // carried an active preview over to the new pick (see gotoPick above).
  React.useEffect(() => {
    if (continueAcrossPickRef.current) { continueAcrossPickRef.current = false; return; }
    setIsPlaying(false);
  }, [route, pickIdx]);
  React.useEffect(() => { if (route !== 'radar' && route !== 'archive') setPreviewUrl(null); }, [route]);

  // Keep the address bar in sync with in-app navigation, so the current
  // screen can be copied, refreshed, or reached via the browser back/forward
  // buttons. /pick/ and /radar/ mirror the static routes generate-static-pages.js
  // ships; archive has no static page, so it lives behind a query param on "/".
  const hasSyncedUrlRef = React.useRef(false);
  React.useEffect(() => {
    if (!pick) return;
    const url = route === 'radar' ? `/radar/${selectedRadar.number}/`
      : route === 'archive' ? `/?archive=${archiveTab}`
      : `/pick/${pick.date}/`;
    if (url !== window.location.pathname + window.location.search) {
      window.history[hasSyncedUrlRef.current ? 'pushState' : 'replaceState']({}, '', url);
    }
    hasSyncedUrlRef.current = true;
  }, [route, selectedRadar.number, pick && pick.date, archiveTab]);

  // Restore state when the user navigates with the browser back/forward buttons.
  React.useEffect(() => {
    const onPopState = () => {
      const loc = parseLocationState();
      if (loc.isArchive) {
        setArchiveTab(loc.archiveTab);
        setRoute('archive');
        return;
      }
      if (loc.radarNumber) {
        const all = [window.GRINLOUD_DATA.RADAR, ...window.GRINLOUD_DATA.PREVIOUS_RADARS];
        const found = all.find((r) => r.number === loc.radarNumber);
        if (found) setSelectedRadar(found);
        setRoute('radar');
        return;
      }
      if (loc.pickDate) {
        const idx = picks.findIndex((p) => p.date === loc.pickDate);
        if (idx >= 0) setPickIdx(idx);
      }
      setRoute('home');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [picks]);

  // Dynamic page title
  React.useEffect(() => {
    const titles = {
      home:    `${pick.title} — ${pick.artist} · GRINLOUD`,
      radar:   `Music Radar ${selectedRadar.number} · GRINLOUD`,
      archive: 'Archive · GRINLOUD',
    };
    document.title = titles[route] || 'GRINLOUD — House Music Curated Daily';
  }, [route, pickIdx, selectedRadar]);

  // Guard: if picks is empty or pickIdx is out of range, render nothing
  if (!pick) return null;

  // Cinema mode — render fullscreen pick view, no UI
  if (isCinemaMode) return <Cinema pick={pick} />;

  // Radar cover mode — fullscreen promo card for Instagram / TikTok
  if (isRadarMode) return <RadarCover radar={window.GRINLOUD_DATA.RADAR} />;

  return (
    <div className="app">
      <TopBrand onHome={goHome} />
      <TopNav
        route={route}
        setRoute={(r) => {
          if (r === 'archive') setArchiveTab(route === 'radar' ? 'radars' : 'picks');
          if (r === 'home') { goHome(); return; }
          setRoute(r);
        }}
        onBack={() => setRoute('home')}
        onNewsletter={() => setShowNewsletter(true)}
        onGotoRadar={() => { setSelectedRadar(liveRadar); setRoute('radar'); }}
        onHome={goHome}
        accent={palette.bg}
        isAdmin={isAdmin}
      />

      {route === 'home' && (
        <Home
          pick={pick}
          accent={palette.bg}
          prev={prev}
          next={next}
          canPrev={canPrev}
          canNext={canNext}
          onPlay={() => setIsPlaying((p) => !p)}
          isPlaying={isPlaying}
          typeScale={t.typeScale}
          infoDensity={t.density}
          onGotoRadar={() => setRoute('radar')}
          isAdmin={isAdmin}
        />
      )}

      {route === 'radar' && (
        <MusicRadar
          radar={selectedRadar}
          accent={palette.bg}
          onBack={() => setRoute('home')}
          onGotoArchive={() => { setArchiveTab('radars'); setRoute('archive'); }}
          previewUrl={previewUrl}
          isPlaying={isPlaying}
          onToggleTrack={toggleTrackPreview}
        />
      )}

      {route === 'archive' && (
        <Archive
          accent={palette.bg}
          onBack={() => setRoute('home')}
          onGotoRadar={() => { setSelectedRadar(liveRadar); setRoute('radar'); }}
          onOpenRadar={(r) => { setSelectedRadar(r); setRoute('radar'); }}
          previewUrl={previewUrl}
          isPlaying={isPlaying}
          onToggleTrack={toggleTrackPreview}
          tab={archiveTab}
          onTabChange={setArchiveTab}
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
        <TweakSection label="Accent" />
        <TweakColor
          label="Accent dot"
          value={palette.bg}
          options={['#FF1F8F', '#FFE600', '#FF6200', '#00C2FF', '#39FF14']}
          onChange={(hex) => {
            const map = { '#FF1F8F': 'pink', '#FFE600': 'yellow', '#FF6200': 'orange', '#00C2FF': 'blue', '#39FF14': 'green' };
            setTweak('bgColor', map[hex] || 'pink');
          }}
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
      </TweaksPanel>
    </div>
  );
}

export { App };
