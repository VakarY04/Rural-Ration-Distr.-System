import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  HERO_BADGE_BOX,
  HERO_BADGE_TITLE,
  FEATURE_CARD_BOX,
  FEATURE_CARD_HEADING,
  FEATURE_CARD_TEXT,
  TRUST_FOOTER_TEXT,
} from './landingStyles';

gsap.registerPlugin(ScrollTrigger);

const bidirectional = (trigger, start, end, scroller) => ({
  trigger,
  start,
  end,
  scroller,
  toggleActions: 'play reverse play reverse',
});

// Two-layer contract (translation must never disturb motion):
//   Layer A — container motion (badge boxes, cards, gradient line, trust
//     panel). Mounted ONCE per page mount, never rebuilt on translation.
//   Layer B — split-text motion. Re-split per language on the freshly
//     remounted translated DOM (key={lang} in LandingPage), but tweens are
//     built ONLY on a genuine first mount — translation/font runs leave text
//     naturally visible so the toggle never flashes, replays, or stalls.
// StrictMode-safe: mount is detected as "first EVER run, or same inputs as
// the last run" (StrictMode double-invokes mount effects with identical
// inputs; a real toggle/font-swap always changes inputs).
export function useLandingAnimations() {
  const { lang } = useLanguage();
  // Devanagari shaping breaks when SplitType splits per-character (matras and
  // conjuncts detach), so in Hindi we animate per-word only. Latin keeps the
  // original per-character effect.
  const isHi = lang === 'hi';
  const mainContainerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const brandTitleRef = useRef(null);
  const brandSubRef = useRef(null);
  const sloganRef = useRef(null);
  const gradientLineRef = useRef(null);
  const descRef = useRef(null);
  const badgesContainerRef = useRef(null);
  const cardsGridRef = useRef(null);
  const trustFooterRef = useRef(null);
  const lastTextInputs = useRef(null);

  // Webfont backstop: the Devanagari woff2 loads lazily on first Hindi paint,
  // AFTER the first split/measure pass. The text layer re-splits once fonts
  // settle so line breaks use true font metrics (containers only need the
  // ScrollTrigger.refresh() at the end of layer B).
  const [fontsTick, setFontsTick] = useState(0);
  useEffect(() => {
    if (!document.fonts?.ready) return undefined;
    let live = true;
    document.fonts.ready.then(() => {
      if (live) setFontsTick((n) => n + 1);
    });
    return () => {
      live = false;
    };
  }, [lang]);

  // ── Layer A: containers, once per mount ──────────────────────────────────
  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return undefined;

    const ctx = gsap.context(() => {
      if (badgesContainerRef.current) {
        const badgeBoxes = badgesContainerRef.current.querySelectorAll(`.${HERO_BADGE_BOX}`);
        gsap.fromTo(
          badgeBoxes,
          { opacity: 0, y: 40, scale: 0.9, rotateX: 15 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.9,
            stagger: { amount: 0.3, from: 'center' },
            ease: 'power3.out',
            scrollTrigger: bidirectional(badgesContainerRef.current, 'top 92%', 'bottom 10%', scroller),
          }
        );
      }

      if (cardsGridRef.current) {
        const cards = cardsGridRef.current.querySelectorAll(`.${FEATURE_CARD_BOX}`);
        gsap.fromTo(
          cards,
          { opacity: 0, y: 70, scale: 0.93, rotateY: 8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateY: 0,
            duration: 1.1,
            stagger: { amount: 0.4, from: 'center' },
            ease: 'power3.out',
            scrollTrigger: bidirectional(cardsGridRef.current, 'top 85%', 'bottom 15%', scroller),
          }
        );
      }

      if (gradientLineRef.current) {
        gsap.fromTo(
          gradientLineRef.current,
          { width: '0rem', opacity: 0, scaleX: 0 },
          {
            width: '14rem',
            opacity: 1,
            scaleX: 1,
            transformOrigin: 'center center',
            duration: 1.2,
            ease: 'power4.out',
            scrollTrigger: bidirectional(sloganRef.current, 'top 85%', 'bottom 10%', scroller),
          }
        );
      }

      if (trustFooterRef.current) {
        gsap.fromTo(
          trustFooterRef.current,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: bidirectional(trustFooterRef.current, 'top 95%', 'bottom top', scroller),
          }
        );
      }
    }, mainContainerRef);

    return () => ctx.revert();
  }, []);

  // ── Layer B: split text, per language ────────────────────────────────────
  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return undefined;

    // Genuine first mount (or StrictMode's identical second pass) builds the
    // scroll-driven text tweens. Translation / font-swap runs only re-split
    // the fresh text and leave it visible — no flash, no replay, no stall.
    const prev = lastTextInputs.current;
    const full = prev === null || (prev.lang === lang && prev.fontsTick === fontsTick);
    lastTextInputs.current = { lang, fontsTick };

    // SplitType mutates the DOM outside gsap.context's tracking, so every
    // instance is reverted in cleanup — otherwise re-runs split already-split
    // markup and corrupt it.
    const splitEls = [];
    const trackSplit = (el, opts) => {
      const s = new SplitType(el, opts);
      splitEls.push(s);
      return s;
    };
    const animate = (targets, fromVars, toVars) => {
      if (full) gsap.fromTo(targets, fromVars, toVars);
    };

    const ctx = gsap.context(() => {
      if (brandTitleRef.current) {
        const titleSplit = trackSplit(brandTitleRef.current, { types: isHi ? 'words' : 'chars' });
        animate(
          isHi ? titleSplit.words : titleSplit.chars,
          { opacity: 0, y: 25, rotateX: -90 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: { amount: 0.4, from: 'center' },
            ease: 'power3.out',
            scrollTrigger: bidirectional(brandTitleRef.current, 'top 95%', 'bottom top', scroller),
          }
        );
      }

      if (brandSubRef.current) {
        const subSplit = trackSplit(brandSubRef.current, { types: 'words' });
        animate(
          subSplit.words,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: { amount: 0.3, from: 'center' },
            ease: 'power2.out',
            scrollTrigger: bidirectional(brandSubRef.current, 'top 95%', 'bottom top', scroller),
          }
        );
      }

      if (sloganRef.current) {
        const sloganSplit = trackSplit(sloganRef.current, { types: isHi ? 'lines, words' : 'lines, words, chars' });
        animate(
          isHi ? sloganSplit.words : sloganSplit.chars,
          { opacity: 0, y: 50, rotateX: -80, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 1,
            stagger: { amount: 0.7, from: 'center' },
            ease: 'back.out(1.5)',
            scrollTrigger: bidirectional(sloganRef.current, 'top 85%', 'bottom 10%', scroller),
          }
        );
      }

      if (descRef.current) {
        const descSplit = trackSplit(descRef.current, { types: 'lines, words' });
        animate(
          descSplit.words,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: { amount: 0.4, from: 'center' },
            ease: 'power2.out',
            scrollTrigger: bidirectional(descRef.current, 'top 90%', 'bottom 10%', scroller),
          }
        );
      }

      if (badgesContainerRef.current) {
        const badgeTitles = badgesContainerRef.current.querySelectorAll(`.${HERO_BADGE_TITLE}`);
        badgeTitles.forEach((el) => {
          const split = trackSplit(el, { types: isHi ? 'words' : 'chars' });
          animate(
            isHi ? split.words : split.chars,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: { amount: 0.2, from: 'center' },
              ease: 'power1.out',
              scrollTrigger: bidirectional(el, 'top 92%', 'bottom 10%', scroller),
            }
          );
        });
      }

      if (cardsGridRef.current) {
        const cardHeadings = cardsGridRef.current.querySelectorAll(`.${FEATURE_CARD_HEADING}`);
        cardHeadings.forEach((heading) => {
          const hSplit = trackSplit(heading, { types: isHi ? 'words' : 'chars, words' });
          animate(
            isHi ? hSplit.words : hSplit.chars,
            { opacity: 0, y: 20, rotateX: -90 },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.7,
              stagger: { amount: 0.3, from: 'center' },
              ease: 'back.out(1.2)',
              scrollTrigger: bidirectional(heading, 'top 88%', 'bottom 15%', scroller),
            }
          );
        });

        const cardTexts = cardsGridRef.current.querySelectorAll(`.${FEATURE_CARD_TEXT}`);
        cardTexts.forEach((text) => {
          const tSplit = trackSplit(text, { types: 'words, lines' });
          animate(
            tSplit.words,
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: { amount: 0.3, from: 'center' },
              ease: 'power1.out',
              scrollTrigger: bidirectional(text, 'top 88%', 'bottom 15%', scroller),
            }
          );
        });
      }

      if (trustFooterRef.current) {
        const trustText = trustFooterRef.current.querySelector(`.${TRUST_FOOTER_TEXT}`);
        if (trustText) {
          const trustSplit = trackSplit(trustText, { types: isHi ? 'words' : 'words, chars' });
          animate(
            isHi ? trustSplit.words : trustSplit.chars,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: { amount: 0.4, from: 'center' },
              ease: 'power2.out',
              scrollTrigger: bidirectional(trustText, 'top 95%', 'bottom top', scroller),
            }
          );
        }
      }
    }, mainContainerRef);

    // Re-measure every trigger (including layer A's) after the text/layout swap.
    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      splitEls.forEach((s) => s.revert());
    };
  }, [lang, isHi, fontsTick]);

  return {
    mainContainerRef,
    scrollContainerRef,
    brandTitleRef,
    brandSubRef,
    sloganRef,
    gradientLineRef,
    descRef,
    badgesContainerRef,
    cardsGridRef,
    trustFooterRef,
  };
}
