import { useState, useEffect } from 'react';

export interface CalendarEvent {
  date: Date;
  title: string;
  isSpecial: boolean;
  daysUntil: number;
}

const CALENDAR_URL = 'https://kvbchurch.twotimtwo.com/site/index';

function parseCalendarHTML(html: string): CalendarEvent[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const events: CalendarEvent[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all .dayline divs
    doc.querySelectorAll('.dayline').forEach(dayDiv => {
      // Extract date from ID (format: D2026-03-25)
      const id = dayDiv.id;
      if (!id || !id.startsWith('D')) return;

      const dateStr = id.slice(1); // Remove 'D' prefix
      const date = new Date(dateStr + 'T12:00:00');

      if (date < today) return; // Skip past events

      // Check if skipped (no Awana this week)
      const skipped = dayDiv.querySelector('.msg.skipped');
      if (skipped) return;

      // Get event title from first visible .desc span
      let title = 'Awana Meeting';
      const msgDiv = dayDiv.querySelector('.msg');
      if (msgDiv) {
        const descSpans = msgDiv.querySelectorAll('span.desc');
        for (const span of descSpans) {
          const display = window.getComputedStyle(span as HTMLElement).display;
          if (display !== 'none') {
            const text = span.textContent?.trim();
            if (text) {
              title = text;
              break;
            }
          }
        }
      }

      const daysUntil = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isSpecial = !title.toLowerCase().includes('awana meeting');

      events.push({ date, title, isSpecial, daysUntil });
    });

    // Sort by date and return first 6
    return events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 6);
  } catch {
    return [];
  }
}

async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    // Try direct fetch first
    const res = await fetch(CALENDAR_URL);
    const html = await res.text();
    return parseCalendarHTML(html);
  } catch {
    // Try CORS proxy as fallback
    try {
      const proxyRes = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(CALENDAR_URL)}`
      );
      const proxyData = await proxyRes.json();
      return parseCalendarHTML(proxyData.contents);
    } catch {
      // Silently fail
      return [];
    }
  }
}

export function useCalendarEvents(): CalendarEvent[] {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetchCalendarEvents().then(setEvents);

    // Refresh every 30 minutes
    const interval = setInterval(() => {
      fetchCalendarEvents().then(setEvents);
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return events;
}
