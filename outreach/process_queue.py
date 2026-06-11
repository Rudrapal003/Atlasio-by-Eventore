import os
from datetime import datetime

queue_file = r'C:\Users\rudra\Downloads\Eventore\outreach\hunting_queue.md'
verified_file = r'C:\Users\rudra\Downloads\Eventore\outreach\verified_sends_100.md'

with open(queue_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

entries = []
for line in lines[2:]:
    if line.strip():
        parts = [p.strip() for p in line.split('|')[1:-1]]
        if len(parts) >= 5:
            entries.append({
                'name': parts[0],
                'contact': parts[1],
                'email': parts[2],
                'category': parts[3],
                'personal_line': parts[4]
            })

drafts = []
for idx, c in enumerate(entries, 1):
    drafts.append(f"### {idx}. {c['name']} — {c['category']}")
    drafts.append(f"**To:** {c['email']}  \n")
    
    if 'Photographer' in c['category'] or 'Videographer' in c['category']:
        drafts.append('**Subject:** The Knot lawsuit + a better option for Canadian photographers\n')
        drafts.append(f"Hey {c['name']} Team,\n")
        drafts.append(f"{c['personal_line']}\n")
        drafts.append("I'm Rudra, founder of Eventore. You may have seen the news: The Knot is facing a class-action filed April 2025 for charging photographers $700–$1,200/month for fabricated leads. A lot of photographers in Metro Vancouver are looking for an exit.\n")
        drafts.append("We're building the alternative. Eventore matches you with hosts who are already filtered by date, budget, and style — so you're not paying for tire-kickers. Founding photographers get 6 months of Pro free and a permanent \"Founding Vendor\" badge on their profile.\n")
        drafts.append("Takes 4 minutes to tell us if we're building the right thing:\n")
        drafts.append("→ eventore.ca/survey\n")
        drafts.append("Happy to chat if you'd prefer: cal.eventore.ca\n")
        drafts.append("Rudra\nEventore — Vancouver\n")
    elif 'Venue' in c['category'] or 'Planner' in c['category']:
        drafts.append('**Subject:** Filling your open dates — without the listing fee\n')
        drafts.append(f"Hey {c['name']} Team,\n")
        drafts.append(f"{c['personal_line']}\n")
        drafts.append("I'm Rudra, building Eventore — a marketplace connecting event hosts across Canada to venues by date availability, guest count, and budget.\n")
        drafts.append("The problem we're solving: venues pay thousands in directory listing fees or Google ads to reach people who are already comparison-shopping 10 other spaces. We flip it — hosts come in filtered, you only see inquiries that match your capacity and dates.\n")
        drafts.append("Founding venues get 6 months free, a full profile built by us, and a 3% booking fee locked for 12 months.\n")
        drafts.append("If you've got 4 minutes: → eventore.ca/survey\n")
        drafts.append("Or grab a quick call: cal.eventore.ca\n")
        drafts.append("Rudra\nEventore — Vancouver\n")
    elif 'DJ' in c['category']:
        drafts.append('**Subject:** Double-booking headaches + a free calendar for Vancouver DJs\n')
        drafts.append(f"Hey {c['name']} Team,\n")
        drafts.append(f"{c['personal_line']}\n")
        drafts.append("I'm Rudra. I'm building Eventore — a marketplace for event vendors across Canada — and I keep hearing the same thing from DJs and live entertainment acts: double-booking scares you, admin eats your weekends, and leads that come in at 11 PM on Instagram go cold by morning.\n")
        drafts.append("Eventore gives you a free auto-blocking calendar, a lead inbox, and connects you with hosts already filtered by date and budget. Founding vendors get 6 months of Pro free and a booking fee locked at 3%.\n")
        drafts.append("Tell me if we're building the right thing — 4 minutes: → eventore.ca/survey\n")
        drafts.append("Rudra\nEventore — Vancouver\n")
    else:
        drafts.append('**Subject:** A question from a Vancouver event startup\n')
        drafts.append(f"Hey {c['name']} Team,\n")
        drafts.append(f"{c['personal_line']}\n")
        drafts.append("I'm Rudra, building Eventore — a marketplace for event vendors across Greater Vancouver and Canada. Hosts search by date, you get matched with the ones whose budget and vision actually fit what you do. No more quoting 10 couples who disappear.\n")
        drafts.append("Founding vendors get 6 months of Pro free — no card required — and a 3% fee locked for their first year.\n")
        drafts.append("4-minute survey: → eventore.ca/survey\n")
        drafts.append("Happy to talk too: cal.eventore.ca\n")
        drafts.append("Rudra\nEventore — Vancouver\n")
    
    drafts.append('---\n')

out_text = '\n'.join(drafts)

with open(verified_file, 'a', encoding='utf-8') as f:
    f.write('\n\n## Appended from Hunt & Send Pipeline (Hunting Queue)\n\n')
    f.write(out_text)

with open(queue_file, 'w', encoding='utf-8') as f:
    f.write('| Business | Contact | Email | Category | Personalization Fact |\n')
    f.write('| :--- | :--- | :--- | :--- | :--- |\n')

print(f'Processed {len(entries)} entries successfully.')
