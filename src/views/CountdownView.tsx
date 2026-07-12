import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenFrame } from '../components/ScreenFrame';
import { WeatherScene } from '../components/WeatherScene';
import { AmbientOrbs } from '../components/AmbientOrbs';
import { ParticleField } from '../components/ParticleField';
import { SparkleDoodles } from '../components/SparkleDoodles';
import { ClubWave } from '../components/ClubWave';
import { Logo } from '../components/Logo';
import { Badge } from '../components/Badge';
import { BigTimer } from '../components/BigTimer';
import { EventChips } from '../components/EventChips';
import { GlowText } from '../components/GlowText';
import { secondsUntil } from '../lib/schedule';
import { DUR, EASE } from '../lib/motion-tokens';
import { useKeydown } from '../hooks/useKeydown';
import { useWeather } from '../hooks/useWeather';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

interface CountdownViewProps {
  now: Date;
  target: Date;
  /** Operator skip (Space / click) — jumps to the opening ceremony. */
  onSkip: () => void;
}

const MILESTONES = [
  { time: 3600, text: '1 HOUR TO GO!' },
  { time: 1800, text: '30 MINUTES!' },
  { time: 600, text: '10 MINUTES!' },
  { time: 300, text: '5 MINUTES!' },
  { time: 60, text: 'ALMOST TIME!' },
];

/**
 * The week-long countdown to Wednesday 6:00 PM. Time flows in via the
 * single app clock — this view owns no timers of its own.
 */
export const CountdownView: React.FC<CountdownViewProps> = ({ now, target, onSkip }) => {
  const seconds = secondsUntil(target, now);
  const weather = useWeather();
  const events = useCalendarEvents();

  const [milestone, setMilestone] = useState<string | null>(null);
  const shownMilestones = useRef(new Set<number>());

  useEffect(() => {
    const hit = MILESTONES.find((m) => m.time === seconds);
    if (hit && !shownMilestones.current.has(hit.time)) {
      shownMilestones.current.add(hit.time);
      setMilestone(hit.text);
      const timer = setTimeout(() => setMilestone(null), 2400);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  useKeydown((e) => {
    if (['Space', 'ArrowRight', 'PageDown'].includes(e.code)) {
      e.preventDefault();
      onSkip();
    }
  });

  const coolWeather = ['rain', 'snow', 'thunder', 'fog'].includes(weather);
  const isShaking = seconds > 0 && seconds <= 10;

  const targetTimeStr = target.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <ScreenFrame
      shake={isShaking}
      vignette="deep"
      layers={
        <>
          <WeatherScene weather={weather} />
          <AmbientOrbs dim={coolWeather} />
          <ClubWave color="#F7941D" intensity={0.55} height={30} />
          <ParticleField />
          <SparkleDoodles seed={3} count={14} />
        </>
      }
    >
      {/* Logo */}
      <div className="absolute top-6 left-8 z-20">
        <Logo />
      </div>

      {/* Center stack */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">
        <Badge color="#FFC107" size="md" sparkle>
          Awana begins in
        </Badge>

        <BigTimer seconds={seconds} urgencyEnabled onClick={onSkip} />

        <div className="flex flex-col items-center gap-1">
          <GlowText
            as="p"
            size="body-lg"
            font="body"
            color="rgba(255,255,255,0.72)"
            className="tracking-wide"
          >
            Next meeting · Wednesday · {targetTimeStr}
          </GlowText>
          <GlowText
            as="p"
            size="script"
            font="script"
            color="#FFB627"
            glow="sm"
            style={{ fontWeight: 600 }}
          >
            see you there!
          </GlowText>
        </div>

        <EventChips events={events} />

        {/* Milestone burst */}
        <AnimatePresence>
          {milestone && (
            <motion.div
              className="absolute top-[12%] left-1/2 -translate-x-1/2 z-20"
              initial={{ opacity: 0, scale: 0.3, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.35, y: -30, filter: 'blur(8px)' }}
              transition={{ duration: DUR.base, ease: EASE.pop }}
            >
              <Badge color="#FFC107" size="lg" sparkle>
                {milestone}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScreenFrame>
  );
};
