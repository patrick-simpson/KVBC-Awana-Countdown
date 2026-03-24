import React, { useState, useEffect, useRef } from 'react';
import { BrandBar } from './BrandBar';
import { ParticleField } from './ParticleField';
import { WeatherScene } from './WeatherScene';
import { EventsStrip } from './EventsStrip';
import { useWeather } from '../hooks/useWeather';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

interface CountdownViewProps {
  onComplete: () => void;
  targetDate: Date;
  title?: string;
  clubColor?: string;
}

const ORBS = [
  { color: '#E8192C', size: '70vw', top: '-22%', left: '-18%', duration: 28, delay: 0,   opacity: 0.25 },
  { color: '#FFC107', size: '48vw', top: '-16%', left: '64%',  duration: 36, delay: -13, opacity: 0.20 },
  { color: '#0072CE', size: '60vw', top: '58%',  left: '-14%', duration: 24, delay: -8,  opacity: 0.22 },
  { color: '#00A651', size: '44vw', top: '54%',  left: '66%',  duration: 32, delay: -19, opacity: 0.18 },
  { color: '#FFC107', size: '32vw', top: '34%',  left: '36%',  duration: 42, delay: -24, opacity: 0.12 },
  { color: '#E8192C', size: '24vw', top: '18%',  left: '14%',  duration: 27, delay: -6,  opacity: 0.11 },
  { color: '#0072CE', size: '22vw', top: '43%',  left: '53%',  duration: 33, delay: -15, opacity: 0.10 },
  { color: '#00A651', size: '18vw', top: '10%',  left: '78%',  duration: 45, delay: -30, opacity: 0.09 },
];

const LOGO_SRC = `${import.meta.env.BASE_URL}awana-logo.png`;

export const CountdownView: React.FC<CountdownViewProps> = ({
  onComplete,
  targetDate,
  title,
  clubColor,
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [tickKey, setTickKey] = useState(0);
  const isGameTime = !!clubColor;
  const weather = useWeather();
  const events = useCalendarEvents();

  useEffect(() => {
    const calc = () => {
      const distance = targetDate.getTime() - Date.now();
      if (distance <= 0) { onComplete(); return 0; }
      return Math.floor(distance / 1000);
    };
    setTimeLeft(calc());
    const timer = setInterval(() => {
      const next = calc();
      setTimeLeft(next);
      setTickKey(k => k + 1);
    }, 1000);
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

  const timerColor = isUrgent ? '#E8192C' : (clubColor ?? '#FFFFFF');

  // Neon text-shadow glow — much more dramatic than filter: drop-shadow
  const timerTextShadow = isUrgent
    ? '0 0 20px rgba(232,25,44,1), 0 0 50px rgba(232,25,44,0.8), 0 0 120px rgba(232,25,44,0.5), 0 0 200px rgba(232,25,44,0.3)'
    : clubColor
      ? `0 0 20px ${clubColor}FF, 0 0 50px ${clubColor}CC, 0 0 100px ${clubColor}66`
      : '0 0 18px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.18), 0 0 120px rgba(255,255,255,0.08)';

  const labelText  = isGameTime ? (title ?? 'Game Time').toUpperCase() : 'AWANA BEGINS IN';
  const labelColor = isGameTime ? timerColor : '#FFC107';
  const endTimeStr = targetDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  // Active orb color for game time (tints the orbs to club color)
  const activeOrbs = isGameTime && clubColor
    ? ORBS.map((o, i) => i % 2 === 0 ? { ...o, color: clubColor } : o)
    : ORBS;

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ background: '#04050f' }}
    >
      {/* Weather scene overlay */}
      <WeatherScene weather={weather} />

      {/* Ambient orbs */}
      {activeOrbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none animate-orbit"
          style={{
            backgroundColor: orb.color,
            width:  orb.size,
            height: orb.size,
            top:    orb.top,
            left:   orb.left,
            filter: 'blur(80px)',
            opacity: orb.opacity,
            animationDuration: `${orb.duration}s`,
            animationDelay:    `${orb.delay}s`,
          }}
        />
      ))}

      {/* Floating particles */}
      <ParticleField />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.035) 3px, rgba(0,0,0,0.035) 4px)',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Top brand bar */}
      <BrandBar height={6} />

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

        {/* Label — shimmer for main countdown, solid for game time */}
        {isGameTime ? (
          <p
            className="text-sm font-black uppercase tracking-[0.4em] mb-4 select-none animate-breathe"
            style={{ color: labelColor, textShadow: `0 0 20px ${labelColor}99` }}
          >
            {labelText}
          </p>
        ) : (
          <p className="text-sm font-black uppercase tracking-[0.4em] mb-4 select-none text-shimmer">
            {labelText}
          </p>
        )}

        {/* Timer with urgency rings */}
        <div className="cursor-pointer group relative flex items-center justify-center" onClick={onComplete} title="Click to skip">

          {/* Pulsing rings when urgent */}
          {isUrgent && (
            <>
              <div
                className="absolute rounded-full animate-pulse-ring pointer-events-none border border-[#E8192C]"
                style={{ width: '60vw', height: '60vw', opacity: 0.4 }}
              />
              <div
                className="absolute rounded-full animate-pulse-ring pointer-events-none border border-[#E8192C]"
                style={{ width: '60vw', height: '60vw', opacity: 0.4, animationDelay: '-0.7s' }}
              />
            </>
          )}

          <h1
            key={tickKey}
            className="font-mono font-black tabular-nums leading-none select-none animate-tick-pulse"
            style={{
              fontSize: timerFontSize,
              color: timerColor,
              textShadow: timerTextShadow,
            }}
          >
            {formattedTime}
          </h1>

          <span className="absolute -bottom-6 right-0 text-[11px] text-slate-600 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Click to skip →
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-slate-500 text-lg mt-12 tracking-wide select-none">
          {isGameTime
            ? `Game ends at ${endTimeStr}`
            : 'Next meeting · Wednesday · 6:00 PM'}
        </p>

        {/* Upcoming events strip */}
        {!isGameTime && <EventsStrip events={events} />}

      </div>

      {/* Bottom brand bar */}
      <BrandBar height={6} />
    </div>
  );
};
