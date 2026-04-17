document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("quiz-container");
  const quizData = JSON.parse(localStorage.getItem("currentQuiz"));

  if (!quizData || !quizData.questions.length) {
    container.innerHTML = "<p>No quiz data found.</p>";
    return;
  }

  let currentIndex = 0;
  let score = 0;
  const pageSize = 2;
  const userAnswers = {};
  let quizStartTime = null;
  let submittedAttemptId = null;

  function getKey(q) {
    const quizId = q.quizId || quizData.id;
    return `${quizId}-${q.id}`;
  }

  function getUniqueQuizSetIds() {
    const uniqueIds = new Set();
    quizData.questions.forEach(q => {
      if (q.quizId) {
        uniqueIds.add(q.quizId);
      }
    });
    return Array.from(uniqueIds);
  }

  async function submitQuizResult(finalScore) {
    const quizSetIds = getUniqueQuizSetIds();
    
    try {
      const result = await studentQuizApi.submitAttempt(
        quizSetIds,
        quizData.questions.length,
        finalScore,
        userAnswers,
        quizStartTime
      );
      submittedAttemptId = result.id;
      return result;
    } catch (error) {
      console.error("Failed to submit quiz result:", error);
      return null;
    }
  }

  function renderQuestions() {
    if (!quizStartTime) {
      quizStartTime = new Date().toISOString();
    }

    container.innerHTML = "";

    const endIndex = Math.min(
      currentIndex + pageSize,
      quizData.questions.length
    );
    document.getElementById("quiz-title").textContent = `Questions ${
      currentIndex + 1
    } – ${endIndex}`;

    for (let i = currentIndex; i < endIndex; i++) {
      const q = quizData.questions[i];
      const card = document.createElement("div");
      card.classList.add("question-card");

      const qKey = getKey(q);

      card.innerHTML = `
        <div class="question-header">
          <div class="question-text">${i + 1}. ${q.question}</div>
        </div>
        <ul class="answers">
          ${q.answers
            .map(
              (ans) => `
              <li>
                <button class="answer-btn ${
                  userAnswers[qKey] === ans ? "selected" : ""
                }">${ans}</button>
              </li>`
            )
            .join("")}
        </ul>
      `;

      card.querySelectorAll(".answer-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          userAnswers[qKey] = btn.textContent;

          card
            .querySelectorAll(".answer-btn")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
      });

      container.appendChild(card);
    }

    const nav = document.createElement("div");
    nav.classList.add("quiz-nav");

    if (currentIndex > 0) {
      const backBtn = document.createElement("button");
      backBtn.textContent = "Back";
      backBtn.classList.add("btn-secondary", "cancel-btn");
      backBtn.addEventListener("click", () => {
        currentIndex -= pageSize;
        renderQuestions();
      });
      nav.appendChild(backBtn);
    }

    if (endIndex < quizData.questions.length) {
      const nextBtn = document.createElement("button");
      nextBtn.textContent = "Next";
      nextBtn.classList.add("btn-primary");
      nextBtn.addEventListener("click", () => {
        currentIndex += pageSize;
        renderQuestions();
      });
      nav.appendChild(nextBtn);
    } else {
      const finishBtn = document.createElement("button");
      finishBtn.textContent = "Finish Quiz";
      finishBtn.classList.add("btn-primary");
      finishBtn.addEventListener("click", renderResult);
      nav.appendChild(finishBtn);
    }

    container.appendChild(nav);
  }

  async function renderResult() {
    score = 0;
    quizData.questions.forEach((q) => {
      const qKey = getKey(q);
      if (userAnswers[qKey] === q.correct) score++;
    });

    const percentage = quizData.questions.length > 0 
      ? Math.round((score / quizData.questions.length) * 100) 
      : 0;

    await submitQuizResult(score);

    container.innerHTML = `
      <div class="question-card">
        <h2>Quiz Completed!</h2>
        <div class="result-score">
          <div class="score-circle ${percentage >= 70 ? 'good' : percentage >= 50 ? 'ok' : 'low'}">
            <span class="score-number">${percentage}%</span>
          </div>
        </div>
        <p class="score-detail">Your score: ${score} / ${quizData.questions.length}</p>
        <div class="result-message">
          ${percentage >= 70 
            ? "<p>Great job! You passed!</p>" 
            : percentage >= 50 
            ? "<p>Good effort! Keep practicing!</p>" 
            : "<p>Keep studying! You'll improve!</p>"}
        </div>
        <div class="result-actions">
          <button class="btn-primary" onclick="window.location.href='quiz-set.html?subjectId=${
            quizData.subjectId || ""
          }&subjectName=${encodeURIComponent(
      quizData.subjectName || "Quizzes"
    )}'">Back to Quizzes</button>
        </div>
      </div>
    `;

    localStorage.removeItem("currentQuiz");
  }

  renderQuestions();
});
