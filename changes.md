# Changelog

## [Unreleased]

### Fixed
- **Vite Configuration Error:** Resolved the "config must export or return an object" error by populating `vite.config.ts` with a valid configuration using `defineConfig` and the React/Tailwind plugins.
- **Project Structure:** Migrated the application from a single-file `index.html` with in-browser transpilation to a proper Vite/React project structure. This resolves issues with the dev server and build process.

### Changed
- **Architecture:** Transitioned from a standalone `index.html` using UMD scripts and Babel Standalone to a modern React 19 project using Vite 6, Tailwind CSS v4, and TypeScript.
- **Dependencies:** Installed `react`, `react-dom`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `lucide-react`, and `motion` as proper npm dependencies.
- **Code Organization:** Extracted code from `index.html` into dedicated files: `App.tsx`, `index.tsx`, `constants.ts`, `types.ts`, and component files in `src/components/`.
- **Styling:** Migrated styles to `index.css` using Tailwind CSS v4 `@import "tailwindcss";` and custom theme animations.
- **Schedule-Based Timers:** Implemented a dynamic scheduling system that switches views and countdowns based on the current time:
  - 6:05 PM - 6:30 PM: T&T Game Time (Red theme)
  - 6:30 PM - 7:00 PM: Sparks Game Time (Blue theme)
  - 7:00 PM - 7:30 PM: Puggles & Cubbies Game Time (Green theme)
  - 7:30 PM - 7:35 PM: "See you next week!" slide
  - 7:35 PM+: "System Shutdown" view with pulse animation
- **Quick Nav Manual Override:** Added a subtle navigation menu (visible on hover in the top-right corner) that allows users to manually skip to any club's game time, the main countdown, or the slideshow, bypassing the automatic schedule when needed.
- **GitHub Pages Preparation:**
  - Configured `base: './'` in `vite.config.ts` to ensure relative asset paths.
  - Added a `deploy` script to `package.json` using the `gh-pages` package for easy one-command deployment.

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
