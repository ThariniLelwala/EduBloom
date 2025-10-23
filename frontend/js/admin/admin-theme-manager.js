// ===== Admin Theme Manager =====
// This utility manages themes across all admin pages

class AdminThemeManager {
  constructor() {
    this.themes = ["dark", "light", "blue", "purple", "green"];
    this.currentTheme = localStorage.getItem("adminTheme") || "dark";
    this.initializeThemeSync();
  }

  /**
   * Initialize theme synchronization across pages
   */
  initializeThemeSync() {
    // Listen for storage changes from other tabs
    window.addEventListener("storage", (e) => {
      if (e.key === "adminTheme" && e.newValue) {
        this.applyTheme(e.newValue);
      }
    });

    // Listen for custom theme change events
    window.addEventListener("adminThemeChange", (e) => {
      const { theme } = e.detail;
      this.applyTheme(theme);
    });

    // Apply saved theme on load
    this.applyTheme(this.currentTheme);
  }

  /**
   * Apply theme to the current page
   */
  applyTheme(theme) {
    if (!this.themes.includes(theme)) return;

    const root = document.documentElement;
    const body = document.body;

    // Remove all theme classes
    this.themes.forEach((t) => {
      root.classList.remove(`theme-${t}`);
      body.classList.remove(`theme-${t}`);
    });

    // Apply new theme
    root.classList.add(`theme-${theme}`);
    body.classList.add(`theme-${theme}`);

    this.currentTheme = theme;
    localStorage.setItem("adminTheme", theme);

    // Dispatch event for page-specific handlers
    window.dispatchEvent(
      new CustomEvent("themeApplied", {
        detail: { theme },
      })
    );
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Broadcast theme change to all admin pages
   */
  broadcastTheme(theme) {
    this.applyTheme(theme);
    sessionStorage.setItem(
      "adminThemeChange",
      JSON.stringify({ theme, timestamp: Date.now() })
    );
  }

  /**
   * Bind theme selector to theme manager
   */
  bindThemeSelector(selectElementId) {
    const select = document.getElementById(selectElementId);
    if (!select) return;

    select.value = this.currentTheme;
    select.addEventListener("change", (e) => {
      this.broadcastTheme(e.target.value);
    });
  }
}

// Create global instance
const adminTheme = new AdminThemeManager();
