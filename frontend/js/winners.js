// Reads from the EVENTS array defined in data/events.js and pulls out every
// event that has a non-empty "winners" list.

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function getRankDetails(position) {
  const p = (position || "").toLowerCase();
  if (p.includes("1st") || p.includes("first") || p.trim() === "1") {
    return { class: "rank-gold", icon: "🥇", label: "1ST PLACE", rankNum: 1 };
  }
  if (p.includes("2nd") || p.includes("second") || p.trim() === "2") {
    return { class: "rank-silver", icon: "🥈", label: "2ND PLACE", rankNum: 2 };
  }
  if (p.includes("3rd") || p.includes("third") || p.trim() === "3") {
    return { class: "rank-bronze", icon: "🥉", label: "3RD PLACE", rankNum: 3 };
  }
  return { class: "rank-general", icon: "🏆", label: escapeHtml(position), rankNum: 4 };
}

function winnerCardHtml(winner) {
  const rank = getRankDetails(winner.position);
  const meta = [winner.department, winner.year].filter(Boolean).join(" · ");

  return `
    <div class="col-12 col-md-4">
      <div class="winner-podium-card ${rank.class}">
        <div class="winner-podium-header">
          <span class="winner-rank-badge">${rank.icon} ${rank.label}</span>
        </div>
        <div class="winner-podium-body">
          <h3 class="winner-name h5 fw-bold mb-1">${escapeHtml(winner.name)}</h3>
          ${meta ? `<p class="winner-meta small text-subtle mb-0">${escapeHtml(meta)}</p>` : ""}
        </div>
      </div>
    </div>
  `;
}

function eventGroupHtml(event) {
  const date = new Date(event.date);
  const dateLabel = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const posterHtml = event.image
    ? `<img src="${event.image}" alt="${escapeHtml(event.title)}" class="winner-event-thumb">`
    : `<div class="winner-event-thumb-placeholder"><i class="bi bi-trophy-fill"></i></div>`;

  return `
    <div class="winners-event-group mb-5">
      <div class="card-fluent p-4 mb-4 winner-event-header-card">
        <div class="d-flex align-items-center gap-3 flex-wrap">
          ${posterHtml}
          <div class="flex-grow-1">
            <span class="badge bg-primary-subtle text-primary border mb-1"><i class="bi bi-calendar3 me-1"></i>${dateLabel}</span>
            <h2 class="h4 fw-bold mb-1">
              <a href="event.html?id=${event.id}" class="link-fluent text-dark text-decoration-none">${escapeHtml(event.title)}</a>
            </h2>
            <p class="text-subtle small mb-0">${escapeHtml(event.tagline || 'Flagship Event Winners & Honors')}</p>
          </div>
          <a href="event.html?id=${event.id}" class="btn btn-fluent-secondary btn-sm">Event details &rarr;</a>
        </div>
      </div>
      <div class="row g-3 justify-content-center">
        ${event.winners.map(winnerCardHtml).join("")}
      </div>
    </div>
  `;
}

function loadWinners() {
  const statusEl = document.getElementById("winnersStatus");
  const groupsEl = document.getElementById("winnersGroups");

  const eventsWithWinners = [...EVENTS]
    .filter((e) => e.winners && e.winners.length > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (eventsWithWinners.length === 0) {
    statusEl.innerHTML = "";
    groupsEl.innerHTML = `
      <div class="card-fluent p-5 text-center">
        <p class="fw-semibold mb-1">No winners announced yet</p>
        <p class="text-subtle small mb-0">Once results are added to an event, they'll show up here automatically.</p>
      </div>`;
    return;
  }

  statusEl.innerHTML = "";
  groupsEl.innerHTML = eventsWithWinners.map(eventGroupHtml).join("");
}

loadWinners();
