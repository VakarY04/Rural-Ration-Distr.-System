import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import logoAsset from '../../images/E-RATION Logo.webp';
import heroBackdrop from '../../images/india-republic-day-celebration-digital-art-with-flag.webp';
import HoverSplitBackdrop from './HoverSplitBackdrop';
import { swiss } from '../ui/swiss';
import SkipLink from '../SkipLink';
import AccessibilityToolbar from '../AccessibilityToolbar';
import { useLanguage } from '../../i18n/LanguageContext';

// Shared full-page shell for the single centred-card auth screens
// (registration, account recovery, …). Encapsulates the split backdrop,
// its hover zones, the logo header and the "Secure Endpoint" footer so each
// page only supplies its title/subtitle and form body. AdminLoginPage is NOT
// a candidate for this shell — it renders two portals side-by-side.
export function AuthPageShell({
  title,
  subtitle,
  children,
  footerLabel,
  cardClassName = 'hover:-translate-y-1 hover:shadow-2xl hover:border-[#FF9933]/40',
}) {
  const { t } = useLanguage();
  const resolvedFooter = footerLabel ?? t('auth.secureEndpoint');
  const [activeSide, setActiveSide] = useState(null);
  const [cardHovered, setCardHovered] = useState(false);

  return (
    <div className="relative min-h-screen font-sans bg-slate-950 text-white overflow-x-hidden flex flex-col">
      <SkipLink />
      <HoverSplitBackdrop image={heroBackdrop} activeSide={activeSide} reveal={cardHovered} />

      {/* Invisible hover zones that light up each side of the split backdrop. */}
      <div className="absolute inset-0 z-0" onMouseLeave={() => setActiveSide(null)} aria-hidden="true">
        <div className="absolute inset-y-0 left-0 w-1/2" onMouseEnter={() => setActiveSide('left')} />
        <div className="absolute inset-y-0 right-0 w-1/2" onMouseEnter={() => setActiveSide('right')} />
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <AccessibilityToolbar />
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center p-6 overscroll-y-contain" id="main-content" tabIndex={-1}>
        <div
          onMouseEnter={() => setCardHovered(true)}
          onMouseLeave={() => setCardHovered(false)}
          className={`w-full max-w-md ${swiss.panel} p-8 space-y-6 transition-all duration-300 ${cardClassName}`}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <img src={logoAsset} alt="E-Ration Logo" width={56} height={56} decoding="async" className="w-14 h-14 object-contain bg-slate-50 p-1 rounded-2xl" />
            <div>
              <h2 className="text-xl font-extrabold tracking-tighter text-[#000080]">{title}</h2>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>

          {children}

          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200">
            <ShieldCheck size={13} className="text-[#138808]" />
            <span className={swiss.micro}>{resolvedFooter}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
