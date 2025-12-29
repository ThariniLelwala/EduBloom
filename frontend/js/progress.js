// Progress Page JavaScript

// Sample data structure for pomodoro tracking
const pomodoroData = {
  weekly: {
    sessions: 12,
    hours: 5, // 12 sessions * 25 minutes = 300 minutes = 5 hours
    comparison: 3, // +3 sessions from last week
    streak: 7,
    dailyBreakdown: {
      Monday: { sessions: 2, hours: 0.83 }, // 2 * 25 = 50 min
      Tuesday: { sessions: 2, hours: 0.83 },
      Wednesday: { sessions: 2, hours: 0.83 },
      Thursday: { sessions: 1, hours: 0.42 }, // 1 * 25 = 25 min
      Friday: { sessions: 2, hours: 0.83 },
      Saturday: { sessions: 2, hours: 0.83 },
      Sunday: { sessions: 1, hours: 0.42 },
    },
  },
  monthly: {
    currentMonth: {
      sessions: 48, // 48 sessions * 25 min = 1200 min = 20 hours
      hours: 20,
      daily: [
        5, 6, 4, 5, 7, 6, 5, 6, 5, 4, 5, 6, 4, 5, 6, 5, 4, 6, 5, 7, 6, 5, 4, 6,
        5, 4, 3, 5, 6, 4,
      ],
      labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    },
    lastMonth: {
      sessions: 45, // 45 sessions * 25 min = 1125 min = 18.75 hours
      hours: 18.75,
      daily: [
        4, 5, 3, 4, 6, 5, 4, 5, 4, 3, 4, 5, 3, 4, 5, 4, 3, 5, 4, 6, 5, 4, 3, 5,
        4, 3, 2, 4, 5, 3,
      ],
      labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    },
  },
};

// GPA data for university students
const gpaData = {
  semesters: [
    { semester: "Sem 1", gpa: 3.5 },
    { semester: "Sem 2", gpa: 3.6 },
    { semester: "Sem 3", gpa: 3.7 },
    { semester: "Sem 4", gpa: 3.75 },
    { semester: "Sem 5", gpa: 3.9 },
    { semester: "Sem 6", gpa: 3.8 },
  ],
  currentGPA: 3.8,
  highestGPA: 3.9,
  lowestGPA: 3.5,
  averageGPA: 3.7,
};

// Grade to GPA mapping
const defaultGradeToGPA = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

let monthlyChart = null;

// Mood value mapping (0-4 scale) - Same as diary.html
const moodValueMap = {
  Sad: 0,
  Neutral: 1,
  Calm: 2,
  Happy: 3,
  Excited: 4,
};

// Energy value mapping (0-4 scale)
const energyValueMap = {
  Low: 0,
  Relaxed: 1,
  Normal: 2,
  High: 3,
  Max: 4,
};

// Get mood emoji
function getMoodEmoji(mood) {
  const moodEmojis = {
    Sad: "😞",
    Neutral: "😐",
    Calm: "🙂",
    Happy: "😊",
    Excited: "🤩",
  };
  return moodEmojis[mood] || "😐";
}

// Get energy emoji
function getEnergyEmoji(energy) {
  const energyEmojis = {
    Low: "😴",
    Relaxed: "😌",
    Normal: "😃",
    High: "⚡",
    Max: "🔥",
  };
  return energyEmojis[energy] || "😃";
}

// Initialize page
function initializeProgress() {
  updateWeeklyStats();
  generateWeeklyBreakdown();
  initializeMonthlyChart();
  loadMentalLogs();
  loadTasks();
  checkAndInitializeGPA();
  setupEventListeners();
}

// Load and display mental logs data for current week
function loadMentalLogs() {
  try {
    const diaryEntries = localStorage.getItem("diaryEntries");

    if (!diaryEntries) {
      document.getElementById("total-entries").textContent = "0";
      document.getElementById("avg-mood").textContent = "--";
      document.getElementById("avg-energy").textContent = "--";
      return;
    }

    const entries = JSON.parse(diaryEntries);

    console.log("Diary entries loaded:", entries);
    console.log("moodValueMap:", moodValueMap);

    // Get current week's entries (last 7 days) for total count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const currentWeekEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate >= weekAgo && entryDate <= today;
    });

    const totalEntries = currentWeekEntries.length;

    // Calculate average mood from ALL entries (same as diary.html)
    let averageMood = "--";
    const moodsWithValues = entries
      .filter((entry) => entry.mood && moodValueMap.hasOwnProperty(entry.mood))
      .map((entry) => moodValueMap[entry.mood]);

    console.log("Moods found:", moodsWithValues);
    console.log(
      "Entries with moods:",
      entries.filter((entry) => entry.mood)
    );

    if (moodsWithValues.length > 0) {
      const averageValue =
        moodsWithValues.reduce((a, b) => a + b, 0) / moodsWithValues.length;
      console.log("Average value:", averageValue);

      // Find the closest mood value
      const moodValues = Object.values(moodValueMap);
      const closestMoodValue = moodValues.reduce((prev, curr) =>
        Math.abs(curr - averageValue) < Math.abs(prev - averageValue)
          ? curr
          : prev
      );

      const moodNames = Object.keys(moodValueMap);
      const closestMood = moodNames.find(
        (mood) => moodValueMap[mood] === closestMoodValue
      );
      averageMood = closestMood
        ? `${getMoodEmoji(closestMood)} ${closestMood}`
        : "--";
      console.log("Average mood calculated:", {
        averageValue,
        closestMoodValue,
        closestMood,
        averageMood,
      });
    }

    // Calculate average energy from current week entries
    let averageEnergy = "--";
    const energiesWithValues = currentWeekEntries
      .filter(
        (entry) => entry.energy && energyValueMap.hasOwnProperty(entry.energy)
      )
      .map((entry) => energyValueMap[entry.energy]);

    if (energiesWithValues.length > 0) {
      const averageValue =
        energiesWithValues.reduce((a, b) => a + b, 0) /
        energiesWithValues.length;
      const flooredValue = Math.floor(averageValue);
      const energyNames = Object.keys(energyValueMap);
      const closestEnergy = energyNames.find(
        (energy) => energyValueMap[energy] === flooredValue
      );
      averageEnergy = closestEnergy
        ? `${getEnergyEmoji(closestEnergy)} ${closestEnergy}`
        : "--";
    }

    // Update UI
    document.getElementById("total-entries").textContent = totalEntries;
    document.getElementById("avg-mood").textContent = averageMood;
    document.getElementById("avg-energy").textContent = averageEnergy;

    console.log("Mental logs loaded for current week:", {
      totalEntries,
      averageMood,
      averageEnergy,
    });
  } catch (error) {
    console.error("Error loading mental logs:", error);
    document.getElementById("total-entries").textContent = "0";
    document.getElementById("avg-mood").textContent = "--";
    document.getElementById("avg-energy").textContent = "--";
  }
}

// Load and display tasks data
function loadTasks() {
  try {
    // Fetch tasks.json from the data folder
    fetch("../../data/tasks.json")
      .then((response) => response.json())
      .then((data) => {
        // Calculate to-do completion
        const totalTodos = data.todo.length;
        const completedTodos = data.todo.filter((task) => task.done).length;

        // Calculate weekly goals completion
        const totalWeeklyGoals = data.weeklyGoals.length;
        const completedWeeklyGoals = data.weeklyGoals.filter(
          (goal) => goal.done
        ).length;

        // Calculate monthly goals completion
        const totalMonthlyGoals = data.monthlyGoals.length;
        const completedMonthlyGoals = data.monthlyGoals.filter(
          (goal) => goal.done
        ).length;

        // Calculate total combined
        const totalAllTasks = totalTodos + totalWeeklyGoals + totalMonthlyGoals;
        const completedAllTasks =
          completedTodos + completedWeeklyGoals + completedMonthlyGoals;

        // Update UI
        document.getElementById(
          "total-all-completed"
        ).textContent = `${completedAllTasks}/${totalAllTasks}`;
        document.getElementById(
          "todo-tasks-completed"
        ).textContent = `${completedTodos}/${totalTodos}`;
        document.getElementById(
          "weekly-tasks-completed"
        ).textContent = `${completedWeeklyGoals}/${totalWeeklyGoals}`;
        document.getElementById(
          "monthly-tasks-completed"
        ).textContent = `${completedMonthlyGoals}/${totalMonthlyGoals}`;

        console.log("Tasks loaded:", {
          completedAllTasks,
          totalAllTasks,
          completedTodos,
          totalTodos,
          completedWeeklyGoals,
          totalWeeklyGoals,
          completedMonthlyGoals,
          totalMonthlyGoals,
        });
      })
      .catch((error) => {
        console.error("Error loading tasks:", error);
        document.getElementById("total-all-completed").textContent = "0/0";
        document.getElementById("todo-tasks-completed").textContent = "0/0";
        document.getElementById("weekly-tasks-completed").textContent = "0/0";
        document.getElementById("monthly-tasks-completed").textContent = "0/0";
      });
  } catch (error) {
    console.error("Error in loadTasks:", error);
  }
}

// ==================== EXAM SCORES FOR SCHOOL STUDENTS ====================
let examsData = null;
let scoresChart = null;

async function loadExamScores() {
  try {
    // Try to load from localStorage first
    const stored = localStorage.getItem("examsData");
    if (stored) {
      examsData = JSON.parse(stored);
    } else {
      // Fallback to JSON file
      const response = await fetch("../../data/exams.json");
      if (!response.ok) throw new Error("Failed to load exams.json");
      examsData = await response.json();
    }

    console.log("Exam data loaded:", examsData);
    updateLatestAverageScore();
    populateExamSelectFilter();
    updateScoresChart();
  } catch (error) {
    console.error("Error loading exam scores:", error);
  }
}

function updateLatestAverageScore() {
  if (!examsData || !examsData.exams || examsData.exams.length === 0) return;

  const latestExam = examsData.exams[examsData.exams.length - 1];
  const marks = Object.values(latestExam.marks).filter(
    (mark) => mark !== null && mark !== undefined
  );

  if (marks.length > 0) {
    const average = (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(
      2
    );
    document.getElementById("latest-avg-score").textContent = average;
  }
}

function calculateScoreTrend() {
  if (!examsData || examsData.exams.length < 2) return "stable";

  const exams = examsData.exams;
  const getAverage = (exam) => {
    const marks = Object.values(exam.marks).filter(
      (mark) => mark !== null && mark !== undefined
    );
    return marks.length > 0
      ? marks.reduce((a, b) => a + b, 0) / marks.length
      : 0;
  };

  const priorAverage = getAverage(exams[exams.length - 2]);
  const currentAverage = getAverage(exams[exams.length - 1]);

  if (currentAverage > priorAverage + 2) return "improving";
  if (currentAverage < priorAverage - 2) return "declining";
  return "stable";
}

function updateScoreTrendDisplay() {
  const trend = calculateScoreTrend();
  const trendElement = document.getElementById("score-trend");

  if (trend === "improving") {
    trendElement.innerHTML = '<i class="fas fa-arrow-up"></i> Improving';
    trendElement.className = "stat-secondary trend-up";
  } else if (trend === "declining") {
    trendElement.innerHTML = '<i class="fas fa-arrow-down"></i> Declining';
    trendElement.className = "stat-secondary trend-down";
  } else {
    trendElement.innerHTML = '<i class="fas fa-minus"></i> Stable';
    trendElement.className = "stat-secondary";
  }
}

function populateExamSelectFilter() {
  if (!examsData || !examsData.exams) return;

  const selectElement = document.getElementById("exam-select-filter");
  if (!selectElement) return;

  // Find the options container that's a sibling of the select
  const selectWrapper = selectElement.parentElement;
  let optionsContainer = selectWrapper.querySelector(".custom-select-options");

  if (!optionsContainer) return;

  optionsContainer.innerHTML = "";

  // Add "All Exams" option
  const allOption = document.createElement("div");
  allOption.className = "custom-select-option selected";
  allOption.textContent = "All Exams";
  allOption.dataset.value = "";
  allOption.addEventListener("click", () => {
    updateScoresChart("");
    const countInput = document.getElementById("exam-count-input");
    countInput.value = "0";
    document
      .querySelector(".custom-select-wrapper")
      .querySelector(".custom-select-display").textContent = "All Exams";
  });
  optionsContainer.appendChild(allOption);

  // Add individual exam options
  examsData.exams.forEach((exam, index) => {
    const option = document.createElement("div");
    option.className = "custom-select-option";
    option.textContent = `Up to ${exam.name}`;
    option.dataset.value = index;
    option.addEventListener("click", () => {
      updateScoresChart(index);
      const countInput = document.getElementById("exam-count-input");
      countInput.value = "0";
      selectWrapper.querySelector(
        ".custom-select-display"
      ).textContent = `Up to ${exam.name}`;
    });
    optionsContainer.appendChild(option);
  });
}

function setupExamCountListener() {
  const countInput = document.getElementById("exam-count-input");
  if (!countInput) return;

  countInput.addEventListener("change", () => {
    const count = parseInt(countInput.value);

    // Validate input
    if (isNaN(count) || count <= 0) {
      // Show all exams
      updateScoresChart("");
      document
        .querySelector(".custom-select-wrapper")
        .querySelector(".custom-select-display").textContent = "All Exams";
      return;
    }

    // Check if count exceeds number of exams
    if (count > examsData.exams.length) {
      countInput.value = examsData.exams.length;
      // Show all exams
      updateScoresChart("");
      document
        .querySelector(".custom-select-wrapper")
        .querySelector(".custom-select-display").textContent = "All Exams";
      return;
    }

    // Show last N exams
    const lastExamIndex = examsData.exams.length - count;
    updateScoresChart(lastExamIndex);

    // Update display text
    const selectDisplay = document
      .querySelector(".custom-select-wrapper")
      .querySelector(".custom-select-display");
    selectDisplay.textContent = `Last ${count} exam${count !== 1 ? "s" : ""}`;
  });
}

function updateScoresChart(upToIndex = "") {
  if (!examsData || !examsData.exams) return;

  let filteredExams = examsData.exams;
  if (upToIndex !== "" && upToIndex !== undefined && upToIndex !== null) {
    const startIndex = parseInt(upToIndex);
    // If startIndex is positive, it means we want exams FROM that index TO the end
    // This allows showing the last N exams
    filteredExams = examsData.exams.slice(startIndex);
  }

  const labels = filteredExams.map((exam) => exam.name);
  const data = filteredExams.map((exam) => {
    const marks = Object.values(exam.marks).filter(
      (mark) => mark !== null && mark !== undefined
    );
    return marks.length > 0
      ? (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2)
      : 0;
  });

  // Update stats
  const numericData = data.map((d) => parseFloat(d));
  if (numericData.length > 0) {
    document.getElementById("highest-score").textContent = Math.max(
      ...numericData
    ).toFixed(2);
    document.getElementById("lowest-score").textContent = Math.min(
      ...numericData
    ).toFixed(2);
    document.getElementById("current-score").textContent =
      numericData[numericData.length - 1];
  }

  updateScoreTrendDisplay();

  if (scoresChart) {
    scoresChart.data.labels = labels;
    scoresChart.data.datasets[0].data = data;
    scoresChart.update();
  }
}

function initializeScoresChart() {
  if (!examsData || !examsData.exams || examsData.exams.length === 0) return;

  const ctx = document.getElementById("scoresChart");
  if (!ctx) return;

  const labels = examsData.exams.map((exam) => exam.name);
  const data = examsData.exams.map((exam) => {
    const marks = Object.values(exam.marks).filter(
      (mark) => mark !== null && mark !== undefined
    );
    return marks.length > 0
      ? (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2)
      : 0;
  });

  scoresChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Average Score",
          data: data,
          borderColor: "rgba(255, 255, 255, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgba(255, 255, 255, 0.8)",
          pointBorderColor: "rgba(255, 255, 255, 1)",
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
            font: { size: 12 },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          ticks: { color: "rgba(255, 255, 255, 0.7)" },
        },
        x: {
          grid: { color: "rgba(255, 255, 255, 0.1)" },
          ticks: { color: "rgba(255, 255, 255, 0.7)" },
        },
      },
    },
  });
}

// Check if university student and initialize GPA card
function checkAndInitializeGPA() {
  const studentType = localStorage.getItem("studentType");
  const gpaCard = document.getElementById("gpa-card");
  const avgGpaCard = document.getElementById("avg-gpa-card");
  const tasksCard = document.getElementById("tasks-card");
  const avgScoresCard = document.getElementById("avg-scores-card");
  const avgScoreSmallCard = document.getElementById("avg-score-card");

  if (studentType === "university") {
    gpaCard.style.display = "block";
    avgGpaCard.style.display = "block";
    tasksCard.style.display = "block";
    avgScoresCard.style.display = "none";
    avgScoreSmallCard.style.display = "none";
    loadGPAFromTracker();
    updateGPAStats();
    updateAvgGPACard();
    initializeGPAChart();
  } else {
    gpaCard.style.display = "none";
    avgGpaCard.style.display = "none";
    tasksCard.style.display = "none";
    avgScoresCard.style.display = "block";
    avgScoreSmallCard.style.display = "block";
    // Load exam scores and then initialize chart
    loadExamScores().then(() => {
      initializeScoresChart();
      setupExamCountListener();
    });
  }
}

// Load GPA data from gpa-tracker localStorage
function loadGPAFromTracker() {
  try {
    const storedGPAData = localStorage.getItem("gpaTrackerData");

    if (!storedGPAData) {
      console.log("No GPA tracker data found, using sample data");
      return;
    }

    const trackerData = JSON.parse(storedGPAData);
    const customGradeMappings = JSON.parse(
      localStorage.getItem("customGradeMappings") || "{}"
    );
    const gradeMappings = { ...defaultGradeToGPA, ...customGradeMappings };

    // Process semesters and calculate GPAs
    gpaData.semesters = [];
    let totalWeightedGPA = 0;
    let totalCredits = 0;
    let allGPAs = [];
    let latestGPA = null;

    trackerData.semesters.forEach((semester, index) => {
      const semesterGPA = calculateSemesterGPA(semester, gradeMappings);

      if (semesterGPA !== null) {
        gpaData.semesters.push({
          semester: semester.name,
          gpa: semesterGPA,
        });

        // Calculate weighted average
        const semesterCredits = semester.subjects.reduce(
          (sum, subject) => sum + (parseFloat(subject.credits) || 0),
          0
        );
        totalWeightedGPA += semesterGPA * semesterCredits;
        totalCredits += semesterCredits;
        allGPAs.push(semesterGPA);
        latestGPA = semesterGPA;
      }
    });

    // Update overall stats
    if (allGPAs.length > 0) {
      gpaData.currentGPA =
        totalCredits > 0
          ? totalWeightedGPA / totalCredits
          : allGPAs.reduce((a, b) => a + b, 0) / allGPAs.length;
      gpaData.highestGPA = Math.max(...allGPAs);
      gpaData.lowestGPA = Math.min(...allGPAs);
      gpaData.averageGPA =
        totalCredits > 0
          ? totalWeightedGPA / totalCredits
          : allGPAs.reduce((a, b) => a + b, 0) / allGPAs.length;
    }

    console.log("GPA data loaded successfully:", gpaData);
  } catch (error) {
    console.error("Error loading GPA tracker data:", error);
  }
}

// Calculate GPA for a semester
function calculateSemesterGPA(semester, gradeMappings) {
  let totalPoints = 0;
  let totalCredits = 0;

  semester.subjects.forEach((subject) => {
    const gpa = gradeMappings[subject.grade];
    const credits = parseFloat(subject.credits) || 0;

    if (gpa !== undefined && gpa !== null && credits > 0) {
      totalPoints += gpa * credits;
      totalCredits += credits;
    }
  });

  if (totalCredits === 0) return null;

  return parseFloat((totalPoints / totalCredits).toFixed(2));
}

// Update GPA statistics
function updateGPAStats() {
  document.getElementById("current-gpa").textContent =
    gpaData.currentGPA.toFixed(2);
  document.getElementById("highest-gpa").textContent =
    gpaData.highestGPA.toFixed(2);
  document.getElementById("lowest-gpa").textContent =
    gpaData.lowestGPA.toFixed(2);
  document.getElementById("average-gpa").textContent =
    gpaData.averageGPA.toFixed(2);
}

// Update Average GPA card with trend
function updateAvgGPACard() {
  document.getElementById("avg-gpa-display").textContent =
    gpaData.averageGPA.toFixed(2);

  // Calculate trend
  const trendElement = document.getElementById("gpa-trend");
  let trend = "Stable";
  let trendIcon = "fa-minus";
  let trendClass = "";

  if (gpaData.semesters.length > 1) {
    const priorSemesterGPA =
      gpaData.semesters[gpaData.semesters.length - 2].gpa;
    const lastSemesterGPA = gpaData.semesters[gpaData.semesters.length - 1].gpa;
    const difference = lastSemesterGPA - priorSemesterGPA;

    if (difference > 0.1) {
      trend = "Improving";
      trendIcon = "fa-arrow-up";
      trendClass = "trend-up";
    } else if (difference < -0.1) {
      trend = "Declining";
      trendIcon = "fa-arrow-down";
      trendClass = "trend-down";
    }
  }

  trendElement.innerHTML = `<i class="fas ${trendIcon}"></i> ${trend}`;
  trendElement.className = `stat-secondary ${trendClass}`;
}

// Initialize GPA chart
function initializeGPAChart() {
  const ctx = document.getElementById("gpaChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: gpaData.semesters.map((s) => s.semester),
      datasets: [
        {
          label: "GPA Progression",
          data: gpaData.semesters.map((s) => s.gpa),
          borderColor: "rgba(255, 255, 255, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgba(255, 255, 255, 0.8)",
          pointBorderColor: "rgba(255, 255, 255, 0.3)",
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              size: 12,
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 2.0,
          max: 4.0,
          ticks: {
            color: "rgba(255, 255, 255, 0.5)",
            stepSize: 0.5,
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
        x: {
          ticks: {
            color: "rgba(255, 255, 255, 0.5)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
      },
    },
  });
}

// Update weekly statistics
function updateWeeklyStats() {
  const data = pomodoroData.weekly;

  // Update weekly sessions
  document.getElementById("weekly-sessions").textContent = data.sessions;

  // Update comparison
  const comparisonEl = document.getElementById("weekly-comparison");
  const percentChange = (
    (data.comparison / (data.sessions - data.comparison)) *
    100
  ).toFixed(0);
  comparisonEl.innerHTML = `<i class="fas fa-arrow-up"></i> +${data.comparison} (${percentChange}%)`;
  comparisonEl.className =
    "comparison-value " + (data.comparison >= 0 ? "increase" : "decrease");

  // Update streak
  document.getElementById("current-streak").textContent = data.streak;
}

// Generate weekly breakdown
function generateWeeklyBreakdown() {
  const breakdown = pomodoroData.weekly.dailyBreakdown;
  const container = document.getElementById("weekly-breakdown");
  const maxHours = Math.max(...Object.values(breakdown).map((d) => d.hours));

  container.innerHTML = Object.entries(breakdown)
    .map(([day, data]) => {
      const percentage = (data.hours / maxHours) * 100;
      return `
        <div class="day-stat">
          <div class="day-info">
            <div class="day-name">${day}</div>
            <div class="day-bar">
              <div class="day-progress" style="width: ${percentage}%"></div>
            </div>
          </div>
          <div class="day-hours">${data.hours.toFixed(2)}h</div>
        </div>
      `;
    })
    .join("");

  // Update total hours in header
  const totalHours = pomodoroData.weekly.hours;
  document.getElementById("weekly-total-hours").textContent = `${totalHours}h`;
}

// Initialize monthly chart
function initializeMonthlyChart() {
  const ctx = document.getElementById("monthlyChart").getContext("2d");
  const data = pomodoroData.monthly.currentMonth;

  monthlyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Sessions Per Day",
          data: data.daily,
          borderColor: "rgba(255, 255, 255, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgba(255, 255, 255, 0.8)",
          pointBorderColor: "rgba(255, 255, 255, 0.3)",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              size: 12,
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "rgba(255, 255, 255, 0.5)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
        x: {
          ticks: {
            color: "rgba(255, 255, 255, 0.5)",
            maxTicksLimit: 10,
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
      },
    },
  });

  updateMonthlyStats("current");
}

// Update monthly statistics
function updateMonthlyStats(period) {
  const data =
    period === "current"
      ? pomodoroData.monthly.currentMonth
      : pomodoroData.monthly.lastMonth;

  document.getElementById("total-sessions-month").textContent = data.sessions;
  document.getElementById("total-hours-month").textContent = data.hours;
  document.getElementById("avg-per-day").textContent = (
    data.hours / 30
  ).toFixed(2);

  // Update chart data
  if (monthlyChart) {
    monthlyChart.data.datasets[0].data = data.daily;
    monthlyChart.data.labels = data.labels;
    monthlyChart.update();
  }
}

// Setup event listeners
function setupEventListeners() {
  setupCustomSelect();
}

// Custom select functionality
function setupCustomSelect() {
  const wrapper = document.querySelector(".custom-select-wrapper");
  const display = wrapper.querySelector(".custom-select-display");
  const optionsContainer = wrapper.querySelector(".custom-select-options");
  const options = wrapper.querySelectorAll(".custom-select-option");
  const hiddenSelect = wrapper.querySelector("select");

  // Toggle dropdown
  display.addEventListener("click", () => {
    optionsContainer.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      optionsContainer.classList.remove("show");
    }
  });

  // Handle option selection
  options.forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.getAttribute("data-value");
      const text = option.textContent;

      // Update display text
      display.textContent = text;

      // Update selected state
      options.forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");

      // Update hidden select
      hiddenSelect.value = value;

      // Close dropdown
      optionsContainer.classList.remove("show");

      // Trigger change event
      updateMonthlyStats(value);
    });
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initializeProgress);
