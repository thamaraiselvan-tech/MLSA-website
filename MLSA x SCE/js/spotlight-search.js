// Spotlight Search Bar (Ctrl+K / Cmd+K / Mobile Search Dock)
(function () {
  let searchModal = null;
  let searchInput = null;
  let searchResults = null;

  function createSpotlightModal() {
    if (document.getElementById("spotlightSearchModal")) {
      searchModal = document.getElementById("spotlightSearchModal");
      searchInput = document.getElementById("spotlightSearchInput");
      searchResults = document.getElementById("spotlightSearchResults");
      return;
    }

    const modalHtml = `
      <div id="spotlightSearchModal" class="spotlight-modal-overlay" aria-hidden="true" role="dialog" aria-modal="true">
        <div class="spotlight-backdrop"></div>
        <div class="spotlight-container">
          <div class="spotlight-header">
            <i class="bi bi-search spotlight-search-icon"></i>
            <input type="text" id="spotlightSearchInput" class="spotlight-input" placeholder="Search events, winners, ambassadors..." autocomplete="off">
            <span class="spotlight-badge d-none d-sm-inline-block">ESC</span>
            <button type="button" class="btn-close ms-2 d-sm-none" id="spotlightCloseBtn" aria-label="Close search"></button>
          </div>
          <div id="spotlightSearchResults" class="spotlight-results">
            <div class="spotlight-hint">Type to search across events, hackathons, and chapter achievements...</div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    searchModal = document.getElementById("spotlightSearchModal");
    searchInput = document.getElementById("spotlightSearchInput");
    searchResults = document.getElementById("spotlightSearchResults");

    const backdrop = searchModal.querySelector(".spotlight-backdrop");
    if (backdrop) backdrop.addEventListener("click", closeSpotlight);

    const closeBtn = document.getElementById("spotlightCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeSpotlight);

    if (searchInput) searchInput.addEventListener("input", handleSearchInput);
  }

  function openSpotlight() {
    createSpotlightModal();
    if (!searchModal) return;

    searchModal.classList.add("is-active");
    searchModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (searchInput) {
      searchInput.value = "";
      handleSearchInput();
      try {
        searchInput.focus();
      } catch (e) {}
    }
  }

  function closeSpotlight() {
    if (!searchModal) return;
    searchModal.classList.remove("is-active");
    searchModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function handleSearchInput() {
    if (!searchResults || !searchInput) return;

    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      searchResults.innerHTML = `
        <div class="spotlight-hint">
          <p class="fw-semibold mb-1">Quick Links</p>
          <div class="d-flex flex-wrap gap-2 mt-2">
            <a href="events.html" class="spotlight-quick-chip"><i class="bi bi-calendar-event me-1"></i> Upcoming Events</a>
            <a href="winners.html" class="spotlight-quick-chip"><i class="bi bi-trophy me-1"></i> Chapter Winners</a>
            <a href="about.html" class="spotlight-quick-chip"><i class="bi bi-people me-1"></i> About Ambassadors</a>
          </div>
        </div>
      `;
      return;
    }

    const matchedEvents = (typeof EVENTS !== "undefined" ? EVENTS : []).filter(e => 
      e.title.toLowerCase().includes(query) || 
      (e.description && e.description.toLowerCase().includes(query)) ||
      (e.tagline && e.tagline.toLowerCase().includes(query))
    );

    const matchedWinners = [];
    if (typeof EVENTS !== "undefined") {
      EVENTS.forEach(e => {
        if (e.winners) {
          e.winners.forEach(w => {
            if (w.name.toLowerCase().includes(query) || (w.projectTitle && w.projectTitle.toLowerCase().includes(query))) {
              matchedWinners.push({ winner: w, event: e });
            }
          });
        }
      });
    }

    if (matchedEvents.length === 0 && matchedWinners.length === 0) {
      searchResults.innerHTML = `
        <div class="spotlight-empty text-center py-4">
          <i class="bi bi-search fs-2 text-subtle mb-2"></i>
          <p class="fw-semibold mb-0">No results found for "${query}"</p>
          <p class="text-subtle small mb-0">Try searching for event names, teams, or technologies.</p>
        </div>
      `;
      return;
    }

    let html = "";

    if (matchedEvents.length > 0) {
      html += `<div class="spotlight-category-title">Events (${matchedEvents.length})</div>`;
      matchedEvents.forEach(e => {
        html += `
          <a href="event.html?id=${e.id}" class="spotlight-item d-flex align-items-center justify-content-between">
            <div>
              <div class="spotlight-item-title">${escapeHtml(e.title)}</div>
              <div class="spotlight-item-sub">${escapeHtml(e.tagline || 'Event details & registration')}</div>
            </div>
            <i class="bi bi-chevron-right text-subtle"></i>
          </a>
        `;
      });
    }

    if (matchedWinners.length > 0) {
      html += `<div class="spotlight-category-title mt-3">Winners &amp; Projects (${matchedWinners.length})</div>`;
      matchedWinners.forEach(item => {
        html += `
          <a href="winners.html" class="spotlight-item d-flex align-items-center justify-content-between">
            <div>
              <div class="spotlight-item-title">🏆 ${escapeHtml(item.winner.name)}</div>
              <div class="spotlight-item-sub">${escapeHtml(item.winner.projectTitle || item.event.title)}</div>
            </div>
            <i class="bi bi-trophy-fill text-warning"></i>
          </a>
        `;
      });
    }

    searchResults.innerHTML = html;
  }

  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Pre-create modal as soon as DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createSpotlightModal);
  } else {
    createSpotlightModal();
  }

  // Keyboard shortcut binding
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSpotlight();
    } else if (e.key === "Escape" && searchModal && searchModal.classList.contains("is-active")) {
      closeSpotlight();
    }
  });

  window.openSpotlightSearch = openSpotlight;
  window.closeSpotlightSearch = closeSpotlight;
})();
