// Shared UI: BackgroundVideo, LogoMark, StreamingLinks, NewsletterModal, TopNav, ClaimChip

function BackgroundVideo({ overlayOpacity = 0.35, accent, src }) {
  const videoRef = React.useRef(null);
  const loadedSrc = React.useRef(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;

    const play = () => {
      v.src = src;
      v.load();
      v.play().catch(() => {});
      loadedSrc.current = src;
      setVisible(true);
    };

    if (!loadedSrc.current) {
      // first load — show immediately
      play();
    } else if (loadedSrc.current !== src) {
      // pick changed — brief fade out, swap, fade in
      setVisible(false);
      const t = setTimeout(play, 380);
      return () => clearTimeout(t);
    }
  }, [src]);

  const videoStyle = {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    filter: 'blur(1px) brightness(0.82)',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.4s ease',
  };

  return (
    <div className="bg-video-stage" aria-hidden="true">
      <video ref={videoRef} muted playsInline loop style={videoStyle} />

      {/* neon colour tint */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundColor: accent, opacity: overlayOpacity * 0.5,
      }} />
      {/* readability gradient — transparent top → dark bottom */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.62) 100%)',
      }} />
      {/* edge vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.38) 100%)',
      }} />
    </div>
  );
}

const LOGO_ANIMS = ['bounce','wobble','spin','shake','heartbeat','flip','squish','nod','pop','dizzy'];

function LogoMark({ size = 84, position = 'top', onClick }) {
  const [anim, setAnim] = React.useState(null);
  const lastAnim = React.useRef(null);

  const handleClick = () => {
    // Pick a different animation each time
    const pool = LOGO_ANIMS.filter(a => a !== lastAnim.current);
    const next = pool[Math.floor(Math.random() * pool.length)];
    lastAnim.current = next;
    setAnim(next);
    if (onClick) onClick();
  };

  return (
    <button
      className={`logo-mark logo-pos-${position}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
      aria-label="GRINLOUD home"
    >
      <img
        src="Logo%20GRINLOUD%20Smiley%20Yellow%20black.svg"
        alt="GRINLOUD"
        className={anim ? `logo-anim logo-anim--${anim}` : ''}
        onAnimationEnd={() => setAnim(null)}
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
      />
    </button>
  );
}

function StreamingLinks({ links = {}, size = 'md', accent = '#fff' }) {
  // Only show platforms with a real URL (not '#' or empty). SoundCloud excluded.
  const items = [
    { key: 'spotify',  label: 'SPOTIFY' },
    { key: 'youtube',  label: 'YOUTUBE' },
    { key: 'beatport', label: 'BEATPORT' },
  ].filter(it => links[it.key] && links[it.key] !== '#');

  if (!items.length) return null;
  return (
    <div className={`streaming-links streaming-links--${size}`}>
      {items.map((it) => (
        <a
          key={it.key}
          href={links[it.key]}
          target="_blank"
          rel="noreferrer"
          className="streaming-link"
          style={{ '--accent': accent }}
        >
          <span>{it.label}</span>
          <Icon.External size={10} />
        </a>
      ))}
    </div>
  );
}

function NewsletterModal({ open, onClose, accent }) {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState('idle'); // idle | loading | success | error | already
  const [errorMsg, setErrorMsg] = React.useState('');

  React.useEffect(() => {
    if (open) { setStatus('idle'); setEmail(''); setErrorMsg(''); }
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    const { publicationId, apiKey } = window.GRINLOUD_DATA.NEWSLETTER;

    // Config not yet filled in — show success in dev/preview mode
    if (!publicationId || publicationId.startsWith('pub_XXXX') || !apiKey || apiKey.startsWith('YOUR_')) {
      setStatus('success');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch(
        `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            email,
            reactivate_existing: false,
            send_welcome_email: true,
            utm_source: 'grinloud-website',
          }),
        }
      );
      if (res.status === 201 || res.status === 200) {
        setStatus('success');
      } else if (res.status === 409) {
        setStatus('already');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.message || `Error ${res.status}`);
        setStatus('error');
      }
    } catch (err) {
      setErrorMsg('Network error. Try again.');
      setStatus('error');
    }
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ '--accent': accent }}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon.Close /></button>

        {(status === 'idle' || status === 'loading' || status === 'error') && (
          <React.Fragment>
            <div className="modal-eyebrow">DAILY DROP</div>
            <h2 className="modal-title">One track.<br/>Every morning.<br/>No filler.</h2>
            <p className="modal-body">
              Get the Pick of the Day in your inbox at 09:00 CET. Plus every Music Radar, ten days apart.
            </p>
            <form onSubmit={submit} className="modal-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcrew.com"
                className="modal-input"
                autoFocus
                disabled={status === 'loading'}
              />
              <button type="submit" className="modal-submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'SENDING…' : 'SUBSCRIBE →'}
              </button>
            </form>
            {status === 'error' && (
              <div className="modal-foot" style={{ color: 'red' }}>{errorMsg}</div>
            )}
            {status !== 'error' && (
              <div className="modal-foot">No spam. Unsubscribe any time. We are loud, not annoying.</div>
            )}
          </React.Fragment>
        )}

        {status === 'success' && (
          <React.Fragment>
            <div className="modal-eyebrow">YOU ARE IN</div>
            <h2 className="modal-title">See you<br/>tomorrow,<br/>09:00 CET.</h2>
            <p className="modal-body">Confirmation sent to <strong>{email}</strong>. Keep the lights low.</p>
            <button className="modal-submit" onClick={onClose}>BACK TO THE LOOP</button>
          </React.Fragment>
        )}

        {status === 'already' && (
          <React.Fragment>
            <div className="modal-eyebrow">ALREADY IN</div>
            <h2 className="modal-title">You're already<br/>on the list.</h2>
            <p className="modal-body">See you at 09:00 CET. Keep the lights low.</p>
            <button className="modal-submit" onClick={onClose}>BACK TO THE LOOP</button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function TopNav({ route, setRoute, onNewsletter, accent }) {
  const items = [
    { id: 'home',    label: 'PICK' },
    { id: 'radar',   label: 'MUSIC RADAR' },
    { id: 'archive', label: 'ARCHIVE' }
  ];
  return (
    <nav className="top-nav">
      <div className="top-nav__inner">
        {items.map((it) => (
          <button
            key={it.id}
            className={`nav-link ${route === it.id ? 'is-active' : ''}`}
            style={{ '--accent': accent }}
            onClick={() => setRoute(it.id)}
          >
            {it.label}
            {route === it.id && <span className="nav-dot" />}
          </button>
        ))}
        <span className="nav-spacer" />
        <button className="nav-link nav-link--ghost" onClick={onNewsletter}>
          <Icon.Mail size={14} /> SUBSCRIBE
        </button>
      </div>
    </nav>
  );
}

function ClaimChip({ accent }) {
  return (
    <div className="claim-chip" style={{ '--accent': accent }}>
      <div className="claim-chip__brand">GRINLOUD</div>
      <div className="claim-chip__line">House music curated daily. Mixed all 10 days.</div>
    </div>
  );
}

function MetaPills({ pick, scale = 1 }) {
  const items = [
    { l: 'BPM',     v: pick.bpm },
    { l: 'KEY',     v: pick.key },
    { l: 'LABEL',   v: pick.label },
    { l: 'RELEASE', v: pick.release },
    { l: 'GENRE',   v: pick.genre }
  ];
  return (
    <div className="meta-pills" style={{ fontSize: 12 * scale }}>
      {items.map((it, i) => (
        <span key={i} className="meta-pill">
          <span className="meta-pill__l">{it.l}</span>
          <span className="meta-pill__v">{it.v}</span>
        </span>
      ))}
    </div>
  );
}

// ── Spotify preview — fully imperative iframe management ─────────────────
// React never sets src as a prop, so re-renders can't override an autoplay
// src that was set synchronously in a click handler.

let _spotifyIframe = null; // module-level ref, always points to the live iframe

window.grinloudPlaySpotify = function(spotifyUrl) {
  const trackId = spotifyUrl && spotifyUrl !== '#'
    ? spotifyUrl.split('/track/')[1]?.split('?')[0]
    : null;
  if (!trackId || !_spotifyIframe) return;
  _spotifyIframe.src =
    `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0&autoplay=1`;
};

function SpotifyPreviewBar({ spotifyUrl }) {
  const iframeRef = React.useRef(null);

  const trackId = spotifyUrl && spotifyUrl !== '#'
    ? spotifyUrl.split('/track/')[1]?.split('?')[0]
    : null;

  // Register the iframe element globally on mount
  React.useEffect(() => {
    _spotifyIframe = iframeRef.current;
    return () => { _spotifyIframe = null; };
  }, []);

  // When track changes (pick navigation), load the new track without autoplay
  React.useEffect(() => {
    if (iframeRef.current && trackId) {
      iframeRef.current.src =
        `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
    }
  }, [trackId]);

  if (!trackId) {
    return (
      <div className="spotify-bar spotify-bar--unavailable">
        <span>PREVIEW NOT YET AVAILABLE FOR THIS PICK</span>
      </div>
    );
  }

  // No src prop → React never reconciles/overrides what we set imperatively
  return (
    <div className="spotify-bar">
      <iframe
        ref={iframeRef}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="eager"
      />
    </div>
  );
}

Object.assign(window, { BackgroundVideo, LogoMark, StreamingLinks, NewsletterModal, TopNav, ClaimChip, MetaPills, SpotifyPreviewBar });
