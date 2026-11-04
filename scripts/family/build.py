"""Compile product copy into the acquired homepage's section and grid markup."""
from pathlib import Path
from copy import deepcopy
from html import escape
from lxml import etree, html
import shutil
from content import PRODUCTS
from palette import stylesheet, adapt_reference

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'design-review/butter-baseline/site'
OUT=ROOT/'public/product-family'
source=html.fromstring((BASE/'index.html').read_bytes())
ASSETS='/product-family/assets/'
MEDIA='/product-family/media/'

def part(node,name):
    return node.xpath('.//*[contains(@class,"__'+name+'-sc-")]')[0]

def contents(node,fragment):
    for child in list(node): node.remove(child)
    node.text=None
    for child in html.fragments_fromstring(fragment):
        if isinstance(child,str): node.text=child
        else: node.append(child)

def write(node,text): contents(node,escape(text))

def section(name,anchor):
    el=deepcopy(part(source,name))
    el.set('id',anchor)
    return el

def picture(src,alt):
    return f'<img src="{MEDIA}{src}" alt="{escape(alt,quote=True)}" loading="lazy" decoding="async">'

def action(text,href,header=False):
    area='HeaderRight' if header else 'HomeHeroContent'
    el=deepcopy(part(part(source,area),'ButtonMain'))
    a=el.xpath('.//a')[0]
    a.attrib.clear(); a.set('href',href);write(part(a,'ButtonText'),text)
    return html.tostring(el,encoding='unicode')

def paragraphs(el,label,heading,body=''):
    write(el.xpath('.//p')[0],label)
    title=el.xpath('.//h2|.//h3')[0];write(title,heading)
    if body: title.addnext(html.fromstring('<p class="family-body">'+escape(body)+'</p>'))

def compile_page(key,p):
    doc=html.fromstring('<html lang="en"><head></head><body><main id="main" tabindex="-1"></main></body></html>')
    doc.find('body').set('data-product',key)
    head=doc.find('head')
    contents(head,f'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><link rel="icon" href="/icon-192.png"><title>{p["name"]} | {p["headline"]}</title><meta name="description" content="{p["description"]}"><link rel="stylesheet" href="{ASSETS}palette.css"><link rel="stylesheet" href="{ASSETS}butter.css"><link rel="stylesheet" href="{ASSETS}products.css"><script type="module" src="{ASSETS}keyring.js"></script><script defer src="{ASSETS}products.js"></script>')
    main=doc.xpath('//main')[0]
    nav=section('HeaderContainer','navigation');logo=part(nav,'HeaderLogo')
    contents(logo,f'<a class="wordmark" href="{"/" if key=="portlink" else "/embark/"}">{p["name"]}</a>')
    links=[('Features','#features'),('Walkthrough','#walkthrough'),(p['other'],p['other_url'])]
    menu=part(nav,'HeaderMenu')
    contents(menu,''.join(f'<li><a href="{url}">{name}</a></li>' for name,url in links))
    part(nav,'MenuToggleWrapper').drop_tree();part(nav,'HeaderDropdown').drop_tree()
    contents(part(nav,'HeaderRight'),action(p['cta'],p['contact'],header=True))
    main.append(nav)
    hero=section('HomeHeroMain','hero')
    for name in ['HomeHeroEventSource','HomeHeroFallback','HomeHero3DWrapper']:part(hero,name).drop_tree()
    hero.insert(0,html.fromstring(f'<div class="instrument" aria-hidden="true"><img src="{MEDIA}{key}-keyring.png" alt=""></div>'))
    write(hero.xpath('.//h1')[0],p['headline']);sub=part(hero,'HomeHeroSubcontent')
    write(sub.xpath('.//p')[0],p['intro']);sub.remove(part(sub,'ButtonMain'))
    sub.append(html.fromstring(action('Follow a departure' if key=='embark' else 'Follow a port call','#walkthrough')))
    main.append(hero)
    ticker=section('TickerSectionMain','roles')
    write(ticker.xpath('.//p')[0],'Built for the people behind the departure' if key=='embark' else 'The teams around a port call')
    contents(part(ticker,'TickerSectionLogosWrapper'),'<div class="roles">'+''.join('<span>'+r+'</span>' for r in p['roles'])+'</div>')
    main.append(ticker)
    statement=section('StatementTimelineMain','overview')
    write(statement.xpath('.//h2')[0],p['statement'])
    tl=part(statement,'TimelineContainer');contents(tl,'<div class="timeline">'+''.join(f'<span><b>{i:02}</b>{s[1]}</span>' for i,s in enumerate(p['steps'],1))+'</div>')
    film=html.fromstring(f'<div class="film-track"><figure><video playsinline muted controls preload="metadata" poster="{MEDIA}{key}-tour.jpg" aria-label="{p["name"]} sample-data product tour"><source src="{MEDIA}{key}-tour.mp4" type="video/mp4"></video><figcaption>Product tour · Scroll to advance or use the player controls · Sample data</figcaption></figure></div>')
    tl.addnext(film)
    main.append(statement)
    ext='jpg' if key=='embark' else 'png'
    def shot(i):return key+'-'+p['cards'][i][2]+'.'+ext
    lead=section('StoryOneMain','product');grid=lead.xpath('.//*[contains(@class,"__GridItemMain-")]')
    paragraphs(grid[0],p['lead'],p['lead_title'],p['detail'])
    part(grid[0],'StoryOneTextHalftone').drop_tree()
    contents(grid[1],'<figure class="screen">'+picture(shot(0),p['cards'][0][1])+'<figcaption>Product preview · Sample data</figcaption></figure>')
    main.append(lead)
    second=section('StoryTwoMain','trade');grid=second.xpath('.//*[contains(@class,"__GridItemMain-")]')
    contents(grid[0],'<figure class="photograph">'+picture('fjord.jpg','A mountain-lined fjord seen from the water')+'<figcaption>Icefjord by boat · Illustrative excursion</figcaption></figure>')
    paragraphs(grid[1],p['second'],p['second_title'],p['second_body']);main.append(second)
    story=section('StoryThreeMain','walkthrough');pin=part(story,'StoryThreePin')
    contents(pin,'<div class="story-head"><p class="iFhYZQ">An illustrative walkthrough</p><h2 class="gbMovY">'+p['story']+'</h2></div><div class="player"><div class="record-label">Ilulissat / Icefjord by boat</div>'+''.join(f'<div class="record" data-scene="{i}" {"" if i==0 else "hidden"}><small>{s[0]}</small><h3>{s[1]}</h3><p>{s[2]}<span>{s[3]}</span></p></div>' for i,s in enumerate(p['steps']))+'<nav aria-label="Walkthrough chapters">'+''.join(f'<button type="button" data-jump="{i}" aria-pressed="{str(i==0).lower()}">0{i+1} · {s[1]}</button>' for i,s in enumerate(p['steps']))+'</nav></div>');main.append(story)
    cards=section('FeatureCardsMain','features');paragraphs(cards,'Explore features',p['features'])
    for cta in cards.xpath('.//*[contains(@class,"__FeatureCardsCta-")]'): cta.drop_tree()
    for i,card in enumerate(cards.xpath('.//*[contains(@class,"__FeatureCardWrapper-")]')):
        media=part(card,'FeatureCardMedia');contents(media,picture(shot(i),p['cards'][i][0]+' product preview'))
        write(card.xpath('.//h3')[0],p['cards'][i][0]);write(card.xpath('.//p')[0],p['cards'][i][1])
    main.append(cards)
    high=section('FeaturesHighlightMain','network')
    grid=high.xpath('.//*[contains(@class,"__GridItemMain-")]')
    contents(grid[0],'<figure class="screen">'+picture(('embark-schedule.jpg' if key=='portlink' else 'portlink-calls.png'),'The other side of the Portlink network')+'</figure>')
    contents(grid[1],f'<p class="iFhYZQ">{p["bridge"]}</p><h2 class="gbMovY">{p["bridge_head"]}</h2><p class="family-body">{p["bridge_body"]}</p>'+action('Explore '+p['other'],p['other_url']))
    main.append(high)
    gallery=section('GalleryCarouselMain','gallery')
    paragraphs(gallery,'Product gallery','A closer look at the work.')
    slider=part(gallery,'CarouselSlider')
    slides=list(slider)
    for i,slide in enumerate(slides):
        if i>=4:slider.remove(slide);continue
        contents(slide,'<figure class="gallery-shot">'+picture(shot(i),p['cards'][i][0])+'<figcaption>'+p['cards'][i][0]+'</figcaption></figure>')
    btn=part(gallery,'ButtonMain');btn.drop_tree();main.append(gallery)
    detail=section('FeaturesSectionMain','field-notes')
    grid=detail.xpath('.//*[contains(@class,"__GridItemMain-")]')
    heading,description=(('Estimate and final account','Compare the agent’s estimate with the final costs while the call is still open.') if key=='portlink' else ('The guide’s departure sheet','Open the right departure on the quay, review the guest list and check people in as they arrive.'))
    contents(grid[0],f'<p class="iFhYZQ">In the detail</p><h2 class="gzrrIS">{heading}</h2><p class="family-body">{description}</p>')
    contents(grid[1],'<figure class="screen">'+picture(shot(2 if key=='portlink' else 3),heading)+'</figure>');main.append(detail)
    pair=section('DoubleBlockMain','products')
    grid=pair.xpath('.//*[contains(@class,"__GridItemMain-")]')
    for container,(name,asset,href,copy) in zip(grid,[
        ('Portlink','portlink-calls.png','/','For the cruise line and the destination team planning the call.'),
        ('Embark','embark-schedule.jpg','/embark/','For the local operator organising the tour and its departures.')]):
        contents(container,f'<a class="family-panel" href="{href}"><h3 class="haFPJS">{name} ↗</h3>'+picture(asset,name+' workspace')+f'<p>{copy}</p></a>')
    main.append(pair)
    close=section('BlockHighlightMain','access')
    grid=close.xpath('.//*[contains(@class,"__GridItemMain-")]')
    contents(grid[0],'<div class="end-photo">'+picture('fjord.jpg','Open water along the fjord')+'</div>')
    contents(grid[1],f'<p class="iFhYZQ">Talk with Portlink</p><h2 class="gzrrIS">{p["close"]}</h2>'+action(p['cta'],p['contact']))
    main.append(close)
    footer=section('FooterMain','footer');outer=part(footer,'ContainerMain')
    contents(outer,f'<div class="footer-links"><a href="/">Portlink</a><a href="/embark/">Embark</a><a href="{p["contact"]}">Contact</a><a href="https://portlink.app/privacy/">Privacy</a></div><div class="footer-mark">{p["name"]}</div><p>Portlink AS · Oslo, Norway</p>')
    main.append(footer)
    (OUT/(key+'.html')).write_bytes(html.tostring(doc,method='html',encoding='utf-8',doctype='<!doctype html>'))

if __name__=='__main__':
    fonts=next((BASE/'_next/static/css').glob('2836*.css')).read_text().replace('/_next/static/media/',ASSETS)
    (OUT/'assets/butter.css').write_text(fonts+'\n'+adapt_reference(source.xpath('//style')[0].text))
    (OUT/'assets/palette.css').write_text(stylesheet())
    for font in (BASE/'_next/static/media').glob('*.woff2'):shutil.copyfile(font,OUT/'assets'/font.name)
    shutil.copyfile(ROOT/'public/family/fjord-cruise.jpg',OUT/'media/fjord.jpg')
    for key,p in PRODUCTS.items():compile_page(key,p)
