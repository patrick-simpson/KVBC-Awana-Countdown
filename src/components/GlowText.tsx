import React from 'react';
import { rgbTriple } from '../lib/color';

type GlowSize = 'sm' | 'md' | 'lg';
type TextSize = 'timer' | 'timer-days' | 'display' | 'h1' | 'pledge' | 'eyebrow' | 'body-lg' | 'script';
type FontRole = 'display' | 'condensed' | 'body' | 'script';

interface GlowTextProps {
  as?: 'h1' | 'h2' | 'p' | 'div' | 'span';
  size: TextSize;
  font?: FontRole;
  color?: string;
  glow?: GlowSize;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Typography + glow in one place: size and font come from the token
 * scale, the glow color is derived from the text color. Replaces the
 * per-view one-off text-shadow literals.
 */
export const GlowText: React.FC<GlowTextProps> = ({
  as: Tag = 'div',
  size,
  font = 'display',
  color = '#FFFFFF',
  glow,
  className = '',
  style,
  children,
}) => (
  <Tag
    className={className}
    style={{
      fontSize: `var(--text-${size})`,
      fontFamily: `var(--font-${font})`,
      color,
      ...(glow
        ? {
            ['--glow-color' as string]: rgbTriple(color),
            textShadow: `var(--glow-${glow})`,
          }
        : {}),
      ...style,
    }}
  >
    {children}
  </Tag>
);
