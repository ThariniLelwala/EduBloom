document.addEventListener("DOMContentLoaded", () => {
  const forumList = document.getElementById("forumList");
  const addBtn = document.getElementById("addForum");
  const titleInput = document.getElementById("forumTitle");
  const descInput = document.getElementById("forumDesc");

  let forums = JSON.parse(localStorage.getItem("teacherForums")) || [];

  function saveForums() {
    localStorage.setItem("teacherForums", JSON.stringify(forums));
  }

  function renderForums() {
    forumList.innerHTML = "";
    forums.forEach((forum, index) => {
      const div = document.createElement("div");
      div.className = "forum-item";
      div.innerHTML = `
        <div>
          <h3>${forum.title}</h3>
          <p>${forum.description}</p>
        </div>
        <div class="forum-actions">
          <button class="edit"><i class="fas fa-edit"></i></button>
          <button class="delete"><i class="fas fa-trash"></i></button>
        </div>
      `;

      // Edit
      div.querySelector(".edit").addEventListener("click", () => {
        const newTitle = prompt("Edit Forum Title:", forum.title);
        const newDesc = prompt("Edit Description:", forum.description);
        if (newTitle && newDesc) {
          forums[index].title = newTitle;
          forums[index].description = newDesc;
          saveForums();
          renderForums();
        }
      });

      // Delete
      div.querySelector(".delete").addEventListener("click", () => {
        if (confirm(`Delete forum "${forum.title}"?`)) {
          forums.splice(index, 1);
          saveForums();
          renderForums();
        }
      });

      forumList.appendChild(div);
    });
  }

  addBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    if (!title || !description) {
      alert("Please fill in both title and description!");
      return;
    }

    forums.push({ title, description });
    saveForums();
    renderForums();
    titleInput.value = "";
    descInput.value = "";
  });

  renderForums();
});
