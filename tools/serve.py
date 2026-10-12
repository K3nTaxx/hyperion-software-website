"""Small local server for the site that tells the browser never to keep old copies of the pages,
so every change (pages, styles, scripts, the 3D intro) shows up at the next visit.

Usage :  python tools/serve.py [port]      (default port 5520)
"""
import http.server
import os
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, *args):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5520
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    http.server.ThreadingHTTPServer(('127.0.0.1', port), NoCacheHandler).serve_forever()
