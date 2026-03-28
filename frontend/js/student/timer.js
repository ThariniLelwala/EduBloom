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

// Global session tracking for backend
let currentSessionId = null; // Backend ID of active session

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
    currentSessionId, // Save current session ID
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
    sessionGlobalStartTime = state.sessionGlobalStartTime || null; // Restore global session start time
    currentSessionId = state.currentSessionId || null; // Restore session ID
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
    restoreSessionTiles();
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
restoreSessionTiles(); // Restore visual cues

// ===== Refresh vs Close Detection =====
// sessionStorage persists across refreshes but is cleared when tab is closed.
// Strategy:
//   - On pagehide: just set a flag in sessionStorage (do NOT finish session)
//   - On load: if flag exists → was a refresh → timer continues normally (session still active in DB)
//   - On load: if no flag but currentSessionId exists → tab was closed and reopened → finish stale session

const refreshFlag = sessionStorage.getItem("pomodoro_refresh_flag");

if (refreshFlag) {
    // This was a refresh — session is still active in DB, just continue
    console.log("[Timer] Page refreshed. Resuming timer state. Session still active:", currentSessionId);
    sessionStorage.removeItem("pomodoro_refresh_flag"); // Clear flag
} else if (currentSessionId) {
    // No flag means tab was closed and reopened — finish the stale session
    console.log("[Timer] New tab detected with stale session. Finishing:", currentSessionId);
    const cycleTimeMinutes = (focusDuration + breakDuration) / 60;
    const durationMinutes = Math.round(completedSessions * cycleTimeMinutes);
    studentPomodoroApi.finishSession(currentSessionId, { durationMinutes })
        .catch(err => console.error("Failed to finish stale session:", err));
    // Reset local state so timer starts fresh
    currentSessionId = null;
    isRunning = false;
    completedSessions = 0;
    clearInterval(timerInterval);
    timerInterval = null;
    saveTimerState();
}

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

  if (countdownTime <= 0 && isRunning && !isSwitching) {
    switchSession();
  }
}

async function startTimer() {
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
    
    if (icon) {
        icon.className = "fas fa-play";
    } else {
        startButton.textContent = "Resume";
    }
  } else {
    // Play/Resume
    isRunning = true;
    
    // Create new session if starting fresh and no session ID exists
    if (!currentSessionId) {
        try {
            const result = await studentPomodoroApi.createSession(mode);
            currentSessionId = result.session.id;
            console.log("New session created:", currentSessionId);
        } catch (error) {
            console.error("Failed to create session:", error);
        }
    }

    // Adjust sessionStartTime to continue from paused time
    const newElapsed = sessionDuration - pausedCountdownTime;
    sessionStartTime = Date.now() - newElapsed * 1000;
    
    if (icon) {
        icon.className = "fas fa-pause";
    } else {
        startButton.textContent = "Pause";
    }
    
    timerInterval = setInterval(updateCountdown, 1000);
  }
  saveTimerState();
}

async function stopTimer() {
  console.log("stopTimer called. currentSessionId:", currentSessionId);

  // Capture values before resetting state
  const sessionIdToFinish = currentSessionId;
  const cyclesAtFinish = completedSessions;

  // Clear UI immediately so the user sees it right away
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  sessionStartTime = null;
  sessionType = "focus";
  sessionDuration = focusDuration;
  pausedCountdownTime = sessionDuration;
  completedSessions = 0;
  currentSessionId = null;
  if (sessionListElement) sessionListElement.innerHTML = ""; // Clear session cards immediately
  updateCountdown();
  let icon = startButton ? startButton.querySelector("i") : null;
  if (icon) {
      icon.className = "fas fa-play";
  } else if (startButton) {
      startButton.textContent = "Start";
  }
  saveTimerState();

  // Finish session in backend (async, after UI is already cleared)
  if (sessionIdToFinish) {
    try {
      const cycleTimeMinutes = (focusDuration + breakDuration) / 60;
      const durationMinutes = Math.round(cyclesAtFinish * cycleTimeMinutes);
      console.log(`Finishing with duration: ${durationMinutes} mins (${cyclesAtFinish} cycles)`);
      await studentPomodoroApi.finishSession(sessionIdToFinish, { durationMinutes });
      sessionStorage.removeItem("pomodoro_refresh_flag");
      console.log("Session finished successfully:", sessionIdToFinish);
    } catch (error) {
      console.error("Failed to finish session:", error);
    }
  }
}

// Guard to prevent switchSession from being called re-entrantly
let isSwitching = false;

// ===== Switch between focus and break =====
function switchSession() {
  if (isSwitching) return; // Prevent re-entry
  isSwitching = true;
  if (totalRemaining <= 0 && mode === "custom") {
    if (countdownElement) countdownElement.textContent = "Done!";
    if (progressCircle) progressCircle.style.stroke = "gray";
    isRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    saveTimerState();
    isSwitching = false; // Release guard before early return
    return;
  }

  if (sessionType === "focus") {
    // focus just ended → mark completed
    markTileComplete();
    
    // Update backend with new cycle count
    if (currentSessionId) {
         try {
            studentPomodoroApi.updateSession(currentSessionId, completedSessions).catch(err => {
                console.error("Failed to update session cycles:", err);
                // If backend says session not active/found, we should stop local timer to sync state
                if (err.message.includes("Session not found") || err.message.includes("not active")) {
                    alert("Session synchronization error. Stopping timer.");
                    stopTimer();
                }
            });
        } catch (error) {
            console.error("Failed to update session cycles:", error);
        }
    }

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
  isSwitching = false; // Release guard
  // Continue running
}

// Removed beforeunload alert

// On page hide (refresh or close): just set a flag in sessionStorage
// We do NOT call finishSession here — the session stays active in DB
// If it was a close (not refresh), the flag won't be there on next load
window.addEventListener("pagehide", () => {
  if (currentSessionId) {
    sessionStorage.setItem("pomodoro_refresh_flag", "true");
    console.log("[PageHide] Set refresh flag. Session:", currentSessionId);
  }
});

// Restore Visuals function
function restoreSessionTiles() {
    if (!sessionListElement) return;
    sessionListElement.innerHTML = "";
    
    // Determine how many tiles
    // If freestyle, we just show completed counts.
    if (mode === "freestyle") {
        if (completedSessions > 100) completedSessions = 100; // Safety limit
        for(let i=1; i<=completedSessions; i++) {
             const tile = document.createElement("div");
             tile.classList.add("session-tile", "completed");
             tile.textContent = `Session ${i} Completed`;
             sessionListElement.appendChild(tile);
        }
        if (isRunning || currentSessionId) {
             const activeTile = document.createElement("div");
             activeTile.classList.add("session-tile");
             activeTile.textContent = `Session ${completedSessions + 1}`;
             sessionListElement.appendChild(activeTile);
        }
    } else { // custom
        generateSessionTile(totalSessions);
        // Mark completed
        for(let i=0; i<completedSessions; i++) {
             let tile = sessionListElement.children[i];
             if (tile) tile.classList.add("completed");
        }
    }
}


// ===== Attach button events =====
if (document.querySelector("#freestyle-section .btn-primary")) {
  document
    .querySelector("#freestyle-section .btn-primary")
    .addEventListener("click", async () => {
      // Guard: if already running in freestyle mode, do nothing
      if (isRunning && mode === "freestyle") return;

      mode = "freestyle";
      totalSessions = Infinity; // freestyle = unlimited
      completedSessions = 0;
      if (sessionListElement) sessionListElement.innerHTML = "";
      
      // Stop previous timer if running in a different mode
      if (currentSessionId) {
          await stopTimer(); 
      } else {
          clearInterval(timerInterval);
          timerInterval = null;
          isRunning = false;
          let icon = startButton ? startButton.querySelector("i") : null;
          if (icon) icon.className = "fas fa-play";
      }

      sessionType = "focus";
      sessionDuration = focusDuration;
      totalRemaining = Infinity;
      pausedCountdownTime = sessionDuration;
      await startTimer();
      updateCountdown();
      restoreSessionTiles();
      
      if (startButton && !startButton.querySelector('i')) {
          startButton.textContent = "Pause";
      }
    });
}

if (document.querySelector("#custom-section .btn-primary")) {
  document
    .querySelector("#custom-section .btn-primary")
    .addEventListener("click", async () => {
      // Guard: if already running in custom mode, do nothing
      if (isRunning && mode === "custom") return;

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

      // Stop previous timer if running in a different mode
      if (currentSessionId) {
          await stopTimer();
      } else {
          clearInterval(timerInterval);
          timerInterval = null;
          isRunning = false;
          let icon = startButton ? startButton.querySelector("i") : null;
          if (icon) icon.className = "fas fa-play";
      }

      await startTimer();
      updateCountdown();
      
      if (startButton && !startButton.querySelector('i')) {
          startButton.textContent = "Pause";
      }
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
