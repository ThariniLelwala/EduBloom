// Teacher Overview Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  loadOverviewData();
  initializeCharts();
});

// Load all overview data
function loadOverviewData() {
  loadQuizStatistics();
  loadForumStatistics();
  loadQuizDetails();
  loadTopQuizzes();
  loadRecentActivity();
}

// Load quiz statistics
function loadQuizStatistics() {
  // Load data from quiz.json
  fetch("../../data/quiz.json")
    .then((response) => response.json())
    .then((data) => {
      let totalQuizzes = 0;
      let totalQuestions = 0;

      data.subjects.forEach((subject) => {
        totalQuizzes += subject.quizzes.length;
        subject.quizzes.forEach((quiz) => {
          totalQuestions += quiz.questions.length;
        });
      });

      // Simulate attempts based on quiz count (in a real app, this would come from a database)
      const totalAttempts =
        totalQuizzes * (Math.floor(Math.random() * 15) + 10);
      const averageScore = Math.floor(Math.random() * 15) + 80; // 80-95%

      document.getElementById("total-quiz-attempts").textContent =
        totalAttempts;
      document.getElementById("average-score").textContent = averageScore + "%";
      document.getElementById("published-quizzes").textContent = totalQuizzes;
    })
    .catch((error) => {
      console.error("Error loading quiz data:", error);
      // Fallback to localStorage if quiz.json fails
      loadQuizStatisticsFromLocalStorage();
    });
}

// Fallback function for localStorage data
function loadQuizStatisticsFromLocalStorage() {
  const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
  if (!teacherSubjects) return;

  const subjects = JSON.parse(teacherSubjects);
  let totalAttempts = 0;
  let totalScore = 0;
  let scoreCount = 0;
  let publishedCount = 0;

  subjects.forEach((subject) => {
    subject.quizzes.forEach((quiz) => {
      if (quiz.published) {
        publishedCount++;
        const attempts = Math.floor(Math.random() * 20) + 5;
        totalAttempts += attempts;
        const avgScore = Math.floor(Math.random() * 30) + 70;
        totalScore += avgScore * attempts;
        scoreCount += attempts;
      }
    });
  });

  document.getElementById("total-quiz-attempts").textContent = totalAttempts;
  document.getElementById("published-quizzes").textContent = publishedCount;

  if (scoreCount > 0) {
    const overallAverage = Math.round(totalScore / scoreCount);
    document.getElementById("average-score").textContent = overallAverage + "%";
  }
}

// Load forum statistics
function loadForumStatistics() {
  // Simulate forum data
  const views = Math.floor(Math.random() * 500) + 200;
  const posts = Math.floor(Math.random() * 100) + 50;
  const reports = Math.floor(Math.random() * 10) + 1;

  document.getElementById("forum-views").textContent = views;
  document.getElementById("forum-posts").textContent = posts;
  document.getElementById("forum-reports").textContent = reports;
}

// Load quiz details table
function loadQuizDetails() {
  fetch("../../data/quiz.json")
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.getElementById("quiz-details-body");
      tbody.innerHTML = "";

      data.subjects.forEach((subject) => {
        subject.quizzes.forEach((quiz) => {
          // Simulate attempts and scores for each quiz
          const attempts = Math.floor(Math.random() * 15) + 3;
          const avgScore = Math.floor(Math.random() * 25) + 75;
          const status = "Published"; // All quizzes in quiz.json are considered published/shared

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${quiz.name}</td>
            <td>${attempts}</td>
            <td>${avgScore}%</td>
            <td><span class="status-${status.toLowerCase()}">${status}</span></td>
          `;
          tbody.appendChild(row);
        });
      });
    })
    .catch((error) => {
      console.error("Error loading quiz details:", error);
      // Fallback to localStorage if quiz.json fails
      loadQuizDetailsFromLocalStorage();
    });
}

// Fallback function for localStorage quiz details
function loadQuizDetailsFromLocalStorage() {
  const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
  if (!teacherSubjects) return;

  const subjects = JSON.parse(teacherSubjects);
  const tbody = document.getElementById("quiz-details-body");
  tbody.innerHTML = "";

  subjects.forEach((subject) => {
    subject.quizzes.forEach((quiz) => {
      if (quiz.published) {
        const attempts = Math.floor(Math.random() * 15) + 3;
        const avgScore = Math.floor(Math.random() * 25) + 75;
        const status = quiz.published ? "Published" : "Draft";

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${quiz.name}</td>
          <td>${attempts}</td>
          <td>${avgScore}%</td>
          <td><span class="status-${status.toLowerCase()}">${status}</span></td>
        `;
        tbody.appendChild(row);
      }
    });
  });
}

// Load top performing quizzes
function loadTopQuizzes() {
  fetch("../../data/quiz.json")
    .then((response) => response.json())
    .then((data) => {
      const topQuizzesList = document.getElementById("top-quizzes-list");
      topQuizzesList.innerHTML = "";

      const quizzes = [];
      data.subjects.forEach((subject) => {
        subject.quizzes.forEach((quiz) => {
          const attempts = Math.floor(Math.random() * 20) + 5;
          const avgScore = Math.floor(Math.random() * 25) + 75;
          quizzes.push({
            name: quiz.name,
            attempts: attempts,
            avgScore: avgScore,
            score: avgScore, // for sorting
          });
        });
      });

      // Sort by average score and take top 5
      quizzes.sort((a, b) => b.avgScore - a.avgScore);
      const topQuizzes = quizzes.slice(0, 5);

      topQuizzes.forEach((quiz) => {
        const quizItem = document.createElement("div");
        quizItem.className = "top-quiz-item";
        quizItem.innerHTML = `
          <div class="quiz-info">
            <span class="quiz-name">${quiz.name}</span>
            <span class="quiz-stats">${quiz.attempts} attempts • ${quiz.avgScore}% avg</span>
          </div>
          <div class="quiz-score">${quiz.avgScore}%</div>
        `;
        topQuizzesList.appendChild(quizItem);
      });
    })
    .catch((error) => {
      console.error("Error loading top quizzes:", error);
      // Fallback to localStorage if quiz.json fails
      loadTopQuizzesFromLocalStorage();
    });
}

// Fallback function for localStorage top quizzes
function loadTopQuizzesFromLocalStorage() {
  const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
  if (!teacherSubjects) return;

  const subjects = JSON.parse(teacherSubjects);
  const topQuizzesList = document.getElementById("top-quizzes-list");
  topQuizzesList.innerHTML = "";

  const quizzes = [];
  subjects.forEach((subject) => {
    subject.quizzes.forEach((quiz) => {
      if (quiz.published) {
        const attempts = Math.floor(Math.random() * 20) + 5;
        const avgScore = Math.floor(Math.random() * 25) + 75;
        quizzes.push({
          name: quiz.name,
          attempts: attempts,
          avgScore: avgScore,
          score: avgScore, // for sorting
        });
      }
    });
  });

  // Sort by average score and take top 5
  quizzes.sort((a, b) => b.avgScore - a.avgScore);
  const topQuizzes = quizzes.slice(0, 5);

  topQuizzes.forEach((quiz) => {
    const quizItem = document.createElement("div");
    quizItem.className = "top-quiz-item";
    quizItem.innerHTML = `
      <div class="quiz-info">
        <span class="quiz-name">${quiz.name}</span>
        <span class="quiz-stats">${quiz.attempts} attempts • ${quiz.avgScore}% avg</span>
      </div>
      <div class="quiz-score">${quiz.avgScore}%</div>
    `;
    topQuizzesList.appendChild(quizItem);
  });
}

// Load recent activity
function loadRecentActivity() {
  const activities = [
    {
      icon: "fas fa-question-circle",
      text: "New quiz attempt on Mathematics",
      time: "2 hours ago",
    },
    {
      icon: "fas fa-comments",
      text: "New forum post in Science discussion",
      time: "4 hours ago",
    },
    {
      icon: "fas fa-star",
      text: "New review on Physics quiz",
      time: "1 day ago",
    },
    {
      icon: "fas fa-upload",
      text: "Published new Chemistry quiz",
      time: "2 days ago",
    },
    { icon: "fas fa-flag", text: "Forum post reported", time: "3 days ago" },
  ];

  const activityList = document.getElementById("recent-activity");
  activityList.innerHTML = "";

  activities.forEach((activity) => {
    const activityItem = document.createElement("div");
    activityItem.className = "activity-item";
    activityItem.innerHTML = `
      <i class="${activity.icon}"></i>
      <div class="activity-content">
        <span>${activity.text}</span>
        <small>${activity.time}</small>
      </div>
    `;
    activityList.appendChild(activityItem);
  });
}

// Initialize charts
function initializeCharts() {
  // Load quiz data for charts
  fetch("../../data/quiz.json")
    .then((response) => response.json())
    .then((data) => {
      const quizCount = data.subjects.reduce(
        (total, subject) => total + subject.quizzes.length,
        0
      );

      // Generate realistic chart data based on quiz count
      const weeklyAttempts = [];
      for (let i = 0; i < 7; i++) {
        weeklyAttempts.push(
          Math.floor(Math.random() * quizCount * 2) + quizCount
        );
      }

      // Quiz Engagement Chart
      const quizCtx = document.getElementById("quizChart").getContext("2d");
      new Chart(quizCtx, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Quiz Attempts",
              data: weeklyAttempts,
              borderColor: "#4ade80",
              backgroundColor: "rgba(74, 222, 128, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.7)",
              },
            },
            x: {
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.7)",
              },
            },
          },
        },
      });

      // Trends Chart with real quiz data
      const trendsCtx = document.getElementById("trendsChart").getContext("2d");
      const weeklyQuizAttempts = [];
      const weeklyForumPosts = [];
      for (let i = 0; i < 4; i++) {
        weeklyQuizAttempts.push(
          Math.floor(Math.random() * quizCount * 4) + quizCount * 2
        );
        weeklyForumPosts.push(Math.floor(Math.random() * 50) + 20);
      }

      new Chart(trendsCtx, {
        type: "line",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Quiz Attempts",
              data: weeklyQuizAttempts,
              borderColor: "#4ade80",
              backgroundColor: "rgba(74, 222, 128, 0.1)",
              tension: 0.4,
            },
            {
              label: "Forum Posts",
              data: weeklyForumPosts,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: "rgba(255, 255, 255, 0.7)",
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.7)",
              },
            },
            x: {
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.7)",
              },
            },
          },
        },
      });
    })
    .catch((error) => {
      console.error("Error loading chart data:", error);
      // Fallback to hardcoded chart data
      initializeChartsFallback();
    });

  // Forum Engagement Chart
  const forumCtx = document.getElementById("forumChart").getContext("2d");
  new Chart(forumCtx, {
    type: "bar",
    data: {
      labels: ["Views", "Posts", "Reports"],
      datasets: [
        {
          label: "Forum Activity",
          data: [
            parseInt(document.getElementById("forum-views").textContent),
            parseInt(document.getElementById("forum-posts").textContent),
            parseInt(document.getElementById("forum-reports").textContent),
          ],
          backgroundColor: [
            "rgba(74, 222, 128, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: ["#4ade80", "#3b82f6", "#ef4444"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
      },
    },
  });
}

// Fallback chart initialization with hardcoded data
function initializeChartsFallback() {
  // Quiz Engagement Chart
  const quizCtx = document.getElementById("quizChart").getContext("2d");
  new Chart(quizCtx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Quiz Attempts",
          data: [12, 19, 15, 25, 22, 18, 14],
          borderColor: "#4ade80",
          backgroundColor: "rgba(74, 222, 128, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
      },
    },
  });

  // Trends Chart
  const trendsCtx = document.getElementById("trendsChart").getContext("2d");
  new Chart(trendsCtx, {
    type: "line",
    data: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "Quiz Attempts",
          data: [45, 59, 80, 81],
          borderColor: "#4ade80",
          backgroundColor: "rgba(74, 222, 128, 0.1)",
          tension: 0.4,
        },
        {
          label: "Forum Posts",
          data: [28, 48, 40, 19],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
          },
        },
      },
    },
  });
}
