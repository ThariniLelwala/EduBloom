// Help Common Handler - Shared functionality for all help pages
(function () {
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

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const topic = document.getElementById("support-topic").value.trim();
      const message = document.getElementById("support-message").value.trim();

      if (!topic || !message) {
        showToast("Please fill in all fields", "error");
        return;
      }

      // Simulate saving support request
      const request = {
        id: Date.now(),
        topic,
        message,
        status: "pending",
        date: new Date().toLocaleDateString(),
      };

      // Store in localStorage (would be sent to backend in production)
      let requests = JSON.parse(localStorage.getItem("supportRequests")) || [];
      requests.push(request);
      localStorage.setItem("supportRequests", JSON.stringify(requests));

      showToast(
        "Support request sent successfully! We'll get back to you soon.",
        "success"
      );
      form.reset();
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
    `;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", initializeHelpPage);
  injectStyles();
})();
