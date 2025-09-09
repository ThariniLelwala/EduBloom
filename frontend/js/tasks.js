// ../../js/tasks.js
let taskData = null;
let currentType = null;
let editContext = { type: null, index: null };
let deleteContext = { type: null };

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

  if (document.getElementById("todo-list")) {
    populateList("todo-list", taskData.todo, "todo");
  }
  if (document.getElementById("weekly-list")) {
    populateList("weekly-list", taskData.weeklyGoals, "weekly");
  }
  if (document.getElementById("monthly-list")) {
    populateList("monthly-list", taskData.monthlyGoals, "monthly");
  }

  if (document.getElementById("todo-completed")) updateSummary();
  if (document.getElementById("todo-date")) updateDates();
}

function updateSummary() {
  const todoCompleted = taskData.todo.filter((t) => t.done).length;
  const weeklyCompleted = taskData.weeklyGoals.filter((g) => g.done).length;
  const monthlyCompleted = taskData.monthlyGoals.filter((g) => g.done).length;

  if (document.getElementById("todo-completed")) {
    document.getElementById(
      "todo-completed"
    ).textContent = `${todoCompleted}/${taskData.todo.length}`;
  }
  if (document.getElementById("weekly-completed")) {
    document.getElementById(
      "weekly-completed"
    ).textContent = `${weeklyCompleted}/${taskData.weeklyGoals.length}`;
  }
  if (document.getElementById("monthly-completed")) {
    document.getElementById(
      "monthly-completed"
    ).textContent = `${monthlyCompleted}/${taskData.monthlyGoals.length}`;
  }
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

    li.appendChild(checkbox);
    li.appendChild(label);
    list.appendChild(li);
  });
}

function updateDates() {
  if (!document.getElementById("todo-date")) return;

  const now = new Date();
  document.getElementById("todo-date").textContent = now.toLocaleDateString(
    undefined,
    { year: "numeric", month: "long", day: "numeric" }
  );

  const weekNumber = Math.ceil(
    ((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + now.getDay() + 1) /
      7
  );
  if (document.getElementById("weekly-date"))
    document.getElementById("weekly-date").textContent = "Week " + weekNumber;

  if (document.getElementById("monthly-date"))
    document.getElementById("monthly-date").textContent = now.toLocaleString(
      "default",
      { month: "long" }
    );
}

function bindGlobalEvents() {
  // Only bind modals if they exist (so calendar page won't break)
  const modal = document.getElementById("task-modal");
  if (!modal) return;

  const modalClose = document.getElementById("modal-close");
  const modalCancel = document.getElementById("modal-cancel");
  const modalSave = document.getElementById("modal-save");
  const modalInput = document.getElementById("task-input");
  const modalTitle = document.getElementById("modal-title");

  const editModal = document.getElementById("edit-modal");
  const editSelect = document.getElementById("edit-select");
  const editInput = document.getElementById("edit-input");
  const editSave = document.getElementById("edit-save");
  const editCancel = document.getElementById("edit-cancel");
  const editClose = document.getElementById("edit-modal-close");

  const deleteModal = document.getElementById("delete-modal");
  const deleteList = document.getElementById("delete-list");
  const deleteConfirm = document.getElementById("delete-confirm");
  const deleteCancel = document.getElementById("delete-cancel");
  const deleteClose = document.getElementById("delete-modal-close");

  function openModal(m) {
    m.classList.add("show");
  }
  function closeModal(m) {
    m.classList.remove("show");
  }

  // --- Add Task ---
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

  // --- Edit, Delete bindings (only run if elements exist) ---
  if (editModal) {
    document.querySelectorAll(".edit-btn").forEach((icon) => {
      icon.addEventListener("click", () => {
        const type = icon.dataset.type;
        const list =
          type === "todo"
            ? taskData.todo
            : type === "weekly"
            ? taskData.weeklyGoals
            : taskData.monthlyGoals;

        if (list.length === 0) return;

        editContext.type = type;
        editSelect.innerHTML = "";

        list.forEach((item, idx) => {
          const option = document.createElement("option");
          option.value = idx;
          option.textContent = item.task || item.goal;
          editSelect.appendChild(option);
        });

        editSelect.selectedIndex = 0;
        editInput.value = list[0].task || list[0].goal;

        openModal(editModal);
        editInput.focus();
      });
    });

    editSelect.addEventListener("change", () => {
      const index = editSelect.value;
      const list =
        editContext.type === "todo"
          ? taskData.todo
          : editContext.type === "weekly"
          ? taskData.weeklyGoals
          : taskData.monthlyGoals;
      editInput.value = list[index].task || list[index].goal;
      editContext.index = parseInt(index);
    });

    editSave.addEventListener("click", () => {
      const { type } = editContext;
      const index = editSelect.value;
      const newText = editInput.value.trim();
      if (!newText) return;

      const list =
        type === "todo"
          ? taskData.todo
          : type === "weekly"
          ? taskData.weeklyGoals
          : taskData.monthlyGoals;

      if (type === "todo") list[index].task = newText;
      else list[index].goal = newText;

      renderAll();
      closeModal(editModal);
    });

    [editCancel, editClose].forEach((btn) =>
      btn.addEventListener("click", () => closeModal(editModal))
    );
  }

  if (deleteModal) {
    document.querySelectorAll(".delete-btn").forEach((icon) => {
      icon.addEventListener("click", () => {
        const type = icon.dataset.type;
        const list =
          type === "todo"
            ? taskData.todo
            : type === "weekly"
            ? taskData.weeklyGoals
            : taskData.monthlyGoals;

        if (list.length === 0) return;

        deleteContext.type = type;
        deleteList.innerHTML = "";

        list.forEach((item, idx) => {
          const li = document.createElement("li");
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.value = idx;
          checkbox.id = `delete-${type}-${idx}`;

          const label = document.createElement("label");
          label.htmlFor = checkbox.id;
          label.textContent = item.task || item.goal;

          li.appendChild(checkbox);
          li.appendChild(label);
          deleteList.appendChild(li);
        });

        openModal(deleteModal);
      });
    });

    deleteConfirm.addEventListener("click", () => {
      const { type } = deleteContext;
      const list =
        type === "todo"
          ? taskData.todo
          : type === "weekly"
          ? taskData.weeklyGoals
          : taskData.monthlyGoals;

      const checkboxes = deleteList.querySelectorAll("input[type=checkbox]");
      const toDelete = [];
      checkboxes.forEach((cb) => {
        if (cb.checked) toDelete.push(parseInt(cb.value));
      });

      toDelete.sort((a, b) => b - a).forEach((idx) => list.splice(idx, 1));

      renderAll();
      closeModal(deleteModal);
    });

    [deleteCancel, deleteClose].forEach((btn) =>
      btn.addEventListener("click", () => closeModal(deleteModal))
    );
  }
}

loadTasks();
