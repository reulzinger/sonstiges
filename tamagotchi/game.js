// TamaLern – Pixel-Art Tamagotchi Learning Game
// ================================================

// ── Pixel Art Sprites (16×16, 5 Evolutionsstufen) ──
// Zeichensystem: '.' = transparent  '#' = dunkel  'o' = mittel  'h' = hell
// Jeder char = 1 Pixel, rendered bei SCALE Pixel-Breite

const SCALE = 7; // Pixel-Größe (7×7 Bildschirmpixel pro Sprite-Pixel)

const PAL = {
  '.': null,
  '#': '#0f380f',   // dunkel (Körper/Kontur)
  'o': '#306230',   // mittel (Füllfarbe)
  'h': '#8bac0f',   // hell (Glanzlicht)
};

// Jede Stufe: Array aus 16 Strings à 16 Zeichen
const BODY_SPRITES = [
  // ── Stufe 0: Ei ──
  [
    '................',
    '................',
    '......####......',
    '.....######.....',
    '....########....',
    '....##hh####....',
    '...###hhh####...',
    '...###hh#####...',
    '...##########...',
    '...##########...',
    '....########....',
    '.....######.....',
    '......####......',
    '................',
    '................',
    '................',
  ],
  // ── Stufe 1: Babytchi ──
  [
    '................',
    '................',
    '......####......',
    '.....######.....',
    '....########....',
    '....########....',
    '....########....',
    '....########....',
    '.....######.....',
    '......####......',
    '......#..#......',
    '......#..#......',
    '......####......',
    '................',
    '................',
    '................',
  ],
  // ── Stufe 2: Marutchi (Kind) ──
  [
    '................',
    '.....######.....',
    '....########....',
    '...##########...',
    '...##########...',
    '...##########...',
    '...##########...',
    '...##########...',
    '....########....',
    '.....######.....',
    '....##....##....',
    '....##....##....',
    '...####..####...',
    '................',
    '................',
    '................',
  ],
  // ── Stufe 3: Tamatchi (Teenager) ──
  [
    '................',
    '.....######.....',
    '....########....',
    '...##########...',
    '..############..',
    '..############..',
    '..############..',
    '..############..',
    '.##############.',
    '.##############.',
    '...##########...',
    '....########....',
    '....##....##....',
    '....##....##....',
    '...####..####...',
    '................',
  ],
  // ── Stufe 4: Mametchi (Erwachsen) ──
  [
    '...##......##...',
    '...##......##...',
    '.....######.....',
    '....########....',
    '...##########...',
    '..############..',
    '..############..',
    '..############..',
    '..############..',
    '.##############.',
    '.##############.',
    '..############..',
    '...##########...',
    '....########....',
    '....##....##....',
    '...####..####...',
  ],
];

// Gesichtsdaten: Position der Augen und des Mundes je Stufe
// eyeRow: Zeile (sprite-Pixel), eyeL/R: linke/rechte Augen-Spalte (sprite-Pixel)
// mouthRow: Zeile des Mundes
const FACE = [
  null,                                                  // Ei – kein Gesicht
  { eyeRow: 5, eyeL: 5, eyeR: 8, mouthRow: 7 },        // Baby
  { eyeRow: 5, eyeL: 4, eyeR: 8, mouthRow: 7 },        // Kind
  { eyeRow: 5, eyeL: 3, eyeR: 9, mouthRow: 7 },        // Teenager
  { eyeRow: 6, eyeL: 3, eyeR: 9, mouthRow: 8 },        // Erwachsen
];

const STAGE_INFO = [
  { name: 'EI',         desc: 'Das Abenteuer beginnt...' },
  { name: 'BABYTCHI',   desc: 'Ein kleines Wesen schlüpft!' },
  { name: 'MARUTCHI',   desc: 'Es wird größer und neugieriger!' },
  { name: 'TAMATCHI',   desc: 'Ein richtiger Teenager!' },
  { name: 'MAMETCHI',   desc: 'Vollständig entwickelt! Du bist der Beste!' },
];

// ── Spielzustand ──────────────────────────────────────────────────────────────

const SAVE_KEY = 'tamalern_v1';

function defaultState() {
  return {
    stage: 0,
    xp: 0,           // 0–9, bei 10 → Evolution
    totalCorrect: 0,
    bestStreak: 0,
    subjectCorrect: { mathe: 0, deutsch: 0, englisch: 0 },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch { return defaultState(); }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

let state = loadState();

// ── Web Audio (8-Bit-Sounds) ──────────────────────────────────────────────────

let _audioCtx = null;
function getAudio() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function beep(freq, dur, vol = 0.18, type = 'square') {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch (_) {}
}

function soundCorrect() {
  beep(523, 0.12); setTimeout(() => beep(784, 0.18), 90);
}

function soundWrong() {
  beep(180, 0.25, 0.12, 'sawtooth');
}

function soundEvolution() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.28), i * 140));
}

function soundClick() {
  beep(440, 0.05, 0.08);
}

// ── Canvas-Renderer ───────────────────────────────────────────────────────────

function px(ctx, x, y, color, s) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, s, s);
}

function drawSprite(ctx, stageIdx, offsetX, offsetY, scale, mood, frame) {
  const sprite = BODY_SPRITES[stageIdx];
  const s = scale;

  // Animation: sanftes Hüpfen
  let yOff = 0;
  if (mood === 'happy') {
    yOff = Math.round(Math.sin(frame * 0.3) * 3);
  } else if (mood === 'normal') {
    yOff = Math.round(Math.sin(frame * 0.07) * 2);
  } else if (mood === 'sad') {
    yOff = 4;
  }

  // Körper zeichnen
  sprite.forEach((row, ry) => {
    for (let rx = 0; rx < 16; rx++) {
      const col = PAL[row[rx]];
      if (col) px(ctx, offsetX + rx * s, offsetY + yOff + ry * s, col, s);
    }
  });

  // Gesicht zeichnen
  const f = FACE[stageIdx];
  if (!f) return;

  const fX = (rx) => offsetX + rx * s;
  const fY = (ry) => offsetY + yOff + ry * s;
  ctx.fillStyle = PAL['#'];

  if (mood === 'happy') {
    // Bogen-Augen (^)
    // Links: .# / ## / #.
    px(ctx, fX(f.eyeL + 1), fY(f.eyeRow),     PAL['#'], s);
    px(ctx, fX(f.eyeL),     fY(f.eyeRow + 1), PAL['#'], s);
    px(ctx, fX(f.eyeL + 1), fY(f.eyeRow + 1), PAL['#'], s);
    // Rechts
    px(ctx, fX(f.eyeR),     fY(f.eyeRow),     PAL['#'], s);
    px(ctx, fX(f.eyeR),     fY(f.eyeRow + 1), PAL['#'], s);
    px(ctx, fX(f.eyeR + 1), fY(f.eyeRow + 1), PAL['#'], s);
    // Lächeln (U-Form)
    px(ctx, fX(f.eyeL),     fY(f.mouthRow),   PAL['#'], s);
    px(ctx, fX(f.eyeR + 1), fY(f.mouthRow),   PAL['#'], s);
    for (let i = f.eyeL; i <= f.eyeR + 1; i++) {
      px(ctx, fX(i), fY(f.mouthRow + 1), PAL['#'], s);
    }
  } else if (mood === 'sad') {
    // Traurige Augen (T_T)
    px(ctx, fX(f.eyeL),     fY(f.eyeRow),     PAL['#'], s);
    px(ctx, fX(f.eyeL + 1), fY(f.eyeRow),     PAL['#'], s);
    px(ctx, fX(f.eyeL + 1), fY(f.eyeRow + 1), PAL['#'], s);
    px(ctx, fX(f.eyeR),     fY(f.eyeRow),     PAL['#'], s);
    px(ctx, fX(f.eyeR + 1), fY(f.eyeRow),     PAL['#'], s);
    px(ctx, fX(f.eyeR),     fY(f.eyeRow + 1), PAL['#'], s);
    // Trauriger Mund (∩)
    px(ctx, fX(f.eyeL),     fY(f.mouthRow + 1), PAL['#'], s);
    px(ctx, fX(f.eyeR + 1), fY(f.mouthRow + 1), PAL['#'], s);
    for (let i = f.eyeL; i <= f.eyeR + 1; i++) {
      px(ctx, fX(i), fY(f.mouthRow), PAL['#'], s);
    }
  } else {
    // Normale Augen (2×2 Blöcke)
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        px(ctx, fX(f.eyeL + dx), fY(f.eyeRow + dy), PAL['#'], s);
        px(ctx, fX(f.eyeR + dx), fY(f.eyeRow + dy), PAL['#'], s);
      }
    }
    // Kleiner normaler Mund
    for (let i = f.eyeL + 1; i <= f.eyeR; i++) {
      px(ctx, fX(i), fY(f.mouthRow + 1), PAL['#'], s);
    }
  }
}

function clearLcd(ctx, w, h) {
  ctx.fillStyle = '#9bbc0f';
  ctx.fillRect(0, 0, w, h);
}

// ── Haupt-Canvas-Animation ────────────────────────────────────────────────────

const tamaCanvas = document.getElementById('tama-canvas');
const tamaCtx = tamaCanvas.getContext('2d');
const miniCanvas = document.getElementById('mini-canvas');
const miniCtx = miniCanvas.getContext('2d');
const evoCanvas = document.getElementById('evo-canvas');
const evoCtx = evoCanvas.getContext('2d');

let animFrame = 0;
let currentMood = 'normal';
let moodTimer = 0;
let isEvoPlaying = false;
let evoAnimFrame = 0;

function renderTama() {
  const W = tamaCanvas.width;   // 160
  const H = tamaCanvas.height;  // 128
  clearLcd(tamaCtx, W, H);

  if (moodTimer > 0) { moodTimer--; }
  else { currentMood = 'normal'; }

  // Sprite zentrieren: 16px × SCALE = 112px; Offset = (160-112)/2 = 24, (128-112)/2 = 8
  const offX = Math.floor((W - 16 * SCALE) / 2);
  const offY = Math.floor((H - 16 * SCALE) / 2) - 4;

  drawSprite(tamaCtx, state.stage, offX, offY, SCALE, currentMood, animFrame);

  // Glanz-Overlay
  tamaCtx.fillStyle = 'rgba(155,188,15,0.08)';
  tamaCtx.fillRect(offX, offY, 16 * SCALE, 2);
}

function renderMini() {
  const s = 2;  // Skala für Mini-Canvas (40px / 16 = 2.5 → 2)
  clearLcd(miniCtx, 40, 40);
  const offX = Math.floor((40 - 16 * s) / 2);
  const offY = Math.floor((40 - 16 * s) / 2);
  drawSprite(miniCtx, state.stage, offX, offY, s, 'normal', 0);
}

let rafId = null;

function animLoop() {
  animFrame++;
  renderTama();
  rafId = requestAnimationFrame(animLoop);
}

// ── Evolution-Animation ───────────────────────────────────────────────────────

function renderEvo(stageIdx) {
  const W = evoCanvas.width;   // 160
  const H = evoCanvas.height;  // 160
  const s = 8;

  evoCtx.fillStyle = '#9bbc0f';
  evoCtx.fillRect(0, 0, W, H);

  const offX = Math.floor((W - 16 * s) / 2);
  const offY = Math.floor((H - 16 * s) / 2);
  drawSprite(evoCtx, stageIdx, offX, offY, s, 'happy', evoAnimFrame);
}

function startEvoAnim(stageIdx) {
  evoAnimFrame = 0;
  const tick = () => {
    evoAnimFrame++;
    renderEvo(stageIdx);
    if (isEvoPlaying) requestAnimationFrame(tick);
  };
  isEvoPlaying = true;
  requestAnimationFrame(tick);
}

function stopEvoAnim() {
  isEvoPlaying = false;
}

// ── UI-Helfer ─────────────────────────────────────────────────────────────────

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function updateMainHUD() {
  document.getElementById('stage-name').textContent = STAGE_INFO[state.stage].name;
  document.getElementById('stage-num').textContent = state.stage;
  document.getElementById('total-xp').textContent = state.totalCorrect;

  // XP-Punkte anzeigen (10 Dots)
  const dotsEl = document.getElementById('xp-dots');
  dotsEl.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const d = document.createElement('span');
    d.className = 'xp-dot' + (i < state.xp ? ' filled' : '');
    dotsEl.appendChild(d);
  }

  renderMini();
}

function spawnSparkles() {
  const emojis = ['⭐', '✨', '🌟', '💫', '★'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.className = 'sparkle';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top  = (Math.random() * 40 - 20) + 'vh';
    el.style.fontSize = (12 + Math.random() * 16) + 'px';
    el.style.animationDelay = (Math.random() * 0.8) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

// ── Quiz-Logik ────────────────────────────────────────────────────────────────

let currentSubject = 'mathe';
let currentQuestion = null;
let questionAnswered = false;
let sessionCorrect = 0;
let currentStreak = 0;

function setSubject(subj) {
  currentSubject = subj;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.subject === subj);
  });
  loadNextQuestion();
}

function loadNextQuestion() {
  questionAnswered = false;
  currentQuestion = getQuestion(currentSubject);

  document.getElementById('question-text').textContent = currentQuestion.q;
  document.getElementById('feedback-panel').classList.remove('visible');

  const grid = document.getElementById('answer-grid');
  grid.innerHTML = '';

  // Antwort-Buttons
  currentQuestion.o.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.className = 'ans-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => handleAnswer(idx, btn));
    grid.appendChild(btn);
  });

  updateXpBar();
}

function updateXpBar() {
  const pct = (state.xp / 10) * 100;
  document.getElementById('xp-bar').style.width = pct + '%';
  const remaining = 10 - state.xp;
  document.getElementById('xp-bar-label').textContent =
    state.stage < 4
      ? `${state.xp} / 10 XP – noch ${remaining} bis zur Entwicklung!`
      : `MAX STUFE erreicht! 🏆`;
  document.getElementById('quiz-correct').textContent = state.totalCorrect;
}

function handleAnswer(idx, btnEl) {
  if (questionAnswered) return;
  questionAnswered = true;
  soundClick();

  const correct = idx === currentQuestion.a;
  const allBtns = document.querySelectorAll('.ans-btn');

  // Richtiges Antwort-Button grün, falsches rot
  allBtns.forEach((b, i) => {
    b.disabled = true;
    if (i === currentQuestion.a) b.classList.add('correct');
    if (i === idx && !correct) b.classList.add('wrong');
  });

  if (correct) {
    soundCorrect();
    currentMood = 'happy';
    moodTimer = 90;
    currentStreak++;
    sessionCorrect++;

    state.totalCorrect++;
    state.subjectCorrect[currentSubject]++;
    if (currentStreak > state.bestStreak) state.bestStreak = currentStreak;

    if (state.stage < 4) {
      state.xp++;
      if (state.xp >= 10) {
        state.xp = 0;
        state.stage++;
        saveState();
        setTimeout(showEvolution, 800);
        return;
      }
    }

    showFeedback(true, 'Richtig! ⭐ Super gemacht!');
  } else {
    soundWrong();
    currentMood = 'sad';
    moodTimer = 60;
    currentStreak = 0;
    const correctText = currentQuestion.o[currentQuestion.a];
    showFeedback(false, `Nicht ganz...\nDie Antwort war:\n"${correctText}"`);
  }

  saveState();
  updateMainHUD();
  updateXpBar();
}

function showFeedback(isCorrect, text) {
  const panel = document.getElementById('feedback-panel');
  document.getElementById('feedback-icon').textContent = isCorrect ? '🎉' : '😢';
  document.getElementById('feedback-text').textContent = text;
  panel.classList.add('visible');
}

// ── Evolution ─────────────────────────────────────────────────────────────────

function showEvolution() {
  const stage = state.stage;
  const info = STAGE_INFO[stage];

  document.getElementById('evo-name').textContent = info.name;
  document.getElementById('evo-desc').textContent = info.desc;

  soundEvolution();
  spawnSparkles();
  startEvoAnim(stage);
  showView('view-evo');
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function showStats() {
  document.getElementById('stat-total').textContent    = state.totalCorrect;
  document.getElementById('stat-stage').textContent    = state.stage;
  document.getElementById('stat-mathe').textContent    = state.subjectCorrect.mathe;
  document.getElementById('stat-deutsch').textContent  = state.subjectCorrect.deutsch;
  document.getElementById('stat-englisch').textContent = state.subjectCorrect.englisch;
  document.getElementById('stat-streak').textContent   = state.bestStreak;

  buildEvoTimeline();
  showView('view-stats');
}

function buildEvoTimeline() {
  const container = document.getElementById('evo-stages');
  container.innerHTML = '';

  STAGE_INFO.forEach((info, i) => {
    const item = document.createElement('div');
    item.className = 'evo-stage-item' + (i <= state.stage ? ' unlocked' : '');

    const cvs = document.createElement('canvas');
    cvs.width = 32; cvs.height = 32;
    cvs.className = 'evo-stage-canvas' + (i <= state.stage ? ' unlocked' : '');

    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(0, 0, 32, 32);
    const s = 2;
    const offX = Math.floor((32 - 16 * s) / 2);
    const offY = Math.floor((32 - 16 * s) / 2);
    drawSprite(ctx, i, offX, offY, s, 'normal', 0);

    const lbl = document.createElement('div');
    lbl.className = 'evo-stage-label';
    lbl.textContent = info.name + '\n' + (i === 0 ? '0 XP' : `${i * 10} XP`);

    item.appendChild(cvs);
    item.appendChild(lbl);
    container.appendChild(item);
  });
}

// ── Event-Listener ────────────────────────────────────────────────────────────

document.getElementById('btn-learn').addEventListener('click', () => {
  soundClick();
  sessionCorrect = 0;
  currentStreak = 0;
  showView('view-quiz');
  loadNextQuestion();
  renderMini();
  updateXpBar();
});

document.getElementById('btn-stats').addEventListener('click', () => {
  soundClick();
  showStats();
});

document.getElementById('btn-back').addEventListener('click', () => {
  soundClick();
  showView('view-main');
  updateMainHUD();
});

document.getElementById('btn-stats-back').addEventListener('click', () => {
  soundClick();
  showView('view-main');
});

document.getElementById('btn-next').addEventListener('click', () => {
  soundClick();
  loadNextQuestion();
});

document.getElementById('btn-evo-continue').addEventListener('click', () => {
  soundClick();
  stopEvoAnim();
  spawnSparkles();
  showView('view-quiz');
  updateMainHUD();
  loadNextQuestion();
  updateXpBar();
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    soundClick();
    setSubject(btn.dataset.subject);
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────

updateMainHUD();
animLoop();
