// Admin Task Management Functions - Connected to Backend

let allTodos = [];
let editContext = { id: null };
let deleteContext = { id: null };

async function loadDashboardTasks() {
  try {
    allTodos = await adminApi.getTodos();
    renderDashboardTasks();
    bindDashboardEvents();
  } catch (err) {
    console.error("Error loading dashboard tasks:", err);
  }
}

function renderDashboardTasks() {
  const tasks = allTodos.filter(t => !t.completed);
  const list = document.getElementById("dashboard-tasks-list");
  if (!list) return;

  list.innerHTML = "";

  if (tasks.length === 0) {
    list.innerHTML = `<li>No pending tasks</li>`;
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.id = `dash-task-${task.id}`;
    checkbox.checked = !!task.completed;

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = task.text;

    checkbox.addEventListener("change", async () => {
      await adminApi.updateTodo(task.id, task.text, checkbox.checked);
      loadDashboardTasks();
    });

    const actions = document.createElement("div");
    actions.className = "task-item-actions";

    const editBtn = document.createElement("i");
    editBtn.className = "fa fa-pencil";
    editBtn.title = "Edit";
    editBtn.addEventListener("click", () => openEditModal(task));

    const deleteBtn = document.createElement("i");
    deleteBtn.className = "fa fa-trash";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", () => openDeleteModal(task));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(actions);
    list.appendChild(li);
  });
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

  const addBtn = document.getElementById("dashboard-add-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      modalTitle.textContent = "Add Task";
      modalInput.value = "";
      modal.classList.add("show");
      modalInput.focus();
    });
  }

  [modalClose, modalCancel].forEach(btn => btn?.addEventListener("click", () => modal.classList.remove("show")));

  modalSave.addEventListener("click", async () => {
    const text = modalInput.value.trim();
    if (!text) return;
    await adminApi.createTodo(text);
    modal.classList.remove("show");
    loadDashboardTasks();
  });

  [editCancel, editClose].forEach(btn => btn?.addEventListener("click", () => editModal.classList.remove("show")));

  editSave.addEventListener("click", async () => {
    const text = editInput.value.trim();
    if (!text) return;
    await adminApi.updateTodo(editContext.id, text, false);
    editModal.classList.remove("show");
    loadDashboardTasks();
  });

  [deleteCancel, deleteClose].forEach(btn => btn?.addEventListener("click", () => deleteModal.classList.remove("show")));

  deleteConfirm.addEventListener("click", async () => {
    await adminApi.deleteTodo(deleteContext.id);
    deleteModal.classList.remove("show");
    loadDashboardTasks();
  });
}

function openEditModal(task) {
  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");
  editContext = { id: task.id };
  editInput.value = task.text;
  document.querySelector("#edit-modal .modal-header h2").textContent = "Edit Task";
  editModal.classList.add("show");
}

function openDeleteModal(task) {
  deleteContext = { id: task.id };
  document.getElementById("delete-modal").classList.add("show");
}