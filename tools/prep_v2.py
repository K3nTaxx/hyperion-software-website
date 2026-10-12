"""Assets for the light (v2) landing: logo variants, hardware cut-outs, real UI crops."""
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'assets')
OUT = os.path.join(A, 'img')

# AGS Next logo for light backgrounds: white strokes -> ink, yellow kept
ags = Image.open(os.path.join(OUT, 'ags-next.webp')).convert('RGBA')
a = np.asarray(ags).astype(np.int32)
white = (a[..., 0] > 200) & (a[..., 1] > 200) & (a[..., 2] > 200)
a[white, 0:3] = [14, 15, 18]
Image.fromarray(a.astype(np.uint8)).save(os.path.join(OUT, 'ags-next-ink.webp'), 'WEBP', quality=92)

# split the rack + RDO cartridge photo into two cut-outs
both = Image.open(os.path.join(OUT, 'appliances-rdo.webp')).convert('RGBA')
al = np.asarray(both)[..., 3]
cols = al.max(axis=0) > 10
xs = np.where(cols)[0]
gaps = [x for x in range(xs.min(), xs.max()) if not cols[x]]
rows = al.max(axis=1) > 10
# the two objects overlap in x range? use the vertical split instead (rack is on top)
ys = np.where(rows)[0]
ygaps = [y for y in range(ys.min(), ys.max()) if not rows[y]]
print('x gaps', len(gaps), 'y gaps', len(ygaps))
if ygaps:
    cut = ygaps[len(ygaps) // 2]
    rack = both.crop((0, 0, both.width, cut)); rdo = both.crop((0, cut, both.width, both.height))
else:
    cut = gaps[len(gaps) // 2]
    rack = both.crop((0, 0, cut, both.height)); rdo = both.crop((cut, 0, both.width, both.height))
rack = rack.crop(rack.getbbox()); rdo = rdo.crop(rdo.getbbox())
rack.save(os.path.join(OUT, 'rack.webp'), 'WEBP', quality=90)
rdo.save(os.path.join(OUT, 'rdo.webp'), 'WEBP', quality=90)
print('rack', rack.size, 'rdo', rdo.size)

# real UI crops (authentic product details)
ui = Image.open(os.path.join(A, 'hero', 'dataclone-interface.png')).convert('RGB')
crops = {
    'ui-stealth': (268, 68, 559, 171),
    'ui-veeam': (557, 68, 839, 171),
    'ui-honeypot': (268, 180, 559, 283),
}
for name, box in crops.items():
    c = ui.crop(box)
    c = c.resize((c.width * 2, c.height * 2), Image.LANCZOS)
    c.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=92)
dash = Image.open(os.path.join(A, 'hero', 'dashboard.png')).convert('RGB')
for name, box in {'ui-success': (462, 146, 1044, 438), 'ui-medias': (1088, 100, 1604, 360), 'ui-donut': (14, 98, 1066, 486)}.items():
    c = dash.crop(box)
    c.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=90)
print('done')

# tighten the dataclone UI card crops to the white card itself (corners rounded in CSS)
from scipy import ndimage
for name, box in crops.items():
    c = np.asarray(ui.crop(box)).astype(np.int32)
    m = c.min(axis=2) > 225
    lab, n = ndimage.label(m)
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    k = int(np.argmax(sizes)) + 1
    ys, xs = np.where(lab == k)
    x0, x1, y0, y1 = xs.min() + 3, xs.max() - 2, ys.min() + 3, ys.max() - 2
    card = ui.crop((box[0] + x0, box[1] + y0, box[0] + x1, box[1] + y1))
    card = card.resize((card.width * 2, card.height * 2), Image.LANCZOS)
    card.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=92)
    print(name, card.size)
med = dash.crop((1094, 106, 1598, 352))
med.save(os.path.join(OUT, 'ui-medias.webp'), 'WEBP', quality=90)
