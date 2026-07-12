import React from 'react';

/**
 * Center-shaping falloff: gently darkens away from the middle so the
 * content pops. The hard edge kill is EdgeFade's job — this only
 * shapes the light. (The old Scanlines overlay is gone: an emissive
 * CRT texture painted the whole projector rectangle onto the wall.)
 */
export const Vignette: React.FC<{ strength?: 'soft' | 'deep' }> = ({ strength = 'soft' }) => (
  <div
    className="absolute inset-0 pointer-events-none z-[2]"
    aria-hidden="true"
    style={{
      background:
        strength === 'deep'
          ? 'radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(0,0,0,0.6) 90%)'
          : 'radial-gradient(ellipse at 50% 50%, transparent 28%, rgba(0,0,0,0.55) 92%)',
    }}
  />
);
