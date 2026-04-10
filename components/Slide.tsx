import React, { useState, useEffect } from 'react';
import { SlideContent } from '../types';
import { BrandBar } from './BrandBar';
import { ParticleField } from './ParticleField';

interface SlideProps {
  content: SlideContent;
  isExiting?: boolean;
  onNext?: () => void;
}

const LOGO_SRC = `${import.meta.env.BASE_URL}awana-logo.png`;

const SLIDE_ORBS = [
  { color: '#E8192C', size: '55vw', top: '-18%', left: '-14%', duration: 30, delay: 0,   opacity: 0.10 },
  { color: '#0072CE', size: '45vw', top: '58%',  left: '-10%', duration: 26, delay: -10, opacity: 0.10 },
  { color: '#00A651', size: '38vw', top: '52%',  left: '66%',  duration: 34, delay: -18, opacity: 0.08 },
  { color: '#FFC107', size: '32vw', top: '-12%', left: '63%',  duration: 38, delay: -14, opacity: 0.08 },
];

export const Slide: React.FC<SlideProps> = ({ content, isExiting = false, onNext }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isWelcomeSlide = content.id === 1;
  const hasLongBody = !!content.body && content.body.length > 60;
  const timeString = now.toLocaleTimeString([], {
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
  });

  const contentTransition = 'transition-all duration-400 ease-in-out opacity-100 scale-100 blur-0 translate-y-0';

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden relative"
      style={{ background: '#000000' }}
    >
      {/* Ambient orbs */}
      {SLIDE_ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none animate-orbit"
          style={{
            backgroundColor: orb.color,
            width:  orb.size,
            height: orb.size,
            top:    orb.top,
            left:   orb.left,
            filter: 'blur(80px)',
            opacity: orb.opacity,
            animationDuration: `${orb.duration}s`,
            animationDelay:    `${orb.delay}s`,
          }}
        />
      ))}

      {/* Floating particles */}
      <ParticleField />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Top brand bar */}
      <BrandBar height={6} />

      {/* Header row */}
      <div className="flex items-center justify-between px-10 py-5 flex-shrink-0 relative z-10">
        <div className="bg-white rounded-xl px-4 py-2 shadow-lg animate-logo-glow">
          <img
            src={LOGO_SRC}
            alt="Awana"
            className="h-10 w-auto"
            onError={(e) => { (e.target as HTMLElement).parentElement!.style.display = 'none'; }}
          />
        </div>
        {content.showClock && (
          <div
            className="font-mono text-slate-200 text-2xl tabular-nums tracking-wider select-none"
            style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
          >
            {timeString}
          </div>
        )}
      </div>

      {/* Divider with glow */}
      <div className="relative mx-10 flex-shrink-0 z-10">
        <div className="h-px bg-white/10" />
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-px" />
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col items-center justify-center px-16 pb-10 relative z-10 ${contentTransition}`}>

        {isWelcomeSlide ? (
          /* ── Welcome slide ── */
          <>
            <p className="text-xs font-black uppercase tracking-[0.45em] mb-6 text-shimmer animate-fade-up">
              {content.title}
            </p>
            <div className="relative">
              {/* Glow layer behind gradient text */}
              <h1
                className="font-black leading-none text-center absolute inset-0"
                style={{
                  fontSize: '14vw',
                  color: '#ffffff',
                  filter: 'blur(35px)',
                  opacity: 0.45,
                }}
                aria-hidden="true"
              >
                WELCOME!
              </h1>
              {/* Gradient text */}
              <h1
                className="font-black leading-none animate-pop-in text-center gradient-text-animated relative"
                style={{ fontSize: '14vw' }}
              >
                WELCOME!
              </h1>
            </div>
            <p
              className="text-slate-300 text-3xl mt-8 animate-slide-up-fade"
              style={{ textShadow: '0 0 20px rgba(255,255,255,0.15)' }}
            >
              We're glad you're here!
            </p>
          </>
        ) : hasLongBody ? (
          /* ── Pledge slides ── */
          <>
            <h2 className={`text-2xl font-bold uppercase tracking-[0.22em] mb-10 ${content.accentColorClass}`}
              style={{ textShadow: '0 0 30px currentColor' }}
            >
              {content.title}
            </h2>
            <p className="text-white font-bold leading-snug text-center max-w-5xl text-5xl lg:text-6xl">
              {content.body}
            </p>
          </>
        ) : (
          /* ── Closing / short-body slides ── */
          <>
            <div className="relative">
              <h1
                className="font-black leading-tight text-center absolute inset-0"
                style={{ fontSize: '9vw', color: '#ffffff', filter: 'blur(30px)', opacity: 0.3 }}
                aria-hidden="true"
              >
                {content.title}
              </h1>
              <h1
                className="font-black leading-tight text-center gradient-text-animated animate-fade-up relative"
                style={{ fontSize: '9vw' }}
              >
                {content.title}
              </h1>
            </div>
            {content.body && (
              <p
                className="text-slate-300 text-4xl mt-6 text-center animate-slide-up-fade"
                style={{ textShadow: '0 0 20px rgba(255,255,255,0.2)' }}
              >
                {content.body}
              </p>
            )}
          </>
        )}

      </div>

      {/* Invisible next-slide click zone */}
      <button
        onClick={onNext}
        className="absolute inset-y-0 right-0 w-24 cursor-pointer z-50 focus:outline-none opacity-0"
        aria-label="Next Slide"
      />
    </div>
  );
};
