// Help & Support - Connected to Backend API

let faqs = [];
let helpRequests = [];
let currentRequestId = null;
let editingFaqId = null;

document.addEventListener("DOMContentLoaded", () => {
  loadFAQs();
  loadHelpRequests();
  initModalHandlers();
});

async function loadFAQs() {
  try {
    faqs = await adminApi.getFAQs();
  } catch (error) {
    console.error("Error loading FAQs:", error);
    faqs = [];
  }
  renderFAQs();
}

function renderFAQs() {
  const container = document.getElementById("faqs-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  if (faqs.length === 0) {
    container.innerHTML = '<div class="admin-empty-state"><p>No FAQs yet. Click "Add" to create one.</p></div>';
    return;
  }

  faqs.forEach(faq => {
    container.innerHTML += `
      <div class="faq-item">
        <div class="faq-header">
          <h4 style="color: var(--color-white); margin: 0; flex: 1;">${faq.question}</h4>
          <div class="faq-actions">
            <i class="fas fa-edit" style="cursor:pointer;" data-edit-faq="${faq.id}"></i>
            <i class="fas fa-trash" style="cursor:pointer;" data-delete-faq="${faq.id}"></i>
          </div>
        </div>
        <p style="color: rgba(255, 255, 255, 0.8); margin: 12px 0 0 0;">${faq.answer}</p>
      </div>
    `;
  });

  bindFAQActions();
}

function bindFAQActions() {
  document.querySelectorAll("[data-edit-faq]").forEach(icon => {
    icon.addEventListener("click", () => {
      editingFaqId = parseInt(icon.dataset.editFaq);
      const faq = faqs.find(f => f.id === editingFaqId);
      if (faq) {
        document.getElementById("faq-question-input").value = faq.question;
        document.getElementById("faq-answer-input").value = faq.answer;
        document.getElementById("add-faq-modal").classList.add("show");
      }
    });
  });

  document.querySelectorAll("[data-delete-faq]").forEach(icon => {
    icon.addEventListener("click", () => {
      window.deletingFaqId = parseInt(icon.dataset.deleteFaq);
      document.getElementById("delete-faq-modal").classList.add("show");
    });
  });
}

async function loadHelpRequests() {
  try {
    helpRequests = await adminApi.getHelpRequests();
  } catch (error) {
    console.error("Error loading requests:", error);
    helpRequests = [];
  }
  renderHelpRequests();
}

function renderHelpRequests(filtered = null) {
  const tbody = document.getElementById("help-requests-tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  const requests = filtered || helpRequests;

  if (requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="admin-empty-state">No requests found</td></tr>';
    return;
  }

  requests.forEach(req => {
    const userName = `${req.firstname || ""} ${req.lastname || ""}`.trim() || req.username || "Unknown";
    const date = new Date(req.created_at).toLocaleDateString();
    tbody.innerHTML += `
      <tr>
        <td class="text-white">${userName}</td>
        <td class="text-muted">${req.topic}</td>
        <td class="text-muted">${date}</td>
        <td class="text-capitalize" style="color: var(--color-white);">${req.status}</td>
        <td><i class="fas fa-eye" style="cursor:pointer;" data-view-request="${req.id}"></i></td>
      </tr>
    `;
  });

  bindRequestActions();
}

function bindRequestActions() {
  document.querySelectorAll("[data-view-request]").forEach(icon => {
    icon.addEventListener("click", () => {
      currentRequestId = parseInt(icon.dataset.viewRequest);
      const req = helpRequests.find(r => r.id === currentRequestId);
      if (req) {
        const userName = `${req.firstname || ""} ${req.lastname || ""}`.trim() || req.username || "Unknown";
        document.getElementById("help-request-title").textContent = req.topic;
        document.getElementById("help-request-user").textContent = userName;
        document.getElementById("help-request-topic").textContent = req.topic;
        document.getElementById("help-request-message").textContent = req.message;
        document.getElementById("help-request-date").textContent = new Date(req.created_at).toLocaleString();
        document.getElementById("reply-input").value = "";
        
        const replyDiv = document.getElementById("current-reply-div");
        if (req.reply) {
          replyDiv.style.display = "block";
          document.getElementById("help-request-reply").textContent = req.reply;
        } else {
          replyDiv.style.display = "none";
        }
        
        document.getElementById("help-request-modal").classList.add("show");
      }
    });
  });
}

function initModalHandlers() {
  document.querySelectorAll(".modal-close, .modal-footer .btn-secondary").forEach(btn => {
    btn.addEventListener("click", e => {
      const modal = e.target.closest(".modal");
      if (modal) modal.classList.remove("show");
    });
  });

  document.getElementById("add-faq-btn")?.addEventListener("click", () => {
    editingFaqId = null;
    document.getElementById("faq-question-input").value = "";
    document.getElementById("faq-answer-input").value = "";
    document.getElementById("add-faq-modal").classList.add("show");
  });

  document.getElementById("save-faq-btn")?.addEventListener("click", async () => {
    const question = document.getElementById("faq-question-input").value.trim();
    const answer = document.getElementById("faq-answer-input").value.trim();
    
    if (!question || !answer) {
      alert("Please fill in both question and answer");
      return;
    }

    try {
      if (editingFaqId) {
        await adminApi.updateFAQ(editingFaqId, question, answer);
      } else {
        await adminApi.createFAQ(question, answer);
      }
      document.getElementById("add-faq-modal").classList.remove("show");
      await loadFAQs();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("confirm-delete-faq-btn")?.addEventListener("click", async () => {
    if (window.deletingFaqId) {
      try {
        await adminApi.deleteFAQ(window.deletingFaqId);
        document.getElementById("delete-faq-modal").classList.remove("show");
        await loadFAQs();
      } catch (error) {
        alert(error.message);
      }
    }
  });

  document.getElementById("send-reply-btn")?.addEventListener("click", async () => {
    const reply = document.getElementById("reply-input").value.trim();
    if (!reply || !currentRequestId) {
      alert("Please type a reply");
      return;
    }

    try {
      await adminApi.replyToRequest(currentRequestId, reply);
      document.getElementById("help-request-modal").classList.remove("show");
      await loadHelpRequests();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("requests-search")?.addEventListener("input", filterRequests);
  document.getElementById("requests-status-filter")?.addEventListener("change", filterRequests);
}

function filterRequests() {
  const search = document.getElementById("requests-search")?.value.toLowerCase() || "";
  const status = document.getElementById("requests-status-filter")?.value || "";

  let filtered = helpRequests.filter(req => {
    const userName = `${req.firstname || ""} ${req.lastname || ""}`.trim() || req.username || "";
    const matchesSearch = userName.toLowerCase().includes(search) || req.topic.toLowerCase().includes(search);
    const matchesStatus = !status || req.status === status;
    return matchesSearch && matchesStatus;
  });

  renderHelpRequests(filtered);
}
