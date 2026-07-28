// Homepage Variant A
import { CoverBackground, PickCarousel, StreamingLinks, ShareButton, LegalLinks, SpotifyCover } from './shared.jsx'
import { Icon } from './icons.jsx'

function HomeA({ pick, accent, contrastInk, prev, next, canPrev, canNext, onPlay, isPlaying, typeScale, infoDensity, logoPos, overlayOpacity, onGotoRadar, isAdmin }) {
  // cqw (container query width), not vw — sized off .home-a__main's own
  // rendered width so the chars-per-line ratio stays constant at every
  // viewport instead of drifting between vw-based font and vw-based
  // container clamps (that mismatch caused 1↔2-line flips on resize).
  const titleSize = 6.8 * typeScale;
  return (
    <div className="home home--a" style={{ '--accent': accent, '--ink': contrastInk }}>
      <CoverBackground accent={accent} overlayOpacity={overlayOpacity} spotifyUrl={pick.links?.spotify} />

      {canPrev && (
        <button className="nav-arrow nav-arrow--left" onClick={prev} aria-label="Previous pick">
          <Icon.Chevron dir="left" size={28} />
        </button>
      )}
      {canNext && (
        <button className="nav-arrow nav-arrow--right" onClick={next} aria-label="Next pick">
          <Icon.Chevron dir="right" size={28} />
        </button>
      )}

      <main className="home-a__main">
        {/* Pick of the Day — same style as Music Radar pill, no dot */}
        <div className="top-nav__radar-pill pick-pill">
          PICK OF THE DAY · {pick.date}
          {isAdmin && pick.date > new Date().toISOString().slice(0,10) && (
            <span className="pick-scheduled-badge">SCHEDULED</span>
          )}
        </div>

        <div className="pick-cover">
          <SpotifyCover spotifyUrl={pick.links?.spotify} alt={`${pick.title} — ${pick.artist} cover art`} />
        </div>

        <h1 className="track-title track-title--a" style={{ fontSize: `clamp(32px, ${titleSize}cqw, var(--track-title-max, 104px))` }}>
          {pick.title}
        </h1>

        {/* Swipeable info card — Artist / Track Info / GRINLOUD SAYS /
            Fun Fact (if present) / Label. Replaces the old stacked blocks.
            Artist was always shown before regardless of infoDensity, so
            (unlike the old quote-only gate) this isn't hidden in minimal
            mode either — it's now the only place that info lives. */}
        <PickCarousel pick={pick} />

        {/* Play + Streaming */}
        <div className="pick-actions">
          <button
            className={`play-btn ${isPlaying ? 'is-playing' : ''}`}
            onClick={() => { isPlaying ? window.grinloudPauseSpotify() : window.grinloudPlaySpotify(pick.links.spotify); onPlay(); }}
          >
            {isPlaying ? <Icon.Pause size={16} /> : <Icon.Play size={16} />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY PREVIEW'}</span>
          </button>
          <StreamingLinks links={pick.links} accent={accent} />
          <ShareButton
            url={`https://grinloud.com/pick/${pick.date}/`}
            title={`${pick.title} — ${pick.artist} · GRINLOUD`}
            text={`GRINLOUD Pick of the Day: ${pick.title} by ${pick.artist}`}
          />
        </div>
      </main>

      {/* GRINLOUD brand — absolutely positioned, left-aligned with smiley */}
      <div className="brand-footer">
        <div className="brand-footer__name" style={{ color: accent }}>GRINLOUD</div>
        <div className="brand-footer__claim" style={{ color: accent }}>HOUSE MUSIC CURATED DAILY</div>
      </div>

      <footer className="home-a__footer">
        <LegalLinks />
      </footer>
    </div>
  );
}

export { HomeA };
