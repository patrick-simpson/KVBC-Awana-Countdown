import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Slide } from './Slide';
import { SLIDES } from '../constants';

interface SlideshowViewProps {
  onExit: () => void;
}

export const SlideshowView: React.FC<SlideshowViewProps> = ({ onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionRef = useRef<NodeJS.Timeout | null>(null);
  const TRANSITION_DURATION = 500;

  const activeSlides = SLIDES;

  const changeSlide = useCallback((newIndex: number, dir: 'forward' | 'backward') => {
    if (isTransitioning) return;
    setDirection(dir);
    setPrevIndex(currentIndex);
    setCurrentIndex(newIndex);
    setIsTransitioning(true);

    if (transitionRef.current) clearTimeout(transitionRef.current);
    transitionRef.current = setTimeout(() => {
      setPrevIndex(null);
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  }, [currentIndex, isTransitioning]);

  const goToNext = useCallback(() => {
    if (currentIndex < activeSlides.length - 1 && !isTransitioning) {
      changeSlide(currentIndex + 1, 'forward');
    }
  }, [currentIndex, isTransitioning, changeSlide, activeSlides.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0 && !isTransitioning) {
      changeSlide(currentIndex - 1, 'backward');
    }
  }, [currentIndex, isTransitioning, changeSlide]);

  // Auto-advance
  useEffect(() => {
    const currentSlide = activeSlides[currentIndex];
    if (currentSlide.duration && !isTransitioning) {
      const timer = setTimeout(() => {
        if (currentIndex < activeSlides.length - 1) {
          goToNext();
        }
      }, currentSlide.duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, activeSlides, isTransitioning, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTransitioning) return;
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
  }, [goToNext, goToPrev, onExit, isTransitioning]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => { if (transitionRef.current) clearTimeout(transitionRef.current); };
  }, []);

  const outAnimation = direction === 'forward' ? 'slideFlipOutLeft' : 'slideFlipOutRight';
  const inAnimation = direction === 'forward' ? 'slideFlipInRight' : 'slideFlipInLeft';

  return (
    <div className="w-full h-full relative group bg-black" style={{ perspective: '1200px' }}>

      {/* Previous slide (animating out) */}
      {prevIndex !== null && (
        <div
          key={`out-${prevIndex}`}
          className="absolute inset-0 z-10"
          style={{
            animation: `${outAnimation} ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
            transformOrigin: direction === 'forward' ? 'left center' : 'right center',
          }}
        >
          <Slide content={activeSlides[prevIndex]} />
        </div>
      )}

      {/* Current slide (animating in or static) */}
      <div
        key={`in-${currentIndex}`}
        className="absolute inset-0 z-20"
        style={prevIndex !== null ? {
          animation: `${inAnimation} ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
          transformOrigin: direction === 'forward' ? 'right center' : 'left center',
        } : undefined}
      >
        <Slide content={activeSlides[currentIndex]} onNext={goToNext} />
      </div>

      {/* Navigation — visible on hover */}
      <div className="fixed bottom-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0 || isTransitioning}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white text-xs font-bold uppercase tracking-wider disabled:opacity-25 hover:bg-white/15 transition-all"
          style={{ boxShadow: '0 0 20px rgba(255,255,255,0.03)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === activeSlides.length - 1 || isTransitioning}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white text-xs font-bold uppercase tracking-wider disabled:opacity-25 hover:bg-white/15 transition-all"
          style={{ boxShadow: '0 0 20px rgba(255,255,255,0.03)' }}
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
