export enum AppMode {
  COUNTDOWN = 'COUNTDOWN',
  SLIDESHOW = 'SLIDESHOW',
  SETTINGS = 'SETTINGS',
}

export type FinalSlideType = 'black' | 'text' | 'image';

export interface AppSettings {
  autoStartDay: number; // 0 = Sunday, 1 = Monday, ...
  autoStartHour: number; // 0-23
  autoStartMinute: number; // 0-59
  countdownDurationMinutes: number; // Duration in minutes for the manual countdown
  finalSlideType: FinalSlideType;
  finalSlideContent: string; // Text content or Image Data URL
}

export interface SlideSchedule {
  startHour: number;
  startMinute: number;
  endHour?: number;
  endMinute?: number;
}

export interface SlideContent {
  id: number;
  title: string;
  body?: string;
  imageUrl?: string;
  imagePlaceholder?: boolean;
  imageLabel?: string;
  bgColorClass: string; // Tailwind class for background
  accentColorClass: string; // Tailwind class for text accents
  duration?: number; // Duration in seconds before auto-advancing
  
  // New properties for Game Slides
  schedule?: SlideSchedule;
  showClock?: boolean;
}