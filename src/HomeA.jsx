// Homepage Variant A

function HomeA({ pick, accent, contrastInk, prev, next, canPrev, canNext, onPlay, isPlaying, typeScale, infoDensity, logoPos, overlayOpacity, onGotoRadar, isAdmin }) {
  const titleSize = 9 * typeScale;
  return (
    <div className="home home--a" style={{ '--accent': accent, '--ink': contrastInk }}>
      <BackgroundVideo accent={accent} overlayOpacity={overlayOpacity} src={pick.video} />

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

        <h1 className="track-title track-title--a" style={{ fontSize: `clamp(40px, ${titleSize}vw, 200px)` }}>
          {pick.title}
        </h1>

        <div className="pick-artist">{pick.artist}</div>
        <div className="pick-submeta">{pick.genre.toUpperCase()} · {pick.bpm} BPM · {pick.key}</div>

        {/* Grinloud Says — narrow lines with label between them */}
        {infoDensity !== 'minimal' && (
          <div className="pick-quote">
            <div className="pick-quote__header">
              <div className="pick-quote__rule" />
              <span className="pick-quote__label">GRINLOUD SAYS:</span>
              <div className="pick-quote__rule" />
            </div>
            <p className="pick-quote__text">{pick.info}</p>
            <div className="pick-quote__rule pick-quote__rule--solo" />
          </div>
        )}

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

window.HomeA = HomeA;
