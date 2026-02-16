# Changelog

## [Unreleased]

### Fixed
- **App Loading:** Added missing script entry point to `index.html` to ensure the React application mounts.
- **Tailwind Config:** Added inline Tailwind configuration to `index.html` to define custom animations and suppress production warnings where possible.
- **Path Resolution:** Used relative path for script source to support subdirectory deployments (e.g., GitHub Pages).
- **Slide Layout:** Updated `Slide` component to ensure the live clock is always z-indexed above slide content and that the content layout reserves space at the bottom when the clock is active.
- **Deployment:** Added `vite.config.ts` with base URL configuration for GitHub Pages hosting.
- **Black Screen Debugging:** Added Global Error Handler in `index.html` and React Error Boundary in `index.tsx` to display errors instead of failing silently.

### Added
- **Perpetual Countdown:** The application now defaults to a countdown mode targeting the next configured service time (default: Wednesday 6:00 PM) instead of a standby screen.
- **Slide Duration:** Added support for auto-advancing slides after a specific duration.
- **Settings Button:** Added the settings gear icon to the top-right of the Countdown view to ensure accessibility at all times.

### Changed
- **Welcome Slide:** The "Welcome!" slide now automatically advances to the Pledge slide after 10 seconds.
- **App Flow:** Removed `StandbyView`. The app flow is now `Countdown` -> `Slideshow` -> `Countdown`.
- **Settings:** Removed "Countdown Duration" setting as the timer is now based on the calendar target.
- **Visuals:** Updated Countdown timer to show Days/Hours/Minutes/Seconds to accommodate longer durations.
