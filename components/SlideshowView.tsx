import React, { useState, useCallback, useEffect } from 'react';
import { Slide } from './Slide';
import { SLIDES } from '../constants';

interface SlideshowViewProps {
  onExit: () => void;
}

export const SlideshowView: React.FC<SlideshowViewProps> = ({ onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const TRANSITION_DURATION = 300;

  const activeSlides = SLIDES;

  const changeSlide = useCallback((newIndex: number) => {
    setIsExiting(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsExiting(false);
    }, TRANSITION_DURATION);
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < activeSlides.length - 1 && !isExiting) {
      changeSlide(currentIndex + 1);
    }
  }, [currentIndex, isExiting, changeSlide, activeSlides.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0 && !isExiting) {
      changeSlide(currentIndex - 1);
    }
  }, [currentIndex, isExiting, changeSlide]);

  useEffect(() => {
    const currentSlide = activeSlides[currentIndex];
    if (currentSlide.duration && !isExiting) {
      const timer = setTimeout(() => {
        if (currentIndex < activeSlides.length - 1) {
          goToNext();
        }
      }, currentSlide.duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, activeSlides, isExiting, goToNext]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isExiting) return;
      if (['Space', 'ArrowRight', 'PageDown'].includes(event.code)) {
        event.preventDefault();
        goToNext();
      } else if (['ArrowLeft', 'PageUp'].includes(event.code)) {
        event.preventDefault();
        goToPrev();
      } else if (event.code === 'Escape' && window.confirm('Exit Presentation Mode?')) {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onExit, isExiting]);

  return (
    <div className="w-full h-full relative group bg-black">
      <Slide content={activeSlides[currentIndex]} isExiting={isExiting} onNext={goToNext} />

      {/* Navigation — visible on hover */}
      <div className="fixed bottom-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0 || isExiting}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-white text-xs font-bold uppercase tracking-wider disabled:opacity-25 hover:bg-white/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === activeSlides.length - 1 || isExiting}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-white text-xs font-bold uppercase tracking-wider disabled:opacity-25 hover:bg-white/20 transition-colors"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};
