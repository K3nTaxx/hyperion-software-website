"""Prepare the folder that Netlify publishes (dist/).

Usage :  python tools/publish.py

1. builds the pages from src/ (same as tools/build.py) ;
2. copies only what the website needs into dist/ : the pages, css/, js/, assets/
   (never src/, tools/, the notes or the original logo kit) ;
3. checks that every image, font, style and script used by the pages exists in dist/ with the exact
   same name and case (Netlify runs on Linux, where "Logo.png" and "logo.png" are two different files).
   If something is missing, the build stops and Netlify keeps the previous version online.
"""
import glob
import io
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
FOLDERS = ('css', 'js', 'assets')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build  # noqa: E402


def exists_exact(rel):
    cur = DIST
    for p in [p for p in rel.split('/') if p and p != '.']:
        if p == '..':
            cur = os.path.dirname(cur)
            continue
        try:
            names = os.listdir(cur)
        except OSError:
            return False
        if p not in names:
            return False
        cur = os.path.join(cur, p)
    return True


def check():
    missing, count = set(), 0
    files = glob.glob(os.path.join(DIST, '*.html')) + glob.glob(os.path.join(DIST, 'css', '*.css')) + glob.glob(os.path.join(DIST, 'js', '*.js'))
    for path in files:
        rel_file = os.path.relpath(path, DIST).replace(os.sep, '/')
        with io.open(path, encoding='utf-8') as f:
            s = f.read()
        base = os.path.dirname(rel_file)
        refs = re.findall(r'''(?:src|href|content|poster)\s*=\s*["']([^"'#?]+)''', s)
        refs += re.findall(r'''url\(\s*["']?([^"')#?]+)''', s)
        refs += re.findall(r'''["']((?:assets|css|js)/[^"'?#\s]+)["']''', s)
        for ref in refs:
            ref = ref.strip()
            if not ref or re.match(r'^(https?:|mailto:|tel:|data:|//|#|javascript:)', ref) or '{' in ref or '+' in ref:
                continue
            if not re.search(r'\.[A-Za-z0-9]{2,5}$', ref):
                continue
            if rel_file.endswith('.js') and not ref.startswith('.'):
                target = ref  # paths written in the scripts are relative to the page
            else:
                target = os.path.normpath(os.path.join(base, ref)).replace(os.sep, '/')
            count += 1
            if not exists_exact(target):
                missing.add('%s -> %s' % (rel_file, ref))
    return count, sorted(missing)


def publish():
    build.build()
    if os.path.isdir(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST)
    pages = sorted(n for n in os.listdir(os.path.join(ROOT, 'src')) if n.endswith('.html'))
    for name in pages:
        shutil.copy2(os.path.join(ROOT, name), os.path.join(DIST, name))
    for folder in FOLDERS:
        shutil.copytree(os.path.join(ROOT, folder), os.path.join(DIST, folder))
    count, missing = check()
    if missing:
        for m in missing:
            print('MANQUANT (ou mauvaise casse) :', m)
        raise SystemExit('%d fichier(s) manquant(s) : publication annulée.' % len(missing))
    print('dist/ prêt : %d pages, %d fichiers vérifiés.' % (len(pages), count))


if __name__ == '__main__':
    publish()
