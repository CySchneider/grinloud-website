// Shared UI: BackgroundVideo, LogoMark, StreamingLinks, NewsletterModal, TopNav, ClaimChip
import React from 'react'
import { Icon } from './icons.jsx'

// SpotifyCover and PickCarousel's Track Info slide both want the same
// track's Spotify cover art — one shared in-flight/cached promise per URL
// avoids firing the same oEmbed request twice on every pick switch.
const _oembedCache = new Map(); // spotifyUrl -> Promise<oEmbed response | null>
function fetchSpotifyOembed(spotifyUrl) {
  if (!spotifyUrl || spotifyUrl === '#') return Promise.resolve(null);
  if (!_oembedCache.has(spotifyUrl)) {
    _oembedCache.set(spotifyUrl, fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`)
      .then(r => r.json())
      .catch(() => null));
  }
  return _oembedCache.get(spotifyUrl);
}

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

// Swipeable info card, replaces the old stacked artist/meta/quote/details
// blocks on the Pick page. One slide per fact: Artist, Track Info (incl.
// label + release), GRINLOUD SAYS, Fun Fact (only if the pick has one).
// Native horizontal scroll-snap — no carousel library, works with
// touch/trackpad swipe out of the box. All the same text still ships in
// full, unpaginated, in the static SEO fallback (generate-static-pages.js)
// — this is a presentation layer on top of the hydrated app only, nothing
// is hidden from crawlers.
//
// Text-only now — the artist photo and the BPM/Key/Label/Genre/Release
// facts moved out to Home.jsx's persistent artist block above this, so
// nothing here would just repeat what's already on screen. Only the two
// "quote" slides (GRINLOUD SAYS, FUN FACT) are left to actually swipe between.
function PickCarousel({ pick }) {
  const trackRef = React.useRef(null);
  const [active, setActive] = React.useState(0);

  // Every label shares the same colour — this pick's own --accent (set by
  // the caller from pick.accent), not a fixed per-slide hue.
  const slides = [
    {
      key: 'says', label: 'GRINLOUD SAYS',
      body: <p className="pcard__quote">{pick.info}</p>,
    },
    ...(pick.funFact ? [{
      key: 'fact', label: 'FUN FACT',
      body: <p className="pcard__fact">{pick.funFact}</p>,
    }] : []),
  ];

  const goTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  };

  // Slide index follows scroll position — works for swipe, trackpad, and
  // the dot clicks below (goTo triggers a scroll, which lands here too).
  const onScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  // Auto-advance so visitors notice there's more than one slide behind the
  // dots. Stops for good the moment someone touches the carousel themselves
  // (swipe or dot tap) — at that point they already know it scrolls.
  const activeRef = React.useRef(0);
  activeRef.current = active;
  const [autoplay, setAutoplay] = React.useState(true);
  const stopAutoplay = () => setAutoplay(false);

  React.useEffect(() => {
    if (!autoplay || slides.length < 2) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      goTo((activeRef.current + 1) % slides.length);
    }, 4000);
    return () => clearInterval(id);
  }, [autoplay, slides.length]);

  return (
    <div className="pick-carousel">
      <div
        className="pick-carousel__track"
        ref={trackRef}
        onScroll={onScroll}
        onPointerDown={stopAutoplay}
      >
        {slides.map((s) => (
          <div className="pick-carousel__slide" key={s.key}>
            <div className="pick-carousel__content">
              <div className="pick-carousel__label">{s.label}</div>
              {s.body}
            </div>
          </div>
        ))}
      </div>
      <div className="pick-carousel__dots">
        {slides.map((s, i) => (
          <button
            key={s.key}
            className={`pick-carousel__dot ${i === active ? 'is-active' : ''}`}
            onClick={() => { stopAutoplay(); goTo(i); }}
            aria-label={`Go to ${s.label}`}
          />
        ))}
      </div>
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
        src="grinloud-smiley-2026.png"
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

function ShareButton({ url, title, text, size = 'md' }) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); } catch {} // user cancelled — ignore
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <button className={`share-btn share-btn--${size}`} onClick={handleShare} aria-label="Share this pick">
      <Icon.Share size={12} />
      <span>{copied ? 'LINK COPIED' : 'SHARE'}</span>
    </button>
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

// Info layer opened by tapping a track's cover/title in the Music Radar
// tracklist or the Archive picks grid — same facts as the Pick of the Day
// hero (cover, meta, GRINLOUD SAYS), but as a dismissible overlay since
// these rows live in a list, not a full page. Play/Pause lives inside the
// layer too, but the row's own Play control (outside this component) is
// the primary way to trigger playback without opening it at all.
function TrackInfoLayer({ track, accent, isPlaying, onToggle, onClose }) {
  if (!track) return null;
  const spotifyUrl = track.links?.spotify;
  const canPlay = spotifyUrl && spotifyUrl !== '#';
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="track-layer" onClick={(e) => e.stopPropagation()} style={{ '--accent': accent }}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon.Close /></button>

        <div className="track-layer__cover">
          <SpotifyCover spotifyUrl={spotifyUrl} alt={`${track.title} — ${track.artist} cover art`} />
        </div>

        <div className="track-layer__body">
          <h2 className="track-layer__title">{track.title}</h2>
          <div className="track-layer__artist">{track.artist}</div>

          <div className="meta-pills track-layer__meta">
            {track.bpm && <span className="meta-pill"><span className="meta-pill__v">{track.bpm} BPM</span></span>}
            {track.key && <span className="meta-pill"><span className="meta-pill__v">{track.key}</span></span>}
            {track.label && <span className="meta-pill"><span className="meta-pill__v">{track.label}</span></span>}
            {track.genre && <span className="meta-pill"><span className="meta-pill__v">{track.genre}</span></span>}
            {track.release && <span className="meta-pill"><span className="meta-pill__v">{track.release}</span></span>}
          </div>

          {track.info && (
            <React.Fragment>
              <div className="track-layer__label">GRINLOUD SAYS</div>
              <p className="track-layer__quote">{track.info}</p>
            </React.Fragment>
          )}

          {track.funFact && (
            <React.Fragment>
              <div className="track-layer__label">FUN FACT</div>
              <p className="track-layer__quote">{track.funFact}</p>
            </React.Fragment>
          )}

          <div className="pick-actions">
            {canPlay && (
              <button
                className={`play-btn ${isPlaying ? 'is-playing' : ''}`}
                onClick={() => onToggle(spotifyUrl)}
              >
                {isPlaying ? <Icon.Pause size={12} /> : null}
                <span>{isPlaying ? 'PAUSE' : '▶ PLAY PREVIEW'}</span>
              </button>
            )}
            {track.links && <StreamingLinks links={track.links} accent={accent} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBrand({ onHome }) {
  return (
    <div className="top-brand">
      <div className="top-brand__inner">
        <LogoMark size={26} onClick={onHome} />
        <button className="top-brand__wordmark" onClick={onHome}>grinloud.com</button>
        <span className="top-brand__tagline">HOUSE MUSIC CURATED</span>
      </div>
    </div>
  );
}

function TopNav({ route, setRoute, onBack, onNewsletter, accent, onGotoRadar, isAdmin, onHome }) {
  const radar = window.GRINLOUD_DATA.RADAR;
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Zurich' });
  const radarActuallyLive = !radar.liveDate || todayStr >= radar.liveDate;
  const radarIsLive = isAdmin || radarActuallyLive;
  const items = [
    { id: 'home',    label: 'PICK' },
    { id: 'radar',   label: 'MUSIC RADAR' },
    { id: 'archive', label: 'ARCHIVE' }
  ];
  return (
    <nav className="top-nav">
      <div className="top-nav__inner">
        {/* Compact-tier only (see CSS) — the standalone .top-brand (with its
            desktop logo-overhang treatment) hides below 900px in favour of
            this one, so the wordmark and nav sit as a single tight cluster
            with one small gap between them instead of the standalone brand
            staying pinned far left while nav__inner's margin-left:auto
            pushes the links all the way to the right, leaving a huge dead
            gap in between at narrow-but-not-stacked widths. */}
        <button className="top-nav__brand" onClick={onHome} aria-label="GRINLOUD home">
          <img src="grinloud-smiley-2026.png" alt="" className="top-nav__brand-logo" />
          <span className="top-nav__brand-word">grinloud.com</span>
        </button>
        {/* Back arrow — shown on all non-home pages, left of PICK (mobile only, see CSS) */}
        {route !== 'home' && (
          <button className="nav-back" onClick={onBack} aria-label="Back to Pick">
            <Icon.Arrow dir="left" size={14} />
          </button>
        )}
        {items.map((it) => (
          <button
            key={it.id}
            className={`nav-link ${route === it.id ? 'is-active' : ''}`}
            onClick={() => setRoute(it.id)}
          >
            {it.label}
          </button>
        ))}
        <span className="nav-spacer" />
        <a className="nav-link nav-link--ghost" href="https://instagram.com/grinloud" target="_blank" rel="noreferrer" aria-label="Instagram">
          <Icon.Instagram size={13} />
        </a>
        <a className="nav-link nav-link--ghost" href="https://youtube.com/@grinloud" target="_blank" rel="noreferrer" aria-label="YouTube">
          <Icon.YouTube size={13} />
        </a>
        <button className="nav-link nav-link--ghost" onClick={onNewsletter} aria-label="Subscribe">
          <Icon.Mail size={13} /> <span className="nav-subscribe-label">SUBSCRIBE</span>
        </button>
      </div>
      {route === 'home' && onGotoRadar && radarIsLive && (
        <button
          className="site-radar-pill"
          style={!radarActuallyLive ? { opacity: 0.5 } : undefined}
          onClick={onGotoRadar}
        >
          MUSIC RADAR {radar.number} → OUT NOW
          {isAdmin && !radarActuallyLive && <span className="pick-scheduled-badge">SCHEDULED</span>}
        </button>
      )}
    </nav>
  );
}

function ClaimChip({ accent }) {
  return (
    <div className="brand-footer brand-footer--subpage">
      © 2026 – Grinloud.com
    </div>
  );
}

function LegalLinks() {
  return (
    <div className="legal-links">
      <a href="/news.html" target="_blank" rel="noreferrer" className="legal-links__news">NEWS</a>
      <span>·</span>
      <a href="/about.html" target="_blank" rel="noreferrer">About</a>
      <span>·</span>
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

// A Spotify URL is either a single track (per-pick preview) or a playlist
// (a full Radar cycle's tracklist, played back-to-back via "PLAY FULL RADAR").
// Both load into the same persistent iframe controller — only the URI type
// (spotify:track: vs spotify:playlist:) differs.
function spotifyUriFromUrl(spotifyUrl) {
  if (!spotifyUrl || spotifyUrl === '#') return null;
  const trackId = spotifyUrl.split('/track/')[1]?.split('?')[0];
  if (trackId) return 'spotify:track:' + trackId;
  const playlistId = spotifyUrl.split('/playlist/')[1]?.split('?')[0];
  if (playlistId) return 'spotify:playlist:' + playlistId;
  return null;
}

// Called SYNCHRONOUSLY inside click handlers to keep user-gesture context.
// loadUri + immediate play() is attempted first (needed for iOS gesture
// context), but confirmed via screen recording that this pair alone is not
// reliable when switching FROM an already-playing track: loadUri() does not
// always finish inside the iframe before the immediately-following play()
// arrives, so that play() gets silently dropped — the row's button flips to
// "PAUSE" but the Spotify widget itself keeps showing a plain unplayed ▶ for
// several seconds. As a safety net, also listen once for the controller's
// own playback_update signal that THIS uri has actually loaded, and retry
// play() then if it's still paused. (Do not "fix" this by destroying and
// recreating the controller instead — controller.destroy() removes the
// container element from the page per Spotify's docs, breaking the
// persistent container SpotifyPreviewBar and every future call here rely on.)
window.grinloudPlaySpotify = function(spotifyUrl) {
  const uri = spotifyUriFromUrl(spotifyUrl);
  if (!uri) return;

  if (_spotifyCtrl) {
    try {
      if (_currentUri !== uri) {
        _currentUri = uri;
        _spotifyCtrl.loadUri(uri);
        const ctrl = _spotifyCtrl;
        const retryPlayWhenLoaded = function(e) {
          const d = (e && e.data) || {};
          if (d.playingURI !== uri) return;
          if (d.isPaused) {
            try { ctrl.play(); } catch (_) {}
          }
        };
        ctrl.addListener('playback_update', retryPlayWhenLoaded);
      }
      _spotifyCtrl.play(); // synchronous — still inside user-gesture call stack
    } catch (_) {
      // Controller stale — reset and fall through to createController
      _spotifyCtrl = null;
      _currentUri = null;
    }
  }
  if (!_spotifyCtrl && _spotifyAPI && _containerEl) {
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
  const uriToLoad = spotifyUriFromUrl(spotifyUrl);

  React.useEffect(function() {
    if (!containerRef.current || !uriToLoad) return;
    _containerEl = containerRef.current;

    function initPlayer() {
      if (!_spotifyAPI) return;
      const uri = uriToLoad;
      if (_spotifyCtrl) {
        // Skip if grinloudPlaySpotify already loaded this URI to avoid
        // interrupting active playback with a redundant loadUri call.
        if (_currentUri !== uri) {
          _currentUri = uri;
          try {
            _spotifyCtrl.loadUri(uri);
          } catch (_) {
            // Controller is stale (its IFrame was removed from the DOM while
            // navigating through a pick with no preview). Create a fresh one.
            _spotifyCtrl = null;
            _spotifyAPI.createController(
              _containerEl,
              { uri: uri, width: '100%', height: 80 },
              function(ctrl) { _spotifyCtrl = ctrl; }
            );
          }
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
  }, [uriToLoad]);

  // Both elements are always in the DOM — never conditionally mounted/unmounted.
  // The Spotify IFrame API can replace or move the container node in the DOM,
  // which detaches containerRef.current. If React then calls insertBefore or
  // removeChild referencing that detached node it throws NotFoundError.
  // Using style.display instead of conditional rendering means React never
  // needs to call those DOM mutation methods on these nodes.
  return (
    <div className="spotify-bar">
      <div
        ref={containerRef}
        style={{ flex: 1, height: 80, overflow: 'hidden', display: uriToLoad ? 'block' : 'none' }}
      />
      <div
        className="spotify-bar__unavailable-msg"
        style={{ display: uriToLoad ? 'none' : 'flex' }}
      >
        <span>PREVIEW NOT YET AVAILABLE FOR THIS PICK</span>
      </div>
    </div>
  );
}

function SpotifyCover({ spotifyUrl, alt = '' }) {
  const [src, setSrc] = React.useState(null);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!spotifyUrl || spotifyUrl === '#' || !ref.current) return;
    // Fetch on scroll-into-view rather than on mount: archive/tracklist grids
    // render dozens of these at once, and firing every oEmbed request
    // immediately overwhelms mobile Safari's concurrent-fetch limit, leaving
    // most covers permanently blank.
    let cancelled = false;
    const el = ref.current;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      fetchSpotifyOembed(spotifyUrl).then(d => { if (!cancelled && d?.thumbnail_url) setSrc(d.thumbnail_url); });
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => { cancelled = true; observer.disconnect(); };
  }, [spotifyUrl]);

  return (
    <div ref={ref} className="track-cover" style={src ? undefined : { background: '#000' }}>
      {src && <img src={src} alt={alt} loading="lazy" />}
    </div>
  );
}

export { BackgroundVideo, PickCarousel, LogoMark, StreamingLinks, ShareButton, NewsletterModal, TrackInfoLayer, TopBrand, TopNav, ClaimChip, LegalLinks, MetaPills, SpotifyPreviewBar, SpotifyCover };
