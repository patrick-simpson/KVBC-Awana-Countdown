/**
 * Lazy, silent Pusher singleton. This display is SUBSCRIBE-ONLY: it
 * holds just the public key (the print server owns the secret and does
 * all publishing on `awana-channel`). Everything here fails silently —
 * the show must never depend on the network or on Pusher being
 * configured at all.
 *
 * The key comes from church.config, or can be provisioned per-display
 * without a redeploy by visiting once with `?pusherKey=...` (and
 * optionally `?pusherCluster=...`), which persists to localStorage.
 */
import Pusher, { type Channel } from 'pusher-js';
import { CHURCH } from '../church.config';

const STORAGE_KEY = 'kvbc-awana-pusher';

interface Creds {
  key: string;
  cluster: string;
}

function storedCreds(): Creds | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return null;
    const d = data as Record<string, unknown>;
    if (typeof d.key !== 'string' || d.key.length === 0) return null;
    return { key: d.key, cluster: typeof d.cluster === 'string' && d.cluster ? d.cluster : CHURCH.pusher.cluster };
  } catch {
    return null;
  }
}

/** Current stored creds for the settings UI (null = using church.config/none). */
export function getStoredPusherCreds(): { key: string; cluster: string } | null {
  return storedCreds();
}

/**
 * Persist Pusher creds from the QuickNav settings panel. Empty key
 * clears the stored override. Takes effect on the next page load (the
 * Pusher singleton binds once per load — the UI says so).
 */
export function savePusherCreds(key: string, cluster: string): void {
  try {
    const k = key.trim();
    if (!k) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ key: k, cluster: cluster.trim() || CHURCH.pusher.cluster }));
  } catch {
    /* storage blocked */
  }
}

/** Persist `?pusherKey=` / `?pusherCluster=` URL flags (call once at startup). */
export function adoptPusherUrlFlags(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('pusherKey');
    if (!key) return;
    const cluster = params.get('pusherCluster') ?? storedCreds()?.cluster ?? CHURCH.pusher.cluster;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ key, cluster }));
  } catch {
    /* storage blocked — the flags still apply for this page load via resolveCreds */
  }
}

function resolveCreds(): Creds | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get('pusherKey');
    if (urlKey) {
      return { key: urlKey, cluster: params.get('pusherCluster') ?? CHURCH.pusher.cluster };
    }
  } catch {
    /* ignore */
  }
  const stored = storedCreds();
  if (stored) return stored;
  return CHURCH.pusher.key ? { key: CHURCH.pusher.key, cluster: CHURCH.pusher.cluster } : null;
}

/** undefined = not attempted yet; null = unconfigured/failed (permanent for this load). */
let channel: Channel | null | undefined;
let client: Pusher | null = null;

/** The shared awana-channel, or null when Pusher is unconfigured/unavailable. */
export function getChannel(): Channel | null {
  if (channel !== undefined) return channel;
  const creds = resolveCreds();
  if (!creds) {
    channel = null;
    return channel;
  }
  try {
    client = new Pusher(creds.key, { cluster: creds.cluster });
    channel = client.subscribe(CHURCH.pusher.channel);
    // Projector machines sleep; pusher-js auto-reconnects, but nudge it
    // whenever the page becomes visible again just in case.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && client && client.connection.state !== 'connected') {
        try {
          client.connect();
        } catch {
          /* ignore */
        }
      }
    });
  } catch {
    channel = null;
    client = null;
  }
  return channel;
}
