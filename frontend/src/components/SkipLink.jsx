import { useLanguage } from '../i18n/LanguageContext';

// Shared "Skip to main content" link — first focusable element in every shell
// (GIGW A / WCAG 2.4.1). Visually hidden until keyboard-focused, so mouse users
// never see it. Uses a button-like anchor that moves focus without polluting
// the URL hash (the app's custom History-API router owns the URL).
export default function SkipLink({ targetId = 'main-content' }) {
  const { t } = useLanguage();
  const skip = (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  };

  return (
    <a href={`#${targetId}`} onClick={skip} className="sr-only">
      {t('skip.link')}
    </a>
  );
}
