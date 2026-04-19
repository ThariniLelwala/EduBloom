// Help Common Handler - Shared functionality for all help pages
// Note: This submits help requests to the help_requests table (used by admin dashboard)
(function () {
  const API_BASE = "/api/support";

  function getToken() {
    return localStorage.getItem("authToken");
  }

  async function apiRequest(endpoint, method = "GET", data = null) {
    const token = getToken();
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `API error: ${response.status}`);
    }

    return result;
  }

  // Sample FAQs - Can be customized per role
  const roleFAQs = {
    teacher: [
      {
        id: 1,
        question: "How do I create a new course?",
        answer:
          "Navigate to your dashboard and click 'Create Course'. Fill in the course details, select subject, and set the curriculum. You can then add modules and lessons to the course.",
      },
      {
        id: 2,
        question: "How do I create and manage quizzes?",
        answer:
          "Go to the 'Quizzes' section in your dashboard. Click 'Create Quiz', add questions with different types (multiple choice, true/false, short answer), set difficulty levels, and assign to classes.",
      },
      {
        id: 3,
        question: "How do I upload course materials?",
        answer:
          "In each course section, use the 'Upload Materials' option to add PDFs, documents, images, and videos. Organize materials into folders for better organization.",
      },
      {
        id: 4,
        question: "How do I grade assignments?",
        answer:
          "Open the 'Grading' panel, select the assignment, and review student submissions. Provide feedback and assign grades. Students will receive notifications when grades are posted.",
      },
      {
        id: 5,
        question: "How do I verify my teacher account?",
        answer:
          "Go to your profile settings and click 'Submit Verification'. Upload required documents (teaching credentials, ID). Admin will review and verify within 48 hours.",
      },
    ],
    student: [
      {
        id: 1,
        question: "How do I submit an assignment?",
        answer:
          "Navigate to the assignment in your course. Click 'Submit', upload your work or provide your answer, and click 'Submit Assignment'. You can resubmit before the deadline.",
      },
      {
        id: 2,
        question: "How do I take a quiz?",
        answer:
          "Go to the 'Quiz' section in your course. Click on the quiz to start. Answer all questions and review your responses before submitting. You cannot retake the quiz after submission unless allowed by your teacher.",
      },
      {
        id: 3,
        question: "How do I track my progress?",
        answer:
          "Visit your 'Progress' dashboard to see grades, completed assignments, quiz scores, and learning analytics. You can view detailed feedback on each submission.",
      },
      {
        id: 4,
        question: "How do I access course materials?",
        answer:
          "In each course, click 'Materials' to view all resources shared by your teacher. Download documents, view videos, and access additional learning resources organized by module.",
      },
      {
        id: 5,
        question: "How do I message my teacher?",
        answer:
          "Use the messaging feature in the course to send direct messages to your teacher. You can also post in discussion forums to ask questions visible to the entire class.",
      },
    ],
    parent: [
      {
        id: 1,
        question: "How do I monitor my child's progress?",
        answer:
          "Go to 'Child's Progress' on your dashboard. You'll see grades, assignment submissions, quiz scores, and attendance. Click on specific items for detailed feedback from teachers.",
      },
      {
        id: 2,
        question: "How do I link my child's account?",
        answer:
          "In your profile settings, click 'Link Child Account'. Enter your child's email or student ID. Your child must accept the link request for it to be completed.",
      },
      {
        id: 3,
        question: "How do I communicate with teachers?",
        answer:
          "Use the 'Communication' section to send messages to your child's teachers. You can also view any announcements they've posted about class progress or upcoming events.",
      },
      {
        id: 4,
        question: "How do I view the calendar?",
        answer:
          "Check the 'Calendar' page to see all upcoming assignments, tests, and events for your child. Sync with your personal calendar if desired.",
      },
      {
        id: 5,
        question: "How do I reset my password?",
        answer:
          "Click 'Forgot Password' on the login page. Enter your email, check for a reset link, and create a new password. If you don't receive an email, check your spam folder or contact support.",
      },
    ],
  };

  // Determine role from sidebar data or localStorage
  function getUserRole() {
    const role = localStorage.getItem("userRole") || "student";
    return role.toLowerCase();
  }

  // Initialize help page
  function initializeHelpPage() {
    loadFAQs();
    attachFormListener();
    loadUserTickets();
    initializeModalHandlers();
  }

  // Load FAQs based on user role
  function loadFAQs() {
    const role = getUserRole();
    const faqs = roleFAQs[role] || roleFAQs.student;
    const container = document.getElementById("faqs-container");

    if (!container) return;

    container.innerHTML = faqs
      .map(
        (faq) => `
      <div class="faq-item">
        <button class="faq-question" data-faq-id="${faq.id}">
          <i class="fas fa-chevron-right"></i>
          <span>${faq.question}</span>
        </button>
        <div class="faq-answer" style="display: none;">
          <p>${faq.answer}</p>
        </div>
      </div>
    `
      )
      .join("");

    // Attach click listeners to FAQ items
    document.querySelectorAll(".faq-question").forEach((button) => {
      button.addEventListener("click", function () {
        const answer = this.nextElementSibling;
        const isOpen = answer.style.display !== "none";

        // Close all other FAQs
        document.querySelectorAll(".faq-answer").forEach((item) => {
          item.style.display = "none";
        });
        document.querySelectorAll(".faq-question i").forEach((icon) => {
          icon.style.transform = "rotate(0deg)";
        });

        // Toggle current FAQ
        if (!isOpen) {
          answer.style.display = "block";
          this.querySelector("i").style.transform = "rotate(90deg)";
        }
      });
    });
  }

  // Handle support form submission
  function attachFormListener() {
    const form = document.getElementById("support-form");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const topic = document.getElementById("support-topic").value.trim();
      const message = document.getElementById("support-message").value.trim();
      const role = getUserRole();

      if (!topic || !message) {
        showToast("Please fill in all fields", "error");
        return;
      }

      try {
        // Submit help request to help_requests table (viewable in admin dashboard)
        const result = await apiRequest("/tickets", "POST", { topic, message, role });

        showToast(
          "Help request sent successfully! We'll get back to you soon.",
          "success"
        );
        form.reset();
        loadUserTickets();
      } catch (error) {
        console.error("Error submitting help request:", error);
        showToast("Failed to submit help request. Please try again.", "error");
      }
    });
  }

  // Load user's help requests
  async function loadUserTickets() {
    const container = document.getElementById("my-tickets-container");
    if (!container) return;

    try {
      const result = await apiRequest("/my-tickets", "GET");
      renderTickets(result.tickets, container);
    } catch (error) {
      console.error("Error loading tickets:", error);
      container.innerHTML = `<div class="no-tickets">Failed to load help requests</div>`;
    }
  }

  // Render tickets to the container
  function renderTickets(tickets, container) {
    if (!tickets || tickets.length === 0) {
      container.innerHTML = `<div class="no-tickets">No help requests submitted yet</div>`;
      return;
    }

    container.innerHTML = tickets
      .map(
        (ticket) => `
      <div class="ticket-item" data-ticket-id="${ticket.id}" style="cursor: pointer;">
        <div class="ticket-header">
          <div class="ticket-topic">${escapeHtml(ticket.topic)}</div>
          <span class="status-badge status-${ticket.status}">${formatStatus(ticket.status)}</span>
        </div>
        <div class="ticket-footer">
          <span class="ticket-date">${formatDate(ticket.created_at)}</span>
          ${ticket.status === 'resolution_proposed' ? `
            <span style="color: rgba(255, 255, 255, 0.6); font-size: 11px; margin-left: 8px;">
              <i class="fas fa-check-circle"></i> Resolution Proposed
            </span>
          ` : ''}
        </div>
        ${ticket.messages && ticket.messages.length > 0 ? `
          <div class="ticket-conversation" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="color: rgba(255, 255, 255, 0.6); font-size: 12px;">Conversation (${ticket.messages.length})</span>
              <span style="color: rgba(255, 255, 255, 0.5); font-size: 11px;">
                <i class="fas fa-chevron-right"></i> Click to view
              </span>
            </div>
            <div class="conversation-messages" style="display: none; flex-direction: column; gap: 8px;">
              ${ticket.messages.slice(-2).map(msg => `
                <div style="padding: 10px; border-radius: 6px; background: ${msg.is_admin ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'}; border-left: 3px solid ${msg.is_admin ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'};">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: var(--color-white); font-size: 11px; font-weight: 600;">
                      ${msg.is_admin ? 'Admin' : 'You'}
                    </span>
                    <span style="color: rgba(255, 255, 255, 0.5); font-size: 10px;">
                      ${formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px; line-height: 1.4; margin: 0; white-space: pre-wrap;">
                    ${escapeHtml(msg.message)}
                  </p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `
      )
      .join("");

    // Attach event listeners
    attachTicketEventListeners(container);
  }

  function attachTicketEventListeners(container) {
    // Click on ticket item to open modal
    container.querySelectorAll('.ticket-item').forEach(item => {
      item.addEventListener('click', function(e) {
        // Don't open modal if clicking on expand/collapse button
        if (e.target.closest('.view-conversation-btn')) return;
        
        const ticketId = this.getAttribute('data-ticket-id');
        openTicketModal(ticketId);
      });
    });

    // View conversation buttons (expand/collapse)
    container.querySelectorAll('.view-conversation-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const messagesDiv = this.closest('.ticket-conversation').querySelector('.conversation-messages');
        const isHidden = messagesDiv.style.display === 'none';
        messagesDiv.style.display = isHidden ? 'flex' : 'none';
        this.innerHTML = isHidden ? '<i class="fas fa-chevron-up"></i> Hide' : '<i class="fas fa-chevron-down"></i> View';
      });
    });
  }

  async function openTicketModal(ticketId) {
    try {
      console.log("Opening ticket modal for ticket:", ticketId);
      const result = await apiRequest(`/tickets/${ticketId}/messages`, 'GET');
      console.log("Messages loaded:", result);
      const messages = result.messages || [];
      
      // Get ticket details from the DOM
      const ticketItem = document.querySelector(`.ticket-item[data-ticket-id="${ticketId}"]`);
      const topic = ticketItem.querySelector('.ticket-topic').textContent;
      const status = ticketItem.querySelector('.status-badge').textContent;
      const date = ticketItem.querySelector('.ticket-date').textContent;
      
      console.log("Ticket details:", { topic, status, date, messagesCount: messages.length });
      
      // Populate modal
      document.getElementById('help-request-title').textContent = topic;
      document.getElementById('help-request-topic').textContent = topic;
      document.getElementById('help-request-status').textContent = status;
      document.getElementById('help-request-date').textContent = date;
      document.getElementById('reply-input').value = '';
      
      // Show/hide accept resolution button
      const acceptBtn = document.getElementById('accept-resolution-btn');
      const replySection = document.getElementById('reply-section');
      
      if (status === 'Resolution Proposed') {
        acceptBtn.style.display = 'block';
        replySection.style.display = 'none';
      } else if (status === 'Resolved') {
        acceptBtn.style.display = 'none';
        replySection.style.display = 'none';
      } else {
        acceptBtn.style.display = 'none';
        replySection.style.display = 'block';
      }
      
      // Load conversation thread
      loadConversationThread(messages);
      
      // Store current ticket ID
      window.currentTicketId = ticketId;
      
      // Show modal
      document.getElementById('help-request-modal').classList.add('show');
    } catch (error) {
      console.error('Error opening ticket modal:', error);
      showToast('Failed to load ticket details', 'error');
    }
  }

  function loadConversationThread(messages) {
    const threadContainer = document.getElementById('conversation-thread');
    
    console.log("Loading conversation thread with messages:", messages);
    
    if (!messages || messages.length === 0) {
      threadContainer.innerHTML = '<p style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">No messages yet</p>';
      return;
    }

    threadContainer.innerHTML = messages.map(msg => `
      <div style="padding: 12px; border-radius: 8px; background: ${msg.is_admin ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'}; border-left: 3px solid ${msg.is_admin ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'};">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--color-white); font-size: 12px; font-weight: 600;">
            ${msg.is_admin ? 'Admin' : 'You'}
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
    
    console.log("Conversation thread rendered with", messages.length, "messages");
  }

  function initializeModalHandlers() {
    // Close modal handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', function() {
        const modalId = this.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('show');
      });
    });

    document.querySelectorAll('.modal-footer .btn-secondary').forEach(btn => {
      btn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) modal.classList.remove('show');
      });
    });

    // Send reply button
    const sendReplyBtn = document.getElementById('send-reply-btn');
    if (sendReplyBtn) {
      sendReplyBtn.addEventListener('click', async function() {
        const reply = document.getElementById('reply-input').value.trim();
        const ticketId = window.currentTicketId;
        
        if (!reply) {
          showToast('Please type a message before sending.', 'error');
          return;
        }
        
        try {
          await apiRequest(`/tickets/${ticketId}/messages`, 'POST', { message: reply, is_admin: false });
          showToast('Reply sent successfully!', 'success');
          document.getElementById('reply-input').value = '';
          
          // Reload conversation
          const result = await apiRequest(`/tickets/${ticketId}/messages`, 'GET');
          loadConversationThread(result.messages || []);
          
          // Reload tickets list
          loadUserTickets();
        } catch (error) {
          console.error('Error sending reply:', error);
          showToast('Failed to send reply. Please try again.', 'error');
        }
      });
    }

    // Accept resolution button
    const acceptResolutionBtn = document.getElementById('accept-resolution-btn');
    if (acceptResolutionBtn) {
      acceptResolutionBtn.addEventListener('click', async function() {
        const ticketId = window.currentTicketId;
        
        if (confirm('Are you sure you want to accept this resolution? This will mark your request as resolved.')) {
          try {
            await apiRequest(`/tickets/${ticketId}`, 'PUT', { status: 'resolved' });
            showToast('Resolution accepted successfully!', 'success');
            document.getElementById('help-request-modal').classList.remove('show');
            loadUserTickets();
          } catch (error) {
            console.error('Error accepting resolution:', error);
            showToast('Failed to accept resolution. Please try again.', 'error');
          }
        }
      });
    }
  }

  function formatStatus(status) {
    const statusMap = {
      'pending': 'Pending',
      'replied': 'Replied',
      'resolution_proposed': 'Resolution Proposed',
      'resolved': 'Resolved'
    };
    return statusMap[status] || status;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Toast notification
  function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.style.display = "block";

    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }

  // Add CSS for FAQs and toast
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .faqs-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 0 16px 16px 16px;
      }

      .faq-item {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.03);
      }

      .faq-question {
        width: 100%;
        padding: 16px;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.2s ease;
      }

      .faq-question:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .faq-question i {
        transition: transform 0.3s ease;
        color: white;
      }

      .faq-answer {
        padding: 0 16px 16px 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .faq-answer p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 13px;
        line-height: 1.6;
        margin: 0;
      }

      .toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        background: rgba(50, 50, 50, 0.95);
        color: white;
        border-radius: 8px;
        font-size: 14px;
        display: none;
        z-index: 1000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        max-width: 400px;
      }

      .toast-success {
        background: rgba(34, 197, 94, 0.2);
        border-color: rgba(34, 197, 94, 0.4);
        color: #86efac;
      }

      .toast-error {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.4);
        color: #fca5a5;
      }

      .toast-info {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.4);
        color: #93c5fd;
      }

      .ticket-item {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        background: rgba(255, 255, 255, 0.03);
        transition: all 0.2s ease;
      }

      .ticket-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .ticket-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .ticket-topic {
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
      }

      .status-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .status-pending {
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-white);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .status-replied {
        background: rgba(255, 255, 255, 0.15);
        color: var(--color-white);
        border: 1px solid rgba(255, 255, 255, 0.4);
      }

      .status-resolution_proposed {
        background: rgba(255, 255, 255, 0.2);
        color: var(--color-white);
        border: 1px solid rgba(255, 255, 255, 0.5);
      }

      .status-resolved,
      .status-completed {
        background: rgba(255, 255, 255, 0.25);
        color: var(--color-white);
        border: 1px solid rgba(255, 255, 255, 0.6);
      }

      .ticket-message {
        color: rgba(255, 255, 255, 0.7);
        font-size: 13px;
        line-height: 1.5;
        margin-bottom: 12px;
      }

      .ticket-footer {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .ticket-date {
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
      }

      .ticket-reply {
        padding: 12px;
        background: rgba(255, 255, 255, 0.1);
        border-left: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        color: var(--color-white);
        font-size: 13px;
        line-height: 1.5;
      }

      .ticket-reply strong {
        color: var(--color-white);
        display: block;
        margin-bottom: 4px;
      }

      .no-tickets {
        text-align: center;
        padding: 32px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", initializeHelpPage);
  injectStyles();
})();
