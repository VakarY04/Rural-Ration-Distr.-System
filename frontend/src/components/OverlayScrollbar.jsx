import { useEffect, useRef, useState } from 'react';

// Global overlay scrollbar — mounted ONCE in App.jsx, serves every route.
// A thin thumb floats fixed at the viewport's right edge OVER the page (never
// reserves layout space, so content can never shift). Native scrollbars are
// fully suppressed in index.css; all real scrolling stays native (wheel,
// touchpad, keyboard, PgUp/PgDn, Home/End, touch) — this component is only
// a visibility-synced indicator + draggable thumb.
//
// Show triggers: cursor in the right-edge zone, active scrolling, dragging.
// Hide: ~150ms after the cursor leaves the zone with no scroll/drag activity.
const EDGE_PX = 28;
const HIDE_DELAY_MS = 150;
const MIN_THUMB_PX = 48;

export default function OverlayScrollbar() {
  const thumbRef = useRef(null);
  const [shown, setShown] = useState(false);
  // Mutable session state lives in a ref: geometry is painted straight to the
  // DOM (no React re-render per scroll frame); state is only visibility.
  const st = useRef({ scroller: null, timer: null, dragging: null });

  useEffect(() => {
    const thumb = thumbRef.current;
    if (!thumb) return undefined;

    const pickScroller = () => {
      const s = st.current.scroller;
      if (s && s.isConnected) return s;
      return document.scrollingElement || document.documentElement;
    };

    // Returns false when there is nothing to scroll (overlay stays hidden).
    const paint = () => {
      const el = pickScroller();
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 1) return false;
      st.current.scroller = el;
      const trackH = window.innerHeight;
      const h = Math.max(MIN_THUMB_PX, (el.clientHeight / el.scrollHeight) * trackH);
      const top = (el.scrollTop / max) * (trackH - h);
      thumb.style.height = `${h}px`;
      thumb.style.transform = `translateY(${top}px)`;
      return true;
    };

    const show = () => {
      if (paint()) setShown(true);
      clearTimeout(st.current.timer);
    };

    const scheduleHide = () => {
      clearTimeout(st.current.timer);
      st.current.timer = setTimeout(() => {
        if (!st.current.dragging) setShown(false);
      }, HIDE_DELAY_MS);
    };

    const onScroll = (e) => {
      const t = e.target;
      // Track whichever element is actually scrolling (dashboard/console
      // mains, or the document on body-scrolled pages) so drag follows it.
      if (t && t !== document && t.scrollHeight > t.clientHeight + 1) {
        st.current.scroller = t;
      }
      if (paint()) {
        setShown(true);
        scheduleHide();
      }
    };

    const onMove = (e) => {
      if (window.innerWidth - e.clientX <= EDGE_PX) show();
      else scheduleHide();
    };

    const onResize = () => paint();

    const onDown = (e) => {
      const el = pickScroller();
      if (el.scrollHeight - el.clientHeight <= 1) return;
      e.preventDefault();
      const startY = e.clientY;
      const startTop = el.scrollTop;
      const range = el.scrollHeight - el.clientHeight;
      const travel = Math.max(1, window.innerHeight - thumb.getBoundingClientRect().height);
      st.current.dragging = true;
      clearTimeout(st.current.timer);
      const onPointerMove = (ev) => {
        el.scrollTop = startTop + ((ev.clientY - startY) * range) / travel;
      };
      const onPointerUp = () => {
        st.current.dragging = false;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        scheduleHide();
      };
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    thumb.addEventListener('pointerdown', onDown);
    paint();

    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      thumb.removeEventListener('pointerdown', onDown);
      clearTimeout(st.current.timer);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-y-0 right-0 z-[70] w-[10px]">
      <div
        ref={thumbRef}
        className={`overlay-scroll-thumb pointer-events-auto mx-auto w-[6px] cursor-pointer touch-none rounded-full bg-slate-500/70 transition-opacity duration-150 hover:bg-slate-700 ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ height: MIN_THUMB_PX }}
      />
    </div>
  );
}
