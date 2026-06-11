# Eventore

A marketplace-style events and vendor app. Hybrid codebase that ships to web and to native iOS/Android from a single React/React Native source tree, backed by Supabase.

## Stack

- **Web:** Vite + React, with `react-native-web` aliasing so most components render in the browser. Entry: `src/main.jsx` → `src/App.web.jsx`.
- **Native:** Expo SDK 55 + React Navigation 7. Entry: `App.js` → `src/App.native.jsx`. iOS bundle id `com.eventore.app`, Android package `com.eventore.app`.
- **Backend:** Supabase (`@supabase/supabase-js`). Schema lives in `supabase/schema.sql`; client in `src/lib/supabaseClient.js`.
- **Native capabilities:** `expo-local-authentication`, `expo-notifications`, `expo-device`, `expo-constants`.
- **Hosting:** Vercel (see `vercel.json`). Netlify is supported as an alternative via `netlify.toml`.

## Scripts

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Vite dev server (web)                     |
| `npm run build`   | Vite production build to `dist/`          |
| `npm run preview` | Preview the Vite build                    |
| `npm run web`     | Expo web (alternative to Vite)            |
| `npm start`       | Expo dev server (native)                  |
| `npm run ios`     | Build and run on iOS simulator            |
| `npm run android` | Build and run on Android emulator         |
| `npm run lint`    | ESLint over the repo                      |

## Project layout

```
.
├── App.js                       Expo entry — registers src/App.native.jsx
├── app.json                     Expo config (name, ids, splash, plugins)
├── index.html                   Vite web entry
├── vite.config.js               Vite + react-native-web aliasing
├── metro.config.js              Metro bundler config for Expo
├── eslint.config.js
├── vercel.json                  Vercel deployment config
├── netlify.toml                 Netlify deployment config (alt)
├── public/                      Web static assets (favicon, manifest, icons)
├── supabase/
│   └── schema.sql               Database schema
└── src/
    ├── App.native.jsx           Native shell (React Navigation stack)
    ├── App.web.jsx              Web shell
    ├── main.jsx                 Vite/web bootstrap
    ├── index.css
    ├── assets/                  Hero image, logos
    ├── components/              ErrorBoundary, Navbar
    ├── lib/                     supabaseClient
    ├── screens/                 ~20 screen components (see below)
    └── styles/theme.js          Shared theme tokens
```

### Screens

Onboarding, authentication (Login web + native, SignUp), vendor discovery and profiles (VendorDiscovery, VendorProfile), the booking funnel (EventWizard, EventBudgetStep, BookingConfirm, MultiVendorCheckout, Success), post-booking flows (MyEvents, DayOfTimeline, Inquiries, Messages, ChatView, DisputeFlow, ReviewPrompt), and creator/vendor tooling (CreatorDashboard, PortfolioManager, Profile).

## Setup

```bash
npm install
cp .env.example .env.local   # if/when an example is added; supply Supabase keys
npm run dev                  # web
# or
npm start                    # native via Expo
```

Supabase credentials are read from environment by `src/lib/supabaseClient.js` — see that file for the exact variable names.

## Reference docs

The repo root also holds the product, brand, legal, and operational documents that govern the app:

- `Eventore_PRD.docx`
- `Eventore_Engineering_Handbook.docx`
- `Eventore_Brand_and_Content_Guidelines.docx`
- `Eventore_Operations_Playbook.docx`
- `Eventore_Launch_Plan.docx`, `Eventore_Positioning_Roadmap_Launch.docx`
- `Eventore_Terms_of_Service.docx`, `Eventore_Privacy_Policy.docx`
- `Eventore_Community_Guidelines.docx`, `Eventore_Vendor_Agreement.docx`
- `Eventore_Cancellation_and_Refund_Policy.docx`
- `Eventore_UI_Mockups_v1.html`
