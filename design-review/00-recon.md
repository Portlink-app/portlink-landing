# Scope and architecture

The visitor is a cruise-line planner, port agent, DMC, vessel team member, or maritime operator commissioning software. Jobs: understand the product, find their role, judge the people behind it, then request pilot access or describe a build.

| Route | Archetype | Coverage |
|---|---|---|
| / | Product/company landing, flagship | Every section and interaction |
| /contact/ | Enquiry wizard, flagship | Shared shell, both intents, validation and step progression without sending |
| /team/ | People directory | Shared header/footer regression |
| /privacy/ | Information document | Shared header/footer regression; legal copy unchanged |
| /innovasjon-norge/ | Application document | Shared header/footer regression; content unchanged |
| /seatrade/ | Campaign wizard | Excluded content and data; global boundary smoke check |
| /seatrade/report/ | Campaign report | Excluded content and data |
| /seatrade/me/ | Campaign account/scorecard | Excluded content and data |
| /seatrade/terms/ | Campaign information | Excluded content and data |
| /seatrade/unsubscribed/ | Campaign confirmation | Excluded content and data |

Design system: generated app/_ds tokens and styles, with landing aliases in app/globals.css and CSS modules for the newer sections. Never edit generated distribution files. Content is populated authored demonstration data, explicitly illustrative; no data seeding or account login is applicable to this marketing review.

Graphify skill was read. This repository has no graphify-out/graph.json; the live import inventory supplies the map. app/page.tsx composes Nav, FilmHero, FounderBar, PainSection, BuiltSection, PlatformExplorer, VoyageSeenSection, EcosystemSection, BentoSection, TeamProofSection, TwoDoorsSection, AccessSection and Footer. PlatformExplorer consumes chapters.ts and seven scene modules, which share scenes/ui.tsx. FilmHero and InViewVideo share useFilm. ContactForm consumes the same eligibility module as the API. Team facts remain in team-members.ts; contact commitments remain in lib/contact/promises.ts.
