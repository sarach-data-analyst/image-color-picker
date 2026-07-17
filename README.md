# Image Color Picker · Dashboard Palette

A tiny, private, installable web app: **paste a screenshot → click a pixel → get the exact color code**, then generate a **dashboard-ready palette** from that one color (readable text color, contrast/complementary, and colors that go well with it). Everything runs in your browser — **no image is ever uploaded**.

Inspired by [imagecolorpicker.com](https://imagecolorpicker.com/), extended for building dashboards (Power BI / Lightdash).

## Use it

1. Open the app (locally or the shared URL).
2. Take a screenshot — on **Mac, `⌘⌃⇧4`** copies a region to the clipboard.
3. Click the page and press **⌘V / Ctrl+V** — the image appears.
4. Hover to aim with the magnifier loupe, then **click** the pixel.
5. Copy any format (HEX / RGB / HSL / HSV / CMYK), read which text color is legible on it (WCAG), and grab the harmony swatches.
6. **Export** the palette as CSS variables, JSON, a **Power BI theme** (`dataColors`), or a PNG strip.

Other ways to load an image: drag-and-drop, **Upload image**, or paste an image URL. (URL images from other sites may be blocked from pixel reading by CORS — paste/upload always works.)

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

To ship an update: edit the files, bump `CACHE` in `sw.js` (e.g. `color-picker-v2`), and push — installed apps pick up the new version automatically.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app (inline CSS/JS): image loader, picker + loupe, color engine, palette, export. |
| `manifest.webmanifest` | PWA metadata so the browser offers "Install". |
| `sw.js` | Service worker; precaches the app shell for offline use. |
| `icon-192.png`, `icon-512.png` | App icons. |

No build step, no dependencies.
