/**
 * profile.js - ETC profile and settings page
 */
(function () {
  const DEFAULT_SETTINGS = {
    email_notifications: true,
    push_notifications: true,
    two_factor_auth: false,
    theme: "dark",
    font_size: "medium",
    language: "en",
    profile_visibility: "community",
    activity_visibility: true,
  };

  const state = {
    session: null,
    settings: { ...DEFAULT_SETTINGS },
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheElements();

    const session = (await window.ETCAuth?.restore?.()) || window.ETCAuth?.getSession?.();
    if (!session?.user || !session?.tokens?.access_token) {
      showAuthGuard();
      return;
    }

    state.session = session;
    bindEvents();
    showApp();
    await loadProfile();
    await loadSettings();
  }

  function cacheElements() {
    [
      "pageBanner",
      "authGuard",
      "profileApp",
      "profileAvatar",
      "profileName",
      "profileHeadline",
      "profileLocation",
      "statMemberSince",
      "statSkillLevel",
      "statLastLogin",
      "detailFullName",
      "detailUsername",
      "detailEmail",
      "detailLocation",
      "detailSkillLevel",
      "detailBio",
      "profileForm",
      "fullNameInput",
      "usernameInput",
      "emailInput",
      "locationInput",
      "skillLevelInput",
      "bioInput",
      "saveProfileBtn",
      "emailNotifications",
      "pushNotifications",
      "twoFactorAuth",
      "themeSelect",
      "fontSize",
      "languageSelect",
      "profileVisibility",
      "activityVisibility",
      "saveSettingsBtn",
      "resetSettingsBtn",
      "confirmSignOutBtn",
      "downloadDataBtn",
      "copySettingsBtn",
      "copyProfileBtn",
      "editProfileBtn",
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });
  }

  function bindEvents() {
    els.profileForm?.addEventListener("submit", saveProfile);
    els.saveSettingsBtn?.addEventListener("click", saveSettings);
    els.resetSettingsBtn?.addEventListener("click", resetSettings);
    els.confirmSignOutBtn?.addEventListener("click", signOut);
    els.downloadDataBtn?.addEventListener("click", copyDataSnapshot);
    els.copySettingsBtn?.addEventListener("click", copySettingsSnapshot);
    els.copyProfileBtn?.addEventListener("click", copyProfileLink);
    els.editProfileBtn?.addEventListener("click", () => {
      els.fullNameInput?.focus();
      window.scrollTo({ top: els.profileForm?.offsetTop - 24 || 0, behavior: "smooth" });
    });
    els.themeSelect?.addEventListener("change", applyThemeFromSelect);
  }

  async function loadProfile() {
    try {
      const response = await window.ETCApi.request("/api/auth/me", {
        headers: window.ETCAuth.authHeaders(),
      });

      state.session = {
        ...(state.session || {}),
        user: response.data.user,
        tokens: state.session?.tokens || {},
      };
      window.ETCAuth.saveSession(state.session);
      renderProfile(state.session.user);
    } catch (error) {
      showBanner(error?.payload?.message || "Unable to load your profile.", "error");
      showAuthGuard();
    }
  }

  async function loadSettings() {
    try {
      const response = await window.ETCApi.request("/api/auth/settings", {
        headers: window.ETCAuth.authHeaders(),
      });
      state.settings = { ...DEFAULT_SETTINGS, ...(response.data?.settings || {}) };
      renderSettings(state.settings);
      applyTheme(state.settings.theme);
    } catch (error) {
      state.settings = { ...DEFAULT_SETTINGS };
      renderSettings(state.settings);
      showBanner(error?.payload?.message || "Unable to load your saved settings.", "error");
    }
  }

  function renderProfile(user) {
    const fullName = user.full_name || user.username || "ETC User";
    const initials = window.ETCAuth?.initials(user) || "ET";
    const createdAt = user.created_at ? new Date(user.created_at) : null;
    const lastLogin = user.last_login ? new Date(user.last_login) : null;

    els.profileAvatar.textContent = initials;
    els.profileName.textContent = fullName;
    els.profileHeadline.textContent = `${formatSkill(user.skill_level)} member of ETC`;
    els.profileLocation.innerHTML = `<i class="fas fa-location-dot"></i> ${user.location || "Location not set"}`;
    els.statMemberSince.textContent = createdAt ? createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "-";
    els.statSkillLevel.textContent = formatSkill(user.skill_level);
    els.statLastLogin.textContent = lastLogin ? lastLogin.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "New";
    els.detailFullName.textContent = fullName;
    els.detailUsername.textContent = user.username || "-";
    els.detailEmail.textContent = user.email || "-";
    els.detailLocation.textContent = user.location || "Not provided";
    els.detailSkillLevel.textContent = formatSkill(user.skill_level);
    els.detailBio.textContent = user.bio || "No bio yet.";

    els.fullNameInput.value = user.full_name || "";
    els.usernameInput.value = user.username || "";
    els.emailInput.value = user.email || "";
    els.locationInput.value = user.location || "";
    els.skillLevelInput.value = user.skill_level || "beginner";
    els.bioInput.value = user.bio || "";
  }

  function renderSettings(settings) {
    els.emailNotifications.checked = !!settings.email_notifications;
    els.pushNotifications.checked = !!settings.push_notifications;
    els.twoFactorAuth.checked = !!settings.two_factor_auth;
    els.themeSelect.value = settings.theme || "dark";
    els.fontSize.value = settings.font_size || "medium";
    els.languageSelect.value = settings.language || "en";
    els.profileVisibility.value = settings.profile_visibility || "community";
    els.activityVisibility.checked = !!settings.activity_visibility;
    document.documentElement.dataset.fontSize = settings.font_size || "medium";
  }

  async function saveProfile(event) {
    event.preventDefault();
    setButtonBusy(els.saveProfileBtn, true, "Saving...");

    try {
      const response = await window.ETCApi.request("/api/auth/profile", {
        method: "PUT",
        headers: window.ETCAuth.authHeaders(),
        body: {
          full_name: els.fullNameInput.value.trim(),
          username: els.usernameInput.value.trim(),
          email: els.emailInput.value.trim(),
          location: els.locationInput.value.trim(),
          skill_level: els.skillLevelInput.value,
          bio: els.bioInput.value.trim(),
        },
      });

      state.session = {
        ...(state.session || {}),
        user: response.data.user,
        tokens: state.session?.tokens || {},
      };
      window.ETCAuth.saveSession(state.session);
      renderProfile(response.data.user);
      showBanner("Profile updated successfully.", "success");
    } catch (error) {
      showBanner(error?.payload?.message || "Profile update failed.", "error");
    } finally {
      setButtonBusy(els.saveProfileBtn, false, '<i class="fas fa-save"></i> Save Profile');
    }
  }

  async function saveSettings() {
    setButtonBusy(els.saveSettingsBtn, true, "Saving...");

    const payload = readSettingsFromForm();

    try {
      const response = await window.ETCApi.request("/api/auth/settings", {
        method: "PUT",
        headers: window.ETCAuth.authHeaders(),
        body: payload,
      });

      state.settings = { ...DEFAULT_SETTINGS, ...(response.data?.settings || payload) };
      renderSettings(state.settings);
      applyTheme(state.settings.theme);
      showBanner("Settings saved successfully.", "success");
    } catch (error) {
      showBanner(error?.payload?.message || "Settings save failed.", "error");
    } finally {
      setButtonBusy(els.saveSettingsBtn, false, '<i class="fas fa-save"></i> Save Settings');
    }
  }

  function resetSettings() {
    state.settings = { ...DEFAULT_SETTINGS };
    renderSettings(state.settings);
    applyTheme(state.settings.theme);
    showBanner("Settings reset locally. Save to apply them to your account.", "success");
  }

  async function signOut() {
    try {
      await window.ETCAuth.logout();
      window.location.href = "index.html";
    } catch (error) {
      showBanner("Could not sign out cleanly, but your local session was cleared.", "error");
      window.location.href = "index.html";
    }
  }

  async function copyDataSnapshot() {
    const payload = {
      user: state.session?.user || null,
      settings: state.settings,
    };

    await copyText(JSON.stringify(payload, null, 2), "Profile data copied to clipboard.");
  }

  async function copySettingsSnapshot() {
    await copyText(JSON.stringify(state.settings, null, 2), "Settings JSON copied to clipboard.");
  }

  async function copyProfileLink() {
    await copyText(window.location.href, "Profile page link copied.");
  }

  async function copyText(text, successMessage) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      showBanner(successMessage, "success");
    } catch (error) {
      showBanner("Clipboard copy failed in this browser.", "error");
    }
  }

  function readSettingsFromForm() {
    return {
      email_notifications: els.emailNotifications.checked,
      push_notifications: els.pushNotifications.checked,
      two_factor_auth: els.twoFactorAuth.checked,
      theme: els.themeSelect.value,
      font_size: els.fontSize.value,
      language: els.languageSelect.value,
      profile_visibility: els.profileVisibility.value,
      activity_visibility: els.activityVisibility.checked,
    };
  }

  function applyThemeFromSelect() {
    applyTheme(els.themeSelect.value);
  }

  function applyTheme(theme) {
    const resolved =
      theme === "auto"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    document.documentElement.setAttribute("data-theme", resolved);
  }

  function formatSkill(skill) {
    const value = String(skill || "beginner");
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function setButtonBusy(button, busy, text) {
    if (!button) return;
    button.disabled = busy;
    button.innerHTML = text;
  }

  function showBanner(message, type) {
    if (!els.pageBanner) return;
    els.pageBanner.className = `banner show ${type}`;
    els.pageBanner.textContent = message;
  }

  function showAuthGuard() {
    els.authGuard?.classList.remove("hidden");
    els.profileApp?.classList.add("hidden");
  }

  function showApp() {
    els.authGuard?.classList.add("hidden");
    els.profileApp?.classList.remove("hidden");
  }
})();
