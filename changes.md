# Changelog

## [Unreleased]

### Fixed
- **CRITICAL: "Script error." (Explicit Transpilation):** Implemented explicit in-browser transpilation to resolve persistent "Script error." issues. The main application code is now in a `script` tag with `type="text/tsx"` and is manually transformed by Babel Standalone, then executed via `eval()`. This provides more control and can bypass browser security restrictions that cause generic script errors during automatic transpilation.
- **CRITICAL: "Script error." (UMD Scripts):** Resolved a previous loading issue by switching from modern ES Modules (`importmap` and `esm.sh`) to classic UMD script builds for React and ReactDOM. 
- **CRITICAL: Single-File Consolidation:** Resolved an earlier "Script error." by transforming the project into a true single-file application. 
- **CRITICAL: Module Import Error:** Resolved fatal `Cannot use import statement outside a module` error by consolidating all source files.

### Changed
- **Application Code Execution**: Switched from `type="text/babel"` to explicit `Babel.transform` and `eval()` for executing the inlined React/TypeScript code.
- **Major Simplification**: The application has been streamlined into a zero-configuration tool.
  - **Settings Panel Removed**: The settings UI has been completely removed. The countdown target is now hard-coded to the next Wednesday at 6:00 PM.
  - **Simplified Slideshow**: Removed dynamic, schedule-based slides. The slideshow is now a simple, linear presentation of four core slides (Welcome, Pledges, Closing).
- **Architecture:** The application remains a self-contained single `index.html` file using UMD scripts for dependencies, with explicit in-browser transpilation.
- **Welcome Slide:** The "Welcome!" slide still automatically advances after 10 seconds.
- **App Flow:** The app flow is a simple loop: `Countdown` -> `Slideshow` -> `Countdown`.

### Removed
- **Settings Feature**: All code, UI, and state related to the settings panel, custom final slides, and configurable timers has been removed.
- **Dynamic Slides**: The `GAME_SLIDES` constant and the logic to automatically switch to them based on the time of day has been removed.

### Restored (as empty files)
- **`index.tsx`**: Restored as an empty file to match the provided initial state.
- **`types.ts`**: Restored as an empty file to match the provided initial state.
- **`constants.ts`**: Restored as an empty file to match the provided initial state.
- **`App.tsx`**: Restored as an empty file to match the provided initial state.
- **`components/CountdownView.tsx`**: Restored as an empty file to match the provided initial state.
- **`components/SlideshowView.tsx`**: Restored as an empty file to match the provided initial state.
- **`components/Slide.tsx`**: Restored as an empty file to match the provided initial state.
- **`components/SettingsView.tsx`**: Restored as an empty file to match the provided initial state.
- **`vite.config.ts`**: Restored as an empty file to match the provided initial state.
