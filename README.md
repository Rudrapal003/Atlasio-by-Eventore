# Eventore

A marketplace-style events and vendor app for the Greater Vancouver market. This repo is a workspace: the app, the go-to-market motion (vendor outreach, survey, pitch), and the brand/legal/policy library all live alongside each other.

## Workspace layout

```
.
├── application/                The Eventore app — Expo (native) + Vite (web), Supabase backend
├── marketing/                  Vendor + planner + caterer + DJ + venue contact lists, agent skill
│   └── outreach/               Daily outreach run logs (markdown, dated)
├── outreach/                   Outreach automation: Python scripts + queues + campaign templates
├── contacts/                   Google Apps Script for survey response collection
├── survey-deploy/              Deployed survey landing page (single index.html)
├── survey-launch/              Survey launch collateral — screenshots + email draft
├── investor_pitch_deck.md / .docx
├── Eventore_*.docx / .xlsx / .html      Brand, legal, policy, prototype, mockups (see Reference docs)
└── survey-*-qr-code.png        QR codes for the live survey and live app
```

### outreach/ vs marketing/outreach/

Two folders with the same word, different jobs:

- **`outreach/`** (root) is the *system*: Python generators (`generate_outreach.py`, `process_queue.py`), the hunting queue, B2B and B2C campaign templates, and the verified-sends log.
- **`marketing/outreach/`** is the *output*: dated daily run files produced by that system (`outreach_2026-06-10.md` etc.).

Worth eventually consolidating; for now, treat `outreach/` as code and `marketing/outreach/` as data.

## The app — `application/`

Hybrid codebase that ships to web and to native iOS/Android from one React/React Native source tree.

- **Web:** Vite + React, with `react-native-web` aliasing. Entry: `src/main.jsx` → `src/App.web.jsx`.
- **Native:** Expo SDK 55 + React Navigation 7. Entry: `App.js` → `src/App.native.jsx`. Bundle ids `com.eventore.app` (iOS / Android).
- **Backend:** Supabase. Schema in `application/supabase_schema.sql`, seed data in `application/supabase_seed.sql`, client in `application/src/lib/supabaseClient.js`.
- **Payments:** Stripe (`@stripe/stripe-js`, `@stripe/stripe-react-native`).
- **Maps & icons:** Leaflet, lucide-react / lucide-react-native.
- **Native capabilities:** `expo-local-authentication`, `expo-notifications`, `expo-device`, `expo-constants`, `@react-native-async-storage/async-storage`.
- **State:** `application/src/AppContext.js` + dedicated `application/src/navigation/` folder.
- **Builds:** EAS config at `application/eas.json`. Native Android project at `application/android/`.
- **Hosting (web):** Vercel (`application/vercel.json`); Netlify supported via `application/netlify.toml`.

34 screens covering onboarding, auth, vendor discovery and profiles, the multi-vendor booking funnel (EventWizard → EventBudgetStep → BookingConfirm → MultiVendorCheckout → Success), post-booking flows (MyEvents, DayOfTimeline, Inquiries, Messages, ChatView, DisputeFlow, ReviewPrompt), and creator/vendor tooling (CreatorDashboard, PortfolioManager, Profile).

### Dev loop

```bash
cd application
npm install            # if you haven't yet — node_modules isn't tracked
npm run dev            # web (Vite)
npm start              # native (Expo)
npm run android        # native Android emulator
npm run ios            # native iOS simulator
npm run build          # web production build → dist/
```

`application/.env` already exists with Supabase + Stripe keys; copy it forward when sharing the repo elsewhere.

## Reference docs (repo root)

Product, brand, legal, and operational source-of-truth — versioned alongside the code:

- **Product / engineering:** `Eventore_PRD.docx`, `Eventore_Engineering_Handbook.docx`
- **Brand:** `Eventore_Brand_and_Content_Guidelines.docx`
- **Operations:** `Eventore_Operations_Playbook.docx`
- **Launch:** `Eventore_Launch_Plan.docx`, `Eventore_Positioning_Roadmap_Launch.docx`, `Eventore_Positioning_Roadmap_Launch_v2.docx`
- **Legal:** `Eventore_Terms_of_Service.docx`, `Eventore_Privacy_Policy.docx`, `Eventore_Community_Guidelines.docx`, `Eventore_Vendor_Agreement.docx`, `Eventore_Cancellation_and_Refund_Policy.docx`
- **Vendor pipeline:** `Eventore_Vendor_Outreach_Plan.docx`, `Eventore_Vendor_Target_Tracker.xlsx`, `Eventore_Outreach_Contact_List.xlsx`
- **Survey:** `Eventore_Survey_Setup_Guide.docx` / `.md`, `Eventore_Survey_Vendors.html`, `Eventore_Survey_Collector.gs`
- **Prototype / mockups:** `Eventore_Prototype_v1.html`, `Eventore_UI_Mockups_v1.html`
- **Investor:** `investor_pitch_deck.md` (source) + `.docx` (handout)
