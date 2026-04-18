// emptyState.js - Empty state component for displaying helpful messages when no data is available

/**
 * Show empty state in a container
 * @param {string} containerId - The ID of the container to show empty state in
 * @param {Object} config - Configuration object for the empty state
 * @param {string} config.icon - FontAwesome icon class (e.g., 'fa-clock')
 * @param {string} config.message - Main message to display
 * @param {string} config.subtext - Subtext with additional context
 * @param {string} config.ctaText - Optional CTA button text
 * @param {Function} config.ctaAction - Optional CTA button click handler
 */
function showEmptyState(containerId, config) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Build empty state HTML
  let html = `
    <div class="empty-state">
      <div class="empty-state-icon">
        <i class="fas ${config.icon || 'fa-info-circle'}"></i>
      </div>
      <div class="empty-state-message">${config.message || 'No data available'}</div>
  `;

  // Add subtext if provided
  if (config.subtext) {
    html += `<div class="empty-state-subtext">${config.subtext}</div>`;
  }

  // Add CTA button if provided
  if (config.ctaText && config.ctaAction) {
    html += `<button class="empty-state-cta">${config.ctaText}</button>`;
  }

  html += `</div>`;

  // Clear container and add empty state
  container.innerHTML = html;

  // Add CTA button event listener if provided
  if (config.ctaText && config.ctaAction) {
    const ctaButton = container.querySelector('.empty-state-cta');
    if (ctaButton) {
      ctaButton.addEventListener('click', config.ctaAction);
    }
  }
}

/**
 * Show empty state in a chart container
 * @param {string} containerId - The ID of the chart container
 * @param {Object} config - Configuration object for the empty state
 */
function showChartEmptyState(containerId, config) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Find the chart-container within the card
  const chartContainer = container.querySelector('.chart-container');
  if (!chartContainer) return;

  // Hide the canvas element if it exists
  const canvas = chartContainer.querySelector('canvas');
  if (canvas) {
    canvas.style.display = 'none';
  }

  // Build empty state HTML for chart
  const html = `
    <div class="chart-empty-state">
      <div class="chart-empty-icon">
        <i class="fas ${config.icon || 'fa-chart-line'}"></i>
      </div>
      <div class="chart-empty-message">${config.message || 'No data available'}</div>
      ${config.subtext ? `<div class="chart-empty-subtext">${config.subtext}</div>` : ''}
    </div>
  `;

  // Add empty state to chart container
  chartContainer.insertAdjacentHTML('beforeend', html);
}

/**
 * Clear empty state from a container
 * @param {string} containerId - The ID of the container to clear
 */
function clearEmptyState(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const emptyState = container.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }

  const chartEmptyState = container.querySelector('.chart-empty-state');
  if (chartEmptyState) {
    chartEmptyState.remove();
  }

  // Show the canvas element again if it exists
  const chartContainer = container.querySelector('.chart-container');
  if (chartContainer) {
    const canvas = chartContainer.querySelector('canvas');
    if (canvas) {
      canvas.style.display = 'block';
    }
  }
}

/**
 * Check if container has empty state
 * @param {string} containerId - The ID of the container to check
 * @returns {boolean} True if container has empty state
 */
function hasEmptyState(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return false;

  return container.querySelector('.empty-state') !== null || 
         container.querySelector('.chart-empty-state') !== null;
}

// Predefined empty state configurations
const emptyStateConfigs = {
  noPomodoroSessions: {
    icon: 'fa-clock',
    message: 'No study sessions recorded yet',
    subtext: 'Encourage your child to use Pomodoro timer for focused study sessions'
  },
  noMentalLogs: {
    icon: 'fa-brain',
    message: 'No mood/energy logs yet',
    subtext: 'Mental tracking helps understand study patterns and wellbeing'
  },
  noExams: {
    icon: 'fa-clipboard-list',
    message: 'No exam results recorded',
    subtext: 'Track exam performance to monitor academic progress over time'
  },
  noMarks: {
    icon: 'fa-book',
    message: 'No subject marks recorded',
    subtext: 'Regular mark tracking helps identify areas for improvement'
  },
  noTasks: {
    icon: 'fa-tasks',
    message: 'No tasks created yet',
    subtext: 'Set goals and track task completion for better productivity'
  },
  noGPA: {
    icon: 'fa-graduation-cap',
    message: 'No GPA data recorded',
    subtext: 'Track semester performance to monitor academic progress'
  },
  noChildren: {
    icon: 'fa-user-plus',
    message: 'No children linked to your account',
    subtext: 'Link a child to view their progress and support their learning journey'
  },
  noMonthlyData: {
    icon: 'fa-calendar-alt',
    message: 'No session data for this period',
    subtext: 'Session data will appear here once your child starts studying'
  },
  noExamData: {
    icon: 'fa-chart-line',
    message: 'No exam data available',
    subtext: 'Exam results will be displayed here once recorded'
  },
  noMarkData: {
    icon: 'fa-chart-bar',
    message: 'No mark data available',
    subtext: 'Subject marks will be displayed here once recorded'
  }
};

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showEmptyState,
    showChartEmptyState,
    clearEmptyState,
    hasEmptyState,
    emptyStateConfigs
  };
}