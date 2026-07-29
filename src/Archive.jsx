// Archive page — past Picks of the Day + past Music Radars.
import React from 'react'
import { Icon } from './icons.jsx'
import { ClaimChip, LegalLinks, SpotifyCover } from './shared.jsx'

function Archive({ accent, onBack, onGotoRadar, onOpenRadar, onPreviewTrack, tab, onTabChange, isAdmin }) {
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
    <div className="archive" style={{ '--accent': accent }}>
      <header className="archive__header">
        <h1 className="archive__title">Archive</h1>
        <div className="archive__tabs">
          <button
            className={`archive__tab ${tab === 'picks' ? 'is-active' : ''}`}
            onClick={() => onTabChange('picks')}
          >
            PICKS · <span className="archive__count">{picks.length}</span>
          {isAdmin && picks.length < allPicks.length && <span className="pick-scheduled-badge">+{allPicks.length - picks.length} SCHEDULED</span>}
          </button>
          <button
            className={`archive__tab ${tab === 'radars' ? 'is-active' : ''}`}
            onClick={() => onTabChange('radars')}
          >
            RADARS · <span className="archive__count">{radars.length + (showCurrentRadar ? 1 : 0)}</span>
          {isAdmin && !radarActuallyLive && <span className="pick-scheduled-badge">+1 SCHEDULED</span>}
          </button>
        </div>
      </header>

      {tab === 'picks' && (
        <div className="archive__grid">
          {picks.map((p) => {
            const isActive = activePick && activePick === p.links?.spotify;
            return (
              <button
                key={p.id}
                className={`archive-card${isActive ? ' is-playing' : ''}`}
                onClick={() => handlePickClick(p)}
              >
                <span className="archive-card__date">{p.date}</span>
                <SpotifyCover spotifyUrl={p.links?.spotify} alt={`${p.title} — ${p.artist} cover art`} />
                <span className="archive-card__text">
                  <span className="archive-card__title">{p.title}</span>
                  <span className="archive-card__artist">{p.artist}</span>
                </span>
                <span className="archive-card__meta">
                  <span>{p.bpm}</span>
                  <span className="archive-card__dot">·</span>
                  <span>{p.key}</span>
                </span>
                <span className="archive-card__open">
                  {isActive ? <>PLAYING <Icon.Arrow size={11} /></> : <>PLAY <Icon.Arrow size={11} /></>}
                </span>
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
              <span className="archive-card__date">{currentRadar.date}</span>
              <span className="track-cover">
                {currentRadar.cover && <img src={currentRadar.cover} alt={currentRadar.title} loading="lazy" />}
              </span>
              <span className="archive-card__text">
                <span className="archive-card__title">Music Radar {currentRadar.number}</span>
                {currentRadar.subtitle && <span className="archive-card__artist">{currentRadar.subtitle}</span>}
              </span>
              <span className="archive-card__meta">
                <span>{currentRadar.tracks.length} TRACKS</span>
                <span className="archive-card__dot">·</span>
                <span>{currentRadar.duration}</span>
              </span>
              <span className="archive-card__open">
                {isAdmin && !radarActuallyLive ? 'SCHEDULED' : <>PLAY <Icon.Arrow size={11} /></>}
              </span>
            </button>
          )}
          {radars.map((r) => (
            <button key={r.number} className="archive-card" onClick={() => onOpenRadar(r)}>
              <span className="archive-card__date">{r.date}</span>
              <span className="track-cover">
                {r.cover && <img src={r.cover} alt={r.title} loading="lazy" />}
              </span>
              <span className="archive-card__text">
                <span className="archive-card__title">Music Radar {r.number}</span>
                {r.subtitle && <span className="archive-card__artist">{r.subtitle}</span>}
              </span>
              <span className="archive-card__meta">
                <span>{r.tracks.length} TRACKS</span>
                <span className="archive-card__dot">·</span>
                <span>{r.duration}</span>
              </span>
              <span className="archive-card__open">OPEN <Icon.Arrow size={11} /></span>
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
