// Archive page — past Picks of the Day + past Music Radars.

function Archive({ accent, contrastInk, onBack, onGotoRadar, onOpenRadar, onSelectPick, initialTab = 'picks' }) {
  const picks = window.GRINLOUD_DATA.PICKS;
  const radars = window.GRINLOUD_DATA.PREVIOUS_RADARS;
  const currentRadar = window.GRINLOUD_DATA.RADAR;
  const [tab, setTab] = React.useState(initialTab);

  return (
    <div className="archive" style={{ '--accent': accent, '--ink': contrastInk }}>
      <header className="archive__header">
        <button className="radar__back" onClick={onBack}>
          <Icon.Arrow dir="left" /> BACK
        </button>
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
          {picks.map((p, i) => (
            <button
              key={p.id}
              className="archive-card"
              onClick={() => onSelectPick(i)}
            >
              <div className="archive-card__top">
                <div className="archive-card__date">{p.date}</div>
                <div className="archive-card__n">#{String(picks.length - i).padStart(3, '0')}</div>
              </div>
              <div className="archive-card__title">{p.title}</div>
              <div className="archive-card__artist">{p.artist}</div>
              <div className="archive-card__meta">
                <span>{p.bpm} BPM</span>
                <span className="archive-card__dot">·</span>
                <span>{p.key}</span>
                <span className="archive-card__dot">·</span>
                <span>{p.genre}</span>
              </div>
              <div className="archive-card__open">OPEN PICK <Icon.Arrow size={12} /></div>
            </button>
          ))}
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

      <ClaimChip accent={accent} />
    </div>
  );
}

window.Archive = Archive;
