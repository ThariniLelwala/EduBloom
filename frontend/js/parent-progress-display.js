// Parent Progress Display JavaScript
// For parent view - displays school student progress only

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

let monthlyChart = null;
let currentProgressData = null;
let scoresChart = null;
let markTrackerChart = null;

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

// Process child progress data from parent view
function processChildProgressData(progressData) {
  currentProgressData = progressData;
  
  // Process and display all data
  updateWeeklyStats();
  generateWeeklyBreakdown();
  initializeMonthlyChart();
  loadMentalLogs();
  loadTasks();
  
  // Load exam scores and then initialize chart
  loadExamScores().then(() => {
    initializeScoresChart();
    setupExamCountListener();
  });
  
  // Load mark tracker data
  loadMarkTrackerScores().then(() => {
    initializeMarkTrackerChart();
  });
}

// Load and display mental logs data for current week
async function loadMentalLogs() {
  try {
    let entries = [];
    
    // Get entries from current progress data
    if (currentProgressData && currentProgressData.diary) {
      entries = currentProgressData.diary.entries || [];
    }

    if (!entries || entries.length === 0) {
      const totalEntriesEl = document.getElementById("total-entries");
      const avgMoodEl = document.getElementById("avg-mood");
      const avgEnergyEl = document.getElementById("avg-energy");
      
      if (totalEntriesEl) totalEntriesEl.textContent = "0";
      if (avgMoodEl) avgMoodEl.textContent = "--";
      if (avgEnergyEl) avgEnergyEl.textContent = "--";
      
      // Show empty state for mental logs card
      const mentalLogsCard = document.querySelector('.card.w1:nth-child(3)'); // Third card is mental logs
      if (mentalLogsCard && !hasEmptyState('mental-logs-empty')) {
        const cardContent = mentalLogsCard.querySelector('.card-content');
        if (cardContent) {
          cardContent.id = 'mental-logs-empty';
          showEmptyState('mental-logs-empty', {
            icon: 'fa-brain',
            message: 'No mood/energy logs yet',
            subtext: 'Mental tracking helps understand study patterns'
          });
        }
      }
      return;
    }

    // Clear empty state if it exists
    clearEmptyState('mental-logs-empty');

    // Get current week's entries (last 7 days) for total count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const currentWeekEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.entry_date || entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate >= weekAgo && entryDate <= today;
    });

    const totalEntries = currentWeekEntries.length;

    // Calculate average mood from ALL entries
    let averageMood = "--";
    const moodsWithValues = entries
      .filter((entry) => entry.mood && moodValueMap.hasOwnProperty(entry.mood))
      .map((entry) => moodValueMap[entry.mood]);

    if (moodsWithValues.length > 0) {
      const averageValue =
        moodsWithValues.reduce((a, b) => a + b, 0) / moodsWithValues.length;

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
    const totalEntriesEl = document.getElementById("total-entries");
    const avgMoodEl = document.getElementById("avg-mood");
    const avgEnergyEl = document.getElementById("avg-energy");
    
    if (totalEntriesEl) totalEntriesEl.textContent = totalEntries;
    if (avgMoodEl) avgMoodEl.textContent = averageMood;
    if (avgEnergyEl) avgEnergyEl.textContent = averageEnergy;
  } catch (error) {
    console.error("Error loading mental logs:", error);
    const totalEntriesEl = document.getElementById("total-entries");
    const avgMoodEl = document.getElementById("avg-mood");
    const avgEnergyEl = document.getElementById("avg-energy");
    
    if (totalEntriesEl) totalEntriesEl.textContent = "0";
    if (avgMoodEl) avgMoodEl.textContent = "--";
    if (avgEnergyEl) avgEnergyEl.textContent = "--";
  }
}

// Load and display tasks data
function loadTasks() {
  try {
    let todos = [];
    
    // Get todos from current progress data
    if (currentProgressData && currentProgressData.todos) {
      todos = currentProgressData.todos.items || [];
    }

    if (!todos || todos.length === 0) {
      const totalAllCompletedEl = document.getElementById("total-all-completed");
      const todoTasksCompletedEl = document.getElementById("todo-tasks-completed");
      const weeklyTasksCompletedEl = document.getElementById("weekly-tasks-completed");
      const monthlyTasksCompletedEl = document.getElementById("monthly-tasks-completed");
      
      if (totalAllCompletedEl) totalAllCompletedEl.textContent = "0/0";
      if (todoTasksCompletedEl) todoTasksCompletedEl.textContent = "0/0";
      if (weeklyTasksCompletedEl) weeklyTasksCompletedEl.textContent = "0/0";
      if (monthlyTasksCompletedEl) monthlyTasksCompletedEl.textContent = "0/0";
      
      // Show empty state for tasks card
      const tasksCard = document.getElementById("tasks-card");
      if (tasksCard && !hasEmptyState('tasks-empty')) {
        const cardContent = tasksCard.querySelector('.card-content');
        if (cardContent) {
          cardContent.id = 'tasks-empty';
          showEmptyState('tasks-empty', {
            icon: 'fa-tasks',
            message: 'No tasks created yet',
            subtext: 'Set goals and track task completion for better productivity'
          });
        }
      }
      return;
    }

    // Clear empty state if it exists
    clearEmptyState('tasks-empty');

    // Calculate to-do completion
    const todoItems = todos.filter(t => t.type === 'todo');
    const totalTodos = todoItems.length;
    const completedTodos = todoItems.filter((task) => task.completed).length;

    // Calculate weekly goals completion
    const weeklyItems = todos.filter(t => t.type === 'weekly');
    const totalWeeklyGoals = weeklyItems.length;
    const completedWeeklyGoals = weeklyItems.filter(
      (goal) => goal.completed
    ).length;

    // Calculate monthly goals completion
    const monthlyItems = todos.filter(t => t.type === 'monthly');
    const totalMonthlyGoals = monthlyItems.length;
    const completedMonthlyGoals = monthlyItems.filter(
      (goal) => goal.completed
    ).length;

    // Calculate total combined
    const totalAllTasks = totalTodos + totalWeeklyGoals + totalMonthlyGoals;
    const completedAllTasks =
      completedTodos + completedWeeklyGoals + completedMonthlyGoals;

    // Update UI
    const totalAllCompletedEl = document.getElementById("total-all-completed");
    const todoTasksCompletedEl = document.getElementById("todo-tasks-completed");
    const weeklyTasksCompletedEl = document.getElementById("weekly-tasks-completed");
    const monthlyTasksCompletedEl = document.getElementById("monthly-tasks-completed");
    
    if (totalAllCompletedEl) totalAllCompletedEl.textContent = `${completedAllTasks}/${totalAllTasks}`;
    if (todoTasksCompletedEl) todoTasksCompletedEl.textContent = `${completedTodos}/${totalTodos}`;
    if (weeklyTasksCompletedEl) weeklyTasksCompletedEl.textContent = `${completedWeeklyGoals}/${totalWeeklyGoals}`;
    if (monthlyTasksCompletedEl) monthlyTasksCompletedEl.textContent = `${completedMonthlyGoals}/${totalMonthlyGoals}`;
  } catch (error) {
    console.error("Error loading tasks:", error);
    const totalAllCompletedEl = document.getElementById("total-all-completed");
    const todoTasksCompletedEl = document.getElementById("todo-tasks-completed");
    const weeklyTasksCompletedEl = document.getElementById("weekly-tasks-completed");
    const monthlyTasksCompletedEl = document.getElementById("monthly-tasks-completed");
    
    if (totalAllCompletedEl) totalAllCompletedEl.textContent = "0/0";
    if (todoTasksCompletedEl) todoTasksCompletedEl.textContent = "0/0";
    if (weeklyTasksCompletedEl) weeklyTasksCompletedEl.textContent = "0/0";
    if (monthlyTasksCompletedEl) monthlyTasksCompletedEl.textContent = "0/0";
  }
}

// ==================== EXAM SCORES FOR SCHOOL STUDENTS ====================
let examsData = null;

async function loadExamScores() {
  try {
    let terms = [];
    
    // Get terms from current progress data
    if (currentProgressData && currentProgressData.exams) {
      terms = currentProgressData.exams.terms || [];
    }

    if (!terms || terms.length === 0) {
      examsData = { exams: [] };
      updateLatestAverageScore();
      return;
    }

    // Format the data to match the expected examsData structure for the chart
    examsData = {
      exams: terms.map(term => {
        const marks = {};
        if (term.subjects && term.subjects.length > 0) {
            term.subjects.forEach(subject => {
                marks[subject.name] = parseFloat(subject.mark);
            });
        }
        return {
          name: term.name,
          date: term.created_at,
          marks: marks
        };
      })
    };

    updateLatestAverageScore();
    initializeScoresChart();
  } catch (error) {
    console.error("Error loading exam scores from API:", error);
    examsData = { exams: [] };
  }
}

function updateLatestAverageScore() {
  if (!examsData || !examsData.exams || examsData.exams.length === 0) {
    // Show empty state for latest average score card
    const avgScoreCard = document.getElementById("avg-score-card");
    if (avgScoreCard && !hasEmptyState('avg-score-empty')) {
      const cardContent = avgScoreCard.querySelector('.card-content');
      if (cardContent) {
        cardContent.id = 'avg-score-empty';
        showEmptyState('avg-score-empty', {
          icon: 'fa-clipboard-list',
          message: 'No exam results recorded',
          subtext: 'Track exam performance to monitor progress'
        });
      }
    }
    return;
  }

  // Clear empty state if it exists
  clearEmptyState('avg-score-empty');

  const latestExam = examsData.exams[examsData.exams.length - 1];
  const marks = Object.values(latestExam.marks).filter(
    (mark) => mark !== null && mark !== undefined
  );

  if (marks.length > 0) {
    const average = (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(
      2
    );
    const latestAvgScoreEl = document.getElementById("latest-avg-score");
    if (latestAvgScoreEl) latestAvgScoreEl.textContent = average;
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
  
  if (!trendElement) return;

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

function setupExamCountListener() {
  const countInput = document.getElementById("exam-count-input");
  if (!countInput) return;

  // Handle initial state - if input is empty or 0, show all exams
  const initialValue = countInput.value;
  if (!initialValue || parseInt(initialValue) <= 0) {
    // Show all exams by default
    updateScoresChart("");
  }

  countInput.addEventListener("change", () => {
    const count = parseInt(countInput.value);

    // Validate input
    if (isNaN(count) || count <= 0) {
      // Show all exams
      updateScoresChart("");
      return;
    }

    // Check if count exceeds number of exams
    if (count > examsData.exams.length) {
      countInput.value = examsData.exams.length;
      // Show all exams
      updateScoresChart("");
      return;
    }

    // Show last N exams
    const lastExamIndex = examsData.exams.length - count;
    updateScoresChart(lastExamIndex);
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
    const highestScoreEl = document.getElementById("highest-score");
    const lowestScoreEl = document.getElementById("lowest-score");
    const currentScoreEl = document.getElementById("current-score");
    
    if (highestScoreEl) highestScoreEl.textContent = Math.max(...numericData).toFixed(2);
    if (lowestScoreEl) lowestScoreEl.textContent = Math.min(...numericData).toFixed(2);
    if (currentScoreEl) currentScoreEl.textContent = numericData[numericData.length - 1];
  }

  updateScoreTrendDisplay();

  if (scoresChart) {
    scoresChart.data.labels = labels;
    scoresChart.data.datasets[0].data = data;
    scoresChart.update();
  }
}

function initializeScoresChart() {
  const examCard = document.getElementById("avg-scores-card");
  if (!examCard) return;

  if (!examsData || !examsData.exams || examsData.exams.length === 0) {
    // Show empty state for exam chart
    if (!hasEmptyState('avg-scores-card')) {
      showChartEmptyState('avg-scores-card', {
        icon: 'fa-chart-line',
        message: 'No exam data available',
        subtext: 'Exam results will be displayed here once recorded'
      });
    }
    return;
  }

  // Clear empty state if it exists
  clearEmptyState('avg-scores-card');

  const ctx = document.getElementById("scoresChart");
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (scoresChart) {
    scoresChart.destroy();
    scoresChart = null;
  }

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

// ==================== MARK TRACKER SCORES FOR SCHOOL STUDENTS ====================
let marksData = null;

async function loadMarkTrackerScores() {
  try {
      let subjects = [];
      
      // Get subjects from current progress data
      if (currentProgressData && currentProgressData.marks) {
          subjects = currentProgressData.marks.subjects || [];
      }

      if (!subjects || subjects.length === 0) {
          marksData = [];
          return;
      }

      marksData = subjects;
      initializeMarkTrackerChart();
  } catch(error) {
      console.error("Error loading mark tracker scores:", error);
      marksData = [];
  }
}

function processMarksForChart(subjectFilter = "all") {
    if (!marksData || marksData.length === 0) return { labels: [], data: [] };

    if (subjectFilter === "all") {
        // Find most recent 10 tests across all subjects to show a general trend, 
        // or average per subject. Let's show average per subject for "all"
        const labels = marksData.map(subj => subj.name);
        const data = marksData.map(subj => {
            if (!subj.tests || subj.tests.length === 0) return 0;
            const sum = subj.tests.reduce((a, b) => a + parseFloat(b.mark), 0);
            return (sum / subj.tests.length).toFixed(2);
        });
        return { labels, data, label: "Average Score (%)" };
    } else {
        // Find specific subject and chart its tests over time
        const subject = marksData.find(s => s.id === parseInt(subjectFilter));
        if (!subject || !subject.tests || subject.tests.length === 0) return { labels: [], data: [], label: "No Tests" };
        
        // Sort tests by date
        const sortedTests = [...subject.tests].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        const labels = sortedTests.map(t => t.name);
        const data = sortedTests.map(t => parseFloat(t.mark).toFixed(2));
        return { labels, data, label: `${subject.name} Marks` };
    }
}

function updateMarkTrackerStats(dataArray) {
    const statsContainer = document.getElementById("mark-tracker-stats");
    if (!statsContainer) return;

    const numericData = dataArray.map(d => parseFloat(d));
    if (numericData.length === 0) {
      // Show empty state for stats container
      if (!hasEmptyState('mark-tracker-stats')) {
        showEmptyState('mark-tracker-stats', {
          icon: 'fa-chart-bar',
          message: 'No mark data available',
          subtext: 'Subject marks will be displayed here once recorded'
        });
      }
      return;
    }

    // Clear empty state if it exists
    clearEmptyState('mark-tracker-stats');

    const max = Math.max(...numericData).toFixed(2);
    const min = Math.min(...numericData).toFixed(2);
    const avg = (numericData.reduce((a, b) => a + b, 0) / numericData.length).toFixed(2);

    statsContainer.innerHTML = `
      <div class="score-stat">
        <span class="stat-label">Highest</span>
        <span class="stat-value">${max}</span>
      </div>
      <div class="score-stat">
        <span class="stat-label">Lowest</span>
        <span class="stat-value">${min}</span>
      </div>
      <div class="score-stat">
        <span class="stat-label">Average</span>
        <span class="stat-value">${avg}</span>
      </div>
    `;
}

function updateMarkTrackerChart(subjectFilter = "all") {
    if (!markTrackerChart) return;
    
    const chartData = processMarksForChart(subjectFilter);
    
    // Check if there's no data
    if (!chartData.labels || chartData.labels.length === 0) {
      // Show empty state for mark chart
      if (!hasEmptyState('mark-tracker-card')) {
        showChartEmptyState('mark-tracker-card', {
          icon: 'fa-chart-bar',
          message: 'No mark data available',
          subtext: 'Subject marks will be displayed here once recorded'
        });
      }
      return;
    }

    // Clear empty state if it exists
    clearEmptyState('mark-tracker-card');
    
    markTrackerChart.data.labels = chartData.labels;
    markTrackerChart.data.datasets[0].data = chartData.data;
    markTrackerChart.data.datasets[0].label = chartData.label;
    markTrackerChart.update();
    
    updateMarkTrackerStats(chartData.data);
}

function initializeMarkTrackerChart() {
    const markCard = document.getElementById("mark-tracker-card");
    if (!markCard) return;

    // Destroy existing chart if it exists
    if (markTrackerChart) {
        markTrackerChart.destroy();
        markTrackerChart = null;
    }

    const chartData = processMarksForChart("all");

    // Check if there's no data
    if (!chartData.labels || chartData.labels.length === 0) {
      // Show empty state for mark chart
      if (!hasEmptyState('mark-tracker-card')) {
        showChartEmptyState('mark-tracker-card', {
          icon: 'fa-chart-bar',
          message: 'No mark data available',
          subtext: 'Subject marks will be displayed here once recorded'
        });
      }
      return;
    }

    // Clear empty state if it exists
    clearEmptyState('mark-tracker-card');

    const ctx = document.getElementById("markTrackerChart");
    if (!ctx) return;

    markTrackerChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: chartData.labels,
            datasets: [{
                label: chartData.label,
                data: chartData.data,
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                borderColor: "rgba(255, 255, 255, 1)",
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: "rgba(255, 255, 255, 0.7)" }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    ticks: { color: "rgba(255, 255, 255, 0.7)" }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: "rgba(255, 255, 255, 0.7)" }
                }
            }
        }
    });
    
    updateMarkTrackerStats(chartData.data);
}

// Update weekly statistics
function updateWeeklyStats() {
  let sessions = [];
  
  // Get sessions from current progress data
  if (currentProgressData && currentProgressData.pomodoro) {
    sessions = currentProgressData.pomodoro.sessions || [];
  }

  if (!sessions || sessions.length === 0) {
    const weeklySessionsEl = document.getElementById("weekly-sessions");
    const weeklyComparisonEl = document.getElementById("weekly-comparison");
    const currentStreakEl = document.getElementById("current-streak");
    
    if (weeklySessionsEl) weeklySessionsEl.textContent = "0";
    if (weeklyComparisonEl) weeklyComparisonEl.innerHTML = '<i class="fas fa-minus"></i> 0 (0%)';
    if (currentStreakEl) currentStreakEl.textContent = "0";
    
    // Show empty state for weekly breakdown
    const breakdownContainer = document.getElementById("weekly-breakdown");
    if (breakdownContainer && !hasEmptyState('weekly-breakdown')) {
      showEmptyState('weekly-breakdown', {
        icon: 'fa-clock',
        message: 'No study sessions this week',
        subtext: 'Sessions will appear here once your child starts studying'
      });
    }
    
    return;
  }

  // Calculate weekly data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6); // Last 7 days including today

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7); // Previous week

  // Filter sessions for current week
  const currentWeekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.start_time);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate >= weekStart && sessionDate <= today;
  });

  // Filter sessions for last week
  const lastWeekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.start_time);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate >= lastWeekStart && sessionDate < weekStart;
  });

  const currentWeekCount = currentWeekSessions.length;
  const lastWeekCount = lastWeekSessions.length;
  const comparison = currentWeekCount - lastWeekCount;

  // Calculate streak
  const streak = calculateStreak(sessions);

  // Update UI
  const weeklySessionsEl = document.getElementById("weekly-sessions");
  const comparisonEl = document.getElementById("weekly-comparison");
  const currentStreakEl = document.getElementById("current-streak");
  
  if (weeklySessionsEl) weeklySessionsEl.textContent = currentWeekCount;

  if (comparisonEl) {
    if (lastWeekCount > 0) {
      const percentChange = ((comparison / lastWeekCount) * 100).toFixed(0);
      const icon = comparison >= 0 ? "fa-arrow-up" : "fa-arrow-down";
      const className = comparison >= 0 ? "increase" : "decrease";
      comparisonEl.innerHTML = `<i class="fas ${icon}"></i> ${comparison >= 0 ? '+' : ''}${comparison} (${percentChange}%)`;
      comparisonEl.className = `comparison-value ${className}`;
    } else {
      comparisonEl.innerHTML = `<i class="fas fa-arrow-up"></i> +${comparison} (N/A)`;
      comparisonEl.className = "comparison-value increase";
    }
  }

  if (currentStreakEl) currentStreakEl.textContent = streak;
}

// Calculate consecutive day streak
function calculateStreak(sessions) {
  if (!sessions || sessions.length === 0) return 0;

  // Get unique dates with sessions
  const sessionDates = sessions
    .map(session => {
      const date = new Date(session.start_time);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => b - a); // Sort descending

  if (sessionDates.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const currentTimestamp = currentDate.getTime();

  // Check if there's a session today or yesterday to start the streak
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayTimestamp = yesterday.getTime();

  if (sessionDates[0] !== currentTimestamp && sessionDates[0] !== yesterdayTimestamp) {
    return 0; // Streak broken
  }

  // Count consecutive days
  for (let i = 0; i < sessionDates.length; i++) {
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedTimestamp = expectedDate.getTime();

    if (sessionDates.includes(expectedTimestamp)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Generate weekly breakdown
function generateWeeklyBreakdown() {
  let sessions = [];
  
  // Get sessions from current progress data
  if (currentProgressData && currentProgressData.pomodoro) {
    sessions = currentProgressData.pomodoro.sessions || [];
  }

  if (!sessions || sessions.length === 0) {
    const container = document.getElementById("weekly-breakdown");
    if (container && !hasEmptyState('weekly-breakdown')) {
      showEmptyState('weekly-breakdown', {
        icon: 'fa-clock',
        message: 'No study sessions this week',
        subtext: 'Sessions will appear here once your child starts studying'
      });
    }
    const weeklyTotalHoursEl = document.getElementById("weekly-total-hours");
    if (weeklyTotalHoursEl) weeklyTotalHoursEl.textContent = "0h";
    return;
  }

  // Clear empty state if it exists
  clearEmptyState('weekly-breakdown');

  // Calculate daily breakdown for last 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });

    const sessionCount = daySessions.length;
    const totalMinutes = daySessions.reduce((sum, session) => {
      const duration = session.duration_minutes || 25; // Default 25 min if not specified
      return sum + duration;
    }, 0);

    const hours = totalMinutes / 60;

    days.push({
      name: dayNames[date.getDay()],
      sessions: sessionCount,
      hours: hours
    });
  }

  // Find max hours for scaling
  const maxHours = Math.max(...days.map(d => d.hours), 0.1); // Avoid division by zero

  // Generate HTML
  const container = document.getElementById("weekly-breakdown");
  if (!container) return;
  
  container.innerHTML = days.map(day => {
    const percentage = (day.hours / maxHours) * 100;
    return `
      <div class="day-stat">
        <div class="day-info">
          <div class="day-name">${day.name}</div>
          <div class="day-bar">
            <div class="day-progress" style="width: ${percentage}%"></div>
          </div>
        </div>
        <div class="day-hours">${day.hours.toFixed(2)}h</div>
      </div>
    `;
  }).join("");

  // Update total hours
  const totalHours = days.reduce((sum, day) => sum + day.hours, 0);
  const weeklyTotalHoursEl = document.getElementById("weekly-total-hours");
  if (weeklyTotalHoursEl) weeklyTotalHoursEl.textContent = `${totalHours.toFixed(2)}h`;
}

// Initialize monthly chart
function initializeMonthlyChart() {
  let sessions = [];
  
  // Get sessions from current progress data
  if (currentProgressData && currentProgressData.pomodoro) {
    sessions = currentProgressData.pomodoro.sessions || [];
  }

  const monthlyCard = document.getElementById("monthly-analytics-card");
  if (!monthlyCard) return;

  const ctx = document.getElementById("monthlyChart");
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (monthlyChart) {
    monthlyChart.destroy();
    monthlyChart = null;
  }

  if (!sessions || sessions.length === 0) {
    // Show empty state for monthly chart
    if (!hasEmptyState('monthly-analytics-card')) {
      showChartEmptyState('monthly-analytics-card', {
        icon: 'fa-calendar-alt',
        message: 'No session data for this period',
        subtext: 'Session data will appear here once your child starts studying'
      });
    }
    
    const totalSessionsEl = document.getElementById("total-sessions-month");
    const totalHoursEl = document.getElementById("total-hours-month");
    const avgPerDayEl = document.getElementById("avg-per-day");
    
    if (totalSessionsEl) totalSessionsEl.textContent = "0";
    if (totalHoursEl) totalHoursEl.textContent = "0";
    if (avgPerDayEl) avgPerDayEl.textContent = "0";
    return;
  }

  // Clear empty state if it exists
  clearEmptyState('monthly-analytics-card');

  // Calculate daily data for current month
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const dailyData = [];
  const labels = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });

    dailyData.push(daySessions.length);
    labels.push(`Day ${day}`);
  }

  const totalSessions = dailyData.reduce((a, b) => a + b, 0);
  const totalMinutes = sessions.reduce((sum, session) => {
    const duration = session.duration_minutes || 25;
    return sum + duration;
  }, 0);
  const totalHours = totalMinutes / 60;
  const avgPerDay = totalHours / daysInMonth;

  // Update stats
  const totalSessionsEl = document.getElementById("total-sessions-month");
  const totalHoursEl = document.getElementById("total-hours-month");
  const avgPerDayEl = document.getElementById("avg-per-day");
  
  if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
  if (totalHoursEl) totalHoursEl.textContent = totalHours.toFixed(2);
  if (avgPerDayEl) avgPerDayEl.textContent = avgPerDay.toFixed(2);

  // Create chart
  monthlyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Sessions Per Day",
          data: dailyData,
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
}

// Setup event listeners
function setupEventListeners() {
  setupCustomSelect();
}

// Custom select functionality
function setupCustomSelect() {
  const wrappers = document.querySelectorAll(".custom-select-wrapper");
  
  wrappers.forEach(wrapper => {
    const display = wrapper.querySelector(".custom-select-display");
    const optionsContainer = wrapper.querySelector(".custom-select-options");
    const options = wrapper.querySelectorAll(".custom-select-option");
    const hiddenSelect = wrapper.querySelector("select");

    if (!display || !optionsContainer || !hiddenSelect) return;

    // Toggle dropdown
    display.addEventListener("click", () => {
      optionsContainer.classList.toggle("show");
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

        // Note: Time filtering functionality will be implemented in future updates
        // For now, the chart shows current month data from the backend
        console.log("Time period selected:", value);
      });
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    wrappers.forEach(wrapper => {
      const optionsContainer = wrapper.querySelector(".custom-select-options");
      if (optionsContainer && !wrapper.contains(e.target)) {
        optionsContainer.classList.remove("show");
      }
    });
  });
}

// Make function globally accessible for parent-progress.js
window.processParentProgressData = processChildProgressData;
