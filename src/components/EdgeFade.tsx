import React from 'react';

/**
 * Projection mask. The app is cast by a projector onto a white wall,
 * where black = no light — so the frame disappears only if every
 * ambient layer dissolves to true #000 before reaching the edge.
 * Four feather bands (one per side, `--edge-fade` wide) paint that
 * dissolve. Each band is its own div overshooting the frame by 1px:
 * band-positioned background layers leave the final device-pixel row
 * unpainted in Chromium at fractional sizes, which reads as a bright
 * hairline on the wall. Sits above the ambience (z-0..2) and below
 * content (z-10); layers rendered above it (confetti, weather) use
 * the `.edge-mask` utility instead.
 */

const FADE = (dir: string) =>
  `linear-gradient(to ${dir}, #000 0%, #000 18%, rgb(0 0 0 / 0.62) 55%, transparent 100%)`;

const BAND = 'calc(var(--edge-fade) + 1px)';

export const EdgeFade: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none z-[3]" aria-hidden="true">
    <div className="absolute" style={{ top: -1, bottom: -1, left: -1, width: BAND, background: FADE('right') }} />
    <div className="absolute" style={{ top: -1, bottom: -1, right: -1, width: BAND, background: FADE('left') }} />
    <div className="absolute" style={{ left: -1, right: -1, top: -1, height: BAND, background: FADE('bottom') }} />
    <div className="absolute" style={{ left: -1, right: -1, bottom: -1, height: BAND, background: FADE('top') }} />
  </div>
);
