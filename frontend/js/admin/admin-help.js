// Help & Support - Connected to Backend API

// Load all help content
async function loadHelpContent() {
  loadFAQs();
  loadHelpRequests();
  initializeHelpModalHandlers();
}

// ===== FAQs Management =====

async function loadFAQs() {
  try {
    const faqs = await adminApi.getAllFAQs();
    renderFAQs(faqs || []);
  } catch (error) {
    console.error("Error loading FAQs:", error);
    renderFAQs([]);
  }
}

function renderFAQs(faqs) {
  const container = document.getElementById("faqs-container");
  if (!container) return;

  container.innerHTML = "";

  if (faqs.length === 0) {
    container.innerHTML = '<div class="admin-empty-state"><p>No FAQs found. Click "Add FAQ" to create one.</p></div>';
    return;
  }

  faqs.forEach((faq) => {
    const faqItem = document.createElement("div");
    faqItem.className = "faq-item";
    faqItem.innerHTML = `
      <div class="faq-header">
        <h4 style="color: var(--color-white); margin: 0; flex: 1;">${faq.question}</h4>
        <div class="faq-actions">
          <i class="fas fa-trash" style="cursor: pointer; color: rgba(255, 255, 255, 0.7);" title="Delete" data-faq-id="${faq.id}"></i>
        </div>
      </div>
      <p style="color: rgba(255, 255, 255, 0.8); margin: 12px 0 0 0;">${faq.answer}</p>
    `;
    container.appendChild(faqItem);
  });

  bindFAQDeleteButtons();
}

function bindFAQDeleteButtons() {
  document.querySelectorAll(".faq-item [data-faq-id]").forEach((icon) => {
    icon.addEventListener("click", async (e) => {
      const faqId = e.target.getAttribute("data-faq-id");
      window.deletingFaqId = faqId;
      document.getElementById("delete-faq-modal").classList.add("show");
    });
  });
}

// ===== Help Requests Management =====

async function loadHelpRequests() {
  try {
    const requests = await adminApi.getAllHelpRequests();
    window.allHelpRequests = requests || [];
    renderHelpRequests(window.allHelpRequests);
    bindHelpRequestsFilters();
  } catch (error) {
    console.error("Error loading help requests:", error);
    window.allHelpRequests = [];
    renderHelpRequests([]);
  }
}

function renderHelpRequests(requests) {
  const tbody = document.getElementById("help-requests-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (requests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: rgba(255,255,255,0.6);">No help requests found</td></tr>`;
    return;
  }

  requests.forEach((request) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="text-white">${request.user}</td>
      <td class="text-muted">${request.topic}</td>
      <td class="text-muted">${request.date}</td>
      <td class="text-capitalize" style="color: var(--color-white);">${request.status}</td>
      <td class="admin-table-action">
        <i class="fas fa-eye" style="cursor: pointer;" title="View & Reply" data-request-id="${request.id}"></i>
      </td>
    `;
    tbody.appendChild(row);
  });

  bindHelpRequestViewButtons();
}

function bindHelpRequestViewButtons() {
  document.querySelectorAll("#help-requests-tbody [data-request-id]").forEach((icon) => {
    icon.addEventListener("click", async (e) => {
      const requestId = e.target.getAttribute("data-request-id");
      window.currentRequestId = requestId;

      try {
        const request = await adminApi.getHelpRequest(requestId);
        document.getElementById("help-request-title").textContent = request.topic;
        document.getElementById("help-request-user").textContent = request.user;
        document.getElementById("help-request-topic").textContent = request.topic;
        document.getElementById("help-request-status").textContent = request.status;
        document.getElementById("help-request-date").textContent = request.date;
        document.getElementById("reply-input").value = "";

        // Show/hide propose resolution button based on status
        const proposeBtn = document.getElementById("propose-resolution-btn");
        if (request.status === 'replied' || request.status === 'pending') {
          proposeBtn.style.display = 'block';
        } else {
          proposeBtn.style.display = 'none';
        }

        // Load conversation thread
        await loadConversationThread(requestId);

        document.getElementById("help-request-modal").classList.add("show");
      } catch (error) {
        alert("Error loading help request: " + error.message);
      }
    });
  });
}

async function loadConversationThread(requestId) {
  try {
    const messages = await adminApi.getHelpRequestMessages(requestId);
    const threadContainer = document.getElementById("conversation-thread");
    
    if (!messages || messages.length === 0) {
      threadContainer.innerHTML = '<p style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">No messages yet</p>';
      return;
    }

    threadContainer.innerHTML = messages.map(msg => `
      <div style="padding: 12px; border-radius: 8px; background: ${msg.is_admin ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'}; border-left: 3px solid ${msg.is_admin ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'};">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--color-white); font-size: 12px; font-weight: 600;">
            ${msg.is_admin ? 'Admin' : (msg.sender_name || 'User')}
          </span>
          <span style="color: rgba(255, 255, 255, 0.5); font-size: 11px;">
            ${formatDate(msg.created_at)}
          </span>
        </div>
        <p style="color: rgba(255, 255, 255, 0.8); font-size: 13px; line-height: 1.5; margin: 0; white-space: pre-wrap;">
          ${escapeHtml(msg.message)}
        </p>
      </div>
    `).join('');
  } catch (error) {
    console.error("Error loading conversation:", error);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== Filtering =====

function bindHelpRequestsFilters() {
  const searchInput = document.getElementById("requests-search");
  const statusFilter = document.getElementById("requests-status-filter");

  if (!searchInput) return;

  const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter?.value || "";
    const allRequests = window.allHelpRequests || [];

    let filtered = allRequests.filter(
      (request) =>
        (request.user || "").toLowerCase().includes(searchTerm) ||
        (request.topic || "").toLowerCase().includes(searchTerm) ||
        (request.message || "").toLowerCase().includes(searchTerm)
    );

    if (status) {
      filtered = filtered.filter((request) => request.status === status);
    }

    renderHelpRequests(filtered);
  };

  searchInput.addEventListener("input", applyFilters);
  if (statusFilter) statusFilter.addEventListener("change", applyFilters);
}

// ===== Modal Handlers =====

function initializeHelpModalHandlers() {
  // Close modal handlers
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modalId = e.target.getAttribute("data-modal");
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove("show");
    });
  });

  document.querySelectorAll(".modal-footer .btn-secondary").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      if (modal) modal.classList.remove("show");
    });
  });

  // Add FAQ button
  const addFaqBtn = document.getElementById("add-faq-btn");
  if (addFaqBtn) {
    addFaqBtn.addEventListener("click", () => {
      document.getElementById("faq-question-input").value = "";
      document.getElementById("faq-answer-input").value = "";
      document.getElementById("add-faq-modal").classList.add("show");
    });
  }

  // Save FAQ button
  const saveFaqBtn = document.getElementById("save-faq-btn");
  if (saveFaqBtn) {
    saveFaqBtn.addEventListener("click", async () => {
      const question = document.getElementById("faq-question-input").value.trim();
      const answer = document.getElementById("faq-answer-input").value.trim();

      if (question && answer) {
        try {
          await adminApi.createFAQ({ question, answer });
          document.getElementById("add-faq-modal").classList.remove("show");
          loadFAQs();
        } catch (error) {
          alert("Error creating FAQ: " + error.message);
        }
      } else {
        alert("Please fill in both question and answer fields.");
      }
    });
  }

  // Delete FAQ button
  const confirmDeleteBtn = document.getElementById("confirm-delete-faq-btn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      const faqId = window.deletingFaqId;
      if (faqId) {
        try {
          await adminApi.deleteFAQ(faqId);
          document.getElementById("delete-faq-modal").classList.remove("show");
          loadFAQs();
        } catch (error) {
          alert("Error deleting FAQ: " + error.message);
        }
      }
    });
  }

  // Send reply button
  const sendReplyBtn = document.getElementById("send-reply-btn");
  console.log("Send reply button found:", !!sendReplyBtn);
  
  if (sendReplyBtn) {
    sendReplyBtn.addEventListener("click", async () => {
      console.log("=== ADMIN REPLY BUTTON CLICKED ===");
      const reply = document.getElementById("reply-input").value.trim();
      const requestId = window.currentRequestId;
      
      console.log("Reply text:", reply);
      console.log("Request ID:", requestId);
      console.log("window.currentRequestId:", window.currentRequestId);

      if (reply && requestId) {
        try {
          console.log("Sending reply to ticket:", requestId);
          await adminApi.addHelpRequestMessage(requestId, reply, true);
          console.log("Message added successfully");
          
          await adminApi.updateHelpRequestStatus(requestId, 'replied');
          console.log("Status updated to replied");
          
          document.getElementById("reply-input").value = "";
          await loadConversationThread(requestId);
          loadHelpRequests();
        } catch (error) {
          console.error("Error sending reply:", error);
          alert("Error sending reply: " + error.message);
        }
      } else {
        console.log("Missing reply or request ID");
        alert("Please type a reply before sending.");
      }
      console.log("====================================");
    });
  } else {
    console.error("Send reply button not found!");
  }

  // Propose resolution button
  const proposeResolutionBtn = document.getElementById("propose-resolution-btn");
  if (proposeResolutionBtn) {
    proposeResolutionBtn.addEventListener("click", async () => {
      const requestId = window.currentRequestId;
      
      if (confirm("Are you sure you want to propose this issue as resolved? The user will need to accept it.")) {
        try {
          await adminApi.updateHelpRequestStatus(requestId, 'resolution_proposed');
          document.getElementById("help-request-modal").classList.remove("show");
          loadHelpRequests();
        } catch (error) {
          alert("Error proposing resolution: " + error.message);
        }
      }
    });
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadHelpContent();
});