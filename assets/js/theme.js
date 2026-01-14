/**
 * theme.js - Theme switching functionality
 * Handles light/dark mode toggle with persistence and system preference detection
 */

/**
 * ThemeManager - Manages theme switching and persistence
 */
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.body = document.body;
    this.currentTheme = this.getSavedTheme() || this.getSystemTheme();
    this.init();
  }

  /**
   * Initialize theme manager
   */
  init() {
    // Apply saved or system theme
    this.applyTheme(this.currentTheme);

    // Setup toggle button if it exists
    if (this.themeToggle) {
      this.themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });

      // Add keyboard support
      this.themeToggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.toggleTheme();
        }
      });

      // Set ARIA attributes
      this.themeToggle.setAttribute("aria-label", "Toggle theme");
      this.themeToggle.setAttribute("role", "button");
      this.updateThemeIcon(this.currentTheme);
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem("theme")) {
          this.currentTheme = e.matches ? "dark" : "light";
          this.applyTheme(this.currentTheme);
        }
      });
    }
  }

  /**
   * Get saved theme from localStorage
   */
  getSavedTheme() {
    return localStorage.getItem("theme");
  }

  /**
   * Get system theme preference
   */
  getSystemTheme() {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(this.currentTheme);
    this.saveTheme(this.currentTheme);
    this.updateThemeIcon(this.currentTheme);

    // Announce theme change to screen readers
    if (window.announceToScreenReader) {
      window.announceToScreenReader(
        `Theme switched to ${this.currentTheme} mode`
      );
    }

    // Track theme change
    if (window.gtag) {
      gtag("event", "theme_change", {
        theme: this.currentTheme,
      });
    }
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    this.body.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);

    // Update meta theme-color for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute(
      "content",
      theme === "dark" ? "#1a1a1a" : "#ffffff"
    );
  }

  /**
   * Save theme preference to localStorage
   */
  saveTheme(theme) {
    localStorage.setItem("theme", theme);
  }

  /**
   * Update theme toggle icon
   */
  updateThemeIcon(theme) {
    if (!this.themeToggle) return;

    const icons = this.themeToggle.querySelectorAll("i");
    if (icons.length >= 2) {
      // Show sun icon for dark theme (to switch to light)
      // Show moon icon for light theme (to switch to dark)
      icons[0].style.display = theme === "dark" ? "none" : "inline";
      icons[1].style.display = theme === "dark" ? "inline" : "none";
    }

    // Update aria-label
    this.themeToggle.setAttribute(
      "aria-label",
      `Switch to ${theme === "dark" ? "light" : "dark"} theme`
    );
    this.themeToggle.setAttribute("aria-pressed", theme === "dark");
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Set theme programmatically
   */
  setTheme(theme) {
    if (theme === "light" || theme === "dark") {
      this.currentTheme = theme;
      this.applyTheme(theme);
      this.saveTheme(theme);
      this.updateThemeIcon(theme);
    }
  }
}

// Initialize theme manager when DOM is ready
let themeManager;

document.addEventListener("DOMContentLoaded", () => {
  themeManager = new ThemeManager();
  window.themeManager = themeManager;
});

// Export for use in other modules
window.ThemeManager = ThemeManager;
