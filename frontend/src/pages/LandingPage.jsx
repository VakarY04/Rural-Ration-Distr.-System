import { useId } from 'react';
import {
  ShieldCheck,
  Cpu,
  Users,
  ClipboardCheck,
  CalendarCheck,
  MessageSquareCode,
  ArrowRight
} from 'lucide-react';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.jpg';
import logoAsset from '../images/E-RATION Logo.png';
import { swiss, TricolorStrip, TRICOLOR_GRADIENT } from '../components/ui/swiss';
import { useLandingAnimations } from './landing/useLandingAnimations';

const heroBadges = [
  {
    icon: ShieldCheck,
    title: 'Transparent',
    sub: 'End-to-end trace tracking',
    tile: 'bg-orange-50 text-[#FF9933] border border-orange-100',
    side: 'left',
  },
  {
    icon: Cpu,
    title: 'Technology Driven',
    sub: 'Smart dynamic matching',
    tile: 'bg-amber-50 text-[#FF9933] border border-amber-100',
    side: 'neutral',
  },
  {
    icon: Users,
    title: 'People First',
    sub: 'Citizen-centric workflows',
    tile: 'bg-blue-50 text-[#000080] border border-blue-100',
    side: 'right',
  },
];

const featureCards = [
  {
    icon: ClipboardCheck,
    heading: 'Smart Quota Allocations',
    accent: 'bg-[#FF9933]',
    iconTile: 'bg-orange-50 text-[#FF9933] border border-orange-100',
    text:
      'AI-powered allocation engine ensures accurate and fair distribution of ration based on eligibility, priority, and availability.',
    side: 'left',
  },
  {
    icon: CalendarCheck,
    heading: 'Secure Slot Booking',
    accent: 'bg-[#138808]',
    iconTile: 'bg-green-50 text-[#138808] border border-green-100',
    text:
      'Book your ration collection slot online and skip long queues. Choose your preferred time, hassle-free.',
    side: 'neutral',
  },
  {
    icon: MessageSquareCode,
    heading: 'Multilingual AI Grievance Bridge',
    accent: 'bg-[#000080]',
    iconTile: 'bg-blue-50 text-[#000080] border border-blue-100',
    text:
      'Report issues or get help in your language. Our AI assistant understands and resolves your concerns, 24/7.',
    side: 'right',
  },
];

// ── Card styling contract ──────────────────────────────────────────────────
// Every landing card is rendered as two nested layers:
//   <shell>  → carries the hover transform + box-shadow (NOT the card itself,
//              because GSAP writes an inline transform on .feature-card-box /
//              .hero-badge-box for the scroll-in animation and would otherwise
//              override a CSS :hover transform on the card)
//   <card>   → cardBase / badgeBase (the visible rounded surface)
//
// ROOT-CAUSE RULE for the corner-gap bug: the shell MUST mirror the card's
// border-radius AND keep `overflow-hidden` + the same background colour. If the
// shell stays square while the card is rounded, the card's rounded corners leave
// triangular notches inside the square shell, exposing the dark page background
// (and the shell's square box-shadow makes it obvious on hover). Keep radii in
// sync: all landing cards use rounded-2xl (feature cards, hero badges, banner).
//
// Inner overlays (e.g. <WaveAccent>) are absolutely positioned and rely solely
// on the card's `overflow-hidden` to clip to the rounded corners. Any future
// inner gradient/image/::before/::after MUST either inherit the parent radius or
// be explicitly rounded to match, and must never extend past the card's clip.
// ────────────────────────────────────────────────────────────────────────────
const cardBase =
  'bg-white border border-slate-200/80 rounded-2xl p-10 flex flex-col justify-between transition-colors duration-300 group-hover:border-slate-400 text-left cursor-default relative overflow-hidden h-full';

const badgeBase =
  'bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl px-5 py-4 flex items-center gap-4 h-full text-left transition-colors duration-300 group-hover:border-slate-400 cursor-default relative overflow-hidden';

// Shared hover "shells" — MUST keep the radius / overflow / background noted in
// the contract above so the rounded card and its hover shadow clip as one shape.
const portalCardShell =
  'group origin-top flex flex-col rounded-2xl overflow-hidden bg-white transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-400/40';
const heroBadgeShell =
  'group flex flex-col rounded-2xl overflow-hidden bg-white/95 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-300/60';
const bannerShell =
  'rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300 max-w-4xl mx-auto';

// Soft, flowing "fabric/ribbon" accent layered behind a card's content.
// `side` controls the directional color flow:
//   'left'    → saffron ribbon from the top-left, curving toward bottom-right
//   'right'   → green ribbon from the top-right, curving toward bottom-left
//   'neutral' → subtle white/gray wave, no saturated color
// The colored region flows diagonally, fades smoothly into the white card
// surface, and is fully contained by the card's overflow-hidden boundary.
function WaveAccent({ side }) {
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
function BannerWaves() {
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

export default function LandingPage({ onNavigate }) {
  const {
    mainContainerRef,
    scrollContainerRef,
    brandTitleRef,
    brandSubRef,
    sloganRef,
    gradientLineRef,
    descRef,
    badgesContainerRef,
    cardsGridRef,
    trustFooterRef,
  } = useLandingAnimations();

  return (
    <div ref={mainContainerRef} className="h-screen flex flex-col overflow-hidden selection:bg-orange-100 font-sans">

      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <img src={heroBackdrop} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      </div>

      <TricolorStrip />

      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div />
          <button onClick={() => onNavigate('admin-login')} type="button" className={`${swiss.btnPrimary} rounded-lg`}>
            <Users size={14} aria-hidden="true" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Keeps the original header footprint in flow so content/layout spacing
          (and the logo) stay exactly as before once the header is fixed. */}
      <div aria-hidden="true" className="shrink-0 h-[68px]" />

      <main ref={scrollContainerRef} className="landing-scroll relative z-10 w-full flex-1 overflow-y-auto">
        <section className="w-full px-6 pt-16 pb-24">
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">

            <div className="flex flex-col items-center gap-3">
              <img src={logoAsset} alt="E-Ration Logo" className="w-20 h-20 object-contain rounded-2xl" />
              <h1 ref={brandTitleRef} className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white uppercase leading-none drop-shadow-lg">
                E-Ration Portal
              </h1>
              <span ref={brandSubRef} className="block text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                Smart Allocation & Scheduling Engine
              </span>
            </div>

            <h2
              ref={sloganRef}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.02] drop-shadow-lg"
            >
              <span className="block">Every Grain Counts,</span>
              <span className="block">Every Family Matters.</span>
            </h2>

            <div ref={gradientLineRef} className="h-1 w-0 opacity-0" style={{ background: TRICOLOR_GRADIENT }} />

            <p ref={descRef} className="text-white text-base md:text-lg font-semibold max-w-3xl leading-relaxed drop-shadow-md">
              Empowering Public Distribution Frameworks with structural clarity, zero-shot
              algorithmic routing accuracy, and secure processing layers—ensuring essential baseline
              commodities cross delivery lines transparently and cleanly.
            </p>

            <div
              ref={badgesContainerRef}
              className="hero-badges-container grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl w-full pt-4"
            >
              {heroBadges.map(({ icon: Icon, title, sub, tile, side }) => (
                <div
                  key={title}
                  className={heroBadgeShell}
                >
                  <div className={`hero-badge-box ${badgeBase}`}>
                    <WaveAccent side={side} />
                    <div className={`w-11 h-11 shrink-0 flex items-center justify-center ${tile} rounded-xl relative z-10 transition-transform duration-300 ease-out group-hover:scale-110`}>
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <div className="relative z-10">
                      <span className="hero-badge-title block text-sm font-extrabold text-[#000080] uppercase tracking-wide">
                        {title}
                      </span>
                      <span className="block text-xs font-medium text-slate-500 mt-0.5">{sub}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        <section className="w-full px-6 pb-28">
          <div className="max-w-7xl mx-auto space-y-16">

            <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-white text-center drop-shadow-md">Portal Services</h2>

            <div ref={cardsGridRef} className="feature-cards-grid grid grid-cols-1 md:grid-cols-3 gap-8">

              {featureCards.map(({ icon: Icon, heading, accent, iconTile, text, side }) => (
                <div
                  key={heading}
                  className={portalCardShell}
                >
                  <div className={`feature-card-box ${cardBase}`}>
                    <WaveAccent side={side} />
                    <div className="relative z-10 space-y-6">
                      <div className={`w-14 h-14 flex items-center justify-center ${iconTile} rounded-2xl transition-transform duration-300 ease-out group-hover:scale-110`}>
                        <Icon size={28} aria-hidden="true" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="feature-card-heading text-xl font-extrabold tracking-tighter text-[#000080]">
                          {heading}
                        </h3>
                        <div className={`h-0.5 w-16 ${accent} rounded-full`} />
                        <p className="feature-card-text text-sm font-medium leading-relaxed text-slate-600 pt-2">
                          {text}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('admin-login')}
                      type="button"
                      className={`${swiss.btnSecondary} mt-8 self-start rounded-xl relative z-10`}
                    >
                      <span>Learn More</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}

            </div>

            <div className={bannerShell}>
              <footer
                ref={trustFooterRef}
                className="trust-footer-box bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden"
              >
                <BannerWaves />
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
                  <ShieldCheck className="text-[#138808] shrink-0" size={22} aria-hidden="true" />
                  <p className="trust-footer-text text-xs sm:text-sm font-bold text-[#000080] tracking-wide uppercase">
                    Committed to a Hunger-Free India through Transparency, Technology & Trust
                  </p>
                </div>
              </footer>
            </div>

          </div>
        </section>
      </main>

    </div>
  );
}
