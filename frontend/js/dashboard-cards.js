document.addEventListener("DOMContentLoaded", () => {
  // Redirect URLs (update these paths according to your project structure)
  const cardLinks = {
    "overview-card": "/teacher/overview.html",
    "forum-card": "/teacher/forum.html",
    "upload-card": "/teacher/upload.html",
    "quiz-card": "/teacher/quiz.html",
    "activity-card": "/teacher/activity.html"
  };

  Object.keys(cardLinks).forEach(cardId => {
    const card = document.getElementById(cardId);
    if (card) {
      card.style.cursor = "pointer"; // Make it obvious it's clickable
      card.addEventListener("click", () => {
        window.location.href = cardLinks[cardId]; // Open in same tab
        // OR open in new tab:
        // window.open(cardLinks[cardId], "_blank");
      });
    }
  });
});
