# MOCK-ANIMATION

Loading-screen animation concepts for the "Music Seed" flow — a seed is planted, grows, blooms, and releases a music drop when the song is ready.

**4 design variations** (Classic 🌼 · Raindrop 🌧️ · Firefly ✨ · Bonsai 🌳), 3 animation phases each, built with **pure SVG + CSS** — zero dependencies, single self-contained `index.html` (~60 KB including the embedded Noto Sans JP font).

## Run

Open `index.html` in any browser. No build step, no server needed.

## How it works

- Each loading phase is a CSS class (`ph1` / `ph2` / `ph3` / `done`) applied to the stage — swap the demo timer for real API status to integrate.
- Growth animations use the `stroke-dashoffset` trick; leaves/petals pop in with `transform: scale()` + springy easing.
