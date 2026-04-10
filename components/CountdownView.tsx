import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrandBar } from './BrandBar';
import { ParticleField } from './ParticleField';
import { WeatherScene } from './WeatherScene';
import { EventsStrip } from './EventsStrip';
import { FlipDigit } from './FlipDigit';
import { ConfettiBurst } from './ConfettiBurst';
import { useWeather } from '../hooks/useWeather';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

interface CountdownViewProps {
  onComplete: () => void;
  targetDate: Date;
  title?: string;
  clubColor?: string;
}

const BASE_ORBS = [
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

const MILESTONES = [
  { time: 3600, text: '1 HOUR TO GO!' },
  { time: 1800, text: '30 MINUTES!' },
  { time: 600,  text: '10 MINUTES!' },
  { time: 300,  text: '5 MINUTES!' },
  { time: 60,   text: 'ALMOST TIME!' },
];

// Club silhouette shapes (CSS shapes for each club)
const CLUB_SILHOUETTES: Record<string, { shapes: string[]; count: number }> = {
  '#E8192C': { shapes: ['◆', '✦', '▲'], count: 4 },  // T&T — bold geometric
  '#0072CE': { shapes: ['✦', '★', '✧'], count: 4 },  // Sparks — stars
  '#00A651': { shapes: ['●', '◉', '○'], count: 4 },  // Puggles/Cubbies — soft circles
};

export const CountdownView: React.FC<CountdownViewProps> = ({
  onComplete,
  targetDate,
  title,
  clubColor,
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [tickKey, setTickKey] = useState(0);
  const [milestone, setMilestone] = useState<string | null>(null);
  const [milestonePhase, setMilestonePhase] = useState<'enter' | 'exit'>('enter');
  const [showConfetti, setShowConfetti] = useState(false);
  const shownMilestones = useRef(new Set<number>());
  const hasCompletedRef = useRef(false);

  const isGameTime = !!clubColor;
  const weather = useWeather();
  const events = useCalendarEvents();

  // Timer
  useEffect(() => {
    const calc = () => {
      const distance = targetDate.getTime() - Date.now();
      if (distance <= 0) return 0;
      return Math.floor(distance / 1000);
    };
    setTimeLeft(calc());
    const timer = setInterval(() => {
      const next = calc();
      setTimeLeft(next);
      setTickKey(k => k + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  // Countdown completion — confetti then transition
  useEffect(() => {
    if (timeLeft <= 0 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      if (!isGameTime) {
        setShowConfetti(true);
      } else {
        onComplete();
      }
    }
  }, [timeLeft, isGameTime, onComplete]);

  // Milestone detection
  useEffect(() => {
    if (isGameTime) return;
    const ms = MILESTONES.find(m => m.time === timeLeft);
    if (ms && !shownMilestones.current.has(ms.time)) {
      shownMilestones.current.add(ms.time);
      setMilestone(ms.text);
      setMilestonePhase('enter');
      const exitTimer = setTimeout(() => setMilestonePhase('exit'), 1800);
      const clearTimer = setTimeout(() => setMilestone(null), 2400);
      return () => { clearTimeout(exitTimer); clearTimeout(clearTimer); };
    }
  }, [timeLeft, isGameTime]);

  // Keyboard skip
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

  const timerFontSize = days > 0 ? '10vw' : '20vw';
  const isUrgent     = timeLeft > 0 && timeLeft < 60;
  const isShaking    = timeLeft > 0 && timeLeft <= 10;
  const timerColor   = isUrgent ? '#E8192C' : (clubColor ?? '#FFFFFF');

  const timerTextShadow = isUrgent
    ? '0 0 20px rgba(232,25,44,1), 0 0 50px rgba(232,25,44,0.8), 0 0 120px rgba(232,25,44,0.5), 0 0 200px rgba(232,25,44,0.3)'
    : clubColor
      ? `0 0 20px ${clubColor}FF, 0 0 50px ${clubColor}CC, 0 0 100px ${clubColor}66`
      : '0 0 18px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.18), 0 0 120px rgba(255,255,255,0.08)';

  const labelText  = isGameTime ? (title ?? 'Game Time').toUpperCase() : 'AWANA BEGINS IN';
  const labelColor = isGameTime ? timerColor : '#FFC107';
  const endTimeStr = targetDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  // Weather-reactive orb colors
  const activeOrbs = useMemo(() => {
    const coolWeathers = ['rain', 'snow', 'thunder', 'fog'];
    const isCool = coolWeathers.includes(weather);

    if (isGameTime && clubColor) {
      return BASE_ORBS.map((o, i) => i % 2 === 0 ? { ...o, color: clubColor } : o);
    }
    if (isCool) {
      return BASE_ORBS.map(o => ({
        ...o,
        color: o.color === '#E8192C' ? '#1a3a5c' :
               o.color === '#FFC107' ? '#2a5a8c' :
               o.color === '#00A651' ? '#0a3a6c' : o.color,
        opacity: o.opacity * 0.8,
      }));
    }
    return BASE_ORBS;
  }, [weather, isGameTime, clubColor]);

  // Silhouette data for game time
  const silhouettes = useMemo(() => {
    if (!clubColor || !CLUB_SILHOUETTES[clubColor]) return [];
    const cfg = CLUB_SILHOUETTES[clubColor];
    return Array.from({ length: cfg.count }, (_, i) => ({
      id: i,
      shape: cfg.shapes[i % cfg.shapes.length],
      left: `${15 + (i * 23) % 70}%`,
      top: `${20 + (i * 19) % 55}%`,
      size: `${6 + (i % 3) * 3}vw`,
      duration: 20 + (i % 4) * 8,
      delay: -(i * 5),
      opacity: 0.04 + (i % 3) * 0.015,
    }));
  }, [clubColor]);

  // Build flip digit segments
  const renderFlipTimer = () => {
    const digitStyle = {
      fontSize: timerFontSize,
      color: timerColor,
      textShadow: timerTextShadow,
    };

    if (days > 0) {
      const dStr = days.toString();
      const hStr = hours.toString().padStart(2, '0');
      const mStr = minutes.toString().padStart(2, '0');
      return (
        <div className="font-mono font-black tabular-nums leading-none select-none flex items-end" style={digitStyle}>
          {dStr.split('').map((d, i) => <FlipDigit key={`d${i}`} value={d} />)}
          <span className="opacity-50" style={{ fontSize: `calc(${timerFontSize} * 0.5)`, marginLeft: '0.1em', marginRight: '0.3em' }}>d</span>
          {hStr.split('').map((d, i) => <FlipDigit key={`h${i}`} value={d} />)}
          <span className="opacity-50" style={{ fontSize: `calc(${timerFontSize} * 0.5)`, marginLeft: '0.1em', marginRight: '0.3em' }}>h</span>
          {mStr.split('').map((d, i) => <FlipDigit key={`m${i}`} value={d} />)}
          <span className="opacity-50" style={{ fontSize: `calc(${timerFontSize} * 0.5)`, marginLeft: '0.1em' }}>m</span>
        </div>
      );
    }

    const hStr = hours > 0 ? hours.toString() : '';
    const mStr = minutes.toString().padStart(hours > 0 ? 2 : 1, '0');
    const sStr = seconds.toString().padStart(2, '0');

    return (
      <div className="font-mono font-black tabular-nums leading-none select-none flex items-center" style={digitStyle}>
        {hStr && (
          <>
            {hStr.split('').map((d, i) => <FlipDigit key={`h${i}`} value={d} />)}
            <span style={{ animation: 'colonPulse 1s ease-in-out infinite', marginInline: '0.05em' }}>:</span>
          </>
        )}
        {mStr.split('').map((d, i) => <FlipDigit key={`m${i}`} value={d} />)}
        <span style={{ animation: 'colonPulse 1s ease-in-out infinite', marginInline: '0.05em' }}>:</span>
        {sStr.split('').map((d, i) => <FlipDigit key={`s${i}`} value={d} />)}
      </div>
    );
  };

  return (
    <div
      className={`w-full h-full flex flex-col relative overflow-hidden ${isShaking ? 'animate-screen-shake' : ''}`}
      style={{ background: '#000000' }}
    >
      {/* Weather scene */}
      <WeatherScene weather={weather} />

      {/* Aurora effect for game time */}
      {isGameTime && clubColor && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${15 + i * 28}%`,
                left: '-50%',
                width: '200%',
                height: '25vh',
                background: `linear-gradient(90deg, transparent 10%, ${clubColor}12 30%, ${clubColor}08 50%, ${clubColor}12 70%, transparent 90%)`,
                animation: `auroraWave ${18 + i * 7}s ease-in-out infinite`,
                animationDelay: `${-i * 5}s`,
                filter: 'blur(40px)',
              }}
            />
          ))}
        </div>
      )}

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
            transition: 'background-color 3s ease, opacity 3s ease',
          }}
        />
      ))}

      {/* Club silhouettes */}
      {isGameTime && silhouettes.map(s => (
        <div
          key={s.id}
          className="absolute pointer-events-none select-none animate-orbit"
          style={{
            left: s.left,
            top: s.top,
            fontSize: s.size,
            color: clubColor,
            opacity: s.opacity,
            filter: 'blur(2px)',
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.shape}
        </div>
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

      {/* Scoreboard frame for game time */}
      {isGameTime && clubColor && (
        <div
          className="absolute pointer-events-none z-[3] rounded-3xl animate-scoreboard-pulse"
          style={{
            top: '8%',
            left: '6%',
            right: '6%',
            bottom: '8%',
            border: `2px solid ${clubColor}30`,
            boxShadow: `0 0 40px ${clubColor}15, inset 0 0 40px ${clubColor}08`,
            borderRadius: '2rem',
          }}
        />
      )}

      {/* Top brand bar */}
      <BrandBar height={6} />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">

        {/* Animated logo */}
        <div className="absolute top-6 left-8">
          <div className="bg-white rounded-2xl px-4 py-2 shadow-xl animate-logo-glow">
            <img
              src={LOGO_SRC}
              alt="Awana"
              className="h-12 w-auto"
              onError={(e) => { (e.target as HTMLElement).parentElement!.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Label */}
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

          {/* Flip digit timer */}
          {renderFlipTimer()}

          <span className="absolute -bottom-6 right-0 text-[11px] text-slate-600 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Click to skip →
          </span>
        </div>

        {/* Milestone callout overlay */}
        {milestone && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              animation: milestonePhase === 'enter'
                ? 'milestoneEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                : 'milestoneExit 0.6s ease-in forwards',
            }}
          >
            <p
              className="text-4xl font-black uppercase tracking-[0.3em] text-center"
              style={{
                color: '#FFC107',
                textShadow: '0 0 30px rgba(255,193,7,0.8), 0 0 60px rgba(255,193,7,0.4), 0 0 100px rgba(255,193,7,0.2)',
              }}
            >
              {milestone}
            </p>
          </div>
        )}

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

      {/* Confetti burst */}
      {showConfetti && (
        <ConfettiBurst onComplete={onComplete} />
      )}
    </div>
  );
};
