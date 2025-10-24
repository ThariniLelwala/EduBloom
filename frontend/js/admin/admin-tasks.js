// Admin Task Management Functions

// Task state variables
let currentType = "todo";
let editContext = { type: null, index: null };
let deleteContext = { type: null, index: null };

async function loadDashboardTasks() {
  try {
    let tasks = JSON.parse(localStorage.getItem("adminTasks")) || {
      todo: [
        { task: "Review pending teacher verifications", done: false },
        { task: "Check system health and backups", done: true },
      ],
    };
    localStorage.setItem("adminTasks", JSON.stringify(tasks));
    renderDashboardTasks();
    bindDashboardEvents();
  } catch (err) {
    console.error("Error loading dashboard tasks:", err);
  }
}

function renderDashboardTasks() {
  const tasks = JSON.parse(localStorage.getItem("adminTasks"))?.todo || [];
  const list = document.getElementById("dashboard-tasks-list");
  if (!list) return;

  list.innerHTML = "";

  if (tasks.length === 0) {
    list.innerHTML = `<li>No pending tasks 🎉</li>`;
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
  const tasks = JSON.parse(localStorage.getItem("adminTasks"));
  localStorage.setItem("adminTasks", JSON.stringify(tasks));
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

    let tasks = JSON.parse(localStorage.getItem("adminTasks")) || {
      todo: [],
    };
    tasks.todo.push({ task: text, done: false });
    localStorage.setItem("adminTasks", JSON.stringify(tasks));

    renderDashboardTasks();
    closeModal(modal);
  });

  [editCancel, editClose].forEach((btn) =>
    btn?.addEventListener("click", () => closeModal(editModal))
  );

  editSave.addEventListener("click", () => {
    if (!editContext) return;

    const { type, index } = editContext;
    const tasks = JSON.parse(localStorage.getItem("adminTasks"));
    const newText = editInput.value.trim();
    if (!newText) return;

    tasks[type][index].task = newText;
    localStorage.setItem("adminTasks", JSON.stringify(tasks));

    renderDashboardTasks();
    closeModal(editModal);
    editContext = { type: null, index: null };
  });

  [deleteCancel, deleteClose].forEach((btn) =>
    btn?.addEventListener("click", () => closeModal(deleteModal))
  );

  deleteConfirm.addEventListener("click", () => {
    const { type, index } = deleteContext;
    const tasks = JSON.parse(localStorage.getItem("adminTasks"));
    tasks[type].splice(index, 1);
    localStorage.setItem("adminTasks", JSON.stringify(tasks));
    renderDashboardTasks();
    closeModal(deleteModal);
  });
}

function openEditModal(type, index) {
  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");
  editContext = { type, index };

  const tasks = JSON.parse(localStorage.getItem("adminTasks"));
  editInput.value = tasks[type][index].task;
  document.querySelector("#edit-modal .modal-header h2").textContent =
    "Edit Task";
  editModal.classList.add("show");
}

function openDeleteModal(type, index) {
  deleteContext = { type, index };
  const deleteModal = document.getElementById("delete-modal");
  deleteModal.classList.add("show");
}
