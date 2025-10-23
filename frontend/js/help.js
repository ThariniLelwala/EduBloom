console.log("Help JS loaded!");

// FAQ toggle
function initFaqToggle() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const answer = btn.nextElementSibling;
      answer.style.display =
        answer.style.display === "block" ? "none" : "block";
    });
  });
}

initFaqToggle();

// Optional: FAQ search
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    const searchText = this.value.toLowerCase();
    document.querySelectorAll(".faq-item").forEach((item) => {
      const question = item.querySelector(".faq-question").textContent.toLowerCase();
      item.style.display = question.includes(searchText) ? "block" : "none";
    });
  });
}

// Optional: Add FAQ dynamically
const addBtn = document.getElementById("addFaqBtn");
if (addBtn) {
  addBtn.addEventListener("click", () => {
    const questionInput = document.getElementById("newQuestion");
    const answerInput = document.getElementById("newAnswer");
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();
    if (!question || !answer) return alert("Please enter both question and answer.");

    const faqList = document.getElementById("faqList");
    const faqItem = document.createElement("div");
    faqItem.className = "faq-item";

    const qBtn = document.createElement("button");
    qBtn.className = "faq-question";
    qBtn.textContent = question;

    const aDiv = document.createElement("div");
    aDiv.className = "faq-answer";
    aDiv.style.display = "none";
    aDiv.innerHTML = `<p>${answer}</p>`;

    faqItem.appendChild(qBtn);
    faqItem.appendChild(aDiv);
    faqList.appendChild(faqItem);

    questionInput.value = "";
    answerInput.value = "";

    initFaqToggle();
  });
}
