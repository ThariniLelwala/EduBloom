document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("attempts-container");
  const noResults = document.getElementById("no-results");
  const detailModal = document.getElementById("detail-modal");
  const detailClose = document.getElementById("detail-close");
  
  const quizFilter = document.getElementById("quiz-filter");
  const dateFrom = document.getElementById("date-from");
  const dateTo = document.getElementById("date-to");
  const clearFiltersBtn = document.getElementById("clear-filters");
  const scoreFilterBtns = document.querySelectorAll(".filter-btn");

  let allAttempts = [];
  let allQuizNames = new Set();
  let currentFilters = {
    quizName: "",
    minScore: 0,
    dateFrom: null,
    dateTo: null
  };

  function checkAuth() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login.html";
      return false;
    }
    return true;
  }

  async function loadAttempts() {
    try {
      if (!checkAuth()) return;

      const attempts = await studentQuizApi.getAttempts(100);
      allAttempts = attempts;
      
      allQuizNames.clear();
      attempts.forEach(attempt => {
        if (attempt.quiz_names) {
          attempt.quiz_names.forEach(name => allQuizNames.add(name));
        }
      });

      populateQuizFilter();
      applyFilters();
    } catch (error) {
      console.error("Error loading quiz attempts:", error);
      if (error.message.includes("does not exist")) {
        alert("Database table not found. Please contact administrator.");
      } else {
        alert("Failed to load quiz attempts: " + error.message);
      }
    }
  }

  function populateQuizFilter() {
    quizFilter.innerHTML = '<option value="">All Quizzes</option>';
    Array.from(allQuizNames).sort().forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      quizFilter.appendChild(option);
    });
    
    if (window.initCustomSelects) {
      window.initCustomSelects();
    }
  }

  function applyFilters() {
    let filtered = [...allAttempts];

    if (currentFilters.quizName) {
      filtered = filtered.filter(attempt => 
        attempt.quiz_names && attempt.quiz_names.includes(currentFilters.quizName)
      );
    }

    if (currentFilters.minScore > 0) {
      filtered = filtered.filter(attempt => 
        parseFloat(attempt.score_percentage) >= currentFilters.minScore
      );
    }

    if (currentFilters.dateFrom) {
      const fromDate = new Date(currentFilters.dateFrom);
      filtered = filtered.filter(attempt => {
        const attemptDate = new Date(attempt.created_at);
        return attemptDate >= fromDate;
      });
    }

    if (currentFilters.dateTo) {
      const toDate = new Date(currentFilters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(attempt => {
        const attemptDate = new Date(attempt.created_at);
        return attemptDate <= toDate;
      });
    }

    renderAttempts(filtered);
  }

  function renderAttempts(attempts) {
    container.innerHTML = "";

    if (attempts.length === 0) {
      noResults.style.display = "flex";
      return;
    }

    noResults.style.display = "none";

    attempts.forEach(attempt => {
      const card = createAttemptCard(attempt);
      container.appendChild(card);
    });
  }

  function createAttemptCard(attempt) {
    const card = document.createElement("div");
    card.classList.add("attempt-card");

    const percentage = parseFloat(attempt.score_percentage) || 0;
    const scoreClass = percentage >= 70 ? "good" : percentage >= 50 ? "ok" : "low";
    const date = new Date(attempt.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    const time = new Date(attempt.created_at).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const quizName = attempt.quiz_names?.join(", ") || "Quiz";

    card.innerHTML = `
      <div class="attempt-score ${scoreClass}">
        <span class="score-value">${percentage}%</span>
      </div>
      <div class="attempt-info">
        <div class="attempt-quiz">${quizName}</div>
        <div class="attempt-meta">
          <span class="correct-count">${attempt.correct_answers}/${attempt.total_questions} correct</span>
          <span class="attempt-date">${date} at ${time}</span>
        </div>
      </div>
      <button class="view-detail-btn">
        <i class="fas fa-eye"></i> View Details
      </button>
    `;

    card.querySelector(".view-detail-btn").addEventListener("click", () => {
      showDetail(attempt.id);
    });

    return card;
  }

  async function showDetail(attemptId) {
    try {
      const attempt = await studentQuizApi.getAttempt(attemptId);
      renderDetailModal(attempt);
      detailModal.style.display = "flex";
    } catch (error) {
      console.error("Error loading attempt details:", error);
      alert("Failed to load attempt details: " + error.message);
    }
  }

  function renderDetailModal(attempt) {
    const percentage = parseFloat(attempt.score_percentage) || 0;
    
    document.getElementById("detail-title").textContent = 
      `Attempt Detail - ${attempt.quiz_names?.join(", ") || "Quiz"}`;
    document.getElementById("detail-score").textContent = `${percentage}%`;
    document.getElementById("detail-score").className = `stat-value score-${percentage >= 70 ? "good" : percentage >= 50 ? "ok" : "low"}`;
    document.getElementById("detail-correct").textContent = 
      `${attempt.correct_answers}/${attempt.total_questions}`;
    document.getElementById("detail-date").textContent = new Date(attempt.created_at).toLocaleString();

    const questionsContainer = document.getElementById("questions-container");
    questionsContainer.innerHTML = "";

    let answers = attempt.answers;
    if (typeof answers === "string") {
      try {
        answers = JSON.parse(answers);
      } catch (e) {
        answers = [];
      }
    }
    
    if (!Array.isArray(answers)) {
      answers = [];
    }
    
    answers.forEach((answer, index) => {
      const questionEl = document.createElement("div");
      questionEl.classList.add("question-result");
      
      const isCorrect = answer.is_correct;
      const icon = isCorrect ? '<i class="fas fa-check-circle correct"></i>' : '<i class="fas fa-times-circle incorrect"></i>';
      
      questionEl.innerHTML = `
        <div class="question-header">
          <span class="question-number">Q${index + 1}</span>
          <span class="question-status">${icon}</span>
        </div>
        <div class="question-text">${answer.question || "Question"}</div>
        <div class="answer-row">
          <span class="answer-label">Your answer:</span>
          <span class="answer-value ${isCorrect ? "correct" : "incorrect"}">${answer.user_answer || "No answer"}</span>
        </div>
        ${!isCorrect ? `
          <div class="answer-row">
            <span class="answer-label">Correct answer:</span>
            <span class="answer-value correct">${answer.correct_answer || "N/A"}</span>
          </div>
        ` : ""}
      `;
      
      questionsContainer.appendChild(questionEl);
    });
  }

  quizFilter.addEventListener("change", (e) => {
    currentFilters.quizName = e.target.value;
    applyFilters();
  });

  scoreFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      scoreFilterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const score = btn.dataset.score;
      currentFilters.minScore = score ? parseInt(score) : 0;
      applyFilters();
    });
  });

  dateFrom.addEventListener("change", (e) => {
    currentFilters.dateFrom = e.target.value || null;
    applyFilters();
  });

  dateTo.addEventListener("change", (e) => {
    currentFilters.dateTo = e.target.value || null;
    applyFilters();
  });

  clearFiltersBtn.addEventListener("click", () => {
    currentFilters = {
      quizName: "",
      minScore: 0,
      dateFrom: null,
      dateTo: null
    };
    quizFilter.value = "";
    dateFrom.value = "";
    dateTo.value = "";
    scoreFilterBtns.forEach(b => b.classList.remove("active"));
    scoreFilterBtns[0].classList.add("active");
    applyFilters();
  });

  detailClose.addEventListener("click", () => {
    detailModal.style.display = "none";
  });

  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) {
      detailModal.style.display = "none";
    }
  });

  loadAttempts();
});