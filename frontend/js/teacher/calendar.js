document.addEventListener("DOMContentLoaded", async () => {
  const monthYear = document.getElementById("monthYear");
  const calendarDays = document.getElementById("calendarDays");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const eventsList = document.getElementById("events-list");

  let currentDate = new Date();
  let allTodos = []; // Will hold all fetched todos/deadlines
  let editContext = { id: null };
  let deleteContext = { id: null };

  // ===== Modals =====
  const deadlineModal = document.getElementById("deadline-modal");
  const deadlineInput = document.getElementById("deadline-input");
  const deadlineDate = document.getElementById("deadline-date");

  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");
  const editDate = document.getElementById("edit-date");

  const deleteModal = document.getElementById("delete-modal");

  // Load deadlines from Backend
  async function loadDeadlines() {
    try {
      const result = await window.teacherTodoApi.getTodos();
      allTodos = result.todos || [];
      renderAll();
    } catch (err) {
      console.error("Error loading teacher deadlines:", err);
      allTodos = [];
      renderAll();
    }
  }

  function renderAll() {
    renderCalendar(currentDate);
    renderDeadlines();
  }

  function renderDeadlines() {
    if (!eventsList) return;
    eventsList.innerHTML = "";

    // Filter only 'deadline' type
    const deadlines = allTodos.filter((t) => t.type === "deadline");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = deadlines.filter((dl) => {
      // Normalize both dates to midnight local time for consistent comparison
      const d = new Date(dl.expires_at);
      const deadlineDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      return deadlineDate >= today;
    });

    // Sort by date ascending
    upcoming.sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at));

    if (!upcoming.length) {
      eventsList.innerHTML = "<p>No upcoming events</p>";
      return;
    }

    upcoming.forEach((dl) => {
      const dlDate = new Date(dl.expires_at);

      const wrapper = document.createElement("li");
      wrapper.classList.add("event-tile");
      // Checkboxes removed as per request - events are cleared by date

      const content = document.createElement("div");
      content.style.flex = "1";

      const title = document.createElement("div");
      title.classList.add("event-title");
      title.textContent = dl.text;

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
      editBtn.addEventListener("click", () => openEditModal(dl.id));

      const deleteBtn = document.createElement("i");
      deleteBtn.className = "fa fa-trash";
      deleteBtn.addEventListener("click", () => openDeleteModal(dl.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      footer.appendChild(dateBadge);
      footer.appendChild(actions);
      content.appendChild(title);
      content.appendChild(footer);
      wrapper.appendChild(content);

      eventsList.appendChild(wrapper);
    });
  }

  function renderCalendar(date) {
    if (!calendarDays || !monthYear) return;

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

    const deadlines = allTodos.filter((t) => t.type === "deadline");

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
      )
        div.classList.add("today");

      const thisDate = new Date(year, month, i).toDateString();
      if (
        deadlines.some(
          (dl) => new Date(dl.expires_at).toDateString() === thisDate
        )
      )
        div.classList.add("deadline");

      calendarDays.appendChild(div);
    }

    // Next month placeholders
    const totalCells = firstDay + lastDate;
    const nextDays = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= nextDays; i++) {
      const div = document.createElement("div");
      div.classList.add("calendar-date", "inactive");
      div.textContent = i;
      calendarDays.appendChild(div);
    }
  }

  // ===== Add Event =====
  document.querySelectorAll(".add-deadline-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      deadlineInput.value = "";
      deadlineDate.value = "";
      deadlineModal.classList.add("show");
    });
  });

  const saveDeadlineBtn = document.getElementById("modal-save-deadline");
  if (saveDeadlineBtn) {
    saveDeadlineBtn.addEventListener("click", async () => {
      const text = deadlineInput.value.trim();
      const dateVal = deadlineDate.value;

      if (!text || !dateVal) return;

      try {
        await window.teacherTodoApi.createTodo("deadline", text, dateVal);
        await loadDeadlines();
        deadlineModal.classList.remove("show");
      } catch (err) {
        console.error("Error creating deadline:", err);
      }
    });
  }

  // ===== Edit / Delete =====
  function openEditModal(id) {
    editContext = { id };
    const task = allTodos.find((t) => t.id === id);
    if (!task) return;

    editInput.value = task.text;
    if (task.expires_at) {
      editDate.value = new Date(task.expires_at).toISOString().split("T")[0];
    }

    document.querySelector("#edit-modal .modal-header h2").textContent =
      "Edit Event";
    editModal.classList.add("show");
  }

  function openDeleteModal(id) {
    deleteContext = { id };
    deleteModal.classList.add("show");
  }

  const editSaveBtn = document.getElementById("edit-save");
  if (editSaveBtn) {
    editSaveBtn.addEventListener("click", async () => {
      if (!editContext.id) return;

      const text = editInput.value.trim();
      const dateVal = editDate.value;

      if (!text || !dateVal) return;

      try {
        await window.teacherTodoApi.updateTodo(editContext.id, {
          text: text,
          expiresAt: dateVal,
        });
        await loadDeadlines();
        editModal.classList.remove("show");
        editContext = { id: null };
      } catch (err) {
        console.error("Error updating deadline:", err);
      }
    });
  }

  const deleteConfirmBtn = document.getElementById("delete-confirm");
  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener("click", async () => {
      if (!deleteContext.id) return;

      try {
        await window.teacherTodoApi.deleteTodo(deleteContext.id);
        await loadDeadlines();
        deleteModal.classList.remove("show");
        deleteContext = { id: null };
      } catch (err) {
        console.error("Error deleting deadline:", err);
      }
    });
  }

  document.querySelectorAll(".modal-close, .modal-cancel").forEach((btn) => {
    btn.addEventListener("click", () => {
      deadlineModal.classList.remove("show");
      editModal.classList.remove("show");
      deleteModal.classList.remove("show");
    });
  });

  // ===== Month navigation =====
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar(currentDate);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar(currentDate);
    });
  }

  // Initial load
  await loadDeadlines();
});
