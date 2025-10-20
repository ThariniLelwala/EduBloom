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

  // Calculate current folder depth - check for any role folder (student, parent, teacher, admin)
  const pathParts = currentPath.split("/");
  const roleFolders = ["student", "parent", "teacher", "admin"];
  let roleIndex = -1;
  let detectedRole = null;

  // Find which role folder we're in
  for (let folder of roleFolders) {
    roleIndex = pathParts.indexOf(folder);
    if (roleIndex !== -1) {
      detectedRole = folder;
      break;
    }
  }

  // Handle profile.html which is in root, not in role folder
  let depth = 0;
  if (roleIndex !== -1) {
    depth = pathParts.length - roleIndex - 2; // -2 because last is file, first is empty
  } else if (currentPage === "profile.html") {
    // Profile is in root, sidebar will be loaded from root too
    // Use userRole to determine which folder to go back to
    detectedRole = userRole;
    depth = -1; // Special marker for root level
  }

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
          if (depth === -1) {
            // Profile is at root level, so we need to go into dashboards/role/
            linkPath = "dashboards/" + detectedRole + "/" + item.link;
          } else {
            linkPath = "../".repeat(depth) + item.link;
          }
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
