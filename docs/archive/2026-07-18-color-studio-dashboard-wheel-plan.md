# Color Studio — dashboard color wheel (spec + build plan)

**Date:** 2026-07-18
**Status:** approved design, not yet built
**Target repo:** `~/Desktop/image-color-picker/` (standalone public PWA — NOT this juzmatch repo)
**Live tool:** https://sarach-data-analyst.github.io/image-color-picker/
**Related:** `docs/superpowers/specs/2026-07-17-image-color-picker-tool-prd.md` (the original picker PRD)

> **How to run this later.** This session could not reach the tool repo (it sits outside the
> workspace sandbox root). Build it by relaunching Claude Code from inside the repo:
> ```
> cd ~/Desktop/image-color-picker && claude
> ```
> Then point it at this file. The very first build step is **read the real `index.html`** and
> reconcile the integration notes below against the actual `Color` module, export map, tab markup,
> and self-check — do not trust remembered variable names.

---

## 1. Why

The tool already pixel-picks a real color out of a screenshot (a brand blue, a stakeholder deck).
Canva's color wheel is a general-purpose toy that ignores that context. We want a color wheel
**for dashboard designers**: take the picked color as a locked anchor and build a *working,
contrast-safe, colorblind-safe* dashboard palette around it — the categorical / sequential /
diverging sets every BI tool needs, previewed on a real mini-dashboard.

Locked scope (user chose this over the phased option): **full designer vision** — all six pieces below.

## 2. Where it lives

A second tab in the existing single-file app: **`Pick` | `Studio`**.

- The color pixel-picked on the `Pick` tab flows into `Studio` as the pinned anchor.
- `Studio` also accepts a typed/pasted HEX so you can design without a screenshot.
- One `index.html`, one URL, one PWA install. No new repo, no build step, no dependencies.

## 3. Layout

```
┌ Pick | Studio ────────────────────────────────────────────┐
│  ┌── WHEEL ──────────┐   Categorical  ●●●●●  [– 5 +]        │
│  │   ◉ ← brand (pin) │   Sequential   ▁▃▅▇█  [– 5 +]        │
│  │  ◐    ◑    ◒      │   Diverging    █▅▁▅█  [– 7 +]        │
│  │  (drag nodes)     │   ──────────────────────────────    │
│  └───────────────────┘   Contrast vs [⬜white ⬛dark]:      │
│  Lightness ▔▔▔●▔▔  Rule  │   ●AA✓AAA✗  ●AA✓  ●fail⚠         │
│  [Complementary ▾]       │   Colorblind: (off) deut prot trit│
│  ┌─ live mini-dashboard preview (repaints under CVD) ─────┐ │
│  │ [KPI] [KPI]   ▮▮▮▮ bars   ╱╲ lines   ▦ table+scale     │ │
│  └────────────────────────────────────────────────────────┘ │
│  Export:  Copy CSS · JSON · Theme JSON · PNG                 │
└──────────────────────────────────────────────────────────────┘
```

Single column, stacked, on mobile (wheel → palettes → contrast/CVD → preview → export).

## 4. Components

### 4.1 Color engine (extend the existing `Color` module)

Add pure, self-tested functions alongside the current RGB/HEX/HSL/HSV/CMYK/WCAG math:

- **`srgbToOklch(hex|rgb)` / `oklchToSrgb({L,C,H})`** via linear-sRGB ↔ OKLab ↔ OKLCH.
  - Gamma decode sRGB → linear, apply the OKLab forward matrix, cube-root, apply the second matrix
    to get `L,a,b`; `C=hypot(a,b)`, `H=atan2(b,a)` in degrees. Inverse reverses it.
  - **Constants must come from a canonical source, not memory.** Use Björn Ottosson's published
    OKLab matrices (or mirror the `culori` implementation). Reference values (to be verified against
    source during build):
    - forward `l = 0.4122214708 r + 0.5363325363 g + 0.0514459929 b` (and the m, s rows),
      then `L = 0.2104542553 l' + 0.7936177850 m' − 0.0040720468 s'` (and a, b rows).
    - A wrong constant still "runs" but shifts every color subtly — the round-trip self-check
      (§4.5) is the guard; it must pass before anything else is trusted.
- **`clampToGamut({L,C,H})`** — reduce `C` (binary search) until the color falls inside sRGB.
  Needed because many `L,H` + high `C` combos leave the gamut.

### 4.2 Palette generators (in OKLCH, anchored on the picked color)

- **`categorical(anchor, n)`** — n hues evenly spaced around the wheel at the anchor's L and C,
  each gamut-clamped. **Nudge L slightly across steps** (e.g. ±a few % zig-zag) so hues stay
  visually distinct — a flat equal-L set can read muddy or too similar at some anchor lightnesses.
- **`sequential(anchor, n)`** — fix H at the anchor's hue; ramp L light→dark; let C peak mid-ramp
  and taper at the ends (looks more natural than constant C).
- **`diverging(anchorA, anchorB, n)`** — two `sequential` arms (anchor hue + a chosen second hue,
  default its complement) meeting at a light near-neutral center. n odd → shared center.
- **Harmony nodes** for the wheel — complementary / analogous / triadic / tetradic / split-complementary
  as hue offsets (180 / ±30 / ±120 / 90-square / 180±30) applied in OKLCH, gamut-clamped.

### 4.3 Interactive wheel (canvas)

- Hue = angle, chroma = radius, at a **Lightness slider** value. Render the OKLCH slice to a canvas
  (per-pixel is fine for a small wheel; cache the image and only redraw on lightness change).
- Draggable nodes = the current harmony set. The **anchor node is pinned** (brand color); dragging
  any node rotates/repositions the whole harmony set relative to the anchor per the selected rule.
- A **Rule** dropdown switches the harmony geometry. Node positions drive the categorical seed and
  the palette rows update live.
- Loupe/coordinate math can reuse patterns from the existing `Pick` canvas picker.

### 4.4 Contrast guard + colorblind

- **Contrast:** background selector (white default + a dark option). Each palette swatch shows its
  WCAG ratio vs the background with an AA/AAA pass/fail badge (reuse the existing WCAG contrast fn).
- **Colorblind:** off / deuteranopia / protanopia / tritanopia toggle. When on, re-render swatches
  **and the mini-dashboard** through a CVD simulation matrix.
  - **Use canonical CVD matrices (Brettel 1997 or Machado 2009), pulled from a published source —
    do not hand-type coefficients from memory.** These are exactly the numbers that look right and
    are wrong. Cite the source in a code comment.

### 4.5 Mini-dashboard preview

Small HTML/SVG cockpit repainted live from the current palette (and through the CVD matrix when on):
- 2 KPI cards (categorical[0], [1])
- a 4–5 bar chart (categorical)
- a 2-line chart (categorical)
- a small table with one column conditionally formatted by the **sequential** ramp

Purpose: a swatch strip lies about legibility; a dashboard doesn't.

### 4.6 Exports (reuse existing plumbing)

- Grow **Theme JSON** to carry `dataColors` (categorical) plus named `sequential` and `diverging`
  arrays, alongside the existing name/background/foreground keys — still imports into Power BI et al.
- CSS variables: emit `--cat-1..n`, `--seq-1..n`, `--div-1..n`.
- Keep JSON + PNG. PNG swatch export should include all three palette rows.

### 4.7 Self-check (extend the inline block; bump the footer count)

Add assertions:
- OKLCH round-trip: `srgbToOklch → oklchToSrgb` within a small ΔE / per-channel tolerance for a set
  of known hexes.
- Anchors: white → L ≈ 1, black → L ≈ 0.
- `clampToGamut` output always in sRGB [0,1].
- `categorical(anchor, n)` returns n colors within a target perceived-lightness band (not identical).
- Known WCAG pairs: white/black ratio = 21; a mid pair matches an expected value.

## 5. Build order (milestones)

1. **Read real `index.html`**; map the actual `Color` module, export map, tab/section markup, and
   self-check block. Reconcile every integration note above with real names.
2. **Engine:** OKLCH convert + gamut clamp, with self-check round-trip passing first. *Nothing visual
   until this passes.*
3. **Palette generators** (categorical / sequential / diverging / harmony) + their self-checks.
4. **Studio tab shell** + anchor wiring from `Pick` + HEX input. Render the three palette rows as
   static swatches from the anchor (no wheel yet) to validate generators end-to-end in the browser.
5. **Interactive wheel** (canvas render + draggable harmony nodes + lightness slider + rule dropdown).
6. **Contrast guard** badges.
7. **Colorblind** toggle (swatches + preview) with canonical matrices.
8. **Mini-dashboard preview.**
9. **Exports** grown to include the three palettes.
10. **PWA cache bump** (`CACHE` in `sw.js`) so installed clients update; update `README.md`.
11. **Deploy:** commit + push to `main` of the tool repo; confirm Pages build; verify live in a fresh
    tab (buttons, self-check count, wheel drag, contrast/CVD toggles).

## 6. Acceptance criteria

- Studio tab reachable; anchor = last picked color, editable via HEX.
- Wheel renders, anchor node pinned, other nodes drag and update palettes live; lightness slider works.
- Categorical/sequential/diverging generate from the anchor and look perceptually even (OKLCH).
- Every swatch shows a WCAG badge vs the chosen background.
- CVD toggle recolors swatches **and** the mini-dashboard for deut/prot/trit.
- Mini-dashboard repaints from the palette.
- Theme JSON / CSS / JSON / PNG export the three palettes; Theme JSON still imports into Power BI.
- Inline self-check passes (new count shown in footer + console); no console errors.
- Live site updated; installed PWA picks up the new version.

## 7. Risks / notes

- **Wrong OKLab / CVD constants** — silent color error. Mitigation: canonical sources + round-trip
  self-check gate (§4.5). This is the single biggest correctness risk.
- **Equal-L categorical muddiness** at extreme anchor lightness — mitigated by the L zig-zag (§4.2).
- **Per-pixel wheel render cost** — cache the canvas image, redraw only on lightness change.
- **PWA staleness** — must bump `CACHE` in `sw.js`; the worker is already network-first for HTML,
  so a normal reload picks up updates.
- Keep it dependency-free and single-file, matching the tool's existing ethos.
