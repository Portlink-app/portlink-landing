# Portlink and Embark private product previews

The two private URLs serve separate compiled product pages from public/product-family. The site directory in this folder is the intact Butter visual reference. It is not served by the preview. Its original styled-components rules, fonts, section markup, section ordering and responsive grids are the inputs to the product compiler.

Edit the two product entries in scripts/family/content.py. Run python3 -B scripts/family/build.py from the landing repository to regenerate both pages. Running python3 -B scripts/family/films.py also rebuilds the two silent product videos from sample UI images. The build tools use lxml, Pillow and ffmpeg. Three.js r185 is served locally with its license. Its product-specific scene, pointer and motion handling are in public/product-family/assets/keyring.js.

Portlink imagery comes from its sample-data product explorer. Embark imagery comes from its demo departures, bookings, tour catalogue and on-tour screens. The illustrative fjord photograph is by Pascal Debrunner, from the Embark demo asset register (https://unsplash.com/photos/XwRBIihDf7M). The handoff is illustrative, with no customer endorsement or promise of a completed booking.

The Mac Studio's private Tailscale endpoint on HTTPS port 8461 proxies to serve.py on loopback port 5762. All page fonts, images, videos, models and runtime dependencies are local. The Portlink demo CTA goes to the existing Portlink demo form and the Embark enquiry opens a product-specific email. Neither is an automated outbound action. The public homepage and application are separate from the review server.

Verification covered both pages at desktop and phone widths, normal and reduced motion, reciprocal navigation, all three walkthrough chapters, forward and reverse film seeking, keyboard gallery dismissal, local media decoding and browser errors. The public landing routes have not been cut over. Publication awaits David's instruction.
