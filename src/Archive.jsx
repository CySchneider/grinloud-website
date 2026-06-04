// Archive page — past Picks of the Day + past Music Radars.
import React from 'react'
import { Icon } from './icons.jsx'
import { ClaimChip, LegalLinks } from './shared.jsx'

// Loads a single cover via oEmbed — local state per card so React updates stay isolated.
function SpotifyCover({ spotifyUrl }) {
  const [src, setSrc] = React.useState(null);
  React.useEffect(() => {
    if (!spotifyUrl || spotifyUrl === '#') return;
    let cancelled = false;
    fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.thumbnail_url) setSrc(d.thumbnail_url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [spotifyUrl]);
  return (
    <div className="track-cover" style={src ? undefined : { background: '#FFE600' }}>
      {src && <img src={src} alt="" />}
    </div>
  );
}

function Archive({ accent, contrastInk, onBack, onGotoRadar, onOpenRadar, onPreviewTrack, initialTab = 'picks' }) {
  const picks = window.GRINLOUD_DATA.PICKS;
  const radars = window.GRINLOUD_DATA.PREVIOUS_RADARS;
  const currentRadar = window.GRINLOUD_DATA.RADAR;
  const [tab, setTab] = React.useState(initialTab);
  const [activePick, setActivePick] = React.useState(null);

  const handlePickClick = (p) => {
    const url = p.links?.spotify;
    if (!url || url === '#') return;
    // Must be synchronous before React state updates to keep user-gesture context on iOS
    window.grinloudPlaySpotify(url);
    setActivePick(url);
    onPreviewTrack?.(url);
  };

  return (
    <div className="archive" style={{ '--accent': accent, '--ink': contrastInk }}>
      <header className="archive__header">
        <h1 className="archive__title">ARCHIVE</h1>
        <div className="archive__tabs">
          <button
            className={`archive__tab ${tab === 'picks' ? 'is-active' : ''}`}
            onClick={() => setTab('picks')}
          >
            PICKS OF THE DAY <span className="archive__count">{picks.length}</span>
          </button>
          <button
            className={`archive__tab ${tab === 'radars' ? 'is-active' : ''}`}
            onClick={() => setTab('radars')}
          >
            MUSIC RADARS <span className="archive__count">{radars.length + 1}</span>
          </button>
        </div>
      </header>

      {tab === 'picks' && (
        <div className="archive__grid">
          {picks.map((p, i) => {
            const isActive = activePick && activePick === p.links?.spotify;
            return (
              <button
                key={p.id}
                className={`archive-card${isActive ? ' is-playing' : ''}`}
                onClick={() => handlePickClick(p)}
              >
                <div className="archive-card__top">
                  <div className="archive-card__date">{p.date}</div>
                  <div className="archive-card__n">#{String(picks.length - i).padStart(3, '0')}</div>
                </div>
                <div className="archive-card__body">
                  <div className="archive-card__text">
                    <div className="archive-card__title">{p.title}</div>
                    <div className="archive-card__artist">{p.artist}</div>
                    <div className="archive-card__meta">
                      <span>{p.bpm} BPM</span>
                      <span className="archive-card__dot">·</span>
                      <span>{p.key}</span>
                      <span className="archive-card__dot">·</span>
                      <span>{p.genre}</span>
                    </div>
                  </div>
                  <SpotifyCover spotifyUrl={p.links?.spotify} />
                </div>
                <div className="archive-card__open">
                  {isActive ? <>NOW PLAYING <Icon.Arrow size={12} /></> : <>PLAY TRACK <Icon.Arrow size={12} /></>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {tab === 'radars' && (
        <div className="archive__radars">
          <button className="archive-radar archive-radar--current" onClick={onGotoRadar}>
            <div className="archive-radar__n">{currentRadar.number}</div>
            <div className="archive-radar__body">
              <div className="archive-radar__title">{currentRadar.title}</div>
              <div className="archive-radar__sub">{currentRadar.date} · {currentRadar.tracks.length} TRACKS · {currentRadar.duration} · LATEST</div>
            </div>
            <div className="archive-radar__cta">PLAY →</div>
          </button>
          {radars.map((r) => (
            <button key={r.number} className="archive-radar" onClick={() => onOpenRadar(r)}>
              <div className="archive-radar__n">{r.number}</div>
              <div className="archive-radar__body">
                <div className="archive-radar__title">{r.title}</div>
                <div className="archive-radar__sub">{r.date} · {r.tracks.length} TRACKS · {r.duration}</div>
              </div>
              <div className="archive-radar__cta">OPEN <Icon.Arrow size={12} /></div>
            </button>
          ))}
        </div>
      )}

      <div className="subpage-footer">
        <ClaimChip accent={accent} />
        <LegalLinks />
      </div>
    </div>
  );
}

export { Archive };
