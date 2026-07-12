import React, { useEffect, useRef, useState } from 'react';
import { CLUBS, WEDNESDAY_SCHEDULE } from '../config';
import { stateKey, stateForWindow, type ResolvedState } from '../lib/schedule';
import { parseBirthdayCSV } from '../lib/birthdays';
import type { NavTarget } from '../hooks/useSchedule';
import { clearBirthdays, saveBirthdays, useBirthdays } from '../hooks/useBirthdays';
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
          <BirthdayUpload />
        </GlassPanel>
      </div>
    </div>
  );
};

/**
 * Operator control for the birthday roster: pick a CSV (name, birthday,
 * club per row), which is parsed and stored in localStorage. Birthdays
 * then appear on each club's game-time screen during their week.
 */
const BirthdayUpload: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const birthdays = useBirthdays();
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    try {
      const { entries, errors } = parseBirthdayCSV(await file.text());
      if (entries.length === 0) {
        setNotice({ text: 'No valid rows (need name, birthday, club)', ok: false });
        return;
      }
      saveBirthdays(entries);
      setNotice({
        text: `${entries.length} birthdays loaded${errors.length > 0 ? ` · ${errors.length} skipped` : ''}`,
        ok: true,
      });
    } catch {
      setNotice({ text: 'Could not read that file', ok: false });
    }
  };

  return (
    <div
      className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1"
      style={{ fontFamily: 'var(--font-condensed)', letterSpacing: '0.12em' }}
    >
      <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
      <button
        onClick={() => fileRef.current?.click()}
        className="px-3 py-1.5 text-xs uppercase text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all text-right flex items-center justify-end gap-2"
        style={{ fontWeight: 700 }}
      >
        Upload Birthdays CSV
        <span style={{ letterSpacing: 0 }}>🎂</span>
      </button>
      {birthdays.length > 0 && (
        <div className="px-3 flex items-center justify-end gap-2 text-[0.65rem] uppercase text-gray-500">
          <span style={{ fontWeight: 700 }}>{birthdays.length} loaded</span>
          <button
            onClick={() => {
              clearBirthdays();
              setNotice({ text: 'Birthdays cleared', ok: true });
            }}
            className="text-red-400/70 hover:text-red-400 transition-colors"
            style={{ fontWeight: 700 }}
          >
            Clear
          </button>
        </div>
      )}
      {notice && (
        <p
          className={`px-3 text-right text-[0.65rem] uppercase ${notice.ok ? 'text-emerald-400' : 'text-amber-400'}`}
          style={{ fontWeight: 700 }}
        >
          {notice.text}
        </p>
      )}
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
