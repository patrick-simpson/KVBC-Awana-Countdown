import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AppMode, ScheduleItem } from './types';
import { CountdownView } from './components/CountdownView';
import { SlideshowView } from './components/SlideshowView';
import { SCHEDULE } from './constants';

export const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.COUNTDOWN);
  const [activeScheduleItem, setActiveScheduleItem] = useState<ScheduleItem | null>(null);
  const [isManualOverride, setIsManualOverride] = useState(false);

  const getNextTargetDate = useCallback(() => {
    const now = new Date();
    const target = new Date();
    // Hard-coded target: Wednesday (3) at 6:00 PM (18:00)
    const targetDay = 3;
    const targetHour = 18;
    const targetMinute = 0;
    
    target.setHours(targetHour, targetMinute, 0, 0);
    let daysUntil = (targetDay - now.getDay() + 7) % 7;
    if (daysUntil === 0 && target <= now) { daysUntil = 7; }
    target.setDate(now.getDate() + daysUntil);
    return target;
  }, []);

  const nextTargetDate = useMemo(() => getNextTargetDate(), [getNextTargetDate]);

  useEffect(() => {
    if (isManualOverride) return;

    const checkSchedule = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const scheduledItem = SCHEDULE.find(item => {
        const startTotal = item.startHour * 60 + item.startMinute;
        const endTotal = item.endHour * 60 + item.endMinute;
        return currentTimeInMinutes >= startTotal && currentTimeInMinutes < endTotal;
      });

      if (scheduledItem) {
        setMode(scheduledItem.mode);
        setActiveScheduleItem(scheduledItem);
      } else {
        if (currentTimeInMinutes < 18 * 60 + 5) {
          setMode(AppMode.COUNTDOWN);
        } else {
          setMode(AppMode.SLIDESHOW);
        }
        setActiveScheduleItem(null);
      }
    };

    checkSchedule();
    const timer = setInterval(checkSchedule, 10000);
    return () => clearInterval(timer);
  }, [isManualOverride]);

  const handleCountdownComplete = useCallback(() => {
    setMode(AppMode.SLIDESHOW);
    setIsManualOverride(false);
  }, []);

  const handleReturnToCountdown = useCallback(() => {
    setMode(AppMode.COUNTDOWN);
    setIsManualOverride(false);
  }, []);

  const handleManualSelect = (item: ScheduleItem | 'COUNTDOWN' | 'SLIDESHOW') => {
    setIsManualOverride(true);
    if (item === 'COUNTDOWN') {
      setMode(AppMode.COUNTDOWN);
      setActiveScheduleItem(null);
    } else if (item === 'SLIDESHOW') {
      setMode(AppMode.SLIDESHOW);
      setActiveScheduleItem(null);
    } else {
      setMode(item.mode);
      setActiveScheduleItem(item);
    }
  };

  const gameTimeTarget = useMemo(() => {
    if (!activeScheduleItem) return new Date();
    const target = new Date();
    target.setHours(activeScheduleItem.endHour, activeScheduleItem.endMinute, 0, 0);
    return target;
  }, [activeScheduleItem]);

  return (
    <div className="w-full h-full relative group">
      {/* Hidden Quick Nav - visible on hover in a corner */}
      <div className="absolute top-4 right-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 items-end">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-2 rounded-xl flex flex-col gap-1 shadow-2xl">
          <button 
            onClick={() => handleManualSelect('COUNTDOWN')}
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all text-right"
          >
            Main Countdown
          </button>
          {SCHEDULE.map((item, idx) => (
            <button 
              key={idx}
              onClick={() => handleManualSelect(item)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all text-right ${
                activeScheduleItem === item ? 'text-white bg-white/20' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.title}
            </button>
          ))}
          {isManualOverride && (
            <button 
              onClick={() => setIsManualOverride(false)}
              className="mt-2 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all border border-emerald-400/20 text-center"
            >
              Resume Schedule
            </button>
          )}
        </div>
      </div>

      {mode === AppMode.COUNTDOWN && (
        <CountdownView targetDate={nextTargetDate} onComplete={handleCountdownComplete} />
      )}
      
      {mode === AppMode.GAME_TIME && activeScheduleItem && (
        <CountdownView
          targetDate={gameTimeTarget}
          onComplete={() => {}}
          title={activeScheduleItem.title}
          clubColor={activeScheduleItem.clubColor}
        />
      )}

      {mode === AppMode.SLIDESHOW && (
        <SlideshowView onExit={handleReturnToCountdown} />
      )}

      {mode === AppMode.SHUTDOWN && (
        <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: '#04050f' }}>
          <p className="text-xs font-black uppercase tracking-[0.4em] mb-6 text-shimmer">Awana Night</p>
          <h1
            className="text-7xl font-black text-white text-center leading-tight mb-4 animate-pop-in"
            style={{ textShadow: '0 0 40px rgba(255,255,255,0.4), 0 0 100px rgba(255,255,255,0.15)' }}
          >
            See you next week!
          </h1>
          <p className="text-slate-500 text-lg tracking-wide animate-slide-up-fade">Have a safe drive home.</p>
        </div>
      )}
    </div>
  );
};

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white p-8">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
          <div className="bg-black p-4 rounded border border-gray-700 max-w-2xl overflow-auto">
            <p className="font-mono text-sm text-red-300">{this.state.error?.toString()}</p>
            <p className="mt-4 text-gray-400 text-sm">Check the console for more details.</p>
          </div>
          <button onClick={() => window.location.reload()} className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold">Reload Application</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default App;
