import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

// Single alert style reused across every auth + profile form so error and
// success feedback looks identical. Replaces the ad-hoc red/green banner
// divs that were copy-pasted (with slight drift) across the auth pages.
const VARIANTS = {
  error: { cls: 'border-[#DC3545]/40 bg-[#DC3545]/10 text-[#DC3545]', Icon: AlertCircle },
  success: { cls: 'border-[#198754]/40 bg-[#198754]/10 text-[#198754]', Icon: CheckCircle2 },
  info: { cls: 'border-[#0D6EFD]/40 bg-[#0D6EFD]/10 text-[#0D6EFD]', Icon: Info },
};

export function Alert({ variant = 'error', children, className = '' }) {
  const { cls, Icon } = VARIANTS[variant] || VARIANTS.error;
  return (
    <div className={`flex items-center gap-2 ${cls} px-3.5 py-2.5 text-[11px] font-semibold ${className}`}>
      <Icon size={15} className="shrink-0" />
      <span>{children}</span>
    </div>
  );
}
