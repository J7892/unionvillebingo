/**
 * Unionville Sightseeing Bingo
 * Progressive, mobile-optimized, touch-friendly web app.
 */

// Sightseeing Items Pool (30 items)
const SIGHTSEEING_ITEMS = [
  { name: "Old Planing Mill Water Wheel", icon: "⚙️" },
  { name: "Historic Train Station", icon: "🚂" },
  { name: "Blue Heritage Plaque", icon: "🏛️" },
  { name: "Weathervane", icon: "🧭" },
  { name: "Wooden Footbridge", icon: "🌉" },
  { name: "Gingerbread House Trim", icon: "🏡" },
  { name: "Victorian Lamppost", icon: "🏮" },
  { name: "Chalkboard Sidewalk Menu", icon: "📋" },
  { name: "Black Squirrel or Chipmunk", icon: "🐿️" },
  { name: "Church Steeple", icon: "⛪" },
  { name: "Dog Bowl Outside a Shop", icon: "🥣" },
  { name: "Millennium Bandstand", icon: "🎪" },
  { name: "Duck or Goose", icon: "🦆" },
  { name: "Unique stop sign", icon: "🛑" },
  { name: "Old Firehall Tower", icon: "🔔" },
  { name: "Public Art Sculpture", icon: "🗿" },
  { name: "Weeping Willow Tree", icon: "🌳" },
  { name: "Hanging Flower Basket", icon: "🌸" },
  { name: "Window Planter Box", icon: "🪴" },
  { name: "Memorial Bench Plaque", icon: "🪑" },
  { name: "Patio String Lights", icon: "✨" },
  { name: "Lily Pads or Cattails", icon: "🪷" },
  { name: "Exposed Brick Chimney", icon: "🧱" },
  { name: "Cute doggo", icon: "🐶" },
  { name: "Canadian flag", icon: "🇨🇦" },
  { name: "Ice cream shop", icon: "🍦" },
  { name: "Someone on a bike", icon: "🚲" },
  { name: "Fire truck", icon: "🚒" },
  { name: "City bus", icon: "🚌" },
  { name: "Musician", icon: "🎷" },
];

const FREE_SPACE_INDEX = 12; // Center of 5x5 grid (row 2, col 2)
const STORAGE_KEY = "unionville_bingo_state_v3";
const SOUND_KEY = "unionville_bingo_sound";

// All 12 possible winning combinations in a 5x5 grid
const WINNING_COMBINATIONS = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

// App State
let state = {
  board: [], // 25 items
  marked: [], // 25 booleans
  celebratedBingos: 0,
};

let soundEnabled = true;
let audioCtx = null;

// DOM Elements
const bingoGrid = document.getElementById("bingoGrid");
const markedCountEl = document.getElementById("markedCount");
const bingoCountEl = document.getElementById("bingoCount");
const bingoBadgeEl = document.getElementById("bingoBadge");

// Modals
const reshuffleModal = document.getElementById("reshuffleModal");
const clearMarksModal = document.getElementById("clearMarksModal");
const celebrateModal = document.getElementById("celebrateModal");
const helpModal = document.getElementById("helpModal");

// Buttons
const reshuffleBtn = document.getElementById("reshuffleBtn");
const confirmReshuffleBtn = document.getElementById("confirmReshuffleBtn");
const cancelReshuffleBtn = document.getElementById("cancelReshuffleBtn");

const clearMarksBtn = document.getElementById("clearMarksBtn");
const confirmClearMarksBtn = document.getElementById("confirmClearMarksBtn");
const cancelClearMarksBtn = document.getElementById("cancelClearMarksBtn");

const closeCelebrateBtn = document.getElementById("closeCelebrateBtn");
const helpBtn = document.getElementById("helpBtn");
const closeHelpBtn = document.getElementById("closeHelpBtn");
const soundToggleBtn = document.getElementById("soundToggleBtn");
const soundIcon = document.getElementById("soundIcon");

/* ==========================================================================
   Web Audio Sound Effects
   ========================================================================== */
function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playSound(type) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  if (type === "stamp") {
    // Crisp cheerful pop tone
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } else if (type === "unmark") {
    // Gentle descending pop tone
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  } else if (type === "bingo") {
    // Fanfare arpeggio chord: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const noteTime = now + idx * 0.1;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.55);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.6);
    });
  }
}

/* ==========================================================================
   Haptic Feedback
   ========================================================================== */
function triggerHaptic(type = "light") {
  if (!("vibrate" in navigator)) return;
  try {
    if (type === "bingo") {
      navigator.vibrate([80, 50, 100, 50, 150]);
    } else {
      navigator.vibrate(15);
    }
  } catch (e) {
    // Ignore unsupported browser contexts
  }
}

/* ==========================================================================
   Board Shuffling & Initialization
   ========================================================================== */
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateNewBoard() {
  const shuffledItems = shuffleArray(SIGHTSEEING_ITEMS);
  const board = [];
  const marked = new Array(25).fill(false);

  let itemIdx = 0;
  for (let i = 0; i < 25; i++) {
    if (i === FREE_SPACE_INDEX) {
      board.push({
        name: "FREE SPACE",
        subtext: "Main Street",
        icon: "🍁",
        isFree: true,
      });
      marked[i] = true; // Free space is checked by default
    } else {
      board.push({
        ...shuffledItems[itemIdx],
        isFree: false,
      });
      itemIdx++;
    }
  }

  state = {
    board,
    marked,
    celebratedBingos: 0,
  };

  saveState();
  renderBoard();
}

/* ==========================================================================
   Persistence (Local Storage)
   ========================================================================== */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        Array.isArray(parsed.board) &&
        parsed.board.length === 25 &&
        Array.isArray(parsed.marked) &&
        parsed.marked.length === 25
      ) {
        state = parsed;
        // Make sure free space is always marked
        state.marked[FREE_SPACE_INDEX] = true;
        return true;
      }
    }
  } catch (e) {
    console.warn("Could not parse saved state:", e);
  }
  return false;
}

/* ==========================================================================
   BINGO Evaluation
   ========================================================================== */
function checkBingos() {
  const activeWinningLines = [];
  const winningCellIndices = new Set();

  WINNING_COMBINATIONS.forEach((line) => {
    const isLineComplete = line.every((index) => state.marked[index]);
    if (isLineComplete) {
      activeWinningLines.push(line);
      line.forEach((idx) => winningCellIndices.add(idx));
    }
  });

  return {
    count: activeWinningLines.length,
    winningLines: activeWinningLines,
    winningCells: winningCellIndices,
  };
}

/* ==========================================================================
   Render & UI Updates
   ========================================================================== */
function renderBoard() {
  bingoGrid.innerHTML = "";

  const { count: bingoCount, winningCells } = checkBingos();

  state.board.forEach((item, index) => {
    const cell = document.createElement("button");
    cell.className = "bingo-cell";
    cell.dataset.index = index;
    cell.setAttribute("role", "gridcell");

    const isMarked = state.marked[index];
    if (isMarked) cell.classList.add("marked");
    if (item.isFree) cell.classList.add("free-space");
    if (winningCells.has(index)) cell.classList.add("winning-line");

    cell.setAttribute("aria-pressed", isMarked ? "true" : "false");
    cell.setAttribute(
      "aria-label",
      item.isFree ? "Free Space (Visited)" : `${item.name}, ${isMarked ? "Found" : "Not yet found"}`
    );

    // Icon
    const iconEl = document.createElement("span");
    iconEl.className = "cell-icon";
    iconEl.textContent = item.icon;

    // Text Label
    const textEl = document.createElement("span");
    textEl.className = "cell-text";
    textEl.textContent = item.name;

    // Red Stamp Overlay
    const stampEl = document.createElement("span");
    stampEl.className = "stamp-badge";
    stampEl.textContent = item.isFree ? "★" : "✓";
    stampEl.setAttribute("aria-hidden", "true");

    cell.appendChild(iconEl);
    cell.appendChild(textEl);
    cell.appendChild(stampEl);

    // Click / Touch Handler
    cell.addEventListener("click", () => handleCellClick(index));

    bingoGrid.appendChild(cell);
  });

  updateStatus(bingoCount);
}

function updateStatus(bingoCount) {
  // Count marked items excluding the free space for found counter
  let markedItemsCount = 0;
  state.marked.forEach((marked, idx) => {
    if (marked && idx !== FREE_SPACE_INDEX) {
      markedItemsCount++;
    }
  });

  markedCountEl.textContent = markedItemsCount;
  bingoCountEl.textContent = bingoCount;

  if (bingoCount > 0) {
    bingoBadgeEl.classList.add("has-bingo");
  } else {
    bingoBadgeEl.classList.remove("has-bingo");
  }
}

/* ==========================================================================
   User Actions
   ========================================================================== */
function handleCellClick(index) {
  // Free space is permanent
  if (index === FREE_SPACE_INDEX) {
    return;
  }

  initAudio();

  const wasMarked = state.marked[index];
  const newMarked = !wasMarked;
  state.marked[index] = newMarked;

  triggerHaptic(newMarked ? "light" : "light");
  playSound(newMarked ? "stamp" : "unmark");

  saveState();

  const { count: currentBingos, winningCells } = checkBingos();

  // If a brand new bingo line was completed
  if (currentBingos > state.celebratedBingos) {
    const isFirstBingo = state.celebratedBingos === 0;
    state.celebratedBingos = currentBingos;
    saveState();
    celebrateBingo(currentBingos, isFirstBingo);
  } else if (currentBingos < state.celebratedBingos) {
    // If user unmarked and lost a bingo line, adjust celebrated count
    state.celebratedBingos = currentBingos;
    saveState();
  }

  // Update UI
  renderBoard();
}

function celebrateBingo(bingoCount, isFirst) {
  triggerHaptic("bingo");
  playSound("bingo");
  startConfetti(3500);

  const titleEl = document.getElementById("celebrateTitle");
  const msgEl = document.getElementById("celebrateMessage");
  const statsEl = document.getElementById("celebrateStats");

  const totalMarked = state.marked.filter(Boolean).length;

  if (totalMarked === 25) {
    titleEl.textContent = "🌟 BLACKOUT BINGO! 🌟";
    msgEl.textContent = "Incredible! You spotted every single landmark in Unionville!";
    statsEl.textContent = "🏆 Complete Sightseeing Master!";
  } else if (bingoCount === 1) {
    titleEl.textContent = "🎉 BINGO! 🎉";
    msgEl.textContent = "Splendid! You scored a 5-in-a-row sightseeing line!";
    statsEl.textContent = "1 Bingo line completed";
  } else {
    titleEl.textContent = `🎉 ${bingoCount}× BINGO! 🎉`;
    msgEl.textContent = `Amazing! You now have ${bingoCount} completed lines on your card!`;
    statsEl.textContent = `${bingoCount} Bingo lines completed`;
  }

  celebrateModal.removeAttribute("hidden");
}

/* ==========================================================================
   Modals Handlers
   ========================================================================== */
// Reshuffle Modal
reshuffleBtn.addEventListener("click", () => {
  reshuffleModal.removeAttribute("hidden");
});

cancelReshuffleBtn.addEventListener("click", () => {
  reshuffleModal.setAttribute("hidden", "true");
});

confirmReshuffleBtn.addEventListener("click", () => {
  reshuffleModal.setAttribute("hidden", "true");
  generateNewBoard();
});

// Clear Marks Modal
clearMarksBtn.addEventListener("click", () => {
  clearMarksModal.removeAttribute("hidden");
});

cancelClearMarksBtn.addEventListener("click", () => {
  clearMarksModal.setAttribute("hidden", "true");
});

confirmClearMarksBtn.addEventListener("click", () => {
  clearMarksModal.setAttribute("hidden", "true");
  state.marked = new Array(25).fill(false);
  state.marked[FREE_SPACE_INDEX] = true;
  state.celebratedBingos = 0;
  saveState();
  renderBoard();
});

// Celebrate Modal
closeCelebrateBtn.addEventListener("click", () => {
  celebrateModal.setAttribute("hidden", "true");
});

// Help Modal
helpBtn.addEventListener("click", () => {
  helpModal.removeAttribute("hidden");
});

closeHelpBtn.addEventListener("click", () => {
  helpModal.setAttribute("hidden", "true");
});

// Close modals on clicking overlay backdrop
[reshuffleModal, clearMarksModal, celebrateModal, helpModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.setAttribute("hidden", "true");
    }
  });
});

// Sound Toggle
soundToggleBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, soundEnabled ? "1" : "0");
  updateSoundUI();
  if (soundEnabled) {
    playSound("stamp");
  }
});

function updateSoundUI() {
  soundIcon.textContent = soundEnabled ? "🔔" : "🔕";
  soundToggleBtn.setAttribute("aria-label", soundEnabled ? "Mute sound" : "Enable sound");
}

function loadSoundPref() {
  const pref = localStorage.getItem(SOUND_KEY);
  if (pref !== null) {
    soundEnabled = pref === "1";
  }
  updateSoundUI();
}

/* ==========================================================================
   Self-Contained Canvas Confetti Engine (No external CDN dependencies)
   ========================================================================== */
const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d");
let confettiAnimationId = null;
let confettiParticles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class ConfettiParticle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -20 - Math.random() * 50;
    this.size = Math.random() * 8 + 6;
    this.speedY = Math.random() * 3 + 2;
    this.speedX = (Math.random() - 0.5) * 3;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 8;
    this.colors = [
      "#c0392b", // ruby red
      "#d99a26", // rich gold
      "#1e3a2f", // heritage green
      "#2980b9", // blue
      "#f39c12", // amber
      "#ffffff", // white
      "#27ae60", // emerald
    ];
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.shape = Math.random() > 0.4 ? "rect" : "circle";
    this.opacity = 1;
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.y * 0.03) * 0.5;
    this.rotation += this.rotationSpeed;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate((this.rotation * Math.PI) / 180);
    context.fillStyle = this.color;
    context.globalAlpha = this.opacity;

    if (this.shape === "rect") {
      context.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    } else {
      context.beginPath();
      context.arc(0, 0, this.size / 3, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }
}

function startConfetti(durationMs = 3500) {
  resizeCanvas();
  confettiParticles = [];
  const particleCount = Math.min(100, Math.floor(window.innerWidth / 4));

  for (let i = 0; i < particleCount; i++) {
    const p = new ConfettiParticle();
    // Scatter some initially across top half
    p.y = Math.random() * (canvas.height * 0.6) - 50;
    confettiParticles.push(p);
  }

  const startTime = Date.now();

  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
  }

  function renderConfetti() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (elapsed < durationMs) {
      confettiParticles.forEach((p) => {
        p.update();
        if (p.y > canvas.height + 20) {
          p.reset();
        }
        p.draw(ctx);
      });
      confettiAnimationId = requestAnimationFrame(renderConfetti);
    } else {
      // Fade out
      let anyVisible = false;
      confettiParticles.forEach((p) => {
        p.update();
        p.opacity = Math.max(0, p.opacity - 0.03);
        if (p.opacity > 0) {
          anyVisible = true;
          p.draw(ctx);
        }
      });
      if (anyVisible) {
        confettiAnimationId = requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiAnimationId = null;
      }
    }
  }

  renderConfetti();
}

/* ==========================================================================
   Service Worker Registration for Offline Use
   ========================================================================== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch((err) => console.log("SW registration failed: ", err));
  });
}

/* ==========================================================================
   Initialization
   ========================================================================== */
function init() {
  loadSoundPref();
  const hasSavedState = loadState();
  if (!hasSavedState) {
    generateNewBoard();
  } else {
    renderBoard();
  }
}

init();
