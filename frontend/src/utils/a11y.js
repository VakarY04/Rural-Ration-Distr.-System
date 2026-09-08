// Accessibility preferences — single source of truth for the toolbar.
// Persisted in localStorage so the choice survives reloads and routes.
// Applied to <html>: root font-size (rem scaling) + mode classes consumed by
// the rules at the bottom of index.css. Idempotent — safe to call on every mount.
const STORAGE_KEY = 'eration_a11y';

const FONT_SCALES = [0.875, 1, 1.125, 1.25]; // A− … A+ in two steps
const DEFAULTS = { scaleIndex: 1, contrast: false, links: false, images: false };

export function loadA11y() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function applyA11y(prefs) {
  const root = document.documentElement;
  root.style.fontSize = `${FONT_SCALES[prefs.scaleIndex] * 100}%`;
  root.classList.toggle('a11y-high-contrast', prefs.contrast);
  root.classList.toggle('a11y-highlight-links', prefs.links);
  root.classList.toggle('a11y-hide-images', prefs.images);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Private mode etc. — prefs simply don't persist.
  }
}

export const A11Y_MIN_INDEX = 0;
export const A11Y_MAX_INDEX = FONT_SCALES.length - 1;
export const A11Y_DEFAULT_INDEX = 1;
