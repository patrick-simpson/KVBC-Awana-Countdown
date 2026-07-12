import React from 'react';
import { motion } from 'motion/react';
import { CLUBS, type ScheduleWindow } from '../config';
import { ScreenFrame } from '../components/ScreenFrame';
import { AmbientOrbs } from '../components/AmbientOrbs';
import { ParticleField } from '../components/ParticleField';
import { SparkleDoodles } from '../components/SparkleDoodles';
import { ClubWave } from '../components/ClubWave';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { Logo } from '../components/Logo';
import { Badge } from '../components/Badge';
import { BigTimer } from '../components/BigTimer';
import { GlowText } from '../components/GlowText';
import { secondsUntil } from '../lib/schedule';
import { birthdaysThisWeek, listNames } from '../lib/birthdays';
import { DUR, EASE } from '../lib/motion-tokens';
import { useBirthdays } from '../hooks/useBirthdays';

interface GameTimeViewProps {
  now: Date;
  window: ScheduleWindow & { kind: 'game' };
  endsAt: Date;
}

/**
 * Per-club game-time screen: catalog waves in the club color(s), the
 * club name as a big badge, and a timer to the window's end.
 * Combined windows (Puggles & Cubbies) get one wave per club.
 */
export const GameTimeView: React.FC<GameTimeViewProps> = ({ now, window: gameWindow, endsAt }) => {
  const clubs = gameWindow.clubs.map((id) => CLUBS[id]);
  const primary = clubs[0];
  const secondary = clubs[1];

  // This week's (Sun–Sat) birthdays for the club(s) on screen.
  const roster = useBirthdays();
  const celebrants = birthdaysThisWeek(roster, now).filter((b) => gameWindow.clubs.includes(b.club));

  const seconds = secondsUntil(endsAt, now);
  const endTimeStr = endsAt.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <ScreenFrame
      vignette="deep"
      glowColor={primary.color}
      layers={
        <>
          <AmbientOrbs tint={primary.color} />
          <ClubWave color={primary.color} position="bottom" variant={0} height={36} />
          <ClubWave
            color={(secondary ?? primary).color}
            position="top"
            variant={1}
            height={24}
            intensity={secondary ? 0.8 : 0.45}
          />
          <ParticleField />
          <SparkleDoodles
            seed={gameWindow.startMin}
            colors={[...clubs.map((c) => c.color), '#FFFFFF', '#FFC107']}
            count={16}
          />
        </>
      }
    >
      <div className="absolute z-20" style={{ top: 'var(--safe-y)', left: 'var(--safe-x)' }}>
        <Logo />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-7">
        {/* Club name badges */}
        <div className="flex gap-4 flex-wrap justify-center">
          {clubs.map((club) => (
            <Badge key={club.id} color={club.color} size="md" sparkle>
              {club.name}
            </Badge>
          ))}
        </div>

        {/* "GAME TIME!" with the catalog's playful tilt */}
        <GlowText
          as="h1"
          size="h1"
          font="display"
          color={primary.color}
          glow="lg"
          className="leading-none text-center select-none"
          style={{ transform: 'rotate(-2deg)' }}
        >
          GAME TIME!
        </GlowText>

        <BigTimer seconds={seconds} color={primary.color} />

        <GlowText
          as="p"
          size="body-lg"
          font="body"
          color="rgba(255,255,255,0.72)"
          className="tracking-wide"
        >
          Game ends at {endTimeStr}
        </GlowText>

        {/* This week's birthdays for the club(s) on screen */}
        {celebrants.length > 0 && (
          <motion.div
            className="flex flex-col items-center mt-2"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.base, ease: EASE.pop, delay: 0.25 }}
          >
            <GlowText
              as="p"
              size="script"
              font="script"
              color="#FFC107"
              glow="sm"
              style={{ fontWeight: 600, transform: 'rotate(-2deg)' }}
            >
              happy birthday
            </GlowText>
            <GlowText
              as="p"
              size="script"
              font="display"
              color="#FFFFFF"
              glow="md"
              className="text-center max-w-6xl leading-tight"
            >
              {listNames(celebrants.map((b) => b.name))}
            </GlowText>
          </motion.div>
        )}
      </div>

      {celebrants.length > 0 && <ConfettiBurst />}
    </ScreenFrame>
  );
};
