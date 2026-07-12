import React from 'react';
import { CLUBS, type ScheduleWindow } from '../config';
import { ScreenFrame } from '../components/ScreenFrame';
import { AmbientOrbs } from '../components/AmbientOrbs';
import { ParticleField } from '../components/ParticleField';
import { SparkleDoodles } from '../components/SparkleDoodles';
import { ClubWave } from '../components/ClubWave';
import { Logo } from '../components/Logo';
import { Badge } from '../components/Badge';
import { BigTimer } from '../components/BigTimer';
import { GlowText } from '../components/GlowText';
import { secondsUntil } from '../lib/schedule';

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

  const seconds = secondsUntil(endsAt, now);
  const endTimeStr = endsAt.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <ScreenFrame
      vignette="deep"
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
      <div className="absolute top-6 left-8 z-20">
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
      </div>
    </ScreenFrame>
  );
};
