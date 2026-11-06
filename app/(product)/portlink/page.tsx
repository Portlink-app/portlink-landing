/**
 * /portlink: product page for cruise lines, port agents and DMCs.
 *
 * Clone method (David, 05.11.2026 kl. 11.42, plan PORTLINK_PRODUCT_LANDING_PAGES_2026-11-05):
 * waabi.ai's homepage rebuilt literally (its markup, class lists, section order, scroll scenes and
 * type scale), then rebranded with Portlink's colour, logo, copy and real product recordings.
 * The stylesheet is ours, public/product-pages/portlink.css, scoped under `.wb`, set in our open
 * faces (Source Serif 4 and Inter, app/_fonts/). No reference file ships: the provenance guard
 * refuses one in every build. Entry doc: docs/PRODUCT-PAGES.md.
 *
 * Every class below exists in public/product-pages/portlink.css (the landing's own Tailwind does
 * not scan this folder, globals.css `@source not`); page-specific rules are its `wbx-*` section.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { DEMO_HREF, DEMO_LABEL, PRODUCT_PAGE_ROBOTS } from '@/components/product/config'
import WaabiMotion from '@/components/clone/waabi/WaabiMotion'
import SeatLens from '@/components/clone/waabi/SeatLens'
import SplitTabs from '@/components/clone/waabi/SplitTabs'
import { SPLIT } from '@/components/clone/waabi/content'
import Film from '@/components/clone/Film'

export const metadata: Metadata = {
  title: 'Portlink: run the port call from one record',
  description:
    'Portlink is the shared port-call record for cruise lines, port agents, DMCs and ships: readiness, berth, shore excursions, the departure report and the final account in one place.',
  alternates: { canonical: '/portlink/' },
  robots: PRODUCT_PAGE_ROBOTS,
}

const V = '/video/landing-2026-09-15'
const P = '/product'
const H = '/havn'

/** The pill-free button of the reference, in Portlink's ink action colour (overrides.css). */
function Action({ href, cta, children, light }: { href: string; cta: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link
      href={href}
      data-cta={cta}
      className={`flex h-36 shrink-0 items-center justify-center px-24 md:h-48 ${light ? 'bg-white text-black' : 'bg-pink text-white'}`}
    >
      <span className="type-text-11 md:type-text-12 leading-[140%] tracking-[0.024rem]">{children}</span>
    </Link>
  )
}

/** A muted, looping product recording with its poster; the poster is what reduced motion and no-script see. */
function Loop({ src, poster, className = 'size-full object-cover' }: { src: string; poster: string; className?: string }) {
  return (
    <Film className={className} src={src} poster={poster} />
  )
}

function Tile({ children, extra = '' }: { children: React.ReactNode; extra?: string }) {
  return (
    <div className={`rounded-calc bg-cream relative h-133 w-133 overflow-clip md:h-[calc(133/1440*100vw)] md:w-[calc(133/1440*100vw)] ${extra}`}>
      {children}
    </div>
  )
}
const img = (src: string) => <img className="h-full w-full object-cover" src={src} alt="" loading="lazy" />

const TILE_COLUMNS: { cls: string; tiles: React.ReactNode[] }[] = [
  { cls: '-left-340 md:left-24', tiles: [img(`${H}/app-portcall.jpg`), <Loop key="b" src={`${V}/hero-B`} poster={`${V}/hero-B.jpg`} />, img(`${P}/fjord-cruise-800.webp`), img(`${H}/app-pda.jpg`)] },
  { cls: '-left-110 md:left-[calc(16.667%)]', tiles: [img(`${P}/sea-kayak-800.webp`), <Loop key="a" src={`${V}/hero-A`} poster={`${V}/hero-A.jpg`} />, img(`${H}/app-voyage.jpg`), img(`${P}/whale-safari-800.webp`)] },
  { cls: '-right-110 md:right-[calc(16.667%)]', tiles: [img(`${H}/app-chart.jpg`), img(`${P}/glacier-hike-800.webp`), <Loop key="d" src={`${V}/hero-D`} poster={`${V}/hero-D.jpg`} />, img(`${H}/app-portcall.jpg`)] },
  { cls: '-right-340 md:right-24', tiles: [img(`${P}/whale-safari-800.webp`), <Loop key="c" src={`${V}/hero-C`} poster={`${V}/hero-C.jpg`} />, img(`${H}/app-pda.jpg`), img(`${P}/fjord-cruise-800.webp`)] },
]

const CARDS = [
  { kicker: 'Plan', title: 'The season, port by port', href: '#f-split', video: `${V}/hero-A`, poster: `${V}/hero-A.jpg` },
  { kicker: 'Arrive', title: 'The port call, ready in time', href: '#f-seats', video: `${V}/hero-D`, poster: `${V}/hero-D.jpg` },
  { kicker: 'Settle', title: 'The final account, line by line', href: '#f-day', still: `${H}/app-pda.jpg` },
]

const DAY = [
  { time: '48 h before', tags: ['Readiness', 'Agent'], title: '5 of 7 arranged: berth, PDA and clearance done, pilot and tugs booked next', src: `${H}/app-portcall.jpg` },
  { time: '09.10', tags: ['Shore excursions', 'Embark'], title: 'Tours go ashore with the operator, confirmed in Embark by the DMC', src: `${P}/sea-kayak-800.webp` },
  { time: '17.30', tags: ['Departure report'], title: 'The agent signs, then the ship signs, on one phone at the gangway', src: `${P}/fjord-cruise-800.webp` },
  { time: '21.00', tags: ['Final account'], title: 'FDA 401 250 kr against PDA 412 380 kr: 11 130 kr under, line by line', src: `${H}/app-pda.jpg` },
  { time: 'Next call', tags: ['Voyage'], title: 'The same record carries the next port, already in the voyage plan', src: `${H}/app-voyage.jpg` },
]

export default function PortlinkPage() {
  return (
    <div className="wb" id="main">
      <link rel="stylesheet" href="/product-pages/portlink.css" precedence="product-page" />
      <WaabiMotion />
      <noscript dangerouslySetInnerHTML={{ __html: '<style>.wb .wbx-herolede{opacity:1}</style>' }} />

      <div className="wbx-announce">
        <span>Let&apos;s talk about your next season</span>
        <Link href={DEMO_HREF} data-cta="demo-portlink-announce">Book a demo ↗</Link>
      </div>

      <header className="css-header fixed right-0 left-0 z-500 mx-auto flex flex-col items-center justify-center sm:top-34 sm:w-338 sm:gap-10 top-24 w-[calc(100vw-2.4rem)] wbx-header">
        <div className="relative flex w-full items-start overflow-clip sm:bg-black/15 sm:p-1 bg-black/15 p-1 h-55">
          <div className="relative h-full w-full bg-white pt-0">
            <div className="item-start relative flex h-full w-full pr-13 pl-28">
              <div className="flex w-full justify-between">
                <div className="flex gap-25 items-center">
                  <Link aria-label="Portlink home" className="flex h-53 w-auto items-center" href="/">
                    <img src="/portlink-logo.png" alt="Portlink" width={92} height={24} />
                  </Link>
                  <span className="font-text inline-flex text-[1.5rem] leading-[160%] tracking-[0.015rem]">Port calls</span>
                </div>
                <Link href={DEMO_HREF} data-cta="demo-portlink-nav" className="wbx-navcta">Demo</Link>
              </div>
            </div>
          </div>
          <div className="bg-pink absolute right-25 bottom-0 left-25 h-2 origin-left wbx-progress" />
        </div>
      </header>

      <main className="relative min-h-svh w-full">
        <div className="flex flex-col">
          {/* 1. Hero: the product working, full bleed, the headline over it (Waabi "Built to think"). */}
          <section id="overview" className="relative flex w-full flex-col">
            <section className="text-background relative z-50 mb-[-75vh] h-[250vh] w-full md:h-[250vh]">
              <div className="relative h-full w-full">
                <div className="sticky top-0 left-0 h-svh w-full">
                  <div className="absolute top-0 left-0 h-dvh w-full">
                    <div className="absolute inset-0 will-change-transform wbx-herozoom">
                      <div className="absolute inset-0 size-full">
                        <Film src={`${V}/hero-C`} poster={`${V}/hero-C.jpg`} eager />
                      </div>
                      <div className="absolute inset-0 bg-black/35" />
                    </div>
                  </div>
                  <div className="px-calc absolute top-0 flex h-svh w-full items-end justify-start pb-40 md:pb-90 wbx-herolede">
                    <div className="relative flex flex-col gap-y-24">
                      <p className="type-display-24 md:type-display-40 max-w-295 text-balance md:max-w-495 text-white">
                        Portlink runs the cruise port call for the line, the agent, the DMC and the ship.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-calc pointer-events-auto relative mt-[-100lvh] mb-[100lvh] flex h-lvh items-end justify-start py-[var(--padding-y)]">
                  <div className="flex w-full flex-col items-start gap-24 pointer-events-auto">
                    <h1 className="text-[7.2rem] leading-[85%] tracking-[-0.288rem] md:text-[min(14vw,15rem)] md:tracking-[min(-0.5vw,-0.6rem)] text-balance text-white" data-words>
                      <span className="flex flex-col">
                        {/* signature-ok: the per-word entrance is waabi.ai's own hero motion (400ms, cubic-bezier(.19,1,.22,1)), cloned on David's instruction */}
                        <span className="text-left"><span className="wbx-w" style={{ '--i': 0 } as React.CSSProperties}>One</span> <span className="wbx-w" style={{ '--i': 1 } as React.CSSProperties}>call.</span></span>
                        <span className="text-left"><span className="wbx-w" style={{ '--i': 2 } as React.CSSProperties}>One</span> <span className="wbx-w" style={{ '--i': 3 } as React.CSSProperties}>record.</span></span>
                      </span>
                    </h1>
                    <div className="flex gap-12">
                      <Action href={DEMO_HREF} cta="demo-portlink-hero">{DEMO_LABEL}</Action>
                      <Action href="#f-split" cta="explore-portlink-hero" light>See how it works</Action>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Tiles fly apart around the statement (Waabi "We built our own road"). */}
            <section className="bg-background relative w-full overflow-clip h-[150vh]" data-scene="tiles">
              <div className="absolute inset-0 origin-top">
                {TILE_COLUMNS.map((col, c) => (
                  <div key={c} className={`absolute flex-col justify-between flex ${col.cls} h-[150vh] will-change-transform wbx-col`} style={{ '--c': c } as React.CSSProperties}>
                    {col.tiles.map((t, i) => <Tile key={i}>{t}</Tile>)}
                  </div>
                ))}
              </div>
              <div className="flex-center absolute inset-0 flex-col">
                <div className="flex-center relative">
                  <div className="relative flex max-w-295 flex-col items-center justify-center gap-18 text-center md:max-w-full">
                    <div className="absolute aspect-square w-full rounded-full"><div className="absolute size-full rounded-full bg-white blur-2xl" /></div>
                    <p className="type-display-18 md:type-display-24 relative text-black/50">We built the record the call runs on.</p>
                    <p className="type-display-18 md:type-display-24 text-dark relative max-w-558 overflow-clip">
                      Readiness, berth, shore excursions, the departure report and the money sit in one port-call
                      record. The cruise line, the port agent, the DMC and the ship each open it from their own
                      seat, and nobody types the call twice.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Sticky split with three claims (Waabi "Unlocking scale": Safe, Scalable, Practical). */}
            <section id="f-split" className="bg-background text-foreground relative w-full max-md:py-(--padding-y) md:h-[200vh]" data-scene="split" data-active="0">
              <div className="w-calc relative md:h-full md:px-90 max-md:hidden">
                <div className="flex w-full gap-40 max-md:flex-col md:h-full md:justify-between">
                  <div className="relative flex flex-1 flex-col md:h-full md:max-w-527">
                    <div className="md:sticky md:top-0 md:flex md:h-screen md:items-center">
                      <div className="relative w-full">
                        <div className="rounded-calc relative aspect-square w-full overflow-clip bg-cream">
                          {SPLIT.map((s, i) => (
                            <div key={s.title} className="rounded-calc absolute inset-0 overflow-clip wbx-splitmedia" data-i={i}>
                              {s.video ? <Loop src={s.video} poster={s.poster!} /> : <img className="h-full w-full object-cover object-left-top" src={s.still} alt={s.alt} loading="lazy" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex flex-1 flex-col md:h-[200vh] md:max-w-370">
                    <div className="md:flex md:h-screen md:flex-wrap md:items-center">
                      <div className="flex w-full flex-col gap-20 md:gap-24">
                        <h2 className="type-display-28 md:type-display-60 text-balance">Ready before the ship is.</h2>
                        <p className="text-s-14 md:text-s-15 text-pretty text-black/55 wbx-body">
                          Seven things make a call ready, and each has an owner. Portlink shows who has done what,
                          48 hours before arrival, without a status meeting.
                        </p>
                      </div>
                    </div>
                    <div className="sticky top-0 hidden md:flex md:h-screen md:flex-col md:items-start md:justify-center md:gap-20 pointer-events-none -mt-[50svh]">
                      {SPLIT.map((s, i) => (
                        <button key={s.title} type="button" className="pointer-events-auto flex w-full cursor-pointer flex-col gap-20 text-left wbx-splititem" data-i={i}>
                          <span className="type-display-24 md:type-display-40">{s.title}</span>
                          <span className="overflow-hidden wbx-splitbody"><span className="text-s-14 md:text-s-15 text-pretty text-black/55 block">{s.body}</span></span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full py-(--padding-y) md:hidden">
                <div className="w-calc flex flex-col gap-40">
                  <h2 className="type-display-34 text-balance">Ready before the ship is.</h2>
                  <SplitTabs />
                </div>
              </div>
            </section>
          </section>

          {/* 4. Full-bleed picture with the big statement (Waabi "The technology behind Waabi"). */}
          <section id="technology" className="relative flex w-full flex-col">
            <section className="relative h-svh w-full overflow-clip px-24">
              <div className="relative h-full w-full">
                <div className="rounded-calc absolute inset-0 h-full w-full overflow-clip text-white">
                  <div className="absolute inset-0">
                    <img className="absolute inset-0 h-full w-full object-cover" src={`${V}/hero-D.jpg`} alt="" loading="lazy" />
                    <div className="absolute inset-0 bg-black/50" />
                  </div>
                  <div className="relative flex h-full w-full flex-col items-start justify-end gap-24 pb-40 md:gap-48 md:pb-105">
                    <div className="flex w-full justify-center">
                      <h2 className="w-calc text-[5.5rem] leading-[90%] tracking-[-0.22rem] md:text-[max(9rem,min(9vw,13rem))] md:tracking-[max(-0.6rem,min(-0.3vw,-0.52rem))] text-balance">
                        The record behind every call.
                      </h2>
                    </div>
                    <div className="w-calc flex justify-start">
                      <Action href="#f-seats" cta="explore-portlink-tech">See each seat</Action>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Three cards (Waabi World, Mixed Reality Testing, Waabi Driver). */}
            <section className="flex w-full gap-24 p-24 max-lg:flex-col">
              {CARDS.map((c) => (
                <div key={c.title} className="group flex-center aspect-[351/221] w-full overflow-clip rounded-[1.2rem] lg:aspect-[448/620]">
                  <a className="group/arrow group relative flex h-full w-full flex-col justify-end bg-black" href={c.href}>
                    <div className="absolute inset-0 h-full w-full object-cover ease-snappy transition-transform duration-500 group-hover:scale-120 opacity-80">
                      {c.video ? <Loop src={c.video} poster={c.poster!} /> : <img className="size-full object-cover object-left-top" src={c.still} alt="" loading="lazy" />}
                    </div>
                    <div className="relative z-2 px-28 pb-24 text-white md:px-48 md:pb-36 wbx-cardtext">
                      <div className="relative flex flex-col gap-4 md:gap-8">
                        <p className="type-text-11 md:type-text-12">{c.kicker}</p>
                        <h3 className="type-display-24 md:type-display-40 text-balance md:pr-50">{c.title}</h3>
                        <span className="flex-center size-32 rounded-full border-1 border-current/15 md:size-50 group-hover/arrow:bg-pink group-hover/arrow:border-current/0 absolute right-0 bottom-0 wbx-arrow" />
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </section>
          </section>

          {/* 6. Full-bleed photograph with copy on the left (Waabi "Setting new standards for AV safety"). */}
          <section className="relative min-h-svh w-full overflow-clip text-white">
            <div className="absolute inset-0 overflow-clip">
              <img className="h-full w-full object-cover" src={`${P}/fjord-cruise-1600.webp`} alt="A cruise ship in a Norwegian fjord" loading="lazy" />
              <div className="absolute inset-0 bg-linear-to-b from-black/50 to-transparent" />
            </div>
            <div className="relative z-2 px-40 py-60 md:p-103">
              <div className="w-calc">
                <div className="flex w-full flex-col items-start gap-24 md:max-w-525 md:gap-48">
                  <h2 className="type-display-34 md:type-display-80 text-pretty">Signed on one phone at departure.</h2>
                  <div className="whitespace-pre-line type-display-18 md:type-display-24 text-current/60 wbx-onphoto">
                    <span>The agent signs, then the ship signs. </span>
                    <span>The final account starts from <strong>what both signed</strong>, not from a spreadsheet sent the week after.</span>
                  </div>
                  <Action href={DEMO_HREF} cta="demo-portlink-departure">{DEMO_LABEL}</Action>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Tabs over a picture (Waabi "Trusted by": partners → seats). The live thing. */}
          <section id="f-seats" className="relative flex w-full flex-col">
            <section className="relative min-h-screen w-full overflow-clip bg-white py-[var(--padding-y)]">
              <div className="flex flex-col items-center gap-48 md:gap-96">
                <div className="w-calc flex gap-30 max-lg:flex-col md:gap-48 xl:gap-240">
                  <div className="flex flex-col gap-y-48">
                    <h2 className="type-display-34 md:type-display-80 text-balance">Each seat sees its own record.</h2>
                  </div>
                  <div className="max-lg:w-calc flex flex-col justify-end gap-30 lg:max-w-447 lg:gap-48 lg:pl-48">
                    <div className="whitespace-pre-line type-display-18 md:type-display-24 text-current/50 wbx-muted">
                      Pick a seat. The record keeps the same call and shows that seat the tabs it works in, by
                      the same rule the product uses.
                    </div>
                  </div>
                </div>
                <SeatLens image={`${H}/app-portcall.jpg`} />
              </div>
            </section>
          </section>

          {/* 8. Carousel (Waabi "Insights" → the day of one call). */}
          <section id="f-day" className="relative flex w-full flex-col relative w-full overflow-clip bg-cream py-(--padding-y)">
            <div className="flex flex-col gap-30 md:gap-48">
              <div className="w-calc grid grid-cols-2 gap-y-24 md:gap-y-48">
                <div className="order-1 md:col-span-2">
                  <h2 className="type-display-34 md:type-display-80 text-balance">The day of a call.</h2>
                </div>
                <div className="order-3 max-md:col-span-2 md:order-2">
                  <p className="type-text-14 md:type-text-15 text-balance text-black/50 wbx-muted">
                    One port call in Bergen, from readiness two days out to the final account at 21.00.
                  </p>
                </div>
                <div className="order-2 flex items-end gap-24 justify-self-end md:order-3">
                  <div className="flex items-center gap-8 md:gap-12">
                    <button type="button" aria-label="Previous" data-carousel="prev" className="flex-center size-32 rounded-full border-1 border-current/15 md:size-50 hover:bg-pink hover:border-current/0 hover:text-white wbx-arrow wbx-arrow-l" />
                    <button type="button" aria-label="Next" data-carousel="next" className="flex-center size-32 rounded-full border-1 border-current/15 md:size-50 hover:bg-pink hover:border-current/0 hover:text-white wbx-arrow" />
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-nowrap">
                <div className="px-calc flex snap-x snap-mandatory flex-nowrap gap-28 md:gap-24 wbx-track" data-carousel="track" tabIndex={0} aria-label="The day of a call">
                  {DAY.map((d) => (
                    <article key={d.time} className="group relative flex shrink-0 snap-start flex-col items-start justify-start gap-16 border-b border-current/15 pb-24 w-[calc(100vw-8rem)] md:w-450">
                      <div className="relative flex w-full flex-col items-start justify-start gap-12 md:gap-16">
                        <div className="rounded-calc relative w-full overflow-clip bg-current flex aspect-[295/221] items-center justify-center md:aspect-[448/336]">
                          <div className="ease-snappy relative h-full w-full transition-transform duration-500 group-hover:scale-110">
                            <img className="absolute h-full w-full object-cover object-left-top" src={d.src} alt="" loading="lazy" />
                          </div>
                        </div>
                        <div className="relative flex w-full flex-row flex-wrap items-center justify-start gap-16">
                          <div className="flex flex-wrap items-center gap-6">
                            {d.tags.map((t) => (
                              <div key={t} className="flex-center h-26 gap-6 shrink-0 rounded-[4rem] px-11 bg-[#DEDCD9] wbx-tag"><span className="type-text-10">{t}</span></div>
                            ))}
                          </div>
                          <span className="type-text-11 md:type-text-12 whitespace-nowrap text-current/50 wbx-muted">{d.time}</span>
                        </div>
                        <h3 className="type-display-18 md:type-display-24 max-w-600 text-current">{d.title}</h3>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 9. Closing statement over a collage (Waabi "Build Physical AI with us"). */}
          <section id="demo" className="relative flex w-full flex-col overflow-clip bg-white py-[var(--padding-y)] lg:min-h-screen">
            <div className="flex flex-col gap-65 md:gap-96">
              <div className="flex flex-col gap-32">
                <div className="flex w-full justify-center text-balance">
                  <h2 className="w-calc text-[5.5rem] leading-[90%] tracking-[-0.22rem] md:text-[max(9rem,min(9vw,13rem))] md:tracking-[max(-0.6rem,min(-0.3vw,-0.52rem))] text-balance">
                    Bring us your next call.
                  </h2>
                </div>
                <div className="w-calc flex gap-12">
                  <Action href={DEMO_HREF} cta="demo-portlink-close">{DEMO_LABEL}</Action>
                  <Action href="/embark/" cta="embark-portlink-close" light>Embark for tour operators</Action>
                </div>
              </div>
              <div className="relative flex w-full px-24">
                <div className="rounded-calc relative flex h-[35vw] w-full items-center overflow-clip">
                  <div className="absolute left-0 h-[17vw] w-[23vw]"><div className="size-full overflow-clip bg-gray-300">{img(`${P}/glacier-hike-800.webp`)}</div></div>
                  <div className="absolute left-[calc(calc(100%-(47vw+(39vw*0.5)+(31vw*0.5))))] h-[23vw] w-[31vw]"><div className="size-full overflow-clip bg-gray-300">{img(`${H}/app-chart.jpg`)}</div></div>
                  <div className="absolute left-[calc(calc(100%-(47vw+(39vw*0.5))))] h-[29vw] w-[39vw]"><div className="size-full overflow-clip bg-gray-300">{img(`${H}/app-voyage.jpg`)}</div></div>
                  <div className="absolute left-[calc(calc(100%-47vw))] h-[35vw] w-[47vw]"><div className="size-full overflow-clip bg-gray-300">{img(`${P}/fjord-cruise-1600.webp`)}</div></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="relative w-full overflow-clip">
        <div className="relative w-full bg-pink text-white lg:h-[60rem]">
          <div className="relative flex size-full flex-col justify-between gap-64 pt-60 pb-30 lg:gap-0 lg:pt-80 lg:pb-80">
            <div className="w-calc relative flex flex-col gap-30 lg:flex-row lg:justify-between lg:gap-0">
              <div className="flex w-full flex-col gap-30 lg:w-[68.4rem] lg:gap-32">
                <div className="flex flex-col gap-16">
                  <h2 className="text-[2.4rem] leading-[110%] tracking-[-0.072rem] text-balance md:max-w-[40%] md:text-[4rem] md:tracking-[-0.12rem]">One record for the whole call.</h2>
                  <p className="font-text text-[1.4rem] leading-[140%] tracking-[0.028rem] md:text-[1.5rem] md:tracking-[0.015rem]">
                    Photographs: Unsplash licence (fjord-cruise by Pascal Debrunner, sea-kayak by Brandon McDonald,
                    whale-safari by Francesco Ungaro, glacier-hike by Colin + Meg). Product images are Portlink.
                  </p>
                </div>
              </div>
              <div className="flex w-full flex-col gap-12 lg:w-[32.5rem] lg:gap-24">
                <div className="type-text-11 md:type-text-12 text-current/60">Portlink</div>
                <nav className="flex flex-col gap-4" aria-label="Footer">
                  <ul>
                    <li><Link className="type-display-20 inline-flex transition-colors hover:text-current/80" href="/">Home</Link></li>
                    <li><Link className="type-display-20 inline-flex transition-colors hover:text-current/80" href="/embark/">Embark</Link></li>
                    <li><Link className="type-display-20 inline-flex transition-colors hover:text-current/80" href={DEMO_HREF} data-cta="demo-portlink-footer">Book a demo</Link></li>
                  </ul>
                </nav>
              </div>
            </div>
            <div className="w-calc relative flex flex-col gap-30 lg:flex-row lg:items-end lg:justify-between lg:gap-0">
              <div className="order-1 flex h-[8rem] w-full items-center justify-start lg:order-2 lg:h-[14rem] lg:w-[52.6rem] lg:justify-end">
                <img src="/portlink-logo.png" alt="" className="wbx-footlogo" width={420} height={110} />
              </div>
              <div className="order-2 flex flex-col gap-8 lg:order-1">
                <div className="type-text-11 lg:type-text-11 md:type-text-12 text-current/60">© 2026 Portlink AS</div>
                <div className="type-text-11 lg:type-text-11 md:type-text-12 flex gap-12 lg:gap-24">
                  <Link href="/privacy/" className="transition-colors hover:text-current/80">Privacy</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
