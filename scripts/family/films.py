"""Render the same three editorial beats in landscape and portrait."""
from functools import lru_cache
from pathlib import Path
import os
import subprocess
import textwrap

from PIL import Image, ImageDraw, ImageFont, ImageOps
from palette import COLORS as C
from film_story import STORIES, BEAT

DEST = Path(__file__).resolve().parents[2] / 'public/product-family/media'
FPS = 24

@lru_cache
def font(size, bold=False):
    name = 'Arial Bold.ttf' if bold else 'Arial.ttf'
    return ImageFont.truetype('/System/Library/Fonts/Supplemental/' + name, size)

def fit_text(draw, text, size, width):
    while draw.textlength(text, font=font(size, True)) > width:
        size -= 1
    return font(size, True)

def smooth(n):
    n = max(0, min(1, n))
    return n*n*(3-2*n)

def render(product, portrait):
    w,h = (640,880) if portrait else (1200,768)
    pad = 34 if portrait else 54
    name = product + '-tour' + ('-portrait' if portrait else '')
    temp = DEST / (name+'.pending.mp4')
    command = ['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24',
               '-s',f'{w}x{h}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-threads','3',
               '-crf','19','-g','8','-pix_fmt','yuv420p','-movflags','+faststart',str(temp)]
    with subprocess.Popen(command, stdin=subprocess.PIPE) as encoder:
        for index,(asset,title,detail,meta,caption,roi) in enumerate(STORIES[product]):
            ext = 'png' if product=='portlink' else 'jpg'
            screen = Image.open(DEST/f'{product}-{asset}.{ext}').convert('RGB')
            # A held result and a single move into the supporting screen for each cut.
            base = Image.new('RGB',(w,h),C['surface-2'])
            draw=ImageDraw.Draw(base)
            mark=Image.open(DEST.parents[1]/'portlink-logo.png').convert('RGBA')
            mark.thumbnail((126,34),Image.Resampling.LANCZOS)
            base.paste(mark,(pad,30),mark)
            if product=='embark':
                draw.text((pad+mark.width+15,35),'/ Embark',font=font(24),fill=C['brand'])
            draw.text((w-pad,38),f'0{index+1} / 03',font=font(22),fill=C['accent'],anchor='ra')
            draw.line((pad,80,w-pad,80),fill=C['edge-1'],width=2)
            draw.text((pad,105),title,font=font(26),fill=C['accent'])
            draw.text((pad,148),detail,font=fit_text(draw,detail,63 if portrait else 74,w-2*pad),fill=C['text-1'])
            draw.text((pad,239),meta,font=fit_text(draw,meta,25 if portrait else 30,w-2*pad),fill=C['text-2'])
            top=308
            bottom=585 if portrait else 534
            draw.rounded_rectangle((pad,top,w-pad,bottom),radius=15,fill=C['surface-1'])
            caption_y=bottom+30
            lines=textwrap.wrap(caption,36 if portrait else 71)
            draw.multiline_text((pad,caption_y),'\n'.join(lines),font=font(27 if portrait else 28),spacing=7,fill=C['text-1'])
            width,height=w-2*pad-24,bottom-top-24
            diagram=None
            if product=='embark' and asset=='schedule' and index==1:
                # Resolve the capacity cell into a countable boat manifest at phone scale.
                diagram=Image.new('RGB',(width,height),C['surface-1'])
                pen=ImageDraw.Draw(diagram)
                unit=min(width//9,height//4)
                gap=unit//4
                left=(width-(6*unit+5*gap))//2
                top_row=(height-2*unit-gap)//2
                for seat in range(12):
                    x=left+(seat%6)*(unit+gap)
                    y=top_row+(seat//6)*(unit+gap)
                    pen.rounded_rectangle((x,y,x+unit,y+unit),radius=unit//4,
                                          fill=C['accent'] if seat<5 else C['surface-2'],
                                          outline=C['accent'] if seat<5 else C['text-2'],width=2)
                    if seat<5:
                        pen.line([(x+unit*.24,y+unit*.49),(x+unit*.43,y+unit*.67),
                                  (x+unit*.77,y+unit*.32)],fill=C['surface-1'],width=max(2,unit//14))
            for frame in range(BEAT*FPS):
                phase=smooth((frame/FPS-.35)/1.65)
                # Reach the editorial crop, then hold it still long enough to read.
                box=tuple(round((v0+(v1-v0)*phase)*dim) for v0,v1,dim in
                          zip((0,0,1,1),roi,(screen.width,screen.height)*2))
                excerpt=ImageOps.contain(screen.crop(box),(width,height),Image.Resampling.LANCZOS)
                image=base.copy()
                image.paste(excerpt,((w-excerpt.width)//2,top+(height+24-excerpt.height)//2))
                if diagram is not None and frame>=2*FPS:
                    origin=(pad+12,top+12)
                    box=(origin[0],origin[1],origin[0]+width,origin[1]+height)
                    mix=smooth((frame/FPS-2)/.45)
                    image.paste(Image.blend(image.crop(box),diagram,mix),origin)
                ink=ImageDraw.Draw(image)
                for beat in range(3):
                    left=pad+beat*(w-2*pad)/3
                    right=left+(w-2*pad)/3-5
                    ink.line((left,h-25,right,h-25),fill=C['edge-1'],width=4)
                    progress=1 if beat<index else frame/(BEAT*FPS-1) if beat==index else 0
                    if progress:ink.line((left,h-25,left+(right-left)*progress,h-25),fill=C['accent'],width=4)
                encoder.stdin.write(image.tobytes())
                if index==0 and frame==0:
                    image.save(DEST/(name+'.jpg'),quality=90)
        encoder.stdin.close()
        if encoder.wait():raise RuntimeError(name)
    os.replace(temp,DEST/(name+'.mp4'))

if __name__=='__main__':
    for product in STORIES:
        for portrait in (False,True):
            render(product,portrait)
