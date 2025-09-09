// ../../js/tasks.js
let taskData = null;
let currentType = null;
let editContext = { type: null, index: null };
let deleteContext = { type: null, index: null };

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

function renderAll() {
  if (!taskData) return;

  populateList("todo-list", taskData.todo, "todo");
  populateList("weekly-list", taskData.weeklyGoals, "weekly");
  populateList("monthly-list", taskData.monthlyGoals, "monthly");

  updateSummary();
  updateDates();
}

function updateSummary() {
  if (!taskData) return;

  const todoCompleted = taskData.todo.filter((t) => t.done).length;
  const weeklyCompleted = taskData.weeklyGoals.filter((g) => g.done).length;
  const monthlyCompleted = taskData.monthlyGoals.filter((g) => g.done).length;

  document.getElementById(
    "todo-completed"
  ).textContent = `${todoCompleted}/${taskData.todo.length}`;
  document.getElementById(
    "weekly-completed"
  ).textContent = `${weeklyCompleted}/${taskData.weeklyGoals.length}`;
  document.getElementById(
    "monthly-completed"
  ).textContent = `${monthlyCompleted}/${taskData.monthlyGoals.length}`;
}

function populateList(listId, items, prefix) {
  const list = document.getElementById(listId);
  if (!list) return;
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

    // Task item actions (Edit/Delete)
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

function updateDates() {
  const now = new Date();
  document.getElementById("todo-date").textContent = now.toLocaleDateString(
    undefined,
    { year: "numeric", month: "long", day: "numeric" }
  );

  const weekNumber = Math.ceil(
    ((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + now.getDay() + 1) /
      7
  );
  document.getElementById("weekly-date").textContent = "Week " + weekNumber;

  document.getElementById("monthly-date").textContent = now.toLocaleString(
    "default",
    { month: "long" }
  );
}

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

  // Add task buttons
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentType = btn.dataset.type;
      modalTitle.textContent =
        "Add " + (currentType === "todo" ? "Task" : "Goal");
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

    if (currentType === "todo") taskData.todo.push({ task: text, done: false });
    if (currentType === "weekly")
      taskData.weeklyGoals.push({ goal: text, done: false });
    if (currentType === "monthly")
      taskData.monthlyGoals.push({ goal: text, done: false });

    renderAll();
    closeModal(modal);
  });

  // Edit modal close
  [editCancel, editClose].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(editModal))
  );

  // Edit modal save (bound once)
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

  const list =
    type === "todo"
      ? taskData.todo
      : type === "weekly"
      ? taskData.weeklyGoals
      : taskData.monthlyGoals;

  editContext = { type, index };
  editInput.value = list[index].task || list[index].goal;

  editModal.classList.add("show");
}

// Open delete modal
function openDeleteModal(type, index) {
  deleteContext = { type, index };
  const deleteModal = document.getElementById("delete-modal");
  deleteModal.classList.add("show");
}

loadTasks();
