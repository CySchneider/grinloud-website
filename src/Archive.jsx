// Archive page — past Picks of the Day + past Music Radars.
import React from 'react'
import { Icon } from './icons.jsx'
import { ClaimChip, LegalLinks, SpotifyCover, TrackInfoLayer } from './shared.jsx'

// PICKS stores artist names in ALL CAPS (used elsewhere as-is, e.g. the Home
// hero); Music Radar's tracks carry hand-typed mixed case instead. To match
// Music Radar's row style here, title-case each word for display only —
// parenthesised country codes ("(NL)", "(AUS)") are left untouched. This is
// an approximation: a handful of artists stylize their own name in caps
// (e.g. SIDEPIECE) and will show title-cased here instead.
function displayArtist(artist) {
  return artist.replace(/\([^)]*\)|[^\s(),]+/g, (token) =>
    token.startsWith('(') ? token : token.charAt(0) + token.slice(1).toLowerCase()
  );
}

function Archive({ accent, onBack, onGotoRadar, onOpenRadar, previewUrl, isPlaying, onToggleTrack, tab, onTabChange, isAdmin }) {
  const allPicks = window.GRINLOUD_DATA.PICKS;
  const radars = window.GRINLOUD_DATA.PREVIOUS_RADARS;
  const currentRadar = window.GRINLOUD_DATA.RADAR;
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Zurich' });
  const picks = isAdmin ? allPicks : allPicks.filter(p => p.date <= todayStr);
  const radarActuallyLive = !currentRadar.liveDate || todayStr >= currentRadar.liveDate;
  const showCurrentRadar = isAdmin || radarActuallyLive;
  const [openTrack, setOpenTrack] = React.useState(null);

  const isRowPlaying = (url) => Boolean(url) && url !== '#' && isPlaying && previewUrl === url;

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
            const url = p.links?.spotify;
            const isActive = isRowPlaying(url);
            return (
              <div key={p.id} className={`radar-row archive-row ${isActive ? 'is-active' : ''}`}>
                <div className="radar-row__n">{p.date}</div>

                <button className="radar-row__cover" onClick={() => setOpenTrack(p)} aria-label={`View ${p.title} — ${p.artist}`}>
                  <SpotifyCover spotifyUrl={url} alt={`${p.title} — ${p.artist} cover art`} />
                </button>

                <button className="radar-row__title" onClick={() => setOpenTrack(p)}>
                  <div className="radar-row__name">{p.title}</div>
                  <div className="radar-row__artist">{displayArtist(p.artist)}</div>
                </button>

                <div className="radar-row__bpm">{p.bpm}<span className="radar-row__dot">·</span>{p.key}</div>
                <button
                  className="radar-row__status"
                  onClick={() => onToggleTrack(url)}
                  disabled={!url || url === '#'}
                >
                  {isActive ? <>PAUSE <Icon.Pause size={11} /></> : <>PLAY <Icon.Arrow size={11} /></>}
                </button>
              </div>
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

      <TrackInfoLayer
        track={openTrack}
        accent={accent}
        isPlaying={isRowPlaying(openTrack?.links?.spotify)}
        onToggle={onToggleTrack}
        onClose={() => setOpenTrack(null)}
      />
    </div>
  );
}

export { Archive };
