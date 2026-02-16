import { SlideContent, AppSettings } from './types';

// DEFAULT SETTINGS
// Defaults to Wednesday at 6:00 PM
export const DEFAULT_SETTINGS: AppSettings = {
  autoStartDay: 3, // Wednesday
  autoStartHour: 18, // 6 PM
  autoStartMinute: 0, // 00 Minutes
  countdownDurationMinutes: 5, // Default manual countdown duration
  finalSlideType: 'black',
  finalSlideContent: '',
};

// TEXT CONTENT
export const US_PLEDGE_TEXT = `I pledge allegiance to the Flag of the United States of America, and to the Republic for which it stands, one Nation under God, indivisible, with liberty and justice for all.`;

export const AWANA_PLEDGE_TEXT = `I pledge allegiance to the Awana flag, which stands for the Awana clubs, whose goal is to reach boys and girls with the gospel of Christ, and train them to serve Him.`;

export const SLIDES: SlideContent[] = [
  {
    id: 1,
    title: 'Welcome!',
    body: undefined, 
    bgColorClass: 'bg-black',
    accentColorClass: 'text-yellow-400',
    imagePlaceholder: false,
    duration: 10, // Show for 10 seconds then auto-advance
  },
  {
    id: 2,
    title: 'Pledge of Allegiance',
    body: US_PLEDGE_TEXT,
    bgColorClass: 'bg-black',
    accentColorClass: 'text-white',
    imagePlaceholder: false,
  },
  {
    id: 3,
    title: 'Awana Pledge',
    body: AWANA_PLEDGE_TEXT,
    bgColorClass: 'bg-black',
    accentColorClass: 'text-white',
    imagePlaceholder: false,
  },
];

// New Game Slides with Schedules
export const GAME_SLIDES: SlideContent[] = [
  {
    id: 1001,
    title: '',
    body: 'T&T Games',
    bgColorClass: 'bg-black',
    accentColorClass: 'text-green-500',
    showClock: true,
    schedule: {
      startHour: 18, // 6:10 PM
      startMinute: 10,
      endHour: 18, // Ends 6:30 PM
      endMinute: 30
    }
  },
  {
    id: 1002,
    title: '',
    body: 'Sparks Games',
    bgColorClass: 'bg-black',
    accentColorClass: 'text-red-500',
    showClock: true,
    schedule: {
      startHour: 18, // 6:30 PM
      startMinute: 30,
      endHour: 19, // Ends 7:00 PM
      endMinute: 0
    }
  },
  {
    id: 1003,
    title: '',
    body: 'Cubbies & Puggles Games',
    bgColorClass: 'bg-black',
    accentColorClass: 'text-blue-500',
    showClock: true,
    schedule: {
      startHour: 19, // 7:00 PM
      startMinute: 0,
      endHour: 19, // Ends 7:15 PM
      endMinute: 15
    }
  },
  {
    id: 1004,
    title: '',
    body: 'Cubbies & Puggles Games', // Keeps the main text from the previous slide to maintain context
    bgColorClass: 'bg-black',
    accentColorClass: 'text-blue-500', 
    showClock: true,
    schedule: {
      startHour: 19, // 7:15 PM
      startMinute: 15
    }
  }
];