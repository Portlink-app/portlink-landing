"""Loopback server for the two private product review routes."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
from urllib.parse import urlsplit

class Preview(SimpleHTTPRequestHandler):
    def send_head(self):
        route = urlsplit(self.path).path
        if route in {"/", "/embark", "/embark/"}:
            name = "portlink" if route == "/" else "embark"
            self.path = f"/product-family/{name}.html"
        self.range_length = None
        if route.endswith(".mp4"):
            file = Path(self.translate_path(route))
            requested = self.headers.get("Range")
            if requested and file.is_file():
                size = file.stat().st_size
                match = re.fullmatch(r"bytes=(\d*)-(\d*)", requested)
                if match and any(match.groups()):
                    first,last=match.groups()
                    start=int(first) if first else max(0,size-int(last))
                    end=min(size-1,int(last)) if first and last else size-1
                    if start <= end < size:
                        stream=file.open("rb")
                        stream.seek(start)
                        self.range_length=end-start+1
                        self.send_response(206)
                        self.send_header("Content-Type","video/mp4")
                        self.send_header("Content-Range",f"bytes {start}-{end}/{size}")
                        self.send_header("Content-Length",str(self.range_length))
                        self.end_headers()
                        return stream
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return None
        return super().send_head()

    def copyfile(self, source, output):
        if self.range_length is None:
            return super().copyfile(source, output)
        remaining = self.range_length
        while remaining:
            block = source.read(min(65536, remaining))
            if not block:
                break
            output.write(block)
            remaining -= len(block)

    def end_headers(self):
        if urlsplit(self.path).path.endswith(".mp4"):
            self.send_header("Accept-Ranges", "bytes")
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'")
        super().end_headers()

if __name__ == "__main__":
    public = Path(__file__).resolve().parents[2] / "public"
    ThreadingHTTPServer(("127.0.0.1", 5762), partial(Preview, directory=str(public))).serve_forever()
