// Social Mode — /?social
// Utility screen (not a promo graphic like Cinema/RadarCover): gives Cy
// everything needed to hand-build a TikTok/Instagram post — high-res cover
// + artist photos to save from the phone, and copy-ready caption text.
import React from 'react'
import { SpotifyCover } from './shared.jsx'

// Fixed engagement comment Cy posts himself right after publishing, on every
// GRINLOUD post — see the grinloud-pick-of-the-day-carousel skill. Not
// reinvented per post; keep this in sync if the skill's wording changes.
const FIRST_COMMENT = `Yeah, we're new here. Not new to good music though.
Like it if it slaps, comment if you've got opinions (we can take it), follow if you want more where this came from.
Every bit helps right now — no shame in that. ☻`;

// Hashtag can't contain spaces/slashes — take the primary genre only
// ("Tech House | Latin Tech" -> "TechHouse", "Dance / Pop" -> "Dance").
function genreHashtag(genre) {
  return (genre || '').split(/[|/]/)[0].trim().replace(/\s+/g, '');
}

function buildInfoText(pick) {
  const funFact = pick.funFact || 'No fun fact saved for this pick yet — add one to data.js.';
  const handles = [
    pick.artistInstagram && `IG ${pick.artistInstagram}`,
    pick.artistTiktok && `TikTok ${pick.artistTiktok}`,
  ].filter(Boolean).join(' · ');
  return `PICK OF THE DAY
${pick.date}
—
${pick.title}
${pick.artist}
${handles || 'No artist handle saved for this pick yet — add one to data.js.'}
—
BPM: ${pick.bpm}
Key: ${pick.key}
Label: ${pick.label}
Genre: ${pick.genre}
Release: ${pick.release}
—
☻
GRINLOUD SAYS
${pick.info}

FUN FACT
${funFact}
—
#Grinloud — #${genreHashtag(pick.genre)} — #Pick — #Curated
—
New Pick every day, new Radar every 10 — House Music Curation and more: link in bio.`;
}

function CopyBlock({ label, text }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="social__text-block">
      <div className="social__block-header">
        <span className="social__block-label">{label}</span>
        <button className="social__copy-btn" onClick={copy}>
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
      <pre className="social__text">{text}</pre>
    </div>
  );
}

function ImageBlock({ label, src, alt, fit = 'cover' }) {
  return (
    <div className="social__image-block">
      <div className="social__block-label">{label}</div>
      <div className={`social__image-frame${fit === 'contain' ? ' social__image-frame--contain' : ''}`}>
        {src
          ? <img src={src} alt={alt} />
          : <div className="social__image-missing">No image available</div>}
      </div>
      <div className="social__image-hint">Tap &amp; hold to save</div>
    </div>
  );
}

function Social({ pick }) {
  return (
    <div className="social">
      <div className="social__header">
        <img src="Logo%20GRINLOUD%20Smiley%20Yellow%20black.svg" alt="" className="social__header-logo" />
        <span>SOCIAL MODE · {pick.date}</span>
      </div>

      <div className="social__images">
        <div className="social__image-block">
          <div className="social__block-label">SONG COVER</div>
          <div className="social__image-frame">
            <SpotifyCover spotifyUrl={pick.links?.spotify} alt={`${pick.title} — ${pick.artist} cover art`} />
          </div>
          <div className="social__image-hint">Tap &amp; hold to save</div>
        </div>

        <ImageBlock
          label="ARTIST PHOTO"
          src={pick.artistImage}
          alt={`${pick.artist} photo`}
        />

        <ImageBlock
          label="BADGE / STICKER"
          src="Badge%20Pick%20of%20the%20Day.png"
          alt="Pick of the Day badge"
          fit="contain"
        />
      </div>

      <CopyBlock label="POST INFO" text={buildInfoText(pick)} />
      <CopyBlock label="FIRST COMMENT" text={FIRST_COMMENT} />
    </div>
  );
}

export { Social };
