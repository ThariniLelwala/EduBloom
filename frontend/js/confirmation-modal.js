/**
 * Confirmation Modal Utility
 * Replaces browser alert() confirmations with styled modals
 */

// Global confirmation modal state
let confirmationResolve = null;
let confirmationModal = null;

/**
 * Initialize confirmation modal
 * Call this once when the page loads
 */
function initConfirmationModal() {
  // Create modal HTML if it doesn't exist
  if (!document.getElementById("confirmation-modal")) {
    const modalHTML = `
      <div id="confirmation-modal" class="modal confirmation-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Confirm Action</h2>
            <button class="modal-close" id="confirmation-close">&times;</button>
          </div>
          <div class="modal-body">
            <p id="confirmation-message">Are you sure?</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" id="confirmation-cancel">Cancel</button>
            <button class="btn-primary" id="confirmation-confirm">Delete</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  confirmationModal = document.getElementById("confirmation-modal");
  const closeBtn = document.getElementById("confirmation-close");
  const cancelBtn = document.getElementById("confirmation-cancel");
  const confirmBtn = document.getElementById("confirmation-confirm");

  // Event listeners
  closeBtn.addEventListener("click", () => resolveConfirmation(false));
  cancelBtn.addEventListener("click", () => resolveConfirmation(false));
  confirmBtn.addEventListener("click", () => resolveConfirmation(true));

  // Close on outside click
  confirmationModal.addEventListener("click", (e) => {
    if (e.target === confirmationModal) {
      resolveConfirmation(false);
    }
  });
}

/**
 * Show confirmation modal
 * @param {string} message - The confirmation message
 * @param {string} confirmText - Text for confirm button (default: "Delete")
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
function showConfirmation(message, confirmText = "Delete") {
  return new Promise((resolve) => {
    if (!confirmationModal) {
      initConfirmationModal();
    }

    document.getElementById("confirmation-message").textContent = message;
    document.getElementById("confirmation-confirm").textContent = confirmText;

    confirmationResolve = resolve;
    confirmationModal.style.display = "flex";
  });
}

/**
 * Resolve the confirmation promise
 * @param {boolean} result - The result of the confirmation
 */
function resolveConfirmation(result) {
  if (confirmationModal) {
    confirmationModal.style.display = "none";
  }
  if (confirmationResolve) {
    confirmationResolve(result);
    confirmationResolve = null;
  }
}

// Auto-initialize on DOM load
document.addEventListener("DOMContentLoaded", initConfirmationModal);
