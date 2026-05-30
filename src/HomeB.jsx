// Homepage Variant B — "Asymmetric Poster"
// Arty / editorial. Logo offset, giant rotated date, track title on a baseline grid,
// info card pinned to one side, claim runs as vertical type. Same content, different rhythm.

function HomeB({ pick, accent, contrastInk, prev, next, canPrev, canNext, typeScale, infoDensity, logoPos, overlayOpacity, onGotoRadar }) {
  const titleSize = 10 * typeScale; // ~17% smaller

  // Big date display: "28 / 05" with year underneath
  const [yyyy, mm, dd] = pick.date.split('-');

  return (
    <div className="home home--b" style={{ '--accent': accent, '--ink': contrastInk }}>
      <BackgroundVideo accent={accent} overlayOpacity={overlayOpacity} src={pick.video} />

      <header className={`home-b__header header-logo--${logoPos}`}>
        <LogoMark position={logoPos} size={64} />
        <div className="home-b__brand">
          <div className="home-b__brand-mark">GRINLOUD</div>
          <div className="home-b__brand-claim">House music curated daily.</div>
        </div>
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


      <div className="home-b__grid">
        <div className="home-b__date">
          <div className="home-b__date-num">{dd}<span className="home-b__date-slash">/</span>{mm.replace(/^0/, '')}</div>
          <div className="home-b__date-year">{yyyy} · PICK / 047</div>
        </div>

        <div className="home-b__rule" />

        <div className="home-b__main">
          <div className="home-b__eyebrow">
            <span>PICK OF THE DAY</span>
            <span className="home-b__eyebrow-dot" />
            <span>{pick.genre.toUpperCase()}</span>
          </div>

          <h1
            className="track-title track-title--b"
            style={{ fontSize: `clamp(56px, ${titleSize}vw, 280px)` }}
          >
            {pick.title}
          </h1>

          <div className="home-b__artist">
            <span className="home-b__artist-by">BY</span>
            <span className="home-b__artist-name">{pick.artist}</span>
          </div>

          {infoDensity !== 'minimal' && (
            <p className="home-b__info">
              {infoDensity === 'comfy' ? pick.info : pick.short}
            </p>
          )}

          <StreamingLinks links={pick.links} accent={accent} />
        </div>

        <aside className="home-b__meta">
          <div className="home-b__meta-row"><span>BPM</span><b>{pick.bpm}</b></div>
          <div className="home-b__meta-row"><span>KEY</span><b>{pick.key}</b></div>
          <div className="home-b__meta-row"><span>LABEL</span><b>{pick.label}</b></div>
          <div className="home-b__meta-row"><span>RELEASE</span><b>{pick.release}</b></div>
          <div className="home-b__meta-row"><span>FILED</span><b>{pick.genre}</b></div>
        </aside>
      </div>

      <div className="home-b__vertical-claim">
        <span>HOUSE / TECH HOUSE / PROGRESSIVE / BASS HOUSE → CURATED DAILY → MIXED ALL 10 DAYS</span>
      </div>

      <button className="home-b__radar" onClick={onGotoRadar}>
        <div className="home-b__radar-eyebrow">LATEST MIX</div>
        <div className="home-b__radar-title">MUSIC RADAR {window.GRINLOUD_DATA.RADAR.number}</div>
        <div className="home-b__radar-meta">{window.GRINLOUD_DATA.RADAR.tracks.length} TRACKS · {window.GRINLOUD_DATA.RADAR.duration} · YOUTUBE</div>
        <div className="home-b__radar-arrow"><Icon.Arrow /></div>
      </button>
    </div>
  );
}

window.HomeB = HomeB;
