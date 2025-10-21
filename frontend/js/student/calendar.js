document.addEventListener("DOMContentLoaded", async () => {
  const monthYear = document.getElementById("monthYear");
  const calendarDays = document.getElementById("calendarDays");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const eventsList = document.getElementById("events-list");

  let currentDate = new Date();
  let deadlines = [];
  let importantDays = [];
  let editContext = null;
  let deleteContext = null;

  // ===== Modals =====
  const deadlineModal = document.getElementById("deadline-modal");
  const deadlineInput = document.getElementById("deadline-input");
  const deadlineDate = document.getElementById("deadline-date");
  const editModal = document.getElementById("edit-modal");
  const editInput = document.getElementById("edit-input");
  const editDate = document.getElementById("edit-date");
  const deleteModal = document.getElementById("delete-modal");

  // Load deadlines
  async function loadDeadlines() {
    try {
      const res = await fetch("../../data/tasks.json");
      if (!res.ok) throw new Error("Failed to load tasks.json");
      const data = await res.json();
      deadlines = data.deadlines || [];
      loadImportantDays();
      renderAll();
    } catch (err) {
      console.error(err);
      loadImportantDays();
      renderAll();
    }
  }

  // Load important days
  function loadImportantDays() {
    const saved = localStorage.getItem("importantDays");
    if (saved) {
      importantDays = JSON.parse(saved);
    } else {
      // Default important days
      importantDays = [
        {
          id: 1,
          title: "Summer Break",
          detail: "School holidays begin",
          date: "2025-07-01",
          type: "holiday",
          icon: "calendar",
        },
        {
          id: 2,
          title: "Final Exams",
          detail: "Mathematics & Science",
          date: "2025-06-15",
          type: "exam",
          icon: "graduation-cap",
        },
        {
          id: 3,
          title: "Parent-Teacher Meeting",
          detail: "Discuss progress",
          date: "2025-06-25",
          type: "event",
          icon: "users",
        },
      ];
      localStorage.setItem("importantDays", JSON.stringify(importantDays));
    }
  }

  function renderAll() {
    renderCalendar(currentDate);
    renderDeadlines();
    renderImportantDays();
  }

  function renderImportantDays() {
    const container = document.querySelector(".important-days-container");
    if (!container) return;

    container.innerHTML = "";

    // Sort by date and show upcoming ones
    const today = new Date();
    const upcomingDays = importantDays
      .filter((day) => new Date(day.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3); // Show only next 3 important days

    if (upcomingDays.length === 0) {
      container.innerHTML =
        '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 20px;">No upcoming important days</p>';
      return;
    }

    upcomingDays.forEach((day) => {
      const dayElement = document.createElement("div");
      dayElement.className = `important-day-item ${day.type}`;

      const dateObj = new Date(day.date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      dayElement.innerHTML = `
        <div class="day-info">
          <span class="day-title">${day.title}</span>
          <span class="day-detail">${day.detail}</span>
        </div>
        <div class="day-date">
          <i class="fas fa-${day.icon}"></i>
          <span>${formattedDate}</span>
        </div>
      `;

      container.appendChild(dayElement);
    });
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
      eventsList.innerHTML = "<p>No upcoming events</p>";
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
      editBtn.addEventListener("click", () => openEditModal(index));

      const deleteBtn = document.createElement("i");
      deleteBtn.className = "fa fa-trash";
      deleteBtn.addEventListener("click", () => openDeleteModal(index));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

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
      if (deadlines.some((dl) => new Date(dl.date).toDateString() === thisDate))
        div.classList.add("deadline");

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

  // ===== Add deadline =====
  document.querySelectorAll(".add-deadline-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      deadlineInput.value = "";
      deadlineDate.value = "";
      deadlineModal.classList.add("show");
    });
  });

  document
    .getElementById("modal-save-deadline")
    .addEventListener("click", () => {
      if (!deadlineInput.value || !deadlineDate.value) return;
      deadlines.push({ title: deadlineInput.value, date: deadlineDate.value });
      renderAll();
      deadlineModal.classList.remove("show");
    });

  // ===== Edit / Delete =====
  function openEditModal(index) {
    editContext = index;
    editInput.value = deadlines[index].title;
    editDate.value = deadlines[index].date;
    editModal.classList.add("show");
  }

  function openDeleteModal(index) {
    deleteContext = index;
    deleteModal.classList.add("show");
  }

  document.getElementById("edit-save").addEventListener("click", () => {
    if (editContext === null) return;
    deadlines[editContext].title = editInput.value;
    deadlines[editContext].date = editDate.value;
    renderAll();
    editModal.classList.remove("show");
    editContext = null;
  });

  document.getElementById("delete-confirm").addEventListener("click", () => {
    if (deleteContext !== null) {
      deadlines.splice(deleteContext, 1);
      renderAll();
    }
    deleteModal.classList.remove("show");
    deleteContext = null;
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

  await loadDeadlines();
});

// Add important day function
function addImportantDay() {
  const title = prompt("Enter important day title:");
  if (!title) return;

  const detail = prompt("Enter details:");
  if (!detail) return;

  const date = prompt("Enter date (YYYY-MM-DD):");
  if (!date) return;

  const type = prompt("Enter type (holiday, exam, event):");
  if (!type || !["holiday", "exam", "event"].includes(type)) {
    alert("Please enter a valid type: holiday, exam, or event");
    return;
  }

  const icon =
    type === "holiday"
      ? "calendar"
      : type === "exam"
      ? "graduation-cap"
      : "users";

  const newDay = {
    id: Date.now(),
    title: title,
    detail: detail,
    date: date,
    type: type,
    icon: icon,
  };

  importantDays.push(newDay);
  localStorage.setItem("importantDays", JSON.stringify(importantDays));
  renderImportantDays();
}
