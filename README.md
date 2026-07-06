# MOCK-ANIMATION

Loading-screen design concepts for the song-generation flow, built with **pure SVG + CSS** — zero dependencies, each demo is one self-contained HTML file.

## Structure

- `index.html` — gallery: pick a design concept
- `design-1.html` — **Design 01 · Music Seed Garden**: a seed is planted, grows and blooms, then your song falls as a golden music drop. 4 variations (Classic 🌼 · Raindrop 🌧️ · Firefly ✨ · Bonsai 🌳), 3 animation phases each.
- `design-2.html` — **Design 02 · Golden Bloom**: fragments of light gather into a seed of music on a dark screen; it blooms into a glowing lotus and the song drops into the music pool.
- `design-3.html` — **Design 03 · Music Seed Mascot**: a cute seed mascot in the app's flat design language — breathes, blinks, sways, grows with progress, blooms and gives one golden drop. Pure SVG + CSS, zero dependencies.

## Run

Open `index.html` in any browser. No build step, no server needed.

## How it works

- Each loading phase is a CSS class (`ph1` / `ph2` / `ph3` / `done`) applied to the stage — swap the demo timer for real API status to integrate.
- Growth animations use the `stroke-dashoffset` trick; leaves/petals pop in with `transform: scale()` + springy easing.
