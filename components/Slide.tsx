import React, { useState, useEffect } from 'react';
import { SlideContent } from '../types';

interface SlideProps {
  content: SlideContent;
  isExiting?: boolean;
  onNext?: () => void;
}

export const Slide: React.FC<SlideProps> = ({ content, isExiting = false, onNext }) => {
  const [now, setNow] = useState(new Date());
  
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate Warning Timer (Countdown to end of schedule)
  let warningTimeDisplay: string | null = null;
  
  if (content.schedule && content.schedule.endHour !== undefined) {
    const endTime = new Date();
    endTime.setHours(content.schedule.endHour);
    endTime.setMinutes(content.schedule.endMinute || 0);
    endTime.setSeconds(0);
    
    // Reset date to today to ensure diff is correct
    if (now.getDate() !== endTime.getDate()) {
       endTime.setDate(now.getDate());
    }

    const diffSeconds = (endTime.getTime() - now.getTime()) / 1000;
    
    // Show if between 0 and 5 minutes (300 seconds)
    if (diffSeconds > 0 && diffSeconds <= 300) {
       const m = Math.floor(diffSeconds / 60);
       const s = Math.floor(diffSeconds % 60);
       warningTimeDisplay = `${m}:${s.toString().padStart(2, '0')}`;
    }
  }

  // Check if this is the "Power Off" slide (ID 1004)
  const isPowerOffSlide = content.id === 1004;
  
  // Check if this is the Welcome Slide (ID 1)
  const isWelcomeSlide = content.id === 1;

  // Format main clock
  const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

  // Base Transition Classes
  const transitionClasses = `transition-all duration-500 ease-in-out transform ${
    isExiting ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
  }`;

  // Typography Logic
  const hasBody = !!content.body;
  const isLongText = hasBody && content.body!.length > 60;
  
  // If text is long, use smaller body font and limit width. If short, go big.
  const bodyClass = isLongText
    ? "text-4xl md:text-5xl lg:text-6xl leading-tight max-w-6xl font-bold"
    : "text-7xl md:text-8xl lg:text-9xl leading-none font-black uppercase tracking-tight";

  // If we have both title and body, shrink title slightly to let body breathe
  const titleClass = hasBody
    ? "text-4xl md:text-5xl font-bold mb-6 opacity-80 uppercase tracking-widest"
    : "text-7xl md:text-8xl font-bold mb-8";

  // Animation Classes for Welcome Slide
  // Only apply entrance animations if we are NOT exiting
  const titleAnimation = (isWelcomeSlide && !isExiting) ? 'animate-pop-in' : '';
  const subtitleAnimation = (isWelcomeSlide && !isExiting) ? 'animate-slide-up-fade' : 'opacity-0';

  // Dynamic Padding: If clock is shown, add more bottom padding to main content so it visually centers above the clock
  const contentPadding = content.showClock ? 'pb-32' : 'pb-8';

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${content.bgColorClass} relative overflow-hidden`}>
      
      {/* Main Content Container */}
      <div className={`flex flex-col items-center justify-center text-center px-8 w-full z-10 ${contentPadding} ${transitionClasses}`}>
        
        {/* Title */}
        {content.title && (
          <h1 className={`${titleClass} ${content.accentColorClass} drop-shadow-md ${titleAnimation}`}>
            {content.title}
          </h1>
        )}
        
        {/* Special Welcome Subtitle - Animated */}
        {isWelcomeSlide && (
            <div className={`text-3xl md:text-4xl text-gray-300 font-light mt-4 ${subtitleAnimation}`}>
                We're glad you're here!
            </div>
        )}

        {/* Content Body or Image */}
        {content.imageUrl ? (
             <img src={content.imageUrl} alt="Slide" className="max-h-[65vh] w-auto border-4 border-gray-800 shadow-2xl rounded-lg" />
        ) : (
            /* Text Body */
            content.body && (
                 <div className={`${bodyClass} ${content.accentColorClass} drop-shadow-xl break-words`}>
                    {content.body}
                 </div>
            )
        )}

        {/* Warning Countdown (5 min remaining) */}
        {/* Only show on game slides (IDs > 1000) that aren't the Power Off slide */}
        {warningTimeDisplay && !isPowerOffSlide && content.id > 1000 && (
            <div className="mt-12 animate-pulse flex flex-col items-center">
                <div className="text-2xl text-red-500 font-bold uppercase mb-0 tracking-widest">Time Remaining</div>
                <div className="text-8xl leading-none font-mono font-bold text-white tabular-nums drop-shadow-xl">
                    {warningTimeDisplay}
                </div>
            </div>
        )}

      </div>

      {/* Footer Area: Clock & Special Messages */}
      {(content.showClock) && (
        <div className={`absolute bottom-8 left-0 w-full flex flex-col items-center justify-center pointer-events-none z-20 ${transitionClasses}`}>
           {/* Real Time Clock - Pure White */}
           <div className="text-5xl font-mono font-bold text-white tabular-nums drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              {timeString}
           </div>
           
           {/* Power Off Message */}
           {isPowerOffSlide && (
               <div className="mt-4 text-3xl md:text-4xl font-bold text-red-500 animate-pulse uppercase tracking-wider bg-black/90 px-8 py-3 rounded-xl border border-red-900/50">
                   Please Power Off Projector
               </div>
           )}
        </div>
      )}

      {/* Subtle Next Button (Invisible overlay on right edge) */}
      <button 
        onClick={onNext}
        className="absolute inset-y-0 right-0 w-24 opacity-0 hover:opacity-0 transition-opacity cursor-pointer z-50 focus:outline-none"
        title="Next Slide"
        aria-label="Next Slide"
      />
    </div>
  );
};