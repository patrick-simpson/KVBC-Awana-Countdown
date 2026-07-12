import React from 'react';

/**
 * A soft breathing pool of colored light behind the center content —
 * the floating replacement for the old edge-flush brand bars. Being
 * radial and center-weighted, it carries the brand color without ever
 * touching the frame edge.
 */
export const StageGlow: React.FC<{ color?: string }> = ({ color = '#FFC107' }) => (
  <div
    className="absolute inset-0 pointer-events-none z-[1] animate-breathe"
    aria-hidden="true"
    style={{
      background: `radial-gradient(ellipse 62% 48% at 50% 54%, ${color}14 0%, ${color}08 45%, transparent 70%)`,
      animationDuration: '9s',
    }}
  />
);
