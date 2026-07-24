/* Shared sample data + step-dots helper for the theme-picker variants. */

const GRADS = [
  'linear-gradient(135deg,#F58F22,#7c3aed)',
  'linear-gradient(135deg,#3b82f6,#06b6d4)',
  'linear-gradient(135deg,#ec4899,#f97316)',
  'linear-gradient(135deg,#10b981,#84cc16)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
];

// Full theme data — the info the boss wants surfaced up front.
const THEMES = [
  { id:'t1', name:'Summer Festival 2025', postedBy:'SoundWave Inc.',  description:'A bright, uplifting theme inspired by open-air summer festivals — big drops, crowd energy and golden-hour warmth.', hashtags:['#summer','#festival','#EDM'] },
  { id:'t2', name:'City Nights',          postedBy:'NEON Records',     description:'The mood of walking through neon-lit streets at night, glass reflections and a slow synth pulse.',            hashtags:['#citypop','#night','#synth'] },
  { id:'t3', name:'Coffee Break',         postedBy:'Café Aroma Inc.',  description:'A relaxed afternoon in a cozy café — warm acoustic guitar, soft brushes and gentle vocals.',                  hashtags:['#chill','#acoustic'] },
  { id:'t4', name:'Cherry Blossom',       postedBy:'Bloom Music',      description:'The start of spring, blossoms drifting in the breeze — delicate piano and a hopeful melody.',                 hashtags:['#spring','#ballad','#piano'] },
];

// Genres inside a theme (Stage 2)
const GENRES = ['Pop', 'Rock', 'Ballad', 'EDM', 'Anime', 'Lo-fi'];

// Seeds inside a theme+genre (Stage 3) — each has its own info + audio preview.
const SEEDS = [
  { id:'s1', name:'Summer Drive', provider:'Suno',   license:'Standard', description:'Upbeat four-on-the-floor with bright plucky synths and a festival-sized chorus.' },
  { id:'s2', name:'Golden Hour',  provider:'Mureka', license:'Standard', description:'Breezy acoustic guitar over warm pads — easygoing and nostalgic.' },
  { id:'s3', name:'Neon Beat',    provider:'Suno',   license:'Pro',      description:'Pulsing synthwave bassline with retro arps and a driving kick.' },
];
const SEED_GRADS = [
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#22d3ee,#3b82f6)',
  'linear-gradient(135deg,#a78bfa,#6366f1)',
];

const STEP_LABELS = ['Seed', 'Image', 'Mood', 'Vocal', 'Text', 'Create'];

// Shared genre pill row (same across all designs). `sel` = selected genre.
function renderGenres(el, sel) {
  el.innerHTML = GENRES.map(g => `
    <button class="pill ${g===sel ? 'sel' : ''}">${g}</button>`).join('');
}

// Renders the step-dots header with "Seed" active (the theme step lives here).
function renderDots(el) {
  el.innerHTML = STEP_LABELS.map((label, i) => `
    <div class="step-dot-wrap">
      <div class="step-dot ${i===0 ? 'step-dot--active' : ''}">${i+1}</div>
      <span class="step-dot-label ${i===0 ? 'step-dot-label--active' : ''}">${label}</span>
      ${i < STEP_LABELS.length - 1 ? '<div class="step-line"></div>' : ''}
    </div>`).join('');
}
