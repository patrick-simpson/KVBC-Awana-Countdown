import React, { useState, useEffect } from 'react';
import { SlideContent } from '../types';
import { BrandBar } from './BrandBar';

interface SlideProps {
  content: SlideContent;
  isExiting?: boolean;
  onNext?: () => void;
}

const LOGO_SRC = `${import.meta.env.BASE_URL}awana-logo.png`;

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

  const contentTransition = `transition-all duration-300 ease-in-out ${
    isExiting ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
  }`;

  return (
    <div className="w-full h-full bg-black flex flex-col overflow-hidden">

      {/* Top brand bar */}
      <BrandBar />

      {/* Header row */}
      <div className="flex items-center justify-between px-10 py-5 flex-shrink-0">
        <div className="bg-white rounded-xl px-4 py-2 shadow-lg">
          <img
            src={LOGO_SRC}
            alt="Awana"
            className="h-10 w-auto"
            onError={(e) => { (e.target as HTMLElement).parentElement!.style.display = 'none'; }}
          />
        </div>
        {content.showClock && (
          <div className="font-mono text-slate-300 text-2xl tabular-nums tracking-wider select-none">
            {timeString}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mx-10 flex-shrink-0" />

      {/* Main content */}
      <div className={`flex-1 flex flex-col items-center justify-center px-16 pb-10 ${contentTransition}`}>

        {isWelcomeSlide ? (
          /* ── Welcome slide ── */
          <>
            <p className="text-xs font-black uppercase tracking-[0.45em] mb-6 text-[#FFC107] animate-fade-up">
              {content.title}
            </p>
            <h1
              className="font-black text-white leading-none animate-pop-in text-center"
              style={{ fontSize: '14vw' }}
            >
              WELCOME!
            </h1>
            <p className="text-slate-400 text-3xl mt-8 animate-slide-up-fade">
              We're glad you're here!
            </p>
          </>
        ) : hasLongBody ? (
          /* ── Pledge slides ── */
          <>
            <h2 className={`text-2xl font-bold uppercase tracking-[0.22em] mb-10 ${content.accentColorClass}`}>
              {content.title}
            </h2>
            <p className="text-white font-bold leading-snug text-center max-w-5xl text-5xl lg:text-6xl">
              {content.body}
            </p>
          </>
        ) : (
          /* ── Closing / short-body slides ── */
          <>
            <h1
              className={`font-black leading-tight text-center ${content.accentColorClass} animate-fade-up`}
              style={{ fontSize: '9vw' }}
            >
              {content.title}
            </h1>
            {content.body && (
              <p className="text-slate-300 text-4xl mt-6 text-center animate-slide-up-fade">
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
