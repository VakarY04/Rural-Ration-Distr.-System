import { useCallback, useEffect, useRef } from 'react';

const EDITABLE = 'input, select, textarea, [contenteditable="true"]';

// Arrow-key navigation inside a grouped set of controls (Phase 1 extension).
// Usage: const navRef = useArrowNav('horizontal'); <nav ref={navRef}> with
// `data-arrow-item` on each member control.
//
// - orientation 'horizontal': Left/Right; 'vertical': Up/Down; 'both': all four.
// - Home/End jump to first/last. Wraps around at the ends.
// - Focus moves ONLY — Enter/Space still activate natively, so browsing the
//   group never triggers an action by accident.
// - Never hijacks keystrokes from text fields, selects or textareas (arrows
//   edit text and open native dropdowns there).
// - The item list is queried live per keypress, so rows that mount/unmount
//   (confirm dialogs, filters) just work. Hidden items are skipped.
export function useArrowNav(orientation = 'both', itemSelector = '[data-arrow-item]') {
  const opts = useRef({ orientation, itemSelector });
  useEffect(() => {
    opts.current = { orientation, itemSelector };
  }, [orientation, itemSelector]);
  const nodeRef = useRef(null);

  function onKeyDown(e) {
    const { orientation: o, itemSelector: sel } = opts.current;
    const { key } = e;
    const wantPrev =
      (key === 'ArrowLeft' && o !== 'vertical') || (key === 'ArrowUp' && o !== 'horizontal');
    const wantNext =
      (key === 'ArrowRight' && o !== 'vertical') || (key === 'ArrowDown' && o !== 'horizontal');
    const wantFirst = key === 'Home';
    const wantLast = key === 'End';
    if (!wantPrev && !wantNext && !wantFirst && !wantLast) return;

    const container = nodeRef.current;
    const active = document.activeElement;
    if (!container || !active || !container.contains(active)) return;
    if (active.closest(EDITABLE)) return;

    const items = [...container.querySelectorAll(sel)].filter(
      (n) => !n.disabled && n.getClientRects().length > 0
    );
    if (items.length < 2) return;

    let index = items.indexOf(active.closest(sel));
    if (index === -1) index = wantPrev || wantLast ? items.length - 1 : 0;
    else if (wantPrev) index = (index - 1 + items.length) % items.length;
    else if (wantNext) index = (index + 1) % items.length;
    else if (wantFirst) index = 0;
    else if (wantLast) index = items.length - 1;

    e.preventDefault();
    items[index].focus();
  }

  const setRef = useCallback((node) => {
    if (nodeRef.current) nodeRef.current.removeEventListener('keydown', onKeyDown);
    nodeRef.current = node;
    if (node) node.addEventListener('keydown', onKeyDown);
  }, []);

  useEffect(
    () => () => {
      nodeRef.current?.removeEventListener('keydown', onKeyDown);
    },
    []
  );

  return setRef;
}
