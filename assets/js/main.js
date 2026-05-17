document.addEventListener("DOMContentLoaded", () => {
  initSearch();
  initAuthExperience();
  initProfileMenu();
  initDropdowns();
  initKeyboardShortcuts();
  initPerformanceMonitoring();
  initAccessibilityFeatures();
  initResourcesPage();

  if (typeof window.initIndex === "function") window.initIndex();
  if (typeof window.initArticles === "function") window.initArticles();
  if (typeof window.initPost === "function") window.initPost();
  if (typeof window.initCommunity === "function") window.initCommunity();
  if (typeof window.initEvents === "function") window.initEvents();
});

const CURRENT_FILE = (() => {
  const pathname = window.location.pathname || "";
  const parts = pathname.split("/").filter(Boolean);
  return (parts.pop() || "index.html").toLowerCase();
})();

function isHomePage() {
  return CURRENT_FILE === "index.html" || window.location.pathname === "/";
}

function isProtectedPage() {
  return !isHomePage() && document.body?.dataset?.authRequired !== "false";
}

function initSearch() {
  const searchInput = document.querySelector(".search-input");
  const searchOverlay = document.querySelector(".search-overlay");

  if (!searchInput || !searchOverlay) return;

  searchInput.addEventListener("focus", () => {
    searchOverlay.style.display = "block";
    searchInput.setAttribute("aria-expanded", "true");
  });

  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".search-container") &&
      !e.target.closest(".search-input")
    ) {
      searchOverlay.style.display = "none";
      searchInput.setAttribute("aria-expanded", "false");
    }
  });

  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter" && searchInput.value.trim()) {
      const query = encodeURIComponent(searchInput.value.trim());
      window.location.href = `articles.html?search=${query}`;
    }
  });

  searchInput.setAttribute("role", "searchbox");
  searchInput.setAttribute(
    "aria-label",
    "Search articles, tutorials, and developers"
  );
  searchInput.setAttribute("aria-expanded", "false");
}

function initAuthExperience() {
  if (!window.ETCAuth || !window.ETCApi) return;

  ensureAuthStyles();
  ensureAuthModal();
  ensureNavAuthShell();

  const profileButton = document.querySelector(".profile-btn");
  const profileMenu = document.querySelector(".profile-menu");
  const userName = document.querySelector(".user-name");
  const avatar = document.querySelector(".avatar");
  const authModal = document.getElementById("authModal");
  const authTabs = document.querySelectorAll("[data-auth-tab]");
  const authPanels = document.querySelectorAll("[data-auth-panel]");
  const authCloseButtons = document.querySelectorAll("[data-auth-close]");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const menuLinks = document.querySelectorAll(".profile-menu a[data-auth-action]");
  const menuIconMap = {
    "open-login": "fa-right-to-bracket",
    "open-register": "fa-user-plus",
    logout: "fa-sign-out-alt",
  };

  const params = new URLSearchParams(window.location.search);
  const requestedAuthPanel = params.get("auth");

  const setLinkLabel = (link, label) => {
    const icon = menuIconMap[link.dataset.authAction];
    link.innerHTML = icon ? `<i class="fas ${icon}"></i> ${label}` : label;
  };

  const toggleAuthPanel = (panel) => {
    authTabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.authTab === panel);
    });
    authPanels.forEach((section) => {
      section.hidden = section.dataset.authPanel !== panel;
    });
  };

  const openAuthModal = (panel = "login") => {
    if (!authModal) return;
    authModal.classList.add("show");
    authModal.setAttribute("aria-hidden", "false");
    toggleAuthPanel(panel);
  };

  const closeAuthModal = () => {
    if (!authModal) return;
    authModal.classList.remove("show");
    authModal.setAttribute("aria-hidden", "true");
  };

  const setMenuState = (session) => {
    const user = session?.user || null;

    if (userName) {
      userName.textContent = user ? user.full_name || user.username : "Sign In";
    }

    if (avatar) {
      avatar.innerHTML = user
        ? `${window.ETCAuth.initials(user)}<span class="status-indicator online"></span>`
        : '<i class="far fa-user"></i><span class="status-indicator"></span>';
    }

    menuLinks.forEach((link) => {
      const action = link.dataset.authAction;
      if (action === "open-login") {
        setLinkLabel(link, user ? "Switch Account" : "Login");
      }
      if (action === "open-register") {
        setLinkLabel(link, user ? "Create Another Account" : "Create Account");
      }
      if (action === "logout") {
        setLinkLabel(link, "Sign Out");
        link.style.display = user ? "flex" : "none";
      }
    });

    document.querySelectorAll(".write-btn").forEach((button) => {
      if (user) {
        button.removeAttribute("data-auth-guard");
      } else {
        button.setAttribute("data-auth-guard", "true");
      }
    });
  };

  const showAuthMessage = (form, message, type) => {
    if (typeof showFormMessage === "function") {
      showFormMessage(form, message, type);
      return;
    }

    const existing = form.querySelector(".form-message");
    if (existing) existing.remove();

    const messageEl = document.createElement("div");
    messageEl.className = `form-message form-message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      margin-top: 10px;
      padding: 10px;
      border-radius: 8px;
      background: ${type === "error" ? "rgba(255,92,132,.14)" : "rgba(46,204,113,.14)"};
      color: ${type === "error" ? "#ffbfd0" : "#a7f0bf"};
      font-size: 14px;
    `;
    form.appendChild(messageEl);
  };

  const redirectAfterAuth = () => {
    const returnTo = params.get("returnTo") || sessionStorage.getItem("etc_return_to");
    if (returnTo) {
      sessionStorage.removeItem("etc_return_to");
      window.location.href = returnTo;
      return;
    }

    if (isHomePage()) {
      window.location.href = "articles.html";
    }
  };

  menuLinks.forEach((link) => {
    link.addEventListener("click", async (event) => {
      const action = link.dataset.authAction;
      if (!action) return;

      event.preventDefault();

      if (action === "open-login") openAuthModal("login");
      if (action === "open-register") openAuthModal("register");

      if (action === "logout") {
        try {
          await window.ETCAuth.logout();
          if (isProtectedPage()) {
            window.location.href = "index.html?auth=login";
          }
        } catch (error) {
          console.error("Logout failed", error);
        }
      }
    });
  });

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      toggleAuthPanel(tab.dataset.authTab || "login");
    });
  });

  authCloseButtons.forEach((button) => {
    button.addEventListener("click", closeAuthModal);
  });

  authModal?.addEventListener("click", (event) => {
    if (event.target === authModal) closeAuthModal();
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginForm.dataset.managedSubmit = "true";
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const originalText = submitButton?.innerHTML || "Login";
    const emailInput = loginForm.querySelector('input[name="email"]');
    const passwordInput = loginForm.querySelector('input[name="password"]');

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
      }

      await window.ETCAuth.login({
        email: emailInput?.value?.trim() || "",
        password: passwordInput?.value || "",
      });

      showAuthMessage(loginForm, "Signed in successfully.", "success");
      loginForm.reset();
      setTimeout(() => {
        closeAuthModal();
        redirectAfterAuth();
      }, 500);
    } catch (error) {
      console.error("Login failed", error);
      showAuthMessage(
        loginForm,
        error?.payload?.message || "Unable to sign in right now.",
        "error"
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    }
  });

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    registerForm.dataset.managedSubmit = "true";
    const submitButton = registerForm.querySelector('button[type="submit"]');
    const originalText = submitButton?.innerHTML || "Create Account";
    const fullNameInput = registerForm.querySelector('input[name="full_name"]');
    const usernameInput = registerForm.querySelector('input[name="username"]');
    const emailInput = registerForm.querySelector('input[name="email"]');
    const passwordInput = registerForm.querySelector('input[name="password"]');
    const locationInput = registerForm.querySelector('input[name="location"]');

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
      }

      await window.ETCAuth.register({
        full_name: fullNameInput?.value?.trim() || "",
        username: usernameInput?.value?.trim() || "",
        email: emailInput?.value?.trim() || "",
        password: passwordInput?.value || "",
        location: locationInput?.value?.trim() || "",
      });

      showAuthMessage(registerForm, "Account created successfully.", "success");
      registerForm.reset();
      setTimeout(() => {
        closeAuthModal();
        redirectAfterAuth();
      }, 500);
    } catch (error) {
      console.error("Registration failed", error);
      showAuthMessage(
        registerForm,
        error?.payload?.message || "Unable to create account right now.",
        "error"
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    }
  });

  document.querySelectorAll(".write-btn").forEach((link) => {
    link.addEventListener("click", (event) => {
      const session = window.ETCAuth.getSession();
      if (session?.user) return;
      event.preventDefault();
      openAuthModal("login");
    });
  });

  if (profileButton && profileMenu) {
    profileButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = profileMenu.classList.contains("show");
      profileMenu.classList.toggle("show");
      profileButton.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  document.addEventListener("auth:changed", (event) => {
    setMenuState(event.detail);
  });

  setMenuState(window.ETCAuth.getSession() || null);
  window.ETCAuth.restore().then((session) => {
    setMenuState(session);

    if (!session?.user && isProtectedPage()) {
      sessionStorage.setItem("etc_return_to", window.location.href);
      window.location.href = `index.html?auth=login&returnTo=${encodeURIComponent(window.location.href)}`;
      return;
    }

    if (!session?.user && isHomePage() && requestedAuthPanel) {
      openAuthModal(requestedAuthPanel === "register" ? "register" : "login");
    }
  });
}

function initProfileMenu() {
  const profileBtn = document.querySelector(".profile-btn");
  const profileMenu = document.querySelector(".profile-menu");

  if (!profileBtn || !profileMenu) return;

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-profile")) {
      profileMenu.classList.remove("show");
      profileBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && profileMenu.classList.contains("show")) {
      profileMenu.classList.remove("show");
      profileBtn.setAttribute("aria-expanded", "false");
      profileBtn.focus();
    }
  });

  profileBtn.setAttribute("aria-haspopup", "true");
  profileBtn.setAttribute("aria-expanded", "false");
  profileMenu.setAttribute("role", "menu");
}

function initDropdowns() {
  const dropdowns = document.querySelectorAll(".nav-dropdown, .dropdown");

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".nav-item, .dropdown-toggle");
    const menu = dropdown.querySelector(".dropdown-content, .dropdown-menu");

    if (!toggle || !menu) return;

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      dropdowns.forEach((other) => {
        if (other !== dropdown) {
          const otherMenu = other.querySelector(".dropdown-content, .dropdown-menu");
          if (otherMenu) {
            otherMenu.classList.remove("show");
            const otherToggle = other.querySelector(".nav-item, .dropdown-toggle");
            if (otherToggle) otherToggle.setAttribute("aria-expanded", "false");
          }
        }
      });

      const isOpen = menu.classList.contains("show");
      menu.classList.toggle("show");
      toggle.setAttribute("aria-expanded", String(!isOpen));
    });

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

    document.addEventListener("click", (e) => {
      if (!(e.target instanceof Element) || !dropdown.contains(e.target)) {
        menu.classList.remove("show");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    menu.setAttribute("role", "menu");
  });
}

function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
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

    if (e.key === "Escape") {
      const openOverlay = document.querySelector('.search-overlay[style*="block"]');
      if (openOverlay) {
        openOverlay.style.display = "none";
        const searchInput = document.querySelector(".search-input");
        if (searchInput) searchInput.setAttribute("aria-expanded", "false");
      }
    }
  });
}

function initPerformanceMonitoring() {
  if (
    !window.location.hostname.includes("localhost") &&
    !localStorage.getItem("enablePerfMonitoring")
  ) {
    return;
  }

  window.addEventListener("load", () => {
    if ("performance" in window && "timing" in window.performance) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domReadyTime =
        perfData.domContentLoadedEventEnd - perfData.navigationStart;

      if (pageLoadTime > 3000) {
        console.warn(
          `Page load time: ${pageLoadTime}ms (consider optimizing for low-bandwidth)`
        );
      }

      localStorage.setItem(
        "perfMetrics",
        JSON.stringify({
          pageLoad: pageLoadTime,
          domReady: domReadyTime,
          timestamp: Date.now(),
        })
      );
    }
  });
}

function initAccessibilityFeatures() {
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

function initResourcesPage() {
  if (!document.querySelector(".resources-grid-section, .learning-paths-section")) {
    return;
  }

  const updateTime = () => {
    const now = new Date();
    const ethiopiaTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const timeString = ethiopiaTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Africa/Addis_Ababa",
    });

    document.querySelectorAll("#current-time, #footer-time").forEach((el) => {
      if (el) el.textContent = timeString + " GMT+3";
    });
  };

  updateTime();
  setInterval(updateTime, 1000);

  ["web", "mobile", "ai"].forEach((path) => {
    const saved = localStorage.getItem(`${path}-progress`);
    if (saved) {
      const fill = document.querySelector(`#${path}-path .progress-fill`);
      const info = document.querySelector(`#${path}-path .progress-info span`);
      if (fill) fill.style.width = `${saved}%`;
      if (info) info.textContent = `${saved}% Complete`;
    }
  });

  window.updateProgress = (path, amount) => {
    const current = parseInt(localStorage.getItem(`${path}-progress`) || "0", 10);
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

  window.downloadResource = (resourceType) => {
    alert(`Download for ${resourceType} coming soon!`);
    const downloads = JSON.parse(localStorage.getItem("resource_downloads") || "[]");
    downloads.push({
      type: resourceType,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("resource_downloads", JSON.stringify(downloads));
  };

  document.querySelectorAll(".path-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      document.querySelectorAll(".path-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  });
}

function ensureAuthStyles() {
  if (document.getElementById("etc-auth-styles")) return;

  const style = document.createElement("style");
  style.id = "etc-auth-styles";
  style.textContent = `
    .etc-auth-inline {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-left: 0.75rem;
    }
    .auth-link-btn {
      border: 1px solid var(--color-border, rgba(255,255,255,.15));
      background: var(--color-surface, rgba(255,255,255,.06));
      color: var(--color-text, #fff);
      border-radius: 999px;
      padding: 0.7rem 1rem;
      text-decoration: none;
      cursor: pointer;
      font: inherit;
    }
    .auth-modal {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: rgba(8, 12, 24, 0.72);
      backdrop-filter: blur(10px);
      z-index: 3000;
    }
    .auth-modal.show {
      display: flex;
    }
    .auth-modal-card {
      position: relative;
      width: min(100%, 440px);
      padding: 32px;
      border-radius: 24px;
      background: linear-gradient(180deg, rgba(19, 32, 62, 0.96), rgba(9, 16, 31, 0.98));
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
    }
    .auth-modal-header h2 {
      margin-bottom: 8px;
      color: #fff;
    }
    .auth-modal-header p {
      color: rgba(255, 255, 255, 0.78);
      margin-bottom: 20px;
    }
    .auth-close {
      position: absolute;
      top: 14px;
      right: 16px;
      background: transparent;
      color: #fff;
      border: none;
      font-size: 28px;
      cursor: pointer;
    }
    .auth-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 18px;
    }
    .auth-tab {
      padding: 12px 14px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.04);
      color: #fff;
      cursor: pointer;
    }
    .auth-tab.active {
      background: #2ecc71;
      color: #08111f;
      border-color: transparent;
    }
    .auth-form {
      display: grid;
      gap: 12px;
    }
    .auth-form input {
      width: 100%;
      padding: 14px 16px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.06);
      color: #fff;
    }
    .auth-form input::placeholder {
      color: rgba(255,255,255,.58);
    }
    .auth-form .btn-primary {
      border: none;
      border-radius: 14px;
      padding: 14px 16px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
}

function ensureAuthModal() {
  if (document.getElementById("authModal")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "auth-modal";
  wrapper.id = "authModal";
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.innerHTML = `
    <div class="auth-modal-card">
      <button class="auth-close" type="button" data-auth-close aria-label="Close authentication dialog">&times;</button>
      <div class="auth-modal-header">
        <h2>Welcome to ETC</h2>
        <p>Create your account or sign in to access the rest of the platform.</p>
      </div>
      <div class="auth-tabs">
        <button type="button" class="auth-tab active" data-auth-tab="login">Login</button>
        <button type="button" class="auth-tab" data-auth-tab="register">Create Account</button>
      </div>
      <section data-auth-panel="login">
        <form id="loginForm" class="auth-form">
          <input type="email" name="email" placeholder="Email address" required>
          <input type="password" name="password" placeholder="Password" required minlength="8">
          <button type="submit" class="btn-primary"><i class="fas fa-right-to-bracket"></i> Login</button>
        </form>
      </section>
      <section data-auth-panel="register" hidden>
        <form id="registerForm" class="auth-form">
          <input type="text" name="full_name" placeholder="Full name" required>
          <input type="text" name="username" placeholder="Username" required>
          <input type="email" name="email" placeholder="Email address" required>
          <input type="password" name="password" placeholder="Password" required minlength="8">
          <input type="text" name="location" placeholder="Location">
          <button type="submit" class="btn-primary"><i class="fas fa-user-plus"></i> Create Account</button>
        </form>
      </section>
    </div>
  `;
  document.body.appendChild(wrapper);
}

function ensureNavAuthShell() {
  const existingProfile = document.querySelector(".user-profile");
  if (existingProfile) {
    const profileMenu = existingProfile.querySelector(".profile-menu");
    if (profileMenu && !profileMenu.querySelector('[data-auth-action="open-login"]')) {
      profileMenu.innerHTML = `
        <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
        <a href="profile.html"><i class="fas fa-cog"></i> Settings</a>
        <a href="#" data-auth-action="open-login"><i class="fas fa-right-to-bracket"></i> Login</a>
        <a href="#" data-auth-action="open-register"><i class="fas fa-user-plus"></i> Create Account</a>
        <a href="#" data-auth-action="logout" style="display:none;"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
      `;
    }
    return;
  }

  const navTarget =
    document.querySelector(".nav-container .nav-link") ||
    document.querySelector(".nav-container") ||
    document.querySelector("header nav .menu") ||
    document.querySelector("header nav") ||
    document.querySelector("#nav-placeholder") ||
    document.querySelector("nav");

  if (!navTarget) return;

  const authShell = document.createElement("div");
  authShell.className = "etc-auth-inline user-profile";
  authShell.innerHTML = `
    <button class="profile-btn" type="button">
      <div class="avatar"><i class="far fa-user"></i><span class="status-indicator"></span></div>
      <span class="user-name">Sign In</span>
      <i class="fas fa-chevron-down"></i>
    </button>
    <div class="profile-menu">
      <a href="profile.html"><i class="fas fa-user"></i> Profile</a>
      <a href="profile.html"><i class="fas fa-cog"></i> Settings</a>
      <a href="#" data-auth-action="open-login"><i class="fas fa-right-to-bracket"></i> Login</a>
      <a href="#" data-auth-action="open-register"><i class="fas fa-user-plus"></i> Create Account</a>
      <a href="#" data-auth-action="logout" style="display:none;"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
    </div>
  `;
  navTarget.appendChild(authShell);
}

window.mainInit = {
  initSearch,
  initProfileMenu,
  initDropdowns,
  initAuthExperience,
};
