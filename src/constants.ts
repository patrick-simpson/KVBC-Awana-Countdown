import { SlideContent, ScheduleItem, AppMode } from './types';

export const US_PLEDGE_TEXT = `I pledge allegiance to the Flag of the United States of America, and to the Republic for which it stands, one Nation under God, indivisible, with liberty and justice for all.`;
export const AWANA_PLEDGE_TEXT = `I pledge allegiance to the Awana flag, which stands for the Awana clubs, whose goal is to reach boys and girls with the gospel of Christ, and train them to serve Him.`;

export const SLIDES: SlideContent[] = [
  { id: 1, title: 'Welcome!', bgColorClass: 'bg-black', accentColorClass: 'text-yellow-400', duration: 10 },
  { id: 2, title: 'Pledge of Allegiance', body: US_PLEDGE_TEXT, bgColorClass: 'bg-black', accentColorClass: 'text-white', showClock: true },
  { id: 3, title: 'Awana Pledge', body: AWANA_PLEDGE_TEXT, bgColorClass: 'bg-black', accentColorClass: 'text-white', showClock: true },
  { id: 4, title: 'Have a great night!', body: 'See you next week!', bgColorClass: 'bg-black', accentColorClass: 'text-blue-400' }
];

export const SCHEDULE: ScheduleItem[] = [
  {
    startHour: 18, startMinute: 5,
    endHour: 18, endMinute: 30,
    title: 'T&T Game Time',
    bgColorClass: 'bg-red-900',
    accentColorClass: 'text-red-400',
    clubColor: '#E8192C',
    mode: AppMode.GAME_TIME
  },
  {
    startHour: 18, startMinute: 30,
    endHour: 19, endMinute: 0,
    title: 'Sparks Game Time',
    bgColorClass: 'bg-blue-900',
    accentColorClass: 'text-blue-400',
    clubColor: '#0072CE',
    mode: AppMode.GAME_TIME
  },
  {
    startHour: 19, startMinute: 0,
    endHour: 19, endMinute: 30,
    title: 'Puggles & Cubbies Game Time',
    bgColorClass: 'bg-green-900',
    accentColorClass: 'text-green-400',
    clubColor: '#00A651',
    mode: AppMode.GAME_TIME
  },
  {
    startHour: 19, startMinute: 30,
    endHour: 19, endMinute: 35,
    title: 'See you next week!',
    bgColorClass: 'bg-black',
    accentColorClass: 'text-blue-400',
    mode: AppMode.SLIDESHOW
  },
  {
    startHour: 19, startMinute: 35,
    endHour: 23, endMinute: 59,
    title: 'System Shutdown',
    bgColorClass: 'bg-black',
    accentColorClass: 'text-slate-400',
    mode: AppMode.SHUTDOWN
  }
];
