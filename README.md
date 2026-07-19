# Image Color Picker · Dashboard Palette

A tiny, private, installable web app: **paste a screenshot → click a pixel → get the exact color code**, then generate a **dashboard-ready palette** from that one color (readable text color, contrast/complementary, and colors that go well with it). Everything runs in your browser — **no image is ever uploaded**.

Inspired by [imagecolorpicker.com](https://imagecolorpicker.com/), extended for building dashboards (Power BI / Lightdash).

Two tabs:

- **Pick** — pull an exact color out of a screenshot.
- **Studio** — build a full, contrast-checked, colorblind-checked dashboard palette around that color.

## Use it

1. Open the app (locally or the shared URL).
2. Take a screenshot — on **Mac, `⌘⌃⇧4`** copies a region to the clipboard.
3. Click the page and press **⌘V / Ctrl+V** — the image appears.
4. Hover to aim with the magnifier loupe, then **click** the pixel.
5. Copy any format (HEX / RGB / HSL / HSV / CMYK), read which text color is legible on it (WCAG), and grab the harmony swatches.
6. **Export** the palette as CSS variables, JSON, a **Theme JSON** (`dataColors` array — imports into Power BI and other BI tools), or a PNG strip.
7. In **Studio**, save palettes locally, copy a share link for an exact Studio setup, and export an **Accessibility report** for contrast and colorblind-review notes.

Other ways to load an image: drag-and-drop, **Upload image**, or paste an image URL. (URL images from other sites may be blocked from pixel reading by CORS — paste/upload always works.)

## Studio — the dashboard color wheel

Switch to the **Studio** tab. Your picked color becomes the **pinned anchor** (or type a HEX to design without a screenshot), and the tool builds the three palettes every BI tool needs:

| Palette | For |
| --- | --- |
| **Categorical** | series that are different in kind — channels, products, regions |
| **Sequential** | one measure low→high — heatmaps, conditional formatting |
| **Diverging** | a measure with a meaningful middle — variance vs target, YoY |

Everything is generated in **OKLCH**, a perceptually uniform color space, so evenly spaced swatches actually *look* evenly spaced — which is not true of HSL.

- **Wheel** — hue is the angle, chroma the radius, at the lightness on the slider. The contour line is the edge of what sRGB can actually display. The anchor node is pinned; **drag any other node** to rotate the harmony set and change its chroma. Pick the geometry with **Rule** (complementary, analogous, triadic, tetradic, split-complementary).
- **Contrast guard** — every swatch carries its WCAG rating against white or dark. `AAA` / `AA` / `AA+` (large text only) / `✕` (fails).
- **Colorblind** — simulate deuteranopia, protanopia or tritanopia. Swatches *and* the preview repaint, so you can see whether two series stay distinguishable. WCAG badges keep describing the real colors.
- **Live preview** — KPI cards, bars, lines, and a conditionally-formatted table, painted from the current palette. A swatch strip lies about legibility; a dashboard doesn't.
- **Accessibility report** — copy a plain-text report showing WCAG contrast for every categorical, sequential, and diverging swatch, plus warnings when categorical colors may collapse under deuteranopia, protanopia, or tritanopia simulation.
- **Save and share** — save palettes on this device with `localStorage`, or copy a URL hash that recreates the exact Studio setup for a teammate. No account or upload is involved.
- **Export** — CSS variables (`--cat-*`, `--seq-*`, `--div-*`), JSON, **Theme JSON** (`dataColors` for Power BI, named `sequential` / `diverging`, and BI roles such as `good`, `neutral`, `bad`, `minimum`, `center`, `maximum`), an Accessibility report, or a PNG of all three rows.

### Studio workflow

Use Studio as a dashboard palette workflow:

1. Pick or type the anchor color.
2. Tune rule, lightness, series count, background, and colorblind simulation.
3. Check the Accessibility report and live preview.
4. Save palettes locally when you want to return later.
5. Copy link to share an exact Studio setup.
6. Export Theme JSON for BI tools, or CSS/JSON/PNG for implementation notes.

### Color accuracy

The OKLab constants come from [Björn Ottosson's reference implementation](https://bottosson.github.io/posts/oklab/). Colorblind simulation follows **Viénot, Brettel & Mollon (1999)**, applied in linear RGB; the three simulation matrices are *derived at runtime* from the Smith & Pokorny cone fundamentals rather than hand-copied, and the inline self-check verifies them against the independently published matrices. A wrong color constant still "runs" — it just quietly shifts every color — so the self-check in the footer (`self-check n/n`, green) is the gate.

## Run locally

Just open `index.html` in a browser (double-click, or `file://`). The core tool works fully offline. Install/offline-cache (the PWA part) only activates on an `https` host — see below.

## Deploy for the team (free, public GitHub Pages)

1. Create a **public** GitHub repo and add these files at the root:
   `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `README.md`.
2. Push, then in the repo: **Settings → Pages → Source: Deploy from a branch → `main` / root → Save**.
3. Share the URL (e.g. `https://<you>.github.io/<repo>/`).

Nothing sensitive lives here (all processing is client-side), so a public repo is fine.

## How teammates "install" it

Open the URL in Chrome/Edge → click **⤓ Install app** (or the install icon in the address bar). It gets a Dock/taskbar icon, opens in its own window, and works offline. On recent macOS Safari: **File → Add to Dock**.

To ship an update: edit the files, bump `CACHE` in `sw.js` (currently `color-picker-v4`), and push — installed apps pick up the new version automatically.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app (inline CSS/JS): image loader, picker + loupe, color engine (RGB/HSL/OKLCH/WCAG/CVD), Studio wheel + palettes, preview, export. |
| `manifest.webmanifest` | PWA metadata so the browser offers "Install". |
| `sw.js` | Service worker; precaches the app shell for offline use. |
| `icon-192.png`, `icon-512.png` | App icons. |
| `tests/product-v2.test.js` | Lightweight static QA checks for the Studio v2 workflow. |
| `docs/archive/` | Historical product/spec artifacts that are no longer current root-level work. |

No build step, no dependencies.
