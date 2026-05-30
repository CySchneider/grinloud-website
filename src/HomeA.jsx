// Homepage Variant A — "Centered Brutal"

function HomeA({ pick, accent, contrastInk, prev, next, canPrev, canNext, typeScale, infoDensity, logoPos, overlayOpacity, onGotoRadar }) {
  const titleSize = 9 * typeScale; // ~17% smaller than before (was 11)
  return (
    <div className="home home--a" style={{ '--accent': accent, '--ink': contrastInk }}>
      <BackgroundVideo accent={accent} overlayOpacity={overlayOpacity} src={pick.video} />

      <header className={`home-a__header header-logo--${logoPos}`}>
        <LogoMark position={logoPos} />
      </header>

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

        <div className="artist-row">
          <span className="artist-name">{pick.artist}</span>
          <span className="artist-sep">·</span>
          <span className="artist-genre">{pick.genre}</span>
        </div>

        {infoDensity !== 'minimal' && (
          <p className="track-info">
            {infoDensity === 'comfy' ? pick.info : pick.short}
          </p>
        )}

        {infoDensity === 'comfy' && <MetaPills pick={pick} />}
        {infoDensity === 'regular' && (
          <div className="meta-inline">
            {pick.bpm} BPM &nbsp;/&nbsp; {pick.key} &nbsp;/&nbsp; {pick.label} &nbsp;/&nbsp; {pick.release}
          </div>
        )}

        <StreamingLinks links={pick.links} accent={accent} />
      </main>

      <footer className="home-a__footer">
        <ClaimChip accent={accent} />
        <div className="home-a__footer-right">
          <button className="radar-link" onClick={onGotoRadar}>
            MUSIC RADAR {window.GRINLOUD_DATA.RADAR.number} → OUT NOW
          </button>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}

window.HomeA = HomeA;
