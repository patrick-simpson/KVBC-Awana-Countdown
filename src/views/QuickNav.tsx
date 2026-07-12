import React from 'react';
import { CLUBS, WEDNESDAY_SCHEDULE } from '../config';
import { stateKey, stateForWindow, type ResolvedState } from '../lib/schedule';
import type { NavTarget } from '../hooks/useSchedule';
import { GlassPanel } from '../components/GlassPanel';

interface QuickNavProps {
  state: ResolvedState;
  isOverride: boolean;
  onSelect: (target: NavTarget) => void;
  onResume: () => void;
}

/**
 * Hidden operator menu. Its hover zone is only the top-right corner —
 * the old version keyed off the whole screen, so any mouse nudge
 * anywhere revealed it.
 */
export const QuickNav: React.FC<QuickNavProps> = ({ state, isOverride, onSelect, onResume }) => {
  const activeKey = stateKey(state);
  const probe = new Date();

  return (
    <div className="absolute top-0 right-0 z-50 p-4 pl-16 pb-16 group/nav">
      <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300">
        <GlassPanel className="p-2 flex flex-col gap-1">
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
              className="mt-2 px-3 py-1.5 text-xs uppercase text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all border border-emerald-400/20 text-center"
              style={{ fontFamily: 'var(--font-condensed)', fontWeight: 800, letterSpacing: '0.12em' }}
            >
              Resume Schedule
            </button>
          )}
        </GlassPanel>
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
    className={`px-3 py-1.5 text-xs uppercase rounded-lg transition-all text-right flex items-center justify-end gap-2 ${
      active ? 'text-white bg-white/20' : 'text-gray-400 hover:text-white hover:bg-white/10'
    }`}
    style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700, letterSpacing: '0.12em' }}
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
