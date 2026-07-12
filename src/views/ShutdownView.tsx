import React, { useEffect } from 'react';

interface ShutdownViewProps {
  onRestart: () => void;
}

export const ShutdownView: React.FC<ShutdownViewProps> = ({ onRestart }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['Space', 'Enter', 'ArrowRight', 'PageDown'].includes(e.code)) {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onRestart]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
      style={{ background: '#000000' }}
      onClick={onRestart}
    >
      <p className="text-xs font-black uppercase tracking-[0.4em] mb-6 text-shimmer">Awana Night</p>
      <h1
        className="text-7xl font-black text-white text-center leading-tight mb-4 animate-pop-in"
        style={{ textShadow: '0 0 40px rgba(255,255,255,0.4), 0 0 100px rgba(255,255,255,0.15)' }}
      >
        See you next week!
      </h1>
      <p className="text-slate-500 text-lg tracking-wide animate-slide-up-fade">Have a safe drive home.</p>
      <button
        className="mt-16 px-8 py-3 rounded-full border border-white/20 text-white/40 text-sm font-bold uppercase tracking-widest hover:text-white hover:border-white/60 transition-all duration-300"
        onClick={(e) => { e.stopPropagation(); onRestart(); }}
      >
        ↺ Start Over
      </button>
      <p className="mt-3 text-slate-700 text-xs uppercase tracking-widest">or press Space</p>
    </div>
  );
};
