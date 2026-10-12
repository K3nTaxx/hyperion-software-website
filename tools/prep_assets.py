"""Prepare optimised assets + the shield particle mask for the landing page."""
import base64, json, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'assets')
OUT = os.path.join(ROOT, 'assets', 'img')
os.makedirs(OUT, exist_ok=True)

# ---------- 1. Shield mask -> RLE classes for the particle system ----------
SCALE = 2
im = Image.open(os.path.join(A, 'brand', 'hyperion-shield.png')).convert('RGBA')
im = im.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
arr = np.asarray(im).astype(np.int32)
alpha = arr[..., 3]
mask = alpha > 110
r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
royal = (b > 170) & (g > 45)

yy, xx = np.mgrid[-5:6, -5:6]
disk = (xx ** 2 + yy ** 2) <= 25
opened = ndimage.binary_opening(mask, structure=disk)
lab, n = ndimage.label(opened)
sizes = ndimage.sum(opened, lab, range(1, n + 1))
cls = np.zeros(mask.shape, np.uint8)
nodes = []
for i, s in enumerate(sizes, start=1):
    comp = lab == i
    if s < 900:  # small blob -> constellation node
        cy, cx = ndimage.center_of_mass(comp)
        nodes.append((float(cx), float(cy), float(np.sqrt(s / np.pi))))
        cls[comp] = 4
    else:
        cls[comp & royal] = 1
        cls[comp & ~royal] = 2
cls[mask & ~opened] = 3  # thin network lines

H, W = cls.shape
flat = cls.reshape(-1)
runs = bytearray()
i = 0
while i < flat.size:
    c = flat[i]
    j = i
    while j < flat.size and flat[j] == c and j - i < 255:
        j += 1
    runs += bytes([int(c), j - i])
    i = j
counts = {k: int((cls == k).sum()) for k in range(5)}
print('mask', W, H, 'runs bytes', len(runs), 'counts', counts, 'nodes', len(nodes))
shield = {'w': W, 'h': H, 'rle': base64.b64encode(bytes(runs)).decode(),
          'nodes': [[round(x, 1), round(y, 1), round(rad, 1)] for x, y, rad in nodes]}
with open(os.path.join(ROOT, 'tools', 'shield_mask.json'), 'w') as f:
    json.dump(shield, f)
dbg = np.zeros((H, W, 3), np.uint8)
pal = {0: (5, 8, 15), 1: (40, 100, 255), 2: (70, 60, 200), 3: (150, 230, 255), 4: (255, 255, 255)}
for k, c in pal.items():
    dbg[cls == k] = c
Image.fromarray(dbg).resize((W * 2, H * 2), Image.NEAREST).save(os.path.join(ROOT, 'tools', 'shield_classes_debug.png'))

# ---------- 2. Logo variant for dark backgrounds (wordmark in white) ----------
logo = Image.open(os.path.join(A, 'brand', 'hyperion-logo.png')).convert('RGBA')
la = np.asarray(logo).astype(np.float32)
cols = np.where(la[..., 3].max(axis=0) > 20)[0]
# find the gap between shield and wordmark
gaps = [c for c in range(cols.min(), cols.max()) if la[:, c, 3].max() <= 20]
split = gaps[0] if gaps else 165
print('logo split column', split)
dark = la.copy()
dark[:, split:, 0:3] = 255  # wordmark -> white, alpha untouched
# lift the shield blues a little so they read on deep navy
sh = dark[:, :split, 0:3]
dark[:, :split, 0:3] = np.clip(sh * 1.0 + np.array([28, 50, 70]) * (dark[:, :split, 3:4] > 0), 0, 255)
Image.fromarray(dark.astype(np.uint8)).save(os.path.join(OUT, 'hyperion-logo-dark.png'))
logo.save(os.path.join(OUT, 'hyperion-logo.png'))
Image.open(os.path.join(A, 'brand', 'hyperion-shield.png')).save(os.path.join(OUT, 'hyperion-shield.png'))

# ---------- 3. Hardware photos: knock out the white background ----------
def knockout(path, out, maxw=1600):
    img = Image.open(path).convert('RGBA')
    if img.width > maxw:
        img = img.resize((maxw, round(img.height * maxw / img.width)), Image.LANCZOS)
    a = np.asarray(img).astype(np.int32)
    w = a[..., :3].min(axis=2)
    cand = w > 232
    lab, _ = ndimage.label(cand)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    # soft edge: distance-based feather + whiteness ramp near the background
    near = ndimage.binary_dilation(bg, iterations=2) & ~bg
    alpha = np.where(bg, 0, 255).astype(np.float32)
    ramp = np.clip((255 - w) / (255 - 200), 0, 1) * 255
    alpha[near] = np.minimum(alpha[near], ramp[near])
    alpha = ndimage.gaussian_filter(alpha, 0.6)
    a[..., 3] = np.minimum(a[..., 3], alpha.astype(np.int32))
    res = Image.fromarray(a.astype(np.uint8))
    bbox = res.getbbox()
    res = res.crop(bbox)
    res.save(out, 'WEBP', quality=88, method=6)
    print(out, res.size, os.path.getsize(out))

knockout(os.path.join(A, 'hero', 'appliances.png'), os.path.join(OUT, 'appliances.webp'))
knockout(os.path.join(A, 'hero', 'appliances-rdo.png'), os.path.join(OUT, 'appliances-rdo.webp'))

def towebp(path, out, maxw, q=86):
    img = Image.open(path)
    img = img.convert('RGBA') if img.mode in ('RGBA', 'LA', 'P') else img.convert('RGB')
    if img.width > maxw:
        img = img.resize((maxw, round(img.height * maxw / img.width)), Image.LANCZOS)
    if img.mode == 'RGBA':
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
    img.save(out, 'WEBP', quality=q, method=6)
    print(out, img.size, os.path.getsize(out))

towebp(os.path.join(A, 'hero', 'dashboard.png'), os.path.join(OUT, 'dashboard.webp'), 1600, 84)
towebp(os.path.join(A, 'hero', 'dataclone-interface.png'), os.path.join(OUT, 'dataclone-interface.webp'), 1343, 86)
for name in ['ags-next.webp', 'dataclone-2.webp', 'dataclone-365.png']:
    towebp(os.path.join(A, 'brand', name), os.path.join(OUT, os.path.splitext(name)[0] + '.webp'), 900, 90)
for f in sorted(os.listdir(os.path.join(A, 'clients'))):
    towebp(os.path.join(A, 'clients', f), os.path.join(OUT, 'client-' + os.path.splitext(f)[0] + '.webp'), 640, 90)
for f in sorted(os.listdir(os.path.join(A, 'icons'))):
    img = Image.open(os.path.join(A, 'icons', f)).convert('RGBA')
    img.thumbnail((192, 192), Image.LANCZOS)
    img.save(os.path.join(OUT, 'icon-' + f), optimize=True)
Image.open(os.path.join(A, 'brand', 'favicon.png')).save(os.path.join(OUT, 'favicon.png'))
