import React from 'react';
import { CalendarEvent } from '../hooks/useCalendarEvents';

interface EventsStripProps {
  events: CalendarEvent[];
}

function getEventEmoji(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('mission')) return '🌍';
  if (lower.includes('verse') || lower.includes('scripture')) return '📖';
  if (lower.includes('movie')) return '🎬';
  if (lower.includes('western') || lower.includes('cowboy')) return '🤠';
  if (lower.includes('superhero') || lower.includes('hero')) return '🦸';
  if (lower.includes('pajama') || lower.includes('pj')) return '😴';
  if (lower.includes('carnival') || lower.includes('fair')) return '🎡';
  if (lower.includes('christmas') || lower.includes('holiday')) return '🎄';
  if (lower.includes('sport') || lower.includes('game')) return '⚽';
  if (lower.includes('space') || lower.includes('galaxy')) return '🚀';
  return '⭐';
}

function formatDays(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days <= 7) return `in ${days} days`;
  const weeks = Math.round(days / 7);
  return `in ${weeks} week${weeks > 1 ? 's' : ''}`;
}

export const EventsStrip: React.FC<EventsStripProps> = ({ events }) => {
  // Only show special events (theme nights)
  const specialEvents = events.filter(e => e.isSpecial).slice(0, 4);

  if (specialEvents.length === 0) return null;

  return (
    <div className="mt-6 flex justify-center">
      <div className="flex gap-3 flex-wrap justify-center max-w-2xl">
        {specialEvents.map((event, idx) => {
          const colors = [
            { bg: 'rgba(232, 25, 44, 0.12)', border: 'rgba(232, 25, 44, 0.3)', glow: 'rgba(232, 25, 44, 0.15)' },
            { bg: 'rgba(255, 193, 7, 0.12)', border: 'rgba(255, 193, 7, 0.3)', glow: 'rgba(255, 193, 7, 0.15)' },
            { bg: 'rgba(0, 114, 206, 0.12)', border: 'rgba(0, 114, 206, 0.3)', glow: 'rgba(0, 114, 206, 0.15)' },
            { bg: 'rgba(0, 166, 81, 0.12)', border: 'rgba(0, 166, 81, 0.3)', glow: 'rgba(0, 166, 81, 0.15)' },
          ][idx % 4];
          return (
            <div
              key={idx}
              className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide text-white whitespace-nowrap backdrop-blur-xl"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 0 20px ${colors.glow}, inset 0 0 20px ${colors.glow}`,
                textShadow: '0 0 10px rgba(0,0,0,0.5)',
                animation: `fadeIn 0.5s ease-out`,
                animationDelay: `${idx * 0.1}s`,
                animationFillMode: 'both',
              }}
            >
              {getEventEmoji(event.title)} {event.title} · {formatDays(event.daysUntil)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
