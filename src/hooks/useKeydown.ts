import { useEffect, useRef } from 'react';

/**
 * Shared window keydown listener with a stable subscription — the
 * handler ref is swapped per render, so callers never re-attach
 * listeners (and never leak them).
 */
export function useKeydown(handler: (e: KeyboardEvent) => void): void {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    const listen = (e: KeyboardEvent) => ref.current(e);
    window.addEventListener('keydown', listen);
    return () => window.removeEventListener('keydown', listen);
  }, []);
}
