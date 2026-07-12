import React from 'react';
import { Vignette } from './Vignette';
import { EdgeFade } from './EdgeFade';
import { StageGlow } from './StageGlow';

interface ScreenFrameProps {
  /** Ambient layers rendered behind the content (orbs, waves, weather…). */
  layers?: React.ReactNode;
  vignette?: 'soft' | 'deep';
  /** Tint of the floating stage-glow pool behind the content. */
  glowColor?: string;
  shake?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * The shared pure-black shell, tuned for projection on a white wall:
 * ambient layer stack, a floating stage glow, then vignette and the
 * EdgeFade projection mask so nothing bright ever touches the frame
 * edge. Content stays inside the --safe-x/--safe-y title-safe area.
 */
export const ScreenFrame: React.FC<ScreenFrameProps> = ({
  layers,
  vignette = 'soft',
  glowColor = '#FFC107',
  shake = false,
  className = '',
  children,
}) => (
  <div
    className={`w-full h-full flex flex-col relative overflow-hidden ${shake ? 'animate-screen-shake' : ''} ${className}`}
    style={{ background: '#000000' }}
  >
    {layers}
    <StageGlow color={glowColor} />
    <Vignette strength={vignette} />
    <EdgeFade />

    <div className="relative z-10 flex-1 flex flex-col min-h-0">{children}</div>
  </div>
);
