import React, { useState, useEffect, useMemo } from 'react';

interface CountdownViewProps {
  onComplete: () => void;
  onOpenSettings: () => void;
  targetDate: Date;
}

// Awana Colors for particles
const PARTICLE_COLORS = ['bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-500'];

interface Particle {
  id: number;
  left: string;
  size: string;
  color: string;
  duration: string;
  delay: string;
}

export const CountdownView: React.FC<CountdownViewProps> = ({ onComplete, onOpenSettings, targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  // Generate particles only once on mount
  const particles = useMemo(() => {
    const items: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      items.push({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 3 + 1}rem`, // 1rem to 4rem
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        duration: `${Math.random() * 10 + 10}s`, // 10s to 20s duration
        delay: `-${Math.random() * 20}s`, // Negative delay to start mid-animation
      });
    }
    return items;
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance <= 0) {
        onComplete();
        return 0;
      }
      return Math.floor(distance / 1000);
    };

    // Initial check
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  // Keyboard support for skipping
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
        case 'ArrowRight':
        case 'PageDown':
          event.preventDefault();
          onComplete(); // Skip timer
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  // Formatting Logic
  const days = Math.floor(timeLeft / (3600 * 24));
  const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  let formattedTime = '';
  let isLongFormat = false;

  if (days > 0) {
    formattedTime = `${days}d ${hours}h ${minutes}m`;
    isLongFormat = true;
  } else if (hours > 0) {
    formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Calculate color urgency
  const isUrgent = timeLeft < 60 && timeLeft > 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden animate-fade-in">
      
       {/* Settings Button (Top Right) */}
       <button 
        onClick={onOpenSettings}
        className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors p-2 z-50"
        title="Settings"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Background Particles Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`rounded-full animate-float ${p.color} blur-sm`}
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Content Layer - Full screen centered */}
      <div className="z-10 w-full h-full flex flex-col items-center justify-center">
        
        <h2 className="text-4xl text-gray-400 font-bold mb-8 uppercase tracking-widest">
          Club Starts In
        </h2>
        
        <div 
            className="relative w-full flex justify-center items-center cursor-pointer group"
            onClick={onComplete}
            title="Click to skip timer"
        >
            {/* Massive time display */}
            <h1 className={`${isLongFormat ? 'text-[12vw]' : 'text-[25vw]'} leading-none font-bold tabular-nums drop-shadow-2xl transition-colors duration-500 ${isUrgent ? 'text-red-500' : 'text-white'} group-hover:text-gray-200`}>
            {formattedTime}
            </h1>
            <div className="absolute bottom-0 opacity-0 group-hover:opacity-100 text-sm text-gray-500 font-semibold uppercase tracking-widest transition-opacity">
                Click to Skip
            </div>
        </div>
      </div>
    </div>
  );
};