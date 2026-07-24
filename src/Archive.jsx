// Archive page — past Picks of the Day + past Music Radars.
import React from 'react'
import { Icon } from './icons.jsx'
import { ClaimChip, LegalLinks, SpotifyCover } from './shared.jsx'

function Archive({ accent, contrastInk, onBack, onGotoRadar, onOpenRadar, onPreviewTrack, tab, onTabChange, isAdmin }) {
  const allPicks = window.GRINLOUD_DATA.PICKS;
  const radars = window.GRINLOUD_DATA.PREVIOUS_RADARS;
  const currentRadar = window.GRINLOUD_DATA.RADAR;
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Zurich' });
  const picks = isAdmin ? allPicks : allPicks.filter(p => p.date <= todayStr);
  const radarActuallyLive = !currentRadar.liveDate || todayStr >= currentRadar.liveDate;
  const showCurrentRadar = isAdmin || radarActuallyLive;
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
            onClick={() => onTabChange('picks')}
          >
            PICKS OF THE DAY <span className="archive__count">{picks.length}</span>
          {isAdmin && picks.length < allPicks.length && <span className="pick-scheduled-badge">+{allPicks.length - picks.length} SCHEDULED</span>}
          </button>
          <button
            className={`archive__tab ${tab === 'radars' ? 'is-active' : ''}`}
            onClick={() => onTabChange('radars')}
          >
            MUSIC RADARS <span className="archive__count">{radars.length + (showCurrentRadar ? 1 : 0)}</span>
          {isAdmin && !radarActuallyLive && <span className="pick-scheduled-badge">+1 SCHEDULED</span>}
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
                  <SpotifyCover spotifyUrl={p.links?.spotify} alt={`${p.title} — ${p.artist} cover art`} />
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
        <div className="archive__grid">
          {showCurrentRadar && (
            <button
              className="archive-card archive-card--current"
              style={isAdmin && !radarActuallyLive ? { opacity: 0.5 } : undefined}
              onClick={onGotoRadar}
            >
              <div className="archive-card__top">
                <div className="archive-card__date">{currentRadar.date}</div>
                <div className="archive-card__n">#{currentRadar.number}</div>
              </div>
              <div className="archive-card__body">
                <div className="archive-card__text">
                  <div className="archive-card__title">{currentRadar.title}</div>
                  {currentRadar.subtitle && <div className="archive-card__artist">{currentRadar.subtitle}</div>}
                  <div className="archive-card__meta">
                    <span>{currentRadar.tracks.length} TRACKS</span>
                    <span className="archive-card__dot">·</span>
                    <span>{currentRadar.duration}</span>
                    <span className="archive-card__dot">·</span>
                    <span>{isAdmin && !radarActuallyLive ? 'SCHEDULED' : 'LATEST'}</span>
                  </div>
                </div>
                <div className="track-cover">
                  {currentRadar.cover && <img src={currentRadar.cover} alt={currentRadar.title} loading="lazy" />}
                </div>
              </div>
              <div className="archive-card__open">PLAY <Icon.Arrow size={12} /></div>
            </button>
          )}
          {radars.map((r) => (
            <button key={r.number} className="archive-card" onClick={() => onOpenRadar(r)}>
              <div className="archive-card__top">
                <div className="archive-card__date">{r.date}</div>
                <div className="archive-card__n">#{r.number}</div>
              </div>
              <div className="archive-card__body">
                <div className="archive-card__text">
                  <div className="archive-card__title">{r.title}</div>
                  {r.subtitle && <div className="archive-card__artist">{r.subtitle}</div>}
                  <div className="archive-card__meta">
                    <span>{r.tracks.length} TRACKS</span>
                    <span className="archive-card__dot">·</span>
                    <span>{r.duration}</span>
                  </div>
                </div>
                <div className="track-cover">
                  {r.cover && <img src={r.cover} alt={r.title} loading="lazy" />}
                </div>
              </div>
              <div className="archive-card__open">OPEN <Icon.Arrow size={12} /></div>
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
