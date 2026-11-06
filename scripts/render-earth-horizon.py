"""Pre-render the halftone Earth horizon for the hero arrival card.

Usage: python3 scripts/render-earth-horizon.py src/assets/earth/earth-packed.webp src/assets/earth/earth-horizon.webp
Needs numpy and Pillow. Reads the packed texture (R = land, G = clouds)."""
import sys
import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
tex = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
th, tw, _ = tex.shape

W = 2000                     # output width; disc diameter = 0.84 W
D = int(W * 0.84); R = D / 2
H = int(W * 0.5)             # keep only the top half: a horizon arc
cx, cy = W / 2, R + (W - D) / 2  # disc centre in full-canvas coords

ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
nx = (xs + 0.5 - cx) / R
ny = (cy - (ys + 0.5)) / R
r2 = nx * nx + ny * ny
inside = r2 <= 1
nz = np.sqrt(np.clip(1 - r2, 0, 1))

# View centred on lat 8°N, lon 18°E (Africa / Europe at the top of the arc).
lat0, lon0 = np.radians(8), np.radians(18)
# Rotate view vector into world: tilt about x by lat0.
y_w = ny * np.cos(lat0) + nz * np.sin(lat0)
z_w = -ny * np.sin(lat0) + nz * np.cos(lat0)
lat = np.arcsin(np.clip(y_w, -1, 1))
lon = np.arctan2(nx, z_w) + lon0
u = ((lon / (2 * np.pi) + 0.5) % 1) * (tw - 1)
v = (0.5 - lat / np.pi) * (th - 1)
samp = tex[v.astype(int).clip(0, th - 1), u.astype(int).clip(0, tw - 1)]
land, clouds = samp[..., 0], samp[..., 1]
surface = np.clip((land - 0.12) / 0.6, 0, 1) * 0.92 + np.clip((clouds - 0.5) / 0.45, 0, 1) * 0.18 + 0.05

# Light from upper left, plus limb darkening.
light = np.clip(0.25 + 0.75 * (nx * -0.35 + ny * 0.55 + nz * 0.76), 0, 1)
tone = surface * light * (0.18 + 0.82 * nz ** 0.4)
tone = np.where(inside, tone, 0)

# Halftone: dots on a 45° grid, radius from tone.
cell = 9.0
a = np.radians(45)
gx = (xs * np.cos(a) - ys * np.sin(a)) / cell
gy = (xs * np.sin(a) + ys * np.cos(a)) / cell
fx, fy = gx - np.round(gx), gy - np.round(gy)
dist = np.sqrt(fx * fx + fy * fy)
radius = 0.62 * np.sqrt(np.clip(tone, 0, 1))
dots = np.clip((radius - dist) * cell, 0, 1)  # ~1px antialias

# Faint base fill so the sea reads as a sphere, and a red rim + outer glow.
rr = np.sqrt(r2)
base = np.where(inside, 0.05 + 0.05 * nz, 0)
rim = np.exp(-((rr - 1) / 0.012) ** 2) * 0.9
glow = np.where(rr > 1, np.exp(-(rr - 1) / 0.05), 0) * 0.45
inner_rim = np.where(inside, np.exp(-(1 - rr) / 0.04), 0) * 0.35

bone = np.array([238, 230, 216], np.float32) / 255
red = np.array([230, 36, 41], np.float32) / 255
col_a = dots + base
rgb = bone[None, None] * (dots + base)[..., None] + red[None, None] * (rim + glow + inner_rim)[..., None]
alpha = np.clip(col_a + rim + glow + inner_rim, 0, 1)
rgb = np.where(alpha[..., None] > 0, rgb / np.maximum(alpha[..., None], 1e-4), 0)
img = np.dstack([np.clip(rgb, 0, 1), alpha])
Image.fromarray((img * 255).astype(np.uint8), 'RGBA').save(out, 'WEBP', quality=72, method=6)
print(out, W, H)
