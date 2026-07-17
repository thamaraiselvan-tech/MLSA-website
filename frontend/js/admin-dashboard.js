auth.requireLogin();

document.getElementById("adminName").textContent = auth.getName();
document.getElementById("logoutBtn").addEventListener("click", auth.logout);

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------------
// Tab switching
// ---------------------------------------------------------------
const tabButtons = document.querySelectorAll("#dashboardTabs .nav-link");
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tab-pane").forEach((pane) => pane.classList.add("d-none"));
    document.getElementById(`tab-${btn.dataset.tab}`).classList.remove("d-none");

    if (btn.dataset.tab === "registrations") loadRegistrationsTab();
    if (btn.dataset.tab === "team") loadTeamList();
  });
});

// ---------------------------------------------------------------
// Shared: image preview + upload helpers
// ---------------------------------------------------------------
function setupImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) {
      preview.classList.add("d-none");
      preview.removeAttribute("src");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.classList.remove("d-none");
    };
    reader.readAsDataURL(file);
  });
}
setupImagePreview("updateImageInput", "updateImagePreview");
setupImagePreview("eventImageInput", "eventImagePreview");

// Resolves what image_url to submit: a newly uploaded file takes priority,
// otherwise falls back to the existing URL (or null if none / removed).
async function resolveImageUrl(fileInputEl, existingUrl) {
  const file = fileInputEl.files[0];
  if (file) {
    const result = await api.uploadImage(file);
    return result.url;
  }
  return existingUrl || null;
}

// ---------------------------------------------------------------
// Updates tab
// ---------------------------------------------------------------
async function loadUpdatesList() {
  const listEl = document.getElementById("updatesList");
  listEl.innerHTML = `<p class="text-subtle small">Loading…</p>`;
  try {
    const updates = await api.getUpdates();
    if (updates.length === 0) {
      listEl.innerHTML = `<p class="text-subtle small">No updates yet.</p>`;
      return;
    }
    listEl.innerHTML = updates.map((u) => `
      <div class="card-fluent p-3 d-flex flex-row justify-content-between align-items-start gap-3">
        <div class="d-flex gap-3 align-items-start">
          ${u.image_url ? `<img src="${API_BASE}${u.image_url}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:4px;flex-shrink:0;">` : ""}
          <div>
            <p class="fw-semibold small mb-0">${escapeHtml(u.title)} ${u.pinned ? "📌" : ""}</p>
            <p class="text-subtle small mb-0 mt-1">${escapeHtml(u.category)} &middot; ${new Date(u.created_at).toLocaleDateString("en-IN")}</p>
          </div>
        </div>
        <button class="btn btn-link text-fluent-error small p-0 flex-shrink-0" onclick="deleteUpdate(${u.id})">Delete</button>
      </div>
    `).join("");
  } catch (err) {
    listEl.innerHTML = `<p class="text-fluent-error small">Could not load updates.</p>`;
  }
}

async function deleteUpdate(id) {
  if (!confirm("Delete this update?")) return;
  await api.deleteUpdate(id);
  loadUpdatesList();
}

document.getElementById("updateForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById("updateError");
  const btn = document.getElementById("updateSubmitBtn");
  const imageInput = document.getElementById("updateImageInput");

  errorEl.classList.add("d-none");
  btn.disabled = true;
  btn.textContent = imageInput.files[0] ? "Uploading image…" : "Posting…";

  try {
    const imageUrl = await resolveImageUrl(imageInput, null);
    btn.textContent = "Posting…";

    const payload = {
      title: form.title.value,
      body: form.body.value,
      category: form.category.value,
      pinned: form.pinned.checked,
      image_url: imageUrl,
    };

    await api.createUpdate(payload);
    form.reset();
    document.getElementById("updateImagePreview").classList.add("d-none");
    loadUpdatesList();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove("d-none");
  } finally {
    btn.disabled = false;
    btn.textContent = "Publish update";
  }
});

// ---------------------------------------------------------------
// Events tab
// ---------------------------------------------------------------
const eventForm = document.getElementById("eventForm");

async function loadEventsList() {
  const listEl = document.getElementById("eventsList");
  listEl.innerHTML = `<p class="text-subtle small">Loading…</p>`;
  try {
    const events = await api.getEvents();
    if (events.length === 0) {
      listEl.innerHTML = `<p class="text-subtle small">No events yet.</p>`;
      return;
    }
    listEl.innerHTML = events.map((ev) => `
      <div class="card-fluent p-3 d-flex flex-row justify-content-between align-items-start gap-3">
        <div class="d-flex gap-3 align-items-start">
          ${ev.image_url ? `<img src="${API_BASE}${ev.image_url}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:4px;flex-shrink:0;">` : ""}
          <div>
            <p class="fw-semibold small mb-0">${escapeHtml(ev.title)}</p>
            <p class="text-subtle small mb-0 mt-1">
              ${new Date(ev.event_date).toLocaleString("en-IN")} &middot; ${escapeHtml(ev.location)} &middot; ${ev.is_open ? "Open" : "Closed"}
            </p>
          </div>
        </div>
        <div class="d-flex gap-3 flex-shrink-0">
          <button class="btn btn-link text-fluent-primary small p-0" onclick='editEvent(${JSON.stringify(ev)})'>Edit</button>
          <button class="btn btn-link text-fluent-error small p-0" onclick="deleteEvent(${ev.id})">Delete</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    listEl.innerHTML = `<p class="text-fluent-error small">Could not load events.</p>`;
  }
}

// Converts an ISO datetime string to the "YYYY-MM-DDTHH:mm" format
// that <input type="datetime-local"> expects.
function toDatetimeLocalValue(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function editEvent(ev) {
  eventForm.editing_id.value = ev.id;
  eventForm.title.value = ev.title;
  eventForm.banner_note.value = ev.banner_note || "";
  eventForm.description.value = ev.description;
  eventForm.event_date.value = toDatetimeLocalValue(ev.event_date);
  eventForm.registration_deadline.value = toDatetimeLocalValue(ev.registration_deadline);
  eventForm.location.value = ev.location;
  eventForm.capacity.value = ev.capacity || "";
  eventForm.is_open.checked = ev.is_open;
  eventForm.current_image_url.value = ev.image_url || "";

  const preview = document.getElementById("eventImagePreview");
  const removeWrap = document.getElementById("eventRemoveImageWrap");
  const removeCheck = document.getElementById("eventRemoveImageCheck");
  removeCheck.checked = false;
  if (ev.image_url) {
    preview.src = `${API_BASE}${ev.image_url}`;
    preview.classList.remove("d-none");
    removeWrap.classList.remove("d-none");
  } else {
    preview.classList.add("d-none");
    removeWrap.classList.add("d-none");
  }

  document.getElementById("eventFormTitle").textContent = "Edit event";
  document.getElementById("eventSubmitBtn").textContent = "Save changes";
  document.getElementById("eventCancelBtn").classList.remove("d-none");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetEventForm() {
  eventForm.reset();
  eventForm.editing_id.value = "";
  eventForm.current_image_url.value = "";
  eventForm.location.value = "Online";
  eventForm.is_open.checked = true;
  document.getElementById("eventImagePreview").classList.add("d-none");
  document.getElementById("eventRemoveImageWrap").classList.add("d-none");
  document.getElementById("eventRemoveImageCheck").checked = false;
  document.getElementById("eventFormTitle").textContent = "Create an event";
  document.getElementById("eventSubmitBtn").textContent = "Create event";
  document.getElementById("eventCancelBtn").classList.add("d-none");
}

document.getElementById("eventCancelBtn").addEventListener("click", resetEventForm);

async function deleteEvent(id) {
  if (!confirm("Delete this event? Registrations for it will remain in the database but be inaccessible from here.")) return;
  await api.deleteEvent(id);
  loadEventsList();
}

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("eventError");
  const btn = document.getElementById("eventSubmitBtn");
  const imageInput = document.getElementById("eventImageInput");
  const removeImage = document.getElementById("eventRemoveImageCheck").checked;

  errorEl.classList.add("d-none");
  btn.disabled = true;
  const editingId = eventForm.editing_id.value;
  btn.textContent = imageInput.files[0] ? "Uploading image…" : "Saving…";

  try {
    const existingUrl = removeImage ? null : eventForm.current_image_url.value;
    const imageUrl = await resolveImageUrl(imageInput, existingUrl);
    btn.textContent = "Saving…";

    const payload = {
      title: eventForm.title.value,
      banner_note: eventForm.banner_note.value,
      description: eventForm.description.value,
      event_date: new Date(eventForm.event_date.value).toISOString(),
      registration_deadline: eventForm.registration_deadline.value
        ? new Date(eventForm.registration_deadline.value).toISOString()
        : null,
      location: eventForm.location.value,
      capacity: eventForm.capacity.value ? Number(eventForm.capacity.value) : null,
      is_open: eventForm.is_open.checked,
      image_url: imageUrl,
    };

    if (editingId) {
      await api.updateEvent(editingId, payload);
    } else {
      await api.createEvent(payload);
    }
    resetEventForm();
    loadEventsList();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove("d-none");
  } finally {
    btn.disabled = false;
    btn.textContent = editingId ? "Save changes" : "Create event";
  }
});

// ---------------------------------------------------------------
// Registrations tab
// ---------------------------------------------------------------
let registrationsTabLoaded = false;

async function loadRegistrationsTab() {
  const events = await api.getEvents();

  if (events.length === 0) {
    document.getElementById("regNoEvents").classList.remove("d-none");
    document.getElementById("regContent").classList.add("d-none");
    return;
  }

  document.getElementById("regNoEvents").classList.add("d-none");
  document.getElementById("regContent").classList.remove("d-none");

  const select = document.getElementById("regEventSelect");
  if (!registrationsTabLoaded) {
    select.innerHTML = events.map((ev) => `<option value="${ev.id}">${escapeHtml(ev.title)}</option>`).join("");
    select.addEventListener("change", () => loadRegistrationsFor(select.value));
    registrationsTabLoaded = true;
  }

  loadRegistrationsFor(select.value);
}

async function loadRegistrationsFor(eventId) {
  document.getElementById("regExportBtn").href = api.exportRegistrationsUrl(eventId);
  const wrap = document.getElementById("regTableWrap");
  wrap.innerHTML = `<p class="text-subtle small p-4 mb-0">Loading…</p>`;

  try {
    const regs = await api.getRegistrations(eventId);
    document.getElementById("regCount").textContent = `${regs.length} registered`;

    if (regs.length === 0) {
      wrap.innerHTML = `<p class="text-subtle small p-4 mb-0 text-center">No registrations yet for this event.</p>`;
      return;
    }

    const rows = regs.map((r) => `
      <tr>
        <td class="px-3 py-2">${escapeHtml(r.full_name)}</td>
        <td class="px-3 py-2 text-subtle">${escapeHtml(r.email)}</td>
        <td class="px-3 py-2 text-subtle">${escapeHtml(r.phone || "—")}</td>
        <td class="px-3 py-2 text-subtle">${escapeHtml(r.department || "—")}</td>
        <td class="px-3 py-2 text-subtle">${escapeHtml(r.year_of_study || "—")}</td>
        <td class="px-3 py-2">
          ${r.confirmation_sent
            ? '<span class="small fw-medium" style="color: var(--fluent-success);">Sent</span>'
            : '<span class="small text-subtle">Pending</span>'}
        </td>
      </tr>
    `).join("");

    wrap.innerHTML = `
      <table class="table mb-0 small">
        <thead>
          <tr style="background: var(--fluent-bg);">
            <th class="px-3 py-2">Name</th>
            <th class="px-3 py-2">Email</th>
            <th class="px-3 py-2">Phone</th>
            <th class="px-3 py-2">Department</th>
            <th class="px-3 py-2">Year</th>
            <th class="px-3 py-2">Confirmation</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (err) {
    wrap.innerHTML = `<p class="text-fluent-error small p-4 mb-0">Could not load registrations.</p>`;
  }
}

// ---------------------------------------------------------------
// Team tab
// ---------------------------------------------------------------
async function loadTeamList() {
  const listEl = document.getElementById("teamList");
  listEl.innerHTML = `<p class="text-subtle small">Loading…</p>`;
  try {
    const admins = await api.listAdmins();
    listEl.innerHTML = admins.map((a) => `
      <div class="card-fluent p-3 d-flex flex-row justify-content-between align-items-center gap-3">
        <div>
          <p class="fw-semibold small mb-0">${escapeHtml(a.name)}</p>
          <p class="text-subtle small mb-0 mt-1">${escapeHtml(a.email)}</p>
        </div>
        <button class="btn btn-link text-fluent-error small p-0 flex-shrink-0" onclick="deleteAdmin(${a.id}, '${escapeHtml(a.name)}')">Remove</button>
      </div>
    `).join("");
  } catch (err) {
    listEl.innerHTML = `<p class="text-fluent-error small">Could not load the team list.</p>`;
  }
}

async function deleteAdmin(id, name) {
  if (!confirm(`Remove ${name} as an admin? They'll no longer be able to sign in.`)) return;
  try {
    await api.deleteAdmin(id);
    loadTeamList();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById("teamForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById("teamError");
  const btn = document.getElementById("teamSubmitBtn");

  errorEl.classList.add("d-none");
  btn.disabled = true;
  btn.textContent = "Adding…";

  try {
    await api.registerAdmin({
      name: form.name.value,
      email: form.email.value,
      password: form.password.value,
    });
    form.reset();
    loadTeamList();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove("d-none");
  } finally {
    btn.disabled = false;
    btn.textContent = "Add admin";
  }
});

// ---------------------------------------------------------------
// Initial load
// ---------------------------------------------------------------
loadUpdatesList();
loadEventsList();
