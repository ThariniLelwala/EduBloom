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

  // Calculate depth - how many "../" we need to go back to reach the role folder
  let depth = 0;
  if (roleIndex !== -1) {
    // Count how many folders deep we are from the role folder
    // pathParts: ["", "dashboards", "student", "quiz", "quiz.html"]
    // roleIndex: 2 (index of "student")
    // depth = 5 - 2 - 2 = 1 (we need 1 "../" to get back to /dashboards/student/)
    depth = pathParts.length - roleIndex - 2;
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
        // Check both direct filename match and parent folder match
        const sidebarFileName = item.link.split("/").pop();
        const sidebarFolder = item.link.split("/")[0]; // e.g., "quiz", "modulespace"
        const currentFolder = pathParts[pathParts.length - 2]; // e.g., "quiz", "modulespace"

        const isActive =
          currentPage === sidebarFileName || // Direct match
          (currentFolder && sidebarFolder && currentFolder === sidebarFolder); // Folder match

        if (isActive) li.classList.add("active");

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

        console.log(
          `[Sidebar] Current: ${currentPage}, Depth: ${depth}, Item: ${item.title}, Link: ${linkPath}`
        );
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
