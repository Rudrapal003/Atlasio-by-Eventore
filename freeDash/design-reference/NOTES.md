# freeDash — Eventore's free planning dashboard

Top-of-funnel for Eventore. A free, public, web-based event-planning dashboard. Map-first, vendor-discovery focused, with a per-vendor follow-up checklist that drives retention.

This folder holds the v0 sample: a single-file HTML mockup you can open in any browser and edit live.

## Files

- **`dashboard.html`** — the whole mockup in one file. React-equivalent vanilla JS, Leaflet + OpenStreetMap (free, no API key, no licensing surprise), custom CSS that blends the Eventore palette with brighter category accents on buttons and vendor cards.
- *(this README)* — context and what to look at.

## How to view

Double-click `dashboard.html`. It opens in your default browser. No build step, no server.

## What's in the sample

- **Top bar:** brand mark (`freeDash` by Eventore), Vancouver location pill, search, "My Plan" button with a live count badge.
- **Left rail filters:** vendor type (9 categories, each with its own accent color), distance slider from city center, price tier (\$–\$\$\$\$), minimum rating.
- **Map:** Leaflet on OSM tiles, 18 seed vendors across Greater Vancouver, color-coded category markers with a category letter on each marker. Selected marker grows + gets a brand-blue halo.
- **Vendor card** (right panel, on marker click): category-coloured tag, price tier, name in Fraunces serif, rating + area, brief description, contact grid (email / phone / website), "Add to my plan" CTA, "Copy contact" secondary action, and a "Known quotes" section (community-contributed pattern — empty state seeds the network-effect copy).
- **My Plan drawer** (right panel, on "My Plan" click): stats bar (total vendors / booked / in progress), a card per saved vendor with a 7-step checklist (Reviewed portfolio → Sent inquiry → Requested quote → Compared with 1+ other → Contract signed → Deposit paid → Final-confirm 7d out), notes textarea per vendor, stage pill that auto-derives from which boxes are checked, remove-from-plan action.

## Design notes

- **Palette is Eventore's** — cream (`#F4F1EB`), navy brand (`#1F4E79`), gold accent (`#C9A227`), rose (`#E11D48`) — with brighter category colors (`#F59E0B`, `#10B981`, `#8B5CF6`, `#06B6D4`, `#EC4899`, `#6366F1`) reserved for category buttons, markers, and vendor card tags.
- **Type pairs Fraunces serif** (vendor names, brand mark, large numbers) **with Inter Tight sans** (everything else). Inter Tight is more compact than plain Inter and avoids the generic look.
- **Radii match Eventore's tokens** (8 / 14 / 20 px + pill).
- **No AI-slop conventions** — no centered hero, no purple gradient, no uniform rounded corners. Dashboard density.

## Vendor data

The 18 vendors are *fictional* names with plausible Vancouver areas. The legal/ToS concerns we discussed (no auto-scraping of real businesses) are baked in here from day zero. The seed will eventually be replaced by:

1. Curated Vancouver vendors from `Eventore_Vendor_Target_Tracker.xlsx`.
2. Hygiene/verification pass via the `outreach/` Python infra (website live? email valid? category right?).
3. User-contributed quotes (anonymous), powering the "Known quotes" section.

## What to look at and react to

- Overall feel — does this read as Eventore-adjacent, or does it feel like a different brand?
- Brightness of the category colors on buttons and the vendor card — too much, too little, right?
- Filter rail vs map space — is the left rail too wide? Too narrow?
- Vendor card structure — what's missing? Quote display? Past-clients photos? Availability calendar?
- Checklist flow — are the 7 stages the right ones? Should "deposit paid" and "contract signed" be merged into a single "booked" step?

## What comes next (per the OODA plan)

1. **Approve v0 visual direction** (this file).
2. **Stand up real backend** — same Supabase as `application/`, separate tables (`free_vendors`, `free_plans`, `free_quotes_anon`). Auth optional; plan state persists locally for guests, syncs on signup.
3. **Replace seed data** with hand-curated Vancouver list.
4. **Wire `outreach/` automation** to maintain vendor data hygiene weekly.
5. **Add "upgrade to Eventore" CTA** at the point where the user has booked 2+ vendors — that's when their planning load gets real and managed booking becomes attractive.
