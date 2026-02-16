import React, { useState, useCallback, useMemo } from 'react';
import { AppMode, AppSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { CountdownView } from './components/CountdownView';
import { SlideshowView } from './components/SlideshowView';
import { SettingsView } from './components/SettingsView';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.COUNTDOWN);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Helper to calculate the next occurrence of the configured day/time
  const getNextTargetDate = useCallback((s: AppSettings) => {
    const now = new Date();
    const target = new Date();
    
    target.setHours(s.autoStartHour, s.autoStartMinute, 0, 0);
    
    // Calculate days until next occurrence
    // current: 0(Sun) - 6(Sat)
    // target: s.autoStartDay
    const currentDay = now.getDay();
    let daysUntil = (s.autoStartDay - currentDay + 7) % 7;
    
    // If it's today but the time has passed, move to next week
    if (daysUntil === 0 && target <= now) {
      daysUntil = 7;
    }
    
    target.setDate(now.getDate() + daysUntil);
    return target;
  }, []);

  const nextTargetDate = useMemo(() => getNextTargetDate(settings), [settings, getNextTargetDate]);

  const handleCountdownComplete = useCallback(() => {
    setMode(AppMode.SLIDESHOW);
  }, []);

  const handleReturnToCountdown = useCallback(() => {
    setMode(AppMode.COUNTDOWN);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setMode(AppMode.SETTINGS);
  }, []);

  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    setMode(AppMode.COUNTDOWN);
  }, []);

  const handleCancelSettings = useCallback(() => {
    setMode(AppMode.COUNTDOWN);
  }, []);

  return (
    <div className="w-full h-full relative">
      
      {mode === AppMode.SETTINGS && (
        <SettingsView 
          currentSettings={settings}
          onSave={handleSaveSettings}
          onCancel={handleCancelSettings}
        />
      )}

      {mode === AppMode.COUNTDOWN && (
        <CountdownView 
          targetDate={nextTargetDate}
          onComplete={handleCountdownComplete}
          onOpenSettings={handleOpenSettings}
        />
      )}

      {mode === AppMode.SLIDESHOW && (
        <SlideshowView onExit={handleReturnToCountdown} settings={settings} />
      )}
    </div>
  );
};

export default App;