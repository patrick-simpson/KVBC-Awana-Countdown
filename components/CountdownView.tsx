import React, { useState, useEffect } from 'react';
import { BrandBar } from './BrandBar';

interface CountdownViewProps {
  onComplete: () => void;
  targetDate: Date;
  title?: string;
  clubColor?: string;
}

const ORBS = [
  { color: '#E8192C', size: '55vw', top: '-18%', left: '-14%', duration: 28, delay: 0,   opacity: 0.07 },
  { color: '#FFC107', size: '38vw', top: '-12%', left: '68%',  duration: 36, delay: -13, opacity: 0.06 },
  { color: '#0072CE', size: '44vw', top: '62%',  left: '-10%', duration: 24, delay: -8,  opacity: 0.07 },
  { color: '#00A651', size: '34vw', top: '58%',  left: '70%',  duration: 32, delay: -19, opacity: 0.06 },
  { color: '#FFC107', size: '24vw', top: '38%',  left: '40%',  duration: 42, delay: -24, opacity: 0.04 },
  { color: '#E8192C', size: '20vw', top: '22%',  left: '18%',  duration: 27, delay: -6,  opacity: 0.04 },
];

const LOGO_SRC = `${import.meta.env.BASE_URL}awana-logo.png`;

export const CountdownView: React.FC<CountdownViewProps> = ({
  onComplete,
  targetDate,
  title,
  clubColor,
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const isGameTime = !!clubColor;

  useEffect(() => {
    const calc = () => {
      const distance = targetDate.getTime() - Date.now();
      if (distance <= 0) { onComplete(); return 0; }
      return Math.floor(distance / 1000);
    };
    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowRight', 'PageDown'].includes(e.code)) {
        e.preventDefault();
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  const days    = Math.floor(timeLeft / 86400);
  const hours   = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formattedTime = days > 0
    ? `${days}d ${hours}h ${minutes}m`
    : `${hours > 0 ? hours + ':' : ''}${minutes.toString().padStart(hours > 0 ? 2 : 1, '0')}:${seconds.toString().padStart(2, '0')}`;

  const timerFontSize = days > 0 ? '10vw' : '22vw';
  const isUrgent     = timeLeft > 0 && timeLeft < 60;
  const timerColor   = isUrgent ? '#E8192C' : (clubColor ?? '#FFFFFF');
  const timerGlow    = isUrgent
    ? 'drop-shadow(0 0 50px rgba(232,25,44,0.75))'
    : clubColor
      ? `drop-shadow(0 0 45px ${clubColor}65)`
      : undefined;

  const labelText  = isGameTime ? (title ?? 'Game Time').toUpperCase() : 'AWANA NIGHT';
  const labelColor = isGameTime ? timerColor : '#FFC107';
  const endTimeStr = targetDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="w-full h-full bg-black flex flex-col relative overflow-hidden">

      {/* Ambient orbs */}
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none animate-orbit"
          style={{
            backgroundColor: orb.color,
            width:  orb.size,
            height: orb.size,
            top:    orb.top,
            left:   orb.left,
            filter: 'blur(90px)',
            opacity: orb.opacity,
            animationDuration: `${orb.duration}s`,
            animationDelay:    `${orb.delay}s`,
          }}
        />
      ))}

      {/* Top brand bar */}
      <BrandBar />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">

        {/* Logo watermark — top left */}
        <div className="absolute top-6 left-8">
          <div className="bg-white rounded-2xl px-4 py-2 shadow-xl">
            <img
              src={LOGO_SRC}
              alt="Awana"
              className="h-12 w-auto"
              onError={(e) => { (e.target as HTMLElement).parentElement!.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Label */}
        <p
          className="text-xs font-black uppercase tracking-[0.4em] mb-4 select-none"
          style={{ color: labelColor }}
        >
          {labelText}
        </p>

        {/* Timer */}
        <div
          className="cursor-pointer group relative"
          onClick={onComplete}
          title="Click to skip"
        >
          <h1
            className="font-mono font-black tabular-nums leading-none transition-colors duration-500 select-none"
            style={{ fontSize: timerFontSize, color: timerColor, filter: timerGlow }}
          >
            {formattedTime}
          </h1>
          <span className="absolute -bottom-6 right-0 text-[11px] text-slate-600 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Click to skip →
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-slate-500 text-lg mt-10 tracking-wide select-none">
          {isGameTime
            ? `Game ends at ${endTimeStr}`
            : 'Next meeting · Wednesday · 6:00 PM'}
        </p>

      </div>

      {/* Bottom brand bar */}
      <BrandBar />
    </div>
  );
};
