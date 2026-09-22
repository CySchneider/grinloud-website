// Home — A) Pick of the Day hero, with a smaller teaser for the Music
// Radar cycle this pick belongs to nested below its own info, and B) a
// random wall of past picks' covers.
import React from 'react'
import { PickCarousel, StreamingLinks, ShareButton, LegalLinks, SpotifyCover, TrackInfoLayer, picksVisibleThroughDate } from './shared.jsx'
import { Icon } from './icons.jsx'

// Horizontal swipe → prev/next pick, mirroring the PREV/NEXT buttons below
// the hero (the only pick-nav control now — no more on-screen arrows).
// Scoped to section A only so it doesn't fight with vertical scrolling into
// sections B/C below it. Still ignores swipes that start inside
// .pick-carousel — that element has its own horizontal scroll-snap track
// (GRINLOUD SAYS / FUN FACT slides) and must keep handling its own touch
// gestures.
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

// Fisher-Yates — used to pick section C's random covers.
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Minimum cell width the grid lays out at (matches .home-picks-grid's own
// minmax() in styles.css) — used to compute how many columns actually fit,
// so the pool of random covers can be trimmed to a multiple of that count
// and every row stays full instead of leaving 1-2 orphaned covers dangling
// on the last row at odd viewport widths.
const GRID_ITEM_MIN = 96;
const GRID_GAP = 10;
const GRID_POOL_SIZE = 30;

// Section C — random wall of past picks' cover art. Clicking one opens the
// same TrackInfoLayer used on Archive/Music Radar, so it plays and reads
// exactly the same way there as anywhere else on the site.
function PicksGrid({ pick, accent, previewUrl, isPlaying, onToggleTrack, onGotoArchive }) {
  const [openPick, setOpenPick] = React.useState(null);
  const gridRef = React.useRef(null);
  const [cols, setCols] = React.useState(null);
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Zurich' });

  // Chosen once per mount (empty deps) — a fresh shuffle every prev/next
  // click through section A would make the grid feel jumpy for no reason;
  // it only reshuffles when Home itself remounts (leaving and returning to
  // the route). Always drawn from published-only picks, even for admins,
  // so a scheduled pick's art never leaks here before its date.
  const gridPicks = React.useMemo(() => {
    const cutoff = picksVisibleThroughDate(todayStr);
    const published = window.GRINLOUD_DATA.PICKS.filter(p => p.date <= cutoff && p.id !== pick.id);
    return shuffle(published).slice(0, GRID_POOL_SIZE);
  }, []);

  // Column count depends on the grid's own rendered width (via the same
  // auto-fill/minmax math CSS uses), not the viewport — re-measured
  // whenever that width changes (resize, zoom, breakpoint reflow).
  React.useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      setCols(Math.max(1, Math.floor((w + GRID_GAP) / (GRID_ITEM_MIN + GRID_GAP))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isRowPlaying = (url) => Boolean(url) && url !== '#' && isPlaying && previewUrl === url;

  if (!gridPicks.length) return null;

  // Trim the pool down to a full multiple of the column count so the last
  // row is never left with just one or two orphaned covers. Before the
  // first measurement (cols === null) render the full pool — one harmless
  // extra reflow rather than a blank first paint.
  const visiblePicks = cols
    ? gridPicks.slice(0, Math.max(cols, Math.floor(gridPicks.length / cols) * cols))
    : gridPicks;

  return (
    <section className="home__section-c">
      <h2 className="home__section-c-title">DAILY PICKS</h2>
      <div className="home-picks-grid" ref={gridRef}>
        {visiblePicks.map((p) => (
          <button
            key={p.id}
            className="home-picks-grid__item"
            onClick={() => setOpenPick(p)}
            aria-label={`View ${p.title} — ${p.artist}`}
          >
            <SpotifyCover spotifyUrl={p.links?.spotify} alt={`${p.title} — ${p.artist} cover art`} />
          </button>
        ))}
      </div>

      <button className="home__picks-more" onClick={onGotoArchive}>
        MORE PICKS <Icon.Arrow size={11} />
      </button>

      <TrackInfoLayer
        track={openPick}
        accent={accent}
        isPlaying={isRowPlaying(openPick?.links?.spotify)}
        onToggle={onToggleTrack}
        onClose={() => setOpenPick(null)}
      />
    </section>
  );
}

function Home({ pick, radar, accent, prev, next, canPrev, canNext, previewUrl, isPlaying, onToggleTrack, typeScale, onGotoRadar, onGotoArchive, isAdmin }) {
  // cqw (container query width, off .home__text's own rendered width), not vw —
  // keeps the chars-per-line ratio constant whatever width the flex layout
  // actually hands the text column, instead of drifting/overflowing based on
  // raw viewport width the way a vw-based size would.
  const titleSize = 6.8 * typeScale;
  const isScheduled = isAdmin && pick.date > new Date().toISOString().slice(0, 10);
  const swipe = useSwipeNav(() => canPrev && prev(), () => canNext && next());

  const heroUrl = pick.links?.spotify;
  const heroIsPlaying = Boolean(heroUrl) && heroUrl !== '#' && isPlaying && previewUrl === heroUrl;

  // PREV/NEXT sits under .pick-cover but must line up with .pick-actions
  // (PLAY PREVIEW/SPOTIFY/SHARE) on the right — which, now that the radar
  // teaser is nested inside .home__text below it, is no longer simply "the
  // bottom of the text column". Measuring .pick-actions' own top directly
  // (rather than relying on flex stretch across the whole column) is the
  // only way that stays correct regardless of what follows it. Desktop/
  // tablet only — the >900px CSS below positions .home__footer-nav
  // absolutely off this; the <900px tier reverts it to normal flow (see
  // styles.css) where the measurement is simply unused.
  //
  // A pick with a short title/single-line GRINLOUD SAYS can render
  // .pick-actions (and the full-width .home__divider right above it) well
  // above where the (fixed-size) cover ends — the divider would then cut
  // across the cover image instead of sitting below it, and PREV/NEXT would
  // land behind the cover instead of under it. Fixed by inserting a spacer
  // (clearanceRef, height only — never margin) right before the divider
  // whenever needed, pushing both the divider's line AND everything after
  // it (.pick-actions, and PREV/NEXT aligned to it) down to consistently
  // clear the cover's bottom edge. A margin-top on the divider itself was
  // tried first and looked right in isolated checks, but real picks showed
  // it silently eaten by CSS margin collapsing with the preceding sibling
  // (.pick-carousel) — height on a dedicated element never collapses, so
  // the spacer is the reliable fix.
  const heroRef = React.useRef(null);
  const coverRef = React.useRef(null);
  const clearanceRef = React.useRef(null);
  const actionsRef = React.useRef(null);
  const [navTop, setNavTop] = React.useState(null);
  const [clearanceHeight, setClearanceHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const heroEl = heroRef.current;
    const coverEl = coverRef.current;
    const clearanceEl = clearanceRef.current;
    const actionsEl = actionsRef.current;
    if (!heroEl || !coverEl || !clearanceEl || !actionsEl) return;
    const measure = () => {
      const heroTop = heroEl.getBoundingClientRect().top;
      const targetY = coverEl.getBoundingClientRect().bottom - heroTop + 16;

      const prevHeight = clearanceEl.style.height;
      clearanceEl.style.height = '0px';
      const naturalDividerTop = clearanceEl.getBoundingClientRect().bottom - heroTop;
      const naturalActionsTop = actionsEl.getBoundingClientRect().top - heroTop;
      clearanceEl.style.height = prevHeight;

      const extraGap = Math.max(0, targetY - naturalDividerTop);
      setClearanceHeight(extraGap);
      setNavTop(naturalActionsTop + extraGap);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(heroEl);
    ro.observe(coverEl);
    ro.observe(actionsEl);
    return () => ro.disconnect();
  }, [pick.date]);

  return (
    <div className="home" style={{ '--accent': accent }}>
      <section className="home__section-a" onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
        <div className="home__hero" ref={heroRef}>
          <div className="pick-cover" ref={coverRef}>
            <SpotifyCover spotifyUrl={pick.links?.spotify} alt={`${pick.title} — ${pick.artist} cover art`} />
            <button
              className={`cover-play-btn ${heroIsPlaying ? 'is-playing' : ''}`}
              onClick={() => onToggleTrack(heroUrl)}
              aria-label={heroIsPlaying ? 'Pause preview' : 'Play preview'}
            >
              {heroIsPlaying ? <Icon.Pause size={20} /> : <Icon.Play size={20} />}
            </button>
          </div>

          <div className="home__footer-nav" style={navTop != null ? { top: navTop } : undefined}>
            <button className="home__footer-prev" onClick={prev} disabled={!canPrev}>← PREV</button>
            <button className="home__footer-next" onClick={next} disabled={!canNext}>NEXT →</button>
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

            <div ref={clearanceRef} style={{ height: clearanceHeight }} />
            <div className="home__divider" />

            <div className="pick-actions" ref={actionsRef}>
              <button
                className={`play-btn ${heroIsPlaying ? 'is-playing' : ''}`}
                onClick={() => onToggleTrack(heroUrl)}
              >
                {heroIsPlaying ? <Icon.Pause size={12} /> : null}
                <span>{heroIsPlaying ? 'PAUSE' : '▶ PLAY PREVIEW'}</span>
              </button>
              <StreamingLinks links={pick.links} accent={accent} />
              <ShareButton
                url={`https://grinloud.com/pick/${pick.date}/`}
                title={`${pick.title} — ${pick.artist} · GRINLOUD`}
                text={`GRINLOUD Pick of the Day: ${pick.title} by ${pick.artist}`}
              />
            </div>

            <div className="home__radar-teaser">
              <div className="home__radar-teaser-cover track-cover">
                {radar.cover && <img src={radar.cover} alt={radar.title} loading="lazy" />}
              </div>
              <div className="home__radar-teaser-body">
                <div className="home__radar-teaser-eyebrow">PART OF · MUSIC RADAR · NEW EVERY 10 DAYS</div>
                <div className="home__radar-teaser-title">Music Radar {radar.number}</div>
                <div className="home__radar-teaser-meta">
                  {radar.subtitle}
                  <span className="home__radar-teaser-dot">·</span>
                  {radar.date}
                  <span className="home__radar-teaser-dot">·</span>
                  NEXT DROP {radar.nextDate}
                </div>
                <button className="home__radar-teaser-open" onClick={() => onGotoRadar(radar)}>
                  OPEN <Icon.Arrow size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="home__divider home__divider--section" />

      <PicksGrid pick={pick} accent={accent} previewUrl={previewUrl} isPlaying={isPlaying} onToggleTrack={onToggleTrack} onGotoArchive={onGotoArchive} />

      <footer className="home__legal-footer">
        <LegalLinks />
      </footer>
    </div>
  );
}

export { Home };
