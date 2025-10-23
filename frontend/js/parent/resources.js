// Parent Resource Recommendation System

document.addEventListener("DOMContentLoaded", function () {
  initializeParentResources();
});

// Sample resource data from teachers
const resourceData = {
  forums: [
    {
      id: "forum-1",
      title: "Math Homework Help",
      description: "General mathematics discussion and homework assistance",
      replies: 12,
      content: `
Welcome to Math Homework Help! This forum is dedicated to helping students understand and solve mathematical problems.

RECENT DISCUSSION THREADS:

1. "Quadratic Equations - Need Help with Word Problems"
   Posted by: Ms. Sarah Johnson
   Started: 2 days ago
   Replies: 8
   Latest: "Try to identify what you're solving for first..."

2. "Geometry Proofs - Step by Step Guide"
   Posted by: Mr. David Chen
   Started: 1 week ago
   Replies: 15
   Latest: "Don't forget to include all the axioms..."

3. "Calculus Derivatives - Chain Rule Confusion"
   Posted by: Emma Thompson
   Started: 3 days ago
   Replies: 5
   Latest: "The chain rule helps us differentiate composite functions..."

FORUM RULES:
- Be respectful to all members
- Show your work when asking for help
- Use clear formatting for readability
- No copying homework directly
      `,
    },
    {
      id: "forum-2",
      title: "Science Project Ideas",
      description: "Science project discussions and ideas",
      replies: 8,
    },
    {
      id: "forum-3",
      title: "English Literature Discussion",
      description: "Literature analysis and book discussions",
      replies: 15,
    },
    {
      id: "forum-4",
      title: "Coding Club",
      description: "Programming and coding projects",
      replies: 20,
    },
    {
      id: "forum-5",
      title: "History Discussion",
      description: "Historical events and research",
      replies: 10,
    },
  ],
  notes: [
    {
      id: "notes-1",
      title: "Algebra Chapter 3",
      subject: "Mathematics",
      teacher: "Dr. Sarah Johnson",
      pages: 8,
    },
    {
      id: "notes-2",
      title: "Physics Fundamentals",
      subject: "Science",
      teacher: "Prof. Michael Chen",
      pages: 12,
    },
    {
      id: "notes-3",
      title: "Shakespeare's Works",
      subject: "English",
      teacher: "Ms. Emily Davis",
      pages: 10,
    },
    {
      id: "notes-4",
      title: "Biology Basics",
      subject: "Science",
      teacher: "Prof. Michael Chen",
      pages: 15,
    },
    {
      id: "notes-5",
      title: "Calculus Foundations",
      subject: "Mathematics",
      teacher: "Dr. Sarah Johnson",
      pages: 20,
    },
  ],
  quizzes: [
    {
      id: "quiz-1",
      title: "Algebra Quiz 1",
      subject: "Mathematics",
      difficulty: "Medium",
      questions: 20,
    },
    {
      id: "quiz-2",
      title: "Physics Quiz",
      subject: "Science",
      difficulty: "Hard",
      questions: 15,
    },
    {
      id: "quiz-3",
      title: "English Comprehension",
      subject: "English",
      difficulty: "Medium",
      questions: 25,
    },
    {
      id: "quiz-4",
      title: "Advanced Math Challenge",
      subject: "Mathematics",
      difficulty: "Hard",
      questions: 30,
    },
    {
      id: "quiz-5",
      title: "Chemistry Basics",
      subject: "Science",
      difficulty: "Medium",
      questions: 18,
    },
  ],
  teachers: [
    {
      id: "teacher-1",
      name: "Dr. Sarah Johnson",
      subject: "Mathematics",
      rating: 4.5,
      verified: true,
    },
    {
      id: "teacher-2",
      name: "Prof. Michael Chen",
      subject: "Science",
      rating: 4.7,
      verified: true,
    },
    {
      id: "teacher-3",
      name: "Ms. Emily Davis",
      subject: "English",
      rating: 4.3,
      verified: true,
    },
    {
      id: "teacher-4",
      name: "Mr. James Wilson",
      subject: "History",
      rating: 4.2,
      verified: false,
    },
    {
      id: "teacher-5",
      name: "Dr. Lisa Anderson",
      subject: "Art",
      rating: 3.8,
      verified: false,
    },
  ],
};

let parentRecommendations = {};

function initializeParentResources() {
  loadRecommendations();
  renderAllResources();
  updateStatistics();
}

// Load recommendations from localStorage
function loadRecommendations() {
  const saved = localStorage.getItem("parentResourceRecommendations");
  if (saved) {
    parentRecommendations = JSON.parse(saved);
  }
}

// Save recommendations to localStorage
function saveRecommendations() {
  localStorage.setItem(
    "parentResourceRecommendations",
    JSON.stringify(parentRecommendations)
  );
}

// Update statistics
function updateStatistics() {
  const recommendedCount = Object.values(parentRecommendations).filter(
    (v) => v === true
  ).length;

  document.getElementById("total-forums").textContent =
    resourceData.forums.length;
  document.getElementById("total-notes").textContent =
    resourceData.notes.length;
  document.getElementById("total-quizzes").textContent =
    resourceData.quizzes.length;
  document.getElementById("total-teachers").textContent =
    resourceData.teachers.length;
  document.getElementById("recommended-count").textContent = recommendedCount;
}

// Render all resources
function renderAllResources() {
  renderForums();
  renderNotes();
  renderQuizzes();
  renderTeachers();
  renderRecentRecommendations();
}

// Render forums
function renderForums() {
  const container = document.getElementById("forums-list");
  container.innerHTML = "";

  resourceData.forums.forEach((forum) => {
    const isRecommended = parentRecommendations[forum.id] === true;

    const item = document.createElement("div");
    item.className = "resource-item-parent";
    item.innerHTML = `
      <div class="resource-header">
        <div>
          <div class="resource-name">${forum.title}</div>
          <div class="resource-description">${forum.description}</div>
          ${
            isRecommended
              ? '<span class="recommendation-badge"><i class="fas fa-check-circle"></i> Recommended</span>'
              : ""
          }
        </div>
        <div style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.6);">
          ${forum.replies} replies
        </div>
      </div>
      <div class="resource-actions">
        <button class="btn-secondary" onclick="viewResource('forum-${
          forum.id
        }')">
          <i class="fas fa-eye"></i> View
        </button>
        ${
          isRecommended
            ? `<button class="btn-primary" onclick="toggleRecommendation('${forum.id}', false)"><i class="fas fa-times"></i> Unrecommend</button>`
            : `<button class="btn-primary" onclick="toggleRecommendation('${forum.id}', true)"><i class="fas fa-thumbs-up"></i> Recommend</button>`
        }
      </div>
    `;
    container.appendChild(item);
  });
}

// Render notes
function renderNotes() {
  const container = document.getElementById("notes-list");
  container.innerHTML = "";

  resourceData.notes.forEach((note) => {
    const isRecommended = parentRecommendations[note.id] === true;

    const item = document.createElement("div");
    item.className = "resource-item-parent";
    item.innerHTML = `
      <div class="resource-header">
        <div>
          <div class="resource-name">${note.title}</div>
          <div class="resource-description">${note.subject} by ${
      note.teacher
    }</div>
          ${
            isRecommended
              ? '<span class="recommendation-badge"><i class="fas fa-check-circle"></i> Recommended</span>'
              : ""
          }
        </div>
        <div style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.6);">
          ${note.pages} pages
        </div>
      </div>
      <div class="resource-actions">
        <button class="btn-secondary" onclick="viewResource('note-${note.id}')">
          <i class="fas fa-eye"></i> View
        </button>
        ${
          isRecommended
            ? `<button class="btn-primary" onclick="toggleRecommendation('${note.id}', false)"><i class="fas fa-times"></i> Unrecommend</button>`
            : `<button class="btn-primary" onclick="toggleRecommendation('${note.id}', true)"><i class="fas fa-thumbs-up"></i> Recommend</button>`
        }
      </div>
    `;
    container.appendChild(item);
  });
}

// Render quizzes
function renderQuizzes() {
  const container = document.getElementById("quizzes-list");
  container.innerHTML = "";

  resourceData.quizzes.forEach((quiz) => {
    const isRecommended = parentRecommendations[quiz.id] === true;

    const item = document.createElement("div");
    item.className = "resource-item-parent";
    item.innerHTML = `
      <div class="resource-header">
        <div>
          <div class="resource-name">${quiz.title}</div>
          <div class="resource-description">${quiz.subject} • ${
      quiz.difficulty
    }</div>
          ${
            isRecommended
              ? '<span class="recommendation-badge"><i class="fas fa-check-circle"></i> Recommended</span>'
              : ""
          }
        </div>
        <div style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.6);">
          ${quiz.questions} questions
        </div>
      </div>
      <div class="resource-actions">
        <button class="btn-secondary" onclick="viewResource('quiz-${quiz.id}')">
          <i class="fas fa-eye"></i> View
        </button>
        ${
          isRecommended
            ? `<button class="btn-primary" onclick="toggleRecommendation('${quiz.id}', false)"><i class="fas fa-times"></i> Unrecommend</button>`
            : `<button class="btn-primary" onclick="toggleRecommendation('${quiz.id}', true)"><i class="fas fa-thumbs-up"></i> Recommend</button>`
        }
      </div>
    `;
    container.appendChild(item);
  });
}

// Render teachers
function renderTeachers() {
  const container = document.getElementById("teachers-list");
  container.innerHTML = "";

  resourceData.teachers.forEach((teacher) => {
    const isRecommended = parentRecommendations[teacher.id] === true;

    const item = document.createElement("div");
    item.className = "resource-item-parent";
    item.innerHTML = `
      <div class="resource-header">
        <div>
          <div class="resource-name">${teacher.name}</div>
          <div class="resource-description">${teacher.subject} ${
      teacher.verified
        ? '<i class="fas fa-check-circle" style="color: #4caf50; font-size: 0.7rem;"></i>'
        : ""
    }</div>
          ${
            isRecommended
              ? '<span class="recommendation-badge"><i class="fas fa-check-circle"></i> Recommended</span>'
              : ""
          }
        </div>
        <div style="font-size: 0.85rem; color: #ffd700;">
          <i class="fas fa-star"></i> ${teacher.rating}
        </div>
      </div>
      <div class="resource-actions">
        <button class="btn-secondary" onclick="viewResource('teacher-${
          teacher.id
        }')">
          <i class="fas fa-eye"></i> View
        </button>
        ${
          isRecommended
            ? `<button class="btn-primary" onclick="toggleRecommendation('${teacher.id}', false)"><i class="fas fa-times"></i> Unrecommend</button>`
            : `<button class="btn-primary" onclick="toggleRecommendation('${teacher.id}', true)"><i class="fas fa-thumbs-up"></i> Recommend</button>`
        }
      </div>
    `;
    container.appendChild(item);
  });
}

// Render recent recommendations
function renderRecentRecommendations() {
  const container = document.getElementById("recent-recommendations");
  container.innerHTML = "";

  const allItems = Object.values(resourceData).flat();
  const recommended = Object.entries(parentRecommendations)
    .filter(([_, isRecommended]) => isRecommended === true)
    .reverse()
    .slice(0, 5)
    .map(([id, _]) => {
      const item = allItems.find((i) => i.id === id);
      return item;
    })
    .filter((item) => item);

  if (recommended.length === 0) {
    container.innerHTML =
      '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 20px;">No recommendations yet. Start by recommending resources to your child!</p>';
    return;
  }

  recommended.forEach((item) => {
    const title = item.title || item.name || "";
    const desc = item.description || item.subject || "";

    const activityItem = document.createElement("div");
    activityItem.className = "activity-item";
    activityItem.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${title}</span>
      <small>${desc}</small>
    `;
    container.appendChild(activityItem);
  });
}

// Toggle recommendation (global function for onclick)
window.toggleRecommendation = function (resourceId, recommend) {
  parentRecommendations[resourceId] = recommend;
  saveRecommendations();
  renderAllResources();
  updateStatistics();
  if (recommend) {
    showToast(`Resource recommended to your child!`);
  } else {
    showToast(`Recommendation removed`);
  }
};

// View resource (global function for onclick)
window.viewResource = function (resourceId) {
  if (resourceId.startsWith("forum-")) {
    openForumModal(resourceId);
  } else if (resourceId.startsWith("note-")) {
    openNotesModal(resourceId);
  } else if (resourceId.startsWith("quiz-")) {
    openQuizModal(resourceId);
  }
};

// Forum Modal Functions
function openForumModal(forumId) {
  const forum = resourceData.forums.find(
    (f) => f.id === forumId.replace("forum-", "")
  );
  if (forum) {
    document.getElementById("forum-title").textContent = forum.title;
    const contentElement = document.getElementById("forum-content");
    if (forum.content) {
      contentElement.textContent = forum.content;
    } else {
      contentElement.textContent =
        forum.description + "\n\nReplies: " + forum.replies;
    }
  }
  document.getElementById("forum-modal").classList.add("show");
}

function closeForum() {
  document.getElementById("forum-modal").classList.remove("show");
}

// Notes Modal Functions
function openNotesModal(noteId) {
  const note = resourceData.notes.find(
    (n) => n.id === noteId.replace("note-", "")
  );
  if (note) {
    document.getElementById("notes-title").textContent = note.title;
    document.getElementById("notes-content").textContent =
      "Subject: " +
      note.subject +
      "\nBy: " +
      note.teacher +
      "\nPages: " +
      note.pages +
      "\n\nDummy note content for demonstration purposes. This would contain the actual study material.";
  }
  document.getElementById("notes-modal").classList.add("show");
}

function closeNotes() {
  document.getElementById("notes-modal").classList.remove("show");
}

// Quiz Modal Functions
function openQuizModal(quizId) {
  const quiz = resourceData.quizzes.find(
    (q) => q.id === quizId.replace("quiz-", "")
  );
  if (quiz) {
    document.getElementById("quiz-title").textContent = quiz.title;
    document.getElementById("quiz-content").textContent =
      "Subject: " +
      quiz.subject +
      "\nDifficulty: " +
      quiz.difficulty +
      "\nQuestions: " +
      quiz.questions +
      "\n\nDummy quiz set for demonstration. This would contain the actual quiz questions and answers.";
  }
  document.getElementById("quiz-modal").classList.add("show");
}

function closeQuiz() {
  document.getElementById("quiz-modal").classList.remove("show");
}

// Show notification
function showToast(message) {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}
