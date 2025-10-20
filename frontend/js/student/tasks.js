// ../../js/tasks.js
let taskData = null;
let currentType = null;
let editContext = { type: null, index: null };
let deleteContext = { type: null, index: null };

// Load tasks from JSON
async function loadTasks() {
  try {
    const response = await fetch("../../data/tasks.json");
    if (!response.ok) throw new Error("Failed to load tasks.json");
    taskData = await response.json();

    renderAll();
    bindGlobalEvents();
  } catch (err) {
    console.error("Error loading tasks:", err);
  }
}

// Render all lists
function renderAll() {
  if (!taskData) return;

  populateList("todo-list", taskData.todo, "todo");
  populateList("weekly-list", taskData.weeklyGoals, "weekly");
  populateList("monthly-list", taskData.monthlyGoals, "monthly");

  updateSummary();
}

// Update summary (safe for pages with/without elements)
function updateSummary() {
  if (!taskData) return;

  const todoCompleted = taskData.todo?.filter((t) => t.done).length || 0;
  const weeklyCompleted =
    taskData.weeklyGoals?.filter((g) => g.done).length || 0;
  const monthlyCompleted =
    taskData.monthlyGoals?.filter((g) => g.done).length || 0;

  const todoEl = document.getElementById("todo-completed");
  if (todoEl) todoEl.textContent = `${todoCompleted}/${taskData.todo.length}`;

  const weeklyEl = document.getElementById("weekly-completed");
  if (weeklyEl)
    weeklyEl.textContent = `${weeklyCompleted}/${taskData.weeklyGoals.length}`;

  const monthlyEl = document.getElementById("monthly-completed");
  if (monthlyEl)
    monthlyEl.textContent = `${monthlyCompleted}/${taskData.monthlyGoals.length}`;
}

// Populate a list
function populateList(listId, items, prefix) {
  const list = document.getElementById(listId);
  if (!list || !items) return;

  list.innerHTML = "";

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "task-item";
    if (item.done) li.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.id = `${prefix}-${index}`;
    checkbox.checked = !!item.done;

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = item.task || item.goal;

    checkbox.addEventListener("change", () => {
      item.done = checkbox.checked;
      li.classList.toggle("completed", checkbox.checked);
      updateSummary();
    });

    // Actions: Edit / Delete
    const actions = document.createElement("div");
    actions.className = "task-item-actions";

    const editBtn = document.createElement("i");
    editBtn.className = "fa fa-pencil";
    editBtn.title = "Edit";
    editBtn.addEventListener("click", () => openEditModal(prefix, index));

    const deleteBtn = document.createElement("i");
    deleteBtn.className = "fa fa-trash";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", () => openDeleteModal(prefix, index));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

// Bind global buttons and modals
function bindGlobalEvents() {
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

  // Add task/goal button
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentType = btn.dataset.type || "todo";
      modalTitle.textContent = currentType === "todo" ? "Add Task" : "Add Goal";
      modalInput.value = "";
      openModal(modal);
      modalInput.focus();
    });
  });

  [modalClose, modalCancel].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(modal))
  );

  modalSave.addEventListener("click", () => {
    const text = modalInput.value.trim();
    if (!text) return;

    if (currentType === "todo") {
      if (!taskData.todo) taskData.todo = [];
      taskData.todo.push({ task: text, done: false });
    } else if (currentType === "weekly") {
      if (!taskData.weeklyGoals) taskData.weeklyGoals = [];
      taskData.weeklyGoals.push({ goal: text, done: false });
    } else if (currentType === "monthly") {
      if (!taskData.monthlyGoals) taskData.monthlyGoals = [];
      taskData.monthlyGoals.push({ goal: text, done: false });
    }

    renderAll();
    closeModal(modal);
  });

  // Edit modal close
  [editCancel, editClose].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(editModal))
  );

  // Edit modal save
  editSave.addEventListener("click", () => {
    if (!editContext) return;

    const { type, index } = editContext;
    const list =
      type === "todo"
        ? taskData.todo
        : type === "weekly"
        ? taskData.weeklyGoals
        : taskData.monthlyGoals;

    const newText = editInput.value.trim();
    if (!newText) return;

    if (type === "todo") list[index].task = newText;
    else list[index].goal = newText;

    renderAll();
    closeModal(editModal);
    editContext = { type: null, index: null };
  });

  // Delete modal close
  [deleteCancel, deleteClose].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(deleteModal))
  );

  // Delete confirm
  deleteConfirm.addEventListener("click", () => {
    const { type, index } = deleteContext;
    const list =
      type === "todo"
        ? taskData.todo
        : type === "weekly"
        ? taskData.weeklyGoals
        : taskData.monthlyGoals;

    list.splice(index, 1);
    renderAll();
    closeModal(deleteModal);
  });
}

// Open edit modal
function openEditModal(type, index) {
  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");

  editContext = { type, index };
  const list =
    type === "todo"
      ? taskData.todo
      : type === "weekly"
      ? taskData.weeklyGoals
      : taskData.monthlyGoals;

  editInput.value = list[index].task || list[index].goal;
  editModal.classList.add("show");
}

// Open delete modal
function openDeleteModal(type, index) {
  deleteContext = { type, index };
  const deleteModal = document.getElementById("delete-modal");
  deleteModal.classList.add("show");
}

// Initialize
loadTasks();
