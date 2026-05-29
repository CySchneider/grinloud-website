// Music Radar subpage
// Layout: numbered poster-style tracklist on the left, sticky YouTube embed on the right.

function MusicRadar({ radar, accent, contrastInk, onBack, onGotoArchive, onPreviewTrack }) {
  radar = radar || window.GRINLOUD_DATA.RADAR;
  const [activeTrack, setActiveTrack] = React.useState(null);

  const onPlayCue = (track, idx) => {
    setActiveTrack(idx);

    // Find matching pick by title (case-insensitive) to get Spotify preview URL
    if (onPreviewTrack) {
      const picks = window.GRINLOUD_DATA.PICKS;
      const match = picks.find(p =>
        p.title.toLowerCase() === track.title.toLowerCase()
      );
      const url = match?.links?.spotify;
      if (url && url !== '#') {
        onPreviewTrack(url);
        return; // Spotify preview takes priority
      }
    }

    // Fallback: seek YouTube embed if cue time available
    const cue = track.cue;
    if (!cue || cue === '00:00' || !radar.youtubeId) return;
    const [m, s] = cue.split(':').map(Number);
    const sec = m * 60 + (s || 0);
    const iframe = document.querySelector('iframe#radar-yt');
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${radar.youtubeId}?start=${sec}&autoplay=1&rel=0&modestbranding=1`;
    }
  };

  return (
    <div className="radar" style={{ '--accent': accent, '--ink': contrastInk }}>
      <header className="radar__header">
        <button className="radar__back" onClick={onBack}>
          <Icon.Arrow dir="left" /> BACK TO PICK
        </button>
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
          <div className="radar__hero-tags">
            <span>HOUSE</span><span>·</span>
            <span>PROGRESSIVE</span><span>·</span>
            <span>BASS HOUSE</span><span>·</span>
            <span>TECH HOUSE</span>
          </div>
        </div>
      </div>

      <div className="radar__split">
        <section className="radar__tracks">
          <div className="radar__tracks-head">
            <span>#</span>
            <span>TRACK / ARTIST</span>
            <span>BPM</span>
            <span>KEY</span>
            <span>CUE</span>
          </div>

          {radar.tracks.map((t, i) => (
            <div
              key={i}
              className={`radar-row ${activeTrack === i ? 'is-active' : ''}`}
              onClick={() => onPlayCue(t, i)}
            >
              <div className="radar-row__n">{t.n}</div>

              <div className="radar-row__title">
                <div className="radar-row__name">{t.title}</div>
                <div className="radar-row__artist">{t.artist}<span className="radar-row__dot">·</span>{t.genre}</div>
              </div>

              <div className="radar-row__bpm">{t.bpm}</div>
              <div className="radar-row__key">{t.key}</div>
              <div className="radar-row__cue">
                <Icon.Play size={11} />
                <span>{t.cue}</span>
              </div>
            </div>
          ))}

          <div className="radar__footnote">
            CLICK A ROW TO JUMP TO THE CUE IN THE STREAM. ALL TIMES MATCH THE YOUTUBE EMBED.
          </div>
        </section>

        <aside className="radar__sticky">
          <div className="radar__player">
            <div className="radar__player-frame">
              <iframe
                id="radar-yt"
                src={`https://www.youtube.com/embed/${radar.youtubeId}?rel=0&modestbranding=1`}
                title={`Music Radar ${radar.number}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
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
          <button className="radar__archive-link" onClick={onGotoArchive}>
            <span>BROWSE PREVIOUS RADARS</span>
            <Icon.Arrow />
          </button>
        </aside>
      </div>

      <ClaimChip accent={accent} />
    </div>
  );
}

window.MusicRadar = MusicRadar;
