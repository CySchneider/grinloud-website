// Main App: routing, state, Tweaks wiring.

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

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState('home');
  const [archiveTab, setArchiveTab] = React.useState('picks');
  const [selectedRadar, setSelectedRadar] = React.useState(window.GRINLOUD_DATA.RADAR);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState(null); // overrides pick spotify when set
  const [showNewsletter, setShowNewsletter] = React.useState(false);

  const picks = window.GRINLOUD_DATA.PICKS;

  // Auto-detect today's pick; fall back to index 0 (newest) if not found
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayIdx = picks.findIndex((p) => p.date === todayStr);
  const [pickIdx, setPickIdx] = React.useState(todayIdx >= 0 ? todayIdx : 0);

  const pick = picks[pickIdx];

  const palette = COLOR_MAP[t.bgColor] || COLOR_MAP.pink;

  // When pick changes, sync accent color to the pick's genre palette
  React.useEffect(() => {
    if (pick.accent) setTweak('bgColor', pick.accent);
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

  const Home = t.variant === 'A' ? HomeA : HomeB;

  return (
    <div className="app" style={{ background: palette.bg, color: palette.ink }}>
      <TopNav
        route={route}
        setRoute={(r) => {
          if (r === 'archive') setArchiveTab('picks'); // TopNav always opens picks tab
          setRoute(r);
        }}
        onNewsletter={() => setShowNewsletter(true)}
        accent={palette.bg}
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
          onGotoRadar={() => { setSelectedRadar(window.GRINLOUD_DATA.RADAR); setRoute('radar'); }}
          onOpenRadar={(r) => { setSelectedRadar(r); setRoute('radar'); }}
          onSelectPick={(i) => { setPickIdx(i); setRoute('home'); }}
          initialTab={archiveTab}
        />
      )}

      <NewsletterModal
        open={showNewsletter}
        onClose={() => setShowNewsletter(false)}
        accent={palette.bg}
      />

      <SpotifyPreviewBar
        spotifyUrl={previewUrl || pick.links.spotify}
        isPlaying={isPlaying}
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

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
