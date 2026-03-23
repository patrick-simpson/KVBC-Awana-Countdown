export enum AppMode {
  COUNTDOWN = 'COUNTDOWN',
  SLIDESHOW = 'SLIDESHOW',
  GAME_TIME = 'GAME_TIME',
  SHUTDOWN = 'SHUTDOWN',
}

export interface SlideContent {
  id: number;
  title: string;
  body?: string;
  imageUrl?: string;
  bgColorClass: string;
  accentColorClass: string;
  duration?: number;
  showClock?: boolean;
}

export interface ScheduleItem {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  title: string;
  bgColorClass: string;
  accentColorClass: string;
  mode: AppMode;
}
