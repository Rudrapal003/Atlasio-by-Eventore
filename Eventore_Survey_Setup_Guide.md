# Eventore Survey — Google Sheet Connection Guide

**Your Google Sheet:** https://docs.google.com/spreadsheets/d/1Oj9g4Xj5jvN3D2DsEXQjNaIKmJmf3amndgxQ9KpaZ64/edit

Everything is built and ready. You just need to deploy the Apps Script once to get a Web App URL, then paste it into both survey files. Takes about 5 minutes.

---

## Step 1 — Open Apps Script in your Sheet

1. Open your Google Sheet (link above)
2. Click **Extensions → Apps Script**
3. You'll see a code editor. **Delete everything** in it.
4. Open the file `Eventore_Survey_Collector.gs` from your project folder
5. Copy the entire contents and paste it into the Apps Script editor
6. Click **Save** (the floppy disk icon or Ctrl+S)

---

## Step 2 — Deploy as a Web App

1. Click **Deploy → New deployment** (top right)
2. Click the **gear icon ⚙️** next to "Select type" → choose **Web app**
3. Fill in:
   - Description: `Eventore Survey Collector`
   - Execute as: **Me (your email)**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Google will ask you to authorize — click **Authorize access**, choose your Google account, click **Advanced → Go to Eventore Survey Collector (unsafe)**, then **Allow**
6. You'll see a popup with your **Web app URL** — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`
7. **Copy that URL** — you'll need it in Step 3

---

## Step 3 — Paste the URL into both survey files

Open each file in a text editor (VS Code, Notepad, etc.) and find the line:

```
const FORM_ENDPOINT = "";
```

Paste your Web App URL between the quotes:

```
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycb.../exec";
```

**Do this in both files:**
- `Eventore_Survey_Vendors.html`
- `survey-deploy/index.html`

Save both files.

---

## Step 4 — Test it

1. Open `Eventore_Survey_Vendors.html` in your browser (double-click it)
2. Fill out the survey as a test vendor and submit
3. Go to your Google Sheet → look for a new tab called **"vendor"** with your test row
4. Do the same with `survey-deploy/index.html` — submit as a planner → check the **"customer"** tab

If rows appear, you're live. ✓

---

## What the sheet will look like

**"vendor" tab columns (34 columns):**
`submitted_at` | `v_category` | `v_years` | `v_events` | `v_team` | `v_cultural` | `v_leads` | `v_spend` | `v_calendar` | `v_payments` | `v_hours` | `v_pains` | `v_doublebook` | `v_lost_leads` | `v_knot` | `v_likely` | `v_disappointed` | `v_value` | `v_concern` | `v_subscribe` | `v_price` | `v_commission` | `v_feat_calendar` | `v_feat_leads` | `v_feat_sync` | `v_feat_pay` | `v_feat_backup` | `v_feat_cultural` | `v_missing` | `v_city` | `v_business` | `v_email` | `v_refer`

**"customer" tab columns (31 columns):**
`submitted_at` | `user_role` | `p_types` | `p_budget` | `p_location` | `p_find` | `p_pain` | `p_time` | `p_likely` | `p_disappointed` | `p_features` | `p_concern` | `p_email` | `p_refer` | `v_type` | `v_events` | `v_location` | `v_cultural` | `v_find` | `v_spend` | `v_calendar` | `v_hours` | `v_pain` | `v_likely` | `v_disappointed` | `v_features` | `v_concern` | `v_email` | `v_business` | `v_refer`

Headers are auto-created, bold, dark blue, frozen on row 1.

---

## Where the surveys live

| Survey | File | URL |
|--------|------|-----|
| Vendor survey | `Eventore_Survey_Vendors.html` | Open locally or host on Surge |
| Combined (host + vendor) | `survey-deploy/index.html` | https://eventore-survey-app.surge.sh/ |
| Combined (customers copy) | `public/Eventore_Survey_Customers.html` | — |

The combined survey already has a Web3Forms connection (responses go to your email too) via the key `a4c098e7-6b2a-415f-a352-7695ff02d3ca`. After Step 3, every submission will go to **both** your email AND the Google Sheet.

---

## If you need to redeploy

After editing the Apps Script code:
- Click **Deploy → Manage deployments**
- Click the pencil ✏️ on your existing deployment
- Under "Version" select **"New version"**
- Click **Deploy**

The URL stays the same — you don't need to update the survey files.
