const categoryPillClass = {
  General: "pill-general",
  Workshop: "pill-workshop",
  Achievement: "pill-achievement",
  Announcement: "pill-announcement",
};

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function updateCardHtml(update) {
  const pillClass = categoryPillClass[update.category] || "pill-general";
  const pinnedBadge = update.pinned
    ? `<span class="text-fluent-primary fw-semibold small">📌 Pinned</span>`
    : "";
  const imageHtml = update.image_url
    ? `<img src="${API_BASE}${update.image_url}" alt="" class="update-card-image mb-3">`
    : "";

  return `
    <div class="col-md-6">
      <article class="card-fluent p-4 h-100">
        ${imageHtml}
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="pill ${pillClass}">${escapeHtml(update.category)}</span>
          <div class="d-flex align-items-center gap-2">
            ${pinnedBadge}
            <time class="text-subtle small">${formatDate(update.created_at)}</time>
          </div>
        </div>
        <h3 class="h6 fw-semibold mb-2">${escapeHtml(update.title)}</h3>
        <p class="text-subtle small mb-0" style="white-space: pre-line;">${escapeHtml(update.body)}</p>
      </article>
    </div>
  `;
}

// Basic HTML-escaping so admin-entered text can't break the page layout.
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function loadUpdates() {
  const statusEl = document.getElementById("updatesStatus");
  const gridEl = document.getElementById("updatesGrid");

  try {
    const updates = await api.getUpdates();

    if (updates.length === 0) {
      statusEl.innerHTML = "";
      gridEl.innerHTML = `
        <div class="col-12">
          <div class="card-fluent p-5 text-center">
            <p class="fw-semibold mb-1">No updates posted yet</p>
            <p class="text-subtle small mb-0">Check back soon, or sign in as admin to post the first one.</p>
          </div>
        </div>`;
      return;
    }

    statusEl.innerHTML = "";
    gridEl.innerHTML = updates.map(updateCardHtml).join("");
  } catch (err) {
    statusEl.textContent = "Could not load updates right now. Please try again shortly.";
    statusEl.classList.add("text-fluent-error");
  }
}

loadUpdates();
