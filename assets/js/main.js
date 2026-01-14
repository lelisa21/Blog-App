/**
 * main.js - Global entry point and initialization
 * Handles core site-wide functionality: search, navigation, profile menu, dropdowns
 * Initializes shared utilities and coordinates page-specific modules
 */

// Wait for DOM to be fully loaded before initializing
document.addEventListener("DOMContentLoaded", () => {
  // Initialize core features
  initSearch();
  initProfileMenu();
  initDropdowns();
  initKeyboardShortcuts();
  initPerformanceMonitoring();
  initAccessibilityFeatures();

  // Initialize page-specific modules if they exist
  if (typeof window.initIndex === "function") window.initIndex();
  if (typeof window.initArticles === "function") window.initArticles();
  if (typeof window.initPost === "function") window.initPost();
  if (typeof window.initCommunity === "function") window.initCommunity();
  if (typeof window.initEvents === "function") window.initEvents();
});

/**
 * Initialize global search functionality with overlay and keyboard shortcuts
 */
function initSearch() {
  const searchInput = document.querySelector(".search-input");
  const searchOverlay = document.querySelector(".search-overlay");

  if (!searchInput || !searchOverlay) return;

  // Show overlay on focus
  searchInput.addEventListener("focus", () => {
    searchOverlay.style.display = "block";
    searchInput.setAttribute("aria-expanded", "true");
  });

  // Hide overlay when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".search-container") &&
      !e.target.closest(".search-input")
    ) {
      searchOverlay.style.display = "none";
      searchInput.setAttribute("aria-expanded", "false");
    }
  });

  // Handle search submission
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter" && searchInput.value.trim()) {
      const query = encodeURIComponent(searchInput.value.trim());
      window.location.href = `articles.html?search=${query}`;
    }
  });

  // Add ARIA attributes for accessibility
  searchInput.setAttribute("role", "searchbox");
  searchInput.setAttribute(
    "aria-label",
    "Search articles, tutorials, and developers"
  );
  searchInput.setAttribute("aria-expanded", "false");
}

/**
 * Initialize profile menu with click outside to close and keyboard navigation
 */
function initProfileMenu() {
  const profileBtn = document.querySelector(".profile-btn");
  const profileMenu = document.querySelector(".profile-menu");

  if (!profileBtn || !profileMenu) return;

  // Toggle menu on button click
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = profileMenu.classList.contains("show");
    profileMenu.classList.toggle("show");
    profileBtn.setAttribute("aria-expanded", !isOpen);

    // Focus first menu item when opened
    if (!isOpen) {
      const firstLink = profileMenu.querySelector("a");
      if (firstLink) setTimeout(() => firstLink.focus(), 100);
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-profile")) {
      profileMenu.classList.remove("show");
      profileBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Keyboard navigation: Escape to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && profileMenu.classList.contains("show")) {
      profileMenu.classList.remove("show");
      profileBtn.setAttribute("aria-expanded", "false");
      profileBtn.focus();
    }
  });

  // ARIA attributes
  profileBtn.setAttribute("aria-haspopup", "true");
  profileBtn.setAttribute("aria-expanded", "false");
  profileMenu.setAttribute("role", "menu");
}

/**
 * Initialize dropdown menus with proper keyboard navigation and accessibility
 */
function initDropdowns() {
  const dropdowns = document.querySelectorAll(".nav-dropdown, .dropdown");

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".nav-item, .dropdown-toggle");
    const menu = dropdown.querySelector(".dropdown-content, .dropdown-menu");

    if (!toggle || !menu) return;

    // Click handler
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Close other dropdowns
      dropdowns.forEach((other) => {
        if (other !== dropdown) {
          const otherMenu = other.querySelector(
            ".dropdown-content, .dropdown-menu"
          );
          if (otherMenu) {
            otherMenu.classList.remove("show");
            const otherToggle = other.querySelector(
              ".nav-item, .dropdown-toggle"
            );
            if (otherToggle) otherToggle.setAttribute("aria-expanded", "false");
          }
        }
      });

      // Toggle current dropdown
      const isOpen = menu.classList.contains("show");
      menu.classList.toggle("show");
      toggle.setAttribute("aria-expanded", !isOpen);
    });

    // Keyboard navigation
    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle.click();
      } else if (e.key === "ArrowDown" && menu.classList.contains("show")) {
        e.preventDefault();
        const firstItem = menu.querySelector("a");
        if (firstItem) firstItem.focus();
      }
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!e.target.closest(dropdown)) {
        menu.classList.remove("show");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // ARIA attributes
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    menu.setAttribute("role", "menu");
  });
}

/**
 * Initialize keyboard shortcuts for power users
 * Ctrl/Cmd + K: Open search
 * Escape: Close modals/overlays
 */
function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + K: Open search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      const searchInput = document.querySelector(".search-input");
      const searchOverlay = document.querySelector(".search-overlay");
      if (searchInput && searchOverlay) {
        searchOverlay.style.display = "block";
        searchInput.focus();
        searchInput.setAttribute("aria-expanded", "true");
      }
    }

    // Escape: Close any open overlays/modals
    if (e.key === "Escape") {
      const openOverlay = document.querySelector(
        '.search-overlay[style*="block"]'
      );
      if (openOverlay) {
        openOverlay.style.display = "none";
        const searchInput = document.querySelector(".search-input");
        if (searchInput) searchInput.setAttribute("aria-expanded", "false");
      }
    }
  });
}

/**
 * Initialize performance monitoring for Ethiopian network conditions
 * Logs performance metrics to help optimize for low-bandwidth scenarios
 */
function initPerformanceMonitoring() {
  // Only run in development or if explicitly enabled
  if (
    !window.location.hostname.includes("localhost") &&
    !localStorage.getItem("enablePerfMonitoring")
  ) {
    return;
  }

  // Monitor page load performance
  window.addEventListener("load", () => {
    if ("performance" in window && "timing" in window.performance) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domReadyTime =
        perfData.domContentLoadedEventEnd - perfData.navigationStart;

      // Log if performance is poor (important for Ethiopian network conditions)
      if (pageLoadTime > 3000) {
        console.warn(
          `Page load time: ${pageLoadTime}ms (consider optimizing for low-bandwidth)`
        );
      }

      // Store in localStorage for analytics
      const perfMetrics = {
        pageLoad: pageLoadTime,
        domReady: domReadyTime,
        timestamp: Date.now(),
      };
      localStorage.setItem("perfMetrics", JSON.stringify(perfMetrics));
    }
  });

  // Monitor network connection if available
  if ("connection" in navigator) {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (connection) {
      connection.addEventListener("change", () => {
        console.log("Network changed:", {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        });
      });
    }
  }
}

/**
 * Initialize accessibility features
 * Adds skip links, focus management, and ARIA live regions
 */
function initAccessibilityFeatures() {
  // Create skip to main content link if it doesn't exist
  if (!document.querySelector(".skip-link")) {
    const skipLink = document.createElement("a");
    skipLink.href = "#main";
    skipLink.className = "skip-link";
    skipLink.textContent = "Skip to main content";
    skipLink.style.cssText = "position:absolute;left:-9999px;z-index:999;";
    skipLink.addEventListener("focus", () => {
      skipLink.style.left = "10px";
      skipLink.style.top = "10px";
    });
    skipLink.addEventListener("blur", () => {
      skipLink.style.left = "-9999px";
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Add ARIA live region for dynamic content updates
  if (!document.querySelector("#aria-live-region")) {
    const liveRegion = document.createElement("div");
    liveRegion.id = "aria-live-region";
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    liveRegion.style.cssText =
      "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;";
    document.body.appendChild(liveRegion);
  }

  // Announce page changes for screen readers
  window.announceToScreenReader = (message) => {
    const liveRegion = document.querySelector("#aria-live-region");
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = "";
      }, 1000);
    }
  };
}

/**
 * Initialize resources page features if on resources page
 */
function initResourcesPage() {
  if (
    !document.querySelector(".resources-grid-section, .learning-paths-section")
  ) {
    return;
  }

  // Ethiopian time display
  const updateTime = () => {
    const now = new Date();
    const ethiopiaTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const timeString = ethiopiaTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Africa/Addis_Ababa",
    });

    const timeElements = document.querySelectorAll(
      "#current-time, #footer-time"
    );
    timeElements.forEach((el) => {
      if (el) el.textContent = timeString + " GMT+3";
    });
  };

  updateTime();
  setInterval(updateTime, 1000);

  // Progress tracking
  ["web", "mobile", "ai"].forEach((path) => {
    const saved = localStorage.getItem(`${path}-progress`);
    if (saved) {
      const fill = document.querySelector(`#${path}-path .progress-fill`);
      const info = document.querySelector(`#${path}-path .progress-info span`);
      if (fill) fill.style.width = `${saved}%`;
      if (info) info.textContent = `${saved}% Complete`;
    }
  });

  // Make updateProgress function available globally
  window.updateProgress = (path, amount) => {
    const current = parseInt(localStorage.getItem(`${path}-progress`) || "0");
    const newProgress = Math.min(current + amount, 100);
    localStorage.setItem(`${path}-progress`, newProgress.toString());

    const fill = document.querySelector(`#${path}-path .progress-fill`);
    const info = document.querySelector(`#${path}-path .progress-info span`);
    if (fill) fill.style.width = `${newProgress}%`;
    if (info) info.textContent = `${newProgress}% Complete`;

    if (window.announceToScreenReader) {
      window.announceToScreenReader(`Progress updated to ${newProgress}%`);
    }
  };

  // Download resource handler
  window.downloadResource = (resourceType) => {
    alert(`Download for ${resourceType} coming soon!`);
    const downloads = JSON.parse(
      localStorage.getItem("resource_downloads") || "[]"
    );
    downloads.push({
      type: resourceType,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("resource_downloads", JSON.stringify(downloads));
  };

  // Learning path card interactions
  const pathCards = document.querySelectorAll(".path-card");
  pathCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      pathCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  });
}

// Initialize resources page if needed
document.addEventListener("DOMContentLoaded", () => {
  initResourcesPage();
});

/**
 * Initialize resources page features
 */
function initResourcesPage() {
  // Ethiopian time display
  const updateTime = () => {
    const now = new Date();
    const ethiopiaTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const timeString = ethiopiaTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Africa/Addis_Ababa",
    });

    const timeElements = document.querySelectorAll(
      "#current-time, #footer-time"
    );
    timeElements.forEach((el) => {
      if (el) el.textContent = timeString + " GMT+3";
    });
  };

  updateTime();
  setInterval(updateTime, 1000);

  // Progress tracking
  ["web", "mobile", "ai"].forEach((path) => {
    const saved = localStorage.getItem(`${path}-progress`);
    if (saved) {
      const fill = document.querySelector(`#${path}-path .progress-fill`);
      const info = document.querySelector(`#${path}-path .progress-info span`);
      if (fill) fill.style.width = `${saved}%`;
      if (info) info.textContent = `${saved}% Complete`;
    }
  });

  // Make updateProgress function available globally
  window.updateProgress = (path, amount) => {
    const current = parseInt(localStorage.getItem(`${path}-progress`) || "0");
    const newProgress = Math.min(current + amount, 100);
    localStorage.setItem(`${path}-progress`, newProgress.toString());

    const fill = document.querySelector(`#${path}-path .progress-fill`);
    const info = document.querySelector(`#${path}-path .progress-info span`);
    if (fill) fill.style.width = `${newProgress}%`;
    if (info) info.textContent = `${newProgress}% Complete`;

    if (window.announceToScreenReader) {
      window.announceToScreenReader(`Progress updated to ${newProgress}%`);
    }
  };

  // Download resource handler
  window.downloadResource = (resourceType) => {
    alert(`Download for ${resourceType} coming soon!`);
    const downloads = JSON.parse(
      localStorage.getItem("resource_downloads") || "[]"
    );
    downloads.push({
      type: resourceType,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("resource_downloads", JSON.stringify(downloads));
  };

  // Learning path card interactions
  const pathCards = document.querySelectorAll(".path-card");
  pathCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      pathCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  });
}

// Export functions for use in other modules
window.mainInit = {
  initSearch,
  initProfileMenu,
  initDropdowns,
};
