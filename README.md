# MOCK-ANIMATION

Loading-screen design concepts for the song-generation flow, built with **pure SVG + CSS** — zero dependencies, each demo is one self-contained HTML file.

## Structure

- `index.html` — gallery: pick a design concept
- `design-1.html` — **Design 01 · Music Seed Garden**: a seed is planted, grows and blooms, then your song falls as a golden music drop. 4 variations (Classic 🌼 · Raindrop 🌧️ · Firefly ✨ · Bonsai 🌳), 3 animation phases each.
- `design-2.html` — **Design 02 · Golden Bloom**: fragments of light gather into a seed of music on a dark screen; it blooms into a glowing lotus and the song drops into the music pool.
- `design-3.html` — **Design 03 · Music Seed Mascot**: a cute seed mascot in the app's flat design language — breathes, blinks, sways, grows with progress, blooms and gives one golden drop. Pure SVG + CSS, zero dependencies.
- `design-4.html` — **Design 04 · Painted Bloom**: the cinematic scene rebuilt from soft color-mass blobs (blur + bloom in Pixi) instead of line-art — reads as a glowing image, minimal outlines.
- `design-5.html` — **Design 05 · Cinematic (Real Assets)**: actual PNG sprites loaded in PixiJS with SCREEN blend, a flow-energy `DisplacementFilter`, `AdvancedBloomFilter` and a GSAP timeline. Assets live in `assets/sprites/` (salvaged + alpha-cut from the delivered sheet; swap in 2x–4x for crisp).
- `design-6.html` — **Design 06 · Realistic Coffee**: photorealistic coffee bean → sprout → dewy leaf → golden drop, from real 1024px alpha PNGs packed into `coffee_atlas.png` + `coffee_atlas.json`, composited in PixiJS.
- `design-7.html` — **Design 07 · Cinematic Coffee**: four consistent AI-rendered growth scenes cross-fade with the progress bar under a Ken Burns push-in, warm dust and a golden-drop finale. Pure CSS crossfade + GSAP, no WebGL. Scenes in `assets/scene1-4.jpg`.
- `design-8.html` — **Design 08 · Video Phases**: player scaffold — one short video per phase (`assets/video1/2/3`), played once then last frame held with looping ambient until the backend advances; falls back to still posters when clips are absent.
- `design-9.html` — **Design 09 · Grown by Code**: a coffee plant drawn entirely in PixiJS + GSAP (no assets) — stem and leaf pairs grow continuously with the progress bar, then a golden music-seed ripens at the top with a ring pulse and sparkle burst.

## Run

Open `index.html` in any browser. No build step, no server needed.

## How it works

- Each loading phase is a CSS class (`ph1` / `ph2` / `ph3` / `done`) applied to the stage — swap the demo timer for real API status to integrate.
- Growth animations use the `stroke-dashoffset` trick; leaves/petals pop in with `transform: scale()` + springy easing.
