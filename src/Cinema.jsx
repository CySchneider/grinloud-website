// Cinema Mode — /?cinema
// Full-screen 9:16 view for Instagram Stories/Reels screen recording.
// No UI chrome, just brand + pick. Open in browser, resize to ~390×844, screen record.

function Cinema({ pick }) {
  const [yyyy, mm, dd] = pick.date.split('-');

  return (
    <div className="cinema">
      <BackgroundVideo accent="#FFE000" overlayOpacity={0.15} src={pick.video} />

      {/* Top: Logo */}
      <div className="cinema__top">
        <img
          src="Logo%20GRINLOUD%20Smiley%20Yellow%20black.svg"
          alt="GRINLOUD"
          className="cinema__logo"
        />
      </div>

      {/* Center: Pick info */}
      <div className="cinema__center">
        <div className="cinema__eyebrow">PICK OF THE DAY · {dd}.{mm}.{yyyy}</div>
        <h1 className="cinema__title">{pick.title}</h1>
        <div className="cinema__artist">{pick.artist}</div>
        <div className="cinema__genre">{pick.genre.toUpperCase()}</div>
      </div>

      {/* Bottom: Brand */}
      <div className="cinema__bottom">
        <div className="cinema__brand">GRINLOUD.COM</div>
        <div className="cinema__claim">HOUSE MUSIC CURATED DAILY</div>
      </div>
    </div>
  );
}

window.Cinema = Cinema;
