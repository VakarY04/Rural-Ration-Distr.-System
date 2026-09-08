import { CalendarCheck, Users, Bot, PhoneCall } from 'lucide-react';
import { swiss } from '../../components/ui/swiss';
import InfoShell from './InfoShell';

const GUIDES = [
  {
    icon: Users,
    title: 'Set up your household (first visit)',
    steps: [
      'Sign in, then open Family Profile.',
      'Fill Account Details, Ration Card Details and Address — the address decides your local distributor.',
      'Add every family member with name, age and relation, then Save Changes.',
    ],
  },
  {
    icon: CalendarCheck,
    title: 'Book a collection slot',
    steps: [
      'Open Ration Bookings and check your monthly quota at the top.',
      'Pick a future date and an available time window.',
      'Confirm — carry your ration card and Aadhaar to the Fair Price Shop.',
    ],
  },
  {
    icon: Bot,
    title: 'Get help from the AI Help Desk',
    steps: [
      'Describe the issue in any local language and submit for analysis.',
      'Note the ticket summary for follow-up.',
      'For urgent issues call 1967 / 1800-180-2087 (toll-free, all scheduled languages).',
    ],
  },
];

export default function HelpPage({ onNavigate }) {
  return (
    <InfoShell
      eyebrow="Help & how-to"
      title="Help"
      intro="Short guides for the tasks citizens do most. If something here doesn't match what you see, send Feedback so it can be corrected."
      onNavigate={onNavigate}
    >
      {GUIDES.map(({ icon: Icon, title, steps }) => (
        <section key={title} className={swiss.panel}>
          <div className="p-5 flex items-start gap-3">
            <span className="w-9 h-9 border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center shrink-0" aria-hidden="true">
              <Icon size={17} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
              <ol className="mt-2 space-y-1.5 text-sm text-slate-600 list-decimal list-inside">
                {steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ))}
      <section className={`${swiss.panel} p-5 flex items-center gap-3`}>
        <PhoneCall size={18} className="text-orange-600 shrink-0" aria-hidden="true" />
        <p className="text-sm text-slate-600">
          Urgent or unresolved? Call the toll-free helpline <strong className="text-slate-900 tabular-nums">1967</strong> any time.
        </p>
      </section>
    </InfoShell>
  );
}
