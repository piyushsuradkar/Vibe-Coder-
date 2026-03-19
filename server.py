#!/usr/bin/env python3
"""
SIXSENSE — Premium Brand Website
Simple Python HTTP Server
Run: python server.py
Visit: http://localhost:8080
"""

import http.server
import socketserver
import os
import json
import urllib.parse
from pathlib import Path

PORT = 8080
BASE_DIR = Path(__file__).parent


class SixsenseHandler(http.server.SimpleHTTPRequestHandler):

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        routes = {
            "/":              "templates/index.html",
            "/cart":          "templates/cart.html",
            "/contact":       "templates/contact.html",
            "/product/clothing":    "templates/product.html",
            "/product/hats":        "templates/product.html",
            "/product/shoes":       "templates/product.html",
            "/product/sunglasses":  "templates/product.html",
            "/product/rings":       "templates/product.html",
            "/product/chains":      "templates/product.html",
        }

        if path in routes:
            self.serve_html(routes[path])
        elif path.startswith("/static/"):
            self.serve_static(path)
        elif path == "/api/contact" and self.command == "POST":
            pass
        else:
            self.serve_html("templates/index.html")

    def do_POST(self):
        if self.path == "/api/contact":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            data = urllib.parse.parse_qs(body.decode())
            print(f"\n📩 Contact Form Submission:")
            for k, v in data.items():
                print(f"   {k}: {v[0]}")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def serve_html(self, rel_path):
        file_path = BASE_DIR / rel_path
        if file_path.exists():
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(file_path.read_bytes())
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    def serve_static(self, path):
        file_path = BASE_DIR / path.lstrip("/")
        if file_path.exists():
            ext = file_path.suffix.lower()
            mime = {
                ".css":  "text/css",
                ".js":   "application/javascript",
                ".png":  "image/png",
                ".jpg":  "image/jpeg",
                ".ico":  "image/x-icon",
                ".svg":  "image/svg+xml",
                ".woff2": "font/woff2",
            }.get(ext, "application/octet-stream")
            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.end_headers()
            self.wfile.write(file_path.read_bytes())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        print(f"  [{self.address_string()}] {format % args}")


if __name__ == "__main__":
    os.chdir(BASE_DIR)
    with socketserver.TCPServer(("", PORT), SixsenseHandler) as httpd:
        print(f"""
╔══════════════════════════════════════╗
║       SIXSENSE — Server Running      ║
║   Visit: http://localhost:{PORT}       ║
║   Press Ctrl+C to stop               ║
╚══════════════════════════════════════╝
        """)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Server stopped.")
