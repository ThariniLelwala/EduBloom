document.addEventListener("DOMContentLoaded", async () => {
  const monthYear = document.getElementById("monthYear");
  const calendarDays = document.getElementById("calendarDays");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const eventsList = document.getElementById("events-list");

  // ===== Data State =====
  let currentDate = new Date();
  let events = []; // Unified event list
  let pomodoroStats = {}; // Map of "YYYY-MM-DD" -> total hours

  // ===== Modals =====
  const deadlineModal = document.getElementById("deadline-modal");
  const deadlineInput = document.getElementById("deadline-input");
  const deadlineDate = document.getElementById("deadline-date");
  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");
  const editDate = document.getElementById("edit-date");
  const deleteModal = document.getElementById("delete-modal");

  // ===== Fetch Data =====
  async function loadData() {
    try {
      // 1. Fetch Student Todos
      const todoData = await studentTodoApi.getTodos();
      const studentTodos = (todoData.todos || [])
        .filter((t) => t.type === "todo" && t.expires_at)
        .map((t) => ({
          id: t.id,
          title: t.text,
          date: t.expires_at,
          type: "todo",
          original: t,
        }));

      // 2. Fetch Parent Todos
      const parentTodosData = await studentTodoApi.getParentTodos();
      const parentTodos = (parentTodosData.todos || [])
        .filter((t) => t.type === "todo" && t.expires_at)
        .map((t) => ({
          id: t.id,
          title: t.text,
          date: t.expires_at,
          type: "parent-todo",
          original: t,
        }));

      // 3. Fetch Pomodoro Sessions
      const pomodoroData = await studentPomodoroApi.getSessions(100);
      const sessions = pomodoroData.sessions || [];

      // Process Pomodoro Data (Sessions become events + stats)
      const pomodoroEvents = sessions.map((s) => ({
        id: s.id,
        title: `Pomodoro: ${s.mode}`,
        date: s.start_time,
        type: "pomodoro",
        duration: s.duration_minutes || 0,
        original: s,
      }));

      // Calculate Pomodoro Stats (Hours per day)
      pomodoroStats = {};
      sessions.forEach((s) => {
        if (s.status === "completed" && s.duration_minutes > 0) {
            const dateKey = new Date(s.start_time).toDateString();
            if (!pomodoroStats[dateKey]) pomodoroStats[dateKey] = 0;
            pomodoroStats[dateKey] += s.duration_minutes;
        }
      });

      // Merge all events
      events = [...studentTodos, ...parentTodos, ...pomodoroEvents];
      
      renderAll();
    } catch (err) {
      console.error("Error loading calendar data:", err);
    }
  }

  function renderAll() {
    renderCalendar(currentDate);
    renderUpcomingEvents();
  }

  function renderUpcomingEvents() {
    eventsList.innerHTML = "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter for future events only (excluding past pomodoros for the list view)
    const upcoming = events
      .filter((e) => {
        const d = new Date(e.date);
        return d >= today && e.type !== 'pomodoro'; // Don't show past pomodoro sessions in "Upcoming"
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10); // Show max 10

    if (!upcoming.length) {
      eventsList.innerHTML = "<p>No upcoming events</p>";
      return;
    }

    upcoming.forEach((event, index) => { // Index here isn't safe for editing/deleting if filtered
      const eventDate = new Date(event.date);

      const wrapper = document.createElement("li");
      wrapper.classList.add("event-tile");
      
      // Set border left color based on type
      if (event.type === 'parent-todo') {
          wrapper.style.borderLeft = "4px solid #ef4444";
          wrapper.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5), -2px 0 8px rgba(239, 68, 68, 0.4)";
      } else {
          wrapper.style.borderLeft = "4px solid #3b82f6";
          wrapper.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5), -2px 0 8px rgba(59, 130, 246, 0.4)";
      }
      wrapper.style.background = "rgba(0, 0, 0, 0.4)"; // Darker background for contrast

      const title = document.createElement("div");
      title.classList.add("event-title");
      title.textContent = event.title;

      const footer = document.createElement("div");
      footer.style.display = "flex";
      footer.style.justifyContent = "space-between";
      footer.style.alignItems = "center";
      footer.style.marginTop = "6px";

      const dateBadge = document.createElement("span");
      dateBadge.classList.add("event-date");
      dateBadge.textContent = eventDate.toDateString();

      const actions = document.createElement("div");
      actions.className = "task-item-actions";

      // Only allow edit/delete for student todos
      if (event.type === 'todo') {
        const editBtn = document.createElement("i");
        editBtn.className = "fa fa-pencil";
        // Find original index in valid scope or pass ID
        editBtn.addEventListener("click", () => openEditModal(event));

        const deleteBtn = document.createElement("i");
        deleteBtn.className = "fa fa-trash";
        deleteBtn.addEventListener("click", () => openDeleteModal(event));

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
      }

      footer.appendChild(dateBadge);
      footer.appendChild(actions);
      wrapper.appendChild(title);
      wrapper.appendChild(footer);

      eventsList.appendChild(wrapper);
    });
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

    // Previous month placeholders
    for (let i = firstDay; i > 0; i--) {
      const div = document.createElement("div");
      div.classList.add("calendar-date", "inactive");
      div.innerHTML = `<span class="calendar-date-number">${prevLastDate - i + 1}</span>`;
      calendarDays.appendChild(div);
    }

    // Current month
    for (let i = 1; i <= lastDate; i++) {
      const div = document.createElement("div");
      div.classList.add("calendar-date");

      // Date number
      const numberSpan = document.createElement("span");
      numberSpan.classList.add("calendar-date-number");
      numberSpan.textContent = i;
      div.appendChild(numberSpan);

      const thisDateObj = new Date(year, month, i);
      const thisDateStr = thisDateObj.toDateString();
      
      const today = new Date();
      if (
        i === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      )
        div.classList.add("today");

      // Indicators Container
      const indicatorsDiv = document.createElement("div");
      indicatorsDiv.classList.add("event-indicators");

      // Find events for this day
      const daysEvents = events.filter(e => new Date(e.date).toDateString() === thisDateStr);
      
      // Limit dots to avoid overflow
      daysEvents.slice(0, 4).forEach(e => {
          const dot = document.createElement("span");
          dot.classList.add("event-dot", e.type);
          dot.title = e.title;
          indicatorsDiv.appendChild(dot);
      });
      
      div.appendChild(indicatorsDiv);

      // Pomodoro Stats
      if (pomodoroStats[thisDateStr]) {
          const minutes = pomodoroStats[thisDateStr];
          const hours = (minutes / 60).toFixed(1);
          if (parseFloat(hours) > 0) {
            const statDiv = document.createElement("div");
            statDiv.classList.add("pomodoro-stat");
            statDiv.textContent = `${hours}h`;
            div.appendChild(statDiv);
          }
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
        div.innerHTML = `<span class="calendar-date-number">${i}</span>`;
        calendarDays.appendChild(div);
      }
    }
  }

  // ===== Add Todo (Event) =====
  // Reuse existing modal but connect to API
  document.querySelectorAll(".add-deadline-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      deadlineInput.value = "";
      deadlineDate.value = "";
      
      // Set min date to today
      const today = new Date().toISOString().split("T")[0];
      deadlineDate.setAttribute("min", today);
      
      deadlineModal.classList.add("show");
    });
  });

  document
    .getElementById("modal-save-deadline")
    .addEventListener("click", async () => {
      if (!deadlineInput.value || !deadlineDate.value) return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(deadlineDate.value);
      if (selectedDate < today) {
        alert("Event date cannot be in the past");
        return;
      }
      
      try {
          // Pass the deadline date to the API
          await studentTodoApi.createTodo("todo", deadlineInput.value, deadlineDate.value);
          await loadData();
          deadlineModal.classList.remove("show");
      } catch(err) {
          console.error("Error creating event:", err);
          alert("Failed to create event: " + err.message);
      }
    });

  // ===== Edit / Delete =====
  // These now need to work with IDs, not indices since we have mixed types
  let currentEditEvent = null;
  let currentDeleteEvent = null;

  function openEditModal(event) {
    currentEditEvent = event;
    editInput.value = event.title;
    // Format date for input: YYYY-MM-DD
    const d = new Date(event.date);
    const day = ("0" + d.getDate()).slice(-2);
    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    editInput.value = event.title;
    editDate.value = `${d.getFullYear()}-${month}-${day}`;
    
    // Set min date to today
    const today = new Date().toISOString().split("T")[0];
    editDate.setAttribute("min", today);
    
    editModal.classList.add("show");
  }

  function openDeleteModal(event) {
    currentDeleteEvent = event;
    deleteModal.classList.add("show");
  }

  document.getElementById("edit-save").addEventListener("click", async () => {
    if (!currentEditEvent) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(editDate.value);
    if (selectedDate < today) {
      alert("Event date cannot be in the past");
      return;
    }
    
    try {
        await studentTodoApi.updateTodo(currentEditEvent.id, { 
            text: editInput.value,
            expiresAt: editDate.value
        });
        await loadData();
        editModal.classList.remove("show");
        currentEditEvent = null;
    } catch(err) {
        console.error("Error updating event:", err);
        alert("Failed to update event: " + err.message);
    }
  });

  document.getElementById("delete-confirm").addEventListener("click", async () => {
    if (currentDeleteEvent) {
      try {
          await studentTodoApi.deleteTodo(currentDeleteEvent.id);
          await loadData();
      } catch(err) {
          console.error("Error deleting event:", err);
          alert("Failed to delete event: " + err.message);
      }
    }
    deleteModal.classList.remove("show");
    currentDeleteEvent = null;
  });

  document.querySelectorAll(".modal-close, .modal-cancel").forEach((btn) => {
    btn.addEventListener("click", () => {
      deadlineModal.classList.remove("show");
      editModal.classList.remove("show");
      deleteModal.classList.remove("show");
    });
  });

  // ===== Month navigation =====
  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  await loadData();
});
