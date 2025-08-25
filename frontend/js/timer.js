let mode = "freestyle";
let totalSessions = 0;
let completedSessions = 0;
let sessionListElement = document.getElementById("session-list");

// ==== Generate Tiles for Custom Mode ====
function generateSessionTile(numSessions) {
  sessionListElement.innerHTML = ""; // Clear previous tiles
  for (let i = 0; i < numSessions; i++) {
    const tile = document.createElement("div");
    tile.classList.add("session-tile");
    tile.textContent = `Session ${i + 1}`;
    sessionListElement.appendChild(tile);
  }
}

// ==== Mark a Tile Complete ====
function markTileComplete() {
  completedSessions++;

  if (mode === "custom") {
    if (completedSessions <= totalSessions) {
      let tile = sessionListElement.children[completedSessions - 1];
      tile.classList.add("completed");
    }
  } else if (mode === "freestyle") {
    const tile = document.createElement("div");
    tile.classList.add("session-tile", "completed");
    tile.textContent = `Session ${completedSessions} Completed`;
    sessionListElement.appendChild(tile);
  }
}

// ===== Timer Settings =====
let totalDuration = 6 * 60; // Total study time (example: 6 mins for demo)

// Define cycle: 25 min focus + 5 min break
let focusDuration = 25 * 60;
let breakDuration = 5 * 60;

// For demo: scale down
focusDuration = 2 * 60; // 2 min focus
breakDuration = 1 * 60; // 1 min break

// Track session
let sessionType = "focus";
let countdownTime = focusDuration;
let remainingTime = totalDuration; // Track total time left

const time = () => (sessionType === "focus" ? focusDuration : breakDuration);

// ===== UI Elements =====
let countdownElement = document.getElementById("countdown");
let progressCircle = document.querySelector(".progress-circle");
const RADIUS = 200;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
progressCircle.style.strokeDasharray = CIRCUMFERENCE;

let startButton = document.getElementById("start").querySelector("i");
let resetButton = document.getElementById("reset");

let timerInterval = null;

// ===== Initial Display =====
updateCountdown();

function updateCountdown() {
  let minutes = Math.floor(countdownTime / 60);
  let seconds = countdownTime % 60;
  countdownElement.textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  let offset = CIRCUMFERENCE - CIRCUMFERENCE * (countdownTime / time());
  progressCircle.style.strokeDashoffset = offset;

  // Change color depending on session type
  if (sessionType === "focus") {
    progressCircle.style.stroke = "white";
  } else {
    progressCircle.style.stroke = "green";
  }

  if (countdownTime <= 0) {
    clearInterval(timerInterval);
    timerInterval = null;
    switchSession();
  }
}

function startTimer() {
  if (timerInterval) {
    // Pause
    clearInterval(timerInterval);
    timerInterval = null;
    startButton.className = "fas fa-play";
  } else {
    // Play
    startButton.className = "fas fa-pause";
    timerInterval = setInterval(() => {
      if (countdownTime > 0 && remainingTime > 0) {
        countdownTime--;
        remainingTime--;
        updateCountdown();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        switchSession();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  countdownTime = time(); // reset current session
  updateCountdown();
  startButton.className = "fas fa-play";
}

// ===== Switch between focus and break =====
function switchSession() {
  if (remainingTime <= 0 && mode === "custom") {
    countdownElement.textContent = "Done!";
    progressCircle.style.stroke = "gray";
    return;
  }

  if (sessionType === "focus") {
    // focus just ended → mark completed
    markTileComplete();
    sessionType = "break";
    countdownTime = Math.min(breakDuration, remainingTime);
  } else {
    sessionType = "focus";
    countdownTime = Math.min(focusDuration, remainingTime);
  }

  updateCountdown();
  startButton.className = "fas fa-pause";
  startTimer();
}

// ===== Attach button events =====
document
  .querySelector("#freestyle-section .btn-primary")
  .addEventListener("click", () => {
    mode = "freestyle";
    totalSessions = Infinity; // freestyle = unlimited
    completedSessions = 0;
    sessionListElement.innerHTML = "";
    resetTimer();
    startTimer();
  });

document
  .querySelector("#custom-section .btn-primary")
  .addEventListener("click", () => {
    mode = "custom";
    const minutes = parseInt(document.getElementById("custom-range").value, 10);
    totalDuration = minutes * 60;
    totalSessions = Math.max(1, Math.floor(totalDuration / focusDuration));
    completedSessions = 0;
    generateSessionTile(totalSessions);
    remainingTime = totalDuration;
    countdownTime = focusDuration;
    resetTimer();
    startTimer();
  });

// ===== Attach reset button event =====
resetButton.addEventListener("click", resetTimer);
