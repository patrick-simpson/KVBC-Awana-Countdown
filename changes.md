# Changelog

## [Unreleased]

### Added
- **Perpetual Countdown:** The application now defaults to a countdown mode targeting the next configured service time (default: Wednesday 6:00 PM) instead of a standby screen.
- **Slide Duration:** Added support for auto-advancing slides after a specific duration.
- **Settings Button:** Added the settings gear icon to the top-right of the Countdown view to ensure accessibility at all times.

### Changed
- **Welcome Slide:** The "Welcome!" slide now automatically advances to the Pledge slide after 10 seconds.
- **App Flow:** Removed `StandbyView`. The app flow is now `Countdown` -> `Slideshow` -> `Countdown`.
- **Settings:** Removed "Countdown Duration" setting as the timer is now based on the calendar target.
- **Visuals:** Updated Countdown timer to show Days/Hours/Minutes/Seconds to accommodate longer durations.

### Fixed
- **Navigation:** Ensure settings can be accessed and closed without resetting the target time incorrectly.
