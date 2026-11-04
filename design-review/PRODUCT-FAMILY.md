# Portlink and Embark landing pages

## Direction

A port call and a departure. Butter's hanging object, oversized single headline, compact split navigation, tactile feature examples and chaptered product demonstrations provide the visual reference. Attio's readable product crops are the secondary reference. Keep Butter's pale stage and editorial scale. Replace the charms with original port-call and excursion tags. Use Portlink's existing teal token (#1a5e6b) for actions and selected details, navy ink and mist surfaces. The marketing accent is scoped to the family components. Existing product screens retain their own colours.

Chose two linked pages on portlink.app with one set of components. Over a single page with an audience switch, which hides one buying journey, and two independent sites, which would duplicate design and separate the network story. Revisit if Embark acquires its own marketing domain. Its tenant websites sell excursions to guests and are a different surface.

## Content and media in scroll order

| Section | Portlink | Embark | Treatment |
| --- | --- | --- | --- |
| Opening | Coordinate the port call. Cruise lines, agents and shore teams see what each call needs. | Run the departure. Bookings, guides and guest lists for local tour operators. Endorsement reads “A Portlink product”. | Suspended call tag or guide pass above the headline. Each object identifies the place or excursion seen below. The hero opens the walkthrough and the navigation offers a demo enquiry. |
| Product story | A cruise line plans a call, a DMC requests excursion terms, an operator returns them. | An operator opens the request, answers it and prepares a departure. | One example in Ilulissat. Scroll moves between three labelled, independently readable scenes. Desktop keeps a coded operations record in view. Phones carry the evidence beside each caption. No embedded player or autoplay audio. |
| Feature depth | Keep the existing seven product chapters, especially port calls, departmental approvals and PDA/FDA comparison. Keep the shared-record explorer for handoffs. | Show the day’s departures, guide assignment and guest check-in. Explain the distinction between operator bookings and a trade enquiry. | Existing Portlink product compositions, Embark tour image and purpose-built operational records with fictional names and quantities. No customer endorsements implied. |
| Product relationship | Link the DMC’s request to the operator side of the same excursion. | Explain who buys and who runs it. A DMC prepares the offer for the cruise line in Portlink. The operator supplies tour terms in Embark. | Prominent reciprocal link in the hero navigation and at the narrative handoff. Never suggest that every line receives operator inventory or that an enquiry guarantees a sale. |
| Proof and conversion | Keep the named team, demo form, pilot terms and legacy email destinations. | Invite the operator to discuss Embark with Portlink using a product-specific subject. | Use the existing contact channel. No invented customer logos, savings or availability promises. |

## Production notes

The primary reference is https://www.butter.video/. Its screenshot sequence at desktop and phone shows the object hero, proof row, tool examples and template collection. Select the first three treatments. A template marketplace and customer-logo wall would need inventory and permissions of their own.

The Portlink source is components/scenes/chapters.ts. Embark sources are its departure, booking and check-in routes, docs/TRADE-API.md and the signed request/decision handlers. The latest implementation supersedes the earlier planning note for the Embark half. The round trip on a live Portlink tenant remains unverified. Demonstrate the relationship as an illustrative walkthrough. The departure is a separate operational step, never an implied booking from an accepted quote.

Media plan: use the existing port-call product-film poster and Embark's seeded fjord-cruise image as small printed images. Draw the pass and update the sample record in code. In a future recording pass, capture the same example in both products with a seeded DMC and operator. Show the request leaving Portlink, the exact fields the guide returns and the agreed terms appearing back on the original request. Publish a real recording only after both ends have been exercised. Keep copy and figures as selectable HTML in the walkthrough.

## Integration and verification

The homepage and the new /embark/ route share a hero and record walkthrough. Preserve #main, #pain, #dashboard, #ecosystem, #pilot, #access, the contact flow, consent and all seven product fragments. The campaign and authenticated products are separate. Reversal is the landing change alone. Verify both widths, reverse scrolling, keyboard links, reduced motion, canonical URLs, reciprocal navigation and the production build.

## Review build

The two pages are implemented together in the landing repository. The sample records advance with scroll on desktop and sit directly beside their captions on phones. The Embark enquiry opens a message to the existing Portlink pilot inbox with Embark in the subject. Desktop and phone browser checks exercised every chapter in both directions and followed both product links. The checks used reduced-motion emulation. The production build checked legacy fragments, the existing seven product chapters, consent and font hosting.

For a public release, check the current state of the deployed trade integration before strengthening any illustrative copy. Add a genuine operator quote or additional field photography only once the operator clears it for marketing.
