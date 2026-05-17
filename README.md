# Evently

A marketplace-style events and vendor app. Hybrid codebase that ships to web and to native iOS/Android from a single React/React Native source tree, backed by Supabase.

## Stack

- **Web:** Vite + React, with `react-native-web` aliasing so most components render in the browser. Entry: `src/main.jsx` → `src/App.web.jsx`.
- **Native:** Expo SDK 55 + React Navigation 7. Entry: `App.js` → `src/App.native.jsx`. iOS bundle id `com.evently.app`, Android package `com.evently.app`.
- 