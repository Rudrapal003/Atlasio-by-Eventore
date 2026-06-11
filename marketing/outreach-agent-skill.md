# Eventore 300-Contact Outreach Agent

## HOW TO RUN
This is NOT a scheduled task. Rudra runs it manually by saying "run outreach" or similar. It takes as long as needed — hours are fine. Quality over speed.

---

## MISSION

Find **300 NEW email-verified contacts** for Eventore — a two-sided event vendor marketplace launching in Greater Vancouver, expanding across Canada. Rudra is the founder.

**The #1 rule: every single contact MUST have a confirmed email address.** If you can't find an email after thorough searching, DROP that contact and move to the next one. The output file should contain exactly 300 rows, each with a real email. Zero "NOT FOUND" entries.

Output file: `C:\Users\rudra\Downloads\Eventore\outreach\outreach_[YYYY-MM-DD].md`

---

## WHY THIS MATTERS — DELIVERABILITY CRISIS

Current campaign stats show catastrophic deliverability:
- B2C list: 30% delivery rate, 42% soft bounce, 28% hard bounce
- Planners list: 12% delivery rate, 70% soft bounce
- Venues list: 18% delivery rate, 49% soft bounce, 33% hard bounce
- Caterers list: 20% delivery rate, 64% soft bounce

**Root causes:**
1. Many "emails" collected were generic catch-alls (info@, hello@) that get spam-filtered
2. Some emails were guessed or scraped from directories — not verified on the actual business's own page
3. Sending from Gmail (wiseediting24@gmail.com) compounds the issue

**What this means for YOU:** Every email you collect must be one you actually SAW on a real webpage — the business's own website, their Google Business listing, their Instagram bio, or their Facebook page. If you can't see the email with your own eyes on a fetched page, it doesn't count.

---

## CONTACT SPLIT (300 total)

### Vendors: 240 contacts
| Category | Count |
|----------|-------|
| Caterers (halal, South Asian, East Asian, fusion, general) | 35 |
| Photographers & Videographers | 35 |
| Venues (banquet halls, event spaces, gardens, restaurant event rooms) | 30 |
| Decorators & Florists | 30 |
| DJs, MCs, Anchors, Entertainment | 25 |
| Mehndi Artists & Bridal Beauty (makeup, hair) | 25 |
| Specialty (photo booth, dhol, bartenders, valet, lighting, rentals) | 30 |
| Wedding/Event Planners (as vendors) | 30 |

### Customers/Planners: 60 contacts
- Community Facebook group admins (South Asian, cultural)
- Event planning agencies (coordinator's direct email)
- Corporate event managers
- Community centre event coordinators
- Gurdwara/temple/mosque event committee contacts
- Wedding show/expo organizers
- Bridal magazine/blog editors

---

## GEOGRAPHY

**PRIMARY (always include — aim for ~60% of contacts):**
Surrey BC, Burnaby BC, Richmond BC, North Vancouver BC, Coquitlam BC, Vancouver BC

**SECONDARY (rotate — aim for ~40% of contacts, pick 3-4 cities per run):**
Calgary AB, Edmonton AB, Toronto ON, Mississauga ON, Brampton ON, Ottawa ON, Winnipeg MB, Halifax NS, Victoria BC, Kelowna BC, Abbotsford BC, Langley BC

**Rule:** No single city more than 50 contacts per run.

---

## THE SEARCH PROCESS — FOLLOW THIS EXACTLY

For EACH contact, you must complete this multi-step verification. Do not skip steps.

### Step 1: Discovery Search
Use WebSearch to find businesses in the target category + city:
- `"[category] [city] wedding email"`
- `"[category] [city] owner contact"`
- `"[business type] near [city] BC site:instagram.com"`
- Google Maps style: `"[category] in [city]"`

### Step 2: Website Fetch (MANDATORY)
For every promising business, fetch their actual website using `web_fetch`:
- Fetch the homepage first
- Then fetch `/contact`, `/about`, `/about-us`, `/team`, or `/connect` pages
- Look for `mailto:` links in the HTML
- Look for email addresses in plain text
- Look for owner/team member names

### Step 3: Social & Directory Check
If the website doesn't yield an email:
- Search `"[business name] email"` or `"[owner name] [business name] email"`
- Fetch their Instagram page (bio often has email)
- Fetch their Facebook page (About section often has email)
- Check Google Business profile results
- Check WeddingWire, EventWire, or Yelp listings

### Step 4: Email Quality Gate
Before adding a contact to the list, the email must pass ALL of these:
- [ ] You actually SAW the email on a fetched webpage (not guessed/constructed)
- [ ] It's a real email format (name@domain.tld) — not a URL, not a handle
- [ ] The domain matches the business (or is a known provider like gmail.com, outlook.com)
- [ ] It's not a noreply@ address
- [ ] Prefer personal (owner@, firstname@, name@gmail.com) over generic (info@, hello@, contact@)

### Step 5: Personalization
While you're on their website/social, grab ONE specific real detail:
- A recent Instagram post topic
- A specific service they highlight
- An award or feature mentioned
- A review quote
- A specific event type they specialize in
- Their years in business
- A specific menu item, photo style, venue feature, etc.

**This must be REAL and SPECIFIC — never generic like "your great work" or "your beautiful portfolio."**

---

## DUPLICATE PREVENTION

Before starting, read ALL previous outreach files:
```
C:\Users\rudra\Downloads\Eventore\outreach\outreach_*.md
```
Extract every business name. Do NOT include any business that appears in a previous file.

Also check within the current run — no business should appear twice.

---

## EMAIL TEMPLATES

Use the matching template below. Fill [Name] with owner first name if found, otherwise business name. Fill [PERSONALIZATION] with the real specific detail from Step 5.

**IMPORTANT:** Never use a generic placeholder. If you couldn't find a specific detail, go back and look harder — check their Instagram, their reviews, their "About" page.

---

### CATERERS
Subject: Quick question about your catering calendar

Hey [Name],

[PERSONALIZATION — specific detail about their food, cuisine, a notable event they catered, or something from their menu/reviews]

I'm Rudra, building Eventore — a marketplace for event vendors in Greater Vancouver (and now expanding to Calgary and Toronto). The pitch is simple: couples and hosts search by date and budget, your business shows up on their open date, you get the inquiry. No $900/month The Knot contract. No fabricated leads. (They're getting sued over that right now, by the way.)

Founding vendors get 6 months of Pro free — no credit card, no commitment — plus a 3% booking fee locked for your first year instead of our standard 5–8%.

I'm not pitching you anything today. I just want 4 minutes of your opinion:

→ https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec?type=vendor

Or if you'd rather talk: book a 10-minute call at cal.eventore.ca

Rudra
Eventore — Vancouver

---

### PHOTOGRAPHERS / VIDEOGRAPHERS
Subject: The Knot lawsuit + a better option for Canadian photographers

Hey [Name],

[PERSONALIZATION — reference a specific photo style, cultural wedding shot, location they're known for, or a review/post detail]

I'm Rudra, founder of Eventore. You may have seen the news: The Knot is facing a class-action filed April 2025 for charging photographers $700–$1,200/month for fabricated leads. A lot of photographers in Metro Vancouver and Calgary are looking for an exit.

We're building the alternative. Eventore matches you with hosts who are already filtered by date, budget, and style — so you're not paying for tire-kickers. Founding photographers get 6 months of Pro free and a permanent "Founding Vendor" badge on their profile.

Takes 4 minutes to tell us if we're building the right thing:

→ https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec?type=vendor

Happy to chat if you'd prefer: cal.eventore.ca

Rudra
Eventore — Vancouver

---

### VENUES
Subject: Filling your open dates — without the listing fee

Hey [Name],

[PERSONALIZATION — specific detail about the venue's space, capacity, location, style, or a recent event they hosted]

I'm Rudra, building Eventore — a marketplace connecting event hosts across Canada to venues by date availability, guest count, and budget.

The problem we're solving: venues pay thousands in directory listing fees or Google ads to reach people who are already comparison-shopping 10 other spaces. We flip it — hosts come in filtered, you only see inquiries that match your capacity and dates.

Founding venues get 6 months free, a full profile built by us, and a 3% booking fee locked for 12 months.

If you've got 4 minutes: → https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec?type=vendor
Or grab a quick call: cal.eventore.ca

Rudra
Eventore — Vancouver

---

### DECORATORS / FLORISTS
Subject: A question from a Vancouver event startup

Hey [Name],

[PERSONALIZATION — reference a specific piece of their work: mandap, floral arrangement, draping style, balloon arch, stage setup, etc.]

I'm Rudra, building Eventore — a marketplace for event vendors across Greater Vancouver and Canada. Hosts search by date, you get matched with the ones whose budget and vision actually fit what you do. No more quoting 10 couples who disappear.

Founding vendors get 6 months of Pro free — no card required — and a 3% fee locked for their first year.

4-minute survey: → https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec?type=vendor
Happy to talk too: cal.eventore.ca

Rudra
Eventore — Vancouver

---

### DJs / MCs / ANCHORS
Subject: Double-booking headaches + a free calendar for [city] DJs

Hey [Name],

[PERSONALIZATION — mention a recent event, music style, cultural community they serve, or something specific about their sets]

I'm Rudra. I'm building Eventore — a marketplace for event vendors across Canada — and I keep hearing the same thing from DJs and MCs: double-booking scares you, admin eats your weekends, and leads that come in at 11 PM on Instagram go cold by morning.

Eventore gives you a free auto-blocking calendar, a lead inbox, and connects you with hosts already filtered by date and budget. Founding vendors get 6 months of Pro free and a booking fee locked at 3%.

Tell me if we're building the right thing — 4 minutes: → https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec?type=vendor

Rudra
Eventore — Vancouver

---

### MEHNDI ARTISTS / BRIDAL BEAUTY
Subject: Bridal bookings in [city] — building something for you

Hey [Name],

[PERSONALIZATION — reference their mehndi style, bridal portfolio, cultural specialty, or a specific post detail]

I'm Rudra, building Eventore — a marketplace for event vendors in Greater Vancouver's South Asian, East Asian, and Persian communities, now expanding to Calgary and Toronto.

Bridal beauty vendors are among the first booked and the hardest to find at the last minute. Eventore connects you with brides planning 6–12 months out, already filtered by date and budget.

Founding vendors: 6 months of Pro free, profile built by us, and leads from day one.

Takes 4 minutes: → https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec?type=vendor

Rudra
Eventore — Vancouver

---

### SPECIALTY VENDORS (photo booth / dhol / bartenders / lighting / valet)
Subject: You're hard to find on Google — we want to fix that

Hey [Name],

[PERSONALIZATION — mention their specific specialty and something distinctive about their service, setup, or a recent event]

I'm Rudra, building Eventore — a Canadian event marketplace. Specialty vendors are genuinely hard to discover. You're not on The Knot, there's no obvious directory, and most hosts find you through someone who knows someone.

Eventore gives specialty vendors a profile that hosts find when they search by date and service type. Founding vendors get 6 months of Pro free, a 3% booking fee locked for year one, and a "Founding Vendor" badge.

4-minute survey: → https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec?type=vendor

Rudra
Eventore — Vancouver

---

### WEDDING / EVENT PLANNERS (as vendors)
Subject: Are you taking on new clients in [city]? Quick question.

Hey [Name],

[PERSONALIZATION — reference a specific event type they specialize in, a review, their style, or cultural community they serve]

I'm Rudra, building Eventore — a marketplace for event vendors across Canada. Wedding and event planners are one of the first things couples search for, and we want to make sure the best planners in Surrey, Vancouver, Calgary, and Toronto are easy to find.

Eventore gives planners a professional profile, lead inbox filtered by date and budget, and connects you with hosts actively looking to hire right now.

Founding vendors: 6 months of Pro free, no credit card, 3% booking fee locked for 12 months.

4-minute survey: → https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec?type=vendor

Rudra
Eventore — Vancouver

---

### CUSTOMERS / EVENT HOSTS / PLANNERS
Subject: Planning an event in [city]? We want your opinion (4 min)

Hey [Name],

[PERSONALIZATION — reference their role, the type of events they plan, their community, or something specific about their organization/profile]

I'm Rudra, building Eventore — a marketplace that makes it easy to find the right event vendors in your city by date, budget, and cultural fit. Think of it as the Airbnb for event vendors — you search by what you need, see who's actually available on your date, and book directly.

We're in early validation right now and talking to event hosts and planners before we build anything. Your perspective — what's frustrating about finding vendors today — would genuinely shape what we build.

Takes 4 minutes: → https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec?type=customer

Or happy to chat: cal.eventore.ca

Rudra
Eventore — Vancouver

---

## OUTPUT FORMAT

Save as: `C:\Users\rudra\Downloads\Eventore\outreach\outreach_[YYYY-MM-DD].md`

```
# Eventore Outreach — [Date]
**Target:** 240 vendors + 60 customers = 300 total contacts
**Quality:** ALL contacts have verified email addresses (zero NOT FOUND)

## Contact Table

| # | Business | Category | City | Email | Email Type | Source | Owner Name | Website/IG | Personalization |
|---|----------|----------|------|-------|------------|--------|------------|------------|-----------------|
| 1 | ... | ... | ... | owner@domain.ca | personal | website contact page | Jane Smith | example.com | Specializes in mandap decor for Sikh weddings |

Email Type: `personal` or `generic`
Source: where you found the email (e.g. "website contact page", "instagram bio", "google business listing", "facebook about", "weddingwire listing")

---

## Draft Emails

### 1. [Business Name] — [Category] — [City]
**To:** [email]
**Subject:** [subject line]

[full email body with real personalization]

---

(repeat for all 300)

---

## Run Summary
- Total contacts: 300
- Vendors: 240 | Customers: 60
- Personal emails: X | Generic emails: X
- Cities covered: [list]
- Categories covered: [list with counts]
- Businesses searched but dropped (no email found): X
- Duplicate businesses skipped (from previous files): X
- Average searches per confirmed contact: ~X
- Email sources: website (X), instagram (X), facebook (X), google listing (X), directory (X)
```

---

## EXECUTION STRATEGY

This task will take a long time. That's expected and fine. Here's how to work efficiently:

1. **Work in batches by category + city.** Do all caterers in Surrey, then all caterers in Calgary, etc. This makes searches more efficient.

2. **Use parallel web fetches.** When you find 3-4 business websites, fetch their contact pages together.

3. **Track your rejection pile.** Keep a running count of businesses you searched but couldn't find email for. This goes in the summary.

4. **Save progress incrementally.** Every 50 contacts, append to the output file so nothing is lost if interrupted.

5. **Don't invent emails.** If a website only has a contact form and no email, move on. 300 real emails beats 500 fake ones.

6. **Diversify sources.** Don't pull 30 contacts from the same Yelp page. Mix: Google search, Instagram, WeddingWire, Bark.com, EventWire, Sulekha, Facebook pages, Google Maps, direct website fetching, LinkedIn.

7. **Prefer small/solo businesses.** Solo photographers, independent mehndi artists, small catering companies — these are more likely to have personal emails visible and more likely to respond to cold outreach than large corporate venues.

---

## CRITICAL REMINDERS

- **ZERO "NOT FOUND" entries.** Every row must have a real email. Drop contacts without emails.
- **Every email must come from a fetched page.** You saw it. On a real page. Not guessed.
- **No duplicates against previous outreach files.** Check first.
- **Real personalization only.** Every email draft must reference something specific you found while researching that business.
- **Take your time.** Quality matters more than speed. This can run for hours.
