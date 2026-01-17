/**
 * index.js - Homepage-specific functionality
 * Handles hero section, stats, featured articles, categories, newsletter, and coding challenges
 */

/**
 * HomepageController - Manages all homepage-specific functionality
 */
class HomepageController {
  constructor() {
    this.init();
  }

  init() {
    this.initHeroSection();
    this.initStatsCounters();
    this.initFeaturedCarousel();
    this.initCategoryCards();
    this.initQuickResources();
    this.initNewsletterForm();
    this.initCodingChallenges();
  }

  /**
   * Initialize hero section
   */
  initHeroSection() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const heroContent = hero.querySelector(".hero-content");
    if (heroContent) {
      heroContent.style.opacity = "1";
    }

    // Add scroll-to-cta functionality if needed
    const ctaButtons = hero.querySelectorAll(".cta-button, .btn-primary");
    ctaButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const href = button.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target && window.AppUtils) {
            AppUtils.smoothScrollTo(target, 80);
          }
        }
      });
    });
  }

  /**
   * Initialize statistics counters
   */
  initStatsCounters() {
    const statNumbers = document.querySelectorAll(".stat-number");
    if (statNumbers.length === 0) return;

    statNumbers.forEach((stat) => {
      // Display the value immediately (no animation per user request)
      const originalText = stat.textContent;
      stat.textContent = originalText;
    });
  }

  /**
   * Initialize featured articles carousel
   */
  initFeaturedCarousel() {
    const carousel = document.querySelector(
      ".articles-carousel, .recent-articles"
    );
    if (!carousel) return;

    const articles = carousel.querySelectorAll(".article-card");
    articles.forEach((article) => {
      article.style.display = "block";
    });

    // Add click tracking for featured articles
    articles.forEach((article) => {
      article.addEventListener("click", () => {
        const title = article.querySelector("h3, .card-title")?.textContent;
        if (title && window.gtag) {
          gtag("event", "featured_article_click", {
            article_title: title,
          });
        }
      });
    });
  }

  /**
   * Initialize category cards with click handlers
   */
  initCategoryCards() {
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        const category =
          card.dataset.category || card.querySelector("h3")?.textContent;
        if (category && window.gtag) {
          gtag("event", "category_click", {
            category_name: category,
          });
        }
      });
    });
  }

  /**
   * Initialize quick resources section
   */
  initQuickResources() {
    const resourceCards = document.querySelectorAll(".resource-card");
    resourceCards.forEach((card) => {
      card.addEventListener("click", () => {
        const resourceName = card.querySelector("h3, h4")?.textContent;
        if (resourceName && window.gtag) {
          gtag("event", "resource_click", {
            resource_name: resourceName,
          });
        }
      });
    });
  }

  /**
   * Initialize newsletter subscription form
   */
  initNewsletterForm() {
    const newsletterForm = document.querySelector(".newsletter-form");
    if (!newsletterForm) return;

    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const submitButton = newsletterForm.querySelector('button[type="submit"]');

    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!emailInput || !emailInput.value) return;

      const email = emailInput.value.trim();

      // Validate email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this.showFormMessage(
          newsletterForm,
          "Please enter a valid email address",
          "error"
        );
        return;
      }

      // Disable form during submission
      submitButton.disabled = true;
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Subscribing...';

      try {
        // Store in localStorage
        const subscribers = JSON.parse(
          localStorage.getItem("newsletter_subscribers") || "[]"
        );
        if (!subscribers.includes(email)) {
          subscribers.push(email);
          localStorage.setItem(
            "newsletter_subscribers",
            JSON.stringify(subscribers)
          );
        }

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        this.showFormMessage(
          newsletterForm,
          "Successfully subscribed! Check your email.",
          "success"
        );
        emailInput.value = "";

        // Track subscription
        if (window.gtag) {
          gtag("event", "newsletter_subscribe", {
            email: email,
          });
        }
      } catch (error) {
        this.showFormMessage(
          newsletterForm,
          "Subscription failed. Please try again.",
          "error"
        );
        console.error("Newsletter subscription error:", error);
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    });
  }

  /**
   * Initialize coding challenges section
   */
  initCodingChallenges() {
    const challengeButtons = document.querySelectorAll(".challenge-btn");
    challengeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const challengeCard = button.closest(".challenge-card");
        const challengeTitle = challengeCard?.querySelector("h3")?.textContent;

        if (challengeTitle) {
          // Track challenge start
          if (window.gtag) {
            gtag("event", "challenge_start", {
              challenge_name: challengeTitle,
            });
          }
          console.log("Starting challenge:", challengeTitle);
        }
      });
    });
  }

  /**
   * Show form message helper
   */
  showFormMessage(form, message, type) {
    const existing = form.querySelector(".form-message");
    if (existing) existing.remove();

    const messageEl = document.createElement("div");
    messageEl.className = `form-message form-message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      margin-top: 10px;
      padding: 10px;
      border-radius: 4px;
      background: ${type === "error" ? "#fee" : "#efe"};
      color: ${type === "error" ? "#c33" : "#3c3"};
      font-size: 14px;
    `;

    form.appendChild(messageEl);

    setTimeout(() => {
      messageEl.style.opacity = "0";
      messageEl.style.transition = "opacity 0.3s";
      setTimeout(() => messageEl.remove(), 300);
    }, 5000);
  }
}

// Initialize homepage when DOM is ready
function initIndex() {
  const isHomepage =
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("index.html") ||
    document.querySelector(".hero");

  if (isHomepage) {
    window.homepageController = new HomepageController();
  }
}

// Auto-initialize if on homepage
document.addEventListener("DOMContentLoaded", () => {
  initIndex();
});

// Export for manual initialization
window.initIndex = initIndex;
