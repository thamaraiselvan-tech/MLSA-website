// All calls to the FastAPI backend go through here.
// Nothing framework-specific — just fetch() calls returning Promises.

function authHeaders() {
  const token = localStorage.getItem("mlsa_admin_token");
  return token ? { Authorization: "Bearer " + token } : {};
}

async function handleResponse(res) {
  if (!res.ok) {
    let detail = "Something went wrong";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch (e) {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

const api = {
  // ---- Public ----
  getUpdates: () => fetch(`${API_BASE}/api/updates`).then(handleResponse),

  getEvents: () => fetch(`${API_BASE}/api/events`).then(handleResponse),

  getEvent: (id) => fetch(`${API_BASE}/api/events/${id}`).then(handleResponse),

  register: (payload) =>
    fetch(`${API_BASE}/api/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  // ---- Admin auth ----
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    }).then(handleResponse);
  },

  // ---- Admin: updates ----
  createUpdate: (payload) =>
    fetch(`${API_BASE}/api/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  deleteUpdate: (id) =>
    fetch(`${API_BASE}/api/updates/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse),

  // ---- Admin: events ----
  createEvent: (payload) =>
    fetch(`${API_BASE}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  updateEvent: (id, payload) =>
    fetch(`${API_BASE}/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  deleteEvent: (id) =>
    fetch(`${API_BASE}/api/events/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleResponse),

  // ---- Admin: registrations ----
  getRegistrations: (eventId) =>
    fetch(`${API_BASE}/api/events/${eventId}/registrations`, {
      headers: authHeaders(),
    }).then(handleResponse),

  exportRegistrationsUrl: (eventId) =>
    `${API_BASE}/api/events/${eventId}/registrations/export`,
};
