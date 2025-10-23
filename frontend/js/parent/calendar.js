document.addEventListener("DOMContentLoaded", async () => {
  const monthYear = document.getElementById("monthYear");
  const calendarDays = document.getElementById("calendarDays");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const eventsList = document.getElementById("events-list");
  const todoList = document.getElementById("todo-list");
  const parentOnlyList = document.getElementById("parent-only-list");
  const timetableContainer = document.getElementById("timetable-container");

  let currentDate = new Date();
  let deadlines = [];
  let parentTasks = {
    todo: [],
    weekly: [],
    monthly: [],
    parentOnly: [],
  };
  let editContext = null;
  let deleteContext = null;
  let currentTaskType = null;

  // ===== Modals =====
  const deadlineModal = document.getElementById("deadline-modal");
  const deadlineInput = document.getElementById("deadline-input");
  const deadlineDate = document.getElementById("deadline-date");
  const taskModal = document.getElementById("task-modal");
  const taskInput = document.getElementById("task-input");
  const modalTitle = document.getElementById("modal-title");
  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");
  const deleteModal = document.getElementById("delete-modal");

  // ===== Load Data =====
  async function loadData() {
    try {
      // Load parent tasks from localStorage
      const savedTasks = localStorage.getItem("parentTasks");
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        parentTasks.todo = parsedTasks.todo || [];
        parentTasks.weekly = parsedTasks.weekly || [];
        parentTasks.monthly = parsedTasks.monthly || [];
      }

      // Load parent-only tasks from localStorage
      const savedParentOnly = localStorage.getItem("parentOnlyTasks");
      if (savedParentOnly) {
        parentTasks.parentOnly = JSON.parse(savedParentOnly);
      }

      // Load deadlines
      const res = await fetch("../../data/tasks.json");
      if (res.ok) {
        const data = await res.json();
        deadlines = data.deadlines || [];
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }

    renderAll();
  }

  function renderAll() {
    renderCalendar(currentDate);
    renderDeadlines();
    renderTodoList();
    renderParentOnlyList();
    renderTimetable();
  }

  // ===== Calendar Rendering =====
  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();

    monthYear.textContent = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    calendarDays.innerHTML = "";

    // Previous month placeholders
    for (let i = firstDay; i > 0; i--) {
      const div = document.createElement("div");
      div.classList.add("calendar-date", "inactive");
      div.textContent = prevLastDate - i + 1;
      calendarDays.appendChild(div);
    }

    // Current month
    for (let i = 1; i <= lastDate; i++) {
      const div = document.createElement("div");
      div.classList.add("calendar-date");
      div.textContent = i;

      const today = new Date();
      if (
        i === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        div.classList.add("today");
      }

      const thisDate = new Date(year, month, i).toDateString();
      if (
        deadlines.some((dl) => new Date(dl.date).toDateString() === thisDate)
      ) {
        div.classList.add("deadline");
      }

      calendarDays.appendChild(div);
    }

    // Next month placeholders
    const totalCells = firstDay + lastDate;
    const nextDays = 7 - (totalCells % 7);
    if (nextDays < 7) {
      for (let i = 1; i <= nextDays; i++) {
        const div = document.createElement("div");
        div.classList.add("calendar-date", "inactive");
        div.textContent = i;
        calendarDays.appendChild(div);
      }
    }
  }

  // ===== Deadlines/Events Rendering =====
  function renderDeadlines() {
    eventsList.innerHTML = "";
    const today = new Date();
    const cutoff = new Date();
    cutoff.setDate(today.getDate() + 45);

    const upcoming = deadlines.filter((dl) => {
      const d = new Date(dl.date);
      return d >= today && d <= cutoff;
    });

    if (!upcoming.length) {
      eventsList.innerHTML =
        "<p style='color: rgba(255, 255, 255, 0.6);'>No upcoming events</p>";
      return;
    }

    upcoming.forEach((dl, index) => {
      const dlDate = new Date(dl.date);

      const wrapper = document.createElement("li");
      wrapper.classList.add("event-tile");

      const title = document.createElement("div");
      title.classList.add("event-title");
      title.textContent = dl.title;

      const footer = document.createElement("div");
      footer.style.display = "flex";
      footer.style.justifyContent = "space-between";
      footer.style.alignItems = "center";
      footer.style.marginTop = "6px";

      const dateBadge = document.createElement("span");
      dateBadge.classList.add("event-date");
      dateBadge.textContent = dlDate.toDateString();

      const actions = document.createElement("div");
      actions.className = "task-item-actions";

      const editBtn = document.createElement("i");
      editBtn.className = "fa fa-pencil";
      editBtn.addEventListener("click", () => openEditModal(index, "deadline"));

      const deleteBtn = document.createElement("i");
      deleteBtn.className = "fa fa-trash";
      deleteBtn.addEventListener("click", () =>
        openDeleteModal(index, "deadline")
      );

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      footer.appendChild(dateBadge);
      footer.appendChild(actions);
      wrapper.appendChild(title);
      wrapper.appendChild(footer);

      eventsList.appendChild(wrapper);
    });
  }

  // ===== Child's To-Do List Rendering =====
  function renderTodoList() {
    todoList.innerHTML = "";

    if (!parentTasks.todo || parentTasks.todo.length === 0) {
      todoList.innerHTML =
        "<li style='color: rgba(255, 255, 255, 0.6);'>No tasks assigned</li>";
      return;
    }

    parentTasks.todo.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = "task-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.completed || false;
      checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        li.classList.toggle("completed", checkbox.checked);
        saveTasks();
      });

      const label = document.createElement("span");
      label.className = "task-text";
      label.textContent = task.text;

      const actions = document.createElement("div");
      actions.className = "task-item-actions";

      const editBtn = document.createElement("i");
      editBtn.className = "fa fa-pencil";
      editBtn.addEventListener("click", () =>
        openEditModal(index, "todo-child")
      );

      const deleteBtn = document.createElement("i");
      deleteBtn.className = "fa fa-trash";
      deleteBtn.addEventListener("click", () =>
        openDeleteModal(index, "todo-child")
      );

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(checkbox);
      li.appendChild(label);
      li.appendChild(actions);

      if (task.completed) li.classList.add("completed");

      todoList.appendChild(li);
    });
  }

  // ===== Parent-Only Tasks Rendering =====
  function renderParentOnlyList() {
    parentOnlyList.innerHTML = "";

    if (!parentTasks.parentOnly || parentTasks.parentOnly.length === 0) {
      parentOnlyList.innerHTML =
        "<li style='color: rgba(255, 255, 255, 0.6);'>No tasks</li>";
      return;
    }

    parentTasks.parentOnly.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = "task-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.completed || false;
      checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        li.classList.toggle("completed", checkbox.checked);
        saveParentOnlyTasks();
      });

      const label = document.createElement("span");
      label.className = "task-text";
      label.textContent = task.text;

      const actions = document.createElement("div");
      actions.className = "task-item-actions";

      const editBtn = document.createElement("i");
      editBtn.className = "fa fa-pencil";
      editBtn.addEventListener("click", () =>
        openEditModal(index, "parent-only")
      );

      const deleteBtn = document.createElement("i");
      deleteBtn.className = "fa fa-trash";
      deleteBtn.addEventListener("click", () =>
        openDeleteModal(index, "parent-only")
      );

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(checkbox);
      li.appendChild(label);
      li.appendChild(actions);

      if (task.completed) li.classList.add("completed");

      parentOnlyList.appendChild(li);
    });
  }

  // ===== Timetable Rendering (Child's School Schedule) =====
  function renderTimetable() {
    // This would display the child's school timetable
    // For now, showing a placeholder - can be integrated with actual timetable data
    const timetableHTML = `
      <div style="padding: 12px; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
        <p style="margin: 0 0 8px 0;">
          <strong>Monday - Friday</strong>
        </p>
        <p style="margin: 0 0 4px 0;">📚 School hours: 8:00 AM - 3:00 PM</p>
        <p style="margin: 0;">View your child's detailed timetable in their profile.</p>
      </div>
    `;
    timetableContainer.innerHTML = timetableHTML;
  }

  // ===== Save Functions =====
  function saveTasks() {
    localStorage.setItem(
      "parentTasks",
      JSON.stringify({
        todo: parentTasks.todo,
        weekly: parentTasks.weekly,
        monthly: parentTasks.monthly,
      })
    );
  }

  function saveParentOnlyTasks() {
    localStorage.setItem(
      "parentOnlyTasks",
      JSON.stringify(parentTasks.parentOnly)
    );
  }

  // ===== Modal Functions =====
  function openEditModal(index, type) {
    editContext = { index, type };
    editInput.value =
      type === "deadline"
        ? deadlines[index].title
        : type === "todo-child"
        ? parentTasks.todo[index].text
        : type === "parent-only"
        ? parentTasks.parentOnly[index].text
        : "";
    editModal.classList.add("show");
    editInput.focus();
  }

  function openDeleteModal(index, type) {
    deleteContext = { index, type };
    deleteModal.classList.add("show");
  }

  function saveEditedItem() {
    if (!editContext) return;

    const { index, type } = editContext;
    const newText = editInput.value.trim();

    if (!newText) return;

    if (type === "deadline") {
      deadlines[index].title = newText;
    } else if (type === "todo-child") {
      parentTasks.todo[index].text = newText;
      saveTasks();
    } else if (type === "parent-only") {
      parentTasks.parentOnly[index].text = newText;
      saveParentOnlyTasks();
    }

    renderAll();
    editModal.classList.remove("show");
    editContext = null;
  }

  function deleteItem() {
    if (!deleteContext) return;

    const { index, type } = deleteContext;

    if (type === "deadline") {
      deadlines.splice(index, 1);
    } else if (type === "todo-child") {
      parentTasks.todo.splice(index, 1);
      saveTasks();
    } else if (type === "parent-only") {
      parentTasks.parentOnly.splice(index, 1);
      saveParentOnlyTasks();
    }

    renderAll();
    deleteModal.classList.remove("show");
    deleteContext = null;
  }

  // ===== Event Listeners =====

  // Add Event Button
  document.querySelectorAll(".add-deadline-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      deadlineInput.value = "";
      deadlineDate.value = "";
      deadlineModal.classList.add("show");
      deadlineInput.focus();
    });
  });

  // Save Deadline
  document
    .getElementById("modal-save-deadline")
    .addEventListener("click", () => {
      if (!deadlineInput.value || !deadlineDate.value) return;
      deadlines.push({ title: deadlineInput.value, date: deadlineDate.value });
      renderAll();
      deadlineModal.classList.remove("show");
    });

  // Add Task Buttons
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentTaskType = btn.dataset.type;
      const typeLabel =
        currentTaskType === "parent-only" ? "Parent Task" : "Child's Task";
      modalTitle.textContent = `Add ${typeLabel}`;
      taskInput.value = "";
      taskModal.classList.add("show");
      taskInput.focus();
    });
  });

  // Save Task
  document.getElementById("modal-save").addEventListener("click", () => {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = { id: Date.now(), text, completed: false };

    if (currentTaskType === "parent-only") {
      parentTasks.parentOnly.push(newTask);
      saveParentOnlyTasks();
    } else if (currentTaskType === "todo") {
      parentTasks.todo.push(newTask);
      saveTasks();
    }

    renderAll();
    taskModal.classList.remove("show");
    currentTaskType = null;
  });

  // Edit Modal Save
  document
    .getElementById("edit-save")
    .addEventListener("click", saveEditedItem);

  // Delete Modal Confirm
  document
    .getElementById("delete-confirm")
    .addEventListener("click", deleteItem);

  // Close Modals
  document.querySelectorAll(".modal-close, .modal-cancel").forEach((btn) => {
    btn.addEventListener("click", () => {
      deadlineModal.classList.remove("show");
      taskModal.classList.remove("show");
      editModal.classList.remove("show");
      deleteModal.classList.remove("show");
    });
  });

  // Calendar Navigation
  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  // Enter key support
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("modal-save").click();
    }
  });

  editInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("edit-save").click();
    }
  });

  deadlineInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      document.getElementById("modal-save-deadline").click();
    }
  });

  // Initial Load
  await loadData();
});
