import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SLIDES, GAME_SLIDES } from '../constants';
import { Slide } from './Slide';
import { AppSettings, SlideContent } from '../types';

interface SlideshowViewProps {
  onExit: () => void;
  settings: AppSettings;
}

export const SlideshowView: React.FC<SlideshowViewProps> = ({ onExit, settings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Transition duration in ms - should match the CSS duration in Slide.tsx
  const TRANSITION_DURATION = 500;

  // Compute the full list of slides: [Default] -> [Settings Final] -> [Game Slides]
  const activeSlides = useMemo(() => {
    const slides: SlideContent[] = [...SLIDES];
    
    // Create Final Slide based on settings
    const finalSlide: SlideContent = {
      id: 999,
      title: '', // Usually hidden if empty
      body: '',
      bgColorClass: 'bg-black',
      accentColorClass: 'text-white',
    };

    if (settings.finalSlideType === 'text') {
      finalSlide.body = settings.finalSlideContent || 'Thank You!';
    } else if (settings.finalSlideType === 'image') {
      finalSlide.imageUrl = settings.finalSlideContent;
    }
    // If 'black', body and imageUrl remain undefined/empty, rendering a black screen

    slides.push(finalSlide);
    
    // Append Time-Based Game Slides
    slides.push(...GAME_SLIDES);

    return slides;
  }, [settings]);

  const changeSlide = useCallback((newIndex: number) => {
    // 1. Start Exit Animation
    setIsExiting(true);

    // 2. Wait for animation to finish, then swap content and start Enter Animation
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

  // Automated Schedule Navigation
  useEffect(() => {
    const checkSchedule = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Check if we need to auto-jump to a scheduled slide
        activeSlides.forEach((slide, index) => {
            if (slide.schedule) {
                // Check if current time matches the scheduled start time
                if (slide.schedule.startHour === currentHour && slide.schedule.startMinute === currentMinute) {
                    // Only jump if we are not already on this slide
                    // Also check seconds to prevent continuous re-triggering (only trigger at :00)
                    if (index !== currentIndex && now.getSeconds() === 0) {
                        changeSlide(index);
                    }
                }
            }
        });
    };

    const timer = setInterval(checkSchedule, 1000);
    return () => clearInterval(timer);
  }, [activeSlides, currentIndex, changeSlide]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Block input during transition
      if (isExiting) return;

      switch (event.code) {
        case 'Space':
        case 'ArrowRight':
        case 'PageDown':
          event.preventDefault(); // Prevent scrolling
          goToNext();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          goToPrev();
          break;
        case 'Escape':
            if(confirm("Exit Presentation Mode?")) {
                onExit();
            }
            break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onExit, isExiting]);

  return (
    <div className="w-full h-full relative group bg-black">
      <Slide 
        content={activeSlides[currentIndex]} 
        isExiting={isExiting} 
        onNext={goToNext}
      />
      
      {/* Navigation Hints (Hidden by default, hover to see) */}
      <div className="fixed bottom-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
        <button 
          onClick={goToPrev}
          disabled={currentIndex === 0 || isExiting}
          className="p-3 bg-gray-800/50 rounded-full text-white disabled:opacity-30 hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button 
          onClick={goToNext}
          disabled={currentIndex === activeSlides.length - 1 || isExiting}
          className="p-3 bg-gray-800/50 rounded-full text-white disabled:opacity-30 hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
};