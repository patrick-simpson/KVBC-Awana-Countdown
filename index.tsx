import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

// ============================================================================
// === TYPES
// ============================================================================

enum AppMode {
  COUNTDOWN = 'COUNTDOWN',
  SLIDESHOW = 'SLIDESHOW',
  SETTINGS = 'SETTINGS',
}

type FinalSlideType = 'black' | 'text' | 'image';

interface AppSettings {
  autoStartDay: number; // 0 = Sunday, 1 = Monday, ...
  autoStartHour: number; // 0-23
  autoStartMinute: number; // 0-59
  countdownDurationMinutes: number; // Duration in minutes for the manual countdown
  finalSlideType: FinalSlideType;
  finalSlideContent: string; // Text content or Image Data URL
}

interface SlideSchedule {
  startHour: number;
  startMinute: number;
  endHour?: number;
  endMinute?: number;
}

interface SlideContent {
  id: number;
  title: string;
  body?: string;
  imageUrl?: string;
  imagePlaceholder?: boolean;
  imageLabel?: string;
  bgColorClass: string; // Tailwind class for background
  accentColorClass: string; // Tailwind class for text accents
  duration?: number; // Duration in seconds before auto-advancing
  schedule?: SlideSchedule;
  showClock?: boolean;
}

// ============================================================================
// === CONSTANTS
// ============================================================================

const DEFAULT_SETTINGS: AppSettings = {
  autoStartDay: 3, // Wednesday
  autoStartHour: 18, // 6 PM
  autoStartMinute: 0, // 00 Minutes
  countdownDurationMinutes: 5,
  finalSlideType: 'black',
  finalSlideContent: '',
};

const US_PLEDGE_TEXT = `I pledge allegiance to the Flag of the United States of America, and to the Republic for which it stands, one Nation under God, indivisible, with liberty and justice for all.`;
const AWANA_PLEDGE_TEXT = `I pledge allegiance to the Awana flag, which stands for the Awana clubs, whose goal is to reach boys and girls with the gospel of Christ, and train them to serve Him.`;

const SLIDES: SlideContent[] = [
  { id: 1, title: 'Welcome!', bgColorClass: 'bg-black', accentColorClass: 'text-yellow-400', duration: 10 },
  { id: 2, title: 'Pledge of Allegiance', body: US_PLEDGE_TEXT, bgColorClass: 'bg-black', accentColorClass: 'text-white' },
  { id: 3, title: 'Awana Pledge', body: AWANA_PLEDGE_TEXT, bgColorClass: 'bg-black', accentColorClass: 'text-white' },
];

const GAME_SLIDES: SlideContent[] = [
  { id: 1001, title: '', body: 'T&T Games', bgColorClass: 'bg-black', accentColorClass: 'text-green-500', showClock: true, schedule: { startHour: 18, startMinute: 10, endHour: 18, endMinute: 30 } },
  { id: 1002, title: '', body: 'Sparks Games', bgColorClass: 'bg-black', accentColorClass: 'text-red-500', showClock: true, schedule: { startHour: 18, startMinute: 30, endHour: 19, endMinute: 0 } },
  { id: 1003, title: '', body: 'Cubbies & Puggles Games', bgColorClass: 'bg-black', accentColorClass: 'text-blue-500', showClock: true, schedule: { startHour: 19, startMinute: 0, endHour: 19, endMinute: 15 } },
  { id: 1004, title: '', body: 'Cubbies & Puggles Games', bgColorClass: 'bg-black', accentColorClass: 'text-blue-500', showClock: true, schedule: { startHour: 19, startMinute: 15 } }
];

// ============================================================================
// === COMPONENTS
// ============================================================================

// --- Slide.tsx ---
interface SlideProps {
  content: SlideContent;
  isExiting?: boolean;
  onNext?: () => void;
}
const Slide: React.FC<SlideProps> = ({ content, isExiting = false, onNext }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);

  let warningTimeDisplay: string | null = null;
  if (content.schedule && content.schedule.endHour !== undefined) {
    const endTime = new Date();
    endTime.setHours(content.schedule.endHour, content.schedule.endMinute || 0, 0);
    if (now.getDate() !== endTime.getDate()) { endTime.setDate(now.getDate()); }
    const diffSeconds = (endTime.getTime() - now.getTime()) / 1000;
    if (diffSeconds > 0 && diffSeconds <= 300) {
      const m = Math.floor(diffSeconds / 60);
      const s = Math.floor(diffSeconds % 60);
      warningTimeDisplay = `${m}:${s.toString().padStart(2, '0')}`;
    }
  }

  const isPowerOffSlide = content.id === 1004;
  const isWelcomeSlide = content.id === 1;
  const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const transitionClasses = `transition-all duration-500 ease-in-out transform ${isExiting ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`;
  const hasBody = !!content.body;
  const isLongText = hasBody && content.body!.length > 60;
  const bodyClass = isLongText ? "text-4xl md:text-5xl lg:text-6xl leading-tight max-w-6xl font-bold" : "text-7xl md:text-8xl lg:text-9xl leading-none font-black uppercase tracking-tight";
  const titleClass = hasBody ? "text-4xl md:text-5xl font-bold mb-6 opacity-80 uppercase tracking-widest" : "text-7xl md:text-8xl font-bold mb-8";
  const titleAnimation = (isWelcomeSlide && !isExiting) ? 'animate-pop-in' : '';
  const subtitleAnimation = (isWelcomeSlide && !isExiting) ? 'animate-slide-up-fade' : 'opacity-0';
  const contentPadding = content.showClock ? 'pb-32' : 'pb-8';

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${content.bgColorClass} relative overflow-hidden`}>
      <div className={`flex flex-col items-center justify-center text-center px-8 w-full z-10 ${contentPadding} ${transitionClasses}`}>
        {content.title && <h1 className={`${titleClass} ${content.accentColorClass} drop-shadow-md ${titleAnimation}`}>{content.title}</h1>}
        {isWelcomeSlide && <div className={`text-3xl md:text-4xl text-gray-300 font-light mt-4 ${subtitleAnimation}`}>We're glad you're here!</div>}
        {content.imageUrl ? <img src={content.imageUrl} alt="Slide" className="max-h-[65vh] w-auto border-4 border-gray-800 shadow-2xl rounded-lg" /> : content.body && <div className={`${bodyClass} ${content.accentColorClass} drop-shadow-xl break-words`}>{content.body}</div>}
        {warningTimeDisplay && !isPowerOffSlide && content.id > 1000 && (
          <div className="mt-12 animate-pulse flex flex-col items-center">
            <div className="text-2xl text-red-500 font-bold uppercase mb-0 tracking-widest">Time Remaining</div>
            <div className="text-8xl leading-none font-mono font-bold text-white tabular-nums drop-shadow-xl">{warningTimeDisplay}</div>
          </div>
        )}
      </div>
      {(content.showClock) && (
        <div className={`absolute bottom-8 left-0 w-full flex flex-col items-center justify-center pointer-events-none z-20 ${transitionClasses}`}>
          <div className="text-5xl font-mono font-bold text-white tabular-nums drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">{timeString}</div>
          {isPowerOffSlide && <div className="mt-4 text-3xl md:text-4xl font-bold text-red-500 animate-pulse uppercase tracking-wider bg-black/90 px-8 py-3 rounded-xl border border-red-900/50">Please Power Off Projector</div>}
        </div>
      )}
      <button onClick={onNext} className="absolute inset-y-0 right-0 w-24 opacity-0 hover:opacity-0 transition-opacity cursor-pointer z-50 focus:outline-none" title="Next Slide" aria-label="Next Slide" />
    </div>
  );
};

// --- CountdownView.tsx ---
interface CountdownViewProps { onComplete: () => void; onOpenSettings: () => void; targetDate: Date; }
const PARTICLE_COLORS = ['bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-yellow-500'];
interface Particle { id: number; left: string; size: string; color: string; duration: string; delay: string; }
const CountdownView: React.FC<CountdownViewProps> = ({ onComplete, onOpenSettings, targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ id: i, left: `${Math.random() * 100}%`, size: `${Math.random() * 3 + 1}rem`, color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)], duration: `${Math.random() * 10 + 10}s`, delay: `-${Math.random() * 20}s` })), []);
  
  useEffect(() => {
    const calculateTimeLeft = () => { const distance = targetDate.getTime() - new Date().getTime(); if (distance <= 0) { onComplete(); return 0; } return Math.floor(distance / 1000); };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (['Space', 'ArrowRight', 'PageDown'].includes(event.code)) { event.preventDefault(); onComplete(); } };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  let formattedTime = days > 0 ? `${days}d ${hours}h ${minutes}m` : hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden animate-fade-in">
      <button onClick={onOpenSettings} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors p-2 z-50" title="Settings">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </button>
      <div className="absolute inset-0 pointer-events-none">{particles.map(p => <div key={p.id} className={`rounded-full animate-float ${p.color} blur-sm`} style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }} />)}</div>
      <div className="z-10 w-full h-full flex flex-col items-center justify-center">
        <h2 className="text-4xl text-gray-400 font-bold mb-8 uppercase tracking-widest">Club Starts In</h2>
        <div className="relative w-full flex justify-center items-center cursor-pointer group" onClick={onComplete} title="Click to skip timer">
          <h1 className={`${days > 0 ? 'text-[12vw]' : 'text-[25vw]'} leading-none font-bold tabular-nums drop-shadow-2xl transition-colors duration-500 ${timeLeft < 60 && timeLeft > 0 ? 'text-red-500' : 'text-white'} group-hover:text-gray-200`}>{formattedTime}</h1>
          <div className="absolute bottom-0 opacity-0 group-hover:opacity-100 text-sm text-gray-500 font-semibold uppercase tracking-widest transition-opacity">Click to Skip</div>
        </div>
      </div>
    </div>
  );
};

// --- SettingsView.tsx ---
interface SettingsViewProps { currentSettings: AppSettings; onSave: (settings: AppSettings) => void; onCancel: () => void; }
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SettingsView: React.FC<SettingsViewProps> = ({ currentSettings, onSave, onCancel }) => {
  const [formData, setFormData] = useState<AppSettings>(currentSettings);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { const { name, value } = e.target; const numValue = parseInt(value, 10); setFormData(p => ({ ...p, [name]: ['autoStartDay', 'autoStartHour', 'autoStartMinute', 'countdownDurationMinutes'].includes(name) ? numValue : value })); };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) { const reader = new FileReader(); reader.onloadend = () => setFormData(p => ({ ...p, finalSlideContent: reader.result as string })); reader.readAsDataURL(e.target.files[0]); } };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white p-8 overflow-y-auto">
      <div className="max-w-xl w-full bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800 my-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">Presentation Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-gray-800 pb-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-300">Countdown Target</h3>
            <p className="text-sm text-gray-400 mb-4">Set the day and time for your club. The timer will always count down to the next occurrence.</p>
            <div className="mb-4"><label className="block text-sm font-medium text-gray-300 mb-1">Day of Week</label><select name="autoStartDay" value={formData.autoStartDay} onChange={handleChange} className="w-full bg-black border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none">{DAYS_OF_WEEK.map((day, i) => <option key={i} value={i}>{day}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-1">Hour (0-23)</label><input type="number" name="autoStartHour" min="0" max="23" value={formData.autoStartHour} onChange={handleChange} className="w-full bg-black border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" /><p className="text-xs text-gray-500 mt-1">18 = 6 PM</p></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-1">Minute (0-59)</label><input type="number" name="autoStartMinute" min="0" max="59" value={formData.autoStartMinute} onChange={handleChange} className="w-full bg-black border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
            </div>
            <div className="mb-4"><label className="block text-sm font-medium text-gray-300 mb-1">Manual Countdown Duration (Minutes)</label><input type="number" name="countdownDurationMinutes" min="1" max="60" value={formData.countdownDurationMinutes} onChange={handleChange} className="w-full bg-black border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" /></div>
          </div>
          <div className="pt-2">
            <h3 className="text-xl font-semibold mb-4 text-green-400">Final Slide Configuration</h3>
            <div className="mb-4"><label className="block text-sm font-medium text-gray-300 mb-1">Slide Type</label><select name="finalSlideType" value={formData.finalSlideType} onChange={handleChange} className="w-full bg-black border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="black">Black Screen</option><option value="text">Custom Text</option><option value="image">Custom Image</option></select></div>
            {formData.finalSlideType === 'text' && <div><label className="block text-sm font-medium text-gray-300 mb-1">Text Content</label><textarea name="finalSlideContent" rows={3} value={formData.finalSlideContent} onChange={handleChange} className="w-full bg-black border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Enter text..." /></div>}
            {formData.finalSlideType === 'image' && <div><label className="block text-sm font-medium text-gray-300 mb-1">Upload Image</label><input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-black border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" />{formData.finalSlideContent && <div className="mt-2"><p className="text-xs text-green-500 mb-1">Preview:</p><img src={formData.finalSlideContent} alt="Preview" className="h-20 object-contain border border-gray-700" /></div>}</div>}
          </div>
          <div className="flex gap-4 pt-4"><button type="button" onClick={onCancel} className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium">Cancel</button><button type="submit" className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold shadow-lg">Save Settings</button></div>
        </form>
      </div>
    </div>
  );
};

// --- SlideshowView.tsx ---
interface SlideshowViewProps { onExit: () => void; settings: AppSettings; }
const SlideshowView: React.FC<SlideshowViewProps> = ({ onExit, settings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const TRANSITION_DURATION = 500;

  const activeSlides = useMemo(() => {
    const slides: SlideContent[] = [...SLIDES];
    const finalSlide: SlideContent = { id: 999, title: '', body: '', bgColorClass: 'bg-black', accentColorClass: 'text-white' };
    if (settings.finalSlideType === 'text') { finalSlide.body = settings.finalSlideContent || 'Thank You!'; } 
    else if (settings.finalSlideType === 'image') { finalSlide.imageUrl = settings.finalSlideContent; }
    slides.push(finalSlide, ...GAME_SLIDES);
    return slides;
  }, [settings]);

  const changeSlide = useCallback((newIndex: number) => { setIsExiting(true); setTimeout(() => { setCurrentIndex(newIndex); setIsExiting(false); }, TRANSITION_DURATION); }, []);
  const goToNext = useCallback(() => { if (currentIndex < activeSlides.length - 1 && !isExiting) { changeSlide(currentIndex + 1); } }, [currentIndex, isExiting, changeSlide, activeSlides.length]);
  const goToPrev = useCallback(() => { if (currentIndex > 0 && !isExiting) { changeSlide(currentIndex - 1); } }, [currentIndex, isExiting, changeSlide]);

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      activeSlides.forEach((slide, index) => {
        if (slide.schedule && slide.schedule.startHour === now.getHours() && slide.schedule.startMinute === now.getMinutes() && index !== currentIndex && now.getSeconds() === 0) {
          changeSlide(index);
        }
      });
    };
    const timer = setInterval(checkSchedule, 1000);
    return () => clearInterval(timer);
  }, [activeSlides, currentIndex, changeSlide]);

  useEffect(() => {
    const currentSlide = activeSlides[currentIndex];
    if (currentSlide.duration && !isExiting) {
      const timer = setTimeout(() => { if (currentIndex < activeSlides.length - 1) { goToNext(); } }, currentSlide.duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, activeSlides, isExiting, goToNext]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isExiting) return;
      if (['Space', 'ArrowRight', 'PageDown'].includes(event.code)) { event.preventDefault(); goToNext(); } 
      else if (['ArrowLeft', 'PageUp'].includes(event.code)) { event.preventDefault(); goToPrev(); } 
      else if (event.code === 'Escape' && confirm("Exit Presentation Mode?")) { onExit(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, onExit, isExiting]);

  return (
    <div className="w-full h-full relative group bg-black">
      <Slide content={activeSlides[currentIndex]} isExiting={isExiting} onNext={goToNext} />
      <div className="fixed bottom-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
        <button onClick={goToPrev} disabled={currentIndex === 0 || isExiting} className="p-3 bg-gray-800/50 rounded-full text-white disabled:opacity-30 hover:bg-gray-700 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <button onClick={goToNext} disabled={currentIndex === activeSlides.length - 1 || isExiting} className="p-3 bg-gray-800/50 rounded-full text-white disabled:opacity-30 hover:bg-gray-700 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
      </div>
    </div>
  );
};

// --- App.tsx ---
const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.COUNTDOWN);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const getNextTargetDate = useCallback((s: AppSettings) => {
    const now = new Date();
    const target = new Date();
    target.setHours(s.autoStartHour, s.autoStartMinute, 0, 0);
    let daysUntil = (s.autoStartDay - now.getDay() + 7) % 7;
    if (daysUntil === 0 && target <= now) { daysUntil = 7; }
    target.setDate(now.getDate() + daysUntil);
    return target;
  }, []);

  const nextTargetDate = useMemo(() => getNextTargetDate(settings), [settings, getNextTargetDate]);
  const handleCountdownComplete = useCallback(() => setMode(AppMode.SLIDESHOW), []);
  const handleReturnToCountdown = useCallback(() => setMode(AppMode.COUNTDOWN), []);
  const handleOpenSettings = useCallback(() => setMode(AppMode.SETTINGS), []);
  const handleSaveSettings = useCallback((newSettings: AppSettings) => { setSettings(newSettings); setMode(AppMode.COUNTDOWN); }, []);
  const handleCancelSettings = useCallback(() => setMode(AppMode.COUNTDOWN), []);

  return (
    <div className="w-full h-full relative">
      {mode === AppMode.SETTINGS && <SettingsView currentSettings={settings} onSave={handleSaveSettings} onCancel={handleCancelSettings} />}
      {mode === AppMode.COUNTDOWN && <CountdownView targetDate={nextTargetDate} onComplete={handleCountdownComplete} onOpenSettings={handleOpenSettings} />}
      {mode === AppMode.SLIDESHOW && <SlideshowView onExit={handleReturnToCountdown} settings={settings} />}
    </div>
  );
};

// ============================================================================
// === ROOT RENDER LOGIC
// ============================================================================

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white p-8">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
          <div className="bg-black p-4 rounded border border-gray-700 max-w-2xl overflow-auto">
            <p className="font-mono text-sm text-red-300">{this.state.error?.toString()}</p>
            <p className="mt-4 text-gray-400 text-sm">Check the console for more details.</p>
          </div>
          <button onClick={() => window.location.reload()} className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold">Reload Application</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
