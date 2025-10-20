let mode = "freestyle";
let totalSessions = 0;
let completedSessions = 0;
let sessionListElement = document.getElementById("session-list");

// Timer state for syncing
let isRunning = false;
let sessionStartTime = null;
let sessionType = "focus";
let sessionDuration = 2 * 60; // default focus
let totalRemaining = 6 * 60; // default total
let pausedCountdownTime = sessionDuration; // for paused state

const TIMER_STATE_KEY = "pomodoroTimerState";

function saveTimerState() {
  const state = {
    isRunning,
    sessionStartTime,
    sessionType,
    sessionDuration,
    totalRemaining,
    mode,
    totalSessions,
    completedSessions,
    pausedCountdownTime,
  };
  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
}

function loadTimerState() {
  const stored = localStorage.getItem(TIMER_STATE_KEY);
  if (stored) {
    const state = JSON.parse(stored);
    isRunning = state.isRunning || false;
    sessionStartTime = state.sessionStartTime || null;
    sessionType = state.sessionType || "focus";
    sessionDuration = state.sessionDuration || focusDuration;
    totalRemaining = state.totalRemaining || totalDuration;
    mode = state.mode || "freestyle";
    totalSessions = state.totalSessions || 0;
    completedSessions = state.completedSessions || 0;
    pausedCountdownTime = state.pausedCountdownTime || sessionDuration;
  }
}

// ==== Generate Tiles for Custom Mode ====
function generateSessionTile(numSessions) {
  if (!sessionListElement) return;
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
  if (!sessionListElement) return;
  completedSessions++;
  if (mode === "custom") {
    completedSessions = Math.min(completedSessions, totalSessions);
    if (completedSessions <= totalSessions) {
      let tile = sessionListElement.children[completedSessions - 1];
      if (tile) tile.classList.add("completed");
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

const time = () => (sessionType === "focus" ? focusDuration : breakDuration);

// ===== UI Elements =====
let countdownElement = document.getElementById("countdown");
let progressCircle = document.querySelector(".progress-circle");
const RADIUS = 200;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
if (progressCircle) progressCircle.style.strokeDasharray = CIRCUMFERENCE;

let startButton = document.getElementById("start");
let resetButton = document.getElementById("reset");

let timerInterval = null;

// Load state and initialize
loadTimerState();
updateCountdown();
if (isRunning) {
  timerInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  let countdownTime;
  if (isRunning && sessionStartTime) {
    const elapsed = (Date.now() - sessionStartTime) / 1000;
    countdownTime = Math.max(0, sessionDuration - elapsed);
  } else {
    countdownTime = pausedCountdownTime;
  }

  let minutes = Math.floor(countdownTime / 60);
  let seconds = Math.floor(countdownTime % 60);
  if (countdownElement)
    countdownElement.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

  if (progressCircle) {
    let offset =
      CIRCUMFERENCE - CIRCUMFERENCE * (countdownTime / sessionDuration);
    progressCircle.style.strokeDashoffset = offset;

    // Change color depending on session type
    if (sessionType === "focus") {
      progressCircle.style.stroke = "white";
    } else {
      progressCircle.style.stroke = "green";
    }
  }

  if (countdownTime <= 0 && isRunning) {
    switchSession();
  }
}

function startTimer() {
  if (!startButton) return;
  let icon = startButton.querySelector("i");
  if (timerInterval) {
    // Pause
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    // Calculate current countdown when pausing
    if (sessionStartTime) {
      pausedCountdownTime = Math.max(
        0,
        sessionDuration - (Date.now() - sessionStartTime) / 1000
      );
    } else {
      pausedCountdownTime = sessionDuration;
    }
    if (icon) icon.className = "fas fa-play";
  } else {
    // Play/Resume
    isRunning = true;
    // Adjust sessionStartTime to continue from paused time
    const newElapsed = sessionDuration - pausedCountdownTime;
    sessionStartTime = Date.now() - newElapsed * 1000;
    if (icon) icon.className = "fas fa-pause";
    timerInterval = setInterval(updateCountdown, 1000);
  }
  saveTimerState();
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  sessionStartTime = null;
  sessionType = "focus";
  sessionDuration = focusDuration;
  pausedCountdownTime = sessionDuration;
  updateCountdown();
  let icon = startButton ? startButton.querySelector("i") : null;
  if (icon) icon.className = "fas fa-play";
  saveTimerState();
}

// ===== Switch between focus and break =====
function switchSession() {
  if (totalRemaining <= 0 && mode === "custom") {
    if (countdownElement) countdownElement.textContent = "Done!";
    if (progressCircle) progressCircle.style.stroke = "gray";
    isRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    saveTimerState();
    return;
  }

  if (sessionType === "focus") {
    // focus just ended → mark completed
    markTileComplete();
    sessionType = "break";
    sessionDuration = Math.min(breakDuration, totalRemaining);
    totalRemaining -= sessionDuration;
  } else {
    sessionType = "focus";
    sessionDuration = Math.min(focusDuration, totalRemaining);
    totalRemaining -= sessionDuration;
  }

  sessionStartTime = Date.now();
  updateCountdown();
  saveTimerState();
  // Continue running
}

// ===== Attach button events =====
if (document.querySelector("#freestyle-section .btn-primary")) {
  document
    .querySelector("#freestyle-section .btn-primary")
    .addEventListener("click", () => {
      mode = "freestyle";
      totalSessions = Infinity; // freestyle = unlimited
      completedSessions = 0;
      if (sessionListElement) sessionListElement.innerHTML = "";
      stopTimer();
      sessionType = "focus";
      sessionDuration = focusDuration;
      totalRemaining = Infinity;
      pausedCountdownTime = sessionDuration;
      updateCountdown();
      startTimer();
    });
}

if (document.querySelector("#custom-section .btn-primary")) {
  document
    .querySelector("#custom-section .btn-primary")
    .addEventListener("click", () => {
      mode = "custom";
      const range = document.getElementById("custom-range");
      const minutes = range ? parseInt(range.value, 10) : 0;
      totalDuration = minutes * 60;
      totalSessions = Math.max(1, Math.floor(totalDuration / focusDuration));
      completedSessions = 0;
      generateSessionTile(totalSessions);
      totalRemaining = totalDuration;
      sessionType = "focus";
      sessionDuration = focusDuration;
      pausedCountdownTime = sessionDuration;
      stopTimer();
      updateCountdown();
      startTimer();
    });
}

// ===== Attach reset button event =====
if (resetButton) resetButton.addEventListener("click", stopTimer);
if (startButton) startButton.addEventListener("click", startTimer);

// ===== Toggle buttons and range for pomodoro page =====
const freestyleBtn = document.getElementById("freestyle-btn");
const customBtn = document.getElementById("custom-btn");
const freestyleSection = document.getElementById("freestyle-section");
const customSection = document.getElementById("custom-section");

if (freestyleBtn && customBtn && freestyleSection && customSection) {
  freestyleBtn.addEventListener("click", () => {
    freestyleBtn.classList.add("active");
    customBtn.classList.remove("active");
    freestyleSection.classList.add("visible");
    customSection.classList.remove("visible");
  });

  customBtn.addEventListener("click", () => {
    customBtn.classList.add("active");
    freestyleBtn.classList.remove("active");
    customSection.classList.add("visible");
    freestyleSection.classList.remove("visible");
  });
}

// Optional: Update custom time display
const customRange = document.getElementById("custom-range");
if (customRange) {
  customRange.addEventListener("input", function () {
    const minutes = parseInt(this.value, 10);
    const hrs = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    const customTime = document.getElementById("custom-time");
    if (customTime) customTime.textContent = `${hrs}:${mins}`;
  });
}
