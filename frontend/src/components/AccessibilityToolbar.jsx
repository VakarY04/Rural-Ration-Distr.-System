import { useEffect, useRef, useState } from 'react';
import { GripVertical, RotateCcw, X } from 'lucide-react';
import { loadA11y, applyA11y, resetA11y, TEXT_MAX_LEVEL, SPACING_MAX_LEVEL, LINE_MAX_LEVEL, SATURATE_MAX_LEVEL } from '../utils/a11y';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Edge-docked accessibility widget (GIGW A). A small half-circle tab sits
// attached to the left or right viewport edge; hover peeks it out, click
// opens the full panel, and dragging the tab/handle moves it anywhere — on
// release it snaps to the nearest edge. Position persists in localStorage.
// Prefs themselves live in utils/a11y.js and apply globally on every mount.
const DOCK_KEY = 'eration_a11y_dock';
const TAB_R = 27; // half of the 55px tab stays on-screen when collapsed
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

// NOTE: every size in this widget is px (never rem). The widget raises the
// root font size, so rem-based Tailwind utilities would make the widget
// itself grow on every Bigger-text click. px keeps it permanently fixed.
// Widget icon set — one consistent line style (24 grid, 1.8px stroke,
// square caps, currentColor) matching the citizen nav icons.
  function IconBase({ size = 22, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}
function BiggerIcon() {
  return (
    <IconBase>
      <circle cx="11" cy="11" r="6.5" />
      <line x1="16" y1="16" x2="20.5" y2="20.5" />
      <line x1="11" y1="8.5" x2="11" y2="13.5" />
      <line x1="8.5" y1="11" x2="13.5" y2="11" />
    </IconBase>
  );
}
function SmallerIcon() {
  return (
    <IconBase>
      <circle cx="11" cy="11" r="6.5" />
      <line x1="16" y1="16" x2="20.5" y2="20.5" />
      <line x1="8.5" y1="11" x2="13.5" y2="11" />
    </IconBase>
  );
}
function SpacingIcon() {
  return (
    <IconBase>
      <line x1="6" y1="4" x2="6" y2="20" />
      <line x1="18" y1="4" x2="18" y2="20" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <path d="M11 9.5L8.5 12l2.5 2.5M13 9.5l2.5 2.5-2.5 2.5" />
    </IconBase>
  );
}
function ContrastIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 5a7 7 0 0 0 0 14z" fill="currentColor" stroke="none" />
    </IconBase>
  );
}
function LinksIcon() {
  return (
    <IconBase>
      <path d="M10 14a4 4 0 0 0 6 0l2.5-2.5a4 4 0 0 0-5.5-5.5L11.5 7.5" />
      <path d="M14 10a4 4 0 0 0-6 0l-2.5 2.5a4 4 0 0 0 5.5 5.5l1.5-1.5" />
    </IconBase>
  );
}
function ImagesIcon() {
  return (
    <IconBase>
      <rect x="4" y="5" width="16" height="14" />
      <circle cx="9" cy="10" r="1.4" />
      <path d="M4 16.5l4.5-4 3.5 3 3-2.5 5 4" />
    </IconBase>
  );
}
function TranslateIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="7" />
      <ellipse cx="12" cy="12" rx="3.2" ry="7" />
      <line x1="5.2" y1="9.2" x2="18.8" y2="9.2" />
      <line x1="5.2" y1="14.8" x2="18.8" y2="14.8" />
    </IconBase>
  );
}
function LineHeightIcon() {
  return (
    <IconBase>
      <line x1="4" y1="6" x2="14.5" y2="6" />
      <line x1="4" y1="11" x2="14.5" y2="11" />
      <line x1="4" y1="16" x2="14.5" y2="16" />
      <line x1="18.5" y1="4.5" x2="18.5" y2="17.5" />
      <path d="M16.5 6.5l2-2 2 2M16.5 15.5l2 2 2-2" />
    </IconBase>
  );
}
function AdhdIcon() {
  return (
    <IconBase>
      <circle cx="10" cy="9" r="3.5" />
      <path d="M4.5 19.5c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
      <line x1="18.5" y1="4" x2="18.5" y2="8" />
      <line x1="16.5" y1="6" x2="20.5" y2="6" />
    </IconBase>
  );
}
function SaturateIcon() {
  return (
    <IconBase>
      <path d="M12 3.5c3.5 4.2 6 7.3 6 10.5a6 6 0 0 1-12 0C6 10.8 8.5 7.7 12 3.5z" />
      <path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" />
    </IconBase>
  );
}
function InvertIcon() {
  return (
    <IconBase>
      <rect x="5" y="5" width="14" height="14" />
      <path d="M12 5v14" />
      <path d="M12 5h7v14h-7z" fill="currentColor" stroke="none" />
    </IconBase>
  );
}
function DyslexiaIcon() {
  return (
    <IconBase>
      <path d="M8 4.5v15M8 4.5h6a7.5 7.5 0 0 1 0 15H8" />
    </IconBase>
  );
}
function BigCursorIcon() {
  return (
    <IconBase>
      <path d="M7 3.5l11 12-4.8.7-2.4 5.3z" />
      <line x1="14" y1="17" x2="18.5" y2="21.5" />
      <line x1="16" y1="21.8" x2="20" y2="17.8" />
    </IconBase>
  );
}
function NoAnimIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="7" />
      <line x1="7" y1="7" x2="9.5" y2="9.5" />
      <line x1="17" y1="7" x2="14.5" y2="9.5" />
      <line x1="9" y1="14.5" x2="15" y2="14.5" />
      <line x1="6.5" y1="6.5" x2="17.5" y2="17.5" />
    </IconBase>
  );
}
function MoonIcon() {
  return (
    <IconBase>
      <path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z" />
    </IconBase>
  );
}
function SunIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="3.5" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="20.5" />
      <line x1="3.5" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="20.5" y2="12" />
      <line x1="6" y1="6" x2="7.8" y2="7.8" />
      <line x1="16.2" y1="16.2" x2="18" y2="18" />
      <line x1="6" y1="18" x2="7.8" y2="16.2" />
      <line x1="16.2" y1="7.8" x2="18" y2="6" />
    </IconBase>
  );
}
// Standard accessibility stickman (head + outstretched arms + legs) for the
// collapsed edge tab. Extra-bold strokes so it reads at small sizes; navy on
// grey. Round caps suit the human figure.
function AccessStickman({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <circle cx="12" cy="4.6" r="2.2" fill="currentColor" stroke="none" />
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="12" y1="9" x2="12" y2="14.5" />
      <line x1="12" y1="14.5" x2="8" y2="20.5" />
      <line x1="12" y1="14.5" x2="16" y2="20.5" />
    </svg>
  );
}

export default function AccessibilityToolbar({ className = '' }) {
  const { t, lang, setLang } = useLanguage();
  const { dark, toggle: toggleTheme } = useTheme();
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

  // Text size: Bigger steps up to +4, pressing it at max wraps to normal
  // (same as Smaller); Smaller always resets to normal.
  const bigger = () =>
    set({ textLevel: prefs.textLevel >= TEXT_MAX_LEVEL ? 0 : prefs.textLevel + 1 });
  const smaller = () => set({ textLevel: 0 });
  // Text spacing: one cycling control, 0→1→2→3→0 (4th press back to normal).
  const cycleSpacing = () =>
    set({ spacingLevel: (prefs.spacingLevel + 1) % (SPACING_MAX_LEVEL + 1) });
  // Line spacing (GIGW "Line Height"): same 4-level cycle, 0→1→2→3→0.
  const lineLevel = prefs.lineLevel ?? 0;
  const cycleLine = () =>
    set({ lineLevel: (lineLevel + 1) % (LINE_MAX_LEVEL + 1) });
  // Saturation (UX4G/myScheme): normal → low → high → desaturate → normal.
  const saturateLevel = prefs.saturateLevel ?? 0;
  const cycleSaturate = () =>
    set({ saturateLevel: (saturateLevel + 1) % (SATURATE_MAX_LEVEL + 1) });
  const saturateKey = [
    'a11y.saturate',
    'a11y.saturateLow',
    'a11y.saturateHigh',
    'a11y.desaturate',
  ][saturateLevel] ?? 'a11y.saturate';
  // Bilingual toggle lives here now (removed from page headers): EN ↔ हिंदी.
  const isHi = lang === 'hi';
  const toggleLang = () => setLang(isHi ? 'en' : 'hi');

  // Fixed-size white buttons with black icons + black text; active shows a
  // blue border, level shows as blue pips. Hover fills the button inside
  // with light blue (#DBEAFE). Compact 92px height so all 14 buttons fit on
  // screen at once with no panel scrolling on normal viewports.
  const gridBtn = (active = false) =>
    `h-[92px] w-full flex flex-col items-center justify-center gap-[2px] px-[4px] py-[6px] rounded-[8px] bg-white dark:bg-slate-900 border ${active ? 'border-[#0D6EFD]' : 'border-slate-200 dark:border-slate-600'} text-black dark:text-slate-100 text-[12px] font-bold leading-tight text-center transition-colors cursor-pointer hover:bg-[#DBEAFE] dark:hover:bg-slate-700 hover:border-[#0D6EFD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[4px] focus-visible:outline-slate-900 disabled:opacity-40 disabled:cursor-not-allowed`;
  const iconBadge = () =>
    `w-[40px] h-[40px] rounded-[8px] text-black dark:text-slate-100 flex items-center justify-center shrink-0`;
  const pipRow = (filled, total) => (
    <span aria-hidden="true" className="flex items-center gap-[4px]">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`w-[16px] h-[4px] rounded-full ${i < filled ? 'bg-[#0D6EFD]' : 'bg-slate-300 dark:bg-slate-600'}`} />
      ))}
    </span>
  );

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

  const edgeStyle = onRight ? { right: 0 } : { left: 0 };
  const panelRef = useRef(null);

  // Keep every button reachable without scrolling: once the panel opens (or
  // the viewport resizes under it), nudge the dock up just enough that the
  // whole panel fits on screen. Only applies when it CAN fit — very short
  // viewports keep the max-h + internal-scroll fallback below.
  useEffect(() => {
    if (!open || dragging) return undefined;
    const fit = () => {
      const el = panelRef.current;
      if (!el) return;
      const h = el.scrollHeight;
      const space = window.innerHeight - TOP_MIN - 12;
      if (h > space) return;
      const maxTop = window.innerHeight - h - 12;
      setDock((d) => (d.y > maxTop ? { ...d, y: Math.max(TOP_MIN, maxTop) } : d));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [open, dragging, dock.y]);

  return (
    <div
      className={`a11y-widget fixed z-[2000] ${className}`}
      style={{ top: dock.y, ...edgeStyle }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      {!open ? (
        // Collapsed tab: grey circle with the bold stickman, half hidden
        // off-edge. Hovering (or keyboard focus) slides out a ribbon carrying
        // the full "Accessibility Options" name; clicking opens the widget.
        <div
          className={`group flex items-center transition-all duration-150 ${
            onRight ? 'flex-row -mr-[27px] hover:mr-0' : 'flex-row-reverse -ml-[27px] hover:ml-0'
          } ${dragging ? 'transition-none' : ''}`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none overflow-hidden whitespace-nowrap bg-slate-800 text-white text-[13px] font-bold rounded-full py-[10px] px-0 max-w-0 opacity-0 transition-all duration-150 group-hover:max-w-[240px] group-hover:opacity-100 group-hover:px-[14px] group-hover:mx-[6px] group-focus-within:max-w-[240px] group-focus-within:opacity-100 group-focus-within:px-[14px] group-focus-within:mx-[6px]"
          >
            {t('a11y.shortLabel')}
          </span>
          <button
            type="button"
            onPointerDown={beginDrag}
            title={t('a11y.options')}
            aria-label={t('a11y.options')}
            aria-expanded="false"
            className="w-[55px] h-[55px] rounded-full text-slate-900 bg-slate-200 hover:bg-slate-300 border border-slate-300 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[4px] focus-visible:outline-slate-900 transition-colors duration-150"
          >
            <span aria-hidden="true" className="w-[38px] h-[38px] rounded-full bg-slate-300 text-[#000080] flex items-center justify-center shrink-0"><AccessStickman /></span>
          </button>
        </div>
      ) : (
        // Expanded panel pinned just inside the docked edge — grey card with
        // text selection locked so dragging never highlights.
        // No section partitions: one uniform 3-column grid of all 15
        // controls. The navy header carries the full "Accessibility Options"
        // name. Every button carries icon + label per GIGW §6.2.
        <div
          ref={panelRef}
          role="toolbar"
          aria-label={t('a11y.options')}
          className={`w-[375px] rounded-[16px] bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 shadow-xl p-[12px] space-y-[6px] select-none max-h-[calc(100vh-24px)] overflow-y-auto ${
            onRight ? 'mr-2' : 'ml-2'
          }`}
        >
          <div
            className="flex items-center gap-[8px] px-[12px] py-[10px] rounded-[10px] bg-[#000080] text-white cursor-grab active:cursor-grabbing select-none touch-none"
            onPointerDown={beginDrag}
            title={t('a11y.options')}
          >
            <GripVertical size={20} className="text-white/70 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-[16px] font-extrabold tracking-wide">
              {t('a11y.shortLabel')}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              title={t('a11y.collapse')}
              aria-label={t('a11y.collapse')}
              className="text-white hover:bg-white/20 p-[4px] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[4px] focus-visible:outline-white rounded"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-[8px]" role="group" aria-label={t('a11y.options')}>
            <button type="button" className={gridBtn(prefs.textLevel > 0)}
              title={t('a11y.bigger')} aria-label={t('a11y.bigger')}
              onClick={bigger}>
              <span aria-hidden="true" className={iconBadge()}><BiggerIcon /></span>
              <span>{t('a11y.bigger')}</span>
              {pipRow(prefs.textLevel, TEXT_MAX_LEVEL)}
            </button>
            <button type="button" className={gridBtn(false)}
              title={t('a11y.smaller')} aria-label={t('a11y.smaller')}
              disabled={prefs.textLevel === 0}
              onClick={smaller}>
              <span aria-hidden="true" className={iconBadge(false)}><SmallerIcon /></span>
              <span>{t('a11y.smaller')}</span>
              {pipRow(prefs.textLevel === 0 ? 1 : 0, 1)}
            </button>
            <button type="button" className={gridBtn(prefs.spacingLevel > 0)}
              title={t('a11y.spacing')} aria-label={t('a11y.spacing')}
              onClick={cycleSpacing}>
              <span aria-hidden="true" className={iconBadge()}><SpacingIcon /></span>
              <span>{t('a11y.spacing')}</span>
              {pipRow(prefs.spacingLevel, SPACING_MAX_LEVEL)}
            </button>
            <button type="button" className={gridBtn(prefs.contrast)} title={t('a11y.contrast')}
              aria-label={t('a11y.contrast')} aria-pressed={prefs.contrast}
              onClick={() => set({ contrast: !prefs.contrast })}>
              <span aria-hidden="true" className={iconBadge()}><ContrastIcon /></span>
              <span>{t('a11y.contrast')}</span>
              {pipRow(prefs.contrast ? 1 : 0, 1)}
            </button>
            <button type="button" className={gridBtn(prefs.links)} title={t('a11y.links')}
              aria-label={t('a11y.links')} aria-pressed={prefs.links}
              onClick={() => set({ links: !prefs.links })}>
              <span aria-hidden="true" className={iconBadge()}><LinksIcon /></span>
              <span>{t('a11y.links')}</span>
              {pipRow(prefs.links ? 1 : 0, 1)}
            </button>
            <button type="button" className={gridBtn(prefs.images)} title={t('a11y.images')}
              aria-label={t('a11y.images')} aria-pressed={prefs.images}
              onClick={() => set({ images: !prefs.images })}>
              <span aria-hidden="true" className={iconBadge()}><ImagesIcon /></span>
              <span>{t('a11y.images')}</span>
              {pipRow(prefs.images ? 1 : 0, 1)}
            </button>
            <button type="button" className={gridBtn(isHi)} title={t('a11y.translate')}
              aria-label={t('a11y.translate')} aria-pressed={isHi}
              onClick={toggleLang}>
              <span aria-hidden="true" className={iconBadge()}><TranslateIcon /></span>
              <span>{t('a11y.translate')}</span>
              {pipRow(isHi ? 1 : 0, 1)}
            </button>
            <button type="button" className={gridBtn(lineLevel > 0)}
              title={t('a11y.lineHeight')} aria-label={t('a11y.lineHeight')}
              onClick={cycleLine}>
              <span aria-hidden="true" className={iconBadge()}><LineHeightIcon /></span>
              <span>{t('a11y.lineHeight')}</span>
              {pipRow(lineLevel, LINE_MAX_LEVEL)}
            </button>
            <button type="button" className={gridBtn(!!prefs.adhd)} title={t('a11y.adhd')}
              aria-label={t('a11y.adhd')} aria-pressed={!!prefs.adhd}
              onClick={() => set({ adhd: !prefs.adhd })}>
              <span aria-hidden="true" className={iconBadge()}><AdhdIcon /></span>
              <span>{t('a11y.adhd')}</span>
              {pipRow(prefs.adhd ? 1 : 0, 1)}
            </button>
            <button type="button" className={gridBtn(saturateLevel > 0)}
              title={t(saturateKey)} aria-label={t(saturateKey)}
              onClick={cycleSaturate}>
              <span aria-hidden="true" className={iconBadge()}><SaturateIcon /></span>
              <span>{t(saturateKey)}</span>
              {pipRow(saturateLevel, SATURATE_MAX_LEVEL)}
            </button>
            <button type="button" className={gridBtn(!!prefs.invert)} title={t('a11y.invert')}
              aria-label={t('a11y.invert')} aria-pressed={!!prefs.invert}
              onClick={() => set({ invert: !prefs.invert })}>
              <span aria-hidden="true" className={iconBadge()}><InvertIcon /></span>
              <span>{t('a11y.invert')}</span>
              {pipRow(prefs.invert ? 1 : 0, 1)}
            </button>
            <button type="button" className={gridBtn(!!prefs.dyslexia)} title={t('a11y.dyslexia')}
              aria-label={t('a11y.dyslexia')} aria-pressed={!!prefs.dyslexia}
              onClick={() => set({ dyslexia: !prefs.dyslexia })}>
              <span aria-hidden="true" className={iconBadge()}><DyslexiaIcon /></span>
              <span>{t('a11y.dyslexia')}</span>
              {pipRow(prefs.dyslexia ? 1 : 0, 1)}
            </button>
            <button type="button" className={gridBtn(!!prefs.bigCursor)} title={t('a11y.bigCursor')}
              aria-label={t('a11y.bigCursor')} aria-pressed={!!prefs.bigCursor}
              onClick={() => set({ bigCursor: !prefs.bigCursor })}>
              <span aria-hidden="true" className={iconBadge()}><BigCursorIcon /></span>
              <span>{t('a11y.bigCursor')}</span>
              {pipRow(prefs.bigCursor ? 1 : 0, 1)}
            </button>
            <button type="button" className={gridBtn(!!prefs.noAnim)} title={t('a11y.noAnim')}
              aria-label={t('a11y.noAnim')} aria-pressed={!!prefs.noAnim}
              onClick={() => set({ noAnim: !prefs.noAnim })}>
              <span aria-hidden="true" className={iconBadge()}><NoAnimIcon /></span>
              <span>{t('a11y.noAnim')}</span>
              {pipRow(prefs.noAnim ? 1 : 0, 1)}
            </button>
            <button type="button" className={gridBtn(dark)} title={dark ? t('theme.switchLight') : t('theme.switchDark')}
              aria-label={dark ? t('theme.switchLight') : t('theme.switchDark')} aria-pressed={dark}
              onClick={toggleTheme}>
              <span aria-hidden="true" className={iconBadge()}>{dark ? <SunIcon /> : <MoonIcon />}</span>
              <span>{t('a11y.darkMode')}</span>
              {pipRow(dark ? 1 : 0, 1)}
            </button>
          </div>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-[8px] px-[12px] py-[10px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-black dark:text-slate-100 text-[13px] font-bold transition-colors cursor-pointer hover:bg-[#DBEAFE] dark:hover:bg-slate-700 hover:border-[#0D6EFD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[4px] focus-visible:outline-slate-900"
            title={t('a11y.reset')}
            aria-label={t('a11y.reset')}
            onClick={() => setPrefs(resetA11y())}
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>{t('a11y.reset')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Re-exported geometry for tests or future use.
export const A11Y_TAB_OFFSET = TAB_R;
export const A11Y_TAB_PEEK = PEEK_R;
