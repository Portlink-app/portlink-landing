"""Verify the deployed preview can deliver the partial reads required by Chrome and Safari."""
import sys
from urllib.request import Request, urlopen

base=sys.argv[1].rstrip('/')
for product in ('portlink','embark'):
    for layout in ('','-portrait'):
        url=f'{base}/product-family/media/{product}-tour{layout}.mp4'
        head=Request(url,method='HEAD')
        with urlopen(head,timeout=10) as response:
            size=int(response.headers['Content-Length'])
        for request_range,start,end in [('100-199',100,199),('-32',size-32,size-1)]:
            with urlopen(Request(url,headers={'Range':'bytes='+request_range}),timeout=10) as response:
                expected=f'bytes {start}-{end}/{size}'
                if (response.status!=206 or response.headers['Content-Range']!=expected
                        or len(response.read())!=end-start+1):
                    raise ValueError(f'{product}{layout}: requested {expected} but got {response.status}')
        print(f'{product}{layout}: seekable')
