document.addEventListener("DOMContentLoaded", () => {
  const postsContainer = document.getElementById("posts-container");
  const addBtn = document.getElementById("add-post-btn");
  const modal = document.getElementById("post-modal");
  const closeBtn = modal.querySelector(".close");
  const cancelBtn = document.getElementById("cancel-post-btn");
  const saveBtn = document.getElementById("save-post-btn");
  const titleInput = document.getElementById("post-title-input");
  const contentInput = document.getElementById("post-content-input");
  const modalTitle = document.getElementById("modal-title");

  let posts = JSON.parse(localStorage.getItem("posts") || "[]");
  let editIndex = -1;

  function renderPosts() {
    postsContainer.innerHTML = "";
    if (!posts.length) {
      postsContainer.innerHTML = `<div class="empty">No posts yet. Click "Add Post" to create one.</div>`;
      return;
    }
    posts.forEach((post, i) => {
      const div = document.createElement("div");
      div.className = "post-card";
      div.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <div class="post-actions">
          <button class="edit" data-index="${i}">Edit</button>
          <button class="delete" data-index="${i}">Delete</button>
        </div>
      `;
      postsContainer.appendChild(div);
    });

    postsContainer.querySelectorAll(".edit").forEach(btn => {
      btn.addEventListener("click", e => openModal(Number(e.currentTarget.dataset.index)));
    });
    postsContainer.querySelectorAll(".delete").forEach(btn => {
      btn.addEventListener("click", e => {
        const idx = Number(e.currentTarget.dataset.index);
        if (confirm("Delete this post?")) {
          posts.splice(idx, 1);
          localStorage.setItem("posts", JSON.stringify(posts));
          renderPosts();
        }
      });
    });
  }

  function openModal(idx = -1) {
    editIndex = idx;
    if (idx >= 0) {
      titleInput.value = posts[idx].title;
      contentInput.value = posts[idx].content;
      modalTitle.textContent = "Edit Post";
    } else {
      titleInput.value = "";
      contentInput.value = "";
      modalTitle.textContent = "Add New Post";
    }
    modal.style.display = "flex";
  }

  function closeModal() {
    modal.style.display = "none";
  }

  addBtn.addEventListener("click", () => openModal());
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  saveBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    if (!title || !content) return alert("Enter both title and content!");

    if (editIndex >= 0) {
      posts[editIndex] = { title, content };
    } else {
      posts.push({ title, content });
    }
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
    closeModal();
  });

  window.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  renderPosts();
});
