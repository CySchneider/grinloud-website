// Radar Cover — /?radar — fullscreen promo card for Instagram / TikTok
// Usage: grinloud.com/?radar — always shows the current radar (GRINLOUD_DATA.RADAR)
import React from 'react'

// Two-slot crossfade: video A fades out while video B fades in — no black gap.
function CyclingVideo({ srcs, accent, overlayOpacity = 0.20 }) {
  const refA = React.useRef(null);
  const refB = React.useRef(null);
  const activeSlot = React.useRef('a');   // which slot is currently playing
  const currentIdx = React.useRef(0);
  const [opacityA, setOpacityA] = React.useState(1);
  const [opacityB, setOpacityB] = React.useState(0);

  // Load first video into slot A on mount
  React.useEffect(() => {
    if (!srcs.length) return;
    const v = refA.current;
    v.src = srcs[0];
    v.load();
    v.play().catch(() => {});
  }, []); // eslint-disable-line

  const advance = React.useCallback(() => {
    const nextIdx = (currentIdx.current + 1) % srcs.length;
    const isA = activeSlot.current === 'a';

    // Load + play next video into the currently invisible slot
    const nextRef = isA ? refB : refA;
    nextRef.current.src = srcs[nextIdx];
    nextRef.current.load();
    nextRef.current.play().catch(() => {});

    // Crossfade: both opacity changes fire in the same React batch → simultaneous
    if (isA) {
      setOpacityA(0);
      setOpacityB(1);
      activeSlot.current = 'b';
    } else {
      setOpacityB(0);
      setOpacityA(1);
      activeSlot.current = 'a';
    }

    currentIdx.current = nextIdx;
  }, [srcs]);

  const videoStyle = (opacity) => ({
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    filter: 'blur(1px) brightness(0.80)',
    opacity,
    transition: 'opacity 0.8s ease',
  });

  return (
    <div className="bg-video-stage" aria-hidden="true">
      <video ref={refA} muted playsInline
        onEnded={() => activeSlot.current === 'a' && advance()}
        style={videoStyle(opacityA)} />
      <video ref={refB} muted playsInline
        onEnded={() => activeSlot.current === 'b' && advance()}
        style={videoStyle(opacityB)} />
      {/* neon tint */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundColor: accent, opacity: overlayOpacity * 0.5,
      }} />
      {/* readability gradient */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.70) 100%)',
      }} />
      {/* vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.42) 100%)',
      }} />
    </div>
  );
}

function RadarCover({ radar }) {
  const accent = '#FFE000'; // yellow — consistent radar brand
  const top3   = radar.tracks.slice(0, 3);
  const slug   = `radar-${radar.number}`;
  const videos = radar.videos?.length ? radar.videos : window.GRINLOUD_DATA.BG_VIDEOS;

  return (
    <div className="cinema radar-cover">
      <CyclingVideo srcs={videos} accent={accent} />

      {/* Centered content */}
      <div className="cinema__content radar-cover__content">
        <div className="radar-cover__eyebrow">GRINLOUD Music Radar</div>
        <div className="radar-cover__number">{radar.number}</div>

        <div className="radar-cover__subtitle">{radar.subtitle}</div>

        <div className="radar-cover__tracks">
          {top3.map(t => (
            <div key={t.n} className="radar-cover__track">
              <span className="radar-cover__track-n">{t.n}</span>
              <span className="radar-cover__track-info">
                <span className="radar-cover__track-title">{t.title}</span>
                <span className="radar-cover__track-artist">{t.artist}</span>
              </span>
            </div>
          ))}
          <div className="radar-cover__more">···</div>
        </div>

        <div className="radar-cover__link">
          Full list at grinloud.com/{slug}
        </div>
      </div>

      {/* Bottom-left branding */}
      <div className="cinema__brand">
        <img src="Logo%20GRINLOUD%20Smiley%20Yellow%20black.svg" alt="GRINLOUD" className="cinema__brand-logo" />
        <div className="cinema__brand-text">
          <span className="cinema__brand-wordmark">grinloud</span>
          <span className="cinema__brand-claim">House music curated daily</span>
        </div>
      </div>
    </div>
  );
}

export { RadarCover };
