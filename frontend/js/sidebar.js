document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("userRole") || "student";
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
  const currentPage = currentPath.split("/").pop();

  // Detect current folder (student / teacher / admin)
  const pathParts = currentPath.split("/");
  const roles = ["student", "teacher", "admin"];
  const roleIndex = pathParts.findIndex((p) => roles.includes(p));
  const depth = pathParts.length - roleIndex - 2; // -2 because folder + file

  // Load sidebar items from JSON
  fetch("/data/sidebar.json")
    .then((res) => res.json())
    .then((data) => {
      const items = data[userRole];

      items.forEach((item) => {
        const li = document.createElement("li");

        // Active page highlight
        if (currentPage === item.link.split("/").pop())
          li.classList.add("active");

        // Correct relative link calculation
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
