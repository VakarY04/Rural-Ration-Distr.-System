import { useEffect, useRef, useState } from 'react';
import { GripVertical, X } from 'lucide-react';
import { loadA11y, applyA11y, A11Y_MIN_INDEX, A11Y_MAX_INDEX, A11Y_DEFAULT_INDEX } from '../utils/a11y';

// Edge-docked accessibility widget (GIGW A). A small half-circle tab sits
// attached to the left or right viewport edge; hover peeks it out, click
// opens the full panel, and dragging the tab/handle moves it anywhere — on
// release it snaps to the nearest edge. Position persists in localStorage.
// Prefs themselves live in utils/a11y.js and apply globally on every mount.
const DOCK_KEY = 'eration_a11y_dock';
const TAB_R = 22; // half of the 44px tab stays on-screen when collapsed
const PEEK_R = 8;
const TOP_MIN = 72;
const BOTTOM_PAD = 180;

const loadDock = () => {
  try {
    const raw = localStorage.getItem(DOCK_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.edge === 'left' || d.edge === 'right') return d;
    }
  } catch {
    // ignore — fall through to defaults
  }
  return { edge: 'right', y: 120 };
};

const clampY = (y) => Math.min(Math.max(y, TOP_MIN), Math.max(TOP_MIN, window.innerHeight - BOTTOM_PAD));

export default function AccessibilityToolbar({ className = '' }) {
  const [prefs, setPrefs] = useState(loadA11y);
  const [dock, setDock] = useState(loadDock);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);

  useEffect(() => {
    applyA11y(prefs);
  }, [prefs]);

  // Persist dock position (edge + height) across reloads and routes.
  useEffect(() => {
    try {
      localStorage.setItem(DOCK_KEY, JSON.stringify(dock));
    } catch {
      // Private mode etc. — position simply doesn't persist.
    }
  }, [dock]);

  const set = (patch) => setPrefs((p) => ({ ...p, ...patch }));
  const onRight = dock.edge === 'right';

  // Drag the tab (collapsed) or grip header (expanded) anywhere vertically;
  // release snaps to the nearest edge. A press without movement = click.
  // Text selection is locked for the whole page mid-drag so nothing highlights.
  const beginDrag = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    drag.current = { startY: e.clientY, baseY: dock.y, moved: false };
    document.body.style.userSelect = 'none';
    const onMove = (ev) => {
      const d = drag.current;
      if (!d) return;
      if (Math.abs(ev.clientY - d.startY) > 5) {
        d.moved = true;
        setDragging(true);
      }
      if (d.moved) {
        setDock({
          edge: ev.clientX > window.innerWidth / 2 ? 'right' : 'left',
          y: clampY(d.baseY + (ev.clientY - d.startY)),
        });
      }
    };
    const onUp = () => {
      const wasDrag = drag.current?.moved;
      drag.current = null;
      setDragging(false);
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (!wasDrag) setOpen((v) => !v);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const tBtn =
    'px-2 py-1.5 text-[11px] font-bold leading-none rounded transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-900 disabled:opacity-40';
  const off = 'text-white hover:bg-white/20';
  const on = 'bg-white text-slate-900';
  const rowBtn = (active) =>
    `w-full px-2 py-2 text-[11px] font-bold rounded transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-900 ${active ? on : off}`;

  const edgeStyle = onRight ? { right: 0 } : { left: 0 };

  return (
    <div
      className={`fixed z-[80] ${className}`}
      style={{ top: dock.y, ...edgeStyle }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      {!open ? (
        // Collapsed half-circle tab: half hidden off-edge, peeks on hover.
        <button
          type="button"
          onPointerDown={beginDrag}
          title="Accessibility options — click to open, drag to move"
          aria-label="Accessibility options — click to open, drag to move"
          aria-expanded="false"
          className={`w-11 h-11 text-white bg-[#FF9933] hover:bg-[#e68a00] shadow-lg flex items-center cursor-grab active:cursor-grabbing select-none touch-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-all duration-150 ${
            onRight
              ? 'rounded-l-full justify-start pl-2 -mr-[22px] hover:-mr-[8px]'
              : 'rounded-r-full justify-end pr-2 -ml-[22px] hover:-ml-[8px]'
          } ${dragging ? 'transition-none' : ''}`}
        >
          <span aria-hidden="true" className="text-lg font-extrabold leading-none">A</span>
        </button>
      ) : (
        // Expanded panel pinned just inside the docked edge — same saffron
        // as the tab, with text selection locked so dragging never highlights.
        <div
          role="toolbar"
          aria-label="Accessibility options"
          className={`w-40 rounded-2xl bg-[#FF9933] text-white shadow-xl p-2 space-y-1.5 select-none ${
            onRight ? 'mr-2' : 'ml-2'
          }`}
        >
          <div
            className="flex items-center gap-1 px-1 pt-0.5 cursor-grab active:cursor-grabbing select-none touch-none"
            onPointerDown={beginDrag}
            title="Drag to move — release to stick to an edge"
          >
            <GripVertical size={14} className="text-white/70 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              Access
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              title="Collapse accessibility panel"
              aria-label="Collapse accessibility panel"
              className="text-white hover:bg-white/20 p-1 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 rounded"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="Text size">
            <button type="button" className={`${tBtn} flex-1 ${off}`} title="Decrease text size" aria-label="Decrease text size"
              disabled={prefs.scaleIndex <= A11Y_MIN_INDEX}
              onClick={() => set({ scaleIndex: Math.max(A11Y_MIN_INDEX, prefs.scaleIndex - 1) })}>
              A−
            </button>
            <button type="button" className={`${tBtn} flex-1 ${off}`} title="Reset text size" aria-label="Reset text size"
              onClick={() => set({ scaleIndex: A11Y_DEFAULT_INDEX })}>
              A
            </button>
            <button type="button" className={`${tBtn} flex-1 ${off}`} title="Increase text size" aria-label="Increase text size"
              disabled={prefs.scaleIndex >= A11Y_MAX_INDEX}
              onClick={() => set({ scaleIndex: Math.min(A11Y_MAX_INDEX, prefs.scaleIndex + 1) })}>
              A+
            </button>
          </div>
          <div className="flex flex-col gap-1" role="group" aria-label="Display modes">
            <button type="button" className={rowBtn(prefs.contrast)} title="High contrast text"
              aria-label="High contrast text" aria-pressed={prefs.contrast}
              onClick={() => set({ contrast: !prefs.contrast })}>
              Contrast
            </button>
            <button type="button" className={rowBtn(prefs.links)} title="Highlight links"
              aria-label="Highlight links" aria-pressed={prefs.links}
              onClick={() => set({ links: !prefs.links })}>
              Links
            </button>
            <button type="button" className={rowBtn(prefs.images)} title="Hide images"
              aria-label="Hide images" aria-pressed={prefs.images}
              onClick={() => set({ images: !prefs.images })}>
              Images
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Re-exported geometry for tests or future use.
export const A11Y_TAB_OFFSET = TAB_R;
export const A11Y_TAB_PEEK = PEEK_R;
