document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("quiz-container");
  const quizData = JSON.parse(localStorage.getItem("currentQuiz"));

  if (!quizData || !quizData.questions.length) {
    container.innerHTML = "<p>No quiz data found.</p>";
    return;
  }

  let currentIndex = 0; // index of first question on page
  let score = 0;
  const pageSize = 2; // number of questions per page
  const userAnswers = {}; // track answers by question id

  function renderQuestions() {
    container.innerHTML = "";

    const endIndex = Math.min(
      currentIndex + pageSize,
      quizData.questions.length
    );
    const title = document.createElement("h3");
    title.textContent = `Questions ${currentIndex + 1} – ${endIndex}`;
    container.appendChild(title);

    for (let i = currentIndex; i < endIndex; i++) {
      const q = quizData.questions[i];
      const card = document.createElement("div");
      card.classList.add("question-card");

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
                  userAnswers[q.id] === ans ? "selected" : ""
                }">${ans}</button>
              </li>`
            )
            .join("")}
        </ul>
      `;

      // Add event listeners for answers
      card.querySelectorAll(".answer-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          userAnswers[q.id] = btn.textContent;

          // reset styles in this question
          card
            .querySelectorAll(".answer-btn")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
      });

      container.appendChild(card);
    }

    // Navigation buttons
    const nav = document.createElement("div");
    nav.classList.add("quiz-nav");

    if (currentIndex > 0) {
      const backBtn = document.createElement("button");
      backBtn.textContent = "Back";
      backBtn.classList.add("btn-secondary");
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

  function renderResult() {
    score = 0;
    quizData.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correct) score++;
    });

    container.innerHTML = `
      <div class="question-card">
        <h2>Quiz Completed!</h2>
        <p>Your score: ${score} / ${quizData.questions.length}</p>
        <button class="btn-primary" onclick="window.location.href='quiz-set.html?subjectId=${
          quizData.subjectId
        }&subjectName=${encodeURIComponent(
      quizData.subjectName
    )}'">Back to Quizzes</button>
      </div>
    `;
  }

  renderQuestions();
});
