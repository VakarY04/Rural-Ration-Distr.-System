import React, { useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Users, 
  ClipboardCheck, 
  CalendarCheck, 
  MessageSquareCode,
  ArrowRight
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import heroBackdrop from '../images/india-republic-day-celebration-digital-art-with-flag.jpg';

// Logo Asset Import
import logoAsset from '../images/E-RATION Logo.png';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage({ onNavigate }) {
  const mainContainerRef = useRef(null);
  const brandTitleRef = useRef(null);
  const brandSubRef = useRef(null);
  const sloganRef = useRef(null);
  const gradientLineRef = useRef(null);
  const descRef = useRef(null);
  const badgesContainerRef = useRef(null);
  const cardsGridRef = useRef(null);
  const trustFooterRef = useRef(null);

  useEffect(() => {
    // GSAP context ensures clean removal of ScrollTriggers and SplitType DOM wrappers on unmount
    let ctx = gsap.context(() => {
      
      // 1. BRAND IDENTIFICATION HEADER TYPOGRAPHY REVEAL (Bidirectional Up & Down)
      if (brandTitleRef.current) {
        const titleSplit = new SplitType(brandTitleRef.current, { types: 'chars' });
        gsap.fromTo(
          titleSplit.chars,
          { opacity: 0, y: 25, rotateX: -90 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: {
              amount: 0.4,
              from: 'center'
            },
            ease: 'power3.out',
            scrollTrigger: {
              trigger: brandTitleRef.current,
              start: 'top 95%',
              end: 'bottom top',
              toggleActions: 'play reverse play reverse'
            }
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
            stagger: {
              amount: 0.3,
              from: 'center'
            },
            ease: 'power2.out',
            scrollTrigger: {
              trigger: brandSubRef.current,
              start: 'top 95%',
              end: 'bottom top',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      }

      // 2. PRIMARY SLOGAN KINETIC TYPOGRAPHY ANIMATION (Bidirectional Up & Down)
      if (sloganRef.current) {
        const sloganSplit = new SplitType(sloganRef.current, { types: 'lines, words, chars' });
        gsap.fromTo(
          sloganSplit.chars,
          { 
            opacity: 0, 
            y: 50, 
            rotateX: -80,
            scale: 0.8 
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 1,
            stagger: {
              amount: 0.7,
              from: 'center'
            },
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: sloganRef.current,
              start: 'top 85%',
              end: 'bottom 10%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      }

      // 3. ANIMATED RAINBOW ACCENT BAR (Expands & contracts symmetrically in both directions)
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
            scrollTrigger: {
              trigger: sloganRef.current,
              start: 'top 85%',
              end: 'bottom 10%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      }

      // 4. HERO DESCRIPTION PARAGRAPH TYPOGRAPHY REVEAL (Bidirectional Up & Down)
      if (descRef.current) {
        const descSplit = new SplitType(descRef.current, { types: 'lines, words' });
        gsap.fromTo(
          descSplit.words,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: {
              amount: 0.4,
              from: 'center'
            },
            ease: 'power2.out',
            scrollTrigger: {
              trigger: descRef.current,
              start: 'top 90%',
              end: 'bottom 10%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      }

      // 5. HERO BADGE BOXES & TYPOGRAPHY REVEAL (Bidirectional Up & Down)
      if (badgesContainerRef.current) {
        const badgeBoxes = badgesContainerRef.current.querySelectorAll('.hero-badge-box');
        gsap.fromTo(
          badgeBoxes,
          { opacity: 0, y: 40, scale: 0.9, rotateX: 15 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.9,
            stagger: {
              amount: 0.3,
              from: 'center'
            },
            ease: 'power3.out',
            scrollTrigger: {
              trigger: badgesContainerRef.current,
              start: 'top 92%',
              end: 'bottom 10%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );

        const badgeTitles = badgesContainerRef.current.querySelectorAll('.hero-badge-title');
        badgeTitles.forEach((el) => {
          const split = new SplitType(el, { types: 'chars' });
          gsap.fromTo(
            split.chars,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: {
                amount: 0.2,
                from: 'center'
              },
              ease: 'power1.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 92%',
                end: 'bottom 10%',
                toggleActions: 'play reverse play reverse'
              }
            }
          );
        });
      }

      // 6. FROSTED GLASS CARDS & CARD TYPOGRAPHY REVEAL (Bidirectional Up & Down)
      if (cardsGridRef.current) {
        const cards = cardsGridRef.current.querySelectorAll('.feature-card-box');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 70, scale: 0.93, rotateY: 8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateY: 0,
            duration: 1.1,
            stagger: {
              amount: 0.4,
              from: 'center'
            },
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsGridRef.current,
              start: 'top 85%',
              end: 'bottom 15%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );

        const cardHeadings = cardsGridRef.current.querySelectorAll('.feature-card-heading');
        cardHeadings.forEach((heading) => {
          const hSplit = new SplitType(heading, { types: 'chars, words' });
          gsap.fromTo(
            hSplit.chars,
            { opacity: 0, y: 20, rotateX: -90 },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.7,
              stagger: {
                amount: 0.3,
                from: 'center'
              },
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: heading,
                start: 'top 88%',
                end: 'bottom 15%',
                toggleActions: 'play reverse play reverse'
              }
            }
          );
        });

        const cardTexts = cardsGridRef.current.querySelectorAll('.feature-card-text');
        cardTexts.forEach((text) => {
          const tSplit = new SplitType(text, { types: 'words, lines' });
          gsap.fromTo(
            tSplit.words,
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: {
                amount: 0.3,
                from: 'center'
              },
              ease: 'power1.out',
              scrollTrigger: {
                trigger: text,
                start: 'top 88%',
                end: 'bottom 15%',
                toggleActions: 'play reverse play reverse'
              }
            }
          );
        });
      }

      // 7. LOWER TRUST FOOTER CONTAINER & TYPOGRAPHY REVEAL (Bidirectional Up & Down)
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
            scrollTrigger: {
              trigger: trustFooterRef.current,
              start: 'top 95%',
              end: 'bottom top',
              toggleActions: 'play reverse play reverse'
            }
          }
        );

        const trustText = trustFooterRef.current.querySelector('.trust-footer-text');
        if (trustText) {
          const trustSplit = new SplitType(trustText, { types: 'words, chars' });
          gsap.fromTo(
            trustSplit.chars,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: {
                amount: 0.4,
                from: 'center'
              },
              ease: 'power2.out',
              scrollTrigger: {
                trigger: trustText,
                start: 'top 95%',
                end: 'bottom top',
                toggleActions: 'play reverse play reverse'
              }
            }
          );
        }
      }

    }, mainContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainContainerRef} className="relative min-h-screen font-sans antialiased text-white selection:bg-blue-500/30 overflow-x-hidden bg-slate-950">
      
      {/* 1. FIXED BACKGROUND IMAGE LAYER */}
      <img
        src={heroBackdrop}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Subtle tint overlay to guarantee clean text separation */}
      <div className="fixed inset-0 bg-slate-950/20 z-10 pointer-events-none" />

      {/* 2. FIXED POSITION SIGN-IN BUTTON (Unchanged) */}
      <div className="fixed top-5 right-6 z-50">
        <button
          onClick={() => onNavigate('admin-login')}
          type="button"
          className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-slate-950/60 backdrop-blur-md border border-white/20 rounded-xl hover:bg-slate-900/80 hover:border-white/40 transition-all duration-300 shadow-2xl"
        >
          <Users size={14} />
          <span>Sign In To Account</span>
        </button>
      </div>

      {/* 3. MAIN SCROLLABLE WRAPPER */}
      <div className="relative z-20 w-full flex flex-col items-center">
        
        {/* HERO SECTION FRAME (CENTER ALIGNED) */}
        <section className="w-full min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-5xl mx-auto w-full flex flex-col items-center justify-center text-center space-y-8">
            
            {/* BRAND IDENTIFICATION HEADLINE (CENTER ALIGNED) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <img 
                src={logoAsset} 
                alt="E-RATION Curved Brand Logo" 
                className="w-16 h-16 object-contain rounded-2xl shadow-2xl border border-white/10 bg-slate-900/50 p-1 backdrop-blur-md"
              />
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <h1 ref={brandTitleRef} className="text-white font-black text-2xl md:text-3xl tracking-tight uppercase leading-none filter drop-shadow-md perspective-text text-center sm:text-left">
                  E-Ration Portal
                </h1>
                <span ref={brandSubRef} className="text-[11px] md:text-xs text-slate-300 font-extrabold tracking-wider uppercase mt-1.5 filter drop-shadow-sm text-center sm:text-left">
                  Smart Allocation & Allocation Scheduling Engine
                </span>
              </div>
            </div>

            {/* PRIMARY SLOGAN WITH ON-SCROLL KINETIC TYPOGRAPHY (CENTER ALIGNED) */}
            <div className="space-y-4 flex flex-col items-center text-center">
              <h2 ref={sloganRef} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight filter drop-shadow-xl perspective-text text-center">
                <span className="block">Every Grain Counts,</span>
                <span className="block">Every Family Matters.</span>
              </h2>
              <div ref={gradientLineRef} className="h-1.5 w-56 rounded-full bg-gradient-to-r from-[#EF4444] via-[#F59E0B] to-[#10B981] mx-auto shadow-sm" />
            </div>

            {/* HERO DESCRIPTION PARAGRAPH (CENTER ALIGNED) */}
            <p ref={descRef} className="text-slate-200 text-sm sm:text-base md:text-lg font-medium max-w-3xl mx-auto text-center leading-relaxed filter drop-shadow">
              Empowering Public Distribution Frameworks with structural clarity, zero-shot 
              algorithmic routing accuracy, and secure processing layers—ensuring essential baseline 
              commodities cross delivery lines transparently and cleanly.
            </p>

            {/* FLOATING TRANSPARENT HERO FEATURE BADGES (ANIMATED TEXT BOXES - CENTER ALIGNED) */}
            <div ref={badgesContainerRef} className="hero-badges-container pt-4 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl w-full mx-auto justify-center">
              
              {/* Badge 1 */}
              <div className="hero-badge-box flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-4 bg-slate-950/40 backdrop-blur-none px-6 py-4 rounded-2xl border border-white/15 shadow-2xl hover:border-emerald-400/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-[#10B981] flex items-center justify-center shrink-0">
                  <ShieldCheck size={26} />
                </div>
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <span className="hero-badge-title text-sm font-extrabold text-white tracking-wide whitespace-nowrap">Transparent</span>
                  <span className="text-xs text-slate-300 font-medium mt-0.5">End-to-end trace tracking</span>
                </div>
              </div>

              {/* Badge 2 */}
              <div className="hero-badge-box flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-4 bg-slate-950/40 backdrop-blur-none px-6 py-4 rounded-2xl border border-white/15 shadow-2xl hover:border-amber-400/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-[#F59E0B] flex items-center justify-center shrink-0">
                  <Cpu size={26} />
                </div>
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <span className="hero-badge-title text-sm font-extrabold text-white tracking-wide whitespace-nowrap">Technology Driven</span>
                  <span className="text-xs text-slate-300 font-medium mt-0.5">Smart dynamic matching</span>
                </div>
              </div>

              {/* Badge 3 */}
              <div className="hero-badge-box flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-4 bg-slate-950/40 backdrop-blur-none px-6 py-4 rounded-2xl border border-white/15 shadow-2xl hover:border-blue-400/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-[#3B82F6] flex items-center justify-center shrink-0">
                  <Users size={26} />
                </div>
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <span className="hero-badge-title text-sm font-extrabold text-white tracking-wide whitespace-nowrap">People First</span>
                  <span className="text-xs text-slate-300 font-medium mt-0.5">Citizen-centric workflows</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* DETAILS SECTION (ANIMATED FROSTED GLASS TEXT BOX CARDS & TYPOGRAPHY - CENTER ALIGNED) */}
        <section className="w-full py-28 px-6 flex items-center justify-center">
          <div className="max-w-7xl mx-auto w-full space-y-20">
            
            {/* THREE TRANSPARENT FROSTED GLASS CARDS */}
            <div ref={cardsGridRef} className="feature-cards-grid grid grid-cols-1 md:grid-cols-3 gap-10">
              
              {/* Card 1 */}
              <div className="feature-card-box bg-slate-900/40 backdrop-blur-none rounded-2xl shadow-2xl border border-white/15 p-10 flex flex-col justify-between hover:bg-slate-900/60 hover:scale-[1.03] transition-all duration-300 group text-center">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner mx-auto group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <ClipboardCheck size={32} />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="feature-card-heading text-white text-xl font-black tracking-tight perspective-text text-center">Smart Quota Allocations</h3>
                    <div className="h-0.5 w-16 bg-blue-500 mx-auto rounded-full" />
                    <p className="feature-card-text text-slate-200 text-sm font-medium leading-relaxed pt-2 text-center">
                      AI-powered allocation engine ensures accurate and fair distribution of ration based on eligibility, priority, and availability.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('admin-login')}
                  type="button" 
                  className="mt-8 flex items-center justify-center gap-1.5 text-sm font-black text-blue-400 hover:text-blue-300 transition-colors mx-auto"
                >
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Card 2 */}
              <div className="feature-card-box bg-slate-900/40 backdrop-blur-none rounded-2xl shadow-2xl border border-white/15 p-10 flex flex-col justify-between hover:bg-slate-900/60 hover:scale-[1.03] transition-all duration-300 group text-center">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shadow-inner mx-auto group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                    <CalendarCheck size={32} />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="feature-card-heading text-white text-xl font-black tracking-tight perspective-text text-center">Secure Slot Booking</h3>
                    <div className="h-0.5 w-16 bg-green-500 mx-auto rounded-full" />
                    <p className="feature-card-text text-slate-200 text-sm font-medium leading-relaxed pt-2 text-center">
                      Book your ration collection slot online and skip long queues. Choose your preferred time, hassle-free.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('admin-login')}
                  type="button" 
                  className="mt-8 flex items-center justify-center gap-1.5 text-sm font-black text-green-400 hover:text-green-300 transition-colors mx-auto"
                >
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Card 3 */}
              <div className="feature-card-box bg-slate-900/40 backdrop-blur-none rounded-2xl shadow-2xl border border-white/15 p-10 flex flex-col justify-between hover:bg-slate-900/60 hover:scale-[1.03] transition-all duration-300 group text-center">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner mx-auto group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    <MessageSquareCode size={32} />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="feature-card-heading text-white text-xl font-black tracking-tight perspective-text text-center">Multilingual AI Grievance Bridge</h3>
                    <div className="h-0.5 w-16 bg-purple-500 mx-auto rounded-full" />
                    <p className="feature-card-text text-slate-200 text-sm font-medium leading-relaxed pt-2 text-center">
                      Report issues or get help in your language. Our AI assistant understands and resolves your concerns, 24/7.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('admin-login')}
                  type="button" 
                  className="mt-8 flex items-center justify-center gap-1.5 text-sm font-black text-purple-400 hover:text-purple-300 transition-colors mx-auto"
                >
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>

            {/* LOWER TRUST BAR (ANIMATED TEXT BOX & TYPOGRAPHY - CENTER ALIGNED) */}
            <footer ref={trustFooterRef} className="trust-footer-box bg-slate-900/50 backdrop-blur-none rounded-2xl border border-white/15 p-6 shadow-2xl max-w-4xl mx-auto text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
                <ShieldCheck className="text-emerald-400 shrink-0" size={24} />
                <p className="trust-footer-text text-xs sm:text-sm font-black text-white tracking-wide uppercase text-center">
                  Committed to a Hunger-Free India through Transparency, Technology & Trust
                </p>
              </div>
            </footer>

          </div>
        </section>
      </div>

    </div>
  );
}