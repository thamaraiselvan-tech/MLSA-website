function formatEventDate(isoString) {
  const d = new Date(isoString);
  return {
    month: d.toLocaleDateString("en-IN", { month: "short" }),
    day: d.getDate(),
    time: d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
  };
}

function isEventClosed(event) {
  const deadlinePassed = event.registration_deadline && new Date(event.registration_deadline) < new Date();
  return !event.is_open || deadlinePassed;
}

function eventCardHtml(event) {
  const { month, day, time } = formatEventDate(event.event_date);
  const closed = isEventClosed(event);
  const statusPill = closed
    ? `<span class="pill pill-closed">Closed</span>`
    : `<span class="pill pill-open">Open</span>`;
  const tagline = event.banner_note
    ? `<p class="small fw-medium text-fluent-primary mb-1">${escapeHtml(event.banner_note)}</p>`
    : "";
  const imageHtml = event.image_url
    ? `<img src="${API_BASE}${event.image_url}" alt="" class="event-card-image mb-1">`
    : "";

  return `
    <div class="col-sm-6 col-lg-4">
      <a href="event.html?id=${event.id}" class="text-decoration-none text-reset d-block h-100">
        <div class="card-fluent card-hover h-100 d-flex flex-column">
          ${imageHtml}
          <div class="p-4 d-flex flex-column gap-3 flex-fill">
            <div class="d-flex justify-content-between align-items-start">
              <div class="date-badge">
                <span class="month">${month}</span>
                <span class="day">${day}</span>
              </div>
              ${statusPill}
            </div>
            <div>
              <h3 class="h6 fw-semibold mb-1">${escapeHtml(event.title)}</h3>
              ${tagline}
              <p class="text-subtle small mb-0" style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                ${escapeHtml(event.description)}
              </p>
            </div>
            <div class="d-flex gap-3 text-subtle small pt-3 border-top mt-auto">
              <span>🕒 ${time}</span>
              <span>📍 ${escapeHtml(event.location)}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function loadEvents() {
  const statusEl = document.getElementById("eventsStatus");
  const gridEl = document.getElementById("eventsGrid");

  try {
    const events = await api.getEvents();

    if (events.length === 0) {
      statusEl.innerHTML = "";
      gridEl.innerHTML = `
        <div class="col-12">
          <div class="card-fluent p-5 text-center">
            <p class="fw-semibold mb-1">No events scheduled yet</p>
            <p class="text-subtle small mb-0">New events will show up here as soon as they're posted.</p>
          </div>
        </div>`;
      return;
    }

    statusEl.innerHTML = "";
    gridEl.innerHTML = events.map(eventCardHtml).join("");
  } catch (err) {
    statusEl.textContent = "Could not load events right now. Please try again shortly.";
    statusEl.classList.add("text-fluent-error");
  }
}

loadEvents();
