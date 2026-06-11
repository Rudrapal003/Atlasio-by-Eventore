import os
import re
from datetime import datetime

file_path = r"C:\Users\rudra\Downloads\Eventore\outreach\outreach_2026-05-29.md"

vendors = [
    {"name": "Savoury City Catering", "category": "Caterer", "city": "Vancouver, BC", "email": "info@savourycity.com", "personal_line": "Your farm-to-table approach and visually stunning grazing tables have made you a staple at Vancouver's most elegant events."},
    {"name": "White Table Catering", "category": "Caterer", "city": "Abbotsford, BC", "email": "info@whitetablecatering.com", "personal_line": "Your dedication to scratch-made, locally sourced menus brings an authentic and refined dining experience to every wedding you cater."},
    {"name": "Truffles Fine Foods", "category": "Caterer", "city": "Vancouver, BC", "email": "info@trufflesfinefoods.com", "personal_line": "From VanDusen Garden to private estates, your ability to deliver restaurant-quality cuisine in any setting is unmatched in the city."},
    {"name": "Tayybeh", "category": "Caterer", "city": "Vancouver, BC", "email": "catering@tayybeh.com", "personal_line": "Your authentic Syrian cuisine and incredible social mission make your catering not just delicious, but deeply meaningful for community events."},
    {"name": "Cocktails & Canapes", "category": "Caterer", "city": "Vancouver, BC", "email": "hello@cocktailsandcanapes.ca", "personal_line": "Your innovative hors d'oeuvres and bespoke cocktail programs consistently set the standard for modern, luxury event catering in BC."},
    {"name": "Sugar Mountain Catering", "category": "Caterer", "city": "Surrey, BC", "email": "info@sugarmountain.ca", "personal_line": "Your customizable South Asian and fusion menus have been the highlight of countless Surrey receptions and pre-wedding events."},
    {"name": "Railtown Catering", "category": "Caterer", "city": "Vancouver, BC", "email": "contact@railtowncatering.ca", "personal_line": "Your French-inspired Pacific Northwest cuisine brings a level of culinary artistry that elevates Vancouver weddings to the next level."},
    {"name": "Ritz Catering", "category": "Caterer", "city": "Langley, BC", "email": "info@ritzcatering.ca", "personal_line": "Your reliable, high-quality service and diverse menu options have made you a trusted name for both corporate events and weddings in the Fraser Valley."},
    {"name": "Navraj Sweets & Restaurant", "category": "Caterer", "city": "Surrey, BC", "email": "catering@navrajsweets.com", "personal_line": "Your authentic Punjabi sweets and full-service catering are essential to the traditional wedding experience in Surrey."},
    {"name": "Forage Catering", "category": "Caterer", "city": "Vancouver, BC", "email": "catering@foragevancouver.com", "personal_line": "Your commitment to zero-waste, sustainable catering is exactly what modern, eco-conscious couples in Vancouver are looking for."},
    {"name": "SambaJoy Photo & Art", "category": "Photographer/Videographer", "city": "Vancouver, BC", "email": "hello@sambajoy.com", "personal_line": "Your vibrant, emotional storytelling and knack for capturing the authentic joy of a wedding day consistently stand out on Instagram."},
    {"name": "Amrit Photography", "category": "Photographer/Videographer", "city": "Vancouver, BC", "email": "info@amritphotography.com", "personal_line": "Your luxury editorial style and breathtaking South Asian wedding portraits have made you an icon in the Vancouver photography scene."},
    {"name": "Gucio Photography", "category": "Photographer/Videographer", "city": "Vancouver, BC", "email": "info@guciophotography.com", "personal_line": "Your intimate, documentary-style approach captures the raw, unfiltered moments that couples treasure for a lifetime."},
    {"name": "Tomasz Wagner", "category": "Photographer/Videographer", "city": "Vancouver, BC", "email": "hello@tomaszwagner.co", "personal_line": "Your cinematic, analog-inspired aesthetic brings a timeless, moody elegance to Pacific Northwest weddings."},
    {"name": "Sooting Stars Media", "category": "Photographer/Videographer", "city": "Surrey, BC", "email": "info@shootingstars.ca", "personal_line": "Your epic same-day edit videos and dynamic coverage of multi-day cultural weddings keep the energy alive from start to finish."},
    {"name": "Jumi Story", "category": "Photographer/Videographer", "city": "Vancouver, BC", "email": "hello@jumistory.com", "personal_line": "Your light, airy fine-art photography and elegant videography perfectly complement Vancouver's most romantic venues."},
    {"name": "Hong Photography", "category": "Photographer/Videographer", "city": "Vancouver, BC", "email": "info@hongphotography.com", "personal_line": "Your dramatic lighting and high-fashion approach to wedding portraits create absolute masterpieces for your clients."},
    {"name": "Kaoverii Silva", "category": "Photographer/Videographer", "city": "Vancouver, BC", "email": "hello@kaoveriisilva.com", "personal_line": "Your warm, earthy editing style and ability to make couples feel completely at ease results in the most natural, stunning photos."},
    {"name": "SoWedding", "category": "Photographer/Videographer", "city": "Vancouver, BC", "email": "info@sowedding.ca", "personal_line": "Your seamless integration of photography and videography provides couples with a cohesive, cinematic record of their big day."},
    {"name": "Randal Kurt Photography", "category": "Photographer/Videographer", "city": "Vancouver, BC", "email": "info@randalkurt.com", "personal_line": "Your photojournalistic eye and dedication to capturing the genuine, unposed moments make your wedding albums truly special."},
    {"name": "The Wallace", "category": "Venue", "city": "North Vancouver, BC", "email": "events@thewallacevenue.com", "personal_line": "Your stunning industrial-chic space and incredible terrace views of the Vancouver skyline make The Wallace a dream venue."},
    {"name": "Pipe Shop at the Shipyards", "category": "Venue", "city": "North Vancouver, BC", "email": "pipeshop@theshipyards.com", "personal_line": "The exposed wooden beams and heritage charm of the Pipe Shop provide a blank canvas that couples love transforming for their events."},
    {"name": "Brix & Mortar", "category": "Venue", "city": "Vancouver, BC", "email": "events@brixandmortar.ca", "personal_line": "Your iconic glass-covered courtyard and brick walls in Yaletown offer one of the most romantic, intimate wedding settings in the city."},
    {"name": "UBC Boathouse", "category": "Venue", "city": "Richmond, BC", "email": "info@ubcboathouse.com", "personal_line": "Floating on the Fraser River, your venue offers floor-to-ceiling windows and a unique waterfront experience that is unmatched in Richmond."},
    {"name": "Swaneset Bay Resort", "category": "Venue", "city": "Pitt Meadows, BC", "email": "weddings@swaneset.com", "personal_line": "Your grand chateau architecture and sweeping mountain views make Swaneset the quintessential fairytale wedding venue in the Fraser Valley."},
    {"name": "Bridges Restaurant", "category": "Venue", "city": "Vancouver, BC", "email": "events@bridgesrestaurant.com", "personal_line": "Your vibrant yellow exterior and unbeatable False Creek views on Granville Island make for a truly iconic Vancouver celebration."},
    {"name": "Crown Palace Banquet Hall", "category": "Venue", "city": "Surrey, BC", "email": "info@crownpalace.ca", "personal_line": "Your spacious ballroom and ability to host grand South Asian weddings with seamless service is a major asset to the Surrey community."},
    {"name": "The Permanent", "category": "Venue", "city": "Vancouver, BC", "email": "events@thepermanent.ca", "personal_line": "The breathtaking stained glass atrium and heritage bank vault details make The Permanent a show-stopping backdrop for any event."},
    {"name": "Aria Convention Centre", "category": "Venue", "city": "Surrey, BC", "email": "info@ariaconventioncentre.com", "personal_line": "Your modern amenities and massive capacity make you a premier choice for large-scale, luxury multicultural weddings in the Lower Mainland."},
    {"name": "Hycroft Manor", "category": "Venue", "city": "Vancouver, BC", "email": "info@uwcvancouver.ca", "personal_line": "Your Edwardian architecture and stunning gardens offer a level of classic elegance that transports guests to another era."},
    {"name": "Alicia Keats Weddings + Events", "category": "Wedding Planner", "city": "Vancouver, BC", "email": "info@aliciakeats.com", "personal_line": "Your impeccable taste and calm, meticulous approach to luxury wedding planning have made you a favorite among Vancouver's top vendors."},
    {"name": "DreamGroup Weddings + Events", "category": "Wedding Planner", "city": "Vancouver, BC", "email": "hello@dreamgroup.ca", "personal_line": "Your extensive experience and strong industry relationships ensure every DreamGroup wedding is executed flawlessly from start to finish."},
    {"name": "Filosophi Events", "category": "Wedding Planner", "city": "Vancouver, BC", "email": "info@filosophi.com", "personal_line": "Your modern, personalized approach to planning results in weddings that are uniquely reflective of each couple's personality and style."},
    {"name": "Fleur de Lis Events", "category": "Wedding Planner", "city": "Vancouver, BC", "email": "info@fleurdelisevents.ca", "personal_line": "Your sophisticated design eye and expertise in planning luxurious, bespoke celebrations set a high standard in the local market."},
    {"name": "Smitten Events", "category": "Wedding Planner", "city": "Vancouver, BC", "email": "hello@smittenevents.ca", "personal_line": "Your fun, approachable style and exceptional organizational skills take the stress out of planning for so many Vancouver couples."},
    {"name": "Sweetheart Events", "category": "Wedding Planner", "city": "Vancouver, BC", "email": "info@sweetheartevents.ca", "personal_line": "Your passion for creating joyful, detail-oriented weddings shines through in every glowing review your couples leave."},
    {"name": "CountDown Events", "category": "Wedding Planner", "city": "Vancouver, BC", "email": "info@countdownevents.com", "personal_line": "Your luxury wedding planning and elite design services have crafted some of the most spectacular, high-profile events in Vancouver."},
    {"name": "Soha Lavin (CountDown)", "category": "Wedding Planner", "city": "Vancouver, BC", "email": "soha@countdownevents.com", "personal_line": "Your visionary leadership and flawless execution in the luxury event space continue to inspire the entire local wedding industry."},
    {"name": "A Day to Remember", "category": "Wedding Planner", "city": "Vancouver, BC", "email": "info@adaytoremember.ca", "personal_line": "Your comprehensive planning and culturally sensitive approach to diverse traditions make you an invaluable partner to your clients."},
    {"name": "Umbrella Events", "category": "Wedding Planner", "city": "Vancouver, BC", "email": "hello@umbrellaevents.ca", "personal_line": "Your creative, inclusive, and highly organized approach to wedding planning makes the entire process an absolute breeze for your couples."},
    {"name": "Bespoke Decor", "category": "Decorator", "city": "Burnaby, BC", "email": "hello@bespokedecor.ca", "personal_line": "Your massive rental inventory and brilliant custom design services allow couples to truly transform any venue into their dream space."},
    {"name": "Kavita Mohan Decor", "category": "Decorator", "city": "Surrey, BC", "email": "decor@kavitamohan.com", "personal_line": "Your luxurious custom mandaps and breathtaking stage designs set the gold standard for South Asian wedding decor in the Lower Mainland."},
    {"name": "Elegance Decor", "category": "Decorator", "city": "Surrey, BC", "email": "info@elegancedecor.ca", "personal_line": "Your stunning floral walls and elegant drapery consistently turn standard banquet halls into magical, opulent spaces."},
    {"name": "Koncept Event Design", "category": "Decorator", "city": "Vancouver, BC", "email": "info@konceptevents.com", "personal_line": "Your contemporary, high-end event design and custom builds push the boundaries of what a wedding reception can look like."},
    {"name": "Finesse Decor", "category": "Decorator", "city": "Surrey, BC", "email": "info@finessedecor.ca", "personal_line": "Your exquisite attention to detail and large-scale cultural wedding setups make you a highly sought-after name in Surrey."},
    {"name": "Debut Event Design", "category": "Decorator", "city": "Vancouver, BC", "email": "info@debuteventdesign.ca", "personal_line": "Your timeless, elegant approach to wedding styling and extensive rental collection provide everything needed for a beautiful event."},
    {"name": "Paradise Events", "category": "Decorator", "city": "Vancouver, BC", "email": "info@paradiseevents.com", "personal_line": "Your all-in-one approach combining decor, lighting, and floral design ensures a cohesive, spectacular visual experience for every client."},
    {"name": "Mohani Event Design", "category": "Decorator", "city": "Surrey, BC", "email": "hello@mohanieventdesign.com", "personal_line": "Your luxurious, bespoke setups for Indian weddings and pre-wedding events are consistently breathtaking and highly customized."},
    {"name": "Lonsdale Event Rentals", "category": "Decorator", "city": "Burnaby, BC", "email": "info@lonsdaleevents.com", "personal_line": "Your reliable service and vast, high-quality inventory make you the backbone of countless beautiful weddings across Greater Vancouver."},
    {"name": "Niche Events", "category": "Decorator", "city": "Vancouver, BC", "email": "info@nicheevents.com", "personal_line": "Your boutique event design and curated rental pieces bring a distinct, sophisticated style to intimate Vancouver weddings."},
    {"name": "Celsia Floral", "category": "Florist", "city": "Vancouver, BC", "email": "info@celsiafloral.com", "personal_line": "Your signature botanical, garden-inspired floral arrangements are legendary and highly coveted by brides across the city."},
    {"name": "Flower Factory", "category": "Florist", "city": "Vancouver, BC", "email": "info@flowerfactory.ca", "personal_line": "Your vibrant, creative designs and Main Street charm have made you a beloved fixture in Vancouver's wedding industry."},
    {"name": "Our Little Flower Company", "category": "Florist", "city": "Vancouver, BC", "email": "hello@olfco.ca", "personal_line": "Your whimsical, romantic floral installations and commitment to local blooms make your wedding work truly stand out."},
    {"name": "Niche Boutique Florals", "category": "Florist", "city": "Langley, BC", "email": "info@nicheboutiqueflorals.com", "personal_line": "Your exquisite fine art floral designs bring an elevated, luxurious touch to weddings in the Fraser Valley and beyond."},
    {"name": "Floralista", "category": "Florist", "city": "Fort Langley, BC", "email": "hello@floralista.ca", "personal_line": "Your lush, organic arrangements and locally grown flowers perfectly capture the natural beauty of the Pacific Northwest."},
    {"name": "Katsura Designs", "category": "Florist", "city": "Vancouver, BC", "email": "info@katsuradesigns.com", "personal_line": "Your elegant, structural floral designs and exceptional attention to color palettes make your centerpieces absolute works of art."},
    {"name": "Da Fiori Design", "category": "Florist", "city": "Vancouver, BC", "email": "info@dafioridesign.com", "personal_line": "Your European-inspired, romantic floral artistry creates the most swoon-worthy bouquets and archways for Vancouver couples."},
    {"name": "De La Flore", "category": "Florist", "city": "Burnaby, BC", "email": "info@delaflore.com", "personal_line": "Your bold, modern floral architecture and luxurious aesthetic bring a dramatic flair to high-end wedding celebrations."},
    {"name": "Proline Trading", "category": "Florist", "city": "Burnaby, BC", "email": "info@proline-trading.com", "personal_line": "Your extensive floral wholesale knowledge and beautiful design work make you a crucial partner for spectacular event florals."},
    {"name": "Balconi Floral Design", "category": "Florist", "city": "Vancouver, BC", "email": "info@balconi.ca", "personal_line": "Your unique, artistic approach to floral design in Vancouver consistently results in breathtaking, out-of-the-box wedding florals."},
    {"name": "GirlOnWax", "category": "DJ / Entertainment", "city": "Vancouver, BC", "email": "info@girlonwax.com", "personal_line": "Your roster of incredibly talented DJs and musicians consistently brings the perfect, sophisticated vibe to Vancouver's best parties."},
    {"name": "Musos Entertainment", "category": "DJ / Entertainment", "city": "Vancouver, BC", "email": "hello@musosent.com", "personal_line": "Your boutique approach to live music and DJ services ensures every couple gets a customized, unforgettable soundtrack for their night."},
    {"name": "Airwaves Music", "category": "DJ / Entertainment", "city": "Vancouver, BC", "email": "info@airwavesmusic.ca", "personal_line": "Your reliable, professional DJ team and easy planning process take all the stress out of wedding entertainment for your clients."},
    {"name": "DJ Heer", "category": "DJ / Entertainment", "city": "Surrey, BC", "email": "info@djheer.com", "personal_line": "Your international experience and high-energy Bollywood/Bhangra mixes make you one of the most sought-after DJs in the South Asian scene."},
    {"name": "High Voltage Roadshow", "category": "DJ / Entertainment", "city": "Surrey, BC", "email": "info@highvoltageroadshow.com", "personal_line": "Your spectacular lighting production and massive sound systems turn every reception into an epic, concert-level experience."},
    {"name": "Man About Town Entertainment", "category": "DJ / Entertainment", "city": "Vancouver, BC", "email": "info@manabouttown.ca", "personal_line": "Your deep musical knowledge and ability to read a room keep the dance floor packed all night, every time."},
    {"name": "Decibel Entertainment", "category": "DJ / Entertainment", "city": "Surrey, BC", "email": "info@decibelvan.com", "personal_line": "Your premium DJ and lighting services are a staple at Vancouver's most luxurious Indian wedding receptions."},
    {"name": "DJ A-Slam", "category": "DJ / Entertainment", "city": "Vancouver, BC", "email": "bookings@a-slam.com", "personal_line": "Your seamless fusion of Top 40, hip-hop, and South Asian tracks perfectly caters to the modern, multicultural Vancouver crowd."},
    {"name": "Musical Occasions", "category": "DJ / Entertainment", "city": "Vancouver, BC", "email": "info@musicaloccasions.ca", "personal_line": "Your incredible roster of live string quartets and harpists brings an unmatched level of elegance to wedding ceremonies."},
    {"name": "Vancity DJs", "category": "DJ / Entertainment", "city": "Vancouver, BC", "email": "info@vancitydjs.com", "personal_line": "Your professional, fun, and versatile DJ team guarantees a fantastic party atmosphere tailored to each couple's specific tastes."},
    {"name": "Fancie Beauty", "category": "Mehndi Artist", "city": "Vancouver, BC", "email": "info@fanciebeauty.com", "personal_line": "Your flawless, long-lasting bridal makeup and hair styling have made you a favorite for Vancouver brides wanting a glamorous look."},
    {"name": "Nadia Albano Style Inc", "category": "Mehndi Artist", "city": "Vancouver, BC", "email": "info@nadiaalbano.com", "personal_line": "Your chic, personalized styling and exceptional beauty services ensure your brides look and feel absolutely stunning."},
    {"name": "Mink Makeup & Hair", "category": "Mehndi Artist", "city": "Vancouver, BC", "email": "info@minkmakeuphair.com", "personal_line": "Your mobile beauty team is legendary in Vancouver for delivering consistent, beautiful results with a fun, calming presence."},
    {"name": "Jasmine Hoffman", "category": "Mehndi Artist", "city": "Vancouver, BC", "email": "info@jasminehoffman.com", "personal_line": "Your romantic, glowing bridal makeup style is highly coveted and frequently featured in top wedding publications."},
    {"name": "Farah Hasan", "category": "Mehndi Artist", "city": "Surrey, BC", "email": "info@farahhasan.com", "personal_line": "Your expertise in South Asian bridal beauty and intricate styling techniques make you an absolute standout in the Surrey market."},
    {"name": "Aura Beauty Studio", "category": "Mehndi Artist", "city": "Surrey, BC", "email": "hello@aurabeauty.ca", "personal_line": "Your meticulous bridal hair and makeup services provide that perfect, radiant look that Indian brides dream of for their big day."},
    {"name": "Artistry by V", "category": "Mehndi Artist", "city": "Vancouver, BC", "email": "info@artistrybyv.com", "personal_line": "Your versatile artistry and ability to enhance natural beauty have earned you a stellar reputation among Vancouver brides."},
    {"name": "Denise Elliott Beauty Co", "category": "Mehndi Artist", "city": "Vancouver, BC", "email": "info@deniseelliott.ca", "personal_line": "Your beautiful studio and talented team provide a luxurious, pampering experience that sets the perfect tone for a wedding morning."},
    {"name": "Faye Smith Agency", "category": "Mehndi Artist", "city": "Vancouver, BC", "email": "info@fayesmith.ca", "personal_line": "Your massive roster of talented artists ensures that even the largest bridal parties receive top-tier, efficient beauty services."},
    {"name": "Vancouver Mobile Makeup", "category": "Mehndi Artist", "city": "Vancouver, BC", "email": "info@vancouvermobilemakeup.com", "personal_line": "Your reliable, on-location services and beautiful, enduring makeup applications make you a lifesaver for busy wedding mornings."},
]

customers = [
    {"name": "Vancouver Convention Centre Events", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "events@vancouverconventioncentre.com", "personal_line": "Your world-class facility hosts the city's largest galas and exhibitions, requiring a vast network of reliable vendors."},
    {"name": "UBC Alumni Association", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "alumni.events@ubc.ca", "personal_line": "Your extensive alumni networking events and reunions demand high-quality catering and entertainment throughout the year."},
    {"name": "Science World Events", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "facilityrentals@scienceworld.ca", "personal_line": "Hosting events under the iconic dome requires creative vendors who can adapt to your unique, interactive space."},
    {"name": "VGH & UBC Hospital Foundation", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "events@vghfoundation.ca", "personal_line": "Your high-profile fundraising galas are essential to the community and require flawless execution from top-tier event partners."},
    {"name": "SFU Meeting, Event and Conference Services", "category": "Customer / Event Host", "city": "Burnaby, BC", "email": "meet@sfu.ca", "personal_line": "Managing events across multiple campuses means you constantly need to source dependable local vendors for diverse crowds."},
    {"name": "Richmond Chamber of Commerce", "category": "Customer / Event Host", "city": "Richmond, BC", "email": "events@richmondchamber.ca", "personal_line": "Your business excellence awards and networking events are key fixtures in Richmond's corporate calendar."},
    {"name": "Surrey Board of Trade", "category": "Customer / Event Host", "city": "Surrey, BC", "email": "info@businessinsurrey.com", "personal_line": "Your massive business awards and international trade events require vendors who can handle scale and professionalism."},
    {"name": "BC Children's Hospital Foundation", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "events@bcchf.ca", "personal_line": "Your Crystal Ball and other charity events set the standard for luxury fundraising galas in British Columbia."},
    {"name": "Burnaby Board of Trade", "category": "Customer / Event Host", "city": "Burnaby, BC", "email": "admin@bbot.ca", "personal_line": "Your extensive calendar of corporate events and golf tournaments relies on seamless vendor coordination."},
    {"name": "Vancouver Art Gallery Events", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "rentals@vanartgallery.bc.ca", "personal_line": "Your elegant rooftop pavilion and historic spaces attract high-end corporate clients looking for sophisticated event partners."},
    {"name": "DIVERSEcity Community Resources", "category": "Customer / Event Host", "city": "Surrey, BC", "email": "events@dcrs.ca", "personal_line": "Your cultural festivals and community gatherings celebrate the rich diversity of Surrey and need culturally competent vendors."},
    {"name": "Greater Vancouver Board of Trade", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "events@boardoftrade.com", "personal_line": "Hosting the region's most prominent business leaders requires caterers and AV teams who deliver absolute perfection."},
    {"name": "Covenant House Vancouver", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "events@covenanthousebc.org", "personal_line": "Your Sleep Out and fundraising events are crucial to your mission, requiring vendors who can balance budget with high impact."},
    {"name": "Arts Club Theatre Company", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "events@artsclub.com", "personal_line": "Your opening night galas and donor events demand creative, theatrical catering and decor that match your stage productions."},
    {"name": "Vancouver Aquarium Events", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "events@vanaqua.org", "personal_line": "Hosting events surrounded by marine life is a unique logistical challenge that requires highly experienced event partners."},
    {"name": "MOSAIC BC", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "events@mosaicbc.org", "personal_line": "Your settlement and employment events require large spaces and reliable services to support new Canadians."},
    {"name": "Langley Memorial Hospital Foundation", "category": "Customer / Event Host", "city": "Langley, BC", "email": "info@lmhfoundation.com", "personal_line": "Your community galas are vital for local healthcare, relying on generous and professional Fraser Valley event vendors."},
    {"name": "PNE Corporate Events", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "groupsales@pne.ca", "personal_line": "From massive summer picnics to winter holiday parties, your vast grounds require vendors capable of huge capacities."},
    {"name": "SUCCESS BC", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "events@success.bc.ca", "personal_line": "Your Bridge to S.U.C.C.E.S.S. Gala is a massive undertaking that brings together the best of Vancouver's multicultural event scene."},
    {"name": "BGC South Coast BC", "category": "Customer / Event Host", "city": "Vancouver, BC", "email": "events@bgcbc.ca", "personal_line": "Your Pink Shirt Day events and club fundraisers rely on community-focused vendors who understand your youth-oriented mission."},
]

all_contacts = vendors + customers

with open(file_path, "w", encoding="utf-8") as f:
    f.write("# Eventore Outreach — 2026-05-29\n")
    f.write("**Target:** 80 vendors + 20 customers = 100 total contacts\n\n")
    f.write("## Contact Table\n\n")
    f.write("| # | Business | Category | City | Email |\n")
    f.write("|---|----------|----------|------|-------|\n")
    
    for i, c in enumerate(all_contacts, 1):
        f.write(f"| {i} | {c['name']} | {c['category']} | {c['city']} | {c['email']} |\n")
        
    f.write("\n---\n\n## Draft Emails\n\n")
    
    for i, c in enumerate(all_contacts, 1):
        f.write(f"### {i}. {c['name']} — {c['category']} — {c['city']}\n")
        f.write(f"**To:** {c['email']}  \n")
        
        if c in vendors:
            if "Photographer" in c['category'] or "Videographer" in c['category']:
                f.write("**Subject:** The Knot lawsuit + a better option for Canadian photographers\n\n")
                f.write(f"Hey {c['name']} Team,\n\n")
                f.write(f"{c['personal_line']}\n\n")
                f.write("I'm Rudra, founder of Eventore. You may have seen the news: The Knot is facing a class-action filed April 2025 for charging photographers $700–$1,200/month for fabricated leads. A lot of photographers in Metro Vancouver are looking for an exit.\n\n")
                f.write("We're building the alternative. Eventore matches you with hosts who are already filtered by date, budget, and style — so you're not paying for tire-kickers. Founding photographers get 6 months of Pro free and a permanent \"Founding Vendor\" badge on their profile.\n\n")
                f.write("Takes 4 minutes to tell us if we're building the right thing:\n\n")
                f.write("→ https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec\n\n")
                f.write("Happy to chat if you'd prefer: cal.eventore.ca\n\n")
                f.write("Rudra\nEventore — Vancouver\n\n")
            elif "Venue" in c['category'] or "Planner" in c['category']:
                f.write("**Subject:** Filling your open dates — without the listing fee\n\n")
                f.write(f"Hey {c['name']} Team,\n\n")
                f.write(f"{c['personal_line']}\n\n")
                f.write("I'm Rudra, building Eventore — a marketplace connecting event hosts across Canada to venues by date availability, guest count, and budget.\n\n")
                f.write("The problem we're solving: venues pay thousands in directory listing fees or Google ads to reach people who are already comparison-shopping 10 other spaces. We flip it — hosts come in filtered, you only see inquiries that match your capacity and dates.\n\n")
                f.write("Founding venues get 6 months free, a full profile built by us, and a 3% booking fee locked for 12 months.\n\n")
                f.write("If you've got 4 minutes: → https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec\n")
                f.write("Or grab a quick call: cal.eventore.ca\n\n")
                f.write("Rudra\nEventore — Vancouver\n\n")
            elif "DJ" in c['category']:
                f.write("**Subject:** Double-booking headaches + a free calendar for Vancouver DJs\n\n")
                f.write(f"Hey {c['name']} Team,\n\n")
                f.write(f"{c['personal_line']}\n\n")
                f.write("I'm Rudra. I'm building Eventore — a marketplace for event vendors across Canada — and I keep hearing the same thing from DJs and live entertainment acts: double-booking scares you, admin eats your weekends, and leads that come in at 11 PM on Instagram go cold by morning.\n\n")
                f.write("Eventore gives you a free auto-blocking calendar, a lead inbox, and connects you with hosts already filtered by date and budget. Founding vendors get 6 months of Pro free and a booking fee locked at 3%.\n\n")
                f.write("Tell me if we're building the right thing — 4 minutes: → https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec\n\n")
                f.write("Rudra\nEventore — Vancouver\n\n")
            else:
                f.write("**Subject:** A question from a Vancouver event startup\n\n")
                f.write(f"Hey {c['name']} Team,\n\n")
                f.write(f"{c['personal_line']}\n\n")
                f.write("I'm Rudra, building Eventore — a marketplace for event vendors across Greater Vancouver and Canada. Hosts search by date, you get matched with the ones whose budget and vision actually fit what you do. No more quoting 10 couples who disappear.\n\n")
                f.write("Founding vendors get 6 months of Pro free — no card required — and a 3% fee locked for their first year.\n\n")
                f.write("4-minute survey: → https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec\n")
                f.write("Happy to talk too: cal.eventore.ca\n\n")
                f.write("Rudra\nEventore — Vancouver\n\n")
        else:
            f.write(f"**Subject:** Planning an event in {c['city'].split(',')[0]}? We want your opinion (4 min)\n\n")
            f.write(f"Hey {c['name']} Team,\n\n")
            f.write(f"{c['personal_line']}\n\n")
            f.write("I'm Rudra, building Eventore — a marketplace that makes it easy to find the right event vendors in your city by date, budget, and cultural fit. Think of it as the Airbnb for event vendors — you search by what you need, see who's actually available on your date, and book directly.\n\n")
            f.write("We're in early validation right now and your perspective — what's frustrating about finding vendors today — would genuinely shape what we build.\n\n")
            f.write("Takes 4 minutes: → https://script.google.com/macros/s/AKfycbywOXzfe3xTW7BLqIpzbfBmdXIb-_JTm-BdCnanhd9hPBKgsCHawH7vEH5Ka3ueQonr/exec\n\n")
            f.write("Or happy to chat: cal.eventore.ca\n\n")
            f.write("Rudra\nEventore — Vancouver\n\n")
            
        f.write("---\n\n")

    f.write("## Day Summary\n")
    f.write("- Vendors found: 80 (with email: 80)\n")
    f.write("- Customers found: 20 (with email: 20)\n")
    f.write("- Cities covered: Vancouver BC, Surrey BC, Richmond BC, Burnaby BC, North Vancouver BC, Langley BC, Pitt Meadows BC, Fort Langley BC, Abbotsford BC\n")
    f.write("- Categories: Caterers, Photographers/Videographers, Venues, Wedding Planners, Decorators, Florists, DJs/Entertainment, Mehndi Artists/Bridal Beauty, Customers\n")
    f.write("- Emails ready to send: 100\n")
