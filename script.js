
const DIFFICULTY = {
  easy: { speed: 2, spawn: 1500, size: 55, timer: 0.9, label: "Easy" },
  medium: { speed: 2.5, spawn: 1200, size: 50, timer: 1.0, label: "Medium" },
  hard: { speed: 4, spawn: 700, size: 40, timer: 1.5, label: "Hard" },
};

//donner de game 
const GAME = {
  canvas: null,
  ctx: null,
  w: 0,
  h: 0,
  basket: { x: 0, y: 0, w: 80, h: 60 },
  score: 0,
  best: parseInt(localStorage.getItem("catchHighScore")) || 0,
  lives: 3,
  paused: false,
  running: true,
  lastSpawn: 0,
  fallSpeed: 2,
  spawnRate: 1200,
  objSize: 50,
  timer: 1,
  diffLabel: "Medium",
  basketEffect: {
    active: false,
    time: 0,
    duration: 300,
    color: "#ffffff",
    intensity: 8,
  },
  particles: [],
};

let objects = [];
let rafId = null;
let lastTime = 0;

const TYPES = {
  apple: { score: 2, color: "#FF4444" },
  banana: { score: 5, color: "#FFD700" },
  orange: { score: 3, color: "#FFA500" },
  strawberry: { score: 4, color: "#FF1493" },
  lemon: { score: 3, color: "#FFEB3B" },
  kiwi: { score: 4, color: "#8BC34A" },
  mine: { score: -5, color: "#8B0000" },
};


const IMAGES = {
  basket: "assets/images/basket.png",
  apple: "assets/images/apple.png",
  banana: "assets/images/banana.png",
  orange: "assets/images/orange.png",
  strawberry: "assets/images/strawberry.png",
  lemon: "assets/images/citron.png",
  kiwi: "assets/images/kiwi.png",
  mine: "assets/images/mine.png",
};

const cache = {};
let imgLoaded = 0;
//load imgs
function loadImages(cb) {
  const total = Object.keys(IMAGES).length;

  for (let key in IMAGES) {
    const img = new Image();
    img.src = IMAGES[key];
    img.onload = () => {
      cache[key] = img;
      imgLoaded++;
      if (imgLoaded === total) cb();
    };
  }
}


function init() {
  GAME.canvas = document.getElementById("gameCanvas");
  GAME.ctx = GAME.canvas.getContext("2d");

  applyDifficulty();
  resizeCanvas();

  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("keydown", moveBasket);

  document.getElementById("pauseBtn").onclick = togglePause;
  document.getElementById("restartBtn").onclick = restartGame;
  document.getElementById("playAgainBtn").onclick = restartGame;

  loadImages(() => restartGame());
}

function applyDifficulty() {
  let d = localStorage.getItem("gameDifficulty") || "medium";
  let cfg = DIFFICULTY[d];

  GAME.fallSpeed = cfg.speed;
  GAME.spawnRate = cfg.spawn;
  GAME.objSize = cfg.size;
  GAME.timer = cfg.timer;
  GAME.diffLabel = cfg.label;

  document.getElementById("difficulty").textContent = GAME.diffLabel;
}


function resizeCanvas() {
  const r = GAME.canvas.getBoundingClientRect();
  GAME.w = GAME.canvas.width = r.width;
  GAME.h = GAME.canvas.height = r.height;

  GAME.basket.y = GAME.h - GAME.basket.h - 20;
  GAME.basket.x = (GAME.w - GAME.basket.w) / 2;
}


function moveBasket(e) {
  if (!GAME.running || GAME.paused) return;

  const speed = 35;
  if (e.key === "ArrowLeft" && GAME.basket.x > 0) GAME.basket.x -= speed;
  if (e.key === "ArrowRight" && GAME.basket.x + GAME.basket.w < GAME.w)
    GAME.basket.x += speed;
}


function togglePause() {
  GAME.paused = !GAME.paused;
  document.getElementById("pauseBtn").innerText = GAME.paused
    ? "Continue"
    : "Pause";
}


function restartGame() {
  applyDifficulty();
  objects = [];
  GAME.particles = [];
  GAME.score = 0;
  GAME.lives = 3;
  GAME.running = true;
  GAME.paused = false;
  updateHUD();

  document.getElementById("gameOverOverlay").classList.add("d-none");

  if (rafId) cancelAnimationFrame(rafId);
  lastTime = performance.now();
  GAME.lastSpawn = performance.now();
  rafId = requestAnimationFrame(loop);
}

function updateHUD() {
  document.getElementById("currentScore").textContent = GAME.score;
  document.getElementById("highScore").textContent = GAME.best;
  document.getElementById("lives").textContent = GAME.lives;
}


function spawn() {
  const fruits = Object.keys(TYPES).filter((t) => t !== "mine");
  const type =
    Math.random() < 0.75
      ? fruits[Math.floor(Math.random() * fruits.length)]
      : "mine";

  objects.push({
    type,
    x: Math.random() * (GAME.w - GAME.objSize),
    y: -GAME.objSize,
    w: GAME.objSize,
    h: GAME.objSize,
    score: TYPES[type].score,
    speed: GAME.fallSpeed + Math.random() * 0.5,
  });
}


function coll(o, b) {
  return (
    o.x < b.x + b.w && o.x + o.w > b.x && o.y < b.y + b.h && o.y + o.h > b.y
  );
}


function hit(obj) {
  if (!coll(obj, GAME.basket)) return false;

  GAME.score += obj.score;
  if (obj.score > 0) {
  } else {
    GAME.lives--;
    if (GAME.lives <= 0) return endGame(), true;
  }

  if (GAME.score > GAME.best) {
    GAME.best = GAME.score;
    localStorage.setItem("catchHighScore", GAME.best);
  }

  const getEffectColor = TYPES[obj.type].color;
  GAME.basketEffect.active = true;
  GAME.basketEffect.time = GAME.basketEffect.duration;
  GAME.basketEffect.color = getEffectColor;

  updateHUD();
  return true;
}


function endGame() {
  GAME.running = false;
  document.getElementById("finalScore").textContent = GAME.score;
  document.getElementById("gameOverOverlay").classList.remove("d-none");

  if (rafId) cancelAnimationFrame(rafId);
}


function loop(t) {
  if (!GAME.running) return;
  if (!GAME.paused) {
    const dt = t - lastTime;
    lastTime = t;

    if (GAME.basketEffect && GAME.basketEffect.active) {
      GAME.basketEffect.time -= dt;
      if (GAME.basketEffect.time <= 0) {
        GAME.basketEffect.active = false;
      }
    }

    GAME.ctx.clearRect(0, 0, GAME.w, GAME.h);

    if (t - GAME.lastSpawn > GAME.spawnRate / GAME.timer) {
      spawn();
      GAME.lastSpawn = t;
    }

    for (let i = objects.length - 1; i >= 0; i--) {
      let o = objects[i];
      o.y += o.speed;

      if (o.y > GAME.h) {
        objects.splice(i, 1);
        continue;
      }

      if (hit(o)) objects.splice(i, 1);

      drawObj(o);
    }

    drawBasket();
  }

  rafId = requestAnimationFrame(loop);
}


function drawObj(o) {
  const img = cache[o.type];

  if (img) {
    GAME.ctx.drawImage(img, o.x, o.y, o.w, o.h);
  } else {
    GAME.ctx.fillStyle = TYPES[o.type].color;
    GAME.ctx.fillRect(o.x, o.y, o.w, o.h);
  }
}


function drawBasket() {
  const img = cache.basket;
  const be = GAME.basketEffect || { active: false };
  let offsetX = 0;
  if (be.active) {
    const frac = Math.max(0, be.time / be.duration); 
    const amp = be.intensity * frac;
    offsetX = (Math.random() * 2 - 1) * amp;
    
    GAME.ctx.shadowColor = be.color;
    GAME.ctx.shadowBlur = 20 * frac;
  } else {
    GAME.ctx.shadowColor = "transparent";
    GAME.ctx.shadowBlur = 0;
  }

  if (img) {
    GAME.ctx.drawImage(
      img,
      GAME.basket.x + offsetX,
      GAME.basket.y,
      GAME.basket.w,
      GAME.basket.h
    );
    
    if (be.active) {
      GAME.ctx.save();
      GAME.ctx.globalCompositeOperation = "lighter";
      GAME.ctx.strokeStyle = be.color;
      GAME.ctx.lineWidth = 4 * (be.time / be.duration);
      GAME.ctx.strokeRect(
        GAME.basket.x + offsetX,
        GAME.basket.y,
        GAME.basket.w,
        GAME.basket.h
      );
      GAME.ctx.restore();
    }
  } else {
    GAME.ctx.fillStyle = "#8B4513";
    GAME.ctx.fillRect(
      GAME.basket.x + offsetX,
      GAME.basket.y,
      GAME.basket.w,
      GAME.basket.h
    );
  }

  GAME.ctx.shadowColor = "transparent";
  GAME.ctx.shadowBlur = 0;
}

window.onload = init;
