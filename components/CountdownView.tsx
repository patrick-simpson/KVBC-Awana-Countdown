import React, { useState, useEffect, useMemo } from 'react';

interface CountdownViewProps {
  onComplete: () => void;
  onCancel: () => void;
  durationMinutes: number;
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

export const CountdownView: React.FC<CountdownViewProps> = ({ onComplete, onCancel, durationMinutes }) => {
  // Convert minutes to seconds
  const initialSeconds = durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

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
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

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
        case 'Escape':
            onCancel();
            break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete, onCancel]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Calculate color urgency for text only
  const isUrgent = timeLeft < 60; // Less than 1 minute

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
      
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
        
        <h2 className="text-4xl text-gray-400 font-bold mb-4 uppercase tracking-widest absolute top-12">
          Club Starts In
        </h2>
        
        <div 
            className="relative w-full flex justify-center items-center cursor-pointer group"
            onClick={onComplete}
            title="Click to skip timer"
        >
            {/* Massive time display using viewport width units */}
            <h1 className={`text-[25vw] leading-none font-bold tabular-nums drop-shadow-2xl transition-colors duration-500 ${isUrgent ? 'text-red-500' : 'text-white'} group-hover:text-gray-200`}>
            {formattedTime}
            </h1>
            <div className="absolute bottom-0 opacity-0 group-hover:opacity-100 text-sm text-gray-500 font-semibold uppercase tracking-widest transition-opacity">
                Click to Skip
            </div>
        </div>

        <button 
          onClick={onCancel}
          className="absolute bottom-12 text-gray-600 hover:text-white transition-colors text-sm uppercase tracking-wider"
        >
          Cancel & Return to Standby
        </button>
      </div>
    </div>
  );
};