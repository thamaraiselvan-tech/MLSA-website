// Reads from the EVENTS array defined in data/events.js - no backend, no fetch.

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatEventDate(dateTimeStr) {
  const d = new Date(dateTimeStr);
  return {
    month: d.toLocaleDateString("en-IN", { month: "short" }),
    day: d.getDate(),
    fullDate: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
  };
}

function isEventClosed(event) {
  const deadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();
  return event.isOpen === false || deadlinePassed;
}

let activeEventFilter = "all";

function eventCardHtml(event) {
  const { month, day, fullDate, time } = formatEventDate(event.date);
  const closed = isEventClosed(event);
  
  const statusPill = closed
    ? `<span class="pill pill-closed d-inline-flex align-items-center gap-1"><i class="bi bi-check-circle-fill"></i> Completed</span>`
    : `<span class="pill pill-open d-inline-flex align-items-center gap-1"><i class="bi bi-record-fill text-success"></i> Open for Registration</span>`;
    
  const tagline = event.tagline
    ? `<p class="small fw-semibold text-fluent-primary mb-2">${escapeHtml(event.tagline)}</p>`
    : "";
    
  const imageHtml = event.image
    ? `<div class="event-card-img-wrapper"><img src="${event.image}" alt="${escapeHtml(event.title)}" class="event-card-image"></div>`
    : "";

  return `
    <div class="col-12 col-md-6 col-lg-6 event-item" data-closed="${closed}">
      <a href="event.html?id=${event.id}" class="text-decoration-none text-reset d-block h-100">
        <div class="card-fluent card-hover event-ticket-card h-100 d-flex flex-column ${closed ? 'is-completed' : 'is-open'}">
          ${imageHtml}
          <div class="p-4 d-flex flex-column flex-fill">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="event-date-pill">
                <span class="event-month">${month}</span>
                <span class="event-day">${day}</span>
              </div>
              ${statusPill}
            </div>
            
            <h3 class="h5 fw-bold text-dark mb-1">${escapeHtml(event.title)}</h3>
            ${tagline}
            <p class="text-subtle small mb-3 event-desc-clamp">
              ${escapeHtml(event.description)}
            </p>
            
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-3 border-top mt-auto">
              <div class="d-flex align-items-center gap-3 text-subtle small fw-medium">
                <span><i class="bi bi-clock me-1"></i>${time}</span>
                <span><i class="bi bi-geo-alt me-1"></i>${escapeHtml(event.location)}</span>
              </div>
              <span class="event-action-link">Details &rarr;</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  `;
}

function renderEvents() {
  const statusEl = document.getElementById("eventsStatus");
  const gridEl = document.getElementById("eventsGrid");

  let events = [...EVENTS].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (activeEventFilter === "upcoming") {
    events = events.filter(e => !isEventClosed(e));
  } else if (activeEventFilter === "completed") {
    events = events.filter(e => isEventClosed(e));
  }

  if (events.length === 0) {
    statusEl.innerHTML = "";
    gridEl.innerHTML = `
      <div class="col-12">
        <div class="card-fluent p-5 text-center">
          <p class="fw-semibold mb-1">No events found for this filter</p>
          <p class="text-subtle small mb-0">Try selecting "All Events" to view all sessions.</p>
        </div>
      </div>`;
    return;
  }

  statusEl.innerHTML = "";
  gridEl.innerHTML = events.map(eventCardHtml).join("");
}

function initEventFilters() {
  const container = document.getElementById("eventFilterTabs");
  if (!container) return;

  const buttons = container.querySelectorAll(".update-filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeEventFilter = btn.dataset.filter;
      renderEvents();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initEventFilters();
  renderEvents();
});

if (document.readyState === "complete" || document.readyState === "interactive") {
  initEventFilters();
  renderEvents();
}
