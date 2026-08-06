// Pick of the Day (homepage) — "Quiet Signal"
// Replaces the old HomeA/HomeB split: one flat, off-white layout, cover art
// top-left/left-column, no full-bleed video/color background.
import React from 'react'
import { PickCarousel, StreamingLinks, ShareButton, LegalLinks, SpotifyCover } from './shared.jsx'
import { Icon } from './icons.jsx'

// Horizontal swipe → prev/next pick, mirroring the desktop arrow buttons.
// Ignores swipes that start inside .pick-carousel — that element has its
// own horizontal scroll-snap track (GRINLOUD SAYS / FUN FACT slides) and
// must keep handling its own touch gestures.
const SWIPE_MIN_DX = 60;

function useSwipeNav(prev, next) {
  const touch = React.useRef(null);

  const onTouchStart = (e) => {
    if (e.target.closest('.pick-carousel')) { touch.current = null; return; }
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) < SWIPE_MIN_DX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) next(); else prev();
  };

  return { onTouchStart, onTouchEnd };
}

function Home({ pick, radar, accent, prev, next, canPrev, canNext, onPlay, isPlaying, typeScale, onGotoRadar, isAdmin }) {
  // cqw (container query width, off .home__text's own rendered width), not vw —
  // keeps the chars-per-line ratio constant whatever width the flex layout
  // actually hands the text column, instead of drifting/overflowing based on
  // raw viewport width the way a vw-based size would.
  const titleSize = 6.8 * typeScale;
  const isScheduled = isAdmin && pick.date > new Date().toISOString().slice(0, 10);
  const swipe = useSwipeNav(() => canPrev && prev(), () => canNext && next());

  return (
    <div className="home" style={{ '--accent': accent }} onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
      {canPrev && (
        <button className="nav-arrow nav-arrow--left" onClick={prev} aria-label="Previous pick">
          <Icon.Chevron dir="left" size={22} />
        </button>
      )}
      {canNext && (
        <button className="nav-arrow nav-arrow--right" onClick={next} aria-label="Next pick">
          <Icon.Chevron dir="right" size={22} />
        </button>
      )}

      <div className="home__main">
        <div className="home__hero">
          <div className="pick-cover">
            <SpotifyCover spotifyUrl={pick.links?.spotify} alt={`${pick.title} — ${pick.artist} cover art`} />
          </div>

          <div className="home__text">
            <div className="home__eyebrow">
              <span className="home__eyebrow-dot" />
              PICK OF THE DAY — {pick.date}
              {isScheduled && <span className="pick-scheduled-badge">SCHEDULED</span>}
            </div>

            <h1 className="track-title" style={{ fontSize: `clamp(28px, ${titleSize}cqw, 104px)` }}>
              {pick.title}
            </h1>
            <div className="home__artist-block">
              {pick.artistImage && (
                <img className="home__artist-photo" src={pick.artistImage} alt={`${pick.artist} photo`} loading="lazy" />
              )}
              <div className="home__artist-info">
                <div className="artist-row">{pick.artist}</div>
                <div className="meta-pills">
                  <span className="meta-pill"><span className="meta-pill__v">{pick.bpm} BPM</span></span>
                  <span className="meta-pill"><span className="meta-pill__v">{pick.key}</span></span>
                  <span className="meta-pill"><span className="meta-pill__v">{pick.label}</span></span>
                  <span className="meta-pill"><span className="meta-pill__v">{pick.genre}</span></span>
                  <span className="meta-pill"><span className="meta-pill__v">{pick.release}</span></span>
                </div>
              </div>
            </div>

            <PickCarousel pick={pick} />

            <div className="home__divider" />

            <div className="pick-actions">
              <button
                className={`play-btn ${isPlaying ? 'is-playing' : ''}`}
                onClick={() => { isPlaying ? window.grinloudPauseSpotify() : window.grinloudPlaySpotify(pick.links.spotify); onPlay(); }}
              >
                {isPlaying ? <Icon.Pause size={12} /> : null}
                <span>{isPlaying ? 'PAUSE' : '▶ PLAY PREVIEW'}</span>
              </button>
              <StreamingLinks links={pick.links} accent={accent} />
              <ShareButton
                url={`https://grinloud.com/pick/${pick.date}/`}
                title={`${pick.title} — ${pick.artist} · GRINLOUD`}
                text={`GRINLOUD Pick of the Day: ${pick.title} by ${pick.artist}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="home__footer-row">
        <div className="home__footer-nav">
          <button className="home__footer-prev" onClick={prev} disabled={!canPrev}>← PREV</button>
          <button className="home__footer-next" onClick={next} disabled={!canNext}>NEXT →</button>
        </div>
        <button className="site-radar-pill" onClick={onGotoRadar}>MUSIC RADAR {radar.number} →</button>
      </div>

      <footer className="home__legal-footer">
        <LegalLinks />
      </footer>
    </div>
  );
}

export { Home };
