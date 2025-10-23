  document.addEventListener("DOMContentLoaded", () => {
    const userTableBody = document.querySelector("#userTable tbody");
    const searchInput = document.getElementById("searchInput");
    const roleFilter = document.getElementById("roleFilter");
    const statusFilter = document.getElementById("statusFilter");
    const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");

    // Sample data
    let users = [
      { id: 1, name: "John Doe", email: "john@example.com", role: "student", status: "active" },
      { id: 2, name: "Sarah Smith", email: "sarah@example.com", role: "moderator", status: "active" },
      { id: 3, name: "David Lee", email: "david@example.com", role: "user", status: "suspended" },
      { id: 4, name: "Emma Watson", email: "emma@example.com", role: "student", status: "active" },
      { id: 5, name: "Robert Brown", email: "robert@example.com", role: "moderator", status: "suspended" }
    ];

    // Function to render table rows
    function renderTable(data) {
      userTableBody.innerHTML = "";
      data.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><input type="checkbox" class="selectUser" data-id="${user.id}" /></td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${capitalize(user.role)}</td>
          <td class="${user.status === 'active' ? 'text-success' : 'text-danger'}">${capitalize(user.status)}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-small btn-view" data-id="${user.id}">
                <i class="fas fa-eye"></i> View
              </button>
              <button class="btn-small btn-update" data-id="${user.id}">
                <i class="fas fa-pen"></i> Update
              </button>
              <button class="btn-small btn-delete" data-id="${user.id}">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </td>
        `;
        userTableBody.appendChild(row);
      });
    }

    // Helper
    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Initial render
    renderTable(users);

    // ---- Search ----
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm)
      );
      renderTable(filtered);
    });

    // ---- Filters ----
    function applyFilters() {
      const roleVal = roleFilter.value;
      const statusVal = statusFilter.value;

      const filtered = users.filter(user => {
        return (
          (roleVal === "" || user.role === roleVal) &&
          (statusVal === "" || user.status === statusVal)
        );
      });
      renderTable(filtered);
    }

    roleFilter.addEventListener("change", applyFilters);
    statusFilter.addEventListener("change", applyFilters);

    // ---- Add User (dummy) ----
    document.querySelector(".btn-primary").addEventListener("click", () => {
      const newId = users.length + 1;
      const newUser = {
        id: newId,
        name: "New User " + newId,
        email: `newuser${newId}@example.com`,
        role: "student",
        status: "active"
      };
      users.push(newUser);
      renderTable(users);
      alert("New user added!");
    });

    // ---- Row Actions ----
    userTableBody.addEventListener("click", e => {
      if (e.target.closest(".btn-view")) {
        const id = e.target.closest(".btn-view").dataset.id;
        const user = users.find(u => u.id == id);
        alert(`Viewing ${user.name}\nEmail: ${user.email}`);
      }

      if (e.target.closest(".btn-update")) {
        const id = e.target.closest(".btn-update").dataset.id;
        const user = users.find(u => u.id == id);
        const newName = prompt("Edit name:", user.name);
        if (newName) user.name = newName;
        renderTable(users);
      }

      if (e.target.closest(".btn-delete")) {
        const id = e.target.closest(".btn-delete").dataset.id;
        users = users.filter(u => u.id != id);
        renderTable(users);
      }
    });

    // ---- Bulk Delete ----
    bulkDeleteBtn.addEventListener("click", () => {
      const selected = [...document.querySelectorAll(".selectUser:checked")].map(cb => parseInt(cb.dataset.id));
      if (selected.length === 0) {
        alert("Please select users to delete.");
        return;
      }
      if (confirm(`Delete ${selected.length} selected user(s)?`)) {
        users = users.filter(u => !selected.includes(u.id));
        renderTable(users);
      }
    });
  });

  // ---- Select All ----
  document.addEventListener("change", (e) => {
    if (e.target.id === "selectAll") {
      const checkboxes = document.querySelectorAll(".selectUser");
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    }
  });
