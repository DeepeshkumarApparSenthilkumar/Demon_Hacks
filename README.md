We built LoopMind — Chicago's first AI City Intelligence Platform.

Not one tool. Not one feature. Six specialized AI agents, unified into a single application, each one targeting a specific verified problem that Chicagoans face every single day.

*BusGuardian* solves the ghost bus problem. Instead of blindly trusting official CTA arrival data, it uses consensus verification — cross-referencing historical lag patterns and real-time signals to give every commuter a Truth Score on their bus arrival. For the first time, you know if your bus is actually coming before you step outside into the cold.

*LoopTour* solves the tourism overcrowding problem. Powered by Groq AI and Mapbox, it builds personalized walking tours in real time — adapting to your mood, energy, available time, and interests. It actively routes people toward hidden local gems and away from overcrowded hotspots, turning tourist foot traffic into a lifeline for small businesses.

*LoopPulse* solves the small business blindspot. Using Groq AI and live weather and transit data, it predicts foot traffic, recommends staffing levels, and delivers the kind of data intelligence that only large corporations could afford before. It gives the corner restaurant the same edge as a Fortune 500 chain.

*HousingAI* solves the housing uncertainty problem. Built on GPT-4o and PostGIS geospatial data, it predicts Chicago property values by neighborhood — helping residents make smarter decisions and stop overpaying on the biggest financial commitment of their lives.

*CHI_Trade* solves the trade community disconnection problem. Live neighborhood pulse trade feeds, real-time trade analysis, and an AI crisis chat give every trade access to community intelligence around the clock.

*AirGuardian* solves the air quality blindspot. Using 90 live OpenAQ sensors across the Chicago metro, it renders a real-time PM2.5 heatmap that makes the city's pollution inequality impossible to ignore. A personalized health risk score adjusts for your conditions — asthma, COPD, heart disease — and your commute type. A Claude-powered AI assistant answers neighborhood-specific questions with live sensor context. And a clean route planner finds you a lower-pollution path to work, not just a faster one.

---

# What We Learned

Real-world city data is messier than any tutorial prepares you for. APIs retire overnight. Sensors go offline. Rate limits hit at the worst moments. We learned to build systems that are resilient — caching, retrying, falling back gracefully — because a tool that breaks when the data gets hard is no tool at all.

We also learned that raw data means nothing until it's personal. A city-wide air quality number doesn't move anyone. But telling someone with asthma that their risk today is Elevated, that they should keep their inhaler accessible, that the route through Pilsen has significantly more exposure than the lakefront path — that changes behavior. That's what AI is for.

---

# Challenges We Faced

Every one of our six agents hit unexpected walls. The OpenAQ API was retired mid-build, forcing a complete rewrite of the data layer. Browser security blocks direct calls to external APIs, requiring a proxy server. Chicago's sensor network is sparse in some neighborhoods, requiring interpolation to fill the gaps.

But the hardest challenge wasn't technical. It was making invisible problems visible. Ghost buses, hidden pollution, foot traffic deserts, housing traps — none of these show up on a standard city map. Building interfaces that make these realities feel real to someone who has never noticed them before — that was the work that mattered most.
