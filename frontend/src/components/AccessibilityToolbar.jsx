import { useEffect, useState } from 'react';
import { loadA11y, applyA11y, A11Y_MIN_INDEX, A11Y_MAX_INDEX, A11Y_DEFAULT_INDEX } from '../utils/a11y';

// Compact government-style accessibility toolbar: text size (A−/A/A+),
// high-contrast text, link highlighting, image hiding. Dark pill renders
// legibly on light and dark shells alike. Re-applies saved prefs on mount.
const btn =
  'px-2 py-1 text-[11px] font-bold leading-none rounded transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-orange-500';
const off = 'text-slate-300 hover:text-white hover:bg-slate-700';
const on = 'bg-white text-slate-900';

export default function AccessibilityToolbar({ className = '' }) {
  const [prefs, setPrefs] = useState(loadA11y);

  useEffect(() => {
    applyA11y(prefs);
  }, [prefs]);

  const set = (patch) => setPrefs((p) => ({ ...p, ...patch }));

  return (
    <div
      role="toolbar"
      aria-label="Accessibility options"
      className={`inline-flex items-center gap-0.5 bg-slate-900 text-white rounded-full px-2 py-1 shadow ${className}`}
    >
      <button type="button" className={`${btn} ${off}`} title="Decrease text size" aria-label="Decrease text size"
        disabled={prefs.scaleIndex <= A11Y_MIN_INDEX}
        onClick={() => set({ scaleIndex: Math.max(A11Y_MIN_INDEX, prefs.scaleIndex - 1) })}>
        A−
      </button>
      <button type="button" className={`${btn} ${off}`} title="Reset text size" aria-label="Reset text size"
        onClick={() => set({ scaleIndex: A11Y_DEFAULT_INDEX })}>
        A
      </button>
      <button type="button" className={`${btn} ${off}`} title="Increase text size" aria-label="Increase text size"
        disabled={prefs.scaleIndex >= A11Y_MAX_INDEX}
        onClick={() => set({ scaleIndex: Math.min(A11Y_MAX_INDEX, prefs.scaleIndex + 1) })}>
        A+
      </button>
      <span aria-hidden="true" className="w-px h-4 bg-slate-600 mx-1" />
      <button type="button" className={`${btn} ${prefs.contrast ? on : off}`} title="High contrast text"
        aria-label="High contrast text" aria-pressed={prefs.contrast}
        onClick={() => set({ contrast: !prefs.contrast })}>
        Contrast
      </button>
      <button type="button" className={`${btn} ${prefs.links ? on : off}`} title="Highlight links"
        aria-label="Highlight links" aria-pressed={prefs.links}
        onClick={() => set({ links: !prefs.links })}>
        Links
      </button>
      <button type="button" className={`${btn} ${prefs.images ? on : off}`} title="Hide images"
        aria-label="Hide images" aria-pressed={prefs.images}
        onClick={() => set({ images: !prefs.images })}>
        Images
      </button>
    </div>
  );
}
