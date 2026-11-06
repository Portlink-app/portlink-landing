"""The shared excursion, drawn from each product's side of the exchange."""
from html import escape

DRAWINGS = {
    'ship': '<path d="M12 31h58l-8 11H24zM22 31V18h32l7 13M30 18v-7h12v7M29 24h4m5 0h4m5 0h4"/>',
    'request': '<path d="M23 8h26l9 9v28H23zM49 8v10h9M30 25h19m-19 7h15m-15 6h10"/>',
    'boat': '<path d="M9 32h62l-12 9H22zM27 32l5-15h17l9 15M36 22h9l4 7H34z"/>',
    'guide': '<circle cx="40" cy="14" r="7"/><path d="M24 42v-6c0-8 7-12 16-12s16 4 16 12v6M32 30l8 9 8-9"/>',
}

def handoff(product):
    stops = ([('ship','Cruise line'),('request','DMC'),('boat','Tour operator')] if product=='portlink'
             else [('request','DMC request'),('boat','Tour operator'),('guide','Guide on tour')])
    nodes = ''.join(f'<div class="handoff-stop" data-stop="{i}"><svg aria-hidden="true" viewBox="0 0 80 50">{DRAWINGS[kind]}</svg><span>{escape(label)}</span></div>' for i,(kind,label) in enumerate(stops))
    return f'<div class="handoff" role="group" aria-label="Participants in this example">{nodes}</div>'
