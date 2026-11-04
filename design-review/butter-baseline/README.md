# Shared private homepage baseline

Both product review URLs currently serve the same Butter homepage. This is the starting point before adapting copy, media, accents or calls to action. The earlier authored product pages and their copy plan are available at commit 057bb76.

The local site directory contains the rendered homepage, its serialized content, production JavaScript, CSS, web fonts, fallback images and keychain models captured from https://www.butter.video/ on 04.11.2026. Absolute Next bundle URLs are rebased to the local paths. Third-party editorial imagery, video and the model decoder still use the source CDNs. These are the delivered browser artifacts. Butter's editable authoring repository and CMS are outside this snapshot.

Run serve.py for a loopback-only preview on port 5762. The Mac Studio's private Tailscale Serve route on HTTPS port 8461 points there. The server maps both / and /embark/ to the homepage and restricts external requests. Navigation beyond the landing page belongs to Butter. Login, trials and templates still link to Butter.

For the content pass, keep the captured baseline as the comparison and derive the two product variants from it. Change the rendered content and its hydration data together. Preserve the original sections' layout and scroll dependencies when replacing product media. Replace Butter's application links before any public release.
