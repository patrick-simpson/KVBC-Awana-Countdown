import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppMode } from './types';
import { stateKey, type ResolvedState } from './lib/schedule';
import { adoptPusherUrlFlags } from './lib/pusher';
import { DUR, EASE } from './lib/motion-tokens';
import { useClock } from './hooks/useClock';
import { useSchedule, type NavTarget } from './hooks/useSchedule';
import { useBirthdaySync } from './hooks/useBirthdaySync';
import { ViewErrorBoundary } from './components/ViewErrorBoundary';
import { ResumePill } from './components/ResumePill';
import { CountdownView } from './views/CountdownView';
import { GameTimeView } from './views/GameTimeView';
import { SlideshowView } from './views/SlideshowView';
import { ShutdownView } from './views/ShutdownView';
import { QuickNav } from './views/QuickNav';

const OPENING_WINDOW_INDEX = 0;

export const App: React.FC = () => {
  const now = useClock();
  const { state, isOverride, resumeAt, select, resume, stay } = useSchedule(now);

  // One-time startup chores: persist ?pusherKey= provisioning, then keep
  // the live birthday roster synced from the print server's broadcast.
  useEffect(() => adoptPusherUrlFlags(), []);
  useBirthdaySync();

  return (
    <div className="w-full h-full relative" style={{ background: '#000000' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={stateKey(state)}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: DUR.mode, ease: EASE.smooth }}
        >
          <ViewErrorBoundary label={labelFor(state)}>
            <ActiveView state={state} now={now} onSelect={select} />
          </ViewErrorBoundary>
        </motion.div>
      </AnimatePresence>

      <QuickNav now={now} state={state} isOverride={isOverride} onSelect={select} onResume={resume} />
      {isOverride && <ResumePill now={now} resumeAt={resumeAt} onStay={stay} />}
    </div>
  );
};

const labelFor = (state: ResolvedState): string =>
  ({
    [AppMode.COUNTDOWN]: 'countdown',
    [AppMode.GAME_TIME]: 'game time',
    [AppMode.SLIDESHOW]: 'slideshow',
    [AppMode.SHUTDOWN]: 'shutdown',
  })[state.mode];

const ActiveView: React.FC<{
  state: ResolvedState;
  now: Date;
  onSelect: (target: NavTarget) => void;
}> = ({ state, now, onSelect }) => {
  switch (state.mode) {
    case AppMode.COUNTDOWN:
      return (
        <CountdownView
          now={now}
          target={state.target}
          onSkip={() => onSelect({ type: 'window', index: OPENING_WINDOW_INDEX })}
        />
      );
    case AppMode.GAME_TIME:
      return <GameTimeView now={now} window={state.window} endsAt={state.endsAt} />;
    case AppMode.SLIDESHOW:
      return (
        <SlideshowView
          deck={state.deck}
          now={now}
          onExit={() => onSelect({ type: 'countdown' })}
        />
      );
    case AppMode.SHUTDOWN:
      return <ShutdownView onRestart={() => onSelect({ type: 'countdown' })} />;
  }
};

/** Last-resort boundary (per-view boundaries catch view crashes first). */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center h-screen w-screen p-8 gap-6"
          style={{ background: '#000000' }}
        >
          <h1
            className="gradient-text-amber"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h1)', lineHeight: 1 }}
          >
            OOPS!
          </h1>
          <p
            className="text-white/70 text-center"
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body-lg)' }}
          >
            Something went wrong — the show must go on.
          </p>
          <p
            className="text-white/30 text-sm max-w-2xl overflow-auto text-center"
            style={{ fontFamily: 'var(--font-condensed)', fontWeight: 600, letterSpacing: '0.05em' }}
          >
            {this.state.error?.toString()}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 rounded-full border-2 text-white uppercase transition-transform hover:scale-105"
            style={{
              fontFamily: 'var(--font-condensed)',
              fontWeight: 800,
              letterSpacing: '0.15em',
              borderColor: '#FFC107',
              boxShadow: '0 0 18px rgba(255,193,7,0.45)',
              background: 'rgba(10,10,10,0.72)',
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default App;
