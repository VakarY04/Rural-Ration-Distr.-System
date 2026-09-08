import HelpPage from './HelpPage';
import FeedbackPage from './FeedbackPage';
import SitemapPage from './SitemapPage';
import PolicyPage from './PolicyPage';

// Top-level public route `/info?view=…` — one switcher so App.jsx needs a
// single import. Views: help, feedback, sitemap, policy-terms, policy-privacy,
// policy-accessibility, policy-copyright, policy-archival.
export default function InfoPage({ view = 'help', onNavigate }) {
  if (view === 'feedback') return <FeedbackPage onNavigate={onNavigate} />;
  if (view === 'sitemap') return <SitemapPage onNavigate={onNavigate} />;
  if (view && view.startsWith('policy-')) {
    return <PolicyPage doc={view.replace('policy-', '')} onNavigate={onNavigate} />;
  }
  return <HelpPage onNavigate={onNavigate} />;
}
