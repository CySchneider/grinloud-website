// Minimal icon set — kept simple shapes (no AI-slop SVG illustrations)

const Icon = {
  Arrow: ({ dir = 'right', size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transform: dir === 'left' ? 'rotate(180deg)' : 'none' }}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"/>
    </svg>
  ),
  Chevron: ({ dir = 'right', size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transform: dir === 'left' ? 'rotate(180deg)' : 'none' }}>
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"/>
    </svg>
  ),
  Play: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4l14 8-14 8V4z"/>
    </svg>
  ),
  Pause: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  Close: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"/>
    </svg>
  ),
  Mail: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 7l9 7 9-7" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  External: ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"/>
    </svg>
  ),
  Dot: ({ size = 8 }) => (
    <svg width={size} height={size} viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="currentColor"/></svg>
  ),
  Instagram: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>
    </svg>
  ),
  YouTube: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 9l6 3-6 3V9z" fill="currentColor"/>
    </svg>
  ),
  Share: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12M7 8l5-5 5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"/>
      <path d="M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5" stroke="currentColor" strokeWidth="2.5"/>
    </svg>
  ),
};

export { Icon };
