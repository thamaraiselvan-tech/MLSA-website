// Simple auth helpers. The token is a JWT from the backend, stored in
// localStorage so it survives page reloads (this is a static multi-page
// site, so there's no in-memory app state to keep it in).

const auth = {
  isLoggedIn: () => !!localStorage.getItem("mlsa_admin_token"),

  getName: () => localStorage.getItem("mlsa_admin_name") || "Admin",

  login: (token, name) => {
    localStorage.setItem("mlsa_admin_token", token);
    localStorage.setItem("mlsa_admin_name", name);
  },

  logout: () => {
    localStorage.removeItem("mlsa_admin_token");
    localStorage.removeItem("mlsa_admin_name");
    window.location.href = "admin-login.html";
  },

  // Call at the top of any admin-only page to redirect out if not logged in.
  requireLogin: () => {
    if (!auth.isLoggedIn()) {
      window.location.href = "admin-login.html";
    }
  },
};
