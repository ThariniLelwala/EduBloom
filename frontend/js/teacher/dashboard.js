// Teacher Dashboard JavaScript

document.addEventListener("DOMContentLoaded", function () {
  loadDashboardTasks();
  updateWelcomeMessage();
  loadOverviewStats();
});

// Update welcome message with teacher's name
function updateWelcomeMessage() {
  const username = localStorage.getItem("username");
  const welcomeHeading = document.getElementById("welcome-heading");
  if (username) {
    welcomeHeading.textContent = `Welcome ${username}`;
  }
}

// Task management functions (similar to student dashboard)
let currentType = "todo";
let editContext = { type: null, index: null };
let deleteContext = { type: null, index: null };

async function loadDashboardTasks() {
  try {
    // For now, use localStorage or default tasks
    let tasks = JSON.parse(localStorage.getItem("teacherTasks")) || {
      todo: [
        { task: "Create a new quiz for Mathematics", done: false },
        { task: "Upload study notes for Science", done: true },
      ],
    };
    localStorage.setItem("teacherTasks", JSON.stringify(tasks));
    renderDashboardTasks();
    bindDashboardEvents();
  } catch (err) {
    console.error("Error loading dashboard tasks:", err);
  }
}

function renderDashboardTasks() {
  const tasks = JSON.parse(localStorage.getItem("teacherTasks"))?.todo || [];
  const list = document.getElementById("dashboard-tasks-list");
  if (!list) return;

  list.innerHTML = "";

  if (tasks.length === 0) {
    list.innerHTML = `<li>No tasks for today 🎉</li>`;
    return;
  }

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";
    if (task.done) li.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.id = `dash-task-${index}`;
    checkbox.checked = !!task.done;

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = task.task;

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      li.classList.toggle("completed", checkbox.checked);
      saveTasks();
    });

    const actions = document.createElement("div");
    actions.className = "task-item-actions";

    const editBtn = document.createElement("i");
    editBtn.className = "fa fa-pencil";
    editBtn.title = "Edit";
    editBtn.addEventListener("click", () => openEditModal("todo", index));

    const deleteBtn = document.createElement("i");
    deleteBtn.className = "fa fa-trash";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", () => openDeleteModal("todo", index));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

function saveTasks() {
  const tasks = JSON.parse(localStorage.getItem("teacherTasks"));
  localStorage.setItem("teacherTasks", JSON.stringify(tasks));
}

function bindDashboardEvents() {
  const modal = document.getElementById("task-modal");
  const modalClose = document.getElementById("modal-close");
  const modalCancel = document.getElementById("modal-cancel");
  const modalSave = document.getElementById("modal-save");
  const modalInput = document.getElementById("task-input");
  const modalTitle = document.getElementById("modal-title");

  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");
  const editCancel = document.getElementById("edit-cancel");
  const editClose = document.getElementById("edit-modal-close");
  const editSave = document.getElementById("edit-save");

  const deleteModal = document.getElementById("delete-modal");
  const deleteConfirm = document.getElementById("delete-confirm");
  const deleteCancel = document.getElementById("delete-cancel");
  const deleteClose = document.getElementById("delete-modal-close");

  function openModal(m) {
    m.classList.add("show");
  }
  function closeModal(m) {
    m.classList.remove("show");
  }

  const addBtn = document.getElementById("dashboard-add-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      currentType = "todo";
      modalTitle.textContent = "Add Task";
      modalInput.value = "";
      openModal(modal);
      modalInput.focus();
    });
  }

  [modalClose, modalCancel].forEach((btn) =>
    btn?.addEventListener("click", () => closeModal(modal))
  );

  modalSave.addEventListener("click", () => {
    const text = modalInput.value.trim();
    if (!text) return;

    let tasks = JSON.parse(localStorage.getItem("teacherTasks")) || {
      todo: [],
    };
    tasks.todo.push({ task: text, done: false });
    localStorage.setItem("teacherTasks", JSON.stringify(tasks));

    renderDashboardTasks();
    closeModal(modal);
  });

  [editCancel, editClose].forEach((btn) =>
    btn?.addEventListener("click", () => closeModal(editModal))
  );

  editSave.addEventListener("click", () => {
    if (!editContext) return;

    const { type, index } = editContext;
    const tasks = JSON.parse(localStorage.getItem("teacherTasks"));
    const newText = editInput.value.trim();
    if (!newText) return;

    tasks[type][index].task = newText;
    localStorage.setItem("teacherTasks", JSON.stringify(tasks));

    renderDashboardTasks();
    closeModal(editModal);
    editContext = { type: null, index: null };
  });

  [deleteCancel, deleteClose].forEach((btn) =>
    btn?.addEventListener("click", () => closeModal(deleteModal))
  );

  deleteConfirm.addEventListener("click", () => {
    const { type, index } = deleteContext;
    const tasks = JSON.parse(localStorage.getItem("teacherTasks"));
    tasks[type].splice(index, 1);
    localStorage.setItem("teacherTasks", JSON.stringify(tasks));
    renderDashboardTasks();
    closeModal(deleteModal);
  });
}

function openEditModal(type, index) {
  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");
  editContext = { type, index };

  const tasks = JSON.parse(localStorage.getItem("teacherTasks"));
  editInput.value = tasks[type][index].task;
  // Set title for tasks
  document.querySelector("#edit-modal .modal-header h2").textContent =
    "Edit Task";
  editModal.classList.add("show");
}

function openDeleteModal(type, index) {
  deleteContext = { type, index };
  const deleteModal = document.getElementById("delete-modal");
  deleteModal.classList.add("show");
}

// Load overview statistics
function loadOverviewStats() {
  // Quiz attempts - count from student quiz results
  const quizAttempts = getQuizAttemptsCount();
  document.getElementById("quiz-attempts").textContent = quizAttempts;

  // Forum posts - count from forum data
  const forumPosts = getForumPostsCount();
  document.getElementById("forum-posts").textContent = forumPosts;

  // Reviews - count from review data
  const reviewsCount = getReviewsCount();
  document.getElementById("reviews-count").textContent = reviewsCount;
}

// Get quiz attempts count (students who took published teacher quizzes)
function getQuizAttemptsCount() {
  // For now, simulate data - in real app this would come from backend
  // Count how many students have taken published quizzes
  const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
  if (!teacherSubjects) return 0;

  const subjects = JSON.parse(teacherSubjects);
  let totalAttempts = 0;

  // Simulate student attempts based on published quizzes
  subjects.forEach((subject) => {
    subject.quizzes.forEach((quiz) => {
      if (quiz.published && quiz.questions && quiz.questions.length > 0) {
        // Simulate 3-8 students per published quiz
        totalAttempts += Math.floor(Math.random() * 6) + 3;
      }
    });
  });

  return totalAttempts;
}

// Get forum posts count
function getForumPostsCount() {
  // For now, simulate forum engagement data
  // In real app, this would count posts in teacher-managed forums
  const forumData = localStorage.getItem("forum_posts");
  if (forumData) {
    const posts = JSON.parse(forumData);
    return posts.length || 0;
  }

  // Simulate forum activity
  return Math.floor(Math.random() * 50) + 20;
}

// Get reviews count
function getReviewsCount() {
  // For now, simulate review data
  // In real app, this would count reviews for teacher's content
  const reviewData = localStorage.getItem("content_reviews");
  if (reviewData) {
    const reviews = JSON.parse(reviewData);
    return reviews.length || 0;
  }

  // Simulate reviews for published content
  const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
  if (!teacherSubjects) return 0;

  const subjects = JSON.parse(teacherSubjects);
  let publishedQuizzes = 0;

  subjects.forEach((subject) => {
    subject.quizzes.forEach((quiz) => {
      if (quiz.published) publishedQuizzes++;
    });
  });

  // Simulate 1-3 reviews per published quiz
  return publishedQuizzes * (Math.floor(Math.random() * 3) + 1);
}
