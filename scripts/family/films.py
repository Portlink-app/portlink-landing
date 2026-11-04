"""Render sample-data product tours as seekable, silent H.264 clips."""
from pathlib import Path
import subprocess
from PIL import Image,ImageDraw,ImageFont,ImageOps
from content import PRODUCTS
from palette import COLORS
DEST=Path(__file__).resolve().parents[2]/'public/product-family/media'
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'
HEADER=ImageFont.truetype(FONT,34)
LABEL=ImageFont.truetype(FONT,17)
for key,p in PRODUCTS.items():
    output=DEST/(key+'-tour.mp4')
    enc=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1024x600','-r','24','-i','-','-an','-c:v','libx264','-crf','21','-g','6','-pix_fmt','yuv420p','-movflags','+faststart',str(output)],stdin=subprocess.PIPE)
    previous=None
    for i,(name,desc,asset) in enumerate(p['cards']):
        original=Image.open(DEST/(key+'-'+asset+('.jpg' if key=='embark' else '.png'))).convert('RGB')
        for f in range(48):
            canvas=Image.new('RGB',(1024,600),COLORS['surface-3'])
            draw=ImageDraw.Draw(canvas)
            draw.text((35,19),p['name']+'    /    Product tour',font=LABEL,fill=COLORS['accent'])
            draw.text((35,44),name,font=HEADER,fill=COLORS['text-1'])
            draw.text((992,39),f'0{i+1} / 04',font=LABEL,fill=COLORS['text-2'],anchor='ra')
            scale=1+.052*(f/47)
            img=ImageOps.contain(original,(int(940*scale),int(418*scale)))
            stage=Image.new('RGB',(940,418),COLORS['surface-2'])
            stage.paste(img,((940-img.width)//2,(418-img.height)//2));canvas.paste(stage,(42,100))
            draw.text((42,542),desc,font=LABEL,fill=COLORS['text-1'])
            draw.line((42,579,982,579),fill=COLORS['edge-1'],width=3)
            draw.line((42,579,42+940*(i*48+f)/191,579),fill=COLORS['accent'],width=3)
            if previous is not None and f<6: canvas=Image.blend(previous,canvas,(f+1)/6)
            enc.stdin.write(canvas.tobytes())
            if i==0 and f==0:canvas.save(DEST/(key+'-tour.jpg'),quality=87)
            if f==47:previous=canvas
    enc.stdin.close()
    if enc.wait():raise RuntimeError(output)
