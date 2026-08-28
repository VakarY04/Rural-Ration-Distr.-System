import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

// Single alert style reused across every auth + profile form so error and
// success feedback looks identical. Replaces the ad-hoc red/green banner
// divs that were copy-pasted (with slight drift) across the auth pages.
const VARIANTS = {
  error: { cls: 'border-red-300 bg-red-50 text-red-700', Icon: AlertCircle },
  success: { cls: 'border-[#138808] bg-green-50 text-[#138808]', Icon: CheckCircle2 },
  info: { cls: 'border-blue-300 bg-blue-50 text-blue-700', Icon: Info },
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
