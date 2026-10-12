"""Assemble the site pages from src/ + shared partials (nav, footer, icons).

Usage :  python tools/build.py
Each page in src/ starts with <!--@page KEY--> (home | stealth | anssi | ...)
and uses the markers <!--@head-->, <!--@sprite-->, <!--@intro-->, <!--@nav-->, <!--@footer-->.
The generated pages are written at the project root (index.html, mode-stealth.html, ...).
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
PARTS = os.path.join(SRC, 'partials')

# which menu entry is highlighted on each page
PAGES = {
    'home':      {'section': 'home', 'current': None},
    'dataclone': {'section': 'dataclone', 'current': 'DATACLONE'},
    'vmware':    {'section': 'dataclone', 'current': 'VMWARE'},
    'exchange':  {'section': 'dataclone', 'current': 'EXCH'},
    'disque':    {'section': 'dataclone', 'current': 'DISQUE'},
    'surv':      {'section': 'dataclone', 'current': 'SURV'},
    'stealth':   {'section': 'cyber', 'current': 'STEALTH'},
    'airgap':    {'section': 'cyber', 'current': 'AIRGAP'},
    'rdo':       {'section': 'cyber', 'current': 'RDO'},
    'anssi':     {'section': 'cyber', 'current': 'ANSSI'},
    'dr':        {'section': 'cyber', 'current': 'DR'},
    'appl':      {'section': 'offres', 'current': 'APPL'},
    'saas':      {'section': 'offres', 'current': 'SAAS'},
    'cloud':     {'section': 'offres', 'current': 'CLOUD'},
    'pourquoi':  {'section': 'hyperion', 'current': 'POURQUOI'},
    'dattak':    {'section': 'hyperion', 'current': 'DATTAK'},
    'partners':  {'section': 'hyperion', 'current': 'PARTNERS'},
    'rentree':   {'section': 'hyperion', 'current': 'RENTREE'},
    'contact':   {'section': None, 'current': None},
    'rgpd':      {'section': None, 'current': None},
}

INTRO = '''  <div class="intro" id="intro" aria-hidden="true">
    <div class="intro-logo"><img src="assets/img/hyperion-logo.png" alt="" /></div>
  </div>
'''


def part(name):
    with open(os.path.join(PARTS, name), encoding='utf-8') as f:
        return f.read()


def nav_for(key):
    cfg = PAGES.get(key, {'section': None, 'current': None})
    html = part('nav.html')
    home = key == 'home'
    html = html.replace('{{HOME_HREF}}', '#top' if home else 'index.html')
    html = html.replace('{{HOME_ATTR}}', ' data-scroll-top' if home else '')
    html = html.replace('{{ACTIVE_HOME}}', ' is-active' if cfg['section'] == 'home' else '')
    for sec in ('dataclone', 'cyber', 'offres', 'hyperion'):
        html = html.replace('{{ACTIVE_%s}}' % sec.upper(), ' is-active' if cfg['section'] == sec else '')
        html = html.replace('{{OPEN_%s}}' % sec.upper(), ' open' if cfg['section'] == sec else '')
    for cur in set(c['current'] for c in PAGES.values() if c['current']):
        html = html.replace('{{CUR_%s}}' % cur, ' class="is-current" aria-current="page"' if cfg['current'] == cur else '')
    return html


def version(rel):
    # a short stamp from the file date, so browsers fetch the new CSS / JS after each change
    return str(int(os.path.getmtime(os.path.join(ROOT, rel))))


def build():
    stamps = {rel: version(rel) for rel in ('css/style.css', 'js/app.js', 'js/contact-config.js', 'js/intro3d.js')}
    for name in sorted(os.listdir(SRC)):
        if not name.endswith('.html'):
            continue
        with open(os.path.join(SRC, name), encoding='utf-8') as f:
            src = f.read()
        m = re.search(r'<!--@page (\w+)-->\n?', src)
        key = m.group(1) if m else ''
        out = src.replace(m.group(0), '') if m else src
        out = out.replace('<!--@head-->', part('head.html').rstrip('\n'))
        out = out.replace('<!--@sprite-->', part('sprite.html').rstrip('\n'))
        out = out.replace('<!--@intro-->', INTRO.rstrip('\n'))
        out = out.replace('<!--@nav-->', nav_for(key).rstrip('\n'))
        out = out.replace('<!--@footer-->', part('footer.html').rstrip('\n'))
        for rel, v in stamps.items():
            out = out.replace('"%s"' % rel, '"%s?v=%s"' % (rel, v))
        left = re.findall(r'<!--@\w+-->|\{\{\w+\}\}', out)
        if left:
            raise SystemExit('%s : marqueurs non remplacés %s' % (name, left))
        with open(os.path.join(ROOT, name), 'w', encoding='utf-8', newline='\n') as f:
            f.write(out)
        print('ok', name)


if __name__ == '__main__':
    build()
