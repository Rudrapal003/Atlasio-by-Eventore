# atlasio

Free map-first event-planning dashboard for Greater Vancouver. Top-of-funnel for the main Eventore marketplace — open, public, no signup needed to use.

> **Heads up:** the source folder is still called `freeDash/` for git continuity. The deployed brand is `atlasio by Eventore`. A folder rename is fine to do later but isn't necessary — the build output, page title, and OG metadata all say "atlasio."

This is the launchable v0.7 Vite + React + TypeScript app. The single-file HTML mockup that preceded it lives in [`design-reference/`](./design-reference/) for visual continuity.

## Stack

- **Vite + React 18 + TypeScript** — same family as the main `application/` app, but its own deploy target.
- **react-leaflet + OpenStreetMap** — no Google Maps fees, no per-load licensing surprise.
- **CSS Modules** (no Tailwind) — preserves the hand-tuned cream + navy + gold palette and Fraunces / Inter Tight type pairing carried over from Eventore.
- **Supabase** for vendor data, anonymous quotes, plan sync (when authenticated), and outbound click tracking. Schema in [`supabase/schema.sql`](./supabase/schema.sql).
- **lucide-react** for icons.

## Setup

```bash
cd freeDash
npm install
cp .env.example .env.local       # fill in Supabase URL + anon key
npm run dev                      # http://localhost:5174
```

Without `.env.local` the app still runs — it falls back to the bundled `src/data/vendors.json` seed and silently disables tracking. That makes design iteration possible without a backend.

## Scripts

| Command            | What                              |
| ------------------ | --------------------------------- |
| `npm run dev`      | Vite dev server (port 5174)       |
| `npm run build`    | Production build → `dist/`        |
| `npm run preview`  | Preview the production build      |
| `npm run typecheck`| `tsc --noEmit`                    |
| `npm run lint`     | ESLint                            |

## Project layout

```
freeDash/                       (folder — brand is "atlasio")
├── design-reference/           Original single-file HTML mockup (visual continuity)
│   ├── dashboard.html
│   └── NOTES.md
├── public/
│   └── favicon.svg             Brand mark (a. on navy)
├── src/
│   ├── main.tsx                React bootstrap
│   ├── App.tsx                 Top-level composition
│   ├── components/             Floating UI elements (each + .module.css)
│   │   ├── TopBar.tsx          Brand mark + search + budget thermometer + plan + avatar
│   │   ├── BudgetThermometer.tsx
│   │   ├── LeftRail.tsx        Profile + EventCard + Function tools + Refine
│   │   ├── RightRail.tsx       Vendor type categories + "show only my plan"
│   │   ├── MapCanvas.tsx       Leaflet on OSM tiles + emoji markers + custom zoom
│   │   ├── VendorOverlay.tsx   Floating bottom-left vendor card
│   │   ├── PlanDrawer.tsx      Right slide-in plan/checklist
│   │   └── SettingsDrawer.tsx  Left slide-in: Profile / Events / Budget / Prefs / About
│   ├── data/
│   │   ├── categories.ts       9 vendor categories with emoji + hex
│   │   ├── stages.ts           5 plan stages + 7 checklist items
│   │   └── vendors.json        18 seed vendors (placeholder)
│   ├── hooks/
│   │   ├── usePlan.ts          localStorage-backed plan state
│   │   ├── useFilters.ts       Search / category / price / rating / distance
│   │   ├── useBudget.ts        localStorage budget total + spent
│   │   ├── useProfile.ts       Name, email, initial, avatar tone
│   │   ├── useEvents.ts        Multi-event with active + CRUD
│   │   └── useBudgetCategories.ts  Per-category allocation
│   ├── lib/
│   │   ├── supabase.ts         Client (null-safe when env is absent)
│   │   ├── tracking.ts         Outbound click beacon + visitor id
│   │   ├── format.ts           $/stars/days-until
│   │   └── geo.ts              Haversine + Vancouver centroid
│   ├── styles/
│   │   ├── tokens.css          CSS variables
│   │   └── global.css          Body resets, Leaflet polish, marker styles
│   └── types/
│       └── index.ts            Shared TypeScript types
├── supabase/
│   ├── schema.sql              fd_vendors / fd_quotes_anon / fd_outbound_clicks / fd_plans + RLS
│   └── seed.sql                Initial vendor inserts (replace with curated list)
├── index.html                  Vite entry — atlasio brand in title/OG/JSON-LD
├── package.json                name: "atlasio"
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── .env.example
└── .gitignore
```

## Brand

**Wordmark:** `atlas` in brand-deep navy + `io` in gold (`#E8B931`). Sub-line: `by Eventore`.

The name fits the surface — `atlas` for the map-first vendor discovery, `io` for the interactive planning layer that sits on top. Easy to extend to other cities later (`atlasio toronto`, etc.) without losing brand identity.

**Palette + type** continue Eventore's: cream `#F4F1EB`, navy `#1F4E79`, gold `#C9A227`, rose `#E11D48`. Fraunces serif for wordmarks and large numbers, Inter Tight sans for everything else.

**Voice + tone** follow [`../Eventore_Brand_and_Content_Guidelines.docx`](../Eventore_Brand_and_Content_Guidelines.docx) — Title Case for buttons + headings, sentence case for body, "All set." / "Done." / "Got it." confirmations with periods, no exclamation marks in support copy.

## Monetization model (already wired into the data layer)

Two channels go live with v1 — both invisible to users so they don't compromise the "actually free and clean" positioning:

**(a) Sponsored placement.** Each vendor has a `sponsored: boolean` + `sponsored_until` field. Sponsored vendors sort first within their category and get a brighter gold "★ Featured" badge on the vendor card hero and a star on their map marker. Set `sponsored: true` in the DB when a vendor pays — the badge appears automatically. Use `sponsored_until` so a daily job (`fd_clear_expired_sponsored()` in schema.sql) auto-clears expired placements.

**(b) Affiliate-tracked outbound links.** Each vendor has an `outbound_url` field that, when set, replaces the bare website link. The "Visit" button on the vendor card fires a `fd_outbound_clicks` insert (visitor_id + vendor_id + url + surface + sponsored flag) before navigating — fire-and-forget, never blocks the click. Use the partner's tracked URL there; their attribution layer credits you.

A third channel (NOT enabled now): newsletter capture + lead-gen handoff to Eventore for "managed booking" upgrade once a couple has 2+ vendors in their plan.

## SEO + analytics

- `index.html` ships Open Graph + Twitter + JSON-LD `WebApplication` structured data with the atlasio name.
- Canonical URL points at `https://eventore.ca/` — update if/when you point the canonical at a dedicated `atlasio.*` apex.
- Plausible script slot in `.env.example` (`VITE_ANALYTICS_SCRIPT`) — when set, can be injected from `index.html` or `main.tsx`.
- Build emits a separate `leaflet` chunk so the heavy mapping bundle caches independently.

## Deploy

Vercel (recommended, matches the main `application/` app):

```bash
# from this folder
vercel --prod
```

Or Netlify with the `dist/` directory as publish target. Add a `_redirects` line for SPA routing if/when we add routes:
```
/*    /index.html    200
```

## What's NOT in v0.7 (the punch list to v1.0)

1. **Mobile responsive** — the layout breaks below ~1100 px. Next milestone. Mobile gets a bottom-sheet vendor card and a hamburger left rail.
2. **Vendor data swap-in** — `src/data/vendors.json` is still the 18 fictional seeds. Replace with the curated Vancouver set from `../Eventore_Vendor_Target_Tracker.xlsx` once the hygiene pass via `../outreach/` is done.
3. **Authenticated sync** — guests work entirely on localStorage today. Magic-link signup that writes `fd_plans.data` is the easy next step.
4. **Real budget editor extras** — total + per-category allocation already work in Settings; quote-driven actuals come in v1.1.
5. **Quote logging UI** — the "+ Log a quote" button is a stub. v1.1 wires it to `fd_quotes_anon` insert + a moderation queue.
6. **"Upgrade to Eventore" CTA** — appears at 2+ vendors in plan. Goes into v1.1 after the marketplace book flow is itself stable.
7. **Featured-vendor admin surface** — pick which vendors get sponsored, set `sponsored_until`. Start with manual SQL until there's demand.
