document.addEventListener("DOMContentLoaded", async () => {
  const monthYear = document.getElementById("monthYear");
  const calendarDays = document.getElementById("calendarDays");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const eventsList = document.getElementById("events-list");
  const todoList = document.getElementById("todo-list");
  const parentOnlyList = document.getElementById("parent-only-list");

  let currentDate = new Date();
  let deadlines = [];
  let parentTasks = {
    todo: [],
    weekly: [],
    monthly: [],
  };
  let editContext = null;
  let deleteContext = null;
  let currentTaskType = null;
  let currentStudentId = null;

  const deadlineModal = document.getElementById("deadline-modal");
  const deadlineInput = document.getElementById("deadline-input");
  const deadlineDate = document.getElementById("deadline-date");
  const taskModal = document.getElementById("task-modal");
  const taskInput = document.getElementById("task-input");
  const modalTitle = document.getElementById("modal-title");
  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");
  const deleteModal = document.getElementById("delete-modal");

  async function loadData() {
    const selectedChild = ChildSelector.getSelectedChild();
    currentStudentId = selectedChild ? selectedChild.id : null;

    try {
      if (currentStudentId) {
        const [deadlinesData, todosData, parentOnlyData] = await Promise.all([
          calendarApi.getDeadlines(currentStudentId),
          todoApi.getTodos(currentStudentId),
          calendarApi.getParentTasks()
        ]);

        deadlines = deadlinesData || [];
        parentTasks.todo = (todosData || []).filter(t => t.type === "todo");
        parentTasks.parentOnly = parentOnlyData || [];
      } else {
        deadlines = [];
        parentTasks.todo = [];
        parentTasks.parentOnly = [];
      }

      parentTasks.weekly = [];
      parentTasks.monthly = [];
    } catch (err) {
      console.error("Error loading data:", err);
      deadlines = [];
      parentTasks.todo = [];
      parentTasks.parentOnly = [];
    }

    renderAll();
  }

  function renderAll() {
    renderCalendar(currentDate);
    renderDeadlines();
    renderTodoList();
    renderParentOnlyList();
  }

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

    for (let i = firstDay; i > 0; i--) {
      const div = document.createElement("div");
      div.classList.add("calendar-date", "inactive");
      div.textContent = prevLastDate - i + 1;
      calendarDays.appendChild(div);
    }

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
      editBtn.addEventListener("click", () => openEditModal(index, "deadline", dl.id));

      const deleteBtn = document.createElement("i");
      deleteBtn.className = "fa fa-trash";
      deleteBtn.addEventListener("click", () =>
        openDeleteModal(index, "deadline", dl.id)
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

      const label = document.createElement("span");
      label.className = "task-text";
      label.textContent = task.text;

      const actions = document.createElement("div");
      actions.className = "task-item-actions";

      const editBtn = document.createElement("i");
      editBtn.className = "fa fa-pencil";
      editBtn.addEventListener("click", () =>
        openEditModal(index, "todo-child", task.id)
      );

      const deleteBtn = document.createElement("i");
      deleteBtn.className = "fa fa-trash";
      deleteBtn.addEventListener("click", () =>
        openDeleteModal(index, "todo-child", task.id)
      );

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(label);
      li.appendChild(actions);

      if (task.completed) li.classList.add("completed");

      todoList.appendChild(li);
    });
  }

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
      checkbox.addEventListener("change", async () => {
        try {
          await calendarApi.updateParentTask(task.id, { completed: checkbox.checked });
          task.completed = checkbox.checked;
          li.classList.toggle("completed", checkbox.checked);
        } catch (err) {
          checkbox.checked = !checkbox.checked;
          console.error("Error updating task:", err);
        }
      });

      const label = document.createElement("span");
      label.className = "task-text";
      label.textContent = task.text;

      const actions = document.createElement("div");
      actions.className = "task-item-actions";

      const editBtn = document.createElement("i");
      editBtn.className = "fa fa-pencil";
      editBtn.addEventListener("click", () =>
        openEditModal(index, "parent-only", task.id)
      );

      const deleteBtn = document.createElement("i");
      deleteBtn.className = "fa fa-trash";
      deleteBtn.addEventListener("click", () =>
        openDeleteModal(index, "parent-only", task.id)
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

  function openEditModal(index, type, id) {
    editContext = { index, type, id };
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

  function openDeleteModal(index, type, id) {
    deleteContext = { index, type, id };
    deleteModal.classList.add("show");
  }

  async function saveEditedItem() {
    if (!editContext) return;

    const { index, type, id } = editContext;
    const newText = editInput.value.trim();

    if (!newText) return;

    try {
      if (type === "deadline") {
        await calendarApi.updateDeadline(id, { title: newText });
        deadlines[index].title = newText;
      } else if (type === "todo-child") {
        await todoApi.updateTodo(id, { text: newText });
        parentTasks.todo[index].text = newText;
      } else if (type === "parent-only") {
        await calendarApi.updateParentTask(id, { text: newText });
        parentTasks.parentOnly[index].text = newText;
      }

      renderAll();
      editModal.classList.remove("show");
      editContext = null;
    } catch (err) {
      console.error("Error saving edit:", err);
      alert("Failed to save changes");
    }
  }

  async function deleteItem() {
    if (!deleteContext) return;

    const { index, type, id } = deleteContext;

    try {
      if (type === "deadline") {
        await calendarApi.deleteDeadline(id);
        deadlines.splice(index, 1);
      } else if (type === "todo-child") {
        await todoApi.deleteTodo(id);
        parentTasks.todo.splice(index, 1);
      } else if (type === "parent-only") {
        await calendarApi.deleteParentTask(id);
        parentTasks.parentOnly.splice(index, 1);
      }

      renderAll();
      deleteModal.classList.remove("show");
      deleteContext = null;
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Failed to delete item");
    }
  }

  document.querySelectorAll(".add-deadline-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!currentStudentId) {
        alert("Please select a child first");
        return;
      }
      deadlineInput.value = "";
      deadlineDate.value = "";
      deadlineModal.classList.add("show");
      deadlineInput.focus();
    });
  });

  document
    .getElementById("modal-save-deadline")
    .addEventListener("click", async () => {
      if (!deadlineInput.value || !deadlineDate.value) return;

      try {
        const newDeadline = await calendarApi.createDeadline(
          currentStudentId,
          deadlineInput.value,
          deadlineDate.value
        );
        deadlines.push(newDeadline);
        renderAll();
        deadlineModal.classList.remove("show");
      } catch (err) {
        console.error("Error creating deadline:", err);
        alert("Failed to create deadline");
      }
    });

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

  document.getElementById("modal-save").addEventListener("click", async () => {
    const text = taskInput.value.trim();
    if (!text) return;

    try {
      if (currentTaskType === "parent-only") {
        const newTask = await calendarApi.createParentTask(text);
        parentTasks.parentOnly.unshift(newTask);
      } else if (currentTaskType === "todo") {
        if (!currentStudentId) {
          alert("Please select a child first");
          return;
        }
        const newTask = await todoApi.createTodo(currentStudentId, "todo", text);
        parentTasks.todo.unshift(newTask);
      }

      renderAll();
      taskModal.classList.remove("show");
      currentTaskType = null;
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task");
    }
  });

  document
    .getElementById("edit-save")
    .addEventListener("click", saveEditedItem);

  document
    .getElementById("delete-confirm")
    .addEventListener("click", deleteItem);

  document.querySelectorAll(".modal-close, .modal-cancel").forEach((btn) => {
    btn.addEventListener("click", () => {
      deadlineModal.classList.remove("show");
      taskModal.classList.remove("show");
      editModal.classList.remove("show");
      deleteModal.classList.remove("show");
    });
  });

  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

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

  await ChildSelector.init();
  await loadData();

  ChildSelector.onChildChanged(() => {
    loadData();
  });
});
