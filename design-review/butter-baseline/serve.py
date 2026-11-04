"""Loopback server for the two private product review routes."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

class Preview(SimpleHTTPRequestHandler):
    def send_head(self):
        route = urlsplit(self.path).path
        if route in {"/", "/embark", "/embark/"}:
            name = "portlink" if route == "/" else "embark"
            self.path = f"/product-family/{name}.html"
        return super().send_head()

    def end_headers(self):
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'")
        super().end_headers()

if __name__ == "__main__":
    public = Path(__file__).resolve().parents[2] / "public"
    ThreadingHTTPServer(("127.0.0.1", 5762), partial(Preview, directory=str(public))).serve_forever()
