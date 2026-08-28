import { useId } from 'react';

// Soft, flowing "fabric/ribbon" accent layered behind a card's content.
// `side` controls the directional color flow:
//   'left'    → saffron ribbon from the top-left, curving toward bottom-right
//   'right'   → green ribbon from the top-right, curving toward bottom-left
//   'neutral' → subtle white/gray wave, no saturated color
// The colored region flows diagonally, fades smoothly into the white card
// surface, and is fully contained by the card's overflow-hidden boundary.
export function WaveAccent({ side }) {
  const rawId = useId();
  const gradId = `wave-grad-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  if (side === 'neutral') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0 opacity-60 transition-opacity duration-300 ease-out group-hover:opacity-100">
        <svg className="h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 L350,0 C300,80 330,160 270,240 C240,280 280,300 260,300 L0,300 Z"
            fill={`url(#${gradId})`}
          />
        </svg>
      </div>
    );
  }

  const isLeft = side === 'left';
  const color = isLeft ? '#FF9933' : '#138808';
  // Diagonal gradient: opaque at the starting corner, transparent at the far corner.
  const gradAttrs = isLeft
    ? { x1: '0', y1: '0', x2: '1', y2: '1' }
    : { x1: '1', y1: '0', x2: '0', y2: '1' };

  // Broad ribbon + narrower, brighter inner ribbon → layered fabric look.
  const broad = isLeft
    ? 'M0,0 L350,0 C300,80 330,160 270,240 C240,280 280,300 260,300 L0,300 Z'
    : 'M400,0 L50,0 C100,80 70,160 130,240 C160,280 120,300 140,300 L400,300 Z';
  const narrow = isLeft
    ? 'M0,0 L180,0 C140,60 170,130 120,200 C90,245 110,280 90,300 L0,300 Z'
    : 'M400,0 L220,0 C260,60 230,130 280,200 C310,245 290,280 310,300 L400,300 Z';

  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-70 transition-opacity duration-300 ease-out group-hover:opacity-100">
      <svg className="h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} {...gradAttrs}>
            <stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <stop offset="50%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={broad} fill={`url(#${gradId})`} />
        <path d={narrow} fill={`url(#${gradId})`} opacity="0.4" />
      </svg>
    </div>
  );
}

// Tricolor fabric/wave treatment for the commitment banner: saffron flowing in
// from the left, green from the right, with a clean white center. All layers are
// absolute and the banner itself (overflow-hidden + rounded) is the clip boundary.
export function BannerWaves() {
  const rawId = useId();
  const saffId = `banner-saff-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const greenId = `banner-green-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <svg className="h-full w-full" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={saffId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF9933" stopOpacity="0.38" />
            <stop offset="28%" stopColor="#FF9933" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FF9933" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={greenId} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#138808" stopOpacity="0.38" />
            <stop offset="28%" stopColor="#138808" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#138808" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Small soft saffron accent hugging the left edge, fading quickly */}
        <path d="M0,0 L120,0 C85,30 100,62 65,100 L0,100 Z" fill={`url(#${saffId})`} />
        <path d="M0,0 L60,0 C38,30 48,60 28,100 L0,100 Z" fill={`url(#${saffId})`} opacity="0.6" />
        {/* Small soft green accent hugging the right edge, fading quickly */}
        <path d="M400,0 L280,0 C315,30 300,62 335,100 L400,100 Z" fill={`url(#${greenId})`} />
        <path d="M400,0 L340,0 C362,30 352,60 372,100 L400,100 Z" fill={`url(#${greenId})`} opacity="0.6" />
      </svg>
    </div>
  );
}
