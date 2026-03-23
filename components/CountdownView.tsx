import React, { useState, useEffect, useMemo } from 'react';

interface CountdownViewProps {
  onComplete: () => void;
  targetDate: Date;
  title?: string;
  bgColorClass?: string;
  accentColorClass?: string;
}

const PARTICLE_COLORS = ['bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-500'];

export const CountdownView: React.FC<CountdownViewProps> = ({ 
  onComplete, 
  targetDate, 
  title = 'Club Starts In',
  bgColorClass = 'bg-black',
  accentColorClass = 'text-white'
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 3 + 1}rem`,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        duration: `${Math.random() * 10 + 10}s`,
        delay: `-${Math.random() * 20}s`,
      })),
    []
  );

  useEffect(() => {
    const calculateTimeLeft = () => {
      const distance = targetDate.getTime() - new Date().getTime();
      if (distance <= 0) {
        onComplete();
        return 0;
      }
      return Math.floor(distance / 1000);
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (['Space', 'ArrowRight', 'PageDown'].includes(event.code)) {
        event.preventDefault();
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  
  let formattedTime = days > 0 
    ? `${days}d ${hours}h ${minutes}m` 
    : hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` 
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${bgColorClass} relative overflow-hidden animate-fade-in`}>
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`rounded-full animate-float ${p.color} blur-sm absolute`}
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
      <div className="z-10 w-full h-full flex flex-col items-center justify-center">
        <h2 className="text-4xl text-gray-400 font-bold mb-8 uppercase tracking-widest">{title}</h2>
        <div
          className="relative w-full flex justify-center items-center cursor-pointer group"
          onClick={onComplete}
          title="Click to skip timer"
        >
          <h1
            className={`${
              days > 0 ? 'text-[12vw]' : 'text-[25vw]'
            } leading-none font-bold tabular-nums drop-shadow-2xl transition-colors duration-500 ${
              timeLeft < 60 && timeLeft > 0 ? 'text-red-500' : accentColorClass
            } group-hover:text-gray-200`}
          >
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
