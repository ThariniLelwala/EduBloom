document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("userRole") || "student";
  const studentType = localStorage.getItem("studentType"); // Get student type for students
  const container = document.getElementById("sidebar-container");

  // Inject sidebar HTML
  container.innerHTML = `
    <aside id="sidebar">
      <ul id="sidebar-list"></ul>
    </aside>
  `;

  const sidebarList = document.getElementById("sidebar-list");

  // Get current page info
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop(); // e.g., "quiz.html"

  // Calculate current folder depth relative to "student" folder
  const pathParts = currentPath.split("/"); // ["", "student", "dashboard", "quiz", "quiz.html"]
  const studentIndex = pathParts.indexOf("student");
  const depth = pathParts.length - studentIndex - 2; // -2 because last is file, first is empty

  // Load sidebar items from JSON
  fetch("/data/sidebar.json")
    .then((res) => res.json())
    .then((data) => {
      // Determine which menu to use
      let menuKey = userRole;

      // For students, use student_type specific menu if available
      if (userRole === "student" && studentType) {
        const specificKey = `student_${studentType}`;
        if (data[specificKey]) {
          menuKey = specificKey;
        }
      }

      console.log("Loading sidebar for:", menuKey);
      const items = data[menuKey];

      if (!items) {
        console.error("Sidebar items not found for:", menuKey);
        return;
      }

      items.forEach((item) => {
        const li = document.createElement("li");

        // Active page highlight
        if (currentPage === item.link.split("/").pop())
          li.classList.add("active");

        // Calculate relative link
        let linkPath = item.link;
        if (!linkPath.startsWith("/")) {
          linkPath = "../".repeat(depth) + item.link;
        }

        li.innerHTML = `<i class="${item.icon}"></i> <span>${item.title}</span>`;
        li.addEventListener("click", () => (window.location.href = linkPath));
        sidebarList.appendChild(li);
      });
    })
    .catch((err) => console.error("Sidebar load error:", err));

  // Toggle sidebar via topbar button
  const topbarToggle = document.getElementById("sidebar-toggle-topbar");
  if (topbarToggle) {
    topbarToggle.addEventListener("click", () => {
      const sidebar = document.getElementById("sidebar");
      sidebar.classList.toggle("collapsed");
    });
  }
});
