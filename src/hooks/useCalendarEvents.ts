import { useEffect, useState } from 'react';

export interface CalendarEvent {
  date: Date;
  title: string;
  isSpecial: boolean;
  daysUntil: number;
}

const CALENDAR_URL = 'https://kvbchurch.twotimtwo.com/site/index';
const REFRESH_MS = 30 * 60 * 1000;

/**
 * A span parsed via DOMParser is never attached to the live document,
 * so getComputedStyle (which the old code used) returns empty values.
 * Visibility must be judged from the markup itself.
 */
function isHiddenInMarkup(el: Element): boolean {
  const style = el.getAttribute('style') ?? '';
  return /display\s*:\s*none/i.test(style) || el.classList.contains('hidden');
}

function parseCalendarHTML(html: string): CalendarEvent[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const events: CalendarEvent[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    doc.querySelectorAll('.dayline').forEach((dayDiv) => {
      // Date lives in the id (format: D2026-03-25)
      const id = dayDiv.id;
      if (!id || !id.startsWith('D')) return;

      const date = new Date(id.slice(1) + 'T12:00:00');
      if (Number.isNaN(date.getTime()) || date < today) return;

      // Weeks marked "skipped" have no Awana meeting
      if (dayDiv.querySelector('.msg.skipped')) return;

      let title = 'Awana Meeting';
      const msgDiv = dayDiv.querySelector('.msg');
      if (msgDiv) {
        for (const span of msgDiv.querySelectorAll('span.desc')) {
          if (isHiddenInMarkup(span)) continue;
          const text = span.textContent?.trim();
          if (text) {
            title = text;
            break;
          }
        }
      }

      const daysUntil = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isSpecial = !title.toLowerCase().includes('awana meeting');
      events.push({ date, title, isSpecial, daysUntil });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 6);
  } catch {
    return [];
  }
}

async function fetchCalendarEvents(signal: AbortSignal): Promise<CalendarEvent[]> {
  try {
    // Direct fetch first…
    const res = await fetch(CALENDAR_URL, { signal });
    return parseCalendarHTML(await res.text());
  } catch (err) {
    if (signal.aborted) throw err;
    // …then the CORS proxy fallback
    try {
      const proxyRes = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(CALENDAR_URL)}`,
        { signal },
      );
      const proxyData = await proxyRes.json();
      return parseCalendarHTML(proxyData.contents);
    } catch {
      return [];
    }
  }
}

/**
 * Upcoming church-calendar events. Silent failure → empty list; the
 * app renders fine without them. Refetches every 30 minutes and when
 * the page becomes visible again.
 */
export function useCalendarEvents(): CalendarEvent[] {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const refresh = () => {
      fetchCalendarEvents(controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) setEvents(result);
        })
        .catch(() => {});
    };

    refresh();
    const interval = setInterval(refresh, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return events;
}
