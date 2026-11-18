# Claim register, WP3 captures (v2)

Source of claims: `DIRECTION.md` section 4 (S0 to S14), tags C / T-shown / T-ask / E as defined there. Pain-today lines are transcript quotes, not product claims, and are not listed. "Visible" means the claim is readable in the named capture. Desktop is 1440x900, phone 390x844, both deviceScaleFactor 2; no pixel editing, no cropping applied.

Data: local Platform stack seeded with PR #3230 (`supabase/seeds/demo_harbour_ilulissat.sql`, MS Disko Star (demo), Ilulissat, 18.11.2026). Platform captures come from the build at b692fce (two commits behind `origin/main` 08e29ee). Embark captures (P9) come from a separate local Embark database (a different demo dataset, Norwegian UI), consistent with DIRECTION Q6 (no data link claimed).

| # | Stop | Claim text | Tag | Capture file | Visible | Note |
|---|---|---|---|---|---|---|
| 1 | S0 | "Follow one cruise call from the planner's screen..." (planner's screen) | none | P01-desktop.png, P01-phone.png | yes | Voyage builder on a real chart with the route and four passages. |
| 2 | S0 | "...to the guide's phone, on the real screens each role works in." (guide's phone) | none | none | no | P10 removed (see row 28). Reword to "...to the tour operator's back office" or remove the guide's phone until P10 exists. |
| 3 | S1 | Routes follow chart markings | T-shown | P01-desktop.png, P04-desktop.png | no | The route is drawn on the chart, but in this demo it is hand-drawn (`Hand-edited` badge in P03) and the autorouting chip reads "no graph here" (no Greenland graph). Reword to "Draw the route on the chart"; do not claim automatic following. |
| 4 | S1 | ...trained on AIS tracks of passenger ships | T-shown | none | no | No screen shows AIS-trained routing. Remove, or reword to what P01 shows. |
| 5 | S1 | Typical wind, waves and sea temperature for the planned dates | T-shown | none (P2 removed) | no | The chart's "Typical conditions" layer needs climate binaries that do not exist on the local stack; the old P02 showed "no Nov data yet" and was rejected. Reword or remove, or capture P2 from an environment with the climate data. Copy line "check typical conditions for your dates" falls with it. |
| 6 | S1 | RTZ, GPX and CSV in and out | T-shown | P03-desktop.png | yes | Toolbar shows EXPORT RTZ / GPX / CSV and Import with a passage open. Phone variant not captured (layout overlaps at 390 wide). |
| 7 | S1 | Copy: "export RTZ for the ECDIS" | T-shown | P03-desktop.png | yes | The RTZ button is visible; loading into an ECDIS is not shown. |
| 8 | S1 | Stated limit: planning software, not navigation | none | P01-desktop.png, P01-phone.png | yes | "Planning aid, not for navigation" and "Planning-grade chart" in the bottom bar. |
| 9 | S1 | Copy: "Draw the route on charts made for planning" | none | P01-desktop.png, P03-desktop.png | yes | Waypoints, course and distance table in P03. |
| 10 | S3 | Fuel sits on the voyage from distance and speed, with rates you can override | T-shown | P05-desktop.png, P05-phone.png | yes | Day-by-day fuel from the first day; "Fuel is priced at the price you chose" with region price choices and "Update the price". The label reads "Is $631/t" (region code), as the product has it. |
| 11 | S3 | Port costs join when the agent's estimate lands on the same call | T-shown, C | P05-desktop.png | yes | "Waiting for you EUR 12 218" on the forecast, plus the Ilulissat day bar. |
| 12 | S3 | Mono counter: distance run, from the demo voyage's own figures | none | P04-desktop.png | yes | "3,118 NM / 4 passages" in the header. The ship marker is a slider ("Ship at") on the voyage bar. |
| 13 | S3 | Chart at the satellite layer | none | P04-desktop.png | yes | Whole-route satellite view, 1440 wide. Phone variant not captured (Chart settings control not reachable at 390 wide in automation). |
| 14 | S3 | Pilot work: timestamped quotations, tariff publication lag | T-ask | none | no | Pilot work, not shown in product. Keep out of present tense or remove. |
| 15 | S6 | The cruise line requests an agent; accepting creates or staffs the one call, never a duplicate | C | P06-desktop.png, P06-phone.png | yes | Page line: "Accept the call and send the PDA on the shared record." Shows the result: "Agent appointed", "Port agent: Portlink Agency (demo)", one call (call 4 of 5). The accept action itself is not on screen. |
| 16 | S6 | The agent sends the estimate on that record | C | P06-desktop.png, P06b-desktop.png | yes | "PDA EUR 12 218, Sent"; PDA page header "Sent", step 2 of 5. |
| 18 | S6 | Not every party sees every cost line | C | P06b-desktop.png | yes | "Visible to" column with "Master + 1" and "Not Master / 2 roles" per line. |
| 19 | S7 | A shore request arrives on its call as tour intake marked "Quote requested" | C | P08-desktop.png, P08-phone.png | yes | The product spells the status in lowercase ("quote requested"). Copy should match or accept the case difference. Also visible on the call in P06 ("Excursions: 1 tour, 90 of 372 guests placed"). |
| 20 | S7 | It is not a confirmed excursion / nothing reads as confirmed until you confirm it | C | P08-desktop.png | yes | RFP row "Pending" with a "Quote" button; booking status "quote requested". |
| 21 | S8 | Embark: departures, guide assignment | E | P09-desktop.png, P09-phone.png | yes | Departures list with a Guider column (one assigned, others "Ingen"). Norwegian UI. |
| 22 | S8 | Embark: bookings | E | P09-desktop.png | yes | Guest counts per departure (0/12 etc.) and a Bookinger menu entry; the bookings screen itself is not captured. |
| 23 | S8 | Embark: payments | E | P09-desktop.png | no | Only a "Fakturaer" menu entry is visible. Reword to "invoices" or capture a payments screen. |
| 24 | S8 | Embark: a booking widget | E | none | no | Not captured. Remove from the line or capture the public widget separately. |
| 25 | S8 | "First deployment: Greenland" | E | none | no | A fact, not a screen. Not verifiable in a capture; keep only if the founders confirm. |
| 26 | S8 | "Embark runs departures, guides, bookings and payments for small tour operators" | E | P09-desktop.png | no | Departures, guides and bookings are visible (rows 21, 22); payments is not (row 23). |
| 27 | S8 | Copy: "Tomorrow's departures, staffed." | E | P09-desktop.png | yes | The top bar shows "I morgen Fjordcruise 15:31"; a staffed departure (initials) sits beside unstaffed ones, so reword to "staffed or not, at a glance" if both rows matter. |
| 28 | S9 | "Embark field mode is the guide's phone view on tour. This is the real screen." | E | none (P10 removed) | no | The route exists in code (`/admin/on-tour/[id]`) but the local Embark database is 30 migrations behind (at 0109, needs 0110 to 0139; `departure.free_sale` is missing) and the page returns a server error. Applying the migrations was refused by the psql write gate (Embark's port 55322 is not in the platform repo's allowed loopback set). Remove S9, or capture it after the local Embark stack is rebuilt (`supabase/dev/local-up.sh --reset`). |
| 33 | S11 | With the departure report complete, a draft FDA is generated | C | P12-desktop.png, P12-phone.png | yes | Money tab: Departure report "Complete", FDA "Draft EUR 12 348"; PDA page: "FDA generated, EUR 12 348". |
| 34 | S11 | ...signed by both sides | C | P12b-desktop.png | no | The report shows Complete and its sections; the signatures are not visible. Reword to "complete" or capture the signature block. |
| 35 | S11 | ...using actual amounts where supplied and estimates otherwise | C | P12-desktop.png | yes | The totals differ (PDA 12 218, FDA 12 348); the per-line mix is not shown. |
| 36 | S11 | Copy: the estimate and the draft FDA sit on the same call | none | P12-desktop.png | yes | Three cards (PDA, Departure report, FDA) on the call's Money tab. |
| 37 | S12 | "Each workspace sees what its role on the call allows" | none | P05, P06, P08, P12 | yes | Cruise line, agent and DMC workspaces on the same Ilulissat call; a composite of captures, not a single screen. |
| 38 | S13 | Portlink: cruise line, port agent, DMC | none | P01, P03 to P06, P08, P12 | yes | Three workspaces captured; the vessel is not named (P11 cut). |
| 39 | S13 | Embark: hut and boat, crop of P9 | E | P09-desktop.png | yes | |
| 40 | S13 | Wheelhouse: a named node, no claims | none | P08-desktop.png, P09-desktop.png | yes | "Wheelhouse" appears in both sidebars; no claims made. |

## Counts

Rows: 34 (rows 17 and 29 to 32 removed with P07, P11 and stop S10). Open (visible = no): 11 (rows 2, 3, 4, 5, 14, 23, 24, 25, 26, 28, 34). Row 26 restates the payments gap of row 23.

## Stop status

P2 removed (no climate data locally). P10 removed (Embark field mode errors on the local database; see row 28). P07, P11 and stop S10 removed (real ships from the shared demo fleet; Starboard ruling 18.11.2026, same rule as the earlier real-company cut: no real names, no blurring). P03 and P04 are desktop only.

## G2 ruling on the open claims (Keel, 18.11.2026)

Every claim no capture shows is cut from the page or reworded to what a capture shows. The page copy is `components/harbour/script.ts`; nothing there makes an open claim.

| Row | Claim | Ruling | Page line now |
|---|---|---|---|
| 2 | to the guide's phone | Cut (P10 removed) | S0: "...to the tour operator's desk" (P09) |
| 3 | Routes follow chart markings | Cut | S1: "Draw the route on charts made for planning" (P01, P03) |
| 4 | Trained on AIS tracks of passenger ships | Cut | none |
| 5 | Typical wind, waves and sea temperature | Cut (P2 removed) | none |
| 14 | Timestamped quotations, tariff publication lag | Cut (pilot work, not product) | none |
| 23 | Embark: payments | Cut | S8: "departures, guides and bookings" (P09) |
| 24 | Embark: a booking widget | Cut | none |
| 25 | First deployment: Greenland | Cut (a fact, not a screen; founders may restore it) | none |
| 26 | Embark runs departures, guides, bookings and payments | Reworded, payments cut | S8 line above |
| 28 | Embark field mode on the guide's phone | Cut with stop S9 (P10 removed) | stop removed |
| 34 | Draft FDA signed by both sides | Reworded, signatures cut | S11: "the draft FDA sit on the same call" (P12) |

No real company appears in a capture: the Ilulissat call's port agent and DMC are the seed's own "Portlink Agency (demo)" and "Portlink Shore (demo)" (platform PR #3230).

S5 line reworded to "One ship in the bay, four teams, one call record between them." (no "on board": no vessel screen remains). Product card text reworded to "the cruise line, the port agent and the DMC" (vessel dropped with P11).
