import { useEffect } from 'react';
import { ArrowRight, Users, ShieldCheck } from 'lucide-react';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.webp';
import logoAsset from '../images/E-RATION Logo.webp';
import { swiss, TricolorStrip, TRICOLOR_GRADIENT } from '../components/ui/swiss';
import { useLandingAnimations } from './landing/useLandingAnimations';
import SkipLink from '../components/SkipLink';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import LanguageToggle from '../components/LanguageToggle';
import SiteFooter from '../components/SiteFooter';
import { useLanguage } from '../i18n/LanguageContext';
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
  const { t, lang } = useLanguage();
  // Translated browser-tab title (index.html ships a static placeholder).
  // Restores the previous title on unmount so other pages are unaffected.
  useEffect(() => {
    const prev = document.title;
    document.title = t('landing.pageTitle');
    return () => {
      document.title = prev;
    };
  }, [t]);
  // SplitType replaces an element's text nodes with word/char spans, so React
  // can no longer update that element's text on a language switch (updates hit
  // a detached node — text freezes) and re-splitting nests spans (corruption
  // + stuck opacity-0). Every SplitType target below carries key={lang} so it
  // remounts with fresh translated text; the animation hook then splits
  // pristine DOM. The scroll container itself is never remounted, so scroll
  // position survives the toggle. Do NOT remove these keys.
  const splitKey = lang;
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

  const badgeKeys = [
    { titleKey: 'landing.badge.transparent', subKey: 'landing.badge.transparentSub' },
    { titleKey: 'landing.badge.tech', subKey: 'landing.badge.techSub' },
    { titleKey: 'landing.badge.people', subKey: 'landing.badge.peopleSub' },
  ];
  const featureKeys = [
    { headingKey: 'landing.feature.quota', textKey: 'landing.feature.quotaText' },
    { headingKey: 'landing.feature.slot', textKey: 'landing.feature.slotText' },
    { headingKey: 'landing.feature.bridge', textKey: 'landing.feature.bridgeText' },
  ];
  const localizedBadges = heroBadges.map((b, i) => ({
    ...b,
    title: t(badgeKeys[i]?.titleKey),
    sub: t(badgeKeys[i]?.subKey),
    reactKey: badgeKeys[i]?.titleKey || i,
  }));
  const localizedFeatures = featureCards.map((c, i) => ({
    ...c,
    heading: t(featureKeys[i]?.headingKey),
    text: t(featureKeys[i]?.textKey),
    reactKey: featureKeys[i]?.headingKey || i,
  }));

  return (
    <div ref={mainContainerRef} className="h-screen flex flex-col overflow-hidden selection:bg-orange-100 font-sans">
      <SkipLink />
      <AccessibilityToolbar />

      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <img src={heroBackdrop} alt="" fetchpriority="high" decoding="async" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      </div>

      <TricolorStrip />

      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center">
            <LanguageToggle />
          </div>
          <button onClick={() => onNavigate('admin-login')} type="button" className={`${swiss.btnPrimary} rounded-lg`}>
            <Users size={14} aria-hidden="true" />
            <span>{t('header.signIn')}</span>
          </button>
        </div>
      </header>

      {/* Keeps the original header footprint in flow so content/layout spacing
          (and the logo) stay exactly as before once the header is fixed. */}
      <div aria-hidden="true" className="shrink-0 h-[68px]" />

      <main ref={scrollContainerRef} className="landing-scroll relative z-10 w-full flex-1 overflow-y-auto overscroll-y-contain" id="main-content" tabIndex={-1}>
        <section className="w-full px-6 pt-16 pb-24">
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">

            <div className="flex flex-col items-center gap-3">
              <img src={logoAsset} alt={t('landing.logoAlt')} width={80} height={80} decoding="async" className="w-20 h-20 object-contain rounded-2xl" />
              <h1 key={splitKey} ref={brandTitleRef} className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white uppercase leading-none drop-shadow-lg">
                {t('landing.brandTitle')}
              </h1>
              <span key={splitKey} ref={brandSubRef} className="block text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                {t('landing.brandSub')}
              </span>
            </div>

            <h2
              key={splitKey}
              ref={sloganRef}
              className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-lg ${lang === 'hi' ? 'leading-[1.2] tracking-normal' : 'leading-[1.02] tracking-tighter'}`}
            >
              <span className="block">{t('landing.slogan1')}</span>
              <span className="block">{t('landing.slogan2')}</span>
            </h2>

            <div ref={gradientLineRef} className="h-1 w-0 opacity-0" style={{ background: TRICOLOR_GRADIENT }} />

            <p key={splitKey} ref={descRef} className="text-white text-sm md:text-base font-semibold max-w-3xl leading-relaxed drop-shadow-md">
              {t('landing.description')}
            </p>

            <div
              ref={badgesContainerRef}
              className={`${HERO_BADGES_CONTAINER} grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl w-full pt-4`}
            >
              {localizedBadges.map(({ icon: Icon, title, sub, tile, side, reactKey }) => (
                <div
                  key={reactKey}
                  className={heroBadgeShell}
                >
                  <div className={`${HERO_BADGE_BOX} ${badgeBase}`}>
                    <WaveAccent side={side} />
                    <div className={`w-11 h-11 shrink-0 flex items-center justify-center ${tile} rounded-xl relative z-10 transition-transform duration-300 ease-out group-hover:scale-110`}>
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <div className="relative z-10 min-w-0">
                      <span key={splitKey} className={`${HERO_BADGE_TITLE} block text-sm font-extrabold text-[#000080] uppercase tracking-wide break-words`}>
                        {title}
                      </span>
                      <span className="block text-xs font-medium text-slate-500 mt-0.5 break-words">{sub}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        <section className="w-full px-6 pb-28">
          <div className="max-w-7xl mx-auto space-y-16">

            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white text-center drop-shadow-md">{t('landing.portalServices')}</h2>

            <div ref={cardsGridRef} className={`${FEATURE_CARDS_GRID} grid grid-cols-1 md:grid-cols-3 gap-8`}>

              {localizedFeatures.map(({ icon: Icon, heading, accent, iconTile, text, side, reactKey }) => (
                <div
                  key={reactKey}
                  className={portalCardShell}
                >
                  <div className={`${FEATURE_CARD_BOX} ${cardBase}`}>
                    <WaveAccent side={side} />
                    <div className="relative z-10 space-y-6">
                      <div className={`w-14 h-14 flex items-center justify-center ${iconTile} rounded-2xl transition-transform duration-300 ease-out group-hover:scale-110`}>
                        <Icon size={28} aria-hidden="true" />
                      </div>
                      <div className="space-y-3 min-w-0">
                        <h3 key={splitKey} className={`${FEATURE_CARD_HEADING} text-xl font-extrabold tracking-tighter text-[#000080] break-words`}>
                          {heading}
                        </h3>
                        <div className={`h-0.5 w-16 ${accent} rounded-full`} />
                        <p key={splitKey} className={`${FEATURE_CARD_TEXT} text-sm font-medium leading-relaxed text-slate-600 pt-2 break-words`}>
                          {text}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('admin-login')}
                      type="button"
                      className={`${swiss.btnSecondary} mt-8 self-start rounded-xl relative z-10`}
                    >
                      <span>{t('landing.learnMore')}</span>
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
                  <p key={splitKey} className={`${TRUST_FOOTER_TEXT} text-xs sm:text-sm font-bold text-[#000080] tracking-wide`}>
                    {t('landing.trust')}
                  </p>
                </div>
              </footer>
            </div>

          </div>
        </section>
        <SiteFooter onNavigate={onNavigate} />
      </main>

    </div>
  );
}
