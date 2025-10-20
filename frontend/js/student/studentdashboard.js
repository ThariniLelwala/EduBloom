// ../../js/studentdashboard.js

// Ensure taskData is global
window.taskData = window.taskData || null;
let currentType = "todo"; // default type for add
let editContext = { type: null, index: null };
let deleteContext = { type: null, index: null };

// -------------------- Load Tasks --------------------
async function loadDashboardTasks() {
  try {
    if (!window.taskData) {
      const response = await fetch("../../data/tasks.json");
      if (!response.ok) throw new Error("Failed to load tasks.json");
      window.taskData = await response.json();
    }
    renderDashboardTasks();
    updateProgressBars();
    bindDashboardEvents();
  } catch (err) {
    console.error("Error loading dashboard tasks:", err);
  }
}

// -------------------- Update Progress Bars --------------------
function updateProgressBars() {
  try {
    const todoTasks = window.taskData?.todo || [];
    const weeklyGoals = window.taskData?.weeklyGoals || [];
    const monthlyGoals = window.taskData?.monthlyGoals || [];

    // Calculate todo progress
    const todoCompleted = todoTasks.filter((task) => task.done).length;
    const todoTotal = todoTasks.length;
    const todoPercentage =
      todoTotal > 0 ? (todoCompleted / todoTotal) * 100 : 0;

    // Calculate weekly progress
    const weeklyCompleted = weeklyGoals.filter((goal) => goal.done).length;
    const weeklyTotal = weeklyGoals.length;
    const weeklyPercentage =
      weeklyTotal > 0 ? (weeklyCompleted / weeklyTotal) * 100 : 0;

    // Calculate monthly progress
    const monthlyCompleted = monthlyGoals.filter((goal) => goal.done).length;
    const monthlyTotal = monthlyGoals.length;
    const monthlyPercentage =
      monthlyTotal > 0 ? (monthlyCompleted / monthlyTotal) * 100 : 0;

    // Update DOM
    const todoBar = document.getElementById("todo-progress-bar");
    const weeklyBar = document.getElementById("weekly-progress-bar");
    const monthlyBar = document.getElementById("monthly-progress-bar");
    const todoText = document.getElementById("todo-progress-text");
    const weeklyText = document.getElementById("weekly-progress-text");
    const monthlyText = document.getElementById("monthly-progress-text");

    if (todoBar) todoBar.style.width = todoPercentage + "%";
    if (weeklyBar) weeklyBar.style.width = weeklyPercentage + "%";
    if (monthlyBar) monthlyBar.style.width = monthlyPercentage + "%";
    if (todoText) todoText.textContent = `${todoCompleted}/${todoTotal}`;
    if (weeklyText)
      weeklyText.textContent = `${weeklyCompleted}/${weeklyTotal}`;
    if (monthlyText)
      monthlyText.textContent = `${monthlyCompleted}/${monthlyTotal}`;
  } catch (err) {
    console.error("Error updating progress bars:", err);
  }
}

// -------------------- Render Tasks --------------------
function renderDashboardTasks() {
  const tasks = window.taskData?.todo || [];
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
      updateProgressBars();
      if (typeof updateSummary === "function") updateSummary();
    });

    // Actions: Edit / Delete
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

// -------------------- Dashboard Modals --------------------
function bindDashboardEvents() {
  // If modals already exist on page, use them. Otherwise create temporary ones
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

  // Add task button (dashboard can have a +Add button somewhere)
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

    if (!window.taskData.todo) window.taskData.todo = [];
    window.taskData.todo.push({ task: text, done: false });

    renderDashboardTasks();
    updateProgressBars();
    closeModal(modal);
  });

  // Edit modal
  [editCancel, editClose].forEach((btn) =>
    btn?.addEventListener("click", () => closeModal(editModal))
  );

  editSave.addEventListener("click", () => {
    if (!editContext) return;

    const { type, index } = editContext;
    const list = type === "todo" ? window.taskData.todo : [];
    const newText = editInput.value.trim();
    if (!newText) return;

    list[index].task = newText;

    renderDashboardTasks();
    updateProgressBars();
    closeModal(editModal);
    editContext = { type: null, index: null };
  });

  // Delete modal
  [deleteCancel, deleteClose].forEach((btn) =>
    btn?.addEventListener("click", () => closeModal(deleteModal))
  );

  deleteConfirm.addEventListener("click", () => {
    const { type, index } = deleteContext;
    const list = type === "todo" ? window.taskData.todo : [];
    list.splice(index, 1);
    renderDashboardTasks();
    updateProgressBars();
    closeModal(deleteModal);
  });
}

// -------------------- Open Modals --------------------
function openEditModal(type, index) {
  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");
  editContext = { type, index };

  const list = type === "todo" ? window.taskData.todo : [];
  editInput.value = list[index].task;
  editModal.classList.add("show");
}

function openDeleteModal(type, index) {
  deleteContext = { type, index };
  const deleteModal = document.getElementById("delete-modal");
  deleteModal.classList.add("show");
}

// -------------------- Styles --------------------
const style = document.createElement("style");
style.innerHTML = `
  #dashboard-tasks-list { list-style: none; padding: 0; margin: 0; }
  #dashboard-tasks-list .task-item { display: flex; gap: 8px; margin-bottom: 8px; margin-top: 8px;}
  #dashboard-tasks-list .task-item.completed label { text-decoration: line-through; opacity: 0.6; }
  #dashboard-tasks-list .task-checkbox { cursor: pointer; }
  #dashboard-tasks-list .task-item-actions { margin-left: auto; display: flex; gap: 6px; }
  #dashboard-tasks-list .task-item-actions i { cursor: pointer; }
`;
document.head.appendChild(style);

// -------------------- Init --------------------
loadDashboardTasks();
