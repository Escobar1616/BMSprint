// ============================================================
// BMSprint - 1:1 spec layout implementation
// (forked from SprinTaiko)
// ============================================================

// --- DOM 要素 ---
const dom = {
  baseWindow: document.getElementById("base-window"),
  countdownDisplay: document.getElementById("countdown"),
  notesDisplays: document.querySelectorAll(".notes-display"),
  notebasesContainers: document.querySelectorAll(".notebases"),
  keysContainers: document.querySelectorAll(".keys-container"),
  timerCurrents: document.querySelectorAll(".timer-current"),
  progressBar: document.getElementById("progress-bar"),
  timerDisplay: document.getElementById("timer"),
  missDisplay: document.getElementById("miss"),
  remainingNotesDisplay: document.getElementById("remaining-notes"),
  startButton: document.getElementById("start-button"),
  bottomWrapper: document.getElementById("bottom-wrapper"),
  clearTimeDisplay: document.getElementById("clear-time"),
  finalScoreDisplay: document.getElementById("final-score"),
  penaltyCountDisplay: document.getElementById("penalty-count"),
  kpsDisplay: document.getElementById("kps-display"),
  postToXBtn: document.getElementById("post-to-x-btn"),
  rankingList: document.getElementById("ranking-list"),
  rankingInfo: document.getElementById("ranking-info"),
  speedDisplay: document.getElementById("speed-display"),
  speedUpBtn: document.getElementById("speed-up-btn"),
  speedDownBtn: document.getElementById("speed-down-btn"),
  notesCountInput: document.getElementById("notes-count-input"),
  barLineInput: document.getElementById("bar-line-input"),
  scratchToggle: document.getElementById("scratch-toggle"),
  fiveKeyToggle: document.getElementById("five-key-toggle"),
  modeBtns: document.querySelectorAll(".mode-btn"),
  settingsPanel: document.getElementById("settings-panel"),
  openSettingsBtn: document.getElementById("open-settings-btn"),
  closeSettingsBtn: document.getElementById("close-settings-btn"),
  resetSoundsBtn: document.getElementById("reset-sounds-btn"),
  soundFileInputs: document.querySelectorAll(".sound-file-input"),
  singleResetSoundBtns: document.querySelectorAll(".reset-single-sound-btn"),
  helpPanel: document.getElementById("help-panel"),
  openHelpBtn: document.getElementById("open-help-btn"),
  closeHelpBtn: document.getElementById("close-help-btn"),
  resetRankingBtn: document.getElementById("reset-ranking-btn"),
  volumeSlider: document.getElementById("volume-slider"),
  volumeDisplay: document.getElementById("volume-display"),
  versionDisplay: document.getElementById("version-display"),
  advancedSettingsPanel: document.getElementById("advanced-settings-panel"),
  openAdvancedSettingsBtn: document.getElementById(
    "open-advanced-settings-btn",
  ),
  closeAdvancedSettingsBtn: document.getElementById(
    "close-advanced-settings-btn",
  ),
  animationSpeedSlider: document.getElementById("animation-speed-slider"),
  animationSpeedDisplay: document.getElementById("animation-speed-display"),
  resetKeyConfigBtn: document.getElementById("reset-key-config-btn"),
  seedInput: document.getElementById("seed-input"),
  keyTabBtns: document.querySelectorAll(".key-tab-btn"),
  keyConfigSections: document.querySelectorAll(".key-config-section"),
  keyConfigBtns: document.querySelectorAll(".key-config-btn"),
  colorScratch: document.getElementById("color-scratch"),
  colorWhite: document.getElementById("color-white"),
  colorBlue: document.getElementById("color-blue"),
  colorJudgment: document.getElementById("color-judgment"),
  stopOffsetInput: document.getElementById("stop-offset-input"),
  probChord1: document.getElementById("prob-chord-1"),
  probChord2: document.getElementById("prob-chord-2"),
  probChord3: document.getElementById("prob-chord-3"),
  probChord4: document.getElementById("prob-chord-4"),
  probChord5: document.getElementById("prob-chord-5"),
  probChord6: document.getElementById("prob-chord-6"),
  probChord7: document.getElementById("prob-chord-7"),
  probChord8: document.getElementById("prob-chord-8"),
};

// --- 定数 ---
const VERSION = "v2026.05.11.1";
const STORAGE_PREFIX = "bmsprint-";
const RANKING_KEY = STORAGE_PREFIX + "ranking";
const HISPEED_KEY = STORAGE_PREFIX + "hispeed";
const NOTES_COUNT_KEY = STORAGE_PREFIX + "notes-count";
const VOLUME_KEY = STORAGE_PREFIX + "volume";
const ANIMATION_SPEED_KEY = STORAGE_PREFIX + "animation-speed";
const KEY_CONFIG_KEY = STORAGE_PREFIX + "key-config";
const BAR_LINE_KEY = STORAGE_PREFIX + "bar-line";
const SCRATCH_ENABLED_KEY = STORAGE_PREFIX + "scratch-enabled";
const FIVE_KEY_MODE_KEY = STORAGE_PREFIX + "five-key-mode";
const SEED_KEY = STORAGE_PREFIX + "seed";
const COLORS_KEY = STORAGE_PREFIX + "colors";
const STOP_OFFSET_KEY = STORAGE_PREFIX + "stop-offset";
const CHORD_PROBS_KEY = STORAGE_PREFIX + "chord-probs";
const CUSTOM_SOUND_KEY_PREFIX = STORAGE_PREFIX + "sound-";

const RANKING_SIZE = 5;
const SIDES = ["left", "right"];
const CHORD_WINDOW_MS = 300;
const MISS_PENALTY_TIME = 500;
const COUNTDOWN_INTERVAL = 500;

// ============================================================
// SPEC: 仕様書から起こした寸法・色情報
// すべて 1920×919 base 上の値 -> CSS 計算で % に変換
// lane-base-3 = 432×723 内のローカル座標で notebase / 判定線 / 小節線を扱う
// ============================================================

// notebase x オフセット (lane-base-3 の x=0 を基準)
// (元のグローバル x から lane-base-3 開始 x=75 を引いた値)
const NOTEBASE_SPEC = {
  // lane: { localX(px), w(px), bgColor, noteColor, keyType }
  0: { localX: 0,   w: 90, bg: "#090909", noteColor: "var(--color-scratch)", keyType: "scratch" },
  1: { localX: 92,  w: 52, bg: "#1c1c1c", noteColor: "var(--color-white)", keyType: "white" },
  2: { localX: 146, w: 40, bg: "#090909", noteColor: "var(--color-blue)", keyType: "blue" },
  3: { localX: 188, w: 52, bg: "#1c1c1c", noteColor: "var(--color-white)", keyType: "white" },
  4: { localX: 242, w: 40, bg: "#090909", noteColor: "var(--color-blue)", keyType: "blue" },
  5: { localX: 284, w: 52, bg: "#1c1c1c", noteColor: "var(--color-white)", keyType: "white" },
  6: { localX: 338, w: 40, bg: "#090909", noteColor: "var(--color-blue)", keyType: "blue" },
  7: { localX: 380, w: 52, bg: "#1c1c1c", noteColor: "var(--color-white)", keyType: "white" },
};
const LANE_BASE_3_W = 432;
const LANE_BASE_3_H = 723;
const JUDGMENT_TOP_PX = 716;       // 判定ライン top y (lane-base-3 内)
const DEFAULT_BAR_LINE_Y = 202;    // i=8 の小節線位置 -> オフセット導出
const NOTE_HEIGHT_PX = 12;

// 1ノート間オフセット (hi-speed 1.0): (716-202)/8 = 64.25 px = 8.886%
const BASE_OFFSET_PX = (JUDGMENT_TOP_PX - DEFAULT_BAR_LINE_Y) / 8;
const BASE_OFFSET_PCT = (BASE_OFFSET_PX / LANE_BASE_3_H) * 100;
const JUDGMENT_TOP_PCT = (JUDGMENT_TOP_PX / LANE_BASE_3_H) * 100; // 99.031

// lane-base-3 内の % で表現したレーン位置 (左側)
function pctOfLaneBase3(px) { return (px / LANE_BASE_3_W) * 100; }

const LANE_LAYOUT_LEFT = {};
for (const lane of [0, 1, 2, 3, 4, 5, 6, 7]) {
  const s = NOTEBASE_SPEC[lane];
  LANE_LAYOUT_LEFT[lane] = {
    left: pctOfLaneBase3(s.localX),
    width: pctOfLaneBase3(s.w),
  };
}

// 右側はスクラッチを右端に、1〜7鍵盤を左側(1から順)に配置
const LANE_LAYOUT_RIGHT = {};
for (const laneStr in LANE_LAYOUT_LEFT) {
  const lane = parseInt(laneStr, 10);
  let newLocalX;
  if (lane === 0) {
    newLocalX = LANE_BASE_3_W - NOTEBASE_SPEC[0].w;
  } else {
    newLocalX = NOTEBASE_SPEC[lane].localX - NOTEBASE_SPEC[1].localX;
  }
  LANE_LAYOUT_RIGHT[lane] = {
    left: pctOfLaneBase3(newLocalX),
    width: pctOfLaneBase3(NOTEBASE_SPEC[lane].w),
  };
}

const LANE_LAYOUT = { left: LANE_LAYOUT_LEFT, right: LANE_LAYOUT_RIGHT };

// キーベース仕様: lane -> { localX(px in sp-base 540 幅), localY, w, h }
// 内側 (key-inner) は (3,2) オフセット
// scratch は別扱い (key-scratch)
const KEY_BASE_SPEC = {
  1: { type: "white", x: 171, y: 737, w: 44, h: 73 },
  2: { type: "blue",  x: 223, y: 730, w: 36, h: 62 },
  3: { type: "white", x: 267, y: 737, w: 44, h: 73 },
  4: { type: "blue",  x: 319, y: 730, w: 36, h: 62 },
  5: { type: "white", x: 363, y: 737, w: 44, h: 73 },
  6: { type: "blue",  x: 415, y: 730, w: 36, h: 62 },
  7: { type: "white", x: 459, y: 737, w: 44, h: 73 },
};

const DEFAULT_KEY_CONFIG = {
  left_scratch_up: "ShiftLeft",
  left_scratch_down: null,
  left_key1: "z",
  left_key2: "s",
  left_key3: "x",
  left_key4: "d",
  left_key5: "c",
  left_key6: "f",
  left_key7: "v",
  right_scratch_up: "ShiftRight",
  right_scratch_down: null,
  right_key1: ",",
  right_key2: "l",
  right_key3: ".",
  right_key4: ";",
  right_key5: "/",
  right_key6: ":",
  right_key7: "\\",
};

// --- 音声 ---
let audioContext;
let masterGainNode;
const audioBuffers = {};
const playingSources = {};
const AUDIO_FILES = {
  don: "audio/don.ogg",
  ka: "audio/ka.ogg",
  miss: "audio/miss.ogg",
  clear: "audio/clear.ogg",
  countdown: "audio/countdown.ogg",
  cancel: "audio/cancel.ogg",
};
let isAudioLoaded = false;

// --- ゲーム状態 ---
const gameState = {
  sequence: [],
  currentIndex: 0,
  startTime: 0,
  missCount: 0,
  isActive: false,
  isStarting: false,

  hiSpeed: 1.0,
  notesCount: 100,
  volume: 0.25,
  barLineInterval: 8,
  scratchEnabled: true,
  fiveKeyMode: false,
  mode: "SP",
  seed: "",
  colors: { scratch: "#be0707", white: "#e1e1e1", blue: "#1107be", judgment: "#db0000" },
  stopOffset: -12,
  chordProbs: [85, 10, 5, 0, 0, 0, 0, 0],

  keyConfig: { ...DEFAULT_KEY_CONFIG },

  // スクロール (% of lane-base-3 height)
  scrollPct: 0,
  animationStartTime: 0,
  animationStartScrollPct: 0,
  animationEndScrollPct: 0,

  // 同時押し
  chordStarted: false,
  chordStartTime: 0,
  pressedLanes: new Set(),
};

let keyToAction = {};
let timerInterval = null;

// ============================================================
// 音声
// ============================================================
function initAudioContext() {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGainNode = audioContext.createGain();
    masterGainNode.connect(audioContext.destination);
    updateVolume(gameState.volume, false);
  } catch (e) {
    console.error("Web Audio API is not supported");
  }
}

async function loadAudio(url) {
  if (!audioContext) return;
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
}

async function loadAllAudio() {
  if (!audioContext || isAudioLoaded) return;
  const customSoundPromises = Object.keys(AUDIO_FILES).map(async (key) => {
    const dataUrl = localStorage.getItem(CUSTOM_SOUND_KEY_PREFIX + key);
    if (dataUrl) {
      try {
        const response = await fetch(dataUrl);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffers[key] = await audioContext.decodeAudioData(arrayBuffer);
      } catch (e) {
        console.error(`Failed to load custom sound for ${key}:`, e);
      }
    }
  });
  await Promise.all(customSoundPromises);
  const loadPromises = Object.entries(AUDIO_FILES).map(async ([key, path]) => {
    if (!audioBuffers[key]) audioBuffers[key] = await loadAudio(path);
  });
  await Promise.all(loadPromises);
  isAudioLoaded = true;
}

function playSound(soundKey) {
  const buffer = audioBuffers[soundKey];
  if (!audioContext || !buffer) return;
  if (playingSources[soundKey]) {
    try { playingSources[soundKey].stop(); } catch (_) {}
  }
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(masterGainNode);
  source.onended = () => {
    if (playingSources[soundKey] === source) playingSources[soundKey] = null;
  };
  source.start(0);
  playingSources[soundKey] = source;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ============================================================
// ランキング
// ============================================================
function loadRanking() {
  const json = localStorage.getItem(RANKING_KEY);
  return json ? JSON.parse(json) : [];
}

function displayRanking(newRecord = null) {
  const ranking = loadRanking();
  dom.rankingList.innerHTML = "";
  for (let i = 0; i < RANKING_SIZE; i++) {
    const li = document.createElement("li");
    const rank = `${i + 1}.`;
    const scoreData = ranking[i];
    if (scoreData) {
      li.innerHTML = `<span class="rank">${rank}</span> <span class="score">${scoreData.score}</span> <span class="miss">Miss: ${scoreData.missCount ?? 0}</span>`;
      if (newRecord && scoreData.score === newRecord.score && scoreData.missCount === newRecord.missCount) {
        li.classList.add("new-record");
      }
    } else {
      li.innerHTML = `<span class="rank">${rank}</span> <span class="score">-</span>`;
    }
    dom.rankingList.appendChild(li);
  }
}

// ============================================================
// 乱数 (Mulberry32)
// ============================================================
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// ============================================================
// 譜面生成
// ============================================================
function getAvailableLanes() {
  const lanes = [];
  if (gameState.scratchEnabled) lanes.push(0);
  for (let i = 1; i <= 7; i++) {
    if (gameState.fiveKeyMode && (i === 6 || i === 7)) continue;
    lanes.push(i);
  }
  return lanes;
}

function generateNotes() {
  gameState.sequence = [];
  const available = getAvailableLanes();
  if (available.length === 0) return;

  const random = gameState.seed
    ? mulberry32(stringToSeed(gameState.seed))
    : Math.random;

  for (let i = 0; i < gameState.notesCount; i++) {
    const probs = gameState.chordProbs || [85, 10, 5, 0, 0, 0, 0, 0];
    let totalWeight = 0;
    for (let j = 0; j < probs.length; j++) totalWeight += Math.max(0, probs[j]);
    
    let chordSize = 1;
    if (totalWeight > 0) {
      let rollWeight = random() * totalWeight;
      for (let j = 0; j < probs.length; j++) {
        if (probs[j] <= 0) continue;
        rollWeight -= probs[j];
        if (rollWeight <= 0) {
          chordSize = j + 1;
          break;
        }
      }
    }
    chordSize = Math.min(chordSize, available.length);

    const pool = [...available];
    const lanes = [];
    for (let j = 0; j < chordSize; j++) {
      const pickIdx = Math.floor(random() * pool.length);
      lanes.push(pool[pickIdx]);
      pool.splice(pickIdx, 1);
    }
    lanes.sort((a, b) => a - b);
    gameState.sequence.push({ lanes });
  }
}

// ============================================================
// レイアウト / ビジュアル構築
// ============================================================

// hi-speed を反映したノートオフセット (% of lane-base-3 height)
function getNoteOffsetPct() {
  return BASE_OFFSET_PCT * gameState.hiSpeed;
}

// ノートクラス (色決定用)
function getNoteVisualClass(lane) {
  if (lane === 0) return "scratch";
  if (lane === 2 || lane === 4 || lane === 6) return "blue";
  return "white";
}

// 各サイドの notebases と keys を初回に構築
function buildStaticVisuals() {
  for (const side of SIDES) {
    buildNotebases(side);
    buildKeys(side);
  }
}

function buildNotebases(side) {
  const container = document.querySelector(`.notebases[data-side="${side}"]`);
  if (!container) return;
  container.innerHTML = "";
  const layout = LANE_LAYOUT[side];
  for (const laneStr of Object.keys(layout)) {
    const lane = parseInt(laneStr, 10);
    const spec = NOTEBASE_SPEC[lane];
    const el = document.createElement("div");
    el.classList.add("notebase");
    el.dataset.lane = lane;
    el.style.left = `${layout[lane].left}%`;
    el.style.width = `${layout[lane].width}%`;
    el.style.background = spec.bg;
    container.appendChild(el);
  }
}

function buildKeys(side) {
  const container = document.querySelector(`.keys-container[data-side="${side}"]`);
  if (!container) return;
  container.innerHTML = "";

  // スクラッチキー
  const scratch = document.createElement("div");
  scratch.classList.add("key-scratch");
  scratch.dataset.side = side;
  scratch.dataset.lane = "0";
  container.appendChild(scratch);

  // 7つのキー (base + inner)
  for (const laneStr of Object.keys(KEY_BASE_SPEC)) {
    const lane = parseInt(laneStr, 10);
    const spec = KEY_BASE_SPEC[lane];
    const base = document.createElement("div");
    base.classList.add("key-base", spec.type);
    base.dataset.key = String(lane);
    base.dataset.side = side;

    const inner = document.createElement("div");
    inner.classList.add("key-inner");
    inner.dataset.side = side;
    inner.dataset.lane = String(lane);
    base.appendChild(inner);
    container.appendChild(base);
  }
}

// ノーツと小節線を描画
function renderNotes() {
  const offsetPct = getNoteOffsetPct();

  for (const side of SIDES) {
    const display = document.querySelector(`.notes-display[data-side="${side}"]`);
    if (!display) continue;
    display.innerHTML = "";
    const fragment = document.createDocumentFragment();
    const layout = LANE_LAYOUT[side];

    for (let i = 0; i < gameState.sequence.length; i++) {
      const chord = gameState.sequence[i];
      // note i top = 判定ライン (716) から i*offset 上
      const topPct = JUDGMENT_TOP_PCT - i * offsetPct;
      const topCss = `calc(${topPct}% + var(--note-stop-offset-px, 0px))`;

      for (const lane of chord.lanes) {
        const spec = NOTEBASE_SPEC[lane];
        const noteEl = document.createElement("div");
        noteEl.classList.add("note", getNoteVisualClass(lane));
        noteEl.dataset.index = i;
        noteEl.dataset.lane = lane;
        noteEl.style.left = `${layout[lane].left}%`;
        noteEl.style.width = `${layout[lane].width}%`;
        noteEl.style.top = topCss;
        noteEl.style.background = spec.noteColor;
        fragment.appendChild(noteEl);
      }

      // 小節線 (i > 0 で interval 倍数)
      if (
        gameState.barLineInterval > 0 &&
        i > 0 &&
        i % gameState.barLineInterval === 0
      ) {
        const barEl = document.createElement("div");
        barEl.classList.add("bar-line-note");
        barEl.style.top = topCss;
        fragment.appendChild(barEl);
      }
    }
    display.appendChild(fragment);
  }
  updateRemainingNotes();
}

// hi-speed 変更時にノーツ位置だけ再計算
function rerenderNotePositions() {
  const offsetPct = getNoteOffsetPct();
  for (const side of SIDES) {
    const display = document.querySelector(`.notes-display[data-side="${side}"]`);
    if (!display) continue;
    display.querySelectorAll(".note").forEach((note) => {
      const i = parseInt(note.dataset.index, 10);
      note.style.top = `calc(${JUDGMENT_TOP_PCT - i * offsetPct}% + var(--note-stop-offset-px, 0px))`;
    });
    // 小節線
    const bars = display.querySelectorAll(".bar-line-note");
    let barIdx = 0;
    for (let i = 0; i < gameState.sequence.length; i++) {
      if (gameState.barLineInterval > 0 && i > 0 && i % gameState.barLineInterval === 0) {
        if (bars[barIdx]) {
          bars[barIdx].style.top = `calc(${JUDGMENT_TOP_PCT - i * offsetPct}% + var(--note-stop-offset-px, 0px))`;
          barIdx++;
        }
      }
    }
  }
}

function clearAllNotes() {
  for (const display of dom.notesDisplays) display.innerHTML = "";
}

function applyScroll(instant) {
  for (const display of dom.notesDisplays) {
    if (instant) display.style.transition = "none";
    display.style.transform = `translateY(${gameState.scrollPct}%)`;
    if (instant) {
      void display.offsetHeight;
      display.style.transition = "";
    }
  }
}

// ============================================================
// UI 更新
// ============================================================
function updateTimer() {
  const elapsed = Date.now() - gameState.startTime;
  dom.timerDisplay.textContent = (elapsed / 1000).toFixed(2);
}

function updateRemainingNotes() {
  dom.remainingNotesDisplay.textContent =
    gameState.notesCount - gameState.currentIndex;
}

function updateProgressBar() {
  const progress = (gameState.currentIndex / gameState.notesCount) * 100;
  dom.progressBar.style.width = `${progress}%`;
  updateTimerGauge();
}

function updateTimerGauge() {
  // timer-current: top range 0% (= y=56) ~ 98.101% (= y=676) within timer-gage-2
  const progress = gameState.notesCount > 0
    ? gameState.currentIndex / gameState.notesCount
    : 0;
  const topPct = progress * 98.101;
  for (const tc of dom.timerCurrents) {
    tc.style.top = `${topPct}%`;
  }
}

function resetTimerGauge() {
  for (const tc of dom.timerCurrents) tc.style.top = "0%";
}

function updateHiSpeed(newSpeed) {
  gameState.hiSpeed = Math.max(0.2, Math.min(newSpeed, 5.0));
  const speed = gameState.hiSpeed.toFixed(1);
  dom.speedDisplay.textContent = speed;
  document.documentElement.style.setProperty("--hi-speed", speed);
  localStorage.setItem(HISPEED_KEY, speed);
  if (gameState.sequence.length > 0) {
    rerenderNotePositions();
    if (gameState.isActive) {
      gameState.scrollPct = gameState.currentIndex * getNoteOffsetPct();
      gameState.animationStartTime = 0;
      applyScroll(true);
    }
  }
}

function updateNotesCount(newCount) {
  gameState.notesCount = Math.max(10, parseInt(newCount, 10) || 100);
  dom.notesCountInput.value = gameState.notesCount;
  dom.remainingNotesDisplay.textContent = gameState.notesCount;
  localStorage.setItem(NOTES_COUNT_KEY, gameState.notesCount);
}

function updateBarLineInterval(newInterval) {
  gameState.barLineInterval = Math.max(0, parseInt(newInterval, 10) || 0);
  dom.barLineInput.value = gameState.barLineInterval;
  localStorage.setItem(BAR_LINE_KEY, gameState.barLineInterval);
}

function updateVolume(newVolume, save = true) {
  gameState.volume = Math.max(0.0, Math.min(newVolume, 1.0));
  if (masterGainNode) masterGainNode.gain.value = gameState.volume;
  dom.volumeSlider.value = gameState.volume;
  dom.volumeDisplay.textContent = Math.round(gameState.volume * 100);
  if (save) localStorage.setItem(VOLUME_KEY, gameState.volume);
}

function updateAnimationSpeed(newDuration, save = true) {
  const duration = Math.max(0.0, Math.min(newDuration, 0.3)).toFixed(2);
  document.documentElement.style.setProperty("--note-scroll-duration", `${duration}s`);
  dom.animationSpeedSlider.value = duration;
  dom.animationSpeedDisplay.textContent = duration;
  if (save) localStorage.setItem(ANIMATION_SPEED_KEY, duration);
}

function updateScratchEnabled(enabled, save = true) {
  gameState.scratchEnabled = !!enabled;
  dom.scratchToggle.checked = gameState.scratchEnabled;
  if (save) localStorage.setItem(SCRATCH_ENABLED_KEY, gameState.scratchEnabled);
}

function updateFiveKeyMode(enabled, save = true) {
  gameState.fiveKeyMode = !!enabled;
  dom.fiveKeyToggle.checked = gameState.fiveKeyMode;
  if (save) localStorage.setItem(FIVE_KEY_MODE_KEY, gameState.fiveKeyMode);
}

function updateSeed(newSeed) {
  gameState.seed = (newSeed || "").trim();
  dom.seedInput.value = gameState.seed;
  localStorage.setItem(SEED_KEY, gameState.seed);
}

function updateColors(colors, save = true) {
  gameState.colors = colors;
  document.documentElement.style.setProperty("--color-scratch", colors.scratch);
  document.documentElement.style.setProperty("--color-white", colors.white);
  document.documentElement.style.setProperty("--color-blue", colors.blue);
  document.documentElement.style.setProperty("--color-judgment", colors.judgment);
  dom.colorScratch.value = colors.scratch;
  dom.colorWhite.value = colors.white;
  dom.colorBlue.value = colors.blue;
  dom.colorJudgment.value = colors.judgment;
  if (save) localStorage.setItem(COLORS_KEY, JSON.stringify(colors));
}

function updateStopOffset(offset, save = true) {
  gameState.stopOffset = offset;
  document.documentElement.style.setProperty("--note-stop-offset-px", offset + "px");
  dom.stopOffsetInput.value = offset;
  if (save) localStorage.setItem(STOP_OFFSET_KEY, offset);
}

function updateChordProbs(probs, save = true) {
  gameState.chordProbs = probs;
  dom.probChord1.value = probs[0];
  dom.probChord2.value = probs[1];
  dom.probChord3.value = probs[2];
  dom.probChord4.value = probs[3];
  dom.probChord5.value = probs[4];
  dom.probChord6.value = probs[5];
  dom.probChord7.value = probs[6];
  dom.probChord8.value = probs[7];
  if (save) localStorage.setItem(CHORD_PROBS_KEY, JSON.stringify(probs));
}

// ============================================================
// キーバインド
// ============================================================
function getKeyId(event) {
  if (event.key === "Shift") {
    return event.location === 1 ? "ShiftLeft" : "ShiftRight";
  }
  if (event.code === "ShiftLeft" || event.code === "ShiftRight") return event.code;
  return event.key.length === 1 ? event.key.toLowerCase() : event.key;
}

function displayKeyId(keyId) {
  if (!keyId) return "-";
  if (keyId === "ShiftLeft") return "L-Shift";
  if (keyId === "ShiftRight") return "R-Shift";
  if (keyId === " ") return "Space";
  if (keyId.length === 1) return keyId.toUpperCase();
  return keyId;
}

function rebuildKeyMaps() {
  keyToAction = {};
  for (const action in gameState.keyConfig) {
    const keyId = gameState.keyConfig[action];
    if (keyId) keyToAction[keyId] = action;
  }
}

function actionToLane(action) {
  if (action.includes("scratch")) return 0;
  const m = action.match(/key(\d)/);
  return m ? parseInt(m[1], 10) : null;
}
function actionToSide(action) {
  return action.startsWith("left") ? "left" : "right";
}

function refreshKeyConfigUI() {
  for (const action in gameState.keyConfig) {
    const btn = document.querySelector(`.key-config-btn[data-action="${action}"]`);
    if (btn) btn.textContent = displayKeyId(gameState.keyConfig[action]);
  }
}

function updateKeyConfig(partial) {
  gameState.keyConfig = { ...gameState.keyConfig, ...partial };
  rebuildKeyMaps();
  refreshKeyConfigUI();
  localStorage.setItem(KEY_CONFIG_KEY, JSON.stringify(gameState.keyConfig));
}

function resetKeyConfig() {
  gameState.keyConfig = { ...DEFAULT_KEY_CONFIG };
  rebuildKeyMaps();
  refreshKeyConfigUI();
  localStorage.setItem(KEY_CONFIG_KEY, JSON.stringify(gameState.keyConfig));
}

// ============================================================
// ゲームフロー
// ============================================================
async function startGame() {
  if (gameState.isStarting || gameState.isActive) return;
  gameState.isStarting = true;

  initAudioContext();
  if (!isAudioLoaded) {
    dom.startButton.textContent = "Loading";
    await loadAllAudio();
    dom.startButton.textContent = "Start";
  }

  clearAllNotes();
  dom.startButton.disabled = true;
  dom.bottomWrapper.classList.add("hidden");

  dom.countdownDisplay.classList.remove("hidden");
  dom.countdownDisplay.style.transition = "";
  playSound("countdown");
  dom.countdownDisplay.textContent = "3";
  await sleep(COUNTDOWN_INTERVAL);
  playSound("countdown");
  dom.countdownDisplay.textContent = "2";
  await sleep(COUNTDOWN_INTERVAL);
  playSound("countdown");
  dom.countdownDisplay.textContent = "1";
  await sleep(COUNTDOWN_INTERVAL);
  dom.countdownDisplay.style.transition = "none";
  dom.countdownDisplay.classList.add("hidden");

  gameState.isActive = true;
  gameState.isStarting = false;
  gameState.currentIndex = 0;
  gameState.missCount = 0;
  gameState.scrollPct = 0;
  gameState.animationStartTime = 0;
  gameState.animationStartScrollPct = 0;
  gameState.animationEndScrollPct = 0;
  gameState.chordStarted = false;
  gameState.chordStartTime = 0;
  gameState.pressedLanes = new Set();

  dom.missDisplay.textContent = 0;
  updateProgressBar();
  applyScroll(true);

  generateNotes();
  renderNotes();

  gameState.startTime = Date.now();
  timerInterval = setInterval(updateTimer, 10);

  document.addEventListener("keydown", handleKeyPress);
  document.addEventListener("keyup", handleKeyRelease);

  requestAnimationFrame(gameLoop);
}

function handleKeyPress(event) {
  if (!gameState.isActive) return;
  if (event.repeat) return;
  const keyId = getKeyId(event);
  const action = keyToAction[keyId];
  if (!action) return;
  event.preventDefault();
  const side = actionToSide(action);
  const lane = actionToLane(action);
  flashKeyIndicator(side, lane, true);
  const chord = gameState.sequence[gameState.currentIndex];
  if (!chord) return;
  if (chord.lanes.includes(lane)) {
    playSound(lane === 0 ? "don" : "ka");
    if (!gameState.chordStarted) {
      gameState.chordStarted = true;
      gameState.chordStartTime = Date.now();
      gameState.pressedLanes = new Set();
    }
    if (!gameState.pressedLanes.has(lane)) {
      gameState.pressedLanes.add(lane);
      markNoteHit(gameState.currentIndex, lane);
    } else {
      // すでに押下済みのキーを再度押した場合はミスとする
      registerMiss();
      return;
    }
    if (gameState.pressedLanes.size === chord.lanes.length) {
      advanceChord();
    }
  } else {
    registerMiss();
  }
}

function handleKeyRelease(event) {
  if (!gameState.isActive) return;
  const keyId = getKeyId(event);
  const action = keyToAction[keyId];
  if (!action) return;
  flashKeyIndicator(actionToSide(action), actionToLane(action), false);
}

function flashKeyIndicator(side, lane, on) {
  for (const s of SIDES) {
    let el;
    if (lane === 0) {
      el = document.querySelector(`#sp-${s}-base .key-scratch`);
    } else {
      el = document.querySelector(`#sp-${s}-base .key-inner[data-lane="${lane}"]`);
    }
    if (!el) continue;
    if (on) el.classList.add("pressed");
    else el.classList.remove("pressed");
  }
}

function markNoteHit(index, lane) {
  document
    .querySelectorAll(`.note[data-index="${index}"][data-lane="${lane}"]`)
    .forEach((el) => el.classList.add("hit"));
}
function markNoteMissed(index, lane) {
  document
    .querySelectorAll(`.note[data-index="${index}"][data-lane="${lane}"]`)
    .forEach((el) => el.classList.add("missed"));
}

function registerMiss() {
  playSound("miss");
  gameState.missCount++;
  dom.missDisplay.textContent = gameState.missCount;
  gameState.startTime -= MISS_PENALTY_TIME;
  flashBackground();
}

function flashBackground() {
  document.body.style.backgroundColor = "#003456";
  setTimeout(() => {
    document.body.style.backgroundColor = "#001b33";
  }, 100);
}

function advanceChord() {
  gameState.currentIndex++;
  gameState.chordStarted = false;
  gameState.chordStartTime = 0;
  gameState.pressedLanes = new Set();
  gameState.animationStartTime = Date.now();
  gameState.animationStartScrollPct = gameState.scrollPct;
  gameState.animationEndScrollPct = gameState.currentIndex * getNoteOffsetPct();
  updateRemainingNotes();
  updateProgressBar();
  if (gameState.currentIndex >= gameState.notesCount) endGame();
}

function checkChordTimeout() {
  if (!gameState.chordStarted) return;
  if (Date.now() - gameState.chordStartTime <= CHORD_WINDOW_MS) return;
  const chord = gameState.sequence[gameState.currentIndex];
  if (chord) {
    for (const lane of chord.lanes) {
      if (!gameState.pressedLanes.has(lane)) {
        gameState.missCount++;
      }
    }
  }
  dom.missDisplay.textContent = gameState.missCount;
  gameState.startTime -= MISS_PENALTY_TIME;
  playSound("miss");
  flashBackground();
  // 進めず、和音状態をリセットして同じノートに再挑戦できるようにする
  gameState.chordStarted = false;
  gameState.chordStartTime = 0;
  gameState.pressedLanes = new Set();
  // 押下済みノートを再度叩けるよう .hit を解除
  document
    .querySelectorAll(`.note[data-index="${gameState.currentIndex}"]`)
    .forEach((el) => el.classList.remove("hit"));
}

function gameLoop() {
  if (!gameState.isActive) return;
  checkChordTimeout();
  if (gameState.animationStartTime > 0) {
    const durationSec =
      parseFloat(
        document.documentElement.style.getPropertyValue("--note-scroll-duration"),
      ) || 0;
    const durationMs = durationSec * 1000;
    if (durationMs === 0) {
      gameState.scrollPct = gameState.animationEndScrollPct;
      gameState.animationStartTime = 0;
    } else {
      const elapsed = Date.now() - gameState.animationStartTime;
      const progress = Math.min(elapsed / durationMs, 1);
      gameState.scrollPct =
        gameState.animationStartScrollPct +
        (gameState.animationEndScrollPct - gameState.animationStartScrollPct) *
          progress;
      if (progress >= 1) {
        gameState.animationStartTime = 0;
        gameState.scrollPct = gameState.animationEndScrollPct;
      }
    }
  }
  applyScroll(false);
  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameState.isActive = false;
  clearInterval(timerInterval);
  document.removeEventListener("keydown", handleKeyPress);
  document.removeEventListener("keyup", handleKeyRelease);
  document.querySelectorAll(".pressed").forEach(el => el.classList.remove("pressed"));
  playSound("clear");
  const finalTime = (Date.now() - gameState.startTime) / 1000;
  const totalHits = gameState.sequence.reduce((acc, c) => acc + c.lanes.length, 0);
  const kps = totalHits / Math.max(finalTime, 0.001);
  const accuracy = totalHits === 0 ? 0 : Math.max(0, (totalHits - gameState.missCount) / totalHits);
  const score = Math.round(kps * accuracy ** 3 * 10000);
  const newRecord = { score, missCount: gameState.missCount };
  if (gameState.notesCount >= 100 && !gameState.seed) {
    dom.rankingInfo.classList.add("hidden");
    const ranking = loadRanking();
    ranking.push(newRecord);
    const newRanking = ranking.sort((a, b) => b.score - a.score).slice(0, RANKING_SIZE);
    localStorage.setItem(RANKING_KEY, JSON.stringify(newRanking));
    displayRanking(newRecord);
  } else {
    dom.rankingInfo.classList.remove("hidden");
    dom.rankingInfo.textContent = gameState.seed
      ? "* Fixed seeds are not ranked."
      : "* Scores for games with 100 or more notes will be registered.";
    displayRanking();
  }
  dom.finalScoreDisplay.textContent = score;
  dom.clearTimeDisplay.textContent = finalTime.toFixed(2);
  dom.penaltyCountDisplay.textContent = gameState.missCount;
  dom.kpsDisplay.textContent = kps.toFixed(2);
  dom.bottomWrapper.classList.remove("hidden");
  dom.startButton.disabled = false;
}

function interruptGame(playCancelSound = true) {
  if (!gameState.isActive) return;
  if (playCancelSound) playSound("cancel");
  gameState.isActive = false;
  gameState.isStarting = false;
  clearInterval(timerInterval);
  document.removeEventListener("keydown", handleKeyPress);
  document.removeEventListener("keyup", handleKeyRelease);
  dom.timerDisplay.textContent = "0.00";
  dom.remainingNotesDisplay.textContent = gameState.notesCount;
  dom.missDisplay.textContent = 0;
  dom.progressBar.style.width = "0%";
  resetTimerGauge();
  gameState.scrollPct = 0;
  applyScroll(true);
  clearAllNotes();
  dom.bottomWrapper.classList.add("hidden");
  dom.startButton.textContent = "Start";
  dom.startButton.disabled = false;
  document.body.style.backgroundColor = "#001b33";
  document
    .querySelectorAll(".key-inner.pressed, .key-scratch.pressed")
    .forEach((el) => el.classList.remove("pressed"));
}

function postToX() {
  const score = dom.finalScoreDisplay.textContent;
  const gameUrl = window.location.origin + window.location.pathname;
  const text = "I got a score of " + score + " on #BMSprint !\n" + gameUrl;
  const url = new URL("https://twitter.com/intent/tweet");
  url.searchParams.set("text", text);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}

// ============================================================
// 音声設定 UI
// ============================================================
function updateSoundSettingsUI() {
  dom.soundFileInputs.forEach((input) => {
    const soundKey = input.dataset.soundKey;
    const label = input.closest(".setting-item").querySelector("label");
    const statusSpan = label.querySelector(".sound-status");
    const resetButton = input
      .closest(".setting-item")
      .querySelector(".reset-single-sound-btn");
    if (statusSpan) {
      const customSound = localStorage.getItem(CUSTOM_SOUND_KEY_PREFIX + soundKey);
      statusSpan.textContent = customSound ? "(Custom)" : "";
      resetButton.classList.toggle("hidden", !customSound);
    }
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleSoundFileChange(event) {
  const file = event.target.files[0];
  const soundKey = event.target.dataset.soundKey;
  if (!file || !soundKey) return;
  try {
    initAudioContext();
    if (audioContext && audioContext.state === "suspended") {
      await audioContext.resume();
    }
    const dataUrl = await fileToDataUrl(file);
    localStorage.setItem(CUSTOM_SOUND_KEY_PREFIX + soundKey, dataUrl);
    const response = await fetch(dataUrl);
    const arrayBuffer = await response.arrayBuffer();
    audioBuffers[soundKey] = await audioContext.decodeAudioData(arrayBuffer);
    updateSoundSettingsUI();
  } catch (e) {
    console.error("Error processing sound file:", e);
    alert("An error occurred while processing the audio file.");
  }
}

function resetCustomSounds() {
  Object.keys(AUDIO_FILES).forEach((key) => {
    localStorage.removeItem(CUSTOM_SOUND_KEY_PREFIX + key);
  });
  updateSoundSettingsUI();
  alert("Sounds have been reset to default. Please reload the page to apply.");
}

async function resetSingleSound(soundKey) {
  localStorage.removeItem(CUSTOM_SOUND_KEY_PREFIX + soundKey);
  try {
    audioBuffers[soundKey] = await loadAudio(AUDIO_FILES[soundKey]);
  } catch (e) {
    console.error(`Failed to reload default sound for ${soundKey}:`, e);
  }
  updateSoundSettingsUI();
}

// ============================================================
// 初期化
// ============================================================
function initialize() {
  const savedSpeed = parseFloat(localStorage.getItem(HISPEED_KEY)) || 1.0;
  const savedVolume = parseFloat(localStorage.getItem(VOLUME_KEY) ?? "0.25");
  const savedNotesCount = parseInt(localStorage.getItem(NOTES_COUNT_KEY)) || 100;
  const savedAnimationSpeed = parseFloat(localStorage.getItem(ANIMATION_SPEED_KEY)) || 0.1;
  const savedKeyConfigRaw = localStorage.getItem(KEY_CONFIG_KEY);
  const savedKeyConfig = savedKeyConfigRaw
    ? { ...DEFAULT_KEY_CONFIG, ...JSON.parse(savedKeyConfigRaw) }
    : { ...DEFAULT_KEY_CONFIG };
  const blRaw = localStorage.getItem(BAR_LINE_KEY);
  const savedBarLine = blRaw === null ? 8 : (parseInt(blRaw, 10) || 0);
  const savedScratchEnabled =
    localStorage.getItem(SCRATCH_ENABLED_KEY) === null
      ? true
      : localStorage.getItem(SCRATCH_ENABLED_KEY) === "true";
  const savedFiveKey = localStorage.getItem(FIVE_KEY_MODE_KEY) === "true";
  const savedSeed = localStorage.getItem(SEED_KEY) || "";

  const savedColors = localStorage.getItem(COLORS_KEY)
    ? JSON.parse(localStorage.getItem(COLORS_KEY))
    : { scratch: "#be0707", white: "#e1e1e1", blue: "#1107be", judgment: "#db0000" };
  const savedStopOffsetStr = localStorage.getItem(STOP_OFFSET_KEY);
  const savedStopOffset = savedStopOffsetStr !== null ? parseInt(savedStopOffsetStr) : -12;
  const savedChordProbs = localStorage.getItem(CHORD_PROBS_KEY)
    ? JSON.parse(localStorage.getItem(CHORD_PROBS_KEY))
    : [85, 10, 5, 0, 0, 0, 0, 0];

  buildStaticVisuals();

  updateVolume(savedVolume, false);
  updateNotesCount(savedNotesCount);
  updateHiSpeed(savedSpeed);
  updateAnimationSpeed(savedAnimationSpeed, false);
  updateBarLineInterval(savedBarLine);
  updateScratchEnabled(savedScratchEnabled, false);
  updateFiveKeyMode(savedFiveKey, false);
  updateSeed(savedSeed);
  
  updateColors(savedColors);
  updateStopOffset(savedStopOffset);
  updateChordProbs(savedChordProbs);

  gameState.keyConfig = savedKeyConfig;
  rebuildKeyMaps();
  refreshKeyConfigUI();

  displayRanking();
  dom.versionDisplay.textContent = VERSION;
  resetTimerGauge();

  attachUIListeners();
}

function attachUIListeners() {
  dom.startButton.addEventListener("click", startGame);
  dom.postToXBtn.addEventListener("click", postToX);

  dom.speedUpBtn.addEventListener("click", () => updateHiSpeed(gameState.hiSpeed + 0.1));
  dom.speedDownBtn.addEventListener("click", () => updateHiSpeed(gameState.hiSpeed - 0.1));

  dom.notesCountInput.addEventListener("change", (e) => {
    if (gameState.isActive) { e.target.value = gameState.notesCount; return; }
    updateNotesCount(parseInt(e.target.value, 10));
  });
  dom.barLineInput.addEventListener("change", (e) => {
    if (gameState.isActive) { e.target.value = gameState.barLineInterval; return; }
    updateBarLineInterval(e.target.value);
  });
  dom.scratchToggle.addEventListener("change", (e) => {
    if (gameState.isActive) { e.target.checked = gameState.scratchEnabled; return; }
    updateScratchEnabled(e.target.checked);
  });
  dom.fiveKeyToggle.addEventListener("change", (e) => {
    if (gameState.isActive) { e.target.checked = gameState.fiveKeyMode; return; }
    updateFiveKeyMode(e.target.checked);
  });

  dom.modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const mode = btn.dataset.mode;
      if (mode === gameState.mode) return;
      gameState.mode = mode;
      dom.modeBtns.forEach((b) => b.classList.toggle("active", b === btn));
    });
  });

  dom.volumeSlider.addEventListener("input", (e) => updateVolume(parseFloat(e.target.value)));
  dom.animationSpeedSlider.addEventListener("input", (e) => updateAnimationSpeed(parseFloat(e.target.value)));
  dom.seedInput.addEventListener("change", (e) => updateSeed(e.target.value));

  const handleColorChange = () => {
    updateColors({
      scratch: dom.colorScratch.value,
      white: dom.colorWhite.value,
      blue: dom.colorBlue.value,
      judgment: dom.colorJudgment.value
    });
  };
  dom.colorScratch.addEventListener("input", handleColorChange);
  dom.colorWhite.addEventListener("input", handleColorChange);
  dom.colorBlue.addEventListener("input", handleColorChange);
  dom.colorJudgment.addEventListener("input", handleColorChange);

  dom.stopOffsetInput.addEventListener("change", (e) => {
    updateStopOffset(parseInt(e.target.value) || 0);
  });

  const handleProbChange = () => {
    const probs = [
      parseInt(dom.probChord1.value) || 0,
      parseInt(dom.probChord2.value) || 0,
      parseInt(dom.probChord3.value) || 0,
      parseInt(dom.probChord4.value) || 0,
      parseInt(dom.probChord5.value) || 0,
      parseInt(dom.probChord6.value) || 0,
      parseInt(dom.probChord7.value) || 0,
      parseInt(dom.probChord8.value) || 0,
    ];
    updateChordProbs(probs);
  };
  dom.probChord1.addEventListener("change", handleProbChange);
  dom.probChord2.addEventListener("change", handleProbChange);
  dom.probChord3.addEventListener("change", handleProbChange);
  dom.probChord4.addEventListener("change", handleProbChange);
  dom.probChord5.addEventListener("change", handleProbChange);
  dom.probChord6.addEventListener("change", handleProbChange);
  dom.probChord7.addEventListener("change", handleProbChange);
  dom.probChord8.addEventListener("change", handleProbChange);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (gameState.isActive) {
        interruptGame(false);
        startGame();
      } else if (!gameState.isStarting) {
        startGame();
      }
    }
    if (event.key === "Escape" && gameState.isActive) interruptGame();
  });

  // 設定パネル開閉
  dom.openSettingsBtn.addEventListener("click", () => {
    updateSoundSettingsUI();
    dom.settingsPanel.style.display = "block";
  });
  dom.closeSettingsBtn.addEventListener("click", () => {
    dom.settingsPanel.style.display = "none";
  });
  dom.soundFileInputs.forEach((input) =>
    input.addEventListener("change", handleSoundFileChange),
  );
  dom.resetSoundsBtn.addEventListener("click", resetCustomSounds);
  dom.singleResetSoundBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => resetSingleSound(e.target.dataset.soundKey)),
  );

  dom.openHelpBtn.addEventListener("click", () => { dom.helpPanel.style.display = "block"; });
  dom.closeHelpBtn.addEventListener("click", () => { dom.helpPanel.style.display = "none"; });

  dom.openAdvancedSettingsBtn.addEventListener("click", () => {
    dom.advancedSettingsPanel.style.display = "block";
  });
  dom.closeAdvancedSettingsBtn.addEventListener("click", () => {
    dom.advancedSettingsPanel.style.display = "none";
  });
  dom.resetKeyConfigBtn.addEventListener("click", resetKeyConfig);

  dom.keyTabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      dom.keyTabBtns.forEach((b) => b.classList.toggle("active", b === btn));
      dom.keyConfigSections.forEach((sec) => {
        sec.classList.toggle("hidden", sec.dataset.tab !== tab);
      });
    });
  });

  dom.keyConfigBtns.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      const original = button.textContent;
      button.textContent = "...";
      button.style.borderColor = "#ffc107";

      const handle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.removeEventListener("keydown", handle, { capture: true });
        button.style.borderColor = "";
        if (e.key === "Escape") {
          updateKeyConfig({ [action]: null });
          return;
        }
        const keyId = getKeyId(e);
        for (const act in gameState.keyConfig) {
          if (act === action) continue;
          if (gameState.keyConfig[act] === keyId) {
            alert(`Key "${displayKeyId(keyId)}" is already assigned to ${act}.`);
            button.textContent = original;
            return;
          }
        }
        updateKeyConfig({ [action]: keyId });
      };
      window.addEventListener("keydown", handle, { capture: true });
    });
  });

  dom.resetRankingBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset the ranking?")) {
      localStorage.removeItem(RANKING_KEY);
      displayRanking();
    }
  });
}

// ============================================================
// 実行
// ============================================================
initialize();
