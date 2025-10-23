// Help & Support Management Functions

// Load all help content
function loadHelpContent() {
  loadFAQs();
  loadHelpRequests();
  initializeHelpModalHandlers();
}

// ===== FAQs Management =====

function loadFAQs() {
  const faqs = getFAQs();
  renderFAQs(faqs);
}

function getFAQs() {
  const faqs = localStorage.getItem("faqs")
    ? JSON.parse(localStorage.getItem("faqs"))
    : getDefaultFAQs();
  return faqs;
}

function getDefaultFAQs() {
  return [
    {
      id: 1,
      question: "How do I reset my password?",
      answer:
        "Click on 'Forgot Password' on the login page and follow the instructions sent to your email.",
    },
    {
      id: 2,
      question: "How do I create a forum?",
      answer:
        "Navigate to the forums section and click 'Create Forum'. Fill in the details and submit for approval.",
    },
    {
      id: 3,
      question: "Can I edit my posts after publishing?",
      answer:
        "Yes, you can edit your posts within 24 hours of publishing. After that, contact support.",
    },
    {
      id: 4,
      question: "How do I report inappropriate content?",
      answer:
        "Click the flag icon on any post to report it. Our moderation team will review it within 48 hours.",
    },
  ];
}

function renderFAQs(faqs) {
  const container = document.getElementById("faqs-container");
  if (!container) return;

  container.innerHTML = "";

  if (faqs.length === 0) {
    container.innerHTML =
      '<div class="admin-empty-state"><p>No FAQs found. Click "Add FAQ" to create one.</p></div>';
    return;
  }

  faqs.forEach((faq) => {
    const faqItem = document.createElement("div");
    faqItem.className = "faq-item";
    faqItem.innerHTML = `
      <div class="faq-header">
        <h4 style="color: var(--color-white); margin: 0; flex: 1;">${faq.question}</h4>
        <div class="faq-actions">
          <i class="fas fa-edit" style="cursor: pointer; color: rgba(255, 255, 255, 0.7);" title="Edit" data-faq-id="${faq.id}" data-edit-faq="${faq.id}"></i>
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
    icon.addEventListener("click", (e) => {
      const faqId = e.target.getAttribute("data-faq-id");
      window.deletingFaqId = faqId;
      document.getElementById("delete-faq-modal").classList.add("show");
    });
  });
}

// ===== Help Requests Management =====

function loadHelpRequests() {
  const requests = getHelpRequests();
  renderHelpRequests(requests);
}

function getHelpRequests() {
  const requests = localStorage.getItem("helpRequests")
    ? JSON.parse(localStorage.getItem("helpRequests"))
    : getDefaultHelpRequests();
  return requests;
}

function getDefaultHelpRequests() {
  return [
    {
      id: 1,
      user: "John Smith",
      topic: "Cannot login to account",
      message:
        "I forgot my password and the reset email is not arriving in my inbox.",
      date: "2025-10-23",
      status: "pending",
      reply: null,
    },
    {
      id: 2,
      user: "Sarah Johnson",
      topic: "Quiz not submitting",
      message: "When I try to submit my quiz, it shows an error message.",
      date: "2025-10-22",
      status: "replied",
      reply:
        "Please clear your browser cache and try again. If the issue persists, contact us.",
    },
    {
      id: 3,
      user: "Mike Chen",
      topic: "How to upload resources",
      message: "What is the maximum file size for uploading documents?",
      date: "2025-10-21",
      status: "pending",
      reply: null,
    },
    {
      id: 4,
      user: "Emma Davis",
      topic: "Forum permission denied",
      message: "I created a forum but cannot post in it.",
      date: "2025-10-20",
      status: "resolved",
      reply:
        "Your forum permissions have been updated. You should now be able to post.",
    },
    {
      id: 5,
      user: "Alex Wilson",
      topic: "Cannot add class members",
      message: "How do I add new members to my class?",
      date: "2025-10-19",
      status: "pending",
      reply: null,
    },
  ];
}

function renderHelpRequests(requests) {
  const tbody = document.getElementById("help-requests-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  requests.forEach((request) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="text-white">${request.user}</td>
      <td class="text-muted">${request.topic}</td>
      <td class="text-muted">${request.date}</td>
      <td class="text-capitalize" style="color: var(--color-white);">
        ${request.status}
      </td>
      <td class="admin-table-action">
        <i class="fas fa-eye" style="cursor: pointer;" title="View & Reply" data-request-id="${request.id}"></i>
      </td>
    `;
    tbody.appendChild(row);
  });

  bindHelpRequestViewButtons();
}

function bindHelpRequestViewButtons() {
  document
    .querySelectorAll("#help-requests-tbody [data-request-id]")
    .forEach((icon) => {
      icon.addEventListener("click", (e) => {
        const requestId = e.target.getAttribute("data-request-id");
        const requests = getHelpRequests();
        const request = requests.find((r) => r.id == requestId);

        if (request) {
          window.currentRequestId = requestId;
          document.getElementById("help-request-title").textContent =
            request.topic;
          document.getElementById("help-request-user").textContent =
            request.user;
          document.getElementById("help-request-topic").textContent =
            request.topic;
          document.getElementById("help-request-message").textContent =
            request.message;
          document.getElementById("help-request-date").textContent =
            request.date;
          document.getElementById("reply-input").value = "";

          const replyDiv = document.getElementById("current-reply-div");
          if (request.reply) {
            replyDiv.style.display = "block";
            document.getElementById("help-request-reply").textContent =
              request.reply;
          } else {
            replyDiv.style.display = "none";
          }

          document.getElementById("help-request-modal").classList.add("show");
        }
      });
    });
}

// ===== Filtering =====

function bindHelpRequestsFilters() {
  const searchInput = document.getElementById("requests-search");
  const statusFilter = document.getElementById("requests-status-filter");

  if (!searchInput) return;

  const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter?.value || "";
    const allRequests = getHelpRequests();

    let filtered = allRequests.filter(
      (request) =>
        request.user.toLowerCase().includes(searchTerm) ||
        request.topic.toLowerCase().includes(searchTerm) ||
        request.message.toLowerCase().includes(searchTerm)
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
  // Close modal when clicking X or Cancel button
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
    saveFaqBtn.addEventListener("click", () => {
      const question = document
        .getElementById("faq-question-input")
        .value.trim();
      const answer = document.getElementById("faq-answer-input").value.trim();

      if (question && answer) {
        const faqs = getFAQs();
        const newFaq = {
          id: faqs.length > 0 ? Math.max(...faqs.map((f) => f.id)) + 1 : 1,
          question,
          answer,
        };
        faqs.push(newFaq);
        localStorage.setItem("faqs", JSON.stringify(faqs));
        document.getElementById("add-faq-modal").classList.remove("show");
        loadFAQs();
      } else {
        alert("Please fill in both question and answer fields.");
      }
    });
  }

  // Delete FAQ button
  const confirmDeleteBtn = document.getElementById("confirm-delete-faq-btn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      const faqId = window.deletingFaqId;
      if (faqId) {
        let faqs = getFAQs();
        faqs = faqs.filter((f) => f.id != faqId);
        localStorage.setItem("faqs", JSON.stringify(faqs));
        document.getElementById("delete-faq-modal").classList.remove("show");
        loadFAQs();
      }
    });
  }

  // Send reply button
  const sendReplyBtn = document.getElementById("send-reply-btn");
  if (sendReplyBtn) {
    sendReplyBtn.addEventListener("click", () => {
      const reply = document.getElementById("reply-input").value.trim();
      const requestId = window.currentRequestId;

      if (reply && requestId) {
        let requests = getHelpRequests();
        const request = requests.find((r) => r.id == requestId);
        if (request) {
          request.reply = reply;
          request.status = "replied";
          localStorage.setItem("helpRequests", JSON.stringify(requests));
          document
            .getElementById("help-request-modal")
            .classList.remove("show");
          loadHelpRequests();
        }
      } else {
        alert("Please type a reply before sending.");
      }
    });
  }

  bindHelpRequestsFilters();
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadHelpContent();
});
