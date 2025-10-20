document.addEventListener("DOMContentLoaded", () => {
  const flashcardData = JSON.parse(localStorage.getItem("currentFlashcards"));

  if (!flashcardData || !flashcardData.cards.length) {
    const content = document.getElementById("content");
    content.innerHTML = "<p>No flashcard data found.</p>";
    return;
  }

  class FlashcardCarousel {
    constructor(data) {
      this.data = data;
      this.currentIndex = 0;
      this.flippedStates = new Array(data.cards.length).fill(false);

      this.carouselTrack = document.getElementById("carousel-track");
      this.prevBtn = document.getElementById("prev-btn");
      this.nextBtn = document.getElementById("next-btn");
      this.flipBtn = document.getElementById("flip-btn");
      this.progressFill = document.getElementById("progress-fill");
      this.progressText = document.getElementById("progress-text");
      this.flashcardTitle = document.getElementById("flashcard-title");

      this.init();
    }

    init() {
      this.flashcardTitle.textContent = `Studying: ${this.data.subjectName}`;
      this.createCards();
      this.updateCarousel();
      this.bindEvents();
    }

    createCards() {
      this.carouselTrack.innerHTML = "";

      this.data.cards.forEach((card, index) => {
        const flashcardItem = document.createElement("div");
        flashcardItem.className = "flashcard-item";
        flashcardItem.innerHTML = `
                    <div class="flashcard-card">
                        <div class="flashcard-front">
                            <div class="flashcard-content">${card.question}</div>
                        </div>
                        <div class="flashcard-back">
                            <div class="flashcard-content">${card.answer}</div>
                        </div>
                    </div>
                `;
        this.carouselTrack.appendChild(flashcardItem);
      });
    }

    updateCarousel() {
      const cards = this.carouselTrack.children;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const flashcardCard = card.querySelector(".flashcard-card");

        // Update flip state
        if (this.flippedStates[i]) {
          flashcardCard.classList.add("flipped");
        } else {
          flashcardCard.classList.remove("flipped");
        }

        // Remove all position classes
        card.classList.remove("active", "prev", "next", "hidden");

        // Add appropriate position class
        const diff = i - this.currentIndex;

        if (diff === 0) {
          card.classList.add("active");
        } else if (diff === -1) {
          card.classList.add("prev");
        } else if (diff === 1) {
          card.classList.add("next");
        } else {
          card.classList.add("hidden");
        }
      }

      // Update progress
      const progress = ((this.currentIndex + 1) / this.data.cards.length) * 100;
      this.progressFill.style.width = `${progress}%`;
      this.progressText.textContent = `${this.currentIndex + 1}/${
        this.data.cards.length
      }`;

      // Update navigation buttons
      this.prevBtn.disabled = this.currentIndex === 0;
      this.nextBtn.disabled = this.currentIndex === this.data.cards.length - 1;
    }

    goToPrev() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.updateCarousel();
      }
    }

    goToNext() {
      if (this.currentIndex < this.data.cards.length - 1) {
        this.currentIndex++;
        this.updateCarousel();
      }
    }

    flipCurrentCard() {
      this.flippedStates[this.currentIndex] =
        !this.flippedStates[this.currentIndex];
      this.updateCarousel();
    }

    bindEvents() {
      this.prevBtn.addEventListener("click", () => this.goToPrev());
      this.nextBtn.addEventListener("click", () => this.goToNext());
      this.flipBtn.addEventListener("click", () => this.flipCurrentCard());

      // Keyboard navigation
      document.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "ArrowLeft":
            this.goToPrev();
            break;
          case "ArrowRight":
            this.goToNext();
            break;
          case " ":
          case "Enter":
            this.flipCurrentCard();
            e.preventDefault();
            break;
        }
      });

      // Click on active card to flip
      this.carouselTrack.addEventListener("click", (e) => {
        const activeCard = e.target.closest(".flashcard-item.active");
        if (activeCard) {
          this.flipCurrentCard();
        }
      });

      // Click on prev/next cards to navigate
      this.carouselTrack.addEventListener("click", (e) => {
        const prevCard = e.target.closest(".flashcard-item.prev");
        const nextCard = e.target.closest(".flashcard-item.next");

        if (prevCard) {
          this.goToPrev();
        } else if (nextCard) {
          this.goToNext();
        }
      });
    }
  }

  // Initialize the carousel
  new FlashcardCarousel(flashcardData);
});
