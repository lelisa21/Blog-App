/**
 * app.js - Common utilities and shared functionality
 * Incorporates utils.js, contact.js, and about.js features
 */

/**
 * AppUtils - Main utility class with static methods
 */
class AppUtils {
  /**
   * Format date with Ethiopian context support
   */
  static formatDate(date, options = {}) {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      console.warn("Invalid date provided to formatDate:", date);
      return "Invalid date";
    }

    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };

    return dateObj.toLocaleDateString("en-US", defaultOptions);
  }

  /**
   * Debounce function to limit how often a function can be called
   */
  static debounce(func, wait = 300, immediate = false) {
    if (typeof func !== "function") {
      throw new Error("First argument must be a function");
    }

    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  }

  /**
   * Throttle function to limit function execution rate
   */
  static throttle(func, limit = 300) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Parse URL query parameters
   */
  static getQueryParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);

    for (const [key, value] of searchParams.entries()) {
      params[key] = decodeURIComponent(value);
    }

    // Fallback for older browsers
    if (Object.keys(params).length === 0 && window.location.search) {
      window.location.search
        .substring(1)
        .split("&")
        .forEach((pair) => {
          const [key, value] = pair.split("=");
          if (key)
            params[decodeURIComponent(key)] = decodeURIComponent(value || "");
        });
    }

    return params;
  }

  /**
   * Get a specific query parameter value
   */
  static getQueryParam(key, defaultValue = "") {
    const params = this.getQueryParams();
    return params[key] || defaultValue;
  }

  /**
   * Update URL query parameters without page reload
   */
  static updateQueryParams(params, replace = false) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });

    if (replace) {
      window.history.replaceState({}, "", url);
    } else {
      window.history.pushState({}, "", url);
    }
  }

  /**
   * Calculate reading time for text content
   */
  static calculateReadingTime(text, wordsPerMinute = 200) {
    if (!text || typeof text !== "string") return 0;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  /**
   * Truncate text to specified length with ellipsis
   */
  static truncate(text, maxLength = 100, suffix = "...") {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length).trim() + suffix;
  }

  /**
   * Escape HTML to prevent XSS attacks
   */
  static escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Smooth scroll to element with offset for fixed headers
   */
  static smoothScrollTo(target, offset = 80, duration = 500) {
    const element =
      typeof target === "string" ? document.querySelector(target) : target;

    if (!element) {
      console.warn("Target element not found for smooth scroll");
      return;
    }

    const targetPosition =
      element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }

  /**
   * Copy text to clipboard with fallback
   */
  static async copyToClipboard(text) {
    if (!text) return false;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error("Failed to copy text:", error);
      return false;
    }
  }

  /**
   * Detect network speed for Ethiopian context optimization
   */
  static detectNetworkSpeed() {
    if ("connection" in navigator) {
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;
      if (connection) {
        const downlink = connection.downlink || 0;
        if (downlink < 0.1) return "2G";
        if (downlink < 2) return "3G";
        return "4G+";
      }
    }
    return "unknown";
  }

  /**
   * Format number with Ethiopian number formatting
   */
  static formatNumber(num, options = {}) {
    const defaultOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options,
    };
    return new Intl.NumberFormat("en-US", defaultOptions).format(num);
  }

  /**
   * Get Ethiopian timezone offset and current time
   */
  static getEthiopianTime() {
    const now = new Date();
    const ethiopianTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    return {
      time: ethiopianTime,
      timezone: "EAT",
      offset: "+03:00",
    };
  }

  /**
   * Check if element is in viewport
   */
  static isInViewport(element, threshold = 0) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;

    const visibleHeight =
      Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const visibleWidth =
      Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
    const visibleArea = visibleHeight * visibleWidth;
    const elementArea = rect.height * rect.width;

    return elementArea > 0 && visibleArea / elementArea >= threshold;
  }

  /**
   * Lazy load images with intersection observer
   */
  static lazyLoadImages(images) {
    if (!("IntersectionObserver" in window)) {
      images.forEach((img) => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
      });
      return;
    }

    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
              img.classList.add("loaded");
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    images.forEach((img) => {
      if (img.dataset.src) {
        imageObserver.observe(img);
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Set current year in footer
  const yearElements = document.querySelectorAll(".current-year");
  if (yearElements.length > 0) {
    const currentYear = new Date().getFullYear();
    yearElements.forEach((el) => {
      el.textContent = currentYear;
    });
  }

  // Add loading states to buttons
  document.querySelectorAll('button[type="submit"]').forEach((button) => {
    button.addEventListener("click", function () {
      if (this.form && this.form.checkValidity()) {
        const originalHTML = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        this.disabled = true;

        // Re-enable after 5 seconds as fallback
        setTimeout(() => {
          if (this.disabled) {
            this.innerHTML = originalHTML;
            this.disabled = false;
          }
        }, 5000);
      }
    });
  });

  // Initialize lazy loading for images
  const lazyImages = document.querySelectorAll("img[data-src]");
  if (lazyImages.length > 0) {
    AppUtils.lazyLoadImages(lazyImages);
  }

  // Initialize contact form if on contact page
  initContactForm();

  // Initialize resources page features if on resources page
  if (
    document.querySelector(".resources-grid-section, .learning-paths-section")
  ) {
    initResourcesPage();
  }
});

/**
 * Initialize contact form with validation and submission
 */
function initContactForm() {
  const contactForm = document.querySelector(".contact-form-section form");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      name: contactForm.querySelector("#name")?.value || "",
      email: contactForm.querySelector("#email")?.value || "",
      subject: contactForm.querySelector("#subject")?.value || "",
      message: contactForm.querySelector("#message")?.value || "",
    };

    // Validate form
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      showFormMessage(contactForm, "Please fill in all fields", "error");
      return;
    }

    if (!isValidEmail(formData.email)) {
      showFormMessage(
        contactForm,
        "Please enter a valid email address",
        "error"
      );
      return;
    }

    // Disable submit button
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent || "Send Message";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    try {
      // Store in localStorage as fallback
      const submissions = JSON.parse(
        localStorage.getItem("contact_submissions") || "[]"
      );
      submissions.push({
        ...formData,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("contact_submissions", JSON.stringify(submissions));

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showFormMessage(
        contactForm,
        "Message sent successfully! We'll get back to you soon.",
        "success"
      );
      contactForm.reset();
    } catch (error) {
      showFormMessage(
        contactForm,
        "Failed to send message. Please try again.",
        "error"
      );
      console.error("Contact form error:", error);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Show form message (success or error)
 */
function showFormMessage(form, message, type) {
  // Remove existing messages
  const existing = form.querySelector(".form-message");
  if (existing) existing.remove();

  const messageEl = document.createElement("div");
  messageEl.className = `form-message form-message-${type}`;
  messageEl.textContent = message;
  messageEl.style.cssText = `
    margin-top: 15px;
    padding: 12px;
    border-radius: 4px;
    background: ${type === "error" ? "#fee" : "#efe"};
    color: ${type === "error" ? "#c33" : "#3c3"};
    font-size: 14px;
  `;

  form.appendChild(messageEl);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageEl.style.opacity = "0";
    messageEl.style.transition = "opacity 0.3s";
    setTimeout(() => messageEl.remove(), 300);
  }, 5000);
}

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

// Export for use in other modules
window.AppUtils = AppUtils;
