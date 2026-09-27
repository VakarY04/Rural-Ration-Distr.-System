import { MessageSquareWarning } from 'lucide-react';
import { swiss } from '../components/ui/swiss';
import GrievanceQueue from '../components/distributor/GrievanceQueue';
import { useLanguage } from '../i18n/LanguageContext';

// Complaints page — every grievance filed by citizens in one place, with the
// full assign / track / resolve workflow. Served through the existing staff
// queue endpoint, so admins see all complaints and distributors share the
// same queue they already manage from Home (7.1 matrix).
export default function ComplaintsPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 font-sans">
      <header>
        <p className={swiss.micro}>{t('complaints.eyebrow')}</p>
        <h1 className={`${swiss.headline} flex items-center gap-2.5`}>
          <span className="w-9 h-9 border border-[#DC3545]/30 bg-[#DC3545]/10 text-[#DC3545] flex items-center justify-center shrink-0" aria-hidden="true">
            <MessageSquareWarning size={17} />
          </span>
          {t('complaints.title')}
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          {t('complaints.intro')}
        </p>
      </header>

      <GrievanceQueue />
    </div>
  );
}
