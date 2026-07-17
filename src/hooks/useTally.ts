import { useEffect, useState } from 'react';
import { getChannel } from '../lib/pusher';
import { parseTally, type Tally } from '../lib/tally';

/**
 * Live check-in tally from the print server's `tally` events. Null
 * until the first valid event arrives (or forever, when Pusher is
 * unconfigured/offline) — callers must render fine without it.
 * Consumers judge staleness themselves against the ticking clock.
 */
export function useTally(): Tally | null {
  const [tally, setTally] = useState<Tally | null>(null);

  useEffect(() => {
    const channel = getChannel();
    if (!channel) return;
    const onTally = (payload: unknown) => {
      const parsed = parseTally(payload);
      if (parsed) setTally(parsed);
    };
    channel.bind('tally', onTally);
    return () => {
      channel.unbind('tally', onTally);
    };
  }, []);

  return tally;
}
