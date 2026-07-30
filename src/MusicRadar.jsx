// Music Radar subpage
import React from 'react'
import { Icon } from './icons.jsx'
import { ClaimChip, LegalLinks, SpotifyCover, TrackInfoLayer } from './shared.jsx'
// Layout: numbered poster-style tracklist on the left, sticky YouTube embed on the right.

function MusicRadar({ radar, accent, onBack, onGotoArchive, previewUrl, isPlaying, onToggleTrack }) {
  radar = radar || window.GRINLOUD_DATA.RADAR;
  const [openTrack, setOpenTrack] = React.useState(null);

  const picks = window.GRINLOUD_DATA.PICKS;
  // Radar tracks only carry n/title/artist/bpm/key/genre — the matching Pick
  // (same track, published as that day's Pick of the Day) carries the full
  // facts (label, release, GRINLOUD SAYS, Spotify link) the info layer wants.
  const pickByTitle = React.useMemo(() => {
    const map = {};
    picks.forEach(p => { map[p.title.toLowerCase()] = p; });
    return map;
  }, [picks]);

  const isRowPlaying = (url) => Boolean(url) && url !== '#' && isPlaying && previewUrl === url;

  const openTrackLayer = (t) => {
    const match = pickByTitle[t.title.toLowerCase()];
    setOpenTrack(match || { title: t.title, artist: t.artist, bpm: t.bpm, key: t.key, genre: t.genre, links: {} });
  };

  // Only show genres that actually occur among this radar's tracks, in the
  // order they first appear. A track's genre field can list more than one
  // ("Tech House | Latin Tech"), so split on "|" before deduping.
  const genreTags = React.useMemo(() => {
    const seen = new Set();
    const tags = [];
    radar.tracks.forEach(t => {
      t.genre.split('|').forEach(part => {
        const g = part.trim().toUpperCase();
        if (g && !seen.has(g)) { seen.add(g); tags.push(g); }
      });
    });
    return tags;
  }, [radar]);

  return (
    <div className="radar" style={{ '--accent': accent }}>
      <header className="radar__header">
        <div className="radar__masthead">
          <div className="radar__masthead-eyebrow">MUSIC RADAR · NEW EVERY 10 DAYS</div>
          <div className="radar__masthead-meta">
            ISSUE {radar.number} &nbsp;·&nbsp; {radar.date} &nbsp;·&nbsp; NEXT DROP {radar.nextDate}
          </div>
        </div>
      </header>

      <div className="radar__hero">
        <h1 className="radar__number">{radar.number}</h1>
        <div className="radar__hero-side">
          <div className="radar__hero-title">{radar.title}</div>
          <div className="radar__hero-sub">{radar.subtitle}</div>
          {genreTags.length > 0 && (
            <div className="radar__hero-tags">
              {genreTags.flatMap((g, i) => i === 0
                ? [<span key={g}>{g}</span>]
                : [<span key={`dot-${g}`}>·</span>, <span key={g}>{g}</span>]
              )}
            </div>
          )}
        </div>
      </div>

      <div className="radar__split">
        <section className="radar__tracks">
          <div className="radar__tracks-head">
            <span>#</span>
            <span>TRACK / ARTIST</span>
            <span>BPM</span>
            <span></span>
          </div>

          {radar.tracks.map((t, i) => {
            const spotifyUrl = pickByTitle[t.title.toLowerCase()]?.links?.spotify;
            const isActive = isRowPlaying(spotifyUrl);
            return (
            <div key={i} className={`radar-row ${isActive ? 'is-active' : ''}`}>
              <div className="radar-row__n">{t.n}</div>

              <button className="radar-row__cover" onClick={() => openTrackLayer(t)} aria-label={`View ${t.title} — ${t.artist}`}>
                <SpotifyCover spotifyUrl={spotifyUrl} alt={`${t.title} — ${t.artist} cover art`} />
              </button>

              <button className="radar-row__title" onClick={() => openTrackLayer(t)}>
                <div className="radar-row__name">{t.title}</div>
                <div className="radar-row__artist">{t.artist}<span className="radar-row__dot">·</span>{t.genre}</div>
              </button>

              <div className="radar-row__bpm">{t.bpm}</div>
              <button
                className="radar-row__status"
                onClick={() => onToggleTrack(spotifyUrl)}
                disabled={!spotifyUrl || spotifyUrl === '#'}
              >
                {isActive ? <>PAUSE <Icon.Pause size={11} /></> : <>PLAY <Icon.Arrow size={11} /></>}
              </button>
            </div>
            );
          })}

          <div className="radar__footnote">
            TAP A COVER OR TITLE FOR TRACK INFO — TAP PLAY TO HEAR THE PREVIEW.
          </div>
        </section>

        <aside className="radar__sticky">
          <div className="radar__player">
            <div className="radar__player-frame">
              {radar.youtubeId ? (
                <iframe
                  id="radar-yt"
                  src={`https://www.youtube.com/embed/${radar.youtubeId}?rel=0&modestbranding=1`}
                  title={`Music Radar ${radar.number}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="radar__player-pending">
                  <div className="radar__player-pending-icon">⏳</div>
                  <div className="radar__player-pending-text">MIX COMING SOON</div>
                  <div className="radar__player-pending-sub">Mix is being recorded — check back in a few days.</div>
                </div>
              )}
            </div>
            <div className="radar__player-meta">
              <div className="radar__player-row">
                <span>DURATION</span><b>{radar.duration}</b>
              </div>
              <div className="radar__player-row">
                <span>TRACKS</span><b>{radar.tracks.length}</b>
              </div>
              <div className="radar__player-row">
                <span>MIXED</span><b>ONE TAKE</b>
              </div>
            </div>
          </div>
          <button
            className={`radar__playlist-link ${isRowPlaying(radar.spotifyUrl) ? 'is-active' : ''}`}
            onClick={() => onToggleTrack(radar.spotifyUrl)}
            disabled={!radar.spotifyUrl || radar.spotifyUrl === '#'}
          >
            <span>PLAY FULL RADAR</span>
            {isRowPlaying(radar.spotifyUrl) ? <>PAUSE <Icon.Pause size={11} /></> : <>PLAY <Icon.Arrow size={11} /></>}
          </button>
          <button className="radar__archive-link" onClick={onGotoArchive}>
            <span>BROWSE PREVIOUS RADARS</span>
            <Icon.Arrow />
          </button>
        </aside>
      </div>

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

export { MusicRadar };
