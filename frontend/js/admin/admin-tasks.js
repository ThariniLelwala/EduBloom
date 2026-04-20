// Admin Task Management - Backend Connected
// Replaces localStorage with /api/admin/todos CRUD endpoints via adminApi

// In-memory cache of tasks (synced from backend)
let adminTasks = [];

// Context for edit/delete modals
let editContext = { id: null };
let deleteContext = { id: null };

// ─────────────────────────────────────────────
// Initialise: load tasks from backend
// ─────────────────────────────────────────────
async function loadDashboardTasks() {
  try {
    adminTasks = await adminApi.getTodos();
    renderDashboardTasks();
    bindDashboardEvents();
  } catch (err) {
    console.error("Error loading dashboard tasks:", err);
    renderDashboardTasks(); // render empty list on error
    bindDashboardEvents();
  }
}

// ─────────────────────────────────────────────
// Render task list
// ─────────────────────────────────────────────
function renderDashboardTasks() {
  const list = document.getElementById("dashboard-tasks-list");
  if (!list) return;

  list.innerHTML = "";

  if (adminTasks.length === 0) {
    list.innerHTML = `<li>No pending tasks 🎉</li>`;
    return;
  }

  adminTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";
    if (task.completed) li.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.id = `dash-task-${task.id}`;
    checkbox.checked = !!task.completed;

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = task.text;

    checkbox.addEventListener("change", async () => {
      try {
        const updated = await adminApi.updateTodo(task.id, {
          completed: checkbox.checked,
        });
        // Update local cache
        const idx = adminTasks.findIndex((t) => t.id === task.id);
        if (idx !== -1) adminTasks[idx].completed = updated.completed;
        li.classList.toggle("completed", updated.completed);
      } catch (err) {
        console.error("Error toggling task completion:", err);
        // Revert checkbox on failure
        checkbox.checked = !checkbox.checked;
      }
    });

    const actions = document.createElement("div");
    actions.className = "task-item-actions";

    const editBtn = document.createElement("i");
    editBtn.className = "fa fa-pencil";
    editBtn.title = "Edit";
    editBtn.addEventListener("click", () => openEditModal(task.id, task.text));

    const deleteBtn = document.createElement("i");
    deleteBtn.className = "fa fa-trash";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", () => openDeleteModal(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

// ─────────────────────────────────────────────
// Bind modal events (called once on init)
// ─────────────────────────────────────────────
function bindDashboardEvents() {
  const modal = document.getElementById("task-modal");
  const modalClose = document.getElementById("modal-close");
  const modalCancel = document.getElementById("modal-cancel");
  const modalSave = document.getElementById("modal-save");
  const modalInput = document.getElementById("task-input");

  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");
  const editCancel = document.getElementById("edit-cancel");
  const editClose = document.getElementById("edit-modal-close");
  const editSave = document.getElementById("edit-save");

  const deleteModal = document.getElementById("delete-modal");
  const deleteConfirm = document.getElementById("delete-confirm");
  const deleteCancel = document.getElementById("delete-cancel");
  const deleteClose = document.getElementById("delete-modal-close");

  function openModal(m) { m.classList.add("show"); }
  function closeModal(m) { m.classList.remove("show"); }

  // ─── Add Task ───
  const addBtn = document.getElementById("dashboard-add-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      if (modalInput) modalInput.value = "";
      openModal(modal);
      if (modalInput) modalInput.focus();
    });
  }

  [modalClose, modalCancel].forEach((btn) =>
    btn?.addEventListener("click", () => closeModal(modal))
  );

  modalSave?.addEventListener("click", async () => {
    const text = modalInput?.value.trim();
    if (!text) return;
    try {
      const newTodo = await adminApi.createTodo(text);
      adminTasks.unshift(newTodo); // add to top of list
      renderDashboardTasks();
      closeModal(modal);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  });

  // ─── Edit Task ───
  [editCancel, editClose].forEach((btn) =>
    btn?.addEventListener("click", () => closeModal(editModal))
  );

  editSave?.addEventListener("click", async () => {
    const newText = editInput?.value.trim();
    if (!newText || editContext.id === null) return;
    try {
      const updated = await adminApi.updateTodo(editContext.id, {
        text: newText,
      });
      const idx = adminTasks.findIndex((t) => t.id === editContext.id);
      if (idx !== -1) adminTasks[idx].text = updated.text;
      renderDashboardTasks();
      closeModal(editModal);
      editContext = { id: null };
    } catch (err) {
      console.error("Error updating task:", err);
    }
  });

  // ─── Delete Task ───
  [deleteCancel, deleteClose].forEach((btn) =>
    btn?.addEventListener("click", () => closeModal(deleteModal))
  );

  deleteConfirm?.addEventListener("click", async () => {
    if (deleteContext.id === null) return;
    try {
      await adminApi.deleteTodo(deleteContext.id);
      adminTasks = adminTasks.filter((t) => t.id !== deleteContext.id);
      renderDashboardTasks();
      closeModal(deleteModal);
      deleteContext = { id: null };
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  });
}

// ─────────────────────────────────────────────
// Modal helpers
// ─────────────────────────────────────────────
function openEditModal(id, currentText) {
  editContext = { id };
  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");
  if (editInput) editInput.value = currentText;
  const heading = document.querySelector("#edit-modal .modal-header h2");
  if (heading) heading.textContent = "Edit Task";
  editModal?.classList.add("show");
}

function openDeleteModal(id) {
  deleteContext = { id };
  const deleteModal = document.getElementById("delete-modal");
  deleteModal?.classList.add("show");
}
