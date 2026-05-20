/**
 * api.js - shared API and authentication helpers
 */
(function () {
  const AUTH_STORAGE_KEY = "etc_auth_session";

  const ETCApi = {
       getBaseUrl() {
      if (window.APP_CONFIG?.apiBaseUrl) {
        return String(window.APP_CONFIG.apiBaseUrl).replace(/\/$/, "");
      }
      if (
        window.location.hostname === "localhost" || 
        window.location.hostname === "127.0.0.1" || 
        window.location.port === "8000"
      ) {
        return "http://localhost:8000";
      }

      if (window.location.protocol === "file:") {
        return "http://localhost:8000";
      }

      return `${window.location.protocol}//${window.location.hostname}:8000`;
    },


    async request(path, options = {}) {
      const url = `${this.getBaseUrl()}${path}`;
      const requestOptions = {
        method: options.method || "GET",
        headers: {
          Accept: "application/json",
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(options.headers || {}),
        },
      };

      if (options.body) {
        requestOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, requestOptions);
      const payload = await response.json().catch(() => ({
        success: false,
        message: "Invalid API response.",
      }));

      if (!response.ok || payload.success === false) {
        const error = new Error(payload.message || "Request failed.");
        error.payload = payload;
        error.status = response.status;
        throw error;
      }

      return payload;
    },
  };

  const ETCAuth = {
    getSession() {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;

      try {
        return JSON.parse(raw);
      } catch (error) {
        console.warn("Failed to parse saved auth session", error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
    },

    saveSession(session) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      document.dispatchEvent(
        new CustomEvent("auth:changed", {
          detail: session,
        })
      );
      return session;
    },

    clearSession() {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      document.dispatchEvent(
        new CustomEvent("auth:changed", {
          detail: null,
        })
      );
    },

    authHeaders() {
      const session = this.getSession();
      const accessToken = session?.tokens?.access_token;
      return accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {};
    },

    async login(credentials) {
      const response = await ETCApi.request("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      return this.saveSession(response.data);
    },

    async register(payload) {
      const response = await ETCApi.request("/api/auth/register", {
        method: "POST",
        body: payload,
      });

      return this.saveSession(response.data);
    },

    async refresh() {
      const session = this.getSession();
      if (!session?.tokens?.session_token) return null;

      const response = await ETCApi.request("/api/auth/refresh", {
        method: "POST",
        body: {
          session_token: session.tokens.session_token,
        },
      });

      return this.saveSession(response.data);
    },

    async me() {
      const response = await ETCApi.request("/api/auth/me", {
        headers: this.authHeaders(),
      });

      const session = this.getSession();
      const nextSession = {
        ...(session || {}),
        user: response.data.user,
        tokens: session?.tokens || {},
      };

      return this.saveSession(nextSession);
    },

    async restore() {
      const session = this.getSession();
      if (!session?.tokens?.session_token) return null;

      try {
        await this.refresh();
        return this.getSession();
      } catch (error) {
        console.warn("Session restore failed", error);
        this.clearSession();
        return null;
      }
    },

    async logout() {
      const session = this.getSession();

      try {
        if (session?.tokens?.session_token) {
          await ETCApi.request("/api/auth/logout", {
            method: "POST",
            body: {
              session_token: session.tokens.session_token,
            },
          });
        }
      } finally {
        this.clearSession();
      }
    },

    initials(user) {
      const source = user?.full_name || user?.username || "User";
      return source
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
    },
  };

  window.ETCApi = ETCApi;
  window.ETCAuth = ETCAuth;
})();
