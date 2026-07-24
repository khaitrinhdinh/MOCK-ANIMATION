/* ============================================================
   1Pro Studio — create flow (mock)
   Tái hiện logic ChatPanel / InlineOptions của onepro-liff.
   ============================================================ */

// ---- Step metadata (studio.steps + studio.prompts from en.json) ----
const STEPS = [
  { key: 'seed',    label: 'Seed',   prompt: '🎵 Pick your music style below to get started.' },
  { key: 'image',   label: 'Image',  prompt: '📸 Upload an image that captures your vibe.' },
  { key: 'mood',    label: 'Mood',   prompt: '💫 How are you feeling right now? Choose a mood.' },
  { key: 'vocal',   label: 'Vocal',  prompt: "🎤 Who's singing your story? Pick a vocal type." },
  { key: 'text',    label: 'Text',   prompt: '✍️ Add a personal message or theme for your song.' },
  { key: 'confirm', label: 'Create', prompt: "✨ Everything looks good? Let's create your song!" },
];
const ORDER = STEPS.map(s => s.key);

// ---- Sample data ----
const GRADS = [
  'linear-gradient(135deg,#F58F22,#7c3aed)',
  'linear-gradient(135deg,#3b82f6,#06b6d4)',
  'linear-gradient(135deg,#ec4899,#f97316)',
  'linear-gradient(135deg,#10b981,#84cc16)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
];

// Theme: FULL data exists (title / description / postedBy / hashtags) —
// but the CURRENT design only shows image + name (this is the problem raised).
const THEMES = [
  { id:'t1', name:'Summer Festival 2025', postedBy:'SoundWave Inc.',   description:'A bright, uplifting theme inspired by open-air summer festivals.', hashtags:['#summer','#festival','#EDM'] },
  { id:'t2', name:'City Nights',          postedBy:'NEON Records',     description:'The mood of walking through neon-lit streets at night.',          hashtags:['#citypop','#night'] },
  { id:'t3', name:'Coffee Break',         postedBy:'Café Aroma Inc.',  description:'A relaxed afternoon in a cozy café.',                              hashtags:['#chill','#acoustic'] },
  { id:'t4', name:'Cherry Blossom',       postedBy:'Bloom Music',      description:'The start of spring, blossoms drifting in the breeze.',            hashtags:['#spring','#ballad'] },
];
const GENRES = ['Pop', 'Rock', 'Ballad', 'EDM', 'Anime'];
const SEEDS = [
  { id:'s1', name:'Summer Drive', desc:'Upbeat / Bright' },
  { id:'s2', name:'Golden Hour',  desc:'Breezy / Guitar' },
  { id:'s3', name:'Neon Beat',    desc:'Synth / Dance' },
];
const MOODS = [
  { id:'m1', emoji:'😢', label:'Emotional' },
  { id:'m2', emoji:'😊', label:'Happy' },
  { id:'m3', emoji:'😌', label:'Chill' },
  { id:'m4', emoji:'🔥', label:'Powerful' },
  { id:'m5', emoji:'💗', label:'Romantic' },
];
const VOCALS = [
  { id:'v1', name:'Female Vocal', desc:'Smooth, melodic female voice', icon:'👩' },
  { id:'v2', name:'Male Vocal',   desc:'Deep, rich male voice',        icon:'👨' },
];

// ---- State ----
const state = {
  stepIdx: 0,
  themeId: null, genreId: null, seedId: null,
  moodId: null, vocalId: null,
};

// "I chose …" answer bubbles (studio.userSummary)
function answerFor(key) {
  switch (key) {
    case 'seed':  return state.themeId ? `I picked "${THEMES.find(t=>t.id===state.themeId).name}"` : '';
    case 'image': return 'Uploaded an image';
    case 'mood':  return state.moodId ? `${MOODS.find(m=>m.id===state.moodId).emoji} ${MOODS.find(m=>m.id===state.moodId).label}` : '';
    case 'vocal': return state.vocalId ? VOCALS.find(v=>v.id===state.vocalId).name : '';
    case 'text':  return 'Continue without a message';
    default: return '';
  }
}

// frontier = first step still missing input
function dataFilled(key) {
  switch (key) {
    case 'seed':  return !!state.seedId;
    case 'image': return true;  // optional in mock
    case 'mood':  return !!state.moodId;
    case 'vocal': return !!state.vocalId;
    default: return true;
  }
}
function frontier() {
  for (let i = 0; i < ORDER.length; i++) if (!dataFilled(ORDER[i])) return i;
  return ORDER.length - 1;
}

// ---- Render: step dots ----
function renderDots() {
  const f = frontier();
  const el = document.getElementById('stepDots');
  el.innerHTML = STEPS.map((s, i) => {
    const active = i === state.stepIdx;
    const done = i < f && !active;
    const nav = i <= f && !active;
    return `
      <div class="step-dot-wrap" ${nav ? 'style="cursor:pointer" data-go="'+i+'"' : ''}>
        <div class="step-dot ${done ? 'step-dot--done' : ''} ${active ? 'step-dot--active' : ''}">${done ? '✓' : (i+1)}</div>
        <span class="step-dot-label ${active ? 'step-dot-label--active' : ''}">${s.label}</span>
        ${i < STEPS.length - 1 ? `<div class="step-line ${i < f ? 'step-line--done' : ''}"></div>` : ''}
      </div>`;
  }).join('');
  el.querySelectorAll('[data-go]').forEach(n =>
    n.addEventListener('click', () => goTo(+n.dataset.go)));
}

// ---- Render: chat history (AI prompt + prior answers) ----
function renderChat() {
  const msgs = [{ role:'ai', content: STEPS[0].prompt }];
  for (let i = 0; i < state.stepIdx; i++) {
    const a = answerFor(ORDER[i]);
    if (a) msgs.push({ role:'user', content:a });
    msgs.push({ role:'ai', content: STEPS[i+1].prompt });
  }
  document.getElementById('chatHistory').innerHTML = msgs.map(m => `
    <div class="chat-bubble-wrap ${m.role==='user' ? 'chat-bubble-wrap--user' : ''}">
      ${m.role==='ai' ? '<div class="chat-avatar">🤖</div>' : ''}
      <div class="chat-bubble ${m.role==='ai' ? 'chat-bubble--ai' : 'chat-bubble--user'}">${m.content}</div>
    </div>`).join('');
}

// ---- Render: options for current step ----
function renderOptions() {
  const key = ORDER[state.stepIdx];
  const area = document.getElementById('optionsArea');
  area.innerHTML = '';
  const tpl = document.getElementById('tpl-' + key);
  area.appendChild(tpl.content.cloneNode(true));

  if (key === 'seed') renderSeed();
  if (key === 'mood') renderMood();
  if (key === 'vocal') renderVocal();

  // Nav button (studio.nextStep / studio.createSong)
  const btn = document.createElement('button');
  btn.className = 'nav-btn';
  const last = state.stepIdx === ORDER.length - 1;
  btn.textContent = last ? 'Create My Song' : 'Next Step ›';
  btn.disabled = !dataFilled(key) && (key === 'seed' || key === 'mood' || key === 'vocal');
  btn.addEventListener('click', () => {
    if (last) { showProcessing(); return; }
    goTo(state.stepIdx + 1);
  });
  area.appendChild(btn);
}

function renderSeed() {
  const ts = document.getElementById('themeScroll');
  ts.innerHTML = THEMES.map((t, i) => `
    <div class="theme-card ${state.themeId===t.id?'sel':''}" data-theme="${t.id}">
      <div class="thumb" style="background:${GRADS[i%GRADS.length]}"></div>
      <div class="name">${t.name}</div>
    </div>`).join('');
  ts.querySelectorAll('[data-theme]').forEach(n => n.addEventListener('click', () => {
    state.themeId = state.themeId === n.dataset.theme ? null : n.dataset.theme;
    state.genreId = null; state.seedId = null;
    renderAll();
  }));

  if (state.themeId) {
    const gs = document.getElementById('genreStage');
    gs.classList.remove('hidden');
    const gr = document.getElementById('genreRow');
    gr.innerHTML = GENRES.map(g => `
      <button class="pill ${state.genreId===g?'sel':''}" data-genre="${g}">${g}</button>`).join('');
    gr.querySelectorAll('[data-genre]').forEach(n => n.addEventListener('click', () => {
      state.genreId = state.genreId === n.dataset.genre ? null : n.dataset.genre;
      state.seedId = null;
      renderAll();
    }));
  }
  if (state.themeId && state.genreId) {
    const ss = document.getElementById('seedStage');
    ss.classList.remove('hidden');
    const sc = document.getElementById('seedScroll');
    sc.innerHTML = SEEDS.map((s, i) => `
      <div class="media-card ${state.seedId===s.id?'sel':''}" data-seed="${s.id}">
        <div class="thumb" style="background:${GRADS[(i+1)%GRADS.length]}">
          <div class="icon-btn tl">⋯</div>
          <div class="icon-btn br">▶</div>
        </div>
        <div class="info">
          <div class="txt"><div class="nm">${s.name}</div><div class="ds">${s.desc}</div></div>
          ${state.seedId===s.id?'<div class="check">✓</div>':''}
        </div>
      </div>`).join('');
    sc.querySelectorAll('[data-seed]').forEach(n => {
      n.addEventListener('click', () => {
        state.seedId = state.seedId === n.dataset.seed ? null : n.dataset.seed;
        renderAll();
      });
      n.querySelectorAll('.icon-btn').forEach(b => b.addEventListener('click', e => e.stopPropagation()));
    });
  }
}

function renderMood() {
  const el = document.getElementById('moodScroll');
  el.innerHTML = MOODS.map(m => `
    <div class="mood-card ${state.moodId===m.id?'sel':''}" data-mood="${m.id}">
      ${state.moodId===m.id?'<div class="check chk">✓</div>':''}
      <div class="emoji">${m.emoji}</div>
      <div class="lbl">${m.label}</div>
    </div>`).join('');
  el.querySelectorAll('[data-mood]').forEach(n => n.addEventListener('click', () => {
    state.moodId = n.dataset.mood; renderAll();
  }));
}

function renderVocal() {
  const el = document.getElementById('vocalScroll');
  el.innerHTML = VOCALS.map((v, i) => `
    <div class="media-card ${state.vocalId===v.id?'sel':''}" data-vocal="${v.id}">
      <div class="thumb" style="background:${GRADS[(i+2)%GRADS.length]};display:flex;align-items:center;justify-content:center;font-size:44px">${v.icon}
        <div class="icon-btn br">▶</div>
      </div>
      <div class="info">
        <div class="txt"><div class="nm">${v.name}</div><div class="ds">${v.desc}</div></div>
        ${state.vocalId===v.id?'<div class="check">✓</div>':''}
      </div>
    </div>`).join('');
  el.querySelectorAll('[data-vocal]').forEach(n => {
    n.addEventListener('click', () => { state.vocalId = n.dataset.vocal; renderAll(); });
    n.querySelectorAll('.icon-btn').forEach(b => b.addEventListener('click', e => e.stopPropagation()));
  });
}

// ---- Processing screen ----
function showProcessing() {
  document.querySelector('.chat-panel').innerHTML =
    `<div style="flex:1" id="procMount"></div>`;
  const tpl = document.getElementById('tpl-processing');
  document.getElementById('procMount').appendChild(tpl.content.cloneNode(true));
  renderDemoBar('processing');
}

// ---- Demo step switcher ----
function renderDemoBar(force) {
  const bar = document.getElementById('demoBar');
  const items = [...STEPS.map((s,i)=>({label:s.label, idx:i})), {label:'Processing', idx:'processing'}];
  bar.innerHTML = items.map(it => {
    const on = force ? it.idx === force : it.idx === state.stepIdx;
    return `<button class="${on?'on':''}" data-jump="${it.idx}">${it.label}</button>`;
  }).join('');
  bar.querySelectorAll('[data-jump]').forEach(n => n.addEventListener('click', () => {
    const j = n.dataset.jump;
    if (j === 'processing') { showProcessing(); return; }
    // jumping via demo bar bypasses the frontier gate (for review only)
    hardResetPanel();
    state.stepIdx = +j;
    renderAll();
  }));
}

// Rebuild the panel skeleton (needed after processing replaced it)
function hardResetPanel() {
  const cp = document.querySelector('.chat-panel');
  if (document.getElementById('stepDots')) return;
  cp.innerHTML = `
    <div class="step-dots" id="stepDots"></div>
    <div class="scroll-body scrollbar-hide">
      <div id="chatHistory"></div>
      <div class="options-area" id="optionsArea"></div>
    </div>`;
}

function goTo(idx) {
  hardResetPanel();
  state.stepIdx = Math.max(0, Math.min(ORDER.length - 1, idx));
  renderAll();
}

function renderAll() {
  hardResetPanel();
  renderDots();
  renderChat();
  renderOptions();
  renderDemoBar();
}

renderAll();
