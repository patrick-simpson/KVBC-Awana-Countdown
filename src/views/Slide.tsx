import React from 'react';
import type { SlideDef } from '../config';
import { ScreenFrame } from '../components/ScreenFrame';
import { AmbientOrbs } from '../components/AmbientOrbs';
import { ParticleField } from '../components/ParticleField';
import { SparkleDoodles } from '../components/SparkleDoodles';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { Logo } from '../components/Logo';
import { Badge } from '../components/Badge';
import { Eyebrow } from '../components/Eyebrow';
import { GlowText } from '../components/GlowText';
import { rgbTriple } from '../lib/color';

interface SlideProps {
  slide: SlideDef;
  now: Date;
  onNext?: () => void;
}

/**
 * One slide, laid out by its explicit `layout` field (the old version
 * guessed from slide id and body length).
 */
export const Slide: React.FC<SlideProps> = ({ slide, now, onNext }) => {
  const timeString = now.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <ScreenFrame
      layers={
        <>
          <AmbientOrbs variant="quiet" />
          <ParticleField />
          <SparkleDoodles seed={slide.id.length + slide.title.length} count={slide.layout === 'celebration' ? 22 : 10} />
        </>
      }
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-10 py-5 flex-shrink-0">
        <Logo size="sm" />
        {slide.showClock && (
          <div
            className="text-slate-200 tabular-nums select-none"
            style={{
              fontFamily: 'var(--font-condensed)',
              fontWeight: 700,
              fontSize: 'clamp(1.25rem, 1.8vw, 2.25rem)',
              letterSpacing: '0.08em',
              textShadow: '0 0 20px rgba(255,255,255,0.3)',
            }}
          >
            {timeString}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="relative mx-10 flex-shrink-0">
        <div className="h-px bg-white/10" />
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-px" />
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-16 pb-10 min-h-0">
        <SlideBody slide={slide} />
      </div>

      {slide.layout === 'celebration' && <ConfettiBurst />}

      {/* Invisible right-edge next-slide click zone */}
      {onNext && (
        <button
          onClick={onNext}
          className="absolute inset-y-0 right-0 w-24 cursor-pointer z-50 focus:outline-none opacity-0"
          aria-label="Next Slide"
        />
      )}
    </ScreenFrame>
  );
};

const SlideBody: React.FC<{ slide: SlideDef }> = ({ slide }) => {
  switch (slide.layout) {
    case 'celebration':
      return (
        <>
          <GlowHeadline text={slide.title} gradient="rainbow" size="display" />
          {slide.subtitle && <ScriptLine text={slide.subtitle} color="#FFC107" />}
        </>
      );

    case 'welcome':
      return (
        <>
          <Eyebrow className="mb-6">{slide.title}</Eyebrow>
          <GlowHeadline text={slide.title} gradient="rainbow" size="display" />
          {slide.subtitle && <ScriptLine text={slide.subtitle} color="#FFFFFF" />}
        </>
      );

    case 'pledge':
      return (
        <>
          <Badge color={slide.accentColor ?? '#FFC107'} size="md" sparkle className="mb-12">
            {slide.title}
          </Badge>
          <p
            className="text-white text-center max-w-[90rem] leading-snug"
            style={{
              fontFamily: 'var(--font-condensed)',
              fontWeight: 700,
              fontSize: 'var(--text-pledge)',
              ['--glow-color' as string]: '255 255 255',
              textShadow: 'var(--glow-sm)',
            }}
          >
            {slide.body}
          </p>
        </>
      );

    case 'closing':
      return (
        <>
          <GlowHeadline text={slide.title} gradient="amber" size="h1" />
          {slide.body && <ScriptLine text={slide.body} color="#FFC107" />}
        </>
      );
  }
};

/** Display headline with the blurred glow layer behind gradient text. */
const GlowHeadline: React.FC<{
  text: string;
  gradient: 'rainbow' | 'amber';
  size: 'display' | 'h1';
}> = ({ text, gradient, size }) => (
  <div className="relative">
    <h1
      className="leading-none text-center absolute inset-0"
      aria-hidden="true"
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: `var(--text-${size})`,
        color: '#ffffff',
        filter: 'blur(35px)',
        opacity: 0.4,
      }}
    >
      {text}
    </h1>
    <h1
      className={`leading-none text-center relative ${
        gradient === 'rainbow' ? 'gradient-text-animated' : 'gradient-text-amber'
      }`}
      style={{ fontFamily: 'var(--font-display)', fontSize: `var(--text-${size})` }}
    >
      {text}
    </h1>
  </div>
);

/** Casual handwritten accent line (catalog script labels). */
const ScriptLine: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <GlowText
    as="p"
    size="script"
    font="script"
    color={color}
    glow="sm"
    className="mt-8 text-center"
    style={{ ['--glow-color' as string]: rgbTriple(color), fontWeight: 600 }}
  >
    {text}
  </GlowText>
);
