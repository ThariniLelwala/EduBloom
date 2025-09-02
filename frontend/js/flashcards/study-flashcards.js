document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("flashcard-container");
  const flashcardElement = document.getElementById("flashcard");
  const questionElement = document.getElementById("flashcard-question");
  const answerElement = document.getElementById("flashcard-answer");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const flipBtn = document.getElementById("flip-btn");
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  const flashcardTitle = document.getElementById("flashcard-title");

  const flashcardData = JSON.parse(localStorage.getItem("currentFlashcards"));

  if (!flashcardData || !flashcardData.cards.length) {
    container.innerHTML = "<p>No flashcard data found.</p>";
    return;
  }

  flashcardTitle.textContent = `Studying: ${flashcardData.subjectName}`;

  let currentIndex = 0;
  let isFlipped = false;

  function renderCard() {
    const card = flashcardData.cards[currentIndex];
    questionElement.textContent = card.question;
    answerElement.textContent = card.answer;

    // Reset flip state
    isFlipped = false;
    flashcardElement.classList.remove("flipped");

    // Update progress
    const progress = ((currentIndex + 1) / flashcardData.cards.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${currentIndex + 1}/${
      flashcardData.cards.length
    }`;

    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === flashcardData.cards.length - 1;
  }

  flipBtn.addEventListener("click", () => {
    isFlipped = !isFlipped;
    flashcardElement.classList.toggle("flipped", isFlipped);
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderCard();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < flashcardData.cards.length - 1) {
      currentIndex++;
      renderCard();
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevBtn.click();
    } else if (e.key === "ArrowRight") {
      nextBtn.click();
    } else if (e.key === " " || e.key === "Enter") {
      flipBtn.click();
      e.preventDefault(); // Prevent space from scrolling page
    }
  });

  // Click on card to flip
  flashcardElement.addEventListener("click", (e) => {
    if (!e.target.closest(".flashcard-controls")) {
      flipBtn.click();
    }
  });

  renderCard();
});
