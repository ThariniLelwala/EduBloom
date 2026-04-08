// Teacher Forum - Combined JavaScript
// Works across three HTML pages: forums.html, forum/forum.html, forum/forum-view.html

const authToken = localStorage.getItem("authToken");
let currentForumId = null;
let currentTags = [];
let currentEditTags = [];
let currentFilter = "all";
let allMyForums = [];
let allOtherForums = [];
let selectedTags = [];

// ─── Page Detection & Initialization ───────────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  const isMainPage = !!document.getElementById("forums-container");
  const isManagePage = !!document.getElementById("create-forum-btn");
  const isBrowsePage = !!document.getElementById("forum-search");

  if (isMainPage) initMainPage();
  if (isManagePage) initManagePage();
  if (isBrowsePage) initBrowsePage();

  bindSharedEvents();
});

// ─── HTML onclick Wrappers ─────────────────────────────────────────────────
// These bridge the onclick="" attributes in forum.html and forum-view.html
// to the correct page-specific functions in this combined file.

function closeForumModal() {
  closeDetailModal();
}

function addReply() {
  if (document.getElementById("forum-search")) {
    addBrowseReply();
  } else {
    addManageReply();
  }
}

function editForum() {
  if (document.getElementById("forum-search")) {
    editBrowseForum();
  } else {
    editManageForum();
  }
}

function saveForumEdit() {
  if (document.getElementById("forum-search")) {
    saveBrowseForumEdit();
  } else {
    saveManageForumEdit();
  }
}

// ─── Shared Utilities ──────────────────────────────────────────────────────

function formatDate(dateString) {
  if (!dateString) return "Date unknown";
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return diffDays + " days ago";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function showNotification(message, type) {
  var notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText =
    "position:fixed;top:20px;right:20px;padding:12px 20px;border-radius:8px;font-weight:500;z-index:1000;color:white;animation:slideIn 0.3s ease;";
  notification.style.background =
    type === "error"
      ? "rgba(239,68,68,0.9)"
      : type === "success"
      ? "rgba(34,197,94,0.9)"
      : "rgba(74,222,128,0.9)";
  document.body.appendChild(notification);
  setTimeout(function () {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(function () {
      if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, 300);
  }, 3000);
}

function closeDetailModal() {
  var modal = document.getElementById("forum-detail-modal");
  if (modal) modal.classList.remove("show");
  cancelEdit();
  currentForumId = null;
}

function cancelEdit() {
  var content = document.getElementById("forum-content");
  var actions = document.getElementById("forum-actions");
  var edit = document.getElementById("forum-edit");
  if (content) content.style.display = "block";
  if (actions) actions.style.display = "block";
  if (edit) edit.style.display = "none";
}

// ─── API Helpers ───────────────────────────────────────────────────────────

function apiGet(url) {
  return fetch(url, {
    headers: { Authorization: "Bearer " + authToken },
  }).then(function (r) {
    if (!r.ok) throw new Error("Failed: " + r.status);
    return r.json();
  });
}

function apiPost(url, body) {
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + authToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then(function (r) {
    if (!r.ok) throw new Error("Failed: " + r.status);
    return r.json();
  });
}

function apiPut(url, body) {
  return fetch(url, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + authToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then(function (r) {
    if (!r.ok) throw new Error("Failed: " + r.status);
    return r.json();
  });
}

function apiDelete(url) {
  return fetch(url, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + authToken },
  }).then(function (r) {
    if (!r.ok) throw new Error("Failed: " + r.status);
    return r.json();
  });
}

// ─── Page 1: Main Forums (forums.html) ─────────────────────────────────────

function initMainPage() {
  loadMainForums();
  loadMainTags();
}

function loadMainForums() {
  apiGet("/api/teacher/forums")
    .then(displayMainForums)
    .catch(function (e) {
      console.error("Error loading forums:", e);
      displayMainForums([]);
    });
}

function displayMainForums(forums) {
  var container = document.getElementById("forums-container");
  if (!container) return;

  if (!forums || forums.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fas fa-users"></i><h3>No Discussions Yet</h3><p>Be the first to start a discussion topic!</p>' +
      '<button class="btn-primary" onclick="document.getElementById(\'create-post-btn\').click()">Start Discussion</button></div>';
    return;
  }

  container.innerHTML = "";
  forums.forEach(function (forum) {
    var card = document.createElement("div");
    card.className = "forum-card";
    card.innerHTML =
      '<div class="forum-header"><div class="forum-meta"><span class="forum-author">' +
      (forum.author || "Teacher") +
      '</span><span class="forum-date">' +
      formatDate(forum.created_at) +
      '</span></div><div class="forum-stats"><span><i class="fas fa-eye"></i> ' +
      (forum.views || 0) +
      '</span><span><i class="fas fa-reply"></i> ' +
      (forum.reply_count || 0) +
      "</span></div></div>" +
      '<div class="forum-title">' +
      forum.title +
      '</div><div class="forum-description">' +
      forum.description +
      '</div><div class="forum-tags">' +
      (forum.tags || [])
        .map(function (t) {
          return '<span class="tag">' + t + "</span>";
        })
        .join("") +
      '</div><div class="forum-actions"><button class="btn-secondary view-forum-btn" data-forum-id="' +
      forum.id +
      '"><i class="fas fa-eye"></i> View Discussion</button></div>';

    card.querySelector(".view-forum-btn").addEventListener("click", function () {
      viewMainForum(forum.id);
    });
    container.appendChild(card);
  });
}

function loadMainTags() {
  apiGet("/api/teacher/forums/tags")
    .then(function (tags) {
      var filterTags = document.querySelector(".filter-tags");
      if (!filterTags) return;
      var allBtn = filterTags.querySelector("[data-tag='all']");
      filterTags.innerHTML = "";
      if (allBtn) filterTags.appendChild(allBtn);
      tags.slice(0, 5).forEach(function (tag) {
        var btn = document.createElement("button");
        btn.className = "filter-tag";
        btn.textContent = tag;
        btn.dataset.tag = tag;
        btn.addEventListener("click", function () {
          filterMainByTag(tag);
        });
        filterTags.appendChild(btn);
      });
    })
    .catch(function (e) {
      console.error("Error loading tags:", e);
    });
}

function filterMainByTag(tag) {
  var buttons = document.querySelectorAll(".filter-tag");
  buttons.forEach(function (btn) {
    btn.classList.remove("active");
  });
  var target = document.querySelector("[data-tag='" + tag + "']");
  if (target) target.classList.add("active");

  apiGet("/api/teacher/forums")
    .then(function (forums) {
      if (tag === "all") {
        displayMainForums(forums);
      } else {
        displayMainForums(
          forums.filter(function (f) {
            return (f.tags || []).includes(tag);
          })
        );
      }
    })
    .catch(function (e) {
      console.error("Error filtering:", e);
    });
}

function searchMainForums(query) {
  apiGet("/api/teacher/forums")
    .then(function (forums) {
      var q = query.toLowerCase();
      displayMainForums(
        forums.filter(function (f) {
          return (
            f.title.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q) ||
            (f.tags || []).some(function (t) {
              return t.toLowerCase().includes(q);
            })
          );
        })
      );
    })
    .catch(function (e) {
      console.error("Error searching:", e);
    });
}

function viewMainForum(forumId) {
  apiGet("/api/teacher/forums/" + forumId)
    .then(function (forum) {
      currentForumId = forumId;

      // Increment views in background
      apiPost("/api/teacher/forums/" + forumId + "/view", {}).catch(function () {});

      document.getElementById("forum-detail-title").textContent = forum.title;
      var content = document.getElementById("forum-detail-content");
      var replies = forum.replies || [];

      content.innerHTML =
        '<div class="original-post"><div class="post-header"><span class="post-author">' +
        (forum.author || "Teacher") +
        '</span><span class="post-date">' +
        formatDate(forum.created_at) +
        '</span></div><div class="post-content">' +
        forum.description +
        '</div><div class="post-tags">' +
        (forum.tags || [])
          .map(function (t) {
            return '<span class="tag">' + t + "</span>";
          })
          .join("") +
        '</div></div><div class="replies-section"><h3>Replies (' +
        replies.length +
        ')</h3><div class="replies-list">' +
        (replies.length === 0
          ? '<p class="no-replies">No replies yet. Be the first to respond!</p>'
          : replies
              .map(function (r) {
                return (
                  '<div class="reply-item"><div class="reply-header"><span class="reply-author">' +
                  r.author +
                  '</span><span class="reply-date">' +
                  formatDate(r.created_at) +
                  '</span></div><div class="reply-content">' +
                  r.content +
                  "</div></div>"
                );
              })
              .join("")) +
        "</div></div>";

      document.getElementById("forum-detail-modal").classList.add("show");
    })
    .catch(function (e) {
      console.error("Error loading forum:", e);
      alert("Could not load forum details.");
    });
}

function createMainPost() {
  var title = document.getElementById("post-title").value.trim();
  var body = document.getElementById("post-content").value.trim();

  if (!title || !body) {
    alert("Please fill in both title and content.");
    return;
  }
  if (selectedTags.length === 0) {
    alert("Please select at least one tag.");
    return;
  }

  apiPost("/api/teacher/forums/create", {
    title: title,
    description: body,
    tags: selectedTags.slice(),
    published: true,
  })
    .then(function () {
      document.getElementById("post-modal").classList.remove("show");
      resetMainPostModal();
      loadMainForums();
      loadMainTags();
    })
    .catch(function (e) {
      console.error("Error creating post:", e);
      alert("Error creating post. Please try again.");
    });
}

function submitMainReply() {
  var content = document.getElementById("reply-content").value.trim();
  if (!content) {
    alert("Please enter a reply.");
    return;
  }

  apiPost("/api/teacher/forums/" + currentForumId + "/replies", {
    content: content,
  })
    .then(function () {
      viewMainForum(currentForumId);
      document.getElementById("reply-content").value = "";
      loadMainForums();
    })
    .catch(function (e) {
      console.error("Error posting reply:", e);
      alert("Error posting reply. Please try again.");
    });
}

function loadMainTagsForSelection() {
  apiGet("/api/teacher/forums/tags")
    .then(function (tags) {
      var container = document.querySelector(".tags-selection");
      if (!container) return;
      container.innerHTML = "";

      if (tags.length === 0) {
        var defaults = ["General", "Question", "Resource"];
        defaults.forEach(function (tag) {
          addSelectableTag(container, tag);
        });
        return;
      }

      tags.forEach(function (tag) {
        addSelectableTag(container, tag);
      });
    })
    .catch(function (e) {
      console.error("Error loading tags:", e);
    });
}

function addSelectableTag(container, tag) {
  var el = document.createElement("span");
  el.className = "selectable-tag";
  el.textContent = tag;
  el.addEventListener("click", function () {
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter(function (t) {
        return t !== tag;
      });
      el.classList.remove("selected");
    } else {
      selectedTags.push(tag);
      el.classList.add("selected");
    }
  });
  container.appendChild(el);
}

function resetMainPostModal() {
  var titleEl = document.getElementById("post-title");
  var contentEl = document.getElementById("post-content");
  if (titleEl) titleEl.value = "";
  if (contentEl) contentEl.value = "";
  selectedTags = [];
  document.querySelectorAll(".selectable-tag").forEach(function (el) {
    el.classList.remove("selected");
  });
}

// ─── Page 2: Forum Management (forum/forum.html) ───────────────────────────

function initManagePage() {
  loadManageForums();
  loadManageCategories();
  loadManageStats();
}

function loadManageForums() {
  apiGet("/api/teacher/forums/my")
    .then(function (forums) {
      var filtered = forums;
      if (currentFilter === "published")
        filtered = forums.filter(function (f) {
          return f.published && !f.archived;
        });
      else if (currentFilter === "draft")
        filtered = forums.filter(function (f) {
          return !f.published && !f.archived;
        });
      else if (currentFilter === "archived")
        filtered = forums.filter(function (f) {
          return f.archived;
        });

      var container = document.getElementById("my-forums");
      if (!container) return;

      if (filtered.length === 0) {
        container.innerHTML =
          '<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.6);"><i class="fas fa-comments" style="font-size:48px;margin-bottom:16px;opacity:0.5;"></i><p>No forums found</p><small>' +
          (currentFilter === "all"
            ? "Create your first forum to start discussions with students"
            : "No " + currentFilter + " forums") +
          "</small></div>";
        return;
      }

      container.innerHTML = "";
      filtered.forEach(function (forum) {
        var card = document.createElement("div");
        card.className = "topic-item";
        var status = forum.archived
          ? "Archived"
          : forum.published
          ? "Published"
          : "Draft";
        var statusClass = forum.archived
          ? "archived"
          : forum.published
          ? "published"
          : "draft";
        card.innerHTML =
          '<div class="topic-header"><span class="topic-title">' +
          forum.title +
          '</span><span class="topic-category ' +
          statusClass +
          '">' +
          status +
          '</span></div><div class="topic-meta"><span class="topic-author">by ' +
          forum.author +
          '</span><span class="topic-stats"><i class="fas fa-calendar"></i> ' +
          formatDate(forum.created_at) +
          '</span></div><div class="topic-preview">' +
          forum.description +
          "</div>";

        card.addEventListener("click", function () {
          openManageForumDetail(forum);
        });
        container.appendChild(card);
      });
    })
    .catch(function (e) {
      console.error("Error loading forums:", e);
    });
}

function loadManageCategories() {
  apiGet("/api/teacher/forums/my")
    .then(function (forums) {
      var allCount = forums.length;
      var pubCount = forums.filter(function (f) {
        return f.published && !f.archived;
      }).length;
      var draftCount = forums.filter(function (f) {
        return !f.published && !f.archived;
      }).length;
      var archCount = forums.filter(function (f) {
        return f.archived;
      }).length;

      var el = function (id) {
        return document.getElementById(id);
      };
      if (el("all-count")) el("all-count").textContent = allCount;
      if (el("published-count")) el("published-count").textContent = pubCount;
      if (el("draft-count")) el("draft-count").textContent = draftCount;
      if (el("archived-count")) el("archived-count").textContent = archCount;

      document.querySelectorAll(".category-item").forEach(function (item) {
        item.classList.remove("active");
      });
      var active = document.querySelector(
        "[onclick*=\"filterByCategory('" + currentFilter + "')\"]"
      );
      if (active) active.classList.add("active");
    })
    .catch(function () {});
}

function loadManageStats() {
  apiGet("/api/teacher/forums/my")
    .then(function (forums) {
      var el = function (id) {
        return document.getElementById(id);
      };
      if (el("total-forums"))
        el("total-forums").textContent = forums.length;
      if (el("published-forums"))
        el("published-forums").textContent = forums.filter(function (f) {
          return f.published && !f.archived;
        }).length;
      if (el("draft-forums"))
        el("draft-forums").textContent = forums.filter(function (f) {
          return !f.published && !f.archived;
        }).length;
      if (el("total-replies"))
        el("total-replies").textContent = forums.reduce(function (
          total,
          forum
        ) {
          return total + (forum.reply_count || 0);
        },
        0);
    })
    .catch(function () {});
}

function filterByCategory(category, event) {
  currentFilter = category;
  loadManageForums();

  document.querySelectorAll(".category-item").forEach(function (item) {
    item.classList.remove("active");
  });
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  } else if (event && event.target) {
    var item = event.target.closest(".category-item");
    if (item) item.classList.add("active");
  }
}

function openManageForumDetail(forum) {
  apiGet("/api/teacher/forums/" + forum.id)
    .then(function (detailed) {
      document.getElementById("forum-title-display").textContent =
        detailed.title;
      document.getElementById("forum-description-display").textContent =
        detailed.description;
      document.getElementById("forum-author").textContent =
        "by " + detailed.author;
      document.getElementById("forum-date").textContent = formatDate(
        detailed.created_at
      );

      var tagsContainer = document.getElementById("forum-tags");
      tagsContainer.innerHTML = (detailed.tags || [])
        .map(function (t) {
          return '<span class="tag-item">' + t + "</span>";
        })
        .join("");

      var modal = document.getElementById("forum-detail-modal");
      modal.classList.add("show");
      modal.dataset.forumId = detailed.id;

      var deleteBtn = document.getElementById("delete-forum-btn");
      if (deleteBtn) {
        deleteBtn.onclick = function () {
          var replyCount = detailed.replies ? detailed.replies.length : 0;
          deleteManageForum(detailed.id, replyCount);
        };
      }

      loadManageReplies(detailed.replies, detailed.id);
    })
    .catch(function (e) {
      console.error("Error loading forum:", e);
    });
}

function loadManageReplies(replies, forumId) {
  var container = document.getElementById("replies-list");
  if (!replies || replies.length === 0) {
    container.innerHTML =
      '<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.6);"><i class="fas fa-comments" style="font-size:24px;margin-bottom:8px;opacity:0.5;"></i><p>No replies yet</p><small>Be the first to reply to this forum</small></div>';
    return;
  }

  container.innerHTML = replies
    .map(function (reply) {
      return (
        '<div class="reply-item"><div class="reply-header"><span class="reply-author">' +
        reply.author +
        '</span><span class="reply-date">' +
        formatDate(reply.created_at) +
        '</span><div class="reply-actions"><button class="btn-icon delete-btn" onclick="deleteReply(' +
        forumId +
        "," +
        reply.id +
        ')" title="Delete reply"><i class="fas fa-trash"></i></button></div></div><div class="reply-content">' +
        reply.content +
        "</div></div>"
      );
    })
    .join("");
}

function addManageReply() {
  var content = document.getElementById("reply-content").value.trim();
  var forumId = document.getElementById("forum-detail-modal").dataset.forumId;

  if (!content) {
    alert("Please enter a reply.");
    return;
  }

  apiPost("/api/teacher/forums/" + forumId + "/replies", { content: content })
    .then(function () {
      return apiGet("/api/teacher/forums/" + forumId);
    })
    .then(function (forum) {
      loadManageReplies(forum.replies, forumId);
      document.getElementById("reply-content").value = "";
    })
    .catch(function (e) {
      console.error("Error adding reply:", e);
    });
}

function deleteReply(forumId, replyId) {
  if (!confirm("Are you sure you want to delete this reply?")) return;

  apiDelete("/api/teacher/forums/" + forumId + "/replies/" + replyId)
    .then(function () {
      return apiGet("/api/teacher/forums/" + forumId);
    })
    .then(function (forum) {
      loadManageReplies(forum.replies, forumId);
    })
    .catch(function (e) {
      console.error("Error deleting reply:", e);
    });
}

function editManageForum() {
  var forumId = document.getElementById("forum-detail-modal").dataset.forumId;
  apiGet("/api/teacher/forums/" + forumId)
    .then(function (forum) {
      document.getElementById("edit-forum-title").value = forum.title;
      document.getElementById("edit-forum-description").value =
        forum.description;
      currentEditTags = (forum.tags || []).slice();
      updateManageEditTags();

      var content = document.getElementById("forum-content");
      var actions = document.getElementById("forum-actions");
      var edit = document.getElementById("forum-edit");
      if (content) content.style.display = "none";
      if (actions) actions.style.display = "none";
      if (edit) edit.style.display = "block";
    })
    .catch(function (e) {
      console.error("Error preparing edit:", e);
    });
}

function saveManageForumEdit() {
  var forumId = document.getElementById("forum-detail-modal").dataset.forumId;
  var title = document.getElementById("edit-forum-title").value.trim();
  var description = document
    .getElementById("edit-forum-description")
    .value.trim();

  if (!title || !description || currentEditTags.length === 0) {
    alert("Please fill in all fields and add at least one tag.");
    return;
  }

  apiPut("/api/teacher/forums/" + forumId, {
    title: title,
    description: description,
    tags: currentEditTags.slice(),
    published: true,
  })
    .then(function () {
      closeDetailModal();
      loadManageForums();
      loadManageCategories();
      loadManageStats();
    })
    .catch(function (e) {
      console.error("Error updating forum:", e);
    });
}

function deleteManageForum(forumId, replyCount) {
  var message =
    "Are you sure you want to delete this forum? This action cannot be undone.";
  if (replyCount > 0) {
    message =
      "This forum has " +
      replyCount +
      " replies and cannot be fully deleted. It will be archived instead. Archived forums are hidden from students but remain available for your records. Do you want to archive this forum?";
  }

  if (!confirm(message)) return;

  apiDelete("/api/teacher/forums/" + forumId)
    .then(function () {
      loadManageForums();
      loadManageCategories();
      loadManageStats();
    })
    .catch(function (e) {
      console.error("Error deleting forum:", e);
    });
}

function addManageTag() {
  var input = document.getElementById("tag-input");
  var value = input.value.trim();
  if (!value) return;
  if (!/^[a-zA-Z\s]+$/.test(value)) {
    alert("Tags can only contain letters and spaces.");
    return;
  }
  if (value.length > 20) {
    alert("Tags cannot exceed 20 characters.");
    return;
  }
  if (currentTags.includes(value.toLowerCase())) {
    alert("This tag already exists.");
    return;
  }

  currentTags.push(value.toLowerCase());
  updateManageTags();
  input.value = "";
  input.focus();
}

function updateManageTags() {
  var container = document.getElementById("tags-list");
  if (!container) return;
  container.innerHTML = currentTags
    .map(function (tag) {
      return (
        '<span class="tag-item">' +
        tag +
        '<i class="fas fa-times remove-tag" onclick="removeManageTag(\'' +
        tag +
        "')\"></i></span>"
      );
    })
    .join("");
}

function removeManageTag(tag) {
  currentTags = currentTags.filter(function (t) {
    return t !== tag;
  });
  updateManageTags();
}

function saveManageForum() {
  var title = document.getElementById("forum-title").value.trim();
  var description = document.getElementById("forum-description").value.trim();
  var published = document.getElementById("publish-checkbox").checked;
  var targetGrade = document.getElementById("target-grade").value;

  if (!title || !description || currentTags.length === 0) {
    alert("Please fill in all fields and add at least one tag.");
    return;
  }

  apiPost("/api/teacher/forums/create", {
    title: title,
    description: description,
    tags: currentTags.slice(),
    published: published,
    targetGrade: targetGrade ? parseInt(targetGrade) : null,
  })
    .then(function () {
      document.getElementById("forum-modal").classList.remove("show");
      resetManageModal();
      loadManageForums();
      loadManageCategories();
      loadManageStats();
    })
    .catch(function (e) {
      console.error("Error saving forum:", e);
      alert("Error creating forum. Please try again.");
    });
}

function resetManageModal() {
  var titleEl = document.getElementById("forum-title");
  var descEl = document.getElementById("forum-description");
  var tagEl = document.getElementById("tag-input");
  var checkEl = document.getElementById("publish-checkbox");
  var gradeEl = document.getElementById("target-grade");
  if (titleEl) titleEl.value = "";
  if (descEl) descEl.value = "";
  if (tagEl) tagEl.value = "";
  if (checkEl) checkEl.checked = true;
  if (gradeEl) {
    gradeEl.value = "";
    gradeEl.dispatchEvent(new Event("sync"));
  }
  currentTags = [];
  updateManageTags();
}

function addManageEditTag() {
  var input = document.getElementById("edit-tag-input");
  var value = input ? input.value.trim() : "";
  if (!value) return;
  if (currentEditTags.includes(value.toLowerCase())) return;

  currentEditTags.push(value.toLowerCase());
  updateManageEditTags();
  if (input) input.value = "";
}

function updateManageEditTags() {
  var container = document.getElementById("edit-tags-list");
  if (!container) return;
  container.innerHTML = currentEditTags
    .map(function (tag) {
      return (
        '<span class="tag-item">' +
        tag +
        '<i class="fas fa-times remove-tag" onclick="removeManageEditTag(\'' +
        tag +
        "')\"></i></span>"
      );
    })
    .join("");
}

function removeManageEditTag(tag) {
  currentEditTags = currentEditTags.filter(function (t) {
    return t !== tag;
  });
  updateManageEditTags();
}

// ─── Page 3: Browse Forums (forum/forum-view.html) ─────────────────────────

function initBrowsePage() {
  loadBrowseMyForums();
  loadBrowseAllForums();
  loadBrowseStats();
  setupBrowseSearch();
  setupBrowseTagInput();
}

function setupBrowseSearch() {
  var input = document.getElementById("forum-search");
  if (!input) return;
  input.addEventListener("input", function () {
    var term = this.value.toLowerCase().trim();
    filterBrowseForums(term);
  });
}

function filterBrowseForums(term) {
  if (!term) {
    displayBrowseMyForums(allMyForums);
    displayBrowseOtherForums(allOtherForums);
    return;
  }

  displayBrowseMyForums(
    allMyForums.filter(function (f) {
      return (
        f.title.toLowerCase().includes(term) ||
        (f.tags || []).some(function (t) {
          return t.toLowerCase().includes(term);
        }) ||
        f.description.toLowerCase().includes(term)
      );
    })
  );

  displayBrowseOtherForums(
    allOtherForums.filter(function (f) {
      return (
        f.title.toLowerCase().includes(term) ||
        (f.tags || []).some(function (t) {
          return t.toLowerCase().includes(term);
        }) ||
        f.description.toLowerCase().includes(term)
      );
    })
  );
}

function loadBrowseMyForums() {
  apiGet("/api/teacher/forums/my")
    .then(function (forums) {
      allMyForums = forums;
      displayBrowseMyForums(forums);
    })
    .catch(function (e) {
      console.error("Error loading my forums:", e);
    });
}

function displayBrowseMyForums(forums) {
  var container = document.getElementById("my-forums");
  if (!container) return;

  if (forums.length === 0) {
    container.innerHTML =
      '<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.6);"><i class="fas fa-edit" style="font-size:48px;margin-bottom:16px;opacity:0.5;"></i><p>' +
      (allMyForums.length === 0
        ? "You haven't created any forums yet"
        : "No forums match your search") +
      "</p>" +
      (allMyForums.length === 0
        ? '<small><a href="forum.html" style="color:var(--color-white);text-decoration:underline;">Create your first forum</a></small>'
        : "") +
      "</div>";
    return;
  }

  container.innerHTML = "";
  forums.forEach(function (forum) {
    var card = document.createElement("div");
    card.className = "topic-item";
    card.setAttribute("data-forum-id", forum.id);
    card.innerHTML =
      '<div class="topic-header"><span class="topic-title">' +
      forum.title +
      '</span><span class="topic-category ' +
      (forum.published ? "published" : "draft") +
      '">' +
      (forum.published ? "Published" : "Draft") +
      '</span></div><div class="topic-meta"><span class="topic-author">by ' +
      forum.author +
      '</span><span class="topic-stats"><i class="fas fa-calendar"></i> ' +
      formatDate(forum.created_at) +
      (forum.target_grade ? ' • <i class="fas fa-graduation-cap"></i> Grade ' + forum.target_grade : '') +
      ' • <i class="fas fa-reply"></i> ' +
      (forum.reply_count || 0) +
      '</span></div><div class="topic-preview">' +
      forum.description +
      "</div>";

    card.addEventListener("click", function () {
      openBrowseForumDetail(forum.id);
    });
    container.appendChild(card);
  });
}

function loadBrowseAllForums() {
  apiGet("/api/teacher/forums")
    .then(function (forums) {
      var username = localStorage.getItem("username") || "Teacher";
      allOtherForums = forums.filter(function (f) {
        return f.author !== username;
      });
      displayBrowseOtherForums(allOtherForums);
    })
    .catch(function (e) {
      console.error("Error loading all forums:", e);
    });
}

function displayBrowseOtherForums(forums) {
  var container = document.getElementById("all-forums");
  if (!container) return;

  if (forums.length === 0) {
    container.innerHTML =
      '<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.6);"><i class="fas fa-comments" style="font-size:48px;margin-bottom:16px;opacity:0.5;"></i><p>' +
      (allOtherForums.length === 0
        ? "No other forums available"
        : "No forums match your search") +
      "</p>" +
      (allOtherForums.length === 0
        ? "<small>Be the first to create a forum!</small>"
        : "") +
      "</div>";
    return;
  }

  container.innerHTML = "";
  forums.forEach(function (forum) {
    var card = document.createElement("div");
    card.className = "topic-item";
    card.setAttribute("data-forum-id", forum.id);
    card.innerHTML =
      '<div class="topic-header"><span class="topic-title">' +
      forum.title +
      '</span><span class="topic-category">' +
      (forum.tags || []).join(", ") +
      '</span></div><div class="topic-meta"><span class="topic-author">by ' +
      forum.author +
      '</span><span class="topic-stats"><i class="fas fa-calendar"></i> ' +
      formatDate(forum.created_at) +
      ' • <i class="fas fa-reply"></i> ' +
      (forum.reply_count || 0) +
      '</span></div><div class="topic-preview">' +
      forum.description +
      "</div>";

    card.addEventListener("click", function () {
      openBrowseForumDetail(forum.id);
    });
    container.appendChild(card);
  });
}

function loadBrowseStats() {
  apiGet("/api/teacher/forums")
    .then(function (forums) {
      var el = function (id) {
        return document.getElementById(id);
      };
      if (el("total-forums"))
        el("total-forums").textContent = forums.length;
      if (el("total-teachers"))
        el("total-teachers").textContent = [
          ...new Set(forums.map(function (f) {
            return f.author;
          })),
        ].length;
      if (el("total-replies"))
        el("total-replies").textContent = forums.reduce(function (sum, f) {
          return sum + (f.reply_count || 0);
        }, 0);
    })
    .catch(function () {});
}

function openBrowseForumDetail(forumId) {
  apiGet("/api/teacher/forums/" + forumId)
    .then(function (forum) {
      currentForumId = forumId;

      document.getElementById("forum-title-display").textContent = forum.title;
      document.getElementById("forum-author").textContent =
        "by " + forum.author;
      document.getElementById("forum-date").textContent = formatDate(
        forum.created_at
      );
      document.getElementById("forum-description-display").textContent =
        forum.description;

      var tagsContainer = document.getElementById("forum-tags");
      tagsContainer.innerHTML = (forum.tags || [])
        .map(function (t) {
          return '<span class="tag-item">' + t + "</span>";
        })
        .join("");

      var username = localStorage.getItem("username") || "Teacher";
      var actions = document.getElementById("forum-actions");
      var content = document.querySelector(".forum-content");
      var edit = document.getElementById("forum-edit");

      if (forum.author === username) {
        if (actions) actions.style.display = "block";
      } else {
        if (actions) actions.style.display = "none";
      }
      if (content) content.style.display = "block";
      if (edit) edit.style.display = "none";

      // Increment views in background
      apiPost("/api/teacher/forums/" + forumId + "/view", {}).catch(function () {});

      loadBrowseReplies(forum.replies, forumId);

      var deleteBtn = document.getElementById("delete-forum-btn");
      if (deleteBtn) {
        deleteBtn.onclick = function () {
          var replyCount = forum.replies ? forum.replies.length : 0;
          deleteBrowseForum(forumId, replyCount);
        };
      }

      document.getElementById("forum-detail-modal").classList.add("show");
    })
    .catch(function (e) {
      console.error("Error opening forum:", e);
    });
}

function loadBrowseReplies(replies, forumId) {
  var container = document.getElementById("replies-list");
  if (!replies || replies.length === 0) {
    container.innerHTML =
      '<p style="color:rgba(255,255,255,0.6);text-align:center;padding:20px;">No replies yet. Be the first to reply!</p>';
    return;
  }

  container.innerHTML = replies
    .map(function (reply) {
      return (
        '<div class="reply-item"><div class="reply-header"><span class="reply-author">' +
        reply.author +
        '</span><span class="reply-date">' +
        formatDate(reply.created_at) +
        '</span><div class="reply-actions"><button class="delete-reply-btn" onclick="deleteReply(' +
        forumId +
        "," +
        reply.id +
        ')" title="Delete reply"><i class="fas fa-trash"></i></button></div></div><div class="reply-content">' +
        reply.content +
        "</div></div>"
      );
    })
    .join("");
}

function addBrowseReply() {
  var content = document.getElementById("reply-content").value.trim();
  if (!content) {
    showNotification("Please enter a reply", "error");
    return;
  }

  apiPost("/api/teacher/forums/" + currentForumId + "/replies", {
    content: content,
  })
    .then(function () {
      document.getElementById("reply-content").value = "";
      return apiGet("/api/teacher/forums/" + currentForumId);
    })
    .then(function (forum) {
      loadBrowseReplies(forum.replies, currentForumId);
      loadBrowseMyForums();
      loadBrowseAllForums();
      loadBrowseStats();
      showNotification("Reply posted successfully!", "success");
    })
    .catch(function (e) {
      console.error("Error adding reply:", e);
      showNotification("Failed to post reply", "error");
    });
}

function deleteBrowseForum(forumId, replyCount) {
  var message =
    "Are you sure you want to delete this forum? This action cannot be undone.";
  if (replyCount > 0) {
    message =
      "This forum has " +
      replyCount +
      " replies and cannot be fully deleted. It will be archived instead. Do you want to archive this forum?";
  }

  if (!confirm(message)) return;

  apiDelete("/api/teacher/forums/" + forumId)
    .then(function () {
      closeDetailModal();
      loadBrowseMyForums();
      loadBrowseAllForums();
      loadBrowseStats();
      showNotification(
        replyCount > 0 ? "Forum archived successfully!" : "Forum deleted successfully!",
        "success"
      );
    })
    .catch(function (e) {
      console.error("Error deleting forum:", e);
      showNotification("Failed to delete forum", "error");
    });
}

function editBrowseForum() {
  apiGet("/api/teacher/forums/" + currentForumId)
    .then(function (forum) {
      document.querySelector(".forum-content").style.display = "none";
      var actions = document.getElementById("forum-actions");
      if (actions) actions.style.display = "none";
      document.getElementById("forum-edit").style.display = "block";

      document.getElementById("edit-forum-title").value = forum.title;
      document.getElementById("edit-forum-description").value =
        forum.description;
      currentEditTags = (forum.tags || []).slice();
      updateBrowseEditTags();
    })
    .catch(function (e) {
      console.error("Error preparing edit:", e);
    });
}

function saveBrowseForumEdit() {
  var title = document.getElementById("edit-forum-title").value.trim();
  var description = document
    .getElementById("edit-forum-description")
    .value.trim();

  if (!title || !description) {
    alert("Please fill in all fields.");
    return;
  }

  apiPut("/api/teacher/forums/" + currentForumId, {
    title: title,
    description: description,
    tags: currentEditTags.slice(),
    published: true,
  })
    .then(function () {
      cancelEdit();
      openBrowseForumDetail(currentForumId);
      loadBrowseMyForums();
      loadBrowseAllForums();
      showNotification("Forum updated successfully!", "success");
    })
    .catch(function (e) {
      console.error("Error updating forum:", e);
      showNotification("Failed to update forum", "error");
    });
}

function updateBrowseEditTags() {
  var container = document.getElementById("edit-tags-list");
  if (!container) return;
  container.innerHTML = currentEditTags
    .map(function (tag) {
      return (
        '<span class="tag-item">' +
        tag +
        '<i class="fas fa-times remove-tag" onclick="removeBrowseEditTag(\'' +
        tag +
        "')\"></i></span>"
      );
    })
    .join("");
}

function removeBrowseEditTag(tag) {
  currentEditTags = currentEditTags.filter(function (t) {
    return t !== tag;
  });
  updateBrowseEditTags();
}

function setupBrowseTagInput() {
  var addBtn = document.getElementById("edit-add-tag-btn");
  var tagInput = document.getElementById("edit-tag-input");
  if (!addBtn || !tagInput) return;

  var handler = function () {
    var value = tagInput.value.trim();
    if (!value) return;
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      alert("Tags can only contain letters and spaces.");
      return;
    }
    if (value.length > 20) {
      alert("Tags cannot exceed 20 characters.");
      return;
    }
    if (currentEditTags.includes(value.toLowerCase())) {
      alert("This tag already exists.");
      return;
    }

    currentEditTags.push(value.toLowerCase());
    updateBrowseEditTags();
    tagInput.value = "";
    tagInput.focus();
  };

  addBtn.onclick = handler;
  tagInput.onkeypress = function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handler();
    }
  };
}

// ─── Shared Event Bindings ─────────────────────────────────────────────────

function bindSharedEvents() {
  // ── Main page events ──
  var postModal = document.getElementById("post-modal");
  var createPostBtn = document.getElementById("create-post-btn");
  var modalClose = document.getElementById("modal-close");
  var cancelPostBtn = document.getElementById("cancel-post-btn");
  var submitPostBtn = document.getElementById("submit-post-btn");

  if (createPostBtn) {
    createPostBtn.addEventListener("click", function () {
      loadMainTagsForSelection();
      postModal.classList.add("show");
      document.getElementById("post-title").focus();
    });
  }

  if (modalClose)
    modalClose.addEventListener("click", function () {
      postModal.classList.remove("show");
      resetMainPostModal();
    });
  if (cancelPostBtn)
    cancelPostBtn.addEventListener("click", function () {
      postModal.classList.remove("show");
      resetMainPostModal();
    });
  if (submitPostBtn) submitPostBtn.addEventListener("click", createMainPost);

  var searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      var q = e.target.value.trim();
      if (q.length > 2) searchMainForums(q);
      else if (q.length === 0) loadMainForums();
    });
  }

  var allTagBtn = document.querySelector("[data-tag='all']");
  if (allTagBtn)
    allTagBtn.addEventListener("click", function () {
      filterMainByTag("all");
    });

  var detailClose = document.getElementById("forum-detail-close");
  if (detailClose)
    detailClose.addEventListener("click", function () {
      closeDetailModal();
    });

  var submitReplyBtn = document.getElementById("submit-reply-btn");
  if (submitReplyBtn) {
    // Determine which page we're on for reply submission
    submitReplyBtn.addEventListener("click", function () {
      if (document.getElementById("forums-container")) {
        submitMainReply();
      } else if (document.getElementById("forum-search")) {
        addBrowseReply();
      } else {
        addManageReply();
      }
    });
  }

  // ── Manage page events ──
  var forumModal = document.getElementById("forum-modal");
  var createForumBtn = document.getElementById("create-forum-btn");
  var closeBtn = document.getElementById("modal-close");
  var cancelBtn = document.getElementById("cancel-btn");
  var saveBtn = document.getElementById("save-forum-btn");
  var addTagBtn = document.getElementById("add-tag-btn");
  var tagInput = document.getElementById("tag-input");

  if (createForumBtn) {
    createForumBtn.addEventListener("click", function () {
      resetManageModal();
      var modalTitle = document.getElementById("modal-title");
      if (modalTitle) modalTitle.textContent = "Create New Forum";
      forumModal.classList.add("show");
      document.getElementById("forum-title").focus();
      setTimeout(function () {
        initCustomSelects();
      }, 100);
    });
  }

  if (closeBtn)
    closeBtn.addEventListener("click", function () {
      forumModal.classList.remove("show");
      resetManageModal();
    });
  if (cancelBtn)
    cancelBtn.addEventListener("click", function () {
      forumModal.classList.remove("show");
      resetManageModal();
    });
  if (saveBtn) saveBtn.addEventListener("click", saveManageForum);
  if (addTagBtn) addTagBtn.addEventListener("click", addManageTag);
  if (tagInput) {
    tagInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addManageTag();
      }
    });
  }

  var editAddTagBtn = document.getElementById("edit-add-tag-btn");
  var editTagInput = document.getElementById("edit-tag-input");
  if (editAddTagBtn)
    editAddTagBtn.addEventListener("click", addManageEditTag);
  if (editTagInput) {
    editTagInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addManageEditTag();
      }
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".dropdown")) {
      document.querySelectorAll(".dropdown").forEach(function (dd) {
        dd.style.display = "none";
      });
    }
  });

  // Close modal when clicking outside
  document.addEventListener("click", function (e) {
    var modal = document.getElementById("forum-detail-modal");
    if (e.target === modal) closeDetailModal();
  });

  // Escape key closes modal
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDetailModal();
  });

  // Inject notification animations once
  if (!document.getElementById("forum-anim-style")) {
    var style = document.createElement("style");
    style.id = "forum-anim-style";
    style.textContent =
      "@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}";
    document.head.appendChild(style);
  }
}
