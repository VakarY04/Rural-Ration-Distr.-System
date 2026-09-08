import { useState } from 'react';
import { Search, ArrowRight, Lock } from 'lucide-react';
import { swiss } from '../../components/ui/swiss';
import InfoShell from './InfoShell';

// Combined Search + Sitemap: one filter box over the full route index, so
// citizens can find any page by typing. Citizen routes need a login; public
// routes work for everyone — each row says which.
const INDEX = [
  { label: 'Landing (home)', route: 'landing', access: 'Public', hint: 'Project introduction and sign-in entry' },
  { label: 'Sign in / Register', route: 'admin-login', access: 'Public', hint: 'Citizen and distributor login, new accounts' },
  { label: 'Terminal Hub', route: 'dashboard:home', access: 'Login', hint: 'Quota, distributor map, next collection' },
  { label: 'Family Profile', route: 'dashboard:profile', access: 'Login', hint: 'Account, ration card, members' },
  { label: 'Ration Bookings', route: 'dashboard:booking', access: 'Login', hint: 'Book a collection slot' },
  { label: 'AI Help Desk', route: 'dashboard:ai-support', access: 'Login', hint: 'Grievance analysis in any language' },
  { label: 'Distributor Console', route: 'distributor-console', access: 'Staff', hint: 'Bookings queue and ration configuration' },
  { label: 'Help', route: 'info:help', access: 'Public', hint: 'How-to guides' },
  { label: 'Feedback', route: 'info:feedback', access: 'Public', hint: 'Send suggestions and report issues' },
  { label: 'Policies & Copyright', route: 'info:policy-terms', access: 'Public', hint: 'Terms, privacy, accessibility' },
];

export default function SitemapPage({ onNavigate }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = INDEX.filter(
    (r) => !q || r.label.toLowerCase().includes(q) || r.hint.toLowerCase().includes(q)
  );
  // Staff-only rows stay visible (a sitemap must list everything) but citizens
  // get no Open button — the real gate is the backend's staff check, this just
  // avoids sending citizens into a dead-end error page.
  const role = localStorage.getItem('ration_user_role');
  const isStaff = role === 'distributor' || role === 'admin';

  const open = (route) => () => {
    if (!onNavigate) return;
    if (route.startsWith('dashboard:')) onNavigate('dashboard', { subPage: route.split(':')[1] });
    else if (route.startsWith('info:')) onNavigate('info', { subPage: route.split(':')[1] });
    else onNavigate(route);
  };

  return (
    <InfoShell
      eyebrow="Find a page"
      title="Search & Sitemap"
      intro="Every page in the portal, in one list. Type to filter."
      onNavigate={onNavigate}
    >
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <label htmlFor="sitemap-search" className="sr-only">Search pages</label>
        <input
          id="sitemap-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try ‘booking’, ‘help’, ‘ration’…"
          className={`${swiss.input} pl-11 py-3`}
        />
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No pages match “{query}”. Try fewer words.</p>
      ) : (
        <ol className="border border-slate-200 bg-white divide-y divide-slate-100" aria-label="Site pages">
          {rows.map((r) => (
            <li key={r.route} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{r.label}</p>
                <p className="text-[11px] text-slate-500 truncate">{r.hint} · {r.access}</p>
              </div>
              {r.access === 'Staff' && !isStaff ? (
                <span
                  title="Staff only — sign in with a distributor account"
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-400"
                >
                  <Lock size={12} aria-hidden="true" />
                  Staff only
                </span>
              ) : (
                <button
                  type="button"
                  onClick={open(r.route)}
                  title={`Open ${r.label}`}
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                  Open <ArrowRight size={13} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </InfoShell>
  );
}
