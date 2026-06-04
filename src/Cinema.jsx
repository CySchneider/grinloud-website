// Cinema Mode — /?cinema
import { BackgroundVideo } from './shared.jsx'
// Fullscreen 9:16 / 3:4 for Instagram. Branding bottom-left, content centered.

function Cinema({ pick }) {
  const [yyyy, mm, dd] = pick.date.split('-');
  const accentMap = { pink:'#FF1F8F', yellow:'#FFE000', blue:'#00C2FF', green:'#39FF14', orange:'#FF6200' };
  const accent = accentMap[pick.accent] || '#FFE000';
  const accentInk = (pick.accent === 'yellow' || pick.accent === 'green') ? '#0A0A0A' : '#F5F2EE';

  return (
    <div className="cinema">
      <BackgroundVideo accent={accent} overlayOpacity={0.25} src={pick.video} />

      {/* Centered pick content */}
      <div className="cinema__content">
        <div className="top-nav__radar-pill cinema__pill">
          PICK OF THE DAY · {dd}.{mm}.{yyyy}
        </div>
        <h1 className="cinema__title">{pick.title}</h1>
        <div className="cinema__artist">{pick.artist}</div>
        <div className="cinema__meta">{pick.genre.toUpperCase()} · {pick.bpm} BPM · {pick.key}</div>
      </div>

      {/* Bottom-left branding */}
      <div className="cinema__brand">
        <img src="Logo%20GRINLOUD%20Smiley%20Yellow%20black.svg" alt="GRINLOUD" className="cinema__brand-logo" />
        <div className="cinema__brand-text">
          <span className="cinema__brand-wordmark">grinloud</span>
          <span className="cinema__brand-claim">House music curated daily</span>
        </div>
      </div>
    </div>
  );
}

export { Cinema };
