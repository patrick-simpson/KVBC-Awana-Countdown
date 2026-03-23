import React, { useState, useEffect } from 'react';
import { SlideContent } from '../types';

interface SlideProps {
  content: SlideContent;
  isExiting?: boolean;
  onNext?: () => void;
}

export const Slide: React.FC<SlideProps> = ({ content, isExiting = false, onNext }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isWelcomeSlide = content.id === 1;
  const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const transitionClasses = `transition-all duration-500 ease-in-out transform ${isExiting ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`;
  const hasBody = !!content.body;
  const isLongText = hasBody && content.body!.length > 60;
  const bodyClass = isLongText ? "text-4xl md:text-5xl lg:text-6xl leading-tight max-w-6xl font-bold" : "text-7xl md:text-8xl lg:text-9xl leading-none font-black uppercase tracking-tight";
  const titleClass = hasBody ? "text-4xl md:text-5xl font-bold mb-6 opacity-80 uppercase tracking-widest" : "text-7xl md:text-8xl font-bold mb-8";
  const titleAnimation = (isWelcomeSlide && !isExiting) ? 'animate-pop-in' : '';
  const subtitleAnimation = (isWelcomeSlide && !isExiting) ? 'animate-slide-up-fade' : 'opacity-0';
  const contentPadding = content.showClock ? 'pb-32' : 'pb-8';

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${content.bgColorClass} relative overflow-hidden`}>
      <div className={`flex flex-col items-center justify-center text-center px-8 w-full z-10 ${contentPadding} ${transitionClasses}`}>
        {content.title && <h1 className={`${titleClass} ${content.accentColorClass} drop-shadow-md ${titleAnimation}`}>{content.title}</h1>}
        {isWelcomeSlide && <div className={`text-3xl md:text-4xl text-gray-300 font-light mt-4 ${subtitleAnimation}`}>We're glad you're here!</div>}
        {content.imageUrl ? (
          <img src={content.imageUrl} alt="Slide" className="max-h-[65vh] w-auto border-4 border-gray-800 shadow-2xl rounded-lg" />
        ) : (
          content.body && <div className={`${bodyClass} ${content.accentColorClass} drop-shadow-xl break-words`}>{content.body}</div>
        )}
      </div>
      {content.showClock && (
        <div className={`absolute bottom-8 left-0 w-full flex flex-col items-center justify-center pointer-events-none z-20 ${transitionClasses}`}>
          <div className="text-5xl font-mono font-bold text-white tabular-nums drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">{timeString}</div>
        </div>
      )}
      <button
        onClick={onNext}
        className="absolute inset-y-0 right-0 w-24 opacity-0 hover:opacity-0 transition-opacity cursor-pointer z-50 focus:outline-none"
        title="Next Slide"
        aria-label="Next Slide"
      />
    </div>
  );
};
