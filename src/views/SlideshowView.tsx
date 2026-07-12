import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DECKS, type DeckId } from '../config';
import { DUR, EASE } from '../lib/motion-tokens';
import { useKeydown } from '../hooks/useKeydown';
import { Badge } from '../components/Badge';
import { GlassPanel } from '../components/GlassPanel';
import { Slide } from './Slide';

interface SlideshowViewProps {
  deck: DeckId;
  now: Date;
  onExit: () => void;
}

type Direction = 1 | -1;

const flipVariants = {
  enter: (dir: Direction) => ({ rotateY: dir === 1 ? 90 : -90, opacity: 0 }),
  center: { rotateY: 0, opacity: 1 },
  exit: (dir: Direction) => ({ rotateY: dir === 1 ? -90 : 90, opacity: 0 }),
};

/**
 * Slide deck with the 3D flip rebuilt on AnimatePresence — no
 * setTimeout state machine, and keypresses are never dropped
 * mid-transition.
 */
export const SlideshowView: React.FC<SlideshowViewProps> = ({ deck, now, onExit }) => {
  const slides = DECKS[deck];
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const [escArmed, setEscArmed] = useState(false);

  const slide = slides[Math.min(index, slides.length - 1)];

  const goTo = (next: number, dir: Direction) => {
    if (next < 0 || next >= slides.length) return;
    setDirection(dir);
    setIndex(next);
  };
  const goNext = () => goTo(index + 1, 1);
  const goPrev = () => goTo(index - 1, -1);

  // Auto-advance (leader can always advance manually first)
  useEffect(() => {
    if (!slide.duration || index >= slides.length - 1) return;
    const timer = setTimeout(goNext, slide.duration * 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slide.duration, slides.length]);

  // Escape is press-twice (replaces the old window.confirm dialog)
  useEffect(() => {
    if (!escArmed) return;
    const timer = setTimeout(() => setEscArmed(false), 3000);
    return () => clearTimeout(timer);
  }, [escArmed]);

  useKeydown((e) => {
    if (['Space', 'ArrowRight', 'PageDown'].includes(e.code)) {
      e.preventDefault();
      goNext();
    } else if (['ArrowLeft', 'PageUp'].includes(e.code)) {
      e.preventDefault();
      goPrev();
    } else if (e.code === 'Escape') {
      if (escArmed) onExit();
      else setEscArmed(true);
    }
  });

  return (
    <div className="w-full h-full relative group" style={{ background: '#000000', perspective: '1200px' }}>
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          custom={direction}
          variants={flipVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: DUR.slow, ease: EASE.smooth }}
          style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
        >
          <Slide slide={slide} now={now} onNext={index < slides.length - 1 ? goNext : undefined} />
        </motion.div>
      </AnimatePresence>

      {/* Exit confirmation toast */}
      <AnimatePresence>
        {escArmed && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 z-50"
            style={{ bottom: 'var(--safe-y)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: DUR.fast, ease: EASE.smooth }}
          >
            <Badge color="#FFC107" size="sm" sparkle>
              Press ESC again to exit
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover navigation */}
      <div
        className="fixed opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50"
        style={{ bottom: 'var(--safe-y)', right: 'var(--safe-x)' }}
      >
        <GlassPanel className="flex gap-1 p-1">
          <NavPill disabled={index === 0} onClick={goPrev}>
            <ChevronLeft size={16} strokeWidth={2.5} />
            Prev
          </NavPill>
          <NavPill disabled={index === slides.length - 1} onClick={goNext}>
            Next
            <ChevronRight size={16} strokeWidth={2.5} />
          </NavPill>
        </GlassPanel>
      </div>
    </div>
  );
};

const NavPill: React.FC<{
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ disabled, onClick, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs uppercase disabled:opacity-25 hover:bg-white/15 transition-all"
    style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700, letterSpacing: '0.12em' }}
  >
    {children}
  </button>
);
