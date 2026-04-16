// Resources Page JavaScript

let forumsData = [];
let notesData = [];
let quizzesData = [];
let teachersData = [];

document.addEventListener("DOMContentLoaded", function () {
  initializeResources();
});

async function initializeResources() {
  checkAuth();
  await Promise.all([
    loadForums(),
    loadNotes(),
    loadQuizzes(),
    loadTeachers()
  ]);
  setupNavigation();
  setupClickHandlers();
}

function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "../../login.html";
    return false;
  }
  return true;
}

// ========== DATA LOADING ==========

async function loadForums() {
  try {
    forumsData = await teacherResourcesApi.getAllPublishedForums();
    updateForumsDisplay();
  } catch (err) {
    console.error("Error loading forums:", err);
    document.getElementById("active-forums").textContent = "0";
  }
}

async function loadNotes() {
  try {
    notesData = await teacherResourcesApi.getAllPublicNotes();
    updateNotesDisplay();
  } catch (err) {
    console.error("Error loading notes:", err);
    document.getElementById("notes-count").textContent = "0";
  }
}

async function loadQuizzes() {
  try {
    quizzesData = await teacherResourcesApi.getAllPublishedQuizzes();
    updateQuizzesDisplay();
  } catch (err) {
    console.error("Error loading quizzes:", err);
    document.getElementById("quiz-count").textContent = "0";
  }
}

async function loadTeachers() {
  try {
    teachersData = await teacherResourcesApi.getAllTeachers();
    updateTeachersDisplay();
  } catch (err) {
    console.error("Error loading teachers:", err);
    document.getElementById("teachers-count").textContent = "0";
  }
}

// ========== DISPLAY UPDATES ==========

function updateForumsDisplay() {
  document.getElementById("active-forums").textContent = forumsData.length;

  const container = document.getElementById("forum-topics");
  container.innerHTML = "";

  const displayForums = forumsData.slice(0, 5);
  displayForums.forEach(forum => {
    const div = document.createElement("div");
    div.className = "forum-topic";
    div.dataset.forumId = forum.id;
    div.innerHTML = `
      <span class="topic-title">${forum.title}</span>
      <span class="topic-replies">${forum.reply_count || 0} replies</span>
    `;
    container.appendChild(div);
  });
}

function updateNotesDisplay() {
  document.getElementById("notes-count").textContent = notesData.length;

  const container = document.getElementById("notes-subjects");
  container.innerHTML = "";

  const subjectCounts = {};
  notesData.forEach(note => {
    const subject = note.subject_name || "Other";
    subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
  });

  Object.entries(subjectCounts).forEach(([subject, count]) => {
    const div = document.createElement("div");
    div.className = "subject-note";
    div.dataset.subjectName = subject;
    div.innerHTML = `
      <span class="subject-name">${subject}</span>
      <span class="note-count">${count} notes</span>
    `;
    container.appendChild(div);
  });
}

function updateQuizzesDisplay() {
  document.getElementById("quiz-count").textContent = quizzesData.length;

  const container = document.getElementById("quiz-subjects");
  container.innerHTML = "";

  const subjectCounts = {};
  quizzesData.forEach(quiz => {
    const subject = quiz.subject_name || "Other";
    subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
  });

  Object.entries(subjectCounts).forEach(([subject, count]) => {
    const div = document.createElement("div");
    div.className = "subject-quiz";
    div.dataset.subjectName = subject;
    div.innerHTML = `
      <span class="subject-name">${subject}</span>
      <span class="quiz-count">${count} quizzes</span>
    `;
    container.appendChild(div);
  });
}

function updateTeachersDisplay() {
  document.getElementById("teachers-count").textContent = teachersData.length;

  const container = document.getElementById("teachers-list");
  container.innerHTML = "";

  const displayTeachers = teachersData.slice(0, 5);
  displayTeachers.forEach(teacher => {
    const mainSubject = teacher.subjects && teacher.subjects.length > 0 
      ? teacher.subjects[0].subject_name 
      : "General";
    
    const div = document.createElement("div");
    div.className = "teacher-item";
    div.dataset.teacherId = teacher.teacher_id;
    div.innerHTML = `
      <div class="teacher-info">
        <span class="teacher-name">${teacher.teacher_name}</span>
        <span class="teacher-subject">${mainSubject}</span>
      </div>
      <div class="teacher-views">
        <i class="fas fa-eye"></i>
        <span>New</span>
      </div>
    `;
    container.appendChild(div);
  });
}

// ========== NAVIGATION ==========

function setupNavigation() {
  window.openForums = function () {
    window.location.href = "resource-forums.html";
  };

  window.openTeacherNotes = function () {
    showResourceModal("notes");
  };

  window.openTeacherQuizzes = function () {
    showResourceModal("quizzes");
  };

  window.viewAllTeachers = function () {
    window.location.href = "view-teachers.html";
  };
}

function setupClickHandlers() {
  document.addEventListener("click", function (e) {
    if (e.target.closest(".forum-topic")) {
      const topic = e.target.closest(".forum-topic");
      const forumId = topic.dataset.forumId;
      openForumDetail(forumId);
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".subject-note")) {
      const subject = e.target.closest(".subject-note");
      const subjectName = subject.dataset.subjectName;
      showResourceModal("notes", subjectName);
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".subject-quiz")) {
      const subject = e.target.closest(".subject-quiz");
      const subjectName = subject.dataset.subjectName;
      showResourceModal("quizzes", subjectName);
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest(".teacher-item")) {
      const teacher = e.target.closest(".teacher-item");
      const teacherId = teacher.dataset.teacherId;
      window.location.href = `view-teachers.html?teacherId=${teacherId}`;
    }
  });
}

// ========== MODALS ==========

function showResourceModal(type, filterSubject = null) {
  const existingModal = document.getElementById("resource-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "resource-modal";
  modal.className = "modal";
  modal.style.display = "flex";

  let title = "";
  let items = [];

  if (type === "notes") {
    title = filterSubject ? `Notes: ${filterSubject}` : "Teacher Notes";
    items = filterSubject 
      ? notesData.filter(n => n.subject_name === filterSubject)
      : notesData;
  } else if (type === "quizzes") {
    title = filterSubject ? `Quizzes: ${filterSubject}` : "Teacher Quizzes";
    items = filterSubject 
      ? quizzesData.filter(q => q.subject_name === filterSubject)
      : quizzesData;
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px; max-height: 80vh;">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close" onclick="closeModal('resource-modal')">&times;</button>
      </div>
      <div class="modal-body" style="overflow-y: auto;">
        <div class="resource-list">
          ${items.length === 0 ? `<p style="text-align: center; padding: 20px;">No ${type} available</p>` : ""}
          ${items.map(item => createResourceItemHTML(item, type)).join("")}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function createResourceItemHTML(item, type) {
  if (type === "notes") {
    const driveLink = item.google_drive_file_id 
      ? `https://drive.google.com/file/d/${item.google_drive_file_id}/view`
      : item.file_url || "#";
    const views = item.views || 0;
    
    return `
      <div class="resource-item" data-id="${item.id}">
        <div class="resource-info">
          <h4>${item.title}</h4>
          <p>${item.subject_name} - ${item.topic_name || "General"}</p>
          <p style="font-size: 0.85em; opacity: 0.7;">By ${item.teacher_name}</p>
        </div>
        <div class="resource-views">
          <i class="fas fa-eye"></i> ${views} views
        </div>
        <a href="${driveLink}" target="_blank" class="btn-primary" style="padding: 8px 16px; text-decoration: none; display: inline-block;">
          <i class="fas fa-external-link-alt"></i> Open
        </a>
      </div>
    `;
  } else if (type === "quizzes") {
    const views = item.views || 0;
    return `
      <div class="resource-item" data-id="${item.id}">
        <div class="resource-info">
          <h4>${item.name}</h4>
          <p>${item.subject_name}</p>
          <p style="font-size: 0.85em; opacity: 0.7;">By ${item.teacher_name} - ${item.question_count || 0} questions</p>
        </div>
        <div class="resource-views">
          <i class="fas fa-eye"></i> ${views} views
        </div>
        <button class="btn-primary" onclick="takeQuiz(${item.id}, '${encodeURIComponent(item.name)}', '${encodeURIComponent(item.subject_name)}')">
          <i class="fas fa-play"></i> Take Quiz
        </button>
      </div>
    `;
  }
  return "";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

async function openForumDetail(forumId) {
  const forum = forumsData.find(f => f.id === parseInt(forumId));
  if (!forum) return;

  // Increment view count
  try {
    await teacherResourcesApi.incrementView("forums", forumId);
  } catch (err) {
    console.error("Error incrementing view count:", err);
  }

  const existingModal = document.getElementById("forum-detail-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "forum-detail-modal";
  modal.className = "modal";
  modal.style.display = "flex";

  const tags = forum.tags && Array.isArray(forum.tags) 
    ? forum.tags.map(tag => `<span class="tag">${tag}</span>`).join("")
    : "";

  const views = forum.views || 0;

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${forum.title}</h2>
        <button class="modal-close" onclick="closeModal('forum-detail-modal')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="forum-meta">
          <span>by ${forum.author}</span>
          <span>${new Date(forum.created_at).toLocaleDateString()}</span>
          <span><i class="fas fa-eye"></i> ${views} views</span>
          <div class="tags-display">${tags}</div>
        </div>
        <div class="forum-description">
          ${forum.description}
        </div>
        <div style="margin-top: 15px;">
          <button class="btn-primary" onclick="joinForumDiscussion(${forum.id})">
            <i class="fas fa-comments"></i> Join Discussion
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function joinForumDiscussion(forumId) {
  window.location.href = `resource-forums.html?forumId=${forumId}`;
}

window.takeQuiz = async function(quizSetId, quizName, subjectName) {
  try {
    // Increment view count
    await teacherResourcesApi.incrementView("quizzes", quizSetId);
    
    const quizData = await teacherResourcesApi.getPublishedQuizSet(quizSetId);
    
    if (!quizData.questions || quizData.questions.length === 0) {
      showNotification("This quiz has no questions yet", "error");
      return;
    }

    const formattedQuestions = quizData.questions.map(q => {
      const correctAnswer = q.answers.find(a => a.is_correct);
      return {
        id: q.id,
        question: q.question_text,
        answers: q.answers.map(a => a.answer_text),
        correct: correctAnswer ? correctAnswer.answer_text : null,
        quizId: quizSetId,
      };
    });

    localStorage.setItem("currentQuiz", JSON.stringify({
      subjectId: quizData.subject_id,
      subjectName: decodeURIComponent(subjectName),
      questions: formattedQuestions,
    }));

    window.location.href = `quiz/take-quiz.html?quizSetId=${quizSetId}&subjectName=${subjectName}`;
  } catch (err) {
    showNotification("Error loading quiz: " + err.message, "error");
  }
};

// ========== NOTIFICATIONS ==========

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "error" ? "rgba(239, 68, 68, 0.9)" : type === "success" ? "rgba(74, 222, 128, 0.9)" : "rgba(59, 130, 246, 0.9)"};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  .resource-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    margin-bottom: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }
  .resource-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .resource-info {
    flex: 1;
  }
  .resource-info h4 {
    margin: 0 0 5px 0;
    font-size: 1em;
  }
  .resource-info p {
    margin: 0;
    font-size: 0.85em;
    opacity: 0.8;
  }
  .resource-views {
    margin: 0 15px;
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.7);
  }
  .teacher-views {
    margin: 0 15px;
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.7);
  }
  .resource-list {
    padding: 10px;
  }
`;
document.head.appendChild(style);
