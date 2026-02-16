# Changelog

## [Unreleased]

### Fixed
- **CRITICAL: Module Import Error:** Resolved fatal `Cannot use import statement outside a module` error. The root cause was attempting to use a multi-file component structure in a build-less environment where the browser cannot resolve and transpile module dependencies.
  - **Solution:** Consolidated all TypeScript/React source files (`App.tsx`, `types.ts`, `constants.ts`, and all component files) into a single `index.tsx`. This eliminates inter-file imports and creates a self-contained application script that Babel Standalone can process correctly.
- **React Render Error:** Corrected a critical React error (#31) caused by a version mismatch between React 18 and React 19 in the `importmap`. All React-related imports have been unified to version 18.2.0.
- **CRITICAL: Black Screen on Deploy:** Resolved the initial black screen issue by adding Babel Standalone to `index.html` for in-browser transpilation.
- **App Loading:** Added missing script entry point to `index.html`.
- **Tailwind Config:** Added inline Tailwind configuration to `index.html`.
- **Path Resolution:** Used relative path for script source to support subdirectory deployments.
- **Slide Layout:** Updated `Slide` component to ensure the live clock is always z-indexed above slide content.
- **Black Screen Debugging:** Added Global Error Handler and React Error Boundary to display errors instead of failing silently.

### Added
- **Perpetual Countdown:** The application now defaults to a countdown mode targeting the next configured service time.
- **Slide Duration:** Added support for auto-advancing slides.
- **Settings Button:** Added the settings gear icon to the Countdown view.
- **Welcome Animation:** Added a custom "pop-in" animation and subtitle to the Welcome slide.

### Changed
- **Welcome Slide:** The "Welcome!" slide now automatically advances after 10 seconds.
- **App Flow:** The app flow is now `Countdown` -> `Slideshow` -> `Countdown`.
- **Settings:** Removed "Countdown Duration" setting.
- **Visuals:** Updated Countdown timer to show Days/Hours/Minutes/Seconds.

### Removed
- **All individual source files**: `App.tsx`, `types.ts`, `constants.ts`, and all files under `components/` have been removed after their contents were merged into `index.tsx`.
- **`vite.config.ts`**: Removed as it was unused and misleading.
- **`components/StandbyView.tsx`**: Removed this unused component.
