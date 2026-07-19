// Reads from the EVENTS array defined in data/events.js - no backend, no fetch.

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

function isClosed(event) {
  const deadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();
  return event.isOpen === false || deadlinePassed;
}

// Turns a normal Google Form "viewform" link into the embeddable version.
function toEmbedUrl(url) {
  if (!url) return "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}embedded=true`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Colors the position pill gold/silver/bronze when it recognizes 1st/2nd/3rd,
// otherwise falls back to a plain blue pill so any custom label still works
// (e.g. "Best Design", "Runner-up").
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

function showError() {
  document.getElementById("eventLoading").classList.add("d-none");
  document.getElementById("eventError").classList.remove("d-none");
}

function renderEvent(event) {
  document.getElementById("eventLoading").classList.add("d-none");
  document.getElementById("eventContent").classList.remove("d-none");

  if (event.image) {
    const imgEl = document.getElementById("eventImage");
    imgEl.src = event.image;
    imgEl.classList.remove("d-none");
  }

  if (event.tagline) {
    const el = document.getElementById("eventTagline");
    el.textContent = event.tagline;
    el.classList.remove("d-none");
  }

  document.getElementById("eventTitle").textContent = event.title;
  document.getElementById("eventDescription").textContent = event.description;

  const date = new Date(event.date);
  document.getElementById("eventDate").textContent = date.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  document.getElementById("eventTime").textContent = date.toLocaleTimeString("en-IN", {
    hour: "numeric", minute: "2-digit",
  });
  document.getElementById("eventLocation").textContent = event.location;

  if (event.capacity) {
    document.getElementById("eventCapacityRow").style.display = "flex";
    document.getElementById("eventCapacity").textContent = `Limited to ${event.capacity} seats`;
  }

  // ---- Registration section ----
  if (isClosed(event)) {
    document.getElementById("regClosed").classList.remove("d-none");
  } else if (event.registrationUrl) {
    document.getElementById("regFormWrap").classList.remove("d-none");
    document.getElementById("regFormFrame").src = toEmbedUrl(event.registrationUrl);
    document.getElementById("regFormLink").href = event.registrationUrl;
  } else {
    document.getElementById("regComingSoon").classList.remove("d-none");
  }

  if (event.winners && event.winners.length > 0) {
    document.getElementById("winnersCard").classList.remove("d-none");
    document.getElementById("winnersList").innerHTML = event.winners.map(winnerCardHtml).join("");
  }
}

function loadEvent() {
  if (!eventId) {
    showError();
    return;
  }
  const event = EVENTS.find((e) => String(e.id) === String(eventId));
  if (!event) {
    showError();
    return;
  }
  renderEvent(event);
}

loadEvent();
