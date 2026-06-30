# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing-responsive.spec.ts >> Landing Page Layout and Navigation >> should load successfully on desktop and verify layout headers
- Location: e2e/landing-responsive.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('nav')
Expected: visible
Error: strict mode violation: locator('nav') resolved to 2 elements:
    1) <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300">…</nav> aka getByRole('navigation').filter({ hasText: 'CampusConnectCampus' })
    2) <nav class="hidden md:flex items-center gap-8">…</nav> aka getByText('Campus GigsInternshipsAI')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('nav')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e5]:
        - generic [ref=e11]: cc-compiler.log
        - generic [ref=e13]: $ init --cluster=india --verbose
      - navigation [ref=e15]:
        - generic [ref=e17]:
          - link "CampusConnect CampusConnect" [ref=e18] [cursor=pointer]:
            - /url: /
            - img "CampusConnect" [ref=e20]
            - generic [ref=e22]: CampusConnect
          - navigation [ref=e23]:
            - link "Campus Gigs" [ref=e24] [cursor=pointer]:
              - /url: "#gigs"
              - text: Campus Gigs
            - link "Internships" [ref=e25] [cursor=pointer]:
              - /url: "#internships"
              - text: Internships
            - link "AI Roadmap" [ref=e26] [cursor=pointer]:
              - /url: "#roadmap"
              - text: AI Roadmap
            - link "How it Works" [ref=e27] [cursor=pointer]:
              - /url: "#how-it-works"
              - text: How it Works
          - generic [ref=e28]:
            - link "Sign In" [ref=e29] [cursor=pointer]:
              - /url: /auth/sign-in
            - link "Join Free" [ref=e30] [cursor=pointer]:
              - /url: /auth/sign-up
      - main [ref=e31]:
        - generic [ref=e34]:
          - generic [ref=e35]:
            - generic [ref=e38]: Hyperlocal · Any college · Any city in India
            - heading "Your next opportunity is 500m away." [level=1] [ref=e39]:
              - generic [ref=e40]:
                - generic [ref=e41]: Your
                - generic [ref=e42]: next
              - generic [ref=e44]: opportunity
              - generic [ref=e45]:
                - generic [ref=e46]: is
                - generic [ref=e47]: 500m
                - generic [ref=e48]: away.
            - paragraph [ref=e49]:
              - text: Find students near you to hire, collaborate with, or work for. Campus gigs, startup internships, AI career roadmap — everything a student needs, in one place.
              - strong [ref=e50]: Any college. Any city. Anywhere in India.
            - generic [ref=e51]:
              - link "Find Students Near Me" [ref=e52] [cursor=pointer]:
                - /url: /auth/sign-up
                - img [ref=e53]
                - text: Find Students Near Me
                - img [ref=e56]
              - link "Post a Gig" [ref=e58] [cursor=pointer]:
                - /url: /auth/sign-up?role=client
          - generic [ref=e76]:
            - generic [ref=e77]: ✦
            - generic [ref=e78]: AI-powered matching
        - generic [ref=e80]:
          - generic [ref=e81]: Campus Gigs
          - generic [ref=e83]: Startup Internships
          - generic [ref=e85]: AI Career Roadmap
          - generic [ref=e87]: Secure Payments
          - generic [ref=e89]: Private Messaging
          - generic [ref=e91]: Campus Network
          - generic [ref=e93]: Any College
          - generic [ref=e95]: Any City in India
          - generic [ref=e97]: Campus Gigs
          - generic [ref=e99]: Startup Internships
          - generic [ref=e101]: AI Career Roadmap
          - generic [ref=e103]: Secure Payments
          - generic [ref=e105]: Private Messaging
          - generic [ref=e107]: Campus Network
          - generic [ref=e109]: Any College
          - generic [ref=e111]: Any City in India
        - generic [ref=e115]:
          - generic [ref=e116]:
            - generic [ref=e117]: ● The Problem
            - heading "The student employment system is broken — and you know it." [level=2] [ref=e118]:
              - text: The student employment system is broken —
              - text: and you know it.
            - paragraph [ref=e119]: Every ambitious Indian student faces the same barriers. We've experienced them firsthand, so we built the developer-focused platform to bypass them.
          - generic [ref=e120]:
            - generic [ref=e121]:
              - generic [ref=e122]: "[01:cc_node]"
              - img [ref=e124]
              - heading "Resume Black Hole" [level=3] [ref=e127]
              - paragraph [ref=e128]: You apply to dozens of internships, only to be ghosted by ATS bots that never saw your true potential.
            - generic [ref=e129]:
              - generic [ref=e130]: "[02:cc_node]"
              - img [ref=e132]
              - heading "Directionless Learning" [level=3] [ref=e134]
              - paragraph [ref=e135]: You're learning skills, but are they the right ones? The gap between college syllabus and startup demands is massive.
            - generic [ref=e136]:
              - generic [ref=e137]: "[03:cc_node]"
              - img [ref=e139]
              - heading "Catch-22 of Experience" [level=3] [ref=e142]
              - paragraph [ref=e143]: You need experience to get a job, but you need a job to get experience. An impossible loop — until now.
            - generic [ref=e144]:
              - generic [ref=e145]: "[04:cc_node]"
              - img [ref=e147]
              - heading "Exploitative Unpaid Gigs" [level=3] [ref=e149]
              - paragraph [ref=e150]: No security. Fake promises. You work for free and get ghosted. The exploitation of student talent ends here.
          - generic [ref=e152]:
            - generic [ref=e153]: We built the engineering fix.
            - generic [ref=e154]: ⚡
        - generic [ref=e158]:
          - generic [ref=e159]:
            - generic [ref=e161]: Everything in one place
            - heading "The complete student super-app" [level=2] [ref=e162]
            - paragraph [ref=e163]: Six powerful features. One platform. Built for every student in India — from metros to tier-3 cities.
          - generic [ref=e164]:
            - generic [ref=e165]:
              - generic [ref=e166]: 📍
              - heading "Campus Gigs" [level=3] [ref=e167]
              - paragraph [ref=e168]: Hire students near you for posters, code, events, photography. Or list your skill and start earning today.
              - generic [ref=e169]: Student → Student
            - generic [ref=e170]:
              - generic [ref=e171]: 🏢
              - heading "Startup Internships" [level=3] [ref=e172]
              - paragraph [ref=e173]: Real internships from verified Indian startups. AI-matched to your profile. Apply in one click.
              - generic [ref=e174]: AI Matched
            - generic [ref=e175]:
              - generic [ref=e176]: 🧠
              - heading "AI Career Roadmap" [level=3] [ref=e177]
              - paragraph [ref=e178]: Tell us your goal. Get a week-by-week personalised plan — DSA, projects, skills — to land your dream role.
              - generic [ref=e179]: Personalised
            - generic [ref=e180]:
              - generic [ref=e181]: 🔒
              - heading "Secure Escrow" [level=3] [ref=e182]
              - paragraph [ref=e183]: Payment held safely until work is approved. No ghosting. No 'kal dunga.' Get paid every time, guaranteed.
              - generic [ref=e184]: Zero Risk
            - generic [ref=e185]:
              - generic [ref=e186]: 💬
              - heading "Private Messaging" [level=3] [ref=e187]
              - paragraph [ref=e188]: Chat safely without sharing your phone number. All gig communication tracked in one thread.
              - generic [ref=e189]: Safe & Private
            - generic [ref=e190]:
              - generic [ref=e191]: 🌐
              - heading "Campus Network" [level=3] [ref=e192]
              - paragraph [ref=e193]: Build real connections through work, not follow requests. Every gig completed is a verified relationship.
              - generic [ref=e194]: Location-Based
        - generic [ref=e197]:
          - generic [ref=e198]:
            - generic [ref=e199]: ✦ Comparison
            - heading "Why students are switching." [level=2] [ref=e200]
            - paragraph [ref=e201]: We're not another job board. See exactly what sets CampusConnect apart from legacy platforms.
          - table [ref=e203]:
            - rowgroup [ref=e204]:
              - row "Feature CampusConnect Ideal Internshala Fiverr LinkedIn" [ref=e205]:
                - columnheader "Feature" [ref=e206]
                - columnheader "CampusConnect Ideal" [ref=e207]:
                  - text: CampusConnect
                  - generic [ref=e208]: Ideal
                - columnheader "Internshala" [ref=e209]
                - columnheader "Fiverr" [ref=e210]
                - columnheader "LinkedIn" [ref=e211]
            - rowgroup [ref=e212]:
              - row "AI Career Roadmap" [ref=e213]:
                - cell "AI Career Roadmap" [ref=e214]
                - cell [ref=e215]:
                  - img [ref=e217]
                - cell [ref=e220]:
                  - img [ref=e222]
                - cell [ref=e225]:
                  - img [ref=e227]
                - cell [ref=e230]:
                  - img [ref=e232]
              - row "Escrow-Protected Payments" [ref=e233]:
                - cell "Escrow-Protected Payments" [ref=e234]
                - cell [ref=e235]:
                  - img [ref=e237]
                - cell [ref=e240]:
                  - img [ref=e242]
                - cell [ref=e245]:
                  - img [ref=e247]
                - cell [ref=e248]:
                  - img [ref=e250]
              - row "India Student Focus" [ref=e253]:
                - cell "India Student Focus" [ref=e254]
                - cell [ref=e255]:
                  - img [ref=e257]
                - cell [ref=e260]:
                  - img [ref=e262]
                - cell [ref=e263]:
                  - img [ref=e265]
                - cell [ref=e268]:
                  - img [ref=e270]
              - row "WhatsApp Gig Alerts" [ref=e273]:
                - cell "WhatsApp Gig Alerts" [ref=e274]
                - cell [ref=e275]:
                  - img [ref=e277]
                - cell [ref=e280]:
                  - img [ref=e282]
                - cell [ref=e285]:
                  - img [ref=e287]
                - cell [ref=e290]:
                  - img [ref=e292]
              - row "Free for Students Forever" [ref=e295]:
                - cell "Free for Students Forever" [ref=e296]
                - cell [ref=e297]:
                  - img [ref=e299]
                - cell [ref=e302]:
                  - img [ref=e304]
                - cell [ref=e307]:
                  - img [ref=e309]
                - cell [ref=e312]:
                  - img [ref=e314]
              - row "Micro-Gig Marketplace" [ref=e317]:
                - cell "Micro-Gig Marketplace" [ref=e318]
                - cell [ref=e319]:
                  - img [ref=e321]
                - cell [ref=e324]:
                  - img [ref=e326]
                - cell [ref=e329]:
                  - img [ref=e331]
                - cell [ref=e334]:
                  - img [ref=e336]
          - paragraph [ref=e339]: ✓ = Full support · — = Partial · ✗ = Not supported
        - generic [ref=e343]:
          - generic [ref=e344]:
            - generic [ref=e345]: Simple process
            - heading "How it works" [level=2] [ref=e346]
            - paragraph [ref=e347]: A seamless, secure way to hire or get hired on campus.
          - generic [ref=e350]:
            - generic [ref=e355]:
              - generic: "01"
              - generic [ref=e356]: 📍
              - heading "Allow location" [level=3] [ref=e357]
              - paragraph [ref=e358]: Open CampusConnect and allow location access. Instantly see students with skills within 3–5 km of you.
            - generic [ref=e363]:
              - generic: "02"
              - generic [ref=e364]: 📋
              - heading "Post or find a gig" [level=3] [ref=e365]
              - paragraph [ref=e366]: Need a poster for your fest? Post it in 30 seconds. Have a skill? List it and start getting hired today.
            - generic [ref=e371]:
              - generic: "03"
              - generic [ref=e372]: 💬
              - heading "Chat and agree" [level=3] [ref=e373]
              - paragraph [ref=e374]: Message privately. Agree on price and deadline. Payment goes into secure escrow — protected for both sides.
            - generic [ref=e379]:
              - generic: "04"
              - generic [ref=e380]: ✅
              - heading "Work and get paid" [level=3] [ref=e381]
              - paragraph [ref=e382]: Deliver the work. Buyer approves. Payment releases instantly. Your portfolio and reputation grow with every gig.
        - generic [ref=e386]:
          - generic [ref=e387]:
            - generic [ref=e388]: Live right now
            - heading "Campus gigs near you" [level=2] [ref=e390]
            - paragraph [ref=e391]: Real work. Real students. Real money. Posted by peers near you.
          - generic [ref=e392]:
            - button "All" [ref=e393]: All
            - button "Design" [ref=e395]
            - button "Coding" [ref=e396]
            - button "Notes" [ref=e397]
            - button "Events" [ref=e398]
            - button "Content" [ref=e399]
          - generic [ref=e400]:
            - generic [ref=e401]:
              - generic [ref=e402]:
                - generic [ref=e403]: Design
                - generic [ref=e404]:
                  - img [ref=e405]
                  - text: 220m
              - heading "Poster for Strides Tech Fest 2025" [level=3] [ref=e408]
              - paragraph [ref=e409]: A4 size · 2 revisions · Deliver in 1 day
              - generic [ref=e410]:
                - generic [ref=e411]:
                  - img "Aditya, 3rd yr" [ref=e412]
                  - generic [ref=e413]: Aditya, 3rd yr
                - generic [ref=e414]: ₹200
            - generic [ref=e415]:
              - generic [ref=e416]:
                - generic [ref=e417]: Coding
                - generic [ref=e418]:
                  - img [ref=e419]
                  - text: 380m
              - heading "Debug my Python mini project (DBMS)" [level=3] [ref=e422]
              - paragraph [ref=e423]: ~2 hrs · Explain the solution too
              - generic [ref=e424]:
                - generic [ref=e425]:
                  - img "Meera, 2nd yr" [ref=e426]
                  - generic [ref=e427]: Meera, 2nd yr
                - generic [ref=e428]: ₹150
            - generic [ref=e429]:
              - generic [ref=e430]:
                - generic [ref=e431]: Notes
                - generic [ref=e432]:
                  - img [ref=e433]
                  - text: 100m
              - heading "DBMS Unit 3 handwritten notes" [level=3] [ref=e436]
              - paragraph [ref=e437]: Clear handwriting · ~15 pages
              - generic [ref=e438]:
                - generic [ref=e439]:
                  - img "Ravi, 2nd yr" [ref=e440]
                  - generic [ref=e441]: Ravi, 2nd yr
                - generic [ref=e442]: ₹80
            - generic [ref=e443]:
              - generic [ref=e444]:
                - generic [ref=e445]: Events
                - generic [ref=e446]:
                  - img [ref=e447]
                  - text: 500m
              - heading "Photographer for cultural night" [level=3] [ref=e450]
              - paragraph [ref=e451]: 3 hours · Bulk edited photos delivered
              - generic [ref=e452]:
                - generic [ref=e453]:
                  - img "Cultural Club" [ref=e454]
                  - generic [ref=e455]: Cultural Club
                - generic [ref=e456]: ₹500
            - generic [ref=e457]:
              - generic [ref=e458]:
                - generic [ref=e459]: Content
                - generic [ref=e460]:
                  - img [ref=e461]
                  - text: 280m
              - heading "Write dept newsletter for February" [level=3] [ref=e464]
              - paragraph [ref=e465]: 500 words · English · 2 days
              - generic [ref=e466]:
                - generic [ref=e467]:
                  - img "CSE Department" [ref=e468]
                  - generic [ref=e469]: CSE Department
                - generic [ref=e470]: ₹120
            - generic [ref=e471]:
              - generic [ref=e472]:
                - generic [ref=e473]: Design
                - generic [ref=e474]:
                  - img [ref=e475]
                  - text: 430m
              - heading "PPT for project presentation (10 slides)" [level=3] [ref=e478]
              - paragraph [ref=e479]: Professional theme · Icons included
              - generic [ref=e480]:
                - generic [ref=e481]:
                  - img "Sai, 3rd yr ECE" [ref=e482]
                  - generic [ref=e483]: Sai, 3rd yr ECE
                - generic [ref=e484]: ₹180
          - link "Browse All Gigs" [ref=e486] [cursor=pointer]:
            - /url: /gigs/find
            - text: Browse All Gigs
            - img [ref=e487]
        - generic [ref=e492]:
          - generic [ref=e493]:
            - generic [ref=e494]:
              - img [ref=e495]
              - text: Beyond Campus
            - heading "Real startup internships" [level=2] [ref=e498]
            - paragraph [ref=e499]: AI-matched to your skills. One-click apply. No resume needed to start.
          - generic [ref=e500]:
            - generic [ref=e501]:
              - generic [ref=e502]:
                - generic [ref=e503]: 🚀
                - generic [ref=e504]:
                  - text: 94% match
                  - generic: AI-matched based on your skills
              - generic [ref=e506]: Acme AI Studio
              - heading "Frontend Developer Intern" [level=3] [ref=e507]
              - generic [ref=e508]:
                - generic [ref=e509]: React
                - generic [ref=e510]: Remote
                - generic [ref=e511]: 3 months
              - generic [ref=e513]:
                - generic [ref=e514]: ₹8,000/mo
                - button "Apply Now" [ref=e515]
            - generic [ref=e516]:
              - generic [ref=e517]:
                - generic [ref=e518]: 📊
                - generic [ref=e519]:
                  - text: 88% match
                  - generic: AI-matched based on your skills
              - generic [ref=e521]: DataStack India
              - heading "Data Science Intern" [level=3] [ref=e522]
              - generic [ref=e523]:
                - generic [ref=e524]: Python
                - generic [ref=e525]: Hybrid
                - generic [ref=e526]: 6 months
              - generic [ref=e528]:
                - generic [ref=e529]: ₹12,000/mo
                - button "Apply Now" [ref=e530]
            - generic [ref=e531]:
              - generic [ref=e532]:
                - generic [ref=e533]: 🎨
                - generic [ref=e534]:
                  - text: 91% match
                  - generic: AI-matched based on your skills
              - generic [ref=e536]: DesignLab Co.
              - heading "UI/UX Design Intern" [level=3] [ref=e537]
              - generic [ref=e538]:
                - generic [ref=e539]: Figma
                - generic [ref=e540]: Remote
                - generic [ref=e541]: 2 months
              - generic [ref=e543]:
                - generic [ref=e544]: ₹6,000/mo
                - button "Apply Now" [ref=e545]
          - link "View All Internships" [ref=e547] [cursor=pointer]:
            - /url: /dashboard/student/internships
            - text: View All Internships
            - img [ref=e548]
        - generic [ref=e554]:
          - generic [ref=e555]:
            - generic [ref=e556]: ✦ Your personal mentor
            - heading "AI Career Roadmap" [level=2] [ref=e557]
            - paragraph [ref=e558]: Tell our AI where you are and where you want to be. Get a custom, week-by-week plan with curated resources, projects, and milestones.
            - list [ref=e559]:
              - listitem [ref=e560]:
                - img [ref=e561]
                - generic [ref=e564]: Personalised to your current skill level
              - listitem [ref=e565]:
                - img [ref=e566]
                - generic [ref=e569]: Curated links to the best free resources
              - listitem [ref=e570]:
                - img [ref=e571]
                - generic [ref=e574]: Built-in project milestones
              - listitem [ref=e575]:
                - img [ref=e576]
                - generic [ref=e579]: Prepares you for real startup internships
            - link "Generate My Roadmap ✨" [ref=e581] [cursor=pointer]:
              - /url: /dashboard/student/career-copilot
              - text: Generate My Roadmap ✨
              - img [ref=e582]
          - generic [ref=e585]:
            - generic [ref=e586]:
              - generic [ref=e587]:
                - generic [ref=e588]: Goal
                - generic [ref=e589]: Frontend Developer
              - generic [ref=e590]: 12 Weeks
            - generic [ref=e593]:
              - generic [ref=e594]:
                - generic [ref=e596]: ✓
                - generic [ref=e597]:
                  - generic [ref=e598]: Week 01
                  - generic [ref=e599]: HTML & CSS Mastery
              - generic [ref=e600]:
                - generic [ref=e602]: ✓
                - generic [ref=e603]:
                  - generic [ref=e604]: Week 02
                  - generic [ref=e605]: JavaScript Basics
              - generic [ref=e609]:
                - generic [ref=e610]: Week 03
                - generic [ref=e611]: React Fundamentals
              - generic [ref=e612]:
                - generic [ref=e614]: 🔒
                - generic [ref=e615]:
                  - generic [ref=e616]: Week 04
                  - generic [ref=e617]: State Management
              - generic [ref=e618]:
                - generic [ref=e620]: 🔒
                - generic [ref=e621]:
                  - generic [ref=e622]: Week 05
                  - generic [ref=e623]: API Integration
              - generic [ref=e624]:
                - generic [ref=e626]: 🔒
                - generic [ref=e627]:
                  - generic [ref=e628]: Week 06
                  - generic [ref=e629]: Final Project
        - generic [ref=e632]:
          - generic [ref=e633]:
            - generic [ref=e634]: ★ Student Stories
            - heading "Real students. Real results." [level=2] [ref=e635]
          - generic [ref=e636]:
            - generic [ref=e638]:
              - generic [ref=e639]:
                - img [ref=e640]
                - paragraph [ref=e643]: “CampusConnect is exactly what every ambitious student needed. The escrow system means I never worry about getting scammed. I got my first gig within a week of signing up.”
                - generic [ref=e644]:
                  - img "Arjun S." [ref=e645]
                  - generic [ref=e646]:
                    - generic [ref=e647]: Arjun S.
                    - generic [ref=e648]: Engineering Student · Computer Science, 3rd Year
                    - generic [ref=e649]: First gig in week 1 · Payments via Escrow
              - generic [ref=e650]:
                - generic [ref=e651]:
                  - button "Go to slide 1" [ref=e652]
                  - button "Go to slide 2" [ref=e653]
                  - button "Go to slide 3" [ref=e654]
                - generic [ref=e655]:
                  - button "Previous testimonial" [ref=e656]:
                    - img [ref=e657]
                  - button "Next testimonial" [ref=e659]:
                    - img [ref=e660]
            - generic [ref=e663]:
              - generic [ref=e666]: Live Platform Activity
              - generic [ref=e667]: 🎯 A student accepted a ₹800 design gig
              - generic [ref=e668]:
                - generic [ref=e669]: 🚀 New startup internship posted — apply now
                - generic [ref=e670]: 💰 Escrow payment released after gig completion
                - generic [ref=e671]: ⭐ Gig completed with a 5-star review
                - generic [ref=e672]: 🔥 3 new React gigs posted this hour
        - generic [ref=e677]:
          - generic [ref=e678]:
            - img [ref=e679]
            - text: Now live across India — join free
          - heading "Your campus is waiting." [level=2] [ref=e682]:
            - text: Your campus
            - text: is waiting.
          - paragraph [ref=e683]: Stop waiting for opportunities to come to you. Log in, find students near you, and start building your real-world portfolio today.
          - generic [ref=e684]:
            - link "Create Free Account" [ref=e685] [cursor=pointer]:
              - /url: /auth/sign-up
              - text: Create Free Account
              - img [ref=e686]
            - link "Post a Gig" [ref=e688] [cursor=pointer]:
              - /url: /auth/sign-up?role=client
          - generic [ref=e689]: Free forever for students · No credit card needed
        - generic [ref=e692]:
          - generic [ref=e693]:
            - generic [ref=e694]:
              - link "CampusConnect CampusConnect" [ref=e695] [cursor=pointer]:
                - /url: /
                - img "CampusConnect" [ref=e697]
                - generic [ref=e699]: CampusConnect
              - paragraph [ref=e700]: The hyperlocal student marketplace. Find campus gigs, startup internships, and AI-powered career guidance — any college, any city across India.
              - generic [ref=e701]:
                - link "Twitter / X" [ref=e702] [cursor=pointer]:
                  - /url: https://twitter.com/campusconnectin
                  - img [ref=e703]
                - link "LinkedIn" [ref=e705] [cursor=pointer]:
                  - /url: https://linkedin.com/company/campusconnect-in
                  - img [ref=e706]
                - link "Instagram" [ref=e710] [cursor=pointer]:
                  - /url: https://instagram.com/campusconnect.in
                  - img [ref=e711]
                - link "GitHub" [ref=e714] [cursor=pointer]:
                  - /url: https://github.com/campusconnect-in
                  - img [ref=e715]
            - generic [ref=e718]:
              - generic [ref=e719]:
                - heading "Product" [level=4] [ref=e720]
                - list [ref=e721]:
                  - listitem [ref=e722]:
                    - link "Campus Gigs" [ref=e723] [cursor=pointer]:
                      - /url: /gigs/find
                      - text: Campus Gigs
                      - img [ref=e724]
                  - listitem [ref=e727]:
                    - link "Startup Internships" [ref=e728] [cursor=pointer]:
                      - /url: /internships
                      - text: Startup Internships
                      - img [ref=e729]
                  - listitem [ref=e732]:
                    - link "SmartMatch AI" [ref=e733] [cursor=pointer]:
                      - /url: /dashboard/student/smartmatch
                      - text: SmartMatch AI
                      - img [ref=e734]
                  - listitem [ref=e737]:
                    - link "Marketplace" [ref=e738] [cursor=pointer]:
                      - /url: /marketplace
                      - text: Marketplace
                      - img [ref=e739]
                  - listitem [ref=e742]:
                    - link "Pricing" [ref=e743] [cursor=pointer]:
                      - /url: /pricing
                      - text: Pricing
                      - img [ref=e744]
              - generic [ref=e747]:
                - heading "Company" [level=4] [ref=e748]
                - list [ref=e749]:
                  - listitem [ref=e750]:
                    - link "About Us" [ref=e751] [cursor=pointer]:
                      - /url: /about
                      - text: About Us
                      - img [ref=e752]
                  - listitem [ref=e755]:
                    - link "Success Stories" [ref=e756] [cursor=pointer]:
                      - /url: /success-stories
                      - text: Success Stories
                      - img [ref=e757]
                  - listitem [ref=e760]:
                    - link "Manifesto" [ref=e761] [cursor=pointer]:
                      - /url: /manifesto
                      - text: Manifesto
                      - img [ref=e762]
                  - listitem [ref=e765]:
                    - link "Careers" [ref=e766] [cursor=pointer]:
                      - /url: /contact-us
                      - text: Careers
                      - img [ref=e767]
                  - listitem [ref=e770]:
                    - link "Contact" [ref=e771] [cursor=pointer]:
                      - /url: /contact-us
                      - text: Contact
                      - img [ref=e772]
              - generic [ref=e775]:
                - heading "Trust" [level=4] [ref=e776]
                - list [ref=e777]:
                  - listitem [ref=e778]:
                    - link "Trust & Safety" [ref=e779] [cursor=pointer]:
                      - /url: /trust
                      - text: Trust & Safety
                      - img [ref=e780]
                  - listitem [ref=e783]:
                    - link "Editorial Standards" [ref=e784] [cursor=pointer]:
                      - /url: /editorial
                      - text: Editorial Standards
                      - img [ref=e785]
                  - listitem [ref=e788]:
                    - link "Verification System" [ref=e789] [cursor=pointer]:
                      - /url: /trust#verification
                      - text: Verification System
                      - img [ref=e790]
                  - listitem [ref=e793]:
                    - link "Dispute Resolution" [ref=e794] [cursor=pointer]:
                      - /url: /trust#disputes
                      - text: Dispute Resolution
                      - img [ref=e795]
              - generic [ref=e798]:
                - heading "For Employers" [level=4] [ref=e799]
                - list [ref=e800]:
                  - listitem [ref=e801]:
                    - link "Talent Search" [ref=e802] [cursor=pointer]:
                      - /url: /employer/talent-search
                      - text: Talent Search
                      - img [ref=e803]
                  - listitem [ref=e806]:
                    - link "Campus Drives" [ref=e807] [cursor=pointer]:
                      - /url: /employer/drives
                      - text: Campus Drives
                      - img [ref=e808]
                  - listitem [ref=e811]:
                    - link "Employer Plans" [ref=e812] [cursor=pointer]:
                      - /url: /employer/upgrade
                      - text: Employer Plans
                      - img [ref=e813]
                  - listitem [ref=e816]:
                    - link "Case Studies" [ref=e817] [cursor=pointer]:
                      - /url: /success-stories
                      - text: Case Studies
                      - img [ref=e818]
              - generic [ref=e821]:
                - heading "Legal" [level=4] [ref=e822]
                - list [ref=e823]:
                  - listitem [ref=e824]:
                    - link "Terms of Service" [ref=e825] [cursor=pointer]:
                      - /url: /terms-and-conditions
                      - text: Terms of Service
                      - img [ref=e826]
                  - listitem [ref=e829]:
                    - link "Privacy Policy" [ref=e830] [cursor=pointer]:
                      - /url: /privacy-policy
                      - text: Privacy Policy
                      - img [ref=e831]
                  - listitem [ref=e834]:
                    - link "Refund Policy" [ref=e835] [cursor=pointer]:
                      - /url: /refund-policy
                      - text: Refund Policy
                      - img [ref=e836]
          - generic [ref=e839]:
            - paragraph [ref=e840]: © 2026 CampusConnect. All rights reserved.
            - generic [ref=e841]:
              - generic [ref=e842]: ● All systems operational
              - generic [ref=e843]: Made with ♥ in India
  - status
  - button "AI Career Guide" [ref=e844]:
    - img [ref=e845]
    - generic: AI Career Guide
  - generic [ref=e854] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e855]:
      - img [ref=e856]
    - generic [ref=e859]:
      - button "Open issues overlay" [ref=e860]:
        - generic [ref=e861]:
          - generic [ref=e862]: "0"
          - generic [ref=e863]: "1"
        - generic [ref=e864]: Issue
      - button "Collapse issues badge" [ref=e865]:
        - img [ref=e866]
  - alert [ref=e868]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Landing Page Layout and Navigation", () => {
  4  |   test("should load successfully on desktop and verify layout headers", async ({ page }) => {
  5  |     // Navigate to root route
  6  |     await page.goto("/");
  7  | 
  8  |     // Verify company branding and hero elements
  9  |     await expect(page).toHaveTitle(/CampusConnect/i);
> 10 |     await expect(page.locator("nav")).toBeVisible();
     |                                       ^ Error: expect(locator).toBeVisible() failed
  11 | 
  12 |     // Verify main CTA buttons
  13 |     const joinButton = page.locator("a:has-text('Join Free')");
  14 |     if (await joinButton.count() > 0) {
  15 |       await expect(joinButton.first()).toBeVisible();
  16 |     }
  17 |   });
  18 | 
  19 |   test("should check responsive mobile menu drawer toggle", async ({ page }) => {
  20 |     // Set viewport to mobile size
  21 |     await page.setViewportSize({ width: 375, height: 667 });
  22 |     await page.goto("/");
  23 | 
  24 |     // Toggle button should be visible on mobile
  25 |     const menuToggle = page.locator("button[aria-label='Toggle menu']");
  26 |     if (await menuToggle.count() > 0) {
  27 |       await expect(menuToggle).toBeVisible();
  28 |       // Click toggle
  29 |       await menuToggle.click();
  30 |     }
  31 |   });
  32 | 
  33 |   test("should contain key SEO meta titles and markup links", async ({ page }) => {
  34 |     await page.goto("/");
  35 | 
  36 |     // Check favicon and metadata presence
  37 |     const description = page.locator("meta[name='description']");
  38 |     await expect(description).toBeDefined();
  39 | 
  40 |     // Verify footer links are accessible and valid HTML5 anchors
  41 |     const privacyLink = page.locator("a[href='/privacy-policy']");
  42 |     if (await privacyLink.count() > 0) {
  43 |       await expect(privacyLink.first()).toBeVisible();
  44 |     }
  45 |   });
  46 | });
  47 | 
```