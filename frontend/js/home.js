// Reads from the UPDATES array defined in data/updates.js - no backend, no fetch.

const categoryPillClass = {
  General: "pill-general",
  Workshop: "pill-workshop",
  Achievement: "pill-achievement",
  Announcement: "pill-announcement",
};

const categoryIconMap = {
  General: "bi-info-circle-fill",
  Workshop: "bi-tools",
  Achievement: "bi-trophy-fill",
  Announcement: "bi-megaphone-fill",
};

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

let activeFilter = "all";

function updateCardHtml(update) {
  const pillClass = categoryPillClass[update.category] || "pill-general";
  const iconClass = categoryIconMap[update.category] || "bi-info-circle-fill";
  const isPinned = Boolean(update.pinned);
  
  const pinnedBadge = isPinned
    ? `<span class="update-pinned-badge"><i class="bi bi-pin-angle-fill me-1"></i> Pinned</span>`
    : "";
    
  const imageHtml = update.image
    ? `<div class="update-card-img-wrapper mb-3"><img src="${update.image}" alt="${escapeHtml(update.title)}" class="update-card-image"></div>`
    : "";
    
  const linkHtml = update.linkUrl
    ? `<a href="${encodeURI(update.linkUrl)}" target="_blank" rel="noreferrer" class="update-action-btn mt-3">
        <span>${escapeHtml(update.linkLabel || "Learn more")}</span>
        <i class="bi bi-arrow-right ms-1"></i>
       </a>`
    : "";

  return `
    <div class="col-12 col-md-6 update-item" data-category="${escapeHtml(update.category)}">
      <article class="card-fluent card-hover update-card p-4 h-100 ${isPinned ? 'is-pinned' : ''}">
        ${imageHtml}
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <span class="pill ${pillClass} d-inline-flex align-items-center gap-1">
            <i class="bi ${iconClass}"></i>
            <span>${escapeHtml(update.category)}</span>
          </span>
          <div class="d-flex align-items-center gap-2">
            ${pinnedBadge}
            <time class="text-subtle small fw-medium"><i class="bi bi-calendar3 me-1"></i>${formatDate(update.date)}</time>
          </div>
        </div>
        <h3 class="update-card-title h5 fw-bold mb-2">${escapeHtml(update.title)}</h3>
        <p class="update-card-body text-subtle mb-0">${escapeHtml(update.body)}</p>
        ${linkHtml}
      </article>
    </div>
  `;
}

function renderUpdates() {
  const statusEl = document.getElementById("updatesStatus");
  const gridEl = document.getElementById("updatesGrid");

  let updates = [...UPDATES].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.date) - new Date(a.date);
  });

  if (activeFilter !== "all") {
    updates = updates.filter(u => u.category.toLowerCase() === activeFilter.toLowerCase());
  }

  if (updates.length === 0) {
    statusEl.innerHTML = "";
    gridEl.innerHTML = `
      <div class="col-12">
        <div class="card-fluent p-5 text-center">
          <p class="fw-semibold mb-1">No updates found for this filter</p>
          <p class="text-subtle small mb-0">Try selecting "All" to view all announcements.</p>
        </div>
      </div>`;
    return;
  }

  statusEl.innerHTML = "";
  gridEl.innerHTML = updates.map(updateCardHtml).join("");
}

function initFilterTabs() {
  const tabContainer = document.getElementById("updateFilterTabs");
  if (!tabContainer) return;

  const buttons = tabContainer.querySelectorAll(".update-filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderUpdates();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initFilterTabs();
  renderUpdates();
});

// Fallback direct execution if DOM is already ready
if (document.readyState === "complete" || document.readyState === "interactive") {
  initFilterTabs();
  renderUpdates();
}
