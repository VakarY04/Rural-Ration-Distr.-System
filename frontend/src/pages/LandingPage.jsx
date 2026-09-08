import { ArrowRight, Users, ShieldCheck } from 'lucide-react';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.webp';
import logoAsset from '../images/E-RATION Logo.png';
import { swiss, TricolorStrip, TRICOLOR_GRADIENT } from '../components/ui/swiss';
import { useLandingAnimations } from './landing/useLandingAnimations';
import { WaveAccent, BannerWaves } from '../components/landing/WaveDecorations';
import { heroBadges, featureCards } from './landing/landingContent';
import {
  cardBase,
  badgeBase,
  portalCardShell,
  heroBadgeShell,
  bannerShell,
  HERO_BADGES_CONTAINER,
  FEATURE_CARDS_GRID,
  HERO_BADGE_BOX,
  HERO_BADGE_TITLE,
  FEATURE_CARD_BOX,
  FEATURE_CARD_HEADING,
  FEATURE_CARD_TEXT,
  TRUST_FOOTER_BOX,
  TRUST_FOOTER_TEXT,
} from './landing/landingStyles';

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

            <p ref={descRef} className="text-white text-sm md:text-base font-semibold max-w-3xl leading-relaxed drop-shadow-md">
              Empowering Public Distribution Frameworks with structural clarity, zero-shot
              algorithmic routing accuracy, and secure processing layers—ensuring essential baseline
              commodities cross delivery lines transparently and cleanly.
            </p>

            <div
              ref={badgesContainerRef}
              className={`${HERO_BADGES_CONTAINER} grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl w-full pt-4`}
            >
              {heroBadges.map(({ icon: Icon, title, sub, tile, side }) => (
                <div
                  key={title}
                  className={heroBadgeShell}
                >
                  <div className={`${HERO_BADGE_BOX} ${badgeBase}`}>
                    <WaveAccent side={side} />
                    <div className={`w-11 h-11 shrink-0 flex items-center justify-center ${tile} rounded-xl relative z-10 transition-transform duration-300 ease-out group-hover:scale-110`}>
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <div className="relative z-10">
                      <span className={`${HERO_BADGE_TITLE} block text-sm font-extrabold text-[#000080] uppercase tracking-wide`}>
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

            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white text-center drop-shadow-md">Portal Services</h2>

            <div ref={cardsGridRef} className={`${FEATURE_CARDS_GRID} grid grid-cols-1 md:grid-cols-3 gap-8`}>

              {featureCards.map(({ icon: Icon, heading, accent, iconTile, text, side }) => (
                <div
                  key={heading}
                  className={portalCardShell}
                >
                  <div className={`${FEATURE_CARD_BOX} ${cardBase}`}>
                    <WaveAccent side={side} />
                    <div className="relative z-10 space-y-6">
                      <div className={`w-14 h-14 flex items-center justify-center ${iconTile} rounded-2xl transition-transform duration-300 ease-out group-hover:scale-110`}>
                        <Icon size={28} aria-hidden="true" />
                      </div>
                      <div className="space-y-3">
                        <h3 className={`${FEATURE_CARD_HEADING} text-xl font-extrabold tracking-tighter text-[#000080]`}>
                          {heading}
                        </h3>
                        <div className={`h-0.5 w-16 ${accent} rounded-full`} />
                        <p className={`${FEATURE_CARD_TEXT} text-sm font-medium leading-relaxed text-slate-600 pt-2`}>
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
                className={`${TRUST_FOOTER_BOX} bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden`}
              >
                <BannerWaves />
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
                  <ShieldCheck className="text-[#138808] shrink-0" size={22} aria-hidden="true" />
                  <p className={`${TRUST_FOOTER_TEXT} text-xs sm:text-sm font-bold text-[#000080] tracking-wide`}>
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
