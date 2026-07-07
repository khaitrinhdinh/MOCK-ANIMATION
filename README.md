# MOCK-ANIMATION

Loading-screen design concepts for the song-generation flow, built with **pure SVG + CSS** — zero dependencies, each demo is one self-contained HTML file.

## Structure

- `index.html` — gallery: pick a design concept
- `design-1.html` — **Design 01 · Music Seed Garden**: a seed is planted, grows and blooms, then your song falls as a golden music drop. 4 variations (Classic 🌼 · Raindrop 🌧️ · Firefly ✨ · Bonsai 🌳), 3 animation phases each. Pure SVG + CSS.
- `design-2.html` — **Design 02 · Cinematic (Real Assets)**: PNG sprites in PixiJS with SCREEN blend, a flow-energy `DisplacementFilter`, `AdvancedBloomFilter` and a GSAP timeline. Assets in `assets/sprites/`.
- `design-3.html` — **Design 03 · Realistic Coffee**: photorealistic coffee bean → sprout → dewy leaf → golden drop, from real 1024px alpha PNGs packed into `coffee_atlas.png` + `coffee_atlas.json`, composited in PixiJS.
- `design-4.html` — **Design 04 · Cinematic Coffee**: four consistent AI-rendered growth scenes cross-fade with the progress bar under a Ken Burns push-in, warm dust and a golden-drop finale. Pure CSS crossfade + GSAP. Scenes in `assets/scene1-4.jpg`.
- `design-5.html` — **Design 05 · Video Phases**: player scaffold — one short video per phase (`assets/video1/2/3`), played once then last frame held with looping ambient until the backend advances; falls back to still posters when clips are absent.

## Run

Open `index.html` in any browser. No build step, no server needed.

## How it works

- Each loading phase is a CSS class (`ph1` / `ph2` / `ph3` / `done`) applied to the stage — swap the demo timer for real API status to integrate.
- Growth animations use the `stroke-dashoffset` trick; leaves/petals pop in with `transform: scale()` + springy easing.
