# Legitimate interest assessment: company-level visitor recording on portlink.app

Controller: Portlink AS, Oslo. Written 29.09.2026 for the system in `docs/VISITOR-INTELLIGENCE.md`.
Scope: the **company tier** only (every visitor, no cookie). The person tier runs on consent
(ekomloven §3-15 and GDPR art. 6(1)(a)) or on the recipient's own click on a one-to-one email link
we sent them, and is not assessed here. This is the company's own assessment, not legal advice;
review it if Datatilsynet or the EDPB publishes guidance on the category (none found 29.09.2026).

## 1. Purpose test: is there a legitimate interest?

Portlink sells a business-to-business platform to cruise lines, ports, port agents and tour
operators. Knowing which organisations read the site, and which pages, lets a small company follow
up with interested accounts and learn what content matters. That is a commercial interest in
marketing to businesses, recognised as potentially legitimate in GDPR recital 47.

## 2. Necessity test: is the processing necessary, and is there a less intrusive way?

- The only personal data processed is the IP address, for the seconds it takes to look up the
  network owner, and the user agent, inside a one-way hash with a daily salt deleted after two days.
- The IP is never stored. Only the /24 (IPv4) or /48 (IPv6) prefix leaves our server, to public
  internet registries (RIPE NCC, the regional registries via rdap.org, PeeringDB).
- Nothing is stored on or read from the visitor's device, so ekomloven §3-15 does not apply.
- Visits from ISPs, mobile networks, clouds and VPNs, which is where private individuals browse, are
  classified as networks and never shown as a company.
- A less intrusive alternative (aggregate analytics only) does not meet the purpose: it cannot tell
  which organisation is interested.

## 3. Balancing test

| Factor | Assessment |
|---|---|
| Nature of data | Organisation name and domain, country and city, pages read, time, referrer. No names, no emails, no IP |
| Reasonable expectations | Business visitors to a B2B vendor's site commonly expect the vendor to see company-level interest; the privacy page says so plainly |
| Impact | Low. At most a sales follow-up to the organisation. No profiling of individuals, no sharing, no advertising |
| Edge case | A sole trader or very small firm whose company name equals a person. Mitigation: most such visits come through consumer ISPs and are classified as networks; the objection works for them too |
| Safeguards | Objection button on `/privacy/` (cookie `pl_optout`), Global Privacy Control honoured, bots and private pages excluded, 395-day retention, access limited to the admin cookie |

## 4. Conclusion

The interest is legitimate, the processing is limited to what the purpose needs, and with the
safeguards above the visitors' interests do not override it. Company-level recording may run for
every visitor without consent, with transparent notice on `/privacy/` and a one-click objection.

Revisit if: any identifier is stored on the device for this tier; the IP or a stable per-person
identifier is kept; data is shared with a third party; or a supervisory authority rules on reverse-IP
company identification.
