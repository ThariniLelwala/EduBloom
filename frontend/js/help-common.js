// Help Common Handler - Shared functionality for all help pages
(function () {
  // Determine role from localStorage
  function getUserRole() {
    const role = localStorage.getItem("userRole") || "student";
    return role.toLowerCase();
  }

  // Initialize help page
  function initializeHelpPage() {
    loadFAQs();
    attachFormListener();
  }

  // Load FAQs based on user role from API
  async function loadFAQs() {
    const role = getUserRole();
    const container = document.getElementById("faqs-container");
    if (!container) return;

    try {
      const response = await fetch(`/api/faqs?role=${role}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to fetch FAQs");
      
      const faqs = data.faqs || [];
      renderFAQs(faqs);
    } catch (error) {
      console.error("Error loading FAQs:", error);
      container.innerHTML = `
        <div class="faq-error">
          <p>Unable to load FAQs. Please try again later.</p>
        </div>
      `;
    }
  }

  function renderFAQs(faqs) {
    const container = document.getElementById("faqs-container");
    if (!container) return;

    if (faqs.length === 0) {
      container.innerHTML = `
        <div class="faq-empty">
          <p>No FAQs available for your role yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = faqs
      .map(
        (faq, index) => `
      <div class="faq-item">
        <button class="faq-question" data-faq-id="${index}">
          <i class="fas fa-chevron-right"></i>
          <span>${escapeHtml(faq.question)}</span>
        </button>
        <div class="faq-answer" style="display: none;">
          <p>${escapeHtml(faq.answer)}</p>
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

  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Handle support form submission
  function attachFormListener() {
    const form = document.getElementById("support-form");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const topic = document.getElementById("support-topic").value.trim();
      const message = document.getElementById("support-message").value.trim();

      if (!topic || !message) {
        showToast("Please fill in all fields", "error");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/help/request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ topic, message })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to submit request");
        }

        showToast(
          "Support request sent successfully! We'll get back to you soon.",
          "success"
        );
        form.reset();
      } catch (error) {
        console.error("Error submitting request:", error);
        showToast(error.message || "Failed to submit request", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
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
    if (document.getElementById("help-common-styles")) return;
    
    const style = document.createElement("style");
    style.id = "help-common-styles";
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

      .faq-empty, .faq-error {
        padding: 24px;
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
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
    `;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", initializeHelpPage);
  injectStyles();
})();
