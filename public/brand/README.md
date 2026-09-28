# Brand assets

Visual assets for the **AI Content Repurposer** product listing (Whop App Store).

## Files

| File | Size | Purpose |
| --- | --- | --- |
| `icon.svg` / `icon.png` | 512x512 (square) | App / product **icon** — the "upload picture" in the Whop dashboard. |
| `banner.svg` / `banner.png` | 1600x400 (4:1) | Wide **banner / cover** image for the product listing. |

The `.svg` files are the source of truth (vector, crisp at any size). The `.png` files are pre-rasterized exports ready to upload directly.

## Recommended Whop upload sizes

- **Icon / upload picture:** 512x512, square. Whop displays it rounded, so the design keeps its motif centered.
- **Banner / cover:** 1600x400, wide (4:1 aspect ratio).

## Design notes

- Motif: the app's lightning bolt (⚡ "Repurpose AI").
- Concept: one input fanning out into five output formats — Tweet, X Thread, LinkedIn, Instagram, Newsletter.
- Palette: blue-to-violet accent gradient (`#3b82f6` → `#8b5cf6`) on a dark background, chosen to read clearly on Whop's dark UI.
- Tagline (banner): "Turn one idea into a week of content."

## Re-exporting the SVGs to PNG

The PNGs in this folder were generated with [`sharp`](https://sharp.pixelplumbing.com/). To regenerate after editing an SVG:

```bash
npm install --no-save sharp
node -e "
const sharp = require('sharp');
(async () => {
  await sharp('public/brand/icon.svg',   { density: 288 }).resize(512, 512).png().toFile('public/brand/icon.png');
  await sharp('public/brand/banner.svg', { density: 144 }).resize(1600, 400).png().toFile('public/brand/banner.png');
})();
"
```

Any SVG-capable tool works too, for example:

```bash
rsvg-convert -w 512  -h 400  icon.svg   -o icon.png
rsvg-convert -w 1600 -h 400  banner.svg -o banner.png
# or
inkscape icon.svg   --export-type=png --export-filename=icon.png   -w 512  -h 512
inkscape banner.svg --export-type=png --export-filename=banner.png -w 1600 -h 400
```

> Note: the SVGs use plain vector shapes and system fonts (Arial/Helvetica) with no emoji glyphs, so they rasterize identically across renderers.
