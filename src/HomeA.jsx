// Homepage Variant A

function HomeA({ pick, accent, contrastInk, prev, next, canPrev, canNext, onPlay, isPlaying, typeScale, infoDensity, logoPos, overlayOpacity, onGotoRadar }) {
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
        <div className="eyebrow-row">
          <span className="eyebrow-dot" />
          <span className="eyebrow-text">PICK OF THE DAY · {pick.date}</span>
        </div>

        <h1
          className="track-title track-title--a"
          style={{ fontSize: `clamp(40px, ${titleSize}vw, 200px)` }}
        >
          {pick.title}
        </h1>

        {/* Artist + meta on two lines */}
        <div className="pick-artist">{pick.artist}</div>
        <div className="pick-submeta">
          {pick.genre.toUpperCase()} · {pick.bpm} BPM · {pick.key}
        </div>

        {/* Description frame */}
        {infoDensity !== 'minimal' && (
          <div className="pick-description">
            {infoDensity === 'comfy' ? pick.info : pick.short}
          </div>
        )}

        {/* Play + Streaming links row */}
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

      {/* Bottom-left GRINLOUD badge */}
      <footer className="home-a__footer">
        <div className="grinloud-badge">
          <div className="grinloud-badge__name">GRINLOUD</div>
          <div className="grinloud-badge__claim">HOUSE MUSIC CURATED DAILY</div>
        </div>
        <LegalLinks />
      </footer>
    </div>
  );
}

window.HomeA = HomeA;
