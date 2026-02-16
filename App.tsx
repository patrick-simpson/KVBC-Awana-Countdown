import React, { useState, useCallback } from 'react';
import { AppMode, AppSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { StandbyView } from './components/StandbyView';
import { CountdownView } from './components/CountdownView';
import { SlideshowView } from './components/SlideshowView';
import { SettingsView } from './components/SettingsView';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.STANDBY);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const handleStartCountdown = useCallback(() => {
    setMode(AppMode.COUNTDOWN);
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setMode(AppMode.SLIDESHOW);
  }, []);

  const handleReturnToStandby = useCallback(() => {
    setMode(AppMode.STANDBY);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setMode(AppMode.SETTINGS);
  }, []);

  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    setMode(AppMode.STANDBY);
  }, []);

  const handleCancelSettings = useCallback(() => {
    setMode(AppMode.STANDBY);
  }, []);

  return (
    <div className="w-full h-full relative">
      {mode === AppMode.STANDBY && (
        <StandbyView 
          onStartCountdown={handleStartCountdown} 
          onOpenSettings={handleOpenSettings}
          settings={settings}
        />
      )}
      
      {mode === AppMode.SETTINGS && (
        <SettingsView 
          currentSettings={settings}
          onSave={handleSaveSettings}
          onCancel={handleCancelSettings}
        />
      )}

      {mode === AppMode.COUNTDOWN && (
        <CountdownView 
          durationMinutes={settings.countdownDurationMinutes}
          onComplete={handleCountdownComplete} 
          onCancel={handleReturnToStandby}
        />
      )}

      {mode === AppMode.SLIDESHOW && (
        <SlideshowView onExit={handleReturnToStandby} settings={settings} />
      )}
    </div>
  );
};

export default App;