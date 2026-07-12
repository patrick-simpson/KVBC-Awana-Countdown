import React from 'react';
import { CLUBS, WEDNESDAY_SCHEDULE } from '../config';
import { stateKey, type ResolvedState } from '../lib/schedule';
import { stateForWindow } from '../lib/schedule';
import type { NavTarget } from '../hooks/useSchedule';

interface QuickNavProps {
  state: ResolvedState;
  isOverride: boolean;
  onSelect: (target: NavTarget) => void;
  onResume: () => void;
}

/**
 * Hidden operator menu — appears on hover in the top-right corner.
 * Selecting an entry pins the app to that view until "Resume Schedule".
 */
export const QuickNav: React.FC<QuickNavProps> = ({ state, isOverride, onSelect, onResume }) => {
  const activeKey = stateKey(state);
  const probe = new Date();

  return (
    <div className="absolute top-4 right-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 items-end">
      <div
        className="bg-black/50 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col gap-1"
        style={{ boxShadow: '0 0 30px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.8)' }}
      >
        <NavButton
          label="Main Countdown"
          active={activeKey === 'countdown'}
          onClick={() => onSelect({ type: 'countdown' })}
        />
        {WEDNESDAY_SCHEDULE.map((window, index) => (
          <NavButton
            key={window.title}
            label={window.title}
            dotColor={window.kind === 'game' ? CLUBS[window.clubs[0]].color : undefined}
            active={activeKey === stateKey(stateForWindow(window, probe))}
            onClick={() => onSelect({ type: 'window', index })}
          />
        ))}
        {isOverride && (
          <button
            onClick={onResume}
            className="mt-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all border border-emerald-400/20 text-center"
            style={{ fontFamily: 'var(--font-condensed)', letterSpacing: '0.12em' }}
          >
            Resume Schedule
          </button>
        )}
      </div>
    </div>
  );
};

const NavButton: React.FC<{
  label: string;
  active: boolean;
  dotColor?: string;
  onClick: () => void;
}> = ({ label, active, dotColor, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all text-right flex items-center justify-end gap-2 ${
      active ? 'text-white bg-white/20' : 'text-gray-400 hover:text-white hover:bg-white/10'
    }`}
    style={{ fontFamily: 'var(--font-condensed)', letterSpacing: '0.12em' }}
  >
    {label}
    {dotColor && (
      <span
        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
      />
    )}
  </button>
);
