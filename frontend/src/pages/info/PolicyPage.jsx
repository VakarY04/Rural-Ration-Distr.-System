import { swiss } from '../../components/ui/swiss';
import InfoShell from './InfoShell';
import { POLICIES, POLICY_KEYS } from './policies';

// Renders one policy document by key, with a switcher for the rest.
// Document text lives in policies.js — this file is only presentation.
export default function PolicyPage({ doc = 'terms', onNavigate }) {
  const active = POLICIES[doc] || POLICIES.terms;

  return (
    <InfoShell
      eyebrow="Policy"
      title={active.title}
      intro={active.intro}
      onNavigate={onNavigate}
    >
      <nav aria-label="Policies" className="flex flex-wrap gap-2">
        {POLICY_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onNavigate && onNavigate('info', { subPage: `policy-${key}` })}
            aria-current={key === doc ? 'page' : undefined}
            className={`px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
              key === doc
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-300 hover:border-slate-900'
            }`}
          >
            {POLICIES[key].title}
          </button>
        ))}
      </nav>
      {active.sections.map((s) => (
        <section key={s.h} className={`${swiss.panel} p-5`}>
          <h2 className="text-base font-bold text-slate-900">{s.h}</h2>
          {s.p.map((para) => (
            <p key={para.slice(0, 24)} className="text-sm text-slate-600 mt-2 leading-relaxed">
              {para}
            </p>
          ))}
        </section>
      ))}
    </InfoShell>
  );
}
