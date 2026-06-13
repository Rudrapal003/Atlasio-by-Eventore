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

## Launch model (the reason we can ship without vendor reach-out)

atlasio is a **directory + planner**, not a marketplace, at launch. Vendor profiles show only public business info — name, address, phone, website, area, category. No vendor consent is needed to display public info, the same posture Yelp and Google Maps operate from. This lets us launch with curated Greater Vancouver coverage without the chicken-and-egg cold-outreach problem.

Critically, we **don't display approximate per-vendor pricing**. The vendor card has no $ tier or fake quote — we don't claim to know what an individual vendor charges. The price-tier filter is gone too.

Instead, atlasio runs a **crowdsourced-expense flywheel**:

1. Planners add vendors to their plan and use **+ Add Expense** to log what they actually spent (deposit / final payment / tasting / etc.) with an amount and a date.
2. Each logged expense fires `trackExpenseLog()` — an anonymous beacon to `fd_vendor_expenses` (visitor_id + vendor_id + amount + label + spent_on).
3. The `fd_vendor_expense_summary` view aggregates these (with a privacy floor of `count(*) >= 3` before any vendor's stats are exposed) into average / median / range, broken out by expense label.
4. Once each vendor has ≥ 3 entries, vendor cards start showing "Average paid here: $X (N planners)" — real market data, sourced from real bookings.
5. That same dataset becomes leverage in vendor outreach later: *"here's what your customers actually paid through atlasio this year — want to claim your profile and offer a transparent quote tier?"*

## Monetization channels (already wired into the data layer)

Two channels, both invisible to users so the "actually free and clean" positioning isn't compromised:

**(a) Sponsored placement.** Each vendor has a `sponsored: boolean` + `sponsored_until` field. Sponsored vendors sort first within their category and get a gold "★ Featured" badge on the vendor card hero plus a star on their map marker. SQL function `fd_clear_expired_sponsored()` auto-clears expired flags on a cron.

**(b) Affiliate-tracked outbound links.** Each vendor can carry an `outbound_url` that replaces the bare website link. The "Visit" button on the vendor card fires a `fd_outbound_clicks` insert (visitor_id + vendor_id + url + surface + sponsored flag) before navigating — fire-and-forget, never blocks the click.

A third channel (not live yet): newsletter capture + lead-gen handoff to the main Eventore marketplace for "managed booking" upgrade once a couple has 2+ vendors in their plan.

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

## What's NOT in v0.8 (the punch list to v1.0)

1. **Mobile responsive** — the layout breaks below ~1100 px. Next milestone. Mobile gets a bottom-sheet vendor card and a hamburger left rail.
2. **Vendor data swap-in** — `src/data/vendors.json` is still the 18 fictional seeds. Replace with the curated Vancouver set from `../Eventore_Vendor_Target_Tracker.xlsx` once the hygiene pass via `../outreach/` is done. Only public-info fields populate; pricing comes from the crowdsourced flywheel.
3. **Authenticated sync** — guests work entirely on localStorage today. Magic-link signup that writes `fd_plans.data` is the easy next step.
4. **"Average paid here" surface on vendor cards** — query `fd_vendor_expense_summary` once a vendor crosses the 3-entry floor and render the number on the vendor overlay. The data layer is ready; just needs the read path + a small display.
5. **In-app messaging** — `MessagesDrawer` shipped as a proper empty-state inbox; v1.1 wires the real backend (`fd_messages` + `fd_threads`) and a composer.
6. **"Upgrade to Eventore" CTA** — appears at 2+ vendors in plan. Goes into v1.1 after the marketplace book flow is itself stable.
7. **Featured-vendor admin surface** — pick which vendors get sponsored, set `sponsored_until`. Start with manual SQL until there's demand.
