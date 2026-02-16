import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';

interface StandbyViewProps {
  onStartCountdown: () => void;
  onOpenSettings: () => void;
  settings: AppSettings;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const StandbyView: React.FC<StandbyViewProps> = ({ onStartCountdown, onOpenSettings, settings }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // AUTOMATION LOGIC using Settings:
      if (
        now.getDay() === settings.autoStartDay && 
        now.getHours() === settings.autoStartHour && 
        now.getMinutes() === settings.autoStartMinute && 
        now.getSeconds() === 0
      ) {
        onStartCountdown();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onStartCountdown, settings]);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Format trigger time for display
  const triggerTime = new Date();
  triggerTime.setHours(settings.autoStartHour);
  triggerTime.setMinutes(settings.autoStartMinute);
  const triggerTimeStr = triggerTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  const triggerDayStr = DAYS[settings.autoStartDay];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white animate-fade-in relative">
      {/* Settings Button (Top Right) */}
      <button 
        onClick={onOpenSettings}
        className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors p-2"
        title="Settings"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <div className="text-center space-y-8">
        <h2 className="text-4xl text-gray-400 font-light">{formattedDate}</h2>
        
        <h1 className="text-9xl font-bold tracking-tight text-yellow-400 drop-shadow-lg">
          {formattedTime}
        </h1>

        <div className="pt-12 flex flex-col items-center">
           <p className="text-gray-500 mb-6 text-lg">
            Automatic countdown scheduled for {triggerDayStr} {triggerTimeStr}
          </p>
          
          <button
            onClick={onStartCountdown}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xl transition-all shadow-lg border-2 border-red-500 hover:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-500/50"
          >
            Start {settings.countdownDurationMinutes}-Minute Timer Now
          </button>
        </div>
      </div>
    </div>
  );
};