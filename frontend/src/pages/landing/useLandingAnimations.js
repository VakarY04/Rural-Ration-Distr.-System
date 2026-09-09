import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return;

    let ctx = gsap.context(() => {
      if (brandTitleRef.current) {
        const titleSplit = new SplitType(brandTitleRef.current, { types: isHi ? 'words' : 'chars' });
        gsap.fromTo(
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
        const subSplit = new SplitType(brandSubRef.current, { types: 'words' });
        gsap.fromTo(
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
        const sloganSplit = new SplitType(sloganRef.current, { types: isHi ? 'lines, words' : 'lines, words, chars' });
        gsap.fromTo(
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

      if (descRef.current) {
        const descSplit = new SplitType(descRef.current, { types: 'lines, words' });
        gsap.fromTo(
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

        const badgeTitles = badgesContainerRef.current.querySelectorAll(`.${HERO_BADGE_TITLE}`);
        badgeTitles.forEach((el) => {
          const split = new SplitType(el, { types: isHi ? 'words' : 'chars' });
          gsap.fromTo(
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

        const cardHeadings = cardsGridRef.current.querySelectorAll(`.${FEATURE_CARD_HEADING}`);
        cardHeadings.forEach((heading) => {
          const hSplit = new SplitType(heading, { types: isHi ? 'words' : 'chars, words' });
          gsap.fromTo(
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
          const tSplit = new SplitType(text, { types: 'words, lines' });
          gsap.fromTo(
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

        const trustText = trustFooterRef.current.querySelector(`.${TRUST_FOOTER_TEXT}`);
        if (trustText) {
          const trustSplit = new SplitType(trustText, { types: isHi ? 'words' : 'words, chars' });
          gsap.fromTo(
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

    return () => ctx.revert();
    // Re-split on language switch: translated strings replace the DOM text,
    // and Hindi must use word-level splits (see isHi above).
  }, [lang, isHi]);

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
