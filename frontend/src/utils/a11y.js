// Accessibility preferences — single source of truth for the toolbar.
// Persisted in localStorage so the choice survives reloads and routes.
// Applied to <html>: root font-size (rem scaling) + mode/spacing classes
// consumed by rules in index.css. Idempotent — safe to call on every mount.
//
// Text size: normal + up to 4 bigger steps. Pressing Bigger at max wraps back
// to normal (same as Smaller); Smaller always resets to normal.
// Text spacing: letter/word-spacing levels 0–3; the press after max wraps to
// normal. Older {scaleIndex} prefs migrate forward automatically.
const STORAGE_KEY = 'eration_a11y';

export const TEXT_MAX_LEVEL = 4;
export const SPACING_MAX_LEVEL = 3;
export const LINE_MAX_LEVEL = 3;
export const SATURATE_MAX_LEVEL = 3;
const FONT_SCALES = [1, 1.125, 1.25, 1.375, 1.5]; // normal … +4 clicks
const DEFAULTS = { textLevel: 0, spacingLevel: 0, lineLevel: 0, saturateLevel: 0, contrast: false, links: false, images: false, adhd: false, invert: false, dyslexia: false };

const clampInt = (v, min, max, fb) => (Number.isInteger(v) ? Math.min(max, Math.max(min, v)) : fb);

// Factory defaults — used by the toolbar's Reset Settings button to revert
// every accessibility option in one click (persisted via applyA11y).
export function resetA11y() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode etc. — nothing persisted to clear.
  }
  return { ...DEFAULTS };
}

export function loadA11y() {
  let stored = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch {
    stored = {};
  }
  // Migrate pre-row-layout prefs: old scaleIndex 0..3 sat at
  // 0.875/1/1.125/1.25 of root size.
  if (stored.textLevel === undefined && Number.isInteger(stored.scaleIndex)) {
    const i = Math.min(3, Math.max(0, stored.scaleIndex));
    stored.textLevel = [0, 0, 1, 2][i];
  }
  delete stored.scaleIndex;
  return {
    ...DEFAULTS,
    ...stored,
    textLevel: clampInt(stored.textLevel, 0, TEXT_MAX_LEVEL, DEFAULTS.textLevel),
    spacingLevel: clampInt(stored.spacingLevel, 0, SPACING_MAX_LEVEL, DEFAULTS.spacingLevel),
    lineLevel: clampInt(stored.lineLevel, 0, LINE_MAX_LEVEL, DEFAULTS.lineLevel),
    saturateLevel: clampInt(stored.saturateLevel, 0, SATURATE_MAX_LEVEL, DEFAULTS.saturateLevel),
    adhd: !!stored.adhd,
    invert: !!stored.invert,
    dyslexia: !!stored.dyslexia,
  };
}

export function applyA11y(prefs) {
  const root = document.documentElement;
  const textLevel = clampInt(prefs.textLevel, 0, TEXT_MAX_LEVEL, DEFAULTS.textLevel);
  const spacingLevel = clampInt(prefs.spacingLevel, 0, SPACING_MAX_LEVEL, DEFAULTS.spacingLevel);
  const lineLevel = clampInt(prefs.lineLevel, 0, LINE_MAX_LEVEL, DEFAULTS.lineLevel);
  const saturateLevel = clampInt(prefs.saturateLevel, 0, SATURATE_MAX_LEVEL, DEFAULTS.saturateLevel);
  root.style.fontSize = `${FONT_SCALES[textLevel] * 100}%`;
  root.classList.toggle('a11y-high-contrast', !!prefs.contrast);
  root.classList.toggle('a11y-highlight-links', !!prefs.links);
  root.classList.toggle('a11y-hide-images', !!prefs.images);
  root.classList.toggle('a11y-adhd', !!prefs.adhd);
  root.classList.toggle('a11y-invert', !!prefs.invert);
  root.classList.toggle('a11y-dyslexia', !!prefs.dyslexia);
  root.classList.remove('a11y-spacing-1', 'a11y-spacing-2', 'a11y-spacing-3');
  if (spacingLevel > 0) root.classList.add(`a11y-spacing-${spacingLevel}`);
  root.classList.remove('a11y-line-1', 'a11y-line-2', 'a11y-line-3');
  if (lineLevel > 0) root.classList.add(`a11y-line-${lineLevel}`);
  root.classList.remove('a11y-saturate-low', 'a11y-saturate-high', 'a11y-saturate-desaturate');
  if (saturateLevel === 1) root.classList.add('a11y-saturate-low');
  if (saturateLevel === 2) root.classList.add('a11y-saturate-high');
  if (saturateLevel === 3) root.classList.add('a11y-saturate-desaturate');
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, textLevel, spacingLevel, lineLevel, saturateLevel, adhd: !!prefs.adhd, invert: !!prefs.invert, dyslexia: !!prefs.dyslexia }));
  } catch {
    // Private mode etc. — prefs simply don't persist.
  }
}
