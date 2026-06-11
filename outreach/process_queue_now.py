import os
import re
from datetime import datetime

queue_file = r"C:\Users\rudra\Downloads\Eventore\outreach\hunting_queue.md"
append_file = r"C:\Users\rudra\Downloads\Eventore\outreach\verified_sends_100.md"

with open(queue_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

data = []
for line in lines:
    if line.strip().startswith('|') and not line.strip().startswith('|---') and not line.strip().startswith('| Business') and not line.strip().startswith('| :---'):
        parts = [p.strip() for p in line.split('|')[1:-1]]
        if len(parts) >= 5:
            data.append({
                'name': parts[0],
                'contact': parts[1],
                'email': parts[2],
                'category': parts[3],
                'personal_line': parts[4]
            })

now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

out = f"\n## Appended from Hunting Queue ({now})\n\n"

for i, c in enumerate(data, 1):
    out += f"### {i}. {c['name']} — {c['category']}\n"
    out += f"**To:** {c['email']}  \n\n"
    
    cat = c['category']
    if "Photographer" in cat or "Videographer" in cat:
        out += "**Subject:** The Knot lawsuit + a better option for Canadian photographers\n\n"
        out += f"Hey {c['name']} Team,\n\n"
        out += f"{c['personal_line']}\n\n"
        out += "I'm Rudra, founder of Eventore. You may have seen the news: The Knot is facing a class-action filed April 2025 for charging photographers $700–$1,200/month for fabricated leads. A lot of photographers in Metro Vancouver are looking for an exit.\n\n"
        out += "We're building the alternative. Eventore matches you with hosts who are already filtered by date, budget, and style — so you're not paying for tire-kickers. Founding photographers get 6 months of Pro free and a permanent \"Founding Vendor\" badge on their profile.\n\n"
        out += "Takes 4 minutes to tell us if we're building the right thing:\n\n"
        out += "→ eventore.ca/survey\n\n"
        out += "Happy to chat if you'd prefer: cal.eventore.ca\n\n"
        out += "Rudra\nEventore — Vancouver\n\n"
    elif "Venue" in cat or "Planner" in cat:
        out += "**Subject:** Filling your open dates — without the listing fee\n\n"
        out += f"Hey {c['name']} Team,\n\n"
        out += f"{c['personal_line']}\n\n"
        out += "I'm Rudra, building Eventore — a marketplace connecting event hosts across Canada to venues by date availability, guest count, and budget.\n\n"
        out += "The problem we're solving: venues pay thousands in directory listing fees or Google ads to reach people who are already comparison-shopping 10 other spaces. We flip it — hosts come in filtered, you only see inquiries that match your capacity and dates.\n\n"
        out += "Founding venues get 6 months free, a full profile built by us, and a 3% booking fee locked for 12 months.\n\n"
        out += "If you've got 4 minutes: → eventore.ca/survey\n\n"
        out += "Or grab a quick call: cal.eventore.ca\n\n"
        out += "Rudra\nEventore — Vancouver\n\n"
    elif "DJ" in cat:
        out += "**Subject:** Double-booking headaches + a free calendar for Vancouver DJs\n\n"
        out += f"Hey {c['name']} Team,\n\n"
        out += f"{c['personal_line']}\n\n"
        out += "I'm Rudra. I'm building Eventore — a marketplace for event vendors across Canada — and I keep hearing the same thing from DJs and live entertainment acts: double-booking scares you, admin eats your weekends, and leads that come in at 11 PM on Instagram go cold by morning.\n\n"
        out += "Eventore gives you a free auto-blocking calendar, a lead inbox, and connects you with hosts already filtered by date and budget. Founding vendors get 6 months of Pro free and a booking fee locked at 3%.\n\n"
        out += "Tell me if we're building the right thing — 4 minutes: → eventore.ca/survey\n\n"
        out += "Rudra\nEventore — Vancouver\n\n"
    else:
        out += "**Subject:** A question from a Vancouver event startup\n\n"
        out += f"Hey {c['name']} Team,\n\n"
        out += f"{c['personal_line']}\n\n"
        out += "I'm Rudra, building Eventore — a marketplace for event vendors across Greater Vancouver and Canada. Hosts search by date, you get matched with the ones whose budget and vision actually fit what you do. No more quoting 10 couples who disappear.\n\n"
        out += "Founding vendors get 6 months of Pro free — no card required — and a 3% fee locked for their first year.\n\n"
        out += "4-minute survey: → eventore.ca/survey\n\n"
        out += "Happy to talk too: cal.eventore.ca\n\n"
        out += "Rudra\nEventore — Vancouver\n\n"
    
    out += "---\n\n"

with open(append_file, 'a', encoding='utf-8') as f:
    f.write(out)

with open(queue_file, 'w', encoding='utf-8') as f:
    f.write("| Business | Contact | Email | Category | Personalization Fact |\n|---|---|---|---|---|\n")

print(f"Processed {len(data)} entries successfully.")
