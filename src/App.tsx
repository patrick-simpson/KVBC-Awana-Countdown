import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppMode } from './types';
import { CLUBS } from './config';
import { stateKey, type ResolvedState } from './lib/schedule';
import { DUR, EASE } from './lib/motion-tokens';
import { useClock } from './hooks/useClock';
import { useSchedule } from './hooks/useSchedule';
import { CountdownView } from './components/CountdownView';
import { SlideshowView } from './components/SlideshowView';
import { ShutdownView } from './views/ShutdownView';
import { QuickNav } from './views/QuickNav';

const OPENING_WINDOW_INDEX = 0;

export const App: React.FC = () => {
  const now = useClock();
  const { state, isOverride, select, resume } = useSchedule(now);

  return (
    <div className="w-full h-full relative group" style={{ background: '#000000' }}>
      <QuickNav state={state} isOverride={isOverride} onSelect={select} onResume={resume} />

      <AnimatePresence mode="wait">
        <motion.div
          key={stateKey(state)}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: DUR.mode, ease: EASE.smooth }}
        >
          <ActiveView
            state={state}
            onSkipCountdown={() => select({ type: 'window', index: OPENING_WINDOW_INDEX })}
            onExitSlideshow={() => select({ type: 'countdown' })}
            onRestart={() => select({ type: 'countdown' })}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const ActiveView: React.FC<{
  state: ResolvedState;
  onSkipCountdown: () => void;
  onExitSlideshow: () => void;
  onRestart: () => void;
}> = ({ state, onSkipCountdown, onExitSlideshow, onRestart }) => {
  switch (state.mode) {
    case AppMode.COUNTDOWN:
      return <CountdownView targetDate={state.target} onComplete={onSkipCountdown} />;
    case AppMode.GAME_TIME:
      return (
        <CountdownView
          targetDate={state.endsAt}
          onComplete={() => {}}
          title={state.window.title}
          clubColor={CLUBS[state.window.clubs[0]].color}
        />
      );
    case AppMode.SLIDESHOW:
      return <SlideshowView onExit={onExitSlideshow} />;
    case AppMode.SHUTDOWN:
      return <ShutdownView onRestart={onRestart} />;
  }
};

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
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white p-8">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
          <div className="bg-black p-4 rounded border border-gray-700 max-w-2xl overflow-auto">
            <p className="font-mono text-sm text-red-300">{this.state.error?.toString()}</p>
            <p className="mt-4 text-gray-400 text-sm">Check the console for more details.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default App;
