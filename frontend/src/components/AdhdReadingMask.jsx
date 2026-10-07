// ADHD reading mask — myScheme / UX4G-govt behaviour.
//
// When the toolbar's ADHD Mode is on (`<html class="a11y-adhd">`, toggled by
// utils/a11y.js), the whole page is dimmed and only a horizontal band around
// the cursor stays fully clear, edge-to-edge. The band follows pointer, touch
// and keyboard focus vertically.
//
// Dimensions are the UX4G government widget values (cdn.ux4g.gov.in — the
// same accessibility widget that powers myScheme.gov.in):
//   clear band  ±80px around the cursor  → 160px tall, full viewport width
//   6px guide bars  →  top #6f339d, bottom #11298b
//   shade  →  rgba(0,0,0,0.7) with multiply blend, pointer-events none.
// See .a11y-reading-mask in index.css.
import { useEffect, useState } from 'react';

export default function AdhdReadingMask() {
  const [active, setActive] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('a11y-adhd')
  );
  const [y, setY] = useState(
    () => (typeof window !== 'undefined' ? window.innerHeight / 2 : 400)
  );

  // The toolbar owns the pref; this overlay only mirrors the <html> class so
  // it works on every route even though the toolbar remounts per page.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setActive(root.classList.contains('a11y-adhd'));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', sync);
    return () => {
      obs.disconnect();
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Follow the cursor vertically while active. pointermove covers mouse +
  // touch-drag; touchmove covers older mobile browsers; focusin keeps the
  // band on the focused control for keyboard-only users.
  useEffect(() => {
    if (!active) return undefined;
    const move = (e) => {
      const cy =
        typeof e.clientY === 'number'
          ? e.clientY
          : e.touches?.[0]?.clientY;
      if (typeof cy === 'number' && Number.isFinite(cy)) setY(cy);
    };
    const followFocus = (e) => {
      const r = e.target?.getBoundingClientRect?.();
      if (r) setY(r.top + r.height / 2);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    document.addEventListener('focusin', followFocus);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('touchmove', move);
      document.removeEventListener('focusin', followFocus);
    };
  }, [active]);

  if (!active) return null;
  return <div aria-hidden="true" className="a11y-reading-mask" style={{ '--y': `${y}px` }} />;
}
