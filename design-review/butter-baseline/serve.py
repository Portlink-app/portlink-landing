"""Serve the two private starting pages with Butter's captured client and styles."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

class Preview(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path
        if path in ("/", "/embark", "/embark/"):
            self.path = "/index.html"
        elif path in {"/product", "/pricing", "/blog", "/contact", "/terms-of-service"}:
            if self.headers.get("RSC") == "1":
                self.send_response(204)
            else:
                self.send_response(302)
                self.send_header("Location", "https://www.butter.video" + path)
            self.end_headers()
            return
        super().do_GET()

    def end_headers(self):
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.iubenda.com https://embeds.iubenda.com; style-src 'self' 'unsafe-inline' https://cdn.iubenda.com; img-src 'self' blob: data: https://images.prismic.io https://res.cloudinary.com https://cdn.iubenda.com; media-src 'self' blob: data: https://res.cloudinary.com; font-src 'self' data:; connect-src 'self' blob: data: https://www.gstatic.com/draco/ https://images.prismic.io https://res.cloudinary.com https://butter.prismic.io https://static.cdn.prismic.io https://cdn.iubenda.com; worker-src 'self' blob:; frame-src https://*.iubenda.com")
        super().end_headers()

if __name__ == "__main__":
    site = Path(__file__).resolve().parent / "site"
    ThreadingHTTPServer(("127.0.0.1", 5762), partial(Preview, directory=str(site))).serve_forever()
