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
  },
  {
    icon: Cpu,
    title: 'Technology Driven',
    sub: 'Smart dynamic matching',
    tile: 'bg-amber-50 text-[#FF9933] border border-amber-100',
  },
  {
    icon: Users,
    title: 'People First',
    sub: 'Citizen-centric workflows',
    tile: 'bg-blue-50 text-[#000080] border border-blue-100',
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
  },
  {
    icon: CalendarCheck,
    heading: 'Secure Slot Booking',
    accent: 'bg-[#138808]',
    iconTile: 'bg-green-50 text-[#138808] border border-green-100',
    text:
      'Book your ration collection slot online and skip long queues. Choose your preferred time, hassle-free.',
  },
  {
    icon: MessageSquareCode,
    heading: 'Multilingual AI Grievance Bridge',
    accent: 'bg-[#000080]',
    iconTile: 'bg-blue-50 text-[#000080] border border-blue-100',
    text:
      'Report issues or get help in your language. Our AI assistant understands and resolves your concerns, 24/7.',
  },
];

const cardBase =
  'bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-slate-400 group text-left cursor-default';

const badgeBase =
  'bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl px-5 py-4 flex items-center gap-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default';

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

      <header className="sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div />
          <button onClick={() => onNavigate('admin-login')} type="button" className={swiss.btnPrimary}>
            <Users size={14} aria-hidden="true" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      <main ref={scrollContainerRef} className="relative z-10 w-full flex-1 overflow-y-auto">
        <section className="w-full px-6 pt-16 pb-24">
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">

            <div className="flex flex-col items-center gap-3">
              <img src={logoAsset} alt="E-Ration Logo" className="w-20 h-20 object-contain" />
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
              {heroBadges.map(({ icon: Icon, title, sub, tile }) => (
                <div
                  key={title}
                  className="hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`hero-badge-box ${badgeBase}`}>
                    <div className={`w-11 h-11 shrink-0 flex items-center justify-center ${tile} rounded-xl`}>
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <div>
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

              {featureCards.map(({ icon: Icon, heading, accent, iconTile, text }) => (
                <div
                  key={heading}
                  className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`feature-card-box ${cardBase}`}>
                    <div className="space-y-6">
                      <div className={`w-14 h-14 flex items-center justify-center ${iconTile} rounded-2xl`}>
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
                      className={`${swiss.btnSecondary} mt-8 self-start rounded-xl`}
                    >
                      <span>Learn More</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}

            </div>

            <div className="hover:shadow-xl transition-all duration-300 max-w-4xl mx-auto">
              <footer
                ref={trustFooterRef}
                className="trust-footer-box bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
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
