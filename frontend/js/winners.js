// Reads from the EVENTS array defined in data/events.js and pulls out every
// event that has a non-empty "winners" list - no separate data file needed,
// winners live right alongside their event.

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function rankPillClass(position) {
  const p = (position || "").toLowerCase();
  if (p.includes("1st") || p.includes("first") || p.trim() === "1") return "pill-gold";
  if (p.includes("2nd") || p.includes("second") || p.trim() === "2") return "pill-silver";
  if (p.includes("3rd") || p.includes("third") || p.trim() === "3") return "pill-bronze";
  return "pill-rank";
}

function winnerCardHtml(winner) {
  const cls = rankPillClass(winner.position);
  const meta = [winner.department, winner.year].filter(Boolean).join(" · ");
  return `
    <div class="winner-card">
      <span class="pill ${cls}">${escapeHtml(winner.position || "")}</span>
      <div>
        <p class="fw-semibold mb-0">${escapeHtml(winner.name)}</p>
        ${meta ? `<p class="text-subtle small mb-0">${escapeHtml(meta)}</p>` : ""}
      </div>
    </div>
  `;
}

function eventGroupHtml(event) {
  const date = new Date(event.date);
  const dateLabel = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return `
    <div class="winners-event-group">
      <div class="d-flex flex-wrap align-items-baseline gap-2 mb-3">
        <h2 class="h5 fw-bold mb-0">
          <a href="event.html?id=${event.id}" class="link-fluent" style="color: inherit;">${escapeHtml(event.title)}</a>
        </h2>
        <span class="text-subtle small">${dateLabel}</span>
      </div>
      <div class="d-flex flex-column gap-2">
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
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // most recent achievements first

  if (eventsWithWinners.length === 0) {
    statusEl.innerHTML = "";
    groupsEl.innerHTML = `
      <div class="card-fluent p-5 text-center">
        <p class="fw-semibold mb-1">No winners announced yet</p>
        <p class="text-subtle small mb-0">Once results are added to an event in data/events.js, they'll show up here automatically.</p>
      </div>`;
    return;
  }

  statusEl.innerHTML = "";
  groupsEl.innerHTML = eventsWithWinners.map(eventGroupHtml).join("");
}

loadWinners();
