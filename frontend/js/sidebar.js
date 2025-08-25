document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("role") || "student";
  const container = document.getElementById("sidebar-container");

  // Inject sidebar HTML
  container.innerHTML = `
        <aside id="sidebar">
            <ul id="sidebar-list"></ul>
        </aside>
    `;

  const sidebarList = document.getElementById("sidebar-list");

  // Load sidebar items from JSON
  fetch("../../data/sidebar.json")
    .then((res) => res.json())
    .then((data) => {
      const items = data[userRole];
      const currentPage = window.location.pathname.split("/").pop();

      items.forEach((item) => {
        const li = document.createElement("li");
        if (currentPage === item.link) li.classList.add("active");

        li.innerHTML = `<i class="${item.icon}"></i> <span>${item.title}</span>`;
        li.addEventListener("click", () => (window.location.href = item.link));
        sidebarList.appendChild(li);
      });
    })
    .catch((err) => console.error("Sidebar load error:", err));

  // Toggle sidebar via topbar button
  const topbarToggle = document.getElementById("sidebar-toggle-topbar");
  topbarToggle.addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");
  });
});
