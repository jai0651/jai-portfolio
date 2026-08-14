/**
 * A studio microphone drawn by hand rather than pulled from an icon set.
 *
 * Outline mic icons look thin and generic on a solid disc. This one has weight:
 * a filled capsule head with etched grille slots, a yoke, a stem and a base —
 * so it reads as an object at 22px instead of as a glyph.
 *
 * Grille slots are drawn in translucent black so they read as cut into the
 * capsule on any fill colour, gold or dark.
 */
const MicGlyph = ({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
    className={className}
  >
    {/* Capsule head */}
    <rect x="8.4" y="2" width="7.2" height="11.4" rx="3.6" fill="currentColor" />

    {/* Etched grille */}
    <g stroke="rgba(0,0,0,0.3)" strokeWidth="0.9" strokeLinecap="round">
      <line x1="9.9" y1="5.1" x2="14.1" y2="5.1" />
      <line x1="9.9" y1="7" x2="14.1" y2="7" />
      <line x1="9.9" y1="8.9" x2="14.1" y2="8.9" />
      <line x1="9.9" y1="10.8" x2="14.1" y2="10.8" />
    </g>

    {/* Yoke, stem, base */}
    <g
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.6 10.6v1.2a6.4 6.4 0 0 0 12.8 0v-1.2" />
      <line x1="12" y1="18.4" x2="12" y2="21.4" />
      <line x1="8.7" y1="21.6" x2="15.3" y2="21.6" />
    </g>
  </svg>
);

export default MicGlyph;
