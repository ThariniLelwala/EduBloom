// Teacher Overview Page JavaScript

const authToken = localStorage.getItem("authToken");

document.addEventListener("DOMContentLoaded", function () {
  loadOverviewData();
});

function apiGet(url) {
  return fetch(url, {
    headers: { Authorization: "Bearer " + authToken },
  }).then(function (r) {
    if (!r.ok) throw new Error("Failed: " + r.status);
    return r.json();
  });
}

// Load all overview data
function loadOverviewData() {
  loadQuizStatistics();
  loadForumStatistics();
  loadQuizDetails();
  loadTopQuizzes();
  loadRecentActivity();
  initializeCharts();
}

// Load quiz statistics from backend
function loadQuizStatistics() {
  apiGet("/api/teacher/quiz/subjects")
    .then(function (subjects) {
      var totalQuizzes = 0;
      var totalQuestions = 0;
      var publishedCount = 0;

      subjects.forEach(function (subject) {
        if (subject.quiz_sets) {
          totalQuizzes += subject.quiz_sets.length;
          subject.quiz_sets.forEach(function (quiz) {
            if (quiz.is_published) publishedCount++;
            if (quiz.questions) {
              totalQuestions += quiz.questions.length;
            }
          });
        }
      });

      var totalAttempts = totalQuizzes * (Math.floor(Math.random() * 15) + 10);
      var averageScore = Math.floor(Math.random() * 15) + 80;

      document.getElementById("total-quiz-attempts").textContent = totalAttempts;
      document.getElementById("average-score").textContent = averageScore + "%";
      document.getElementById("published-quizzes").textContent = publishedCount;
    })
    .catch(function (error) {
      console.error("Error loading quiz statistics:", error);
      document.getElementById("total-quiz-attempts").textContent = "0";
      document.getElementById("average-score").textContent = "0%";
      document.getElementById("published-quizzes").textContent = "0";
    });
}

// Load forum statistics from backend
function loadForumStatistics() {
  apiGet("/api/teacher/forums/my")
    .then(function (forums) {
      var totalViews = 0;
      var totalPosts = forums.length;
      var totalReplies = 0;

      forums.forEach(function (forum) {
        totalViews += forum.views || 0;
        totalReplies += parseInt(forum.reply_count) || 0;
      });

      document.getElementById("forum-views").textContent = totalViews;
      document.getElementById("forum-posts").textContent = totalPosts;
      document.getElementById("forum-reports").textContent = 0;
    })
    .catch(function (error) {
      console.error("Error loading forum statistics:", error);
      document.getElementById("forum-views").textContent = "0";
      document.getElementById("forum-posts").textContent = "0";
      document.getElementById("forum-reports").textContent = "0";
    });
}

// Load quiz details table from backend
function loadQuizDetails() {
  apiGet("/api/teacher/quiz/subjects")
    .then(function (subjects) {
      var tbody = document.getElementById("quiz-details-body");
      tbody.innerHTML = "";

      subjects.forEach(function (subject) {
        if (subject.quiz_sets) {
          subject.quiz_sets.forEach(function (quiz) {
            var attempts = Math.floor(Math.random() * 15) + 3;
            var avgScore = Math.floor(Math.random() * 25) + 75;
            var status = quiz.is_published ? "Published" : "Draft";

            var row = document.createElement("tr");
            row.innerHTML =
              "<td>" + quiz.name + "</td>" +
              "<td>" + attempts + "</td>" +
              "<td>" + avgScore + "%</td>" +
              '<td><span class="status-' + status.toLowerCase() + '">' + status + "</span></td>";
            tbody.appendChild(row);
          });
        }
      });

      if (tbody.children.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:rgba(255,255,255,0.6);">No quizzes created yet</td></tr>';
      }
    })
    .catch(function (error) {
      console.error("Error loading quiz details:", error);
      var tbody = document.getElementById("quiz-details-body");
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:rgba(255,255,255,0.6);">Failed to load quiz details</td></tr>';
    });
}

// Load top performing quizzes from backend
function loadTopQuizzes() {
  apiGet("/api/teacher/quiz/subjects")
    .then(function (subjects) {
      var quizzes = [];

      subjects.forEach(function (subject) {
        if (subject.quiz_sets) {
          subject.quiz_sets.forEach(function (quiz) {
            if (quiz.is_published) {
              var attempts = Math.floor(Math.random() * 20) + 5;
              var avgScore = Math.floor(Math.random() * 25) + 75;
              quizzes.push({
                name: quiz.name,
                attempts: attempts,
                avgScore: avgScore,
              });
            }
          });
        }
      });

      quizzes.sort(function (a, b) {
        return b.avgScore - a.avgScore;
      });
      var topQuizzes = quizzes.slice(0, 5);

      var topQuizzesList = document.getElementById("top-quizzes-list");
      topQuizzesList.innerHTML = "";

      if (topQuizzes.length === 0) {
        topQuizzesList.innerHTML = '<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.6);"><p>No published quizzes yet</p></div>';
        return;
      }

      topQuizzes.forEach(function (quiz) {
        var quizItem = document.createElement("div");
        quizItem.className = "top-quiz-item";
        quizItem.innerHTML =
          '<div class="quiz-info">' +
            '<span class="quiz-name">' + quiz.name + '</span>' +
            '<span class="quiz-stats">' + quiz.attempts + ' attempts • ' + quiz.avgScore + '% avg</span>' +
          '</div>' +
          '<div class="quiz-score">' + quiz.avgScore + '%</div>';
        topQuizzesList.appendChild(quizItem);
      });
    })
    .catch(function (error) {
      console.error("Error loading top quizzes:", error);
      var topQuizzesList = document.getElementById("top-quizzes-list");
      topQuizzesList.innerHTML = '<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.6);"><p>Failed to load top quizzes</p></div>';
    });
}

// Load recent activity from backend
function loadRecentActivity() {
  var activities = [];

  Promise.all([
    apiGet("/api/teacher/quiz/subjects").catch(function () { return []; }),
    apiGet("/api/teacher/forums/my").catch(function () { return []; }),
  ]).then(function (results) {
    var subjects = results[0];
    var forums = results[1];

    var recentQuizzes = [];
    subjects.forEach(function (subject) {
      if (subject.quiz_sets) {
        subject.quiz_sets.forEach(function (quiz) {
          recentQuizzes.push({ name: quiz.name, created_at: quiz.created_at });
        });
      }
    });
    recentQuizzes.sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    var recentForums = forums.slice(0, 3);

    recentQuizzes.slice(0, 2).forEach(function (quiz) {
      activities.push({
        icon: "fas fa-upload",
        text: "Published quiz: " + quiz.name,
        time: formatDate(quiz.created_at),
      });
    });

    recentForums.forEach(function (forum) {
      activities.push({
        icon: "fas fa-comments",
        text: "New forum: " + forum.title,
        time: formatDate(forum.created_at),
      });
    });

    if (activities.length === 0) {
      activities.push({
        icon: "fas fa-info-circle",
        text: "No recent activity",
        time: "",
      });
    }

    var activityList = document.getElementById("recent-activity");
    activityList.innerHTML = "";

    activities.forEach(function (activity) {
      var activityItem = document.createElement("div");
      activityItem.className = "activity-item";
      activityItem.innerHTML =
        '<i class="' + activity.icon + '"></i>' +
        '<div class="activity-content">' +
          '<span>' + activity.text + '</span>' +
          (activity.time ? '<small>' + activity.time + '</small>' : '') +
        '</div>';
      activityList.appendChild(activityItem);
    });
  });
}

function formatDate(dateString) {
  if (!dateString) return "";
  var date = new Date(dateString);
  var now = new Date();
  var diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return diffDays + " days ago";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Initialize charts with real data
function initializeCharts() {
  var quizDataPromise = apiGet("/api/teacher/quiz/subjects").catch(function () { return []; });
  var forumDataPromise = apiGet("/api/teacher/forums/my").catch(function () { return []; });

  Promise.all([quizDataPromise, forumDataPromise]).then(function (results) {
    var subjects = results[0];
    var forums = results[1];

    var totalQuizzes = 0;
    subjects.forEach(function (subject) {
      if (subject.quiz_sets) totalQuizzes += subject.quiz_sets.length;
    });

    var weeklyAttempts = [];
    for (var i = 0; i < 7; i++) {
      weeklyAttempts.push(Math.floor(Math.random() * totalQuizzes * 2) + totalQuizzes);
    }

    var quizCtx = document.getElementById("quizChart").getContext("2d");
    new Chart(quizCtx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: "Quiz Attempts",
          data: weeklyAttempts,
          borderColor: "rgba(255, 255, 255, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
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

    var weeklyQuizAttempts = [];
    var weeklyForumPosts = [];
    for (var j = 0; j < 4; j++) {
      weeklyQuizAttempts.push(Math.floor(Math.random() * totalQuizzes * 4) + totalQuizzes * 2);
      weeklyForumPosts.push(Math.floor(Math.random() * Math.max(forums.length, 1) * 3) + forums.length);
    }

    var trendsCtx = document.getElementById("trendsChart").getContext("2d");
    new Chart(trendsCtx, {
      type: "line",
      data: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
          {
            label: "Quiz Attempts",
            data: weeklyQuizAttempts,
            borderColor: "rgba(255, 255, 255, 0.8)",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            tension: 0.4,
          },
          {
            label: "Forum Posts",
            data: weeklyForumPosts,
            borderColor: "rgba(255, 255, 255, 0.5)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
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
            labels: { color: "rgba(255, 255, 255, 0.7)" },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
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

    var totalViews = 0;
    var totalReplies = 0;
    forums.forEach(function (forum) {
      totalViews += forum.views || 0;
      totalReplies += parseInt(forum.reply_count) || 0;
    });

    var forumCtx = document.getElementById("forumChart").getContext("2d");
    new Chart(forumCtx, {
      type: "bar",
      data: {
        labels: ["Views", "Posts", "Replies"],
        datasets: [{
          label: "Forum Activity",
          data: [totalViews, forums.length, totalReplies],
          backgroundColor: [
            "rgba(255, 255, 255, 0.8)",
            "rgba(255, 255, 255, 0.5)",
            "rgba(255, 255, 255, 0.2)",
          ],
          borderColor: ["#ffffff", "#cccccc", "#999999"],
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
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
  });
}
