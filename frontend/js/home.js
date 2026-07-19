// Reads from the UPDATES array defined in data/updates.js - no backend, no fetch.

const categoryPillClass = {
  General: "pill-general",
  Workshop: "pill-workshop",
  Achievement: "pill-achievement",
  Announcement: "pill-announcement",
};

function formatDate(dateStr) {
  // dateStr is a plain "YYYY-MM-DD" - parse as local, no timezone concerns
  // since there's no server round-trip anymore.
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function updateCardHtml(update) {
  const pillClass = categoryPillClass[update.category] || "pill-general";
  const pinnedBadge = update.pinned
    ? `<span class="text-fluent-primary fw-semibold small">📌 Pinned</span>`
    : "";
  const imageHtml = update.image
    ? `<img src="${update.image}" alt="" class="update-card-image mb-3">`
    : "";

  return `
    <div class="col-md-6">
      <article class="card-fluent p-4 h-100">
        ${imageHtml}
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="pill ${pillClass}">${escapeHtml(update.category)}</span>
          <div class="d-flex align-items-center gap-2">
            ${pinnedBadge}
            <time class="text-subtle small">${formatDate(update.date)}</time>
          </div>
        </div>
        <h3 class="h6 fw-semibold mb-2">${escapeHtml(update.title)}</h3>
        <p class="text-subtle small mb-0" style="white-space: pre-line;">${escapeHtml(update.body)}</p>
      </article>
    </div>
  `;
}

function loadUpdates() {
  const statusEl = document.getElementById("updatesStatus");
  const gridEl = document.getElementById("updatesGrid");

  const updates = [...UPDATES].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.date) - new Date(a.date);
  });

  if (updates.length === 0) {
    statusEl.innerHTML = "";
    gridEl.innerHTML = `
      <div class="col-12">
        <div class="card-fluent p-5 text-center">
          <p class="fw-semibold mb-1">No updates posted yet</p>
          <p class="text-subtle small mb-0">Add one in data/updates.js to get started.</p>
        </div>
      </div>`;
    return;
  }

  statusEl.innerHTML = "";
  gridEl.innerHTML = updates.map(updateCardHtml).join("");
}

loadUpdates();
