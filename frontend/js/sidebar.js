const ChildSelector = {
  children: [],
  selectedChild: null,
  listeners: [],

  async init() {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "parent") {
      return;
    }
    await this.fetchChildren();
    this.autoSelectFirstChild();
  },

  async fetchChildren() {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch("/api/parent/children", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const result = await res.json();
        this.children = result.children || [];
        localStorage.setItem("linkedChildren", JSON.stringify(this.children));
      }
    } catch (err) {
      console.error("Error fetching children:", err);
    }
  },

  autoSelectFirstChild() {
    const savedChildId = localStorage.getItem("selectedChildId");

    if (savedChildId) {
      const saved = this.children.find((c) => c.id === parseInt(savedChildId));
      if (saved) {
        this.selectedChild = saved;
        return;
      }
    }

    if (this.children.length > 0) {
      this.selectedChild = this.children[0];
      localStorage.setItem("selectedChildId", this.selectedChild.id);
    } else {
      this.selectedChild = null;
      localStorage.removeItem("selectedChildId");
    }
  },

  setSelectedChild(childId) {
    const child = this.children.find((c) => c.id === childId);
    if (child) {
      this.selectedChild = child;
      localStorage.setItem("selectedChildId", childId);
      this.notifyListeners();
    }
  },

  getSelectedChild() {
    return this.selectedChild;
  },

  getSelectedChildId() {
    return this.selectedChild ? this.selectedChild.id : null;
  },

  getChildren() {
    return this.children;
  },

  onChildChanged(callback) {
    this.listeners.push(callback);
  },

  notifyListeners() {
    this.listeners.forEach((cb) => cb(this.selectedChild));
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const userRole = localStorage.getItem("userRole") || "student";
  const studentType = localStorage.getItem("studentType");
  const container = document.getElementById("sidebar-container");

  if (!container) return;

  container.innerHTML = `
    <aside id="sidebar">
      <ul id="sidebar-list"></ul>
    </aside>
  `;

  const sidebarList = document.getElementById("sidebar-list");

  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop();

  const pathParts = currentPath.split("/");
  const roleFolders = ["student", "parent", "teacher", "admin"];
  let roleIndex = -1;
  let detectedRole = null;

  for (let folder of roleFolders) {
    roleIndex = pathParts.indexOf(folder);
    if (roleIndex !== -1) {
      detectedRole = folder;
      break;
    }
  }

  let depth = 0;
  if (roleIndex !== -1) {
    depth = pathParts.length - roleIndex - 2;
  } else if (currentPage === "profile.html") {
    detectedRole = userRole;
    depth = -1;
  }

  fetch("/data/sidebar.json")
    .then((res) => res.json())
    .then((data) => {
      let menuKey = userRole;

      if (userRole === "student" && studentType) {
        const specificKey = `student_${studentType}`;
        if (data[specificKey]) {
          menuKey = specificKey;
        }
      }

      const items = data[menuKey];

      if (!items) {
        return;
      }

      items.forEach((item) => {
        const li = document.createElement("li");

        const sidebarFileName = item.link.split("/").pop();
        const sidebarFolder = item.link.split("/")[0];
        const currentFolder = pathParts[pathParts.length - 2];

        const isActive =
          currentPage === sidebarFileName ||
          (currentFolder && sidebarFolder && currentFolder === sidebarFolder);

        if (isActive) li.classList.add("active");

        let linkPath = item.link;
        if (!linkPath.startsWith("/")) {
          if (depth === -1) {
            linkPath = "dashboards/" + detectedRole + "/" + item.link;
          } else {
            linkPath = "../".repeat(depth) + item.link;
          }
        }

        li.innerHTML = `<i class="${item.icon}"></i> <span>${item.title}</span>`;
        li.addEventListener("click", () => (window.location.href = linkPath));
        sidebarList.appendChild(li);
      });

      if (userRole === "parent") {
        ChildSelector.init().then(() => {
          renderSidebarChildSelector(sidebarList);
        });
      }
    });

  const topbarToggle = document.getElementById("sidebar-toggle-topbar");
  if (topbarToggle) {
    topbarToggle.addEventListener("click", () => {
      const sidebar = document.getElementById("sidebar");
      sidebar.classList.toggle("collapsed");
    });
  }
});

function renderSidebarChildSelector(sidebarList) {
  const children = ChildSelector.getChildren();
  const selectedChild = ChildSelector.getSelectedChild();

  const existingLi = document.getElementById("sidebar-child-selector");
  if (existingLi) {
    existingLi.remove();
  }

  const li = document.createElement("li");
  li.id = "sidebar-child-selector";
  li.className = "sidebar-child-item";
  li.style.display = "none";

  const select = document.createElement("select");
  select.className = "custom-select child-selector-select flex-layout";
  select.id = "child-selector";

  if (children.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.text = "No linked children";
    option.disabled = true;
    select.appendChild(option);
  } else {
    children.forEach((child) => {
      const option = document.createElement("option");
      option.value = child.id;
      option.text = child.username;
      option.dataset.type = child.student_type;
      if (selectedChild && selectedChild.id === child.id) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  li.appendChild(select);
  sidebarList.appendChild(li);

  initCustomSelects();

  const customSelect = document.querySelector(".child-selector-select");
  if (customSelect) {
    customSelect.addEventListener("change", (e) => {
      const childId = parseInt(e.target.value);
      ChildSelector.setSelectedChild(childId);
    });

    ChildSelector.onChildChanged(() => {
      const options = customSelect.options;
      for (let i = 0; i < options.length; i++) {
        options[i].selected = options[i].value == ChildSelector.getSelectedChildId();
      }
      customSelect.dispatchEvent(new Event("sync"));
    });

    li.style.display = "flex";
  }
}
