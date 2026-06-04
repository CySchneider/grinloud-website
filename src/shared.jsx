// Shared UI: BackgroundVideo, LogoMark, StreamingLinks, NewsletterModal, TopNav, ClaimChip
import React from 'react'
import { Icon } from './icons.jsx'

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

    setStatus('loading');
    try {
      // POST to our own Cloudflare Pages Function — no CORS, API key stays server-side
      const res = await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus('success');
      } else if (res.status === 409 || data.already) {
        setStatus('already');
      } else {
        setErrorMsg(data.error?.message || `Error ${res.status}`);
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

function TopBrand() {
  return (
    <div className="top-brand">
      <LogoMark size={80} />
    </div>
  );
}

function TopNav({ route, setRoute, onBack, onNewsletter, accent, onGotoRadar }) {
  const radar = window.GRINLOUD_DATA.RADAR;
  const items = [
    { id: 'home',    label: 'PICK' },
    { id: 'radar',   label: 'MUSIC RADAR' },
    { id: 'archive', label: 'ARCHIVE' }
  ];
  return (
    <nav className="top-nav">
      <div className="top-nav__inner">
        {/* Back arrow — shown on all non-home pages, left of PICK */}
        {route !== 'home' && (
          <button className="nav-back" onClick={onBack} aria-label="Back to Pick">
            <Icon.Arrow dir="left" size={14} />
          </button>
        )}
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
        <a className="nav-link nav-link--ghost" href="https://instagram.com/grinloud" target="_blank" rel="noreferrer" aria-label="Instagram">
          <Icon.Instagram size={14} />
        </a>
        <a className="nav-link nav-link--ghost" href="https://youtube.com/@grinloud" target="_blank" rel="noreferrer" aria-label="YouTube">
          <Icon.YouTube size={14} />
        </a>
        <button className="nav-link nav-link--ghost" onClick={onNewsletter}>
          <Icon.Mail size={14} /> SUBSCRIBE
        </button>
      </div>
      {route === 'home' && onGotoRadar && (
        <button
          className="top-nav__radar-pill"
          style={{ '--accent': accent }}
          onClick={onGotoRadar}
        >
          MUSIC RADAR {radar.number} → OUT NOW
        </button>
      )}
    </nav>
  );
}

function ClaimChip({ accent }) {
  // On subpages (light/coloured bg) — plain text brand, ink colour for readability
  return (
    <div className="brand-footer brand-footer--subpage">
      <div className="brand-footer__name">GRINLOUD</div>
      <div className="brand-footer__claim">HOUSE MUSIC CURATED DAILY</div>
    </div>
  );
}

function LegalLinks() {
  return (
    <div className="legal-links">
      <a href="/privacy.html" target="_blank" rel="noreferrer">Privacy</a>
      <span>·</span>
      <a href="/impressum.html" target="_blank" rel="noreferrer">Impressum</a>
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

// ── Spotify Iframe API — the only reliable way to programmatically play ──
// autoplay=1 URL param no longer works (Spotify removed it in 2023).
// controller.play() called from a user-gesture context works reliably.
// On iOS, play() MUST be called synchronously within the user-gesture handler —
// async listeners (playback_update, setTimeout) lose the gesture token.

let _spotifyAPI  = null;  // IFrameAPI once loaded
let _spotifyCtrl = null;  // active controller
let _containerEl = null;  // DOM element for the embed
let _currentUri  = null;  // URI currently loaded in the controller

// Load API script immediately (before any user interaction)
(function() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('sp-iframe-api')) return;
  window.onSpotifyIframeApiReady = function(IFrameAPI) {
    _spotifyAPI = IFrameAPI;
    window.dispatchEvent(new Event('sp-api-ready'));
  };
  const s = document.createElement('script');
  s.id = 'sp-iframe-api';
  s.src = 'https://open.spotify.com/embed/iframe-api/v1';
  s.async = true;
  document.head.appendChild(s);
})();

window.grinloudPauseSpotify = function() {
  if (_spotifyCtrl) _spotifyCtrl.pause();
};

// Called SYNCHRONOUSLY inside click handlers to keep user-gesture context.
// loadUri + immediate play() is the only pattern that works on iOS Safari —
// the Spotify embed queues the play internally until the URI is ready.
window.grinloudPlaySpotify = function(spotifyUrl) {
  const trackId = spotifyUrl && spotifyUrl !== '#'
    ? spotifyUrl.split('/track/')[1]?.split('?')[0]
    : null;
  if (!trackId) return;
  const uri = 'spotify:track:' + trackId;

  if (_spotifyCtrl) {
    if (_currentUri !== uri) {
      _currentUri = uri;
      _spotifyCtrl.loadUri(uri);
    }
    _spotifyCtrl.play(); // synchronous — still inside user-gesture call stack
  } else if (_spotifyAPI && _containerEl) {
    _currentUri = uri;
    _spotifyAPI.createController(
      _containerEl,
      { uri: uri, width: '100%', height: 80 },
      function(ctrl) { _spotifyCtrl = ctrl; ctrl.play(); }
    );
  }
};

function SpotifyPreviewBar({ spotifyUrl }) {
  const containerRef = React.useRef(null);
  const trackId = spotifyUrl && spotifyUrl !== '#'
    ? spotifyUrl.split('/track/')[1]?.split('?')[0]
    : null;

  React.useEffect(function() {
    if (!containerRef.current || !trackId) return;
    _containerEl = containerRef.current;

    function initPlayer() {
      if (!_spotifyAPI) return;
      const uri = 'spotify:track:' + trackId;
      if (_spotifyCtrl) {
        // Skip if grinloudPlaySpotify already loaded this URI to avoid
        // interrupting active playback with a redundant loadUri call.
        if (_currentUri !== uri) {
          _currentUri = uri;
          _spotifyCtrl.loadUri(uri);
        }
      } else {
        _currentUri = uri;
        _spotifyAPI.createController(
          _containerEl,
          { uri: uri, width: '100%', height: 80 },
          function(ctrl) { _spotifyCtrl = ctrl; }
        );
      }
    }

    if (_spotifyAPI) {
      initPlayer();
    } else {
      window.addEventListener('sp-api-ready', initPlayer, { once: true });
      return function() { window.removeEventListener('sp-api-ready', initPlayer); };
    }
  }, [trackId]);

  if (!trackId) {
    return (
      <div className="spotify-bar spotify-bar--unavailable">
        <span>PREVIEW NOT YET AVAILABLE FOR THIS PICK</span>
      </div>
    );
  }

  return (
    <div className="spotify-bar">
      <div ref={containerRef} style={{ flex: 1, height: 80, overflow: 'hidden' }} />
    </div>
  );
}

export { BackgroundVideo, LogoMark, StreamingLinks, NewsletterModal, TopBrand, TopNav, ClaimChip, LegalLinks, MetaPills, SpotifyPreviewBar };
