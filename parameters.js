const DIFFICULTY_CONFIGS = {
  easy: {
    fallSpeed: 2.0,
    spawnInterval: 1500,
    objectSize: 55,
    timerSpeed: 0.9,
    label: "Easy",
  },
  medium: {
    fallSpeed: 2.5,
    spawnInterval: 1200,
    objectSize: 50,
    timerSpeed: 1.0,
    label: "Medium",
  },
  hard: {
    fallSpeed: 4.0,
    spawnInterval: 700,
    objectSize: 40,
    timerSpeed: 1.5,
    label: "Hard",
  },
};

function initParameters() {
  const savedDifficulty = localStorage.getItem("gameDifficulty") || "medium";

  setActiveDifficulty(savedDifficulty);

  document.querySelectorAll(".difficulty-option").forEach((option) => {
    option.addEventListener("click", function () {
      const difficulty = this.dataset.difficulty;
      setActiveDifficulty(difficulty);
    });
  });

  document.getElementById("saveBtn").addEventListener("click", saveSettings);
}
function setActiveDifficulty(difficulty) {
  document.querySelectorAll(".difficulty-option").forEach((opt) => {
    opt.classList.remove("active", "border-primary", "border-3");
  });

  const selectedOption = document.querySelector(
    `[data-difficulty="${difficulty}"]`
  );
  if (selectedOption) {
    selectedOption.classList.add("active", "border-primary", "border-3");
  }
}

function saveSettings() {
  const activeOption = document.querySelector(".difficulty-option.active");
  if (!activeOption) return;

  const difficulty = activeOption.dataset.difficulty;
  const config = DIFFICULTY_CONFIGS[difficulty];

  localStorage.setItem("gameDifficulty", difficulty);
  localStorage.setItem("gameDifficultyConfig", JSON.stringify(config));

  const btn = document.getElementById("saveBtn");
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check me-2"></i>Saved!';
  btn.classList.remove("btn-primary");
  btn.classList.add("btn-success");

  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.classList.remove("btn-success");
    btn.classList.add("btn-primary");
  }, 2000);
}

window.addEventListener("load", initParameters);
