/* Create-flow mock — replicates the onepro-liff create-song wizard.
   Pure client mock: sample seeds/moods, local image preview, NO Mureka/API calls.
   A design plugs in its own processing visual via CreateFlow.init({ loader }). */
(function () {
  'use strict';

  const SEEDS = [
    { id: 'lofi',     name: 'Lo-fi Chill',   desc: 'Mellow late-night beats', emoji: '🌙', grad: 'linear-gradient(150deg,#2a3350,#12131f)' },
    { id: 'citypop',  name: 'City Pop',      desc: '80s Tokyo groove',        emoji: '🏙️', grad: 'linear-gradient(150deg,#472a52,#1a0f22)' },
    { id: 'acoustic', name: 'Acoustic Cafe', desc: 'Warm & intimate',         emoji: '🎸', grad: 'linear-gradient(150deg,#4a3a1e,#1c1509)' },
    { id: 'synth',    name: 'Synthwave',     desc: 'Neon nostalgia',          emoji: '🌆', grad: 'linear-gradient(150deg,#123a4a,#0a1a22)' },
  ];
  const MOODS = [
    { id: 'calm',       emoji: '😌', name: 'Calm' },
    { id: 'happy',      emoji: '😊', name: 'Happy' },
    { id: 'nostalgic',  emoji: '🥺', name: 'Nostalgic' },
    { id: 'energetic',  emoji: '🔥', name: 'Energetic' },
    { id: 'melancholy', emoji: '💧', name: 'Melancholy' },
    { id: 'romantic',   emoji: '💖', name: 'Romantic' },
  ];
  const STEPS = ['seed', 'image', 'mood', 'vocal', 'text', 'confirm'];
  const LABELS = { seed: 'Seed', image: 'Image', mood: 'Mood', vocal: 'Vocal', text: 'Text', confirm: 'Create' };
  const PROMPTS = {
    seed:    '🎵 Pick your music style below to get started.',
    image:   '📸 Upload an image that captures your vibe.',
    mood:    '💫 How are you feeling right now? Choose a mood.',
    vocal:   "🎤 Who's singing your story? Pick a vocal type.",
    text:    '✍️ Add a personal message or theme for your song.',
    confirm: "✨ Everything looks good? Let's create your song!",
  };
  const PROC_STEPS = ['Analyzing your inputs…', 'Generating lyrics…', 'Composing music…'];
  // built-in sample photo for the mock upload preview (no file / test path)
  const SAMPLE_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='180'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23f5a442'/><stop offset='1' stop-color='%23b0623a'/></linearGradient></defs><rect width='240' height='180' fill='url(%23g)'/><circle cx='185' cy='45' r='22' fill='%23ffe6b0'/><path d='M0 150 L70 95 L120 130 L180 80 L240 120 L240 180 L0 180 Z' fill='%23000' opacity='.28'/></svg>");

  let root, loader;
  const state = { step: 'seed', screen: 'flow', seed: null, imageUrl: null, mood: null, vocal: null, text: '' };
  let messages = [];

  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const idx = () => STEPS.indexOf(state.step);
  const canProceed = () => {
    switch (state.step) {
      case 'seed': return !!state.seed;
      case 'image': return !!state.imageUrl;
      case 'mood': return !!state.mood;
      case 'vocal': return !!state.vocal;
      default: return true;
    }
  };
  function userSummary(step) {
    if (step === 'seed') return '🎵 I chose: ' + state.seed.name;
    if (step === 'image') return '📸 Image uploaded!';
    if (step === 'mood') return state.mood.emoji + ' Feeling ' + state.mood.name;
    if (step === 'vocal') return '🎤 ' + (state.vocal === 'male' ? 'Male' : 'Female') + ' vocal';
    if (step === 'text') return state.text ? '✍️ "' + state.text.slice(0, 60) + (state.text.length > 60 ? '…' : '') + '"' : '✍️ No message added';
    return '';
  }

  /* ── shell ── */
  function renderShell() {
    root.innerHTML = '';
    root.appendChild(el('div', 'statusbar',
      '<span>9:41</span><span class="ic"><span class="sig"><i></i><i></i><i></i><i></i></span>5G<span class="bat"><i></i></span></span>'));
    const bodyWrap = el('div', 'screen-body');
    bodyWrap.style.cssText = 'flex:1;display:flex;flex-direction:column;overflow:hidden';
    bodyWrap.id = 'body';
    root.appendChild(bodyWrap);
    return bodyWrap;
  }

  function stepDots() {
    const cur = idx();
    const wrap = el('div', 'step-dots');
    STEPS.forEach((s, i) => {
      const w = el('div', 'step-dot-wrap');
      const dc = 'step-dot' + (i < cur ? ' step-dot--done' : i === cur ? ' step-dot--active' : '');
      w.appendChild(el('div', dc, i < cur ? '✓' : String(i + 1)));
      w.appendChild(el('span', 'step-dot-label' + (i === cur ? ' step-dot-label--active' : ''), LABELS[s]));
      if (i < STEPS.length - 1) w.appendChild(el('div', 'step-line' + (i < cur ? ' step-line--done' : '')));
      wrap.appendChild(w);
    });
    return wrap;
  }

  /* ── flow (chat + options) ── */
  function renderFlow() {
    const body = renderShell();
    body.appendChild(stepDots());
    const scroll = el('div', 'flow-body'); scroll.id = 'flow';
    // chat history
    messages.forEach(m => {
      const row = el('div', 'chat-row' + (m.role === 'user' ? ' chat-row--user' : ''));
      if (m.role === 'ai') row.appendChild(el('div', 'chat-avatar', '🤖'));
      row.appendChild(el('div', 'bubble ' + (m.role === 'ai' ? 'bubble--ai' : 'bubble--user'), m.text));
      scroll.appendChild(row);
    });
    // options for current step
    const opts = el('div', 'options');
    opts.appendChild(renderOptions());
    opts.appendChild(renderNav());
    scroll.appendChild(opts);
    body.appendChild(scroll);
    requestAnimationFrame(() => { scroll.scrollTop = scroll.scrollHeight; });
  }

  function renderOptions() {
    const s = state.step;
    if (s === 'seed') return seedOptions();
    if (s === 'image') return imageOptions();
    if (s === 'mood') return moodOptions();
    if (s === 'vocal') return vocalOptions();
    if (s === 'text') return textOptions();
    if (s === 'confirm') return confirmOptions();
    return el('div');
  }

  function seedOptions() {
    const c = el('div', 'seed-scroll');
    SEEDS.forEach(sd => {
      const card = el('div', 'seed-card' + (state.seed && state.seed.id === sd.id ? ' seed-card--active' : ''));
      const thumb = el('div', 'seed-card__thumb', sd.emoji + '<button class="seed-card__play">▶</button>');
      thumb.style.background = sd.grad;
      const foot = el('div', 'seed-card__foot',
        '<div><div class="seed-card__name">' + sd.name + '</div><div class="seed-card__desc">' + sd.desc + '</div></div>' +
        (state.seed && state.seed.id === sd.id ? '<div class="seed-card__tick">✓</div>' : ''));
      card.appendChild(thumb); card.appendChild(foot);
      card.onclick = () => { state.seed = sd; renderFlow(); };
      c.appendChild(card);
    });
    return c;
  }

  function imageOptions() {
    const wrap = el('div');
    if (state.imageUrl) {
      const p = el('div', 'upload-preview');
      p.innerHTML = '<img src="' + state.imageUrl + '" alt=""><span class="upload-done">✓ Uploaded</span><button class="upload-x">✕</button>';
      p.querySelector('.upload-x').onclick = () => { state.imageUrl = null; renderFlow(); };
      wrap.appendChild(p);
    } else {
      const btn = el('button', 'upload-btn', '<span class="big">📷</span><span class="lbl">Tap to upload</span><span class="hint">JPG, PNG up to 10MB</span>');
      const input = el('input'); input.type = 'file'; input.accept = 'image/*'; input.style.display = 'none';
      input.onchange = e => { const f = e.target.files && e.target.files[0]; state.imageUrl = f ? URL.createObjectURL(f) : SAMPLE_IMG; renderFlow(); };
      btn.onclick = () => input.click();
      wrap.appendChild(btn); wrap.appendChild(input);
    }
    return wrap;
  }

  function moodOptions() {
    const g = el('div', 'mood-grid');
    MOODS.forEach(m => {
      const it = el('div', 'mood-item' + (state.mood && state.mood.id === m.id ? ' mood-item--active' : ''),
        '<span class="emo">' + m.emoji + '</span><span class="nm">' + m.name + '</span>' +
        (state.mood && state.mood.id === m.id ? '<span class="tick">✓</span>' : ''));
      it.onclick = () => { state.mood = m; renderFlow(); };
      g.appendChild(it);
    });
    return g;
  }

  function vocalOptions() {
    const g = el('div', 'vocal-grid');
    [['male', '👨', 'Male', 'Deep & rich'], ['female', '👩', 'Female', 'Smooth & melodic']].forEach(([k, ic, nm, ds]) => {
      const it = el('div', 'vocal-item' + (state.vocal === k ? ' vocal-item--active' : ''),
        '<div class="vocal-icon">' + ic + '</div><div class="nm">' + nm + '</div><div class="ds">' + ds + '</div>');
      it.onclick = () => { state.vocal = k; renderFlow(); };
      g.appendChild(it);
    });
    return g;
  }

  function textOptions() {
    const wrap = el('div');
    const box = el('div', 'text-box');
    const ta = el('textarea'); ta.placeholder = 'Type your feelings, a memory, or keywords…'; ta.value = state.text; ta.maxLength = 30000;
    const cnt = el('div', 'text-count', state.text.length + '/30000');
    ta.oninput = () => { state.text = ta.value; cnt.textContent = state.text.length + '/30000'; };
    box.appendChild(ta); box.appendChild(cnt); wrap.appendChild(box);
    wrap.appendChild(el('div', 'tips',
      '<h4>💡 Tips</h4>' +
      '<div class="row"><span class="dot"></span>Describe your feelings or current mood</div>' +
      '<div class="row"><span class="dot"></span>Share a memory or story</div>' +
      '<div class="row"><span class="dot"></span>Or leave it empty for AI to be creative!</div>'));
    return wrap;
  }

  function confirmOptions() {
    const wrap = el('div');
    wrap.appendChild(el('div', 'sum-label', 'Summary'));
    const card = el('div', 'sum-card');
    const head = el('div', 'sum-head');
    const th = el('div', 'sum-thumb', state.seed.emoji); th.style.background = state.seed.grad;
    head.appendChild(th);
    head.appendChild(el('div', null, '<div class="sum-k">Style</div><div class="sum-v">' + state.seed.name + '</div>'));
    card.appendChild(head);
    card.appendChild(el('div', 'sum-grid',
      '<div><div class="sum-k">Mood</div><div class="sum-v">' + state.mood.emoji + ' ' + state.mood.name + '</div></div>' +
      '<div><div class="sum-k">Vocal</div><div class="sum-v" style="text-transform:capitalize">' + state.vocal + '</div></div>'));
    if (state.text) card.appendChild(el('div', null, '<div class="sum-k">Inspiration</div><div class="sum-insp">"' + state.text + '"</div>'));
    wrap.appendChild(card);
    return wrap;
  }

  function renderNav() {
    const row = el('div', 'nav-row');
    if (idx() > 0) {
      const back = el('button', 'nav-btn nav-btn--back', '‹ Back');
      back.onclick = goBack; row.appendChild(back);
    }
    const last = state.step === 'confirm';
    const next = el('button', 'nav-btn nav-btn--next', last ? 'Create My Song 🎵' : 'Next ›');
    next.disabled = !canProceed();
    next.onclick = goNext; row.appendChild(next);
    return row;
  }

  function goNext() {
    if (!canProceed()) return;
    messages.push({ role: 'user', text: userSummary(state.step), step: state.step });
    if (state.step === 'confirm') { startProcessing(); return; }
    const next = STEPS[idx() + 1];
    state.step = next;
    messages.push({ role: 'ai', text: PROMPTS[next], step: next });
    renderFlow();
  }
  function goBack() {
    const prev = STEPS[idx() - 1];
    if (!prev) return;
    // truncate messages back to prev step's AI prompt
    let cut = -1;
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === 'ai' && messages[i].step === prev) { cut = i; break; }
    if (cut >= 0) messages = messages.slice(0, cut + 1);
    state.step = prev;
    renderFlow();
  }

  /* ── processing ── */
  let procTimer = null;
  function startProcessing() {
    state.screen = 'processing';
    const body = renderShell();
    const proc = el('div', 'proc');
    const stage = el('div', 'proc__stage'); stage.id = 'stage';
    proc.appendChild(stage);
    proc.appendChild(el('h2', null, 'Creating Your Song'));
    proc.appendChild(el('p', 'proc__msg', "Our AI is composing your unique song. We'll notify you on LINE when it's ready!"));
    proc.appendChild(el('div', 'proc__bar', '<i class="proc__fill" id="pfill"></i>'));
    proc.appendChild(el('div', 'proc__pct', '<span id="ppct">0%</span>'));
    const steps = el('div', 'proc__steps'); steps.id = 'psteps';
    PROC_STEPS.forEach((s, i) => steps.appendChild(el('div', 'proc__step', '<span class="d">' + (i + 1) + '</span><span class="tx">' + s + '</span>')));
    proc.appendChild(steps);
    const close = el('button', 'proc__close', 'Close & Wait for Notification');
    close.onclick = reset;
    proc.appendChild(close);
    body.appendChild(proc);

    if (loader && loader.mount) loader.mount(stage);
    const fill = document.getElementById('pfill'), pct = document.getElementById('ppct');
    const sizeFill = () => { const bar = fill.parentElement; fill.style.backgroundSize = bar.clientWidth + 'px 100%'; };
    sizeFill();
    let curPhase = -1;
    const setPhase = i => { if (i === curPhase) return; curPhase = i;
      [...document.querySelectorAll('#psteps .proc__step')].forEach((st, k) =>
        st.className = 'proc__step' + (k < i ? ' proc__step--done' : k === i ? ' proc__step--on' : ''));
      const stp = document.querySelectorAll('#psteps .proc__step')[i];
      if (stp) stp.querySelector('.d').innerHTML = '<span class="pulse-dot"></span>';
      [...document.querySelectorAll('#psteps .proc__step')].forEach((st, k) => { if (k < i) st.querySelector('.d').textContent = '✓'; });
      if (loader && loader.setPhase) loader.setPhase(i);
    };
    // per-phase durations: the loader can play each clip fully; else ~3.8s each
    const durs = (loader && loader.phaseDurations && loader.phaseDurations()) || [3800, 3800, 3800];
    const b1 = durs[0], b2 = durs[0] + durs[1], total = durs[0] + durs[1] + durs[2];
    const t0 = performance.now();
    clearInterval(procTimer);
    procTimer = setInterval(() => {
      const elapsed = performance.now() - t0;
      const p = Math.min(100, (elapsed / total) * 100);
      fill.style.width = p.toFixed(0) + '%'; pct.textContent = p.toFixed(0) + '%';
      setPhase(elapsed >= b2 ? 2 : elapsed >= b1 ? 1 : 0);
      if (p >= 100) { clearInterval(procTimer); if (loader && loader.done) loader.done(); setTimeout(showDone, loader && loader.done ? 1600 : 500); }
    }, 80);
  }

  /* ── completed ── */
  function showDone() {
    state.screen = 'done';
    if (loader && loader.teardown) loader.teardown();
    const body = renderShell();
    const d = el('div', 'done');
    d.appendChild(el('div', 'done__check', '✓'));
    d.appendChild(el('h2', null, 'Your Song is Ready!'));
    d.appendChild(el('div', 'done__song', 'Cafe in Bangkok · ' + (state.mood ? state.mood.name : '') + ' ' + (state.seed ? state.seed.name : '')));
    d.appendChild(el('div', 'done__art', '☕'));
    const btns = el('div', 'done__btns');
    const play = el('button', 'done__btn done__btn--play', '▶ Play Now');
    play.onclick = () => { play.textContent = '♪ Now playing…'; };
    const again = el('button', 'done__btn done__btn--again', '＋ Create Another');
    again.onclick = reset;
    btns.appendChild(play); btns.appendChild(again);
    d.appendChild(btns);
    body.appendChild(d);
  }

  function reset() {
    clearInterval(procTimer);
    if (loader && loader.teardown) loader.teardown();
    state.step = 'seed'; state.screen = 'flow'; state.seed = null; state.imageUrl = null; state.mood = null; state.vocal = null; state.text = '';
    messages = [{ role: 'ai', text: PROMPTS.seed, step: 'seed' }];
    renderFlow();
  }

  /* ── public + test hooks ── */
  window.CreateFlow = {
    init(opts) {
      root = document.querySelector(opts.screen);
      loader = opts.loader || null;
      reset();
    },
    // test helpers (also handy for demos)
    _s: state,
    selectSeed: id => { state.seed = SEEDS.find(x => x.id === id) || SEEDS[0]; renderFlow(); },
    mockImage: () => { state.imageUrl = SAMPLE_IMG; renderFlow(); },
    selectMood: id => { state.mood = MOODS.find(x => x.id === id) || MOODS[0]; renderFlow(); },
    selectVocal: v => { state.vocal = v; renderFlow(); },
    setText: t => { state.text = t; renderFlow(); },
    next: goNext, back: goBack, reset,
  };
})();
